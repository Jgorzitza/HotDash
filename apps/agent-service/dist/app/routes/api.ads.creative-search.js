/**
 * Ad Creative Search API
 *
 * Provides search and recommendation endpoints for ad creative optimization
 * using image similarity search.
 *
 * Part of ADS-IMAGE-SEARCH-001: Use Image Search for Ad Creative Optimization
 *
 * @module app/routes/api.ads.creative-search
 */
import { searchSimilarCreatives, findSimilarHighPerformers, } from "~/services/ads/creative-search";
import { logDecision } from "~/services/decisions.server";
/**
 * GET /api/ads/creative-search
 *
 * Search for similar ad creatives by text query or reference image
 *
 * Query Parameters:
 * - q: Text search query (optional)
 * - referenceImageId: Reference image ID for similarity search (optional)
 * - limit: Maximum results (default: 10)
 * - minRoas: Minimum ROAS filter (optional)
 * - minCtr: Minimum CTR filter (optional)
 * - minConversions: Minimum conversions filter (optional)
 * - platforms: Comma-separated platforms (optional)
 */
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const query = url.searchParams.get("q");
        const referenceImageId = url.searchParams.get("referenceImageId");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const minRoas = url.searchParams.get("minRoas")
            ? parseFloat(url.searchParams.get("minRoas"))
            : undefined;
        const minCtr = url.searchParams.get("minCtr")
            ? parseFloat(url.searchParams.get("minCtr"))
            : undefined;
        const minConversions = url.searchParams.get("minConversions")
            ? parseInt(url.searchParams.get("minConversions"))
            : undefined;
        const platformsParam = url.searchParams.get("platforms");
        const platforms = platformsParam
            ? platformsParam.split(",")
            : undefined;
        // Build filters
        const filters = {
            minRoas,
            minCtr,
            minConversions,
            platforms,
        };
        // Build search request
        const searchRequest = {
            query: query || undefined,
            referenceImageId: referenceImageId || undefined,
            filters,
            limit,
        };
        // Perform search
        const response = await searchSimilarCreatives(searchRequest);
        // Log search
        await logDecision({
            scope: "build",
            actor: "ads",
            action: "creative_search",
            rationale: `Searched for similar ad creatives: ${query || referenceImageId}`,
            payload: {
                query,
                referenceImageId,
                resultsCount: response.results.length,
                filters,
            },
        });
        return Response.json(response);
    }
    catch (error) {
        console.error("[Creative Search API] Error:", error);
        return Response.json({
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
/**
 * POST /api/ads/creative-search
 *
 * Get recommendations for similar high-performing creatives
 *
 * Request Body:
 * {
 *   referenceImageId: string;
 *   minRoas?: number;
 *   minCtr?: number;
 *   minConversions?: number;
 *   limit?: number;
 * }
 */
export async function action({ request }) {
    try {
        const body = await request.json();
        const recommendationRequest = {
            referenceImageId: body.referenceImageId,
            minRoas: body.minRoas,
            minCtr: body.minCtr,
            minConversions: body.minConversions,
            limit: body.limit || 10,
        };
        // Get recommendations
        const response = await findSimilarHighPerformers(recommendationRequest);
        // Log recommendations
        await logDecision({
            scope: "build",
            actor: "ads",
            action: "creative_recommendations",
            rationale: `Generated ${response.recommendations.length} recommendations for creative ${body.referenceImageId}`,
            payload: {
                referenceImageId: body.referenceImageId,
                recommendationsCount: response.recommendations.length,
                averageRoas: response.averageRoas,
                averageCtr: response.averageCtr,
            },
        });
        return Response.json(response);
    }
    catch (error) {
        console.error("[Creative Recommendations API] Error:", error);
        return Response.json({
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.ads.creative-search.js.map