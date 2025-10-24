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
export interface ActionAttributionResult {
    actionKey: string;
    periodDays: number;
    sessions: number;
    pageviews: number;
    addToCarts: number;
    purchases: number;
    revenue: number;
    conversionRate: number;
    averageOrderValue: number;
    realizedROI: number;
}
export interface AttributionSummary {
    roi7d: ActionAttributionResult;
    roi14d: ActionAttributionResult;
    roi28d: ActionAttributionResult;
}
/**
 * Query GA4 for action performance using custom dimension hd_action_key
 *
 * @param actionKey - Action key to query (e.g., "campaign_123", "seo_optimization_456")
 * @param periodDays - Attribution window: 7, 14, or 28 days
 * @returns Action attribution metrics
 */
export declare function getActionAttribution(actionKey: string, periodDays: 7 | 14 | 28): Promise<ActionAttributionResult>;
/**
 * Update action record with realized ROI from GA4
 *
 * @param actionId - Action queue record ID
 * @param actionKey - Action key for GA4 query
 * @returns Attribution summary for all windows
 */
export declare function updateActionROI(actionId: string, actionKey: string): Promise<AttributionSummary>;
/**
 * Re-rank Action Queue based on realized ROI
 *
 * Strategy: Prioritize actions that delivered actual results
 * - Top performers = high realized ROI (proven winners)
 * - Secondary = high expected ROI (predictions)
 *
 * @returns Ranked actions (top 10)
 */
export declare function rerankActionQueue(): Promise<any>;
/**
 * Nightly job: Update attribution for all recent actions
 *
 * Run via cron: 0 2 * * * (2 AM daily)
 */
export declare function runNightlyAttributionUpdate(): Promise<{
    success: boolean;
    actionsUpdated: any;
    durationMs: number;
}>;
//# sourceMappingURL=action-attribution.d.ts.map