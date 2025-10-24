/**
 * Shopify Returns Analytics Stub
 *
 * This module provides stubbed return/refund data for analytics until
 * Shopify GraphQL credentials with proper scopes are configured.
 *
 * Required Shopify API Scopes:
 * - read_orders
 * - read_marketplace_orders
 * - read_returns
 * - read_marketplace_returns
 *
 * Feature Flag: ANALYTICS_REAL_DATA (default: false)
 * When false, uses stub data below
 * When true, queries live Shopify Admin GraphQL API
 */

import { z } from "zod";

// Shopify Return Status enum (from GraphQL schema)
export const ReturnStatusSchema = z.enum([
  "REQUESTED",
  "IN_PROGRESS",
  "CLOSED",
  "DECLINED",
  "CANCELED",
]);

export type ReturnStatus = z.infer<typeof ReturnStatusSchema>;

// Shopify Return Reason enum (from GraphQL schema)
export const ReturnReasonSchema = z.enum([
  "UNKNOWN",
  "DAMAGED",
  "DEFECTIVE",
  "NOT_AS_DESCRIBED",
  "UNWANTED",
  "SIZE_TOO_SMALL",
  "SIZE_TOO_LARGE",
  "STYLE",
  "COLOR",
  "OTHER",
]);

export type ReturnReason = z.infer<typeof ReturnReasonSchema>;

// Return Metrics for Analytics Dashboard
export const ReturnMetricsSchema = z.object({
  totalReturns: z.number(),
  returnRate: z.number(), // percentage (e.g., 3.2 = 3.2%)
  totalRefundAmount: z.number(),
  averageRefundAmount: z.number(),
  topReasons: z.array(
    z.object({
      reason: ReturnReasonSchema,
      count: z.number(),
      percentage: z.number(),
    }),
  ),
});

export type ReturnMetrics = z.infer<typeof ReturnMetricsSchema>;

// Return Analytics Response Schema
export const ReturnAnalyticsResponseSchema = z.object({
  success: z.boolean(),
  data: ReturnMetricsSchema.optional(),
  error: z.string().optional(),
  timestamp: z.string(),
  mode: z.enum(["stub", "live"]),
});

export type ReturnAnalyticsResponse = z.infer<
  typeof ReturnAnalyticsResponseSchema
>;

/**
 * Get return analytics metrics
 *
 * @param startDate - ISO 8601 start date
 * @param endDate - ISO 8601 end date
 * @returns Return metrics or stub data based on feature flag
 */
export async function getReturnMetrics(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startDate: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  endDate: string,
): Promise<ReturnAnalyticsResponse> {
  // Check feature flag
  const useRealData = process.env.ANALYTICS_REAL_DATA === "true";

  if (useRealData) {
    // TODO: Implement live Shopify GraphQL query when credentials available
    // Query: returns(first: 250, createdAt: {min: $startDate, max: $endDate})
    // Fields: totalQuantity, refunds { totalRefundedSet { shopMoney { amount } } }
    return {
      success: false,
      error:
        "Live Shopify returns API not yet configured (credentials pending)",
      timestamp: new Date().toISOString(),
      mode: "stub",
    };
  }

  // Return stub data (realistic for automotive accessories industry)
  // Industry benchmark: 2-5% return rate for automotive parts/accessories
  const stubData: ReturnMetrics = {
    totalReturns: 12, // Out of ~375 orders = 3.2% return rate
    returnRate: 3.2, // 3.2% is typical for automotive accessories
    totalRefundAmount: 842.5, // $842.50 total refunded
    averageRefundAmount: 70.21, // Average $70.21 per return
    topReasons: [
      { reason: "NOT_AS_DESCRIBED", count: 4, percentage: 33.3 },
      { reason: "DEFECTIVE", count: 3, percentage: 25.0 },
      { reason: "DAMAGED", count: 2, percentage: 16.7 },
      { reason: "SIZE_TOO_SMALL", count: 2, percentage: 16.7 },
      { reason: "UNWANTED", count: 1, percentage: 8.3 },
    ],
  };

  return {
    success: true,
    data: stubData,
    timestamp: new Date().toISOString(),
    mode: "stub",
  };
}

/**
 * GraphQL query template for when credentials are ready
 *
 * This query will fetch return data from Shopify Admin API.
 * Requires scopes: read_orders, read_marketplace_orders, read_returns, read_marketplace_returns
 */
export const SHOPIFY_RETURNS_QUERY = `
query GetReturns($startDate: DateTime!, $endDate: DateTime!) {
  returns(
    first: 250
    query: "created_at:>=$startDate AND created_at:<=$endDate"
  ) {
    edges {
      node {
        id
        name
        status
        totalQuantity
        createdAt
        closedAt
        order {
          id
          name
        }
        returnLineItems(first: 10) {
          edges {
            node {
              id
              quantity
              returnReason
              returnReasonNote
            }
          }
        }
        refunds(first: 10) {
          edges {
            node {
              id
              totalRefundedSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              createdAt
            }
          }
        }
      }
    }
  }
}
`;
