/**
 * Ads ROAS (Return on Ad Spend) Calculator
 *
 * Calculates ROAS for ad campaigns
 * Tracks campaign performance metrics
 * Identifies best and worst performing campaigns
 * Stores in DashboardFact table with factType="ads_roas"
 */
export interface CampaignPerformance {
    campaignId: string;
    campaignName: string;
    platform: "google" | "meta" | "bing" | "other";
    spend: number;
    revenue: number;
    roas: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
    costPerConversion: number;
}
export interface AdsROASData {
    campaignId: string;
    performance: CampaignPerformance;
    status: "profitable" | "break-even" | "unprofitable";
    recommendation: string;
}
export interface ROASSummary {
    totalSpend: number;
    totalRevenue: number;
    overallROAS: number;
    campaignCount: number;
    profitableCampaigns: number;
    unprofitableCampaigns: number;
    bestPerformers: Array<{
        campaignId: string;
        campaignName: string;
        roas: number;
    }>;
    worstPerformers: Array<{
        campaignId: string;
        campaignName: string;
        roas: number;
    }>;
}
/**
 * Calculate ROAS for a campaign
 * ROAS = Revenue / Spend
 */
export declare function calculateCampaignROAS(campaignId: string, campaignName: string, platform: CampaignPerformance["platform"], spend: number, revenue: number, impressions: number, clicks: number, conversions: number, shopDomain?: string): Promise<AdsROASData>;
/**
 * Get ROAS summary across all campaigns
 */
export declare function getROASSummary(shopDomain?: string, platform?: string, days?: number): Promise<ROASSummary>;
/**
 * Get detailed performance for a specific campaign
 */
export declare function getCampaignPerformance(campaignId: string, shopDomain?: string, days?: number): Promise<Array<{
    date: Date;
    roas: number;
    spend: number;
    revenue: number;
    status: string;
}>>;
/**
 * Compare campaigns by performance metrics
 */
export declare function compareCampaigns(campaignIds: string[], shopDomain?: string): Promise<Array<{
    campaignId: string;
    campaignName: string;
    roas: number;
    spend: number;
    revenue: number;
    conversions: number;
    rank: number;
}>>;
//# sourceMappingURL=ads-roas.d.ts.map