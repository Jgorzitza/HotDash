/**
 * API Route: SEO Bing Webmaster
 *
 * GET /api/seo/bing-webmaster
 *
 * Returns comprehensive Bing Webmaster Tools metrics.
 */
import { getBingWebmasterSummary } from "../lib/seo/bing-webmaster";
export async function loader({ request }) {
    try {
        const summary = await getBingWebmasterSummary();
        return Response.json({
            success: true,
            data: summary,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("[API] Bing Webmaster error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to fetch Bing Webmaster data",
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.seo.bing-webmaster.js.map