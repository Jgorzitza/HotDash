/**
 * API Route: Core Web Vitals Monitoring
 *
 * GET /api/seo/web-vitals?url=https://example.com
 *
 * Analyzes Core Web Vitals using PageSpeed Insights API:
 * - LCP, FID, CLS metrics
 * - Mobile and desktop analysis
 * - Performance opportunities
 * - Optimization recommendations
 *
 * @module routes/api/seo/web-vitals
 */
import { analyzeWebVitals } from "../services/seo/core-web-vitals";
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const targetUrl = url.searchParams.get("url");
        if (!targetUrl) {
            return Response.json({
                success: false,
                error: "url parameter is required",
                timestamp: new Date().toISOString(),
            }, { status: 400 });
        }
        const analysis = await analyzeWebVitals(targetUrl);
        return Response.json({
            success: true,
            data: analysis,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("[API] Web Vitals error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to analyze Core Web Vitals",
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.seo.web-vitals.js.map