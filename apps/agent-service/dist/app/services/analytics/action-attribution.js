/**
 * Action Attribution Service
 *
 * Queries GA4 for action performance (ROI tracking) and re-ranks Action Queue
 * based on realized results. CEO stated this is CRITICAL for Growth Engine.
 *
 * Features:
 * - GA4 Data API integration for custom dimension (hd_action_key)
 * - 3 attribution windows: 7d, 14d, 28d
 * - Re-rank Action Queue based on realized ROI
 * - Rate limiting (1 query/second for GA4 API)
 * - Nightly job for batch updates
 *
 * Prerequisites:
 * - DevOps: GA4 custom dimension "hd_action_key" (event scope) in Property 339826228
 * - Engineer: Client-side tracking (ENG-032, 033)
 * - Data: action_queue and action_attribution tables (DATA-021)
 */
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import prisma from "~/db.server";
import { logDecision } from "~/services/decisions.server";
// ============================================================================
// Configuration
// ============================================================================
const GA4_PROPERTY_ID = "339826228";
// Create GA4 Data API client with service account authentication
const analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
// ============================================================================
// GA4 Data API Queries
// ============================================================================
/**
 * Query GA4 for action performance using custom dimension hd_action_key
 *
 * @param actionKey - Action key to query (e.g., "campaign_123", "seo_optimization_456")
 * @param periodDays - Attribution window: 7, 14, or 28 days
 * @returns Action attribution metrics
 */
export async function getActionAttribution(actionKey, periodDays) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [
                {
                    startDate: startDate.toISOString().split("T")[0],
                    endDate: new Date().toISOString().split("T")[0],
                },
            ],
            dimensions: [{ name: "customEvent:hd_action_key" }],
            metrics: [
                { name: "sessions" },
                { name: "screenPageViews" },
                { name: "addToCarts" },
                { name: "ecommercePurchases" },
                { name: "totalRevenue" },
            ],
            dimensionFilter: {
                filter: {
                    fieldName: "customEvent:hd_action_key",
                    stringFilter: {
                        value: actionKey,
                        matchType: "EXACT",
                    },
                },
            },
        });
        // Parse response
        if (!response.rows || response.rows.length === 0) {
            console.log(`[Attribution] No data found for action key: ${actionKey} (${periodDays}d)`);
            return {
                actionKey,
                periodDays,
                sessions: 0,
                pageviews: 0,
                addToCarts: 0,
                purchases: 0,
                revenue: 0,
                conversionRate: 0,
                averageOrderValue: 0,
                realizedROI: 0,
            };
        }
        const row = response.rows[0];
        const sessions = parseInt(row.metricValues?.[0]?.value || "0");
        const pageviews = parseInt(row.metricValues?.[1]?.value || "0");
        const addToCarts = parseInt(row.metricValues?.[2]?.value || "0");
        const purchases = parseInt(row.metricValues?.[3]?.value || "0");
        const revenue = parseFloat(row.metricValues?.[4]?.value || "0");
        const conversionRate = sessions > 0 ? (purchases / sessions) * 100 : 0;
        const averageOrderValue = purchases > 0 ? revenue / purchases : 0;
        console.log(`[Attribution] ${actionKey} (${periodDays}d): ${sessions} sessions, ${purchases} purchases, $${revenue.toFixed(2)} revenue`);
        return {
            actionKey,
            periodDays,
            sessions,
            pageviews,
            addToCarts,
            purchases,
            revenue,
            conversionRate,
            averageOrderValue,
            realizedROI: revenue,
        };
    }
    catch (error) {
        console.error(`[Attribution] GA4 API error for ${actionKey} (${periodDays}d):`, error.message);
        throw new Error(`Failed to fetch GA4 attribution data: ${error.message}`);
    }
}
// ============================================================================
// Action Queue Updates
// ============================================================================
/**
 * Update action record with realized ROI from GA4
 *
 * @param actionId - Action queue record ID
 * @param actionKey - Action key for GA4 query
 * @returns Attribution summary for all windows
 */
