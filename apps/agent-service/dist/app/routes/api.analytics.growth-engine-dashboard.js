/**
 * Growth Engine Analytics Dashboard API Route
 *
 * ANALYTICS-274: API endpoint for comprehensive Growth Engine analytics
 * Provides phase tracking, action performance, and optimization recommendations
 */
import { generateGrowthEngineAnalytics, exportGrowthEngineAnalytics } from "~/services/analytics/growthEngine";
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const startDate = url.searchParams.get("startDate") ||
            new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = url.searchParams.get("endDate") ||
            new Date().toISOString().split('T')[0];
        // Generate comprehensive Growth Engine analytics
        const analytics = await generateGrowthEngineAnalytics(startDate, endDate);
        // Export for dashboard display
        const exported = exportGrowthEngineAnalytics(analytics);
        return Response.json({
            success: true,
            data: {
                analytics,
                exported,
                generatedAt: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error("Growth Engine Dashboard API Error:", error);
        return Response.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.analytics.growth-engine-dashboard.js.map