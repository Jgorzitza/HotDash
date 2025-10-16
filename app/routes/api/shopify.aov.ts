/**
 * API Route: Shopify Average Order Value (AOV)
 * GET /api/shopify/aov
 */



import { getShopifyServiceContext } from "../../services/shopify/client";
import { ServiceError } from "../../services/types";
import { logger } from "../../utils/logger.server";
import { recordDashboardFact } from "../../services/facts.server";
import { toInputJson } from "../../services/json";

const CACHE_TTL_MS = 5 * 60 * 1000;
const AOV_WINDOW_DAYS = 30;
const cache = new Map<string, { data: any; expiresAt: number }>();

const AOV_QUERY = `
  query AOVMetrics($first: Int!, $query: String) {
    orders(first: $first, sortKey: CREATED_AT, reverse: true, query: $query) {
      edges {
        node {
          id
          currentTotalPriceSet { shopMoney { amount currencyCode } }
        }
      }
    }
  }
`;

export async function loader({ request }: any) {
  const startTime = Date.now();
  try {
    const context = await getShopifyServiceContext(request);
    const { admin, shopDomain } = context;
    const cacheKey = "aov:" + shopDomain;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return Response.json(cached.data, { headers: { "X-Cache": "HIT" } });
    }

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - AOV_WINDOW_DAYS);
    const response = await admin.graphql(AOV_QUERY, {
      variables: { first: 250, query: "created_at:>=" + since.toISOString() },
    });

    if (!response.ok) throw new ServiceError("AOV query failed", { scope: "shopify.aov", code: String(response.status) });
    const payload = await response.json();
    if (payload.errors?.length) throw new ServiceError(payload.errors[0].message, { scope: "shopify.aov" });

    const orders = payload.data?.orders.edges ?? [];
    let totalRevenue = 0;
    let currency = "USD";
    for (const { node } of orders) {
      const amount = Number.parseFloat(node.currentTotalPriceSet?.shopMoney.amount ?? "0");
      totalRevenue += amount;
      if (node.currentTotalPriceSet?.shopMoney.currencyCode) currency = node.currentTotalPriceSet.shopMoney.currencyCode;
    }

    const aovData = {
      averageOrderValue: orders.length > 0 ? Number((totalRevenue / orders.length).toFixed(2)) : 0,
      currency,
      orderCount: orders.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      windowDays: AOV_WINDOW_DAYS,
      generatedAt: new Date().toISOString(),
    };

    await recordDashboardFact({ shopDomain, factType: "shopify.aov", scope: "dashboard", value: toInputJson(aovData) });
    cache.set(cacheKey, { data: aovData, expiresAt: Date.now() + CACHE_TTL_MS });
    return Response.json(aovData, { headers: { "X-Cache": "MISS", "X-Response-Time": String(Date.now() - startTime) + "ms" } });
  } catch (error) {
    logger.error("AOV error", { error: error instanceof Error ? error.message : String(error) });
    return Response.json({ error: { message: "AOV fetch failed", scope: "shopify.aov" } }, { status: 500 });
  }
}