export async function updateActionROI(actionId, actionKey) {
    console.log(`[Attribution] Updating ROI for action ${actionId} (key: ${actionKey})`);
    // Query all 3 windows in parallel
    const [roi7d, roi14d, roi28d] = await Promise.all([
        getActionAttribution(actionKey, 7),
        getActionAttribution(actionKey, 14),
        getActionAttribution(actionKey, 28),
    ]);
    // Update action_queue record with realized ROI
    await prisma.actionQueue.update({
        where: { id: actionId },
        data: {
            realizedRevenue7d: roi7d.revenue,
            realizedRevenue14d: roi14d.revenue,
            realizedRevenue28d: roi28d.revenue,
            conversionRate: roi28d.conversionRate,
            lastAttributionCheck: new Date(),
        },
    });
    // Store detailed attribution in action_attribution table
    await prisma.actionAttribution.create({
        data: {
            actionId,
            actionKey,
            periodDays: 28,
            sessions: roi28d.sessions,
            pageviews: roi28d.pageviews,
            addToCarts: roi28d.addToCarts,
            purchases: roi28d.purchases,
            revenue: roi28d.revenue,
            conversionRate: roi28d.conversionRate,
            averageOrderValue: roi28d.averageOrderValue,
            recordedAt: new Date(),
        },
    });
    console.log(`[Attribution] ✅ Updated action ${actionId}: 7d=$${roi7d.revenue}, 14d=$${roi14d.revenue}, 28d=$${roi28d.revenue}`);
    return { roi7d, roi14d, roi28d };
}
// ============================================================================
// Action Queue Re-ranking
// ============================================================================
/**
 * Re-rank Action Queue based on realized ROI
 *
 * Strategy: Prioritize actions that delivered actual results
 * - Top performers = high realized ROI (proven winners)
 * - Secondary = high expected ROI (predictions)
 *
 * @returns Ranked actions (top 10)
 */
export async function rerankActionQueue() {
    console.log("[Attribution] Starting Action Queue re-ranking");
    // Get all approved actions from last 30 days with tracking keys
    const actions = await prisma.actionQueue.findMany({
        where: {
            status: "approved",
            approvedAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
            actionKey: { not: null },
        },
    });
    console.log(`[Attribution] Found ${actions.length} actions to update`);
    // Update attribution for each action (with rate limiting)
    let updatedCount = 0;
    for (const action of actions) {
        if (action.actionKey) {
            try {
                await updateActionROI(action.id, action.actionKey);
                updatedCount++;
                // Rate limit: 1 query/second (GA4 API limit)
                // 3 queries per action (7d, 14d, 28d) = 3 seconds per action
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
            catch (error) {
                console.error(`[Attribution] Failed to update action ${action.id}:`, error.message);
                // Continue with next action
            }
        }
    }
    // Get top 10 actions ranked by realized ROI (28d window)
    const rankedActions = await prisma.actionQueue.findMany({
        where: { status: "pending" },
        orderBy: [{ realizedRevenue28d: "desc" }, { expectedRevenue: "desc" }],
        take: 10,
    });
    console.log(`[Attribution] ✅ Re-ranking complete: Updated ${updatedCount} actions`);
    console.log(`[Attribution] Top action: ${rankedActions[0]?.actionKey || "none"} ($${rankedActions[0]?.realizedRevenue28d || 0})`);
    return rankedActions;
}
// ============================================================================
// Nightly Job
// ============================================================================
/**
 * Nightly job: Update attribution for all recent actions
 *
 * Run via cron: 0 2 * * * (2 AM daily)
 */
export async function runNightlyAttributionUpdate() {
    const startTime = Date.now();
    console.log("[Attribution] ========================================");
    console.log("[Attribution] Starting nightly ROI update");
    console.log("[Attribution] ========================================");
    try {
        const rankedActions = await rerankActionQueue();
        const duration = Date.now() - startTime;
        const durationMinutes = (duration / 60000).toFixed(2);
        console.log(`[Attribution] ✅ Complete in ${durationMinutes} minutes`);
        console.log(`[Attribution] Top 3 actions by realized ROI:`);
        rankedActions.slice(0, 3).forEach((action, i) => {
            console.log(`  ${i + 1}. ${action.actionKey}: $${action.realizedRevenue28d || 0} (28d)`);
        });
        // Log decision
        await logDecision({
            scope: "ops",
            actor: "system",
            action: "action_attribution_update",
            rationale: `Nightly ROI sync: ${rankedActions.length} actions ranked by realized performance`,
            evidenceUrl: "/api/action-queue",
            payload: {
                durationMs: duration,
                actionsUpdated: rankedActions.length,
                topAction: rankedActions[0]?.actionKey || null,
                topRevenue28d: rankedActions[0]?.realizedRevenue28d || 0,
            },
            createdAt: new Date(),
        });
        return {
            success: true,
            actionsUpdated: rankedActions.length,
            durationMs: duration,
        };
    }
    catch (error) {
        console.error("[Attribution] ❌ Nightly update failed:", error.message);
        // Log failure decision
        await logDecision({
            scope: "ops",
            actor: "system",
            action: "action_attribution_update_failed",
            rationale: `Nightly ROI sync failed: ${error.message}`,
            evidenceUrl: "/api/action-queue",
            payload: {
                error: error.message,
                stack: error.stack,
            },
            createdAt: new Date(),
        });
        throw error;
    }
}
//# sourceMappingURL=action-attribution.js.map