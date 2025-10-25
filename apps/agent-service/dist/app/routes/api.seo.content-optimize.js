/**
 * API Route: Content Optimization Analysis
 *
 * POST /api/seo/content-optimize
 *
 * Analyzes content and provides SEO optimization recommendations:
 * - Flesch reading ease score
 * - Keyword density analysis
 * - Heading structure verification
 * - Internal linking analysis
 * - Image alt text checking
 * - Overall SEO score (0-100) with grade
 *
 * @module routes/api/seo/content-optimize
 */
import { analyzeContent, analyzeContentFromURL, } from "../services/seo/content-optimizer";
export async function action({ request }) {
    try {
        const formData = await request.formData();
        const url = formData.get("url");
        const html = formData.get("html");
        const targetKeyword = formData.get("targetKeyword");
        if (!targetKeyword) {
            return Response.json({
                success: false,
                error: "targetKeyword parameter is required",
                timestamp: new Date().toISOString(),
            }, { status: 400 });
        }
        let analysis;
        if (html) {
            // Analyze provided HTML
            const pageUrl = url || "https://example.com";
            analysis = await analyzeContent(pageUrl, html, targetKeyword);
        }
        else if (url) {
            // Fetch and analyze URL
            analysis = await analyzeContentFromURL(url, targetKeyword);
        }
        else {
            return Response.json({
                success: false,
                error: "Either 'url' or 'html' parameter is required",
                timestamp: new Date().toISOString(),
            }, { status: 400 });
        }
        return Response.json({
            success: true,
            data: analysis,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("[API] Content optimization error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to analyze content",
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.seo.content-optimize.js.map