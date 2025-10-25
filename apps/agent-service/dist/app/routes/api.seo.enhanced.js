/**
 * API Route: Enhanced SEO Dashboard
 *
 * GET /api/seo/enhanced
 *
 * Returns comprehensive SEO metrics from multiple sources:
 * - Google Analytics (traffic and organic sessions)
 * - Google Search Console (organic search performance)
 * - Bing Webmaster Tools (Bing search performance)
 *
 * Provides graceful degradation if any source is unavailable.
 */
import { getEnhancedSEOData } from "../lib/seo/enhanced-seo";
export async function loader({ request }) {
    try {
        const data = await getEnhancedSEOData();
        return Response.json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.error("[API] Enhanced SEO error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to fetch enhanced SEO data",
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.seo.enhanced.js.map