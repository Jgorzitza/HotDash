/**
 * API Route: Shopify Average Order Value (AOV)
 * GET /api/shopify/aov
 */

import type { LoaderFunctionArgs } from "react-router";
import { getShopifyServiceContext } from "../../services/shopify/client";
import { ServiceError } from "../../services/types";
import { logger } from "../../utils/logger.server";
import { recordDashboardFact } from "../../services/facts.server";
import { toInputJson } from "../../services/json";

const CACHE_TTL_MS = 5 * 60 * 1000;
const AOV_WINDOW_DAYS = 30;
const cache = new Map<string, { data: any; expiresAt: number }>();

const AOV_QUERY = `#graphql
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

export async function loader({ request }: LoaderFunctionArgs) {
  const startTime = Date.now();
  const shouldUseCache = process.env.NODE_ENV !== "test";
  try {
    const context = await getShopifyServiceContext(request);
    const { admin, shopDomain } = context;
    const cacheKey = `aov:${shopDomain}`;
    if (shouldUseCache) {
      const cached = cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return Response.json(cached.data, { headers: { "X-Cache": "HIT" } });
      }
    }

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - AOV_WINDOW_DAYS);
    const response = await admin.graphql(AOV_QUERY, {
      variables: { first: 250, query: `created_at:>=${since.toISOString()}` },
    });

    if (!response.ok) {
      throw new ServiceError(`AOV query failed`, {
        scope: "shopify.aov",
        code: `${response.status}`,
        retryable: response.status >= 500,
      });
    }
    const payload = await response.json();
    if (payload.errors?.length) {
      throw new ServiceError(payload.errors[0].message, {
        scope: "shopify.aov",
        code: "GRAPHQL_ERROR",
      });
    }

    const orders = payload.data?.orders.edges ?? [];
    let totalRevenue = 0;
    let currency = "USD";
    for (const { node } of orders) {
      const amount = Number.parseFloat(
        node.currentTotalPriceSet?.shopMoney.amount ?? "0",
      );
      totalRevenue += amount;
      if (node.currentTotalPriceSet?.shopMoney.currencyCode)
        currency = node.currentTotalPriceSet.shopMoney.currencyCode;
    }

    const aovData = {
      averageOrderValue:
        orders.length > 0
          ? Number((totalRevenue / orders.length).toFixed(2))
          : 0,
      currency,
      orderCount: orders.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      windowDays: AOV_WINDOW_DAYS,
      generatedAt: new Date().toISOString(),
    };

    await recordDashboardFact({
      shopDomain,
      factType: "shopify.aov",
      scope: "dashboard",
      value: toInputJson(aovData),
    });
    if (shouldUseCache) {
      cache.set(cacheKey, {
        data: aovData,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }
    return Response.json(aovData, {
      headers: {
        "X-Cache": shouldUseCache ? "MISS" : "BYPASS",
        "X-Response-Time": `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      logger.error("AOV service error", {
        message: error.message,
        scope: error.scope,
      });
      const numericCode =
        error.code && /^\d+$/.test(error.code) ? Number(error.code) : undefined;
      const statusCode =
        numericCode && numericCode >= 100
          ? numericCode
          : error.retryable
            ? 503
            : 500;
      return Response.json(
        {
          error: {
            message: error.message,
            scope: error.scope,
            code: error.code,
          },
        },
        { status: statusCode },
      );
    }
    logger.error("AOV unexpected error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return Response.json(
      {
        error: {
          message: "AOV fetch failed",
          scope: "shopify.aov",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 },
    );
  }
}
