/**
 * API Route: SEO Search Console
 *
 * GET /api/seo/search-console
 *
 * Returns comprehensive Search Console metrics.
 */
import { getSearchConsoleSummary } from "../lib/seo/search-console";
export async function loader({ request }) {
    try {
        const summary = await getSearchConsoleSummary();
        return Response.json({
            success: true,
            data: summary,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("[API] Search Console error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to fetch Search Console data",
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.seo.search-console.js.map