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
// React Router 7: Use Response.json() from "~/utils/http.server";
import { getConversionMetrics } from "../lib/analytics/ga4";
import { ConversionResponseSchema, } from "../lib/analytics/schemas";
import { isSamplingError } from "../lib/analytics/sampling-guard";
export async function loader({ request }) {
    try {
        const metrics = await getConversionMetrics();
        const response = {
            success: true,
            data: metrics,
            timestamp: new Date().toISOString(),
            sampled: false,
        };
        // Validate response with Zod
        const validated = ConversionResponseSchema.parse(response);
        return Response.json(validated);
    }
    catch (error) {
        console.error("[API] Conversion rate error:", error);
        const isSampled = isSamplingError(error);
        const errorResponse = {
            success: false,
            error: error.message || "Failed to fetch conversion rate",
            timestamp: new Date().toISOString(),
            sampled: isSampled,
        };
        const validated = ConversionResponseSchema.parse(errorResponse);
        return Response.json(validated, { status: isSampled ? 503 : 500 });
    }
}
//# sourceMappingURL=api.analytics.conversion-rate.js.map