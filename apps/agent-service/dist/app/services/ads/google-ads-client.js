/**
 * Google Ads API Client
 *
 * Handles authentication and data fetching from Google Ads API.
 * Supports campaign performance tracking, ad group metrics, and keyword performance.
 *
 * @module app/services/ads/google-ads-client
 */
/**
 * Google Ads API Client
 *
 * Provides methods to interact with the Google Ads API for retrieving
 * campaign data, performance metrics, and managing ad operations.
 */
export class GoogleAdsClient {
    config;
    accessToken = null;
    tokenExpiry = null;
    constructor(config) {
        this.config = config;
    }
    /**
     * Authenticate with Google Ads API using OAuth 2.0
     *
     * @returns Promise<boolean> - True if authentication successful
     * @throws Error if authentication fails
     */
    async authenticate() {
        try {
            // OAuth 2.0 authentication flow
            const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    refresh_token: this.config.refreshToken,
                    grant_type: "refresh_token",
                }),
            });
            if (!tokenResponse.ok) {
                throw new Error(`OAuth authentication failed: ${tokenResponse.statusText}`);
            }
            const tokenData = await tokenResponse.json();
            this.accessToken = tokenData.access_token;
            this.tokenExpiry = Date.now() + tokenData.expires_in * 1000;
            return true;
        }
        catch (error) {
            console.error("Google Ads authentication error:", error);
            throw new Error(`Failed to authenticate with Google Ads API: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Check if access token is expired and refresh if needed
     */
    async ensureValidToken() {
        if (!this.accessToken ||
            !this.tokenExpiry ||
            Date.now() >= this.tokenExpiry - 60000) {
            await this.authenticate();
        }
    }
    /**
     * Fetch campaign data from Google Ads API
     *
     * @param customerIds - Array of customer IDs to fetch campaigns for
     * @returns Promise<Campaign[]> - Array of campaign objects
     */
    async getCampaigns(customerIds) {
        await this.ensureValidToken();
        const campaigns = [];
        for (const customerId of customerIds) {
            try {
                const response = await fetch(`https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:searchStream`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        "Content-Type": "application/json",
                        "developer-token": this.config.developerToken,
                    },
                    body: JSON.stringify({
                        query: `
                SELECT
                  campaign.id,
                  campaign.name,
                  campaign.status,
                  campaign.advertising_channel_type,
                  campaign.bidding_strategy_type,
                  campaign_budget.amount_micros
                FROM campaign
                WHERE campaign.status != 'REMOVED'
                ORDER BY campaign.name
              `,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
                }
                const data = await response.json();
                if (data && data.results) {
                    for (const result of data.results) {
                        campaigns.push({
                            id: result.campaign.id,
                            name: result.campaign.name,
                            status: result.campaign.status,
                            channelType: result.campaign.advertisingChannelType,
                            biddingStrategy: result.campaign.biddingStrategyType,
                            budgetMicros: result.campaignBudget?.amountMicros || 0,
                            customerId,
                        });
                    }
                }
            }
            catch (error) {
                console.error(`Error fetching campaigns for customer ${customerId}:`, error);
                // Continue with other customers even if one fails
            }
        }
        return campaigns;
    }
    /**
     * Fetch campaign performance metrics
     *
     * @param customerIds - Array of customer IDs
     * @param dateRange - Date range for metrics (e.g., "LAST_7_DAYS", "LAST_30_DAYS")
     * @returns Promise<CampaignPerformance[]> - Array of campaign performance data
     */
    async getCampaignPerformance(customerIds, dateRange = "LAST_7_DAYS") {
        await this.ensureValidToken();
        const performances = [];
        for (const customerId of customerIds) {
            try {
                const response = await fetch(`https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:searchStream`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        "Content-Type": "application/json",
                        "developer-token": this.config.developerToken,
                    },
                    body: JSON.stringify({
                        query: `
                SELECT
                  campaign.id,
                  campaign.name,
                  metrics.impressions,
                  metrics.clicks,
                  metrics.cost_micros,
                  metrics.conversions,
                  metrics.conversions_value,
                  metrics.ctr,
                  metrics.average_cpc
                FROM campaign
                WHERE segments.date DURING ${dateRange}
                  AND campaign.status != 'REMOVED'
                ORDER BY metrics.impressions DESC
              `,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch campaign performance: ${response.statusText}`);
                }
                const data = await response.json();
                if (data && data.results) {
                    for (const result of data.results) {
                        const costCents = Math.round((result.metrics.costMicros || 0) / 10000);
                        const revenueCents = Math.round((result.metrics.conversionsValue || 0) / 10000);
                        performances.push({
                            campaignId: result.campaign.id,
                            campaignName: result.campaign.name,
                            impressions: result.metrics.impressions || 0,
                            clicks: result.metrics.clicks || 0,
                            costCents,
                            conversions: result.metrics.conversions || 0,
                            revenueCents,
                            ctr: result.metrics.ctr || 0,
                            avgCpcCents: Math.round((result.metrics.averageCpc || 0) / 10000),
                            customerId,
                            dateRange,
                        });
                    }
                }
            }
            catch (error) {
                console.error(`Error fetching performance for customer ${customerId}:`, error);
            }
        }
        return performances;
    }
    /**
     * Fetch ad group performance metrics
     *
     * @param customerIds - Array of customer IDs
     * @param campaignId - Optional campaign ID to filter by
     * @param dateRange - Date range for metrics
     * @returns Promise<AdGroupPerformance[]> - Array of ad group performance data
     */
    async getAdGroupPerformance(customerIds, campaignId, dateRange = "LAST_7_DAYS") {
        await this.ensureValidToken();
        const performances = [];
        for (const customerId of customerIds) {
            try {
                let query = `
          SELECT
            campaign.id,
            campaign.name,
            ad_group.id,
            ad_group.name,
            ad_group.status,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions
          FROM ad_group
          WHERE segments.date DURING ${dateRange}
            AND ad_group.status != 'REMOVED'
        `;
                if (campaignId) {
                    query += ` AND campaign.id = ${campaignId}`;
                }
                query += ` ORDER BY metrics.impressions DESC`;
                const response = await fetch(`https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:searchStream`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        "Content-Type": "application/json",
                        "developer-token": this.config.developerToken,
                    },
                    body: JSON.stringify({ query }),
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch ad group performance: ${response.statusText}`);
                }
                const data = await response.json();
                if (data && data.results) {
                    for (const result of data.results) {
                        performances.push({
                            campaignId: result.campaign.id,
                            campaignName: result.campaign.name,
                            adGroupId: result.adGroup.id,
                            adGroupName: result.adGroup.name,
                            status: result.adGroup.status,
                            impressions: result.metrics.impressions || 0,
                            clicks: result.metrics.clicks || 0,
                            costCents: Math.round((result.metrics.costMicros || 0) / 10000),
                            conversions: result.metrics.conversions || 0,
                            customerId,
                            dateRange,
                        });
                    }
                }
            }
            catch (error) {
                console.error(`Error fetching ad group performance for customer ${customerId}:`, error);
            }
        }
        return performances;
    }
    /**
     * Fetch keyword performance metrics
     *
     * @param customerIds - Array of customer IDs
     * @param campaignId - Optional campaign ID to filter by
     * @param dateRange - Date range for metrics
     * @returns Promise<KeywordPerformance[]> - Array of keyword performance data
     */
    async getKeywordPerformance(customerIds, campaignId, dateRange = "LAST_7_DAYS") {
        await this.ensureValidToken();
        const performances = [];
        for (const customerId of customerIds) {
            try {
                let query = `
          SELECT
            campaign.id,
            campaign.name,
            ad_group.id,
            ad_group.name,
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions
          FROM keyword_view
          WHERE segments.date DURING ${dateRange}
            AND ad_group_criterion.status != 'REMOVED'
        `;
                if (campaignId) {
                    query += ` AND campaign.id = ${campaignId}`;
                }
                query += ` ORDER BY metrics.clicks DESC LIMIT 100`;
                const response = await fetch(`https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:searchStream`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        "Content-Type": "application/json",
                        "developer-token": this.config.developerToken,
                    },
                    body: JSON.stringify({ query }),
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch keyword performance: ${response.statusText}`);
                }
                const data = await response.json();
                if (data && data.results) {
                    for (const result of data.results) {
                        performances.push({
                            campaignId: result.campaign.id,
                            campaignName: result.campaign.name,
                            adGroupId: result.adGroup.id,
                            adGroupName: result.adGroup.name,
                            keyword: result.adGroupCriterion.keyword.text,
                            matchType: result.adGroupCriterion.keyword.matchType,
                            impressions: result.metrics.impressions || 0,
                            clicks: result.metrics.clicks || 0,
                            costCents: Math.round((result.metrics.costMicros || 0) / 10000),
                            conversions: result.metrics.conversions || 0,
                            customerId,
                            dateRange,
                        });
                    }
                }
            }
            catch (error) {
                console.error(`Error fetching keyword performance for customer ${customerId}:`, error);
            }
        }
        return performances;
    }
    /**
     * Check if client is authenticated
     */
    isAuthenticated() {
        return Boolean(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
    }
}
/**
 * Create and configure a Google Ads client from environment variables
 *
 * @returns GoogleAdsClient instance
 * @throws Error if required environment variables are missing
 */
export function createGoogleAdsClient() {
    const config = {
        clientId: process.env.GOOGLE_ADS_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
        refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || "",
        developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "",
        customerIds: (process.env.GOOGLE_ADS_CUSTOMER_IDS || "")
            .split(",")
            .filter(Boolean),
    };
    // Validate required configuration
    if (!config.clientId ||
        !config.clientSecret ||
        !config.refreshToken ||
        !config.developerToken) {
        throw new Error("Missing required Google Ads API credentials. Check environment variables.");
    }
    if (config.customerIds.length === 0) {
        throw new Error("No Google Ads customer IDs configured. Set GOOGLE_ADS_CUSTOMER_IDS environment variable.");
    }
    return new GoogleAdsClient(config);
}
//# sourceMappingURL=google-ads-client.js.map