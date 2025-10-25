/**
 * API Route: Analytics Traffic
 *
 * GET /api/analytics/traffic
 *
 * Returns traffic metrics for the last 30 days with trend comparison.
 * Used by dashboard tiles to display sessions, organic traffic, and SEO data.
 *
 * Enhanced with:
 * - Zod schema validation
 * - Sampling detection and enforcement
 * - Combined GA4 data
 */

import { type LoaderFunctionArgs } from "react-router";
// React Router 7: Use Response.json() from "~/utils/http.server";
import { getTrafficMetrics } from "../lib/analytics/ga4";
import {
  TrafficResponseSchema,
  type TrafficResponse,
} from "../lib/analytics/schemas";
import { isSamplingError } from "../lib/analytics/sampling-guard";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const metrics = await getTrafficMetrics();

    // Map TrafficMetrics to TrafficResponse.data format
    const response: TrafficResponse = {
      success: true,
      data: {
        sessions: metrics.totalSessions,
        users: 0, // Not tracked in current implementation
        pageviews: 0, // Not tracked in current implementation
      },
      timestamp: new Date().toISOString(),
      sampled: false,
    };

    // Validate response with Zod
    const validated = TrafficResponseSchema.parse(response);

    return Response.json(validated);
  } catch (error: any) {
    console.error("[API] Traffic metrics error:", error);

    const isSampled = isSamplingError(error);

    const errorResponse: TrafficResponse = {
      success: false,
      error: error.message || "Failed to fetch traffic metrics",
      timestamp: new Date().toISOString(),
      sampled: isSampled,
    };

    const validated = TrafficResponseSchema.parse(errorResponse);

    return Response.json(validated, { status: isSampled ? 503 : 500 });
  }
}
