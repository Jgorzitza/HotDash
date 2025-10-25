/**
 * Action Attribution Service
 *
 * ANALYTICS-101: Service for querying GA4 attribution data with hd_action_key
 * Provides comprehensive attribution analysis for growth actions
 */
export interface AttributionMetrics {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roas: number;
    costPerConversion: number;
    conversionRate: number;
    ctr: number;
}
export interface ActionAttribution {
    actionId: string;
    actionType: string;
    targetSlug: string;
    title: string;
    approvedAt: string;
    executedAt: string;
    expectedImpact: {
        impressions: number;
        conversions: number;
        revenue: number;
        roas: number;
    };
    actualImpact: {
        '7d': AttributionMetrics;
        '14d': AttributionMetrics;
        '28d': AttributionMetrics;
    };
    confidenceScore: number;
    realizedROI: number;
    performanceDelta: {
        impressions: number;
        conversions: number;
        revenue: number;
        roas: number;
    };
}
export interface AttributionPanelData {
    period: {
        start: string;
        end: string;
    };
    actions: ActionAttribution[];
    summary: {
        totalActions: number;
        totalRevenue: number;
        totalConversions: number;
        averageROI: number;
        topPerformer: ActionAttribution | null;
        overallConfidence: number;
    };
    rankings: {
        byROI: ActionAttribution[];
        byRevenue: ActionAttribution[];
        byConversions: ActionAttribution[];
    };
}
/**
 * Query GA4 for action attribution data
 *
 * ANALYTICS-101: Queries GA4 for hd_action_key metrics including
 * impressions, clicks, conversions, revenue, and ROAS
 */
export declare function queryActionAttribution(actionIds: string[], startDate: string, endDate: string): Promise<Record<string, AttributionMetrics>>;
/**
 * Calculate attribution metrics for specific time windows
 *
 * ANALYTICS-101: Calculates 7/14/28-day attribution windows
 */
export declare function calculateAttributionWindows(actionIds: string[], endDate: string): Promise<Record<string, Record<'7d' | '14d' | '28d', AttributionMetrics>>>;
/**
 * Generate comprehensive attribution panel data
 *
 * ANALYTICS-101: Builds attribution panel with 7/14/28-day performance,
 * compares actual vs expected impact, and updates confidence scores
 */
export declare function generateAttributionPanelData(actions: Array<{
    actionId: string;
    actionType: string;
    targetSlug: string;
    title: string;
    approvedAt: string;
    executedAt: string;
    expectedImpact: {
        impressions: number;
        conversions: number;
        revenue: number;
        roas: number;
    };
}>, startDate: string, endDate: string): Promise<AttributionPanelData>;
//# sourceMappingURL=attribution.d.ts.map