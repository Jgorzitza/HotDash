/**
 * API Route: Daily Cannibalization Detection Cron
 *
 * POST /api/cron/seo-cannibalization
 *
 * Runs daily cannibalization detection and stores results in database.
 * Called by GitHub Actions or external cron services.
 *
 * @module routes/api/cron/seo-cannibalization
 */
import { detectKeywordCannibalization } from "~/services/seo/cannibalization";
import { logDecision } from "~/services/decisions.server";
export async function action({ request }) {
    const startTime = Date.now();
    const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN || "default-shop.myshopify.com";
    try {
        // Run cannibalization detection
        const report = await detectKeywordCannibalization(shopDomain);
        await logDecision({
            scope: "build",
            actor: "seo",
            action: "daily_cannibalization_detection",
            rationale: `Daily cannibalization detection completed for ${shopDomain}: ${report.summary.keywordsWithCannibalization} conflicts found`,
            evidenceUrl: `artifacts/seo/${new Date().toISOString().split('T')[0]}/cannibalization-${Date.now()}.json`,
            payload: {
                shopDomain,
                totalKeywords: report.summary.totalKeywords,
                conflictsFound: report.summary.keywordsWithCannibalization,
                criticalIssues: report.summary.criticalIssues,
                warningIssues: report.summary.warningIssues,
                estimatedClicksLost: report.summary.estimatedClicksLost,
                duration: Date.now() - startTime,
                timestamp: new Date().toISOString(),
            },
        });
        return new Response(JSON.stringify({
            success: true,
            message: "Daily cannibalization detection completed.",
            summary: report.summary,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
    catch (error) {
        console.error("[CRON] Daily cannibalization detection error:", error);
        await logDecision({
            scope: "build",
            actor: "seo",
            action: "daily_cannibalization_detection_failed",
            rationale: `Daily cannibalization detection failed for ${shopDomain}: ${error.message}`,
            evidenceUrl: `artifacts/seo/${new Date().toISOString().split('T')[0]}/cannibalization-error-${Date.now()}.json`,
            payload: {
                shopDomain,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date().toISOString(),
            },
        });
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
//# sourceMappingURL=api.cron.seo-cannibalization.js.map