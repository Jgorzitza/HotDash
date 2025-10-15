/**
 * Shopify Admin GraphQL Queries for Dashboard Metrics
 * 
 * Purpose: Read-only queries for dashboard tiles (revenue, AOV, returns)
 * Owner: integrations agent
 * Date: 2025-10-15
 * 
 * Audit: All queries log to DashboardFact table
 * Rate Limit: Respects Shopify 2 req/sec limit via client retry logic
 */

import type { ShopifyServiceContext } from "../../services/shopify/types";
import { ServiceError, type ServiceResult } from "../../services/types";
import { recordDashboardFact } from "../../services/facts.server";
import { toInputJson } from "../../services/json";
import { getCached, setCached } from "../../services/shopify/cache";

// Cache configuration
const METRICS_CACHE_KEY = (shopDomain: string) => `shopify:dashboard-metrics:${shopDomain}`;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Query configuration
const METRICS_WINDOW_DAYS = Number(process.env.SHOPIFY_METRICS_WINDOW_DAYS ?? 30);
const MAX_ORDERS = Number(process.env.SHOPIFY_METRICS_ORDER_LIMIT ?? 250);

/**
 * Dashboard Metrics Response
 */
export interface DashboardMetrics {
  revenue: {
    value: number;
    currency: string;
    orderCount: number;
    windowDays: number;
  };
  aov: {
    value: number;
    currency: string;
    change?: number; // Percentage change vs previous period
  };
  returns: {
    count: number;
    pending: number;
    totalValue: number;
    currency: string;
  };
  generatedAt: string;
}

export type DashboardMetricsResult = ServiceResult<DashboardMetrics>;

/**
 * GraphQL Query for Revenue and Orders
 * 
 * Fetches orders within the configured window to calculate:
 * - Total revenue
 * - Order count
 * - Average order value (AOV)
 */
const REVENUE_METRICS_QUERY = `#graphql
  query DashboardRevenueMetrics($first: Int!, $query: String) {
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

/**
 * GraphQL Query for Returns/Refunds
 * 
 * Fetches refunds to calculate:
 * - Total return count
 * - Pending returns (not yet processed)
 * - Total refund value
 */
const RETURNS_METRICS_QUERY = `#graphql
  query DashboardReturnsMetrics($first: Int!, $query: String) {
    refunds(first: $first, query: $query) {
      edges {
        node {
          id
          createdAt
          totalRefundedSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          order {
            id
            name
          }
        }
      }
    }
  }
`;

interface RevenueMetricsResponse {
  data?: {
    orders: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          createdAt: string;
          currentTotalPriceSet?: {
            shopMoney: {
              amount: string;
              currencyCode: string;
            };
          } | null;
        };
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}

interface ReturnsMetricsResponse {
  data?: {
    refunds: {
      edges: Array<{
        node: {
          id: string;
          createdAt: string;
          totalRefundedSet?: {
            shopMoney: {
              amount: string;
              currencyCode: string;
            };
          } | null;
          order: {
            id: string;
            name: string;
          };
        };
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}

/**
 * Build date query for Shopify GraphQL
 */
function buildDateQuery(windowDays: number): string {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - windowDays);
  return `created_at:>=${since.toISOString()}`;
}

/**
 * Safe number conversion
 */
function toNumber(value: string | undefined | null): number {
  if (!value) return 0;
  const asNumber = Number.parseFloat(value);
  return Number.isFinite(asNumber) ? asNumber : 0;
}

/**
 * Get Dashboard Metrics
 * 
 * Fetches revenue, AOV, and returns data from Shopify Admin GraphQL API.
 * Results are cached for 5 minutes to reduce API calls.
 * All queries are logged to DashboardFact for audit trail.
 * 
 * @param context - Shopify service context with authenticated admin client
 * @returns Dashboard metrics with revenue, AOV, and returns data
 * @throws ServiceError if GraphQL queries fail
 */
export async function getDashboardMetrics(
  context: ShopifyServiceContext,
): Promise<DashboardMetricsResult> {
  const { admin, shopDomain } = context;
  const cacheKey = METRICS_CACHE_KEY(shopDomain);

  // Check cache first
  const cached = getCached<ServiceResult<DashboardMetrics>>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" };
  }

  // Fetch revenue metrics
  const revenueResponse = await admin.graphql(REVENUE_METRICS_QUERY, {
    variables: {
      first: MAX_ORDERS,
      query: buildDateQuery(METRICS_WINDOW_DAYS),
    },
  });

  if (!revenueResponse.ok) {
    throw new ServiceError(
      `Shopify revenue metrics query failed with ${revenueResponse.status}.`,
      {
        scope: "shopify.dashboard.revenue",
        code: `${revenueResponse.status}`,
        retryable: revenueResponse.status >= 500,
      },
    );
  }

  const revenuePayload = (await revenueResponse.json()) as RevenueMetricsResponse;

  if (revenuePayload.errors?.length) {
    throw new ServiceError(revenuePayload.errors.map((err) => err.message).join("; "), {
      scope: "shopify.dashboard.revenue",
      code: "GRAPHQL_ERROR",
    });
  }

  // Process revenue data
  const orders = revenuePayload.data?.orders.edges ?? [];
  let totalRevenue = 0;
  let currency = "USD";
  const orderCount = orders.length;

  for (const { node } of orders) {
    const orderRevenue = toNumber(node.currentTotalPriceSet?.shopMoney.amount);
    if (orderRevenue > 0) {
      totalRevenue += orderRevenue;
      currency = node.currentTotalPriceSet?.shopMoney.currencyCode ?? currency;
    }
  }

  // Calculate AOV
  const aov = orderCount > 0 ? totalRevenue / orderCount : 0;

  // Fetch returns metrics
  const returnsResponse = await admin.graphql(RETURNS_METRICS_QUERY, {
    variables: {
      first: 100, // Limit returns to recent 100
      query: buildDateQuery(METRICS_WINDOW_DAYS),
    },
  });

  if (!returnsResponse.ok) {
    throw new ServiceError(
      `Shopify returns metrics query failed with ${returnsResponse.status}.`,
      {
        scope: "shopify.dashboard.returns",
        code: `${returnsResponse.status}`,
        retryable: returnsResponse.status >= 500,
      },
    );
  }

  const returnsPayload = (await returnsResponse.json()) as ReturnsMetricsResponse;

  if (returnsPayload.errors?.length) {
    throw new ServiceError(returnsPayload.errors.map((err) => err.message).join("; "), {
      scope: "shopify.dashboard.returns",
      code: "GRAPHQL_ERROR",
    });
  }

  // Process returns data
  const refunds = returnsPayload.data?.refunds.edges ?? [];
  let totalRefundValue = 0;
  const returnCount = refunds.length;

  for (const { node } of refunds) {
    const refundValue = toNumber(node.totalRefundedSet?.shopMoney.amount);
    totalRefundValue += refundValue;
  }

  // Build metrics response
  const metrics: DashboardMetrics = {
    revenue: {
      value: Number(totalRevenue.toFixed(2)),
      currency,
      orderCount,
      windowDays: METRICS_WINDOW_DAYS,
    },
    aov: {
      value: Number(aov.toFixed(2)),
      currency,
    },
    returns: {
      count: returnCount,
      pending: 0, // TODO: Add logic to determine pending returns
      totalValue: Number(totalRefundValue.toFixed(2)),
      currency,
    },
    generatedAt: new Date().toISOString(),
  };

  // Log to DashboardFact for audit trail
  const fact = await recordDashboardFact({
    shopDomain,
    factType: "shopify.dashboard.metrics",
    scope: "dashboard",
    value: toInputJson(metrics),
    metadata: toInputJson({
      windowDays: METRICS_WINDOW_DAYS,
      orderCount,
      returnCount,
      generatedAt: metrics.generatedAt,
    }),
  });

  const result: DashboardMetricsResult = {
    data: metrics,
    fact,
    source: "fresh",
  };

  // Cache the result
  setCached(cacheKey, result, CACHE_TTL_MS);

  return result;
}

