/**
 * API Route: Shopify Revenue
 * GET /api/shopify/revenue
 * Purpose: Fetch total revenue for last 30 days from Shopify Admin GraphQL
 * Owner: integrations agent
 * Date: 2025-10-15
 */



import { getShopifyServiceContext } from "../../services/shopify/client";
import { ServiceError } from "../../services/types";
import { logger } from "../../utils/logger.server";
import { recordDashboardFact } from "../../services/facts.server";
import { toInputJson } from "../../services/json";

const CACHE_TTL_MS = 5 * 60 * 1000;
const REVENUE_WINDOW_DAYS = 30;
const cache = new Map<string, { data: any; expiresAt: number }>();

const REVENUE_QUERY = `
  query RevenueMetrics($first: Int!, $query: String) {
    orders(first: $first, sortKey: CREATED_AT, reverse: true, query: $query) {
      edges {
        node {
          id
          name
          createdAt
          currentTotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

interface RevenueData {
  totalRevenue: number;
  currency: string;
  orderCount: number;
  windowDays: number;
  generatedAt: string;
}

export async function loader({ request }: any) {
  const startTime = Date.now();

  try {
    const context = await getShopifyServiceContext(request);
    const { admin, shopDomain } = context;

    const cacheKey = "revenue:" + shopDomain;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return Response.json(cached.data, {
        headers: { "Cache-Control": "private, max-age=300", "X-Cache": "HIT" },
      });
    }

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - REVENUE_WINDOW_DAYS);
    const dateQuery = "created_at:>=" + since.toISOString();

    const response = await admin.graphql(REVENUE_QUERY, {
      variables: { first: 250, query: dateQuery },
    });

    if (!response.ok) {
      throw new ServiceError("Shopify revenue query failed with " + String(response.status), {
        scope: "shopify.revenue",
        code: String(response.status),
        retryable: response.status >= 500,
      });
    }

    const payload = await response.json();
    if (payload.errors?.length) {
      throw new ServiceError(payload.errors.map((err: any) => err.message).join("; "), {
        scope: "shopify.revenue",
        code: "GRAPHQL_ERROR",
      });
    }

    const orders = payload.data?.orders.edges ?? [];
    let totalRevenue = 0;
    let currency = "USD";

    for (const { node } of orders) {
      const amount = Number.parseFloat(node.currentTotalPriceSet?.shopMoney.amount ?? "0");
      if (amount > 0) {
        totalRevenue += amount;
        currency = node.currentTotalPriceSet?.shopMoney.currencyCode ?? currency;
      }
    }

    const revenueData: RevenueData = {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      currency,
      orderCount: orders.length,
      windowDays: REVENUE_WINDOW_DAYS,
      generatedAt: new Date().toISOString(),
    };

    await recordDashboardFact({
      shopDomain,
      factType: "shopify.revenue",
      scope: "dashboard",
      value: toInputJson(revenueData),
      metadata: toInputJson({ windowDays: REVENUE_WINDOW_DAYS, generatedAt: revenueData.generatedAt }),
    });

    cache.set(cacheKey, { data: revenueData, expiresAt: Date.now() + CACHE_TTL_MS });

    logger.info("Revenue data fetched", { shopDomain, totalRevenue: revenueData.totalRevenue });

    return Response.json(revenueData, {
      headers: {
        "Cache-Control": "private, max-age=300",
        "X-Response-Time": String(Date.now() - startTime) + "ms",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error instanceof ServiceError) {
      logger.error("Revenue service error", { message: error.message, scope: error.scope });
      return Response.json({ error: { message: error.message, scope: error.scope, code: error.code } }, {
        status: error.code ? parseInt(error.code, 10) : 500,
      });
    }
    logger.error("Revenue unexpected error", { error: error instanceof Error ? error.message : String(error) });
    return Response.json({ error: { message: "Unexpected error", scope: "shopify.revenue", code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}
