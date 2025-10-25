/**
 * ROI Tracking Service
 *
 * ADS-005: Enhanced ROI tracking and attribution for ad campaigns
 * Tracks revenue attribution, customer lifetime value, and multi-touch attribution
 */
/**
 * ROI Attribution Model
 */
export type AttributionModel = 'last_click' | 'first_click' | 'linear' | 'time_decay' | 'position_based';
/**
 * Customer Journey Touchpoint
 */
export interface Touchpoint {
    campaignId: string;
    campaignName: string;
    timestamp: string;
    channel: 'google_ads' | 'facebook_ads' | 'organic' | 'direct' | 'email';
    costCents: number;
    position: number;
}
/**
 * Customer Conversion
 */
export interface Conversion {
    conversionId: string;
    customerId: string;
    revenueCents: number;
    timestamp: string;
    touchpoints: Touchpoint[];
}
/**
 * ROI Attribution Result
 */
export interface ROIAttribution {
    campaignId: string;
    campaignName: string;
    attributedRevenueCents: number;
    attributedConversions: number;
    totalCostCents: number;
    roas: number;
    attributionModel: AttributionModel;
}
/**
 * Customer Lifetime Value Metrics
 */
export interface CLVMetrics {
    campaignId: string;
    campaignName: string;
    averageCLV: number;
    customerCount: number;
    repeatPurchaseRate: number;
    averageOrderValue: number;
    purchaseFrequency: number;
    projectedLTV: number;
}
/**
 * ROI Tracking Summary
 */
export interface ROITrackingSummary {
    totalRevenueCents: number;
    totalCostCents: number;
    overallROAS: number;
    attributionBreakdown: ROIAttribution[];
    clvMetrics: CLVMetrics[];
    topPerformingCampaigns: Array<{
        campaignId: string;
        campaignName: string;
        roas: number;
        revenueCents: number;
    }>;
    insights: string[];
}
/**
 * Calculate ROI attribution using specified model
 *
 * @param conversions - Array of customer conversions with touchpoints
 * @param model - Attribution model to use
 * @returns Array of ROI attributions per campaign
 */
export declare function calculateROIAttribution(conversions: Conversion[], model?: AttributionModel): ROIAttribution[];
/**
 * Calculate Customer Lifetime Value metrics
 *
 * @param campaignId - Campaign ID to analyze
 * @param customerData - Customer purchase history
 * @returns CLV metrics for the campaign
 */
export declare function calculateCLVMetrics(campaignId: string, campaignName: string, customerData: Array<{
    customerId: string;
    purchases: Array<{
        revenueCents: number;
        timestamp: string;
    }>;
}>): CLVMetrics;
/**
 * Generate comprehensive ROI tracking summary
 *
 * @param conversions - Customer conversions with touchpoints
 * @param customerData - Customer purchase history by campaign
 * @param model - Attribution model to use
 * @returns Complete ROI tracking summary
 */
export declare function generateROITrackingSummary(conversions: Conversion[], customerData: Map<string, Array<{
    customerId: string;
    purchases: Array<{
        revenueCents: number;
        timestamp: string;
    }>;
}>>, model?: AttributionModel): ROITrackingSummary;
//# sourceMappingURL=roi-tracker.d.ts.map