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

import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { getConversionMetrics } from "../lib/analytics/ga4";
import {
  ConversionResponseSchema,
  type ConversionResponse,
} from "../lib/analytics/schemas";
import { isSamplingError } from "../lib/analytics/sampling-guard";

export async function loader(_: LoaderFunctionArgs) {
  try {
    const metrics = await getConversionMetrics();

    const response: ConversionResponse = {
      conversionRate: metrics.conversionRate,
      period: `${metrics.period.start} to ${metrics.period.end}`,
      change: metrics.trend.conversionRateChange,
      previousPeriod: {
        conversionRate:
          metrics.conversionRate /
          (1 + metrics.trend.conversionRateChange / 100),
        period: "previous 30 days",
      },
    };

    const validated = ConversionResponseSchema.parse(response);
    return json(validated);
  } catch (error: any) {
    console.error("[API] Conversion rate error:", error);
    return json({ conversionRate: 0, period: "error" }, { status: 500 });
  }
}
