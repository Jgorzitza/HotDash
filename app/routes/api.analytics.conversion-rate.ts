/**
 * API Route: Conversion Rate
 *
 * GET /api/analytics/conversion-rate
 *
 * Returns conversion rate metrics for dashboard tiles.
 *
 * Enhanced with:
 * - Zod schema validation
 * - Sampling detection and enforcement
 */

import { json } from "@remix-run/node";
import { getConversionMetrics } from "~/lib/analytics/ga4";
import {
  ConversionResponseSchema,
  type ConversionResponse,
} from "~/lib/analytics/schemas";
import { isSamplingError } from "~/lib/analytics/sampling-guard";

export async function loader() {
  try {
    const metrics = await getConversionMetrics();

    const response: ConversionResponse = {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
      sampled: false,
    };

    // Validate response with Zod
    const validated = ConversionResponseSchema.parse(response);

    return json(validated);
  } catch (error: unknown) {
    console.error("[API] Conversion rate error:", error);

    const isSampled = isSamplingError(error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch conversion rate";

    const errorResponse: ConversionResponse = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      sampled: isSampled,
    };

    const validated = ConversionResponseSchema.parse(errorResponse);

    return json(validated, { status: isSampled ? 503 : 500 });
  }
}
