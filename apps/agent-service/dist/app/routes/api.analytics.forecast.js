/**
 * Trend Forecasting API Route
 *
 * GET /api/analytics/forecast
 * Query params:
 * - metric: "impressions" | "clicks" | "conversions" | "revenue" | "roas" | "all" (required)
 * - project: Shop domain (default: "occ")
 * - days: Forecast period - 7, 14, or 30 days (default: 7)
 * - historical: Historical data period in days (default: 90)
 *
 * Returns trend forecast with predictions and confidence intervals
 * Uses Response.json() per React Router 7 pattern
 */
import { forecastMetric, forecastAllMetrics, } from "~/services/analytics/trend-forecast";
export async function loader({ request }) {
    const url = new URL(request.url);
    const metric = url.searchParams.get("metric");
    const project = url.searchParams.get("project") || "occ";
    const days = Number(url.searchParams.get("days")) || 7;
    const historical = Number(url.searchParams.get("historical")) || 90;
    // Validate forecast days
    if (![7, 14, 30].includes(days)) {
        return Response.json({
            success: false,
            error: "Forecast days must be 7, 14, or 30",
        }, { status: 400 });
    }
    try {
        // Forecast all metrics
        if (metric === "all") {
            const forecasts = await forecastAllMetrics(project, days);
            return Response.json({
                success: true,
                data: forecasts,
                meta: { project, days, historical },
            });
        }
        // Validate metric
        const validMetrics = [
            "impressions",
            "clicks",
            "conversions",
            "revenue",
            "roas",
        ];
        if (!metric || !validMetrics.includes(metric)) {
            return Response.json({
                success: false,
                error: `Invalid metric. Must be one of: ${validMetrics.join(", ")}, or "all"`,
            }, { status: 400 });
        }
        // Forecast single metric
        const forecast = await forecastMetric(metric, project, days, historical);
        return Response.json({
            success: true,
            data: forecast,
            meta: { project, metric, days, historical },
        });
    }
    catch (error) {
        console.error("Trend forecast API error:", error);
        return Response.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.analytics.forecast.js.map