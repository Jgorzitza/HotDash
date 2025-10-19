/**
 * API Route: Shopify Returns
 * GET /api/shopify/returns
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getShopifyServiceContext } from "../../services/shopify/client";
import { ServiceError } from "../../services/types";
import { logger } from "../../utils/logger.server";
import { recordDashboardFact } from "../../services/facts.server";
import { toInputJson } from "../../services/json";

const CACHE_TTL_MS = 5 * 60 * 1000;
const RETURNS_WINDOW_DAYS = 30;
interface ShopifyReturnsPayload {
  data?: {
    refunds: {
      edges: Array<{
        node: {
          totalRefundedSet?: {
            shopMoney: {
              amount?: string;
              currencyCode?: string;
            };
          };
        };
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}

interface ReturnsResponse {
  returnCount: number;
  totalRefundValue: number;
  currency: string;
  returnRate: number;
  windowDays: number;
  generatedAt: string;
}

type ShopifyRefundEdge = {
  node: {
    totalRefundedSet?: {
      shopMoney: {
        amount?: string;
        currencyCode?: string;
      };
    };
  };
};

const cache = new Map<string, { data: ReturnsResponse; expiresAt: number }>();

const RETURNS_QUERY = `#graphql
  query ReturnsMetrics($first: Int!, $query: String) {
    refunds(first: $first, query: $query) {
      edges {
        node {
          id
          totalRefundedSet { shopMoney { amount currencyCode } }
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
    const cacheKey = `returns:${shopDomain}`;
    if (shouldUseCache) {
      const cached = cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return json(cached.data, { headers: { "X-Cache": "HIT" } });
      }
    }

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - RETURNS_WINDOW_DAYS);
    const response = await admin.graphql(RETURNS_QUERY, {
      variables: { first: 100, query: `created_at:>=${since.toISOString()}` },
    });

    if (!response.ok) {
      throw new ServiceError(`Returns query failed`, {
        scope: "shopify.returns",
        code: `${response.status}`,
        retryable: response.status >= 500,
      });
    }
    const payload: ShopifyReturnsPayload = await response.json();
    if (payload.errors?.length) {
      throw new ServiceError(payload.errors[0].message, {
        scope: "shopify.returns",
        code: "GRAPHQL_ERROR",
      });
    }

    const refunds: ShopifyRefundEdge[] = payload.data?.refunds.edges ?? [];
    let totalRefundValue = 0;
    let currency = "USD";
    for (const { node } of refunds) {
      const amount = Number.parseFloat(
        node.totalRefundedSet?.shopMoney.amount ?? "0",
      );
      totalRefundValue += amount;
      if (node.totalRefundedSet?.shopMoney.currencyCode) {
        currency = node.totalRefundedSet.shopMoney.currencyCode;
      }
    }

    const returnsData: ReturnsResponse = {
      returnCount: refunds.length,
      totalRefundValue: Number(totalRefundValue.toFixed(2)),
      currency,
      returnRate: 0,
      windowDays: RETURNS_WINDOW_DAYS,
      generatedAt: new Date().toISOString(),
    };

    await recordDashboardFact({
      shopDomain,
      factType: "shopify.returns",
      scope: "dashboard",
      value: toInputJson(returnsData),
    });
    if (shouldUseCache) {
      cache.set(cacheKey, {
        data: returnsData,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }
    return json(returnsData, {
      headers: {
        "X-Cache": shouldUseCache ? "MISS" : "BYPASS",
        "X-Response-Time": `${Date.now() - startTime}ms`,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ServiceError) {
      logger.error("Returns service error", {
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
      return json(
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
    logger.error("Returns unexpected error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return json(
      {
        error: {
          message: "Returns fetch failed",
          scope: "shopify.returns",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 },
    );
  }
}
