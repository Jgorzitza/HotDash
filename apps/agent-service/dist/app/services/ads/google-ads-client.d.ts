/**
 * Google Ads API Client
 *
 * Handles authentication and data fetching from Google Ads API.
 * Supports campaign performance tracking, ad group metrics, and keyword performance.
 *
 * @module app/services/ads/google-ads-client
 */
import type { GoogleAdsConfig, Campaign, CampaignPerformance, AdGroupPerformance, KeywordPerformance } from "./types";
/**
 * Google Ads API Client
 *
 * Provides methods to interact with the Google Ads API for retrieving
 * campaign data, performance metrics, and managing ad operations.
 */
export declare class GoogleAdsClient {
    private config;
    private accessToken;
    private tokenExpiry;
    constructor(config: GoogleAdsConfig);
    /**
     * Authenticate with Google Ads API using OAuth 2.0
     *
     * @returns Promise<boolean> - True if authentication successful
     * @throws Error if authentication fails
     */
    authenticate(): Promise<boolean>;
    /**
     * Check if access token is expired and refresh if needed
     */
    private ensureValidToken;
    /**
     * Fetch campaign data from Google Ads API
     *
     * @param customerIds - Array of customer IDs to fetch campaigns for
     * @returns Promise<Campaign[]> - Array of campaign objects
     */
    getCampaigns(customerIds: string[]): Promise<Campaign[]>;
    /**
     * Fetch campaign performance metrics
     *
     * @param customerIds - Array of customer IDs
     * @param dateRange - Date range for metrics (e.g., "LAST_7_DAYS", "LAST_30_DAYS")
     * @returns Promise<CampaignPerformance[]> - Array of campaign performance data
     */
    getCampaignPerformance(customerIds: string[], dateRange?: string): Promise<CampaignPerformance[]>;
    /**
     * Fetch ad group performance metrics
     *
     * @param customerIds - Array of customer IDs
     * @param campaignId - Optional campaign ID to filter by
     * @param dateRange - Date range for metrics
     * @returns Promise<AdGroupPerformance[]> - Array of ad group performance data
     */
    getAdGroupPerformance(customerIds: string[], campaignId?: string, dateRange?: string): Promise<AdGroupPerformance[]>;
    /**
     * Fetch keyword performance metrics
     *
     * @param customerIds - Array of customer IDs
     * @param campaignId - Optional campaign ID to filter by
     * @param dateRange - Date range for metrics
     * @returns Promise<KeywordPerformance[]> - Array of keyword performance data
     */
    getKeywordPerformance(customerIds: string[], campaignId?: string, dateRange?: string): Promise<KeywordPerformance[]>;
    /**
     * Check if client is authenticated
     */
    isAuthenticated(): boolean;
}
/**
 * Create and configure a Google Ads client from environment variables
 *
 * @returns GoogleAdsClient instance
 * @throws Error if required environment variables are missing
 */
export declare function createGoogleAdsClient(): GoogleAdsClient;
//# sourceMappingURL=google-ads-client.d.ts.map