/**
 * Shopify Returns Analytics - STUB
 *
 * This file provides stub/mock data for Shopify returns metrics until real
 * Shopify credentials and API access are configured.
 *
 * FEATURE FLAG: ANALYTICS_REAL_DATA
 * - When false (default): Uses mock data from this stub
 * - When true: Uses real Shopify Admin GraphQL API
 *
 * Real API Requirements (documented for future implementation):
 * - Scopes needed: read_orders, read_marketplace_orders, read_returns
 * - GraphQL Types: Return, ReturnLineItem, ReturnRefundPayload, SuggestedReturnRefund
 * - Queries: orders query with returns/refunds connection
 * - Calculations: Sum refunded amounts over period, calculate return rate
 */

// ============================================================================
// Types
// ============================================================================

export interface ReturnsMetrics {
  totalReturns: number;
  returnRate: number; // Percentage of orders returned
  totalRefundedAmount: number;
  averageRefundAmount: number;
  trend: {
    returnsChange: number; // Percentage change vs previous period
    returnRateChange: number;
  };
  period: {
    start: string;
    end: string;
  };
}

// ============================================================================
// Feature Flag Check
// ============================================================================

/**
 * Check if real Shopify data should be used
 * Default: false (use stub data)
 */
function shouldUseRealData(): boolean {
  return process.env.ANALYTICS_REAL_DATA === "true";
}

// ============================================================================
// Stub Implementation
// ============================================================================

/**
 * Generate realistic mock returns data
 * Simulates seasonal patterns and typical return rates for automotive accessories
 */
function getMockReturnsData(
  startDate: string,
  endDate: string,
): ReturnsMetrics {
  // Typical return rate for automotive accessories: 2-5%
  const baseReturnRate = 3.2;

  // Simulate some variance based on time of year
  const month = new Date(startDate).getMonth();
  const seasonalVariance = month >= 10 || month <= 1 ? 1.2 : 0.8; // Higher returns post-holiday

  const returnRate = baseReturnRate * seasonalVariance;

  // Mock data based on typical order volumes
  const totalOrders = 450; // Estimated orders in 30-day period
  const totalReturns = Math.round((totalOrders * returnRate) / 100);
  const averageRefundAmount = 89.5; // Average refund for automotive parts
  const totalRefundedAmount = totalReturns * averageRefundAmount;

  // Mock trend data (previous period had slightly lower returns)
  const previousReturnRate = returnRate - 0.3;
  const previousReturns = totalReturns - 2;

  return {
    totalReturns,
    returnRate,
    totalRefundedAmount,
    averageRefundAmount,
    trend: {
      returnsChange: ((totalReturns - previousReturns) / previousReturns) * 100,
      returnRateChange:
        ((returnRate - previousReturnRate) / previousReturnRate) * 100,
    },
    period: {
      start: startDate,
      end: endDate,
    },
  };
}

// ============================================================================
// Real API Implementation (Placeholder)
// ============================================================================

/**
 * Fetch real returns data from Shopify Admin GraphQL API
 *
 * SHOPIFY GRAPHQL QUERY STRUCTURE (for future implementation):
 *
 * query GetReturns($startDate: DateTime!, $endDate: DateTime!) {
 *   orders(
 *     query: "created_at:>=$startDate AND created_at:<=$endDate"
 *     first: 250
 *   ) {
 *     edges {
 *       node {
 *         id
 *         name
 *         createdAt
 *         totalPriceSet {
 *           shopMoney {
 *             amount
 *             currencyCode
 *           }
 *         }
 *         returns(first: 50) {
 *           edges {
 *             node {
 *               id
 *               name
 *               status
 *               totalQuantity
 *               refunds {
 *                 createdAt
 *                 totalRefundedSet {
 *                   shopMoney {
 *                     amount
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 *
 * Required scopes: read_orders, read_marketplace_orders, read_returns
 */
async function getRealReturnsData(
  startDate: string,
  endDate: string,
): Promise<ReturnsMetrics> {
  // TODO: Implement real Shopify GraphQL query
  // 1. Create Shopify Admin API client with credentials
  // 2. Execute GraphQL query with date range
  // 3. Parse response and extract returns/refunds data
  // 4. Calculate metrics:
  //    - totalReturns = count of returns in period
  //    - returnRate = (totalReturns / totalOrders) * 100
  //    - totalRefundedAmount = sum of refund amounts
  //    - averageRefundAmount = totalRefundedAmount / totalReturns
  // 5. Fetch previous period for trend calculation
  // 6. Return ReturnsMetrics object

  throw new Error(
    "Real Shopify returns data not yet implemented. Set ANALYTICS_REAL_DATA=false to use stub data.",
  );
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get returns metrics for the specified date range
 *
 * Uses stub data by default. Set ANALYTICS_REAL_DATA=true to use real Shopify data.
 *
 * @param startDate - ISO date string (YYYY-MM-DD)
 * @param endDate - ISO date string (YYYY-MM-DD)
 * @returns ReturnsMetrics with real or mock data based on feature flag
 */
export async function getReturnsMetrics(
  startDate: string,
  endDate: string,
): Promise<ReturnsMetrics> {
  if (shouldUseRealData()) {
    return await getRealReturnsData(startDate, endDate);
  }

  return getMockReturnsData(startDate, endDate);
}

/**
 * Get returns metrics for the last 30 days
 */
export async function getReturnsMetricsLast30Days(): Promise<ReturnsMetrics> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startDate = thirtyDaysAgo.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  return await getReturnsMetrics(startDate, endDate);
}
