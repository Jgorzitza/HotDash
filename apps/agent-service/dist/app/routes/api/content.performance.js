/**
 * Content Performance API Route
 *
 * Provides endpoints for fetching content performance metrics:
 * - Individual post performance
 * - Aggregated performance across date ranges
 * - Top performing posts
 *
 * Supports multiple platforms: Instagram, Facebook, TikTok
 */
import { authenticate } from "../../shopify.server";
import { getContentPerformance, getAggregatedPerformance, getTopPerformingPosts, } from "../../lib/content/tracking";
/**
 * GET /api/content/performance
 *
 * Query parameters:
 * - type: 'post' | 'aggregated' | 'top' (required)
 * - postId: string (required for type=post)
 * - platform: 'instagram' | 'facebook' | 'tiktok' (required for type=post)
 * - startDate: YYYY-MM-DD (required for type=aggregated|top)
 * - endDate: YYYY-MM-DD (required for type=aggregated|top)
 * - limit: number (optional for type=top, default=10)
 * - sortBy: 'engagement' | 'reach' | 'clicks' | 'conversions' (optional for type=top)
 */
export async function loader({ request }) {
    // Authenticate the request
    await authenticate.admin(request);
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    if (!type) {
        return Response.json({ error: "Missing required parameter: type" }, { status: 400 });
    }
    try {
        switch (type) {
            case "post": {
                const postId = url.searchParams.get("postId");
                const platform = url.searchParams.get("platform");
                if (!postId || !platform) {
                    return Response.json({ error: "Missing required parameters: postId, platform" }, { status: 400 });
                }
                if (!["instagram", "facebook", "tiktok"].includes(platform)) {
                    return Response.json({
                        error: "Invalid platform. Must be: instagram, facebook, or tiktok",
                    }, { status: 400 });
                }
                const performance = await getContentPerformance(postId, platform);
                return Response.json({ performance });
            }
            case "aggregated": {
                const startDate = url.searchParams.get("startDate");
                const endDate = url.searchParams.get("endDate");
                const platform = url.searchParams.get("platform");
                if (!startDate || !endDate) {
                    return Response.json({ error: "Missing required parameters: startDate, endDate" }, { status: 400 });
                }
                // Validate date format (YYYY-MM-DD)
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
                    return Response.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
                }
                if (platform &&
                    !["instagram", "facebook", "tiktok"].includes(platform)) {
                    return Response.json({
                        error: "Invalid platform. Must be: instagram, facebook, or tiktok",
                    }, { status: 400 });
                }
                const performance = await getAggregatedPerformance(startDate, endDate, platform);
                return Response.json({ performance });
            }
            case "top": {
                const startDate = url.searchParams.get("startDate");
                const endDate = url.searchParams.get("endDate");
                const limitParam = url.searchParams.get("limit");
                const sortBy = url.searchParams.get("sortBy");
                if (!startDate || !endDate) {
                    return Response.json({ error: "Missing required parameters: startDate, endDate" }, { status: 400 });
                }
                // Validate date format
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
                    return Response.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
                }
                const limit = limitParam ? parseInt(limitParam, 10) : 10;
                if (isNaN(limit) || limit < 1 || limit > 100) {
                    return Response.json({ error: "Invalid limit. Must be between 1 and 100" }, { status: 400 });
                }
                const validSortBy = ["engagement", "reach", "clicks", "conversions"];
                if (sortBy && !validSortBy.includes(sortBy)) {
                    return Response.json({
                        error: "Invalid sortBy. Must be: engagement, reach, clicks, or conversions",
                    }, { status: 400 });
                }
                const posts = await getTopPerformingPosts(startDate, endDate, limit, sortBy || "engagement");
                return Response.json({ posts });
            }
            default:
                return Response.json({ error: "Invalid type. Must be: post, aggregated, or top" }, { status: 400 });
        }
    }
    catch (error) {
        console.error("Content performance API error:", error);
        return Response.json({ error: "Failed to fetch content performance metrics" }, { status: 500 });
    }
}
//# sourceMappingURL=content.performance.js.map