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

import { json } from "@remix-run/node";
import { getRevenueMetrics } from "~/lib/analytics/ga4";
import {
  RevenueResponseSchema,
  type RevenueResponse,
} from "~/lib/analytics/schemas";
import { isSamplingError } from "~/lib/analytics/sampling-guard";

export async function loader() {
  try {
    const metrics = await getRevenueMetrics();

    const response: RevenueResponse = {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
      sampled: false, // getRevenueMetrics enforces unsampled data
    };

    // Validate response with Zod
    const validated = RevenueResponseSchema.parse(response);

    return json(validated);
  } catch (error: unknown) {
    console.error("[API] Revenue metrics error:", error);

    // Check if sampling error
    const isSampled = isSamplingError(error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch revenue metrics";

    const errorResponse: RevenueResponse = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      sampled: isSampled,
    };

    // Validate error response
    const validated = RevenueResponseSchema.parse(errorResponse);

    return json(validated, { status: isSampled ? 503 : 500 });
  }
}
