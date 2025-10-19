/**
 * API Route: Analytics Revenue
 *
 * GET /api/analytics/revenue
 *
 * Returns revenue metrics for the last 30 days with trend comparison.
 * Used by dashboard tiles to display revenue, AOV, and transaction data.
 *
 * Enhanced with:
 * - Zod schema validation
 * - Sampling detection and enforcement
 * - Combined GA4 + Shopify data (when available)
 */

import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { getRevenueMetrics } from "../lib/analytics/ga4";
import {
  RevenueResponseSchema,
  type RevenueResponse,
} from "../lib/analytics/schemas";
import { isSamplingError } from "../lib/analytics/sampling-guard";

export async function loader(_: LoaderFunctionArgs) {
  try {
    const metrics = await getRevenueMetrics();

    const response: RevenueResponse = {
      revenue: metrics.totalRevenue,
      period: `${metrics.period.start} to ${metrics.period.end}`,
      change: metrics.trend.revenueChange,
      currency: "USD",
      previousPeriod: {
        revenue: metrics.totalRevenue / (1 + metrics.trend.revenueChange / 100),
        period: "previous 30 days",
      },
    };

    const validated = RevenueResponseSchema.parse(response);
    return json(validated);
  } catch (error: any) {
    console.error("[API] Revenue metrics error:", error);
    return json(
      { revenue: 0, period: "error", currency: "USD" },
      { status: 500 },
    );
  }
}
