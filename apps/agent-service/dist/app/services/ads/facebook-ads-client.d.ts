/**
 * Facebook Ads API Client
 *
 * Handles authentication and data fetching from Facebook Ads API.
 * Supports campaign management, performance tracking, and ad creative management.
 *
 * @module app/services/ads/facebook-ads-client
 */
/**
 * Facebook Ads Configuration
 */
export interface FacebookAdsConfig {
    accessToken: string;
    appId: string;
    appSecret: string;
    accountId: string;
}
/**
 * Facebook Campaign
 */
export interface FacebookCampaign {
    id: string;
    name: string;
    status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
    objective: string;
    dailyBudget: number;
    lifetimeBudget: number;
    startTime: string;
    stopTime?: string;
}
/**
 * Facebook Campaign Performance
 */
export interface FacebookCampaignPerformance {
    campaignId: string;
    campaignName: string;
    impressions: number;
    reach: number;
    clicks: number;
    spend: number;
    conversions: number;
    conversionValue: number;
    ctr: number;
    cpc: number;
    costPerConversion: number;
    dateRange: string;
}
/**
 * Facebook Ads API Client
 */
export declare class FacebookAdsClient {
    private config;
    private baseUrl;
    constructor(config: FacebookAdsConfig);
    /**
     * Fetch campaigns for the configured ad account
     *
     * @returns Promise<FacebookCampaign[]>
     */
    getCampaigns(): Promise<FacebookCampaign[]>;
    /**
     * Fetch campaign performance insights
     *
     * @param campaignIds - Array of campaign IDs to fetch insights for
     * @param datePreset - Date range preset (e.g., "last_7d", "last_30d")
     * @returns Promise<FacebookCampaignPerformance[]>
     */
    getCampaignInsights(campaignIds: string[], datePreset?: string): Promise<FacebookCampaignPerformance[]>;
    /**
     * Create a new campaign
     *
     * @param campaignData - Campaign configuration
     * @returns Promise<FacebookCampaign>
     */
    createCampaign(campaignData: {
        name: string;
        objective: string;
        status: "ACTIVE" | "PAUSED";
        dailyBudget?: number;
        lifetimeBudget?: number;
    }): Promise<FacebookCampaign>;
    /**
     * Update campaign status (pause/resume)
     *
     * @param campaignId - Campaign ID
     * @param status - New status
     * @returns Promise<boolean>
     */
    updateCampaignStatus(campaignId: string, status: "ACTIVE" | "PAUSED"): Promise<boolean>;
    /**
     * Update campaign budget
     *
     * @param campaignId - Campaign ID
     * @param dailyBudget - New daily budget in cents
     * @returns Promise<boolean>
     */
    updateCampaignBudget(campaignId: string, dailyBudget: number): Promise<boolean>;
}
/**
 * Create and configure a Facebook Ads client from environment variables
 *
 * @returns FacebookAdsClient instance
 * @throws Error if required environment variables are missing
 */
export declare function createFacebookAdsClient(): FacebookAdsClient;
//# sourceMappingURL=facebook-ads-client.d.ts.map