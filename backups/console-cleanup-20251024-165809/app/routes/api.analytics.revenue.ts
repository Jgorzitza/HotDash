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
// React Router 7: Use Response.json() from "~/utils/http.server";
import { getRevenueMetrics } from "../lib/analytics/ga4";
import {
  RevenueResponseSchema,
  type RevenueResponse,
} from "../lib/analytics/schemas";
import { isSamplingError } from "../lib/analytics/sampling-guard";

export async function loader({ request }: LoaderFunctionArgs) {
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

    return Response.json(validated);
  } catch (error: any) {
    console.error("[API] Revenue metrics error:", error);

    // Check if sampling error
    const isSampled = isSamplingError(error);

    const errorResponse: RevenueResponse = {
      success: false,
      error: error.message || "Failed to fetch revenue metrics",
      timestamp: new Date().toISOString(),
      sampled: isSampled,
    };

    // Validate error response
    const validated = RevenueResponseSchema.parse(errorResponse);

    return Response.json(validated, { status: isSampled ? 503 : 500 });
  }
}
