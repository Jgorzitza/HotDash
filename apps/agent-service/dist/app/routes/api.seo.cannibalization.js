/**
 * API Route: Keyword Cannibalization Detection
 *
 * GET /api/seo/cannibalization
 *
 * Returns keyword cannibalization analysis:
 * - Keywords with multiple pages competing
 * - Severity scoring
 * - Consolidation recommendations
 * - Estimated traffic impact
 *
 * @module routes/api/seo/cannibalization
 */
import { detectKeywordCannibalization, getKeywordCannibalizationDetails, getStoredCannibalizationConflicts, resolveCannibalizationConflict, } from "../services/seo/cannibalization";
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const shopDomain = url.searchParams.get("shop") || "default-shop.myshopify.com";
        const keyword = url.searchParams.get("keyword");
        const list = url.searchParams.get("list"); // 'active', 'resolved', 'ignored'
        const conflicts = url.searchParams.get("conflicts"); // 'true' to list stored conflicts
        // List stored conflicts
        if (conflicts === "true") {
            const status = list || "active";
            const storedConflicts = await getStoredCannibalizationConflicts(shopDomain, status);
            return Response.json({
                success: true,
                data: {
                    conflicts: storedConflicts,
                    count: storedConflicts.length,
                    status,
                },
                timestamp: new Date().toISOString(),
            });
        }
        // If keyword specified, return details for that keyword
        if (keyword) {
            const details = await getKeywordCannibalizationDetails(shopDomain, keyword);
            if (!details) {
                return Response.json({
                    success: false,
                    error: `No cannibalization detected for keyword: ${keyword}`,
                    timestamp: new Date().toISOString(),
                }, { status: 404 });
            }
            return Response.json({
                success: true,
                data: details,
                timestamp: new Date().toISOString(),
            });
        }
        // Otherwise return full report
        const report = await detectKeywordCannibalization(shopDomain);
        return Response.json({
            success: true,
            data: report,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("[API] Cannibalization detection error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to detect keyword cannibalization",
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
/**
 * POST endpoint to resolve cannibalization conflicts
 */
export async function action({ request }) {
    try {
        const body = await request.json();
        const { conflictId, resolution } = body;
        if (!conflictId || !resolution) {
            return Response.json({
                success: false,
                error: "conflictId and resolution are required",
                timestamp: new Date().toISOString(),
            }, { status: 400 });
        }
        await resolveCannibalizationConflict(conflictId, resolution);
        return Response.json({
            success: true,
            message: `Cannibalization conflict #${conflictId} resolved`,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("[API] Cannibalization resolution error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to resolve cannibalization conflict",
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.seo.cannibalization.js.map