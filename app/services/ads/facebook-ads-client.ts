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
  dailyBudget: number; // cents
  lifetimeBudget: number; // cents
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
  spend: number; // cents
  conversions: number;
  conversionValue: number; // cents
  ctr: number;
  cpc: number; // cents
  costPerConversion: number; // cents
  dateRange: string;
}

/**
 * Facebook Ads API Client
 */
export class FacebookAdsClient {
  private config: FacebookAdsConfig;
  private baseUrl = "https://graph.facebook.com/v18.0";

  constructor(config: FacebookAdsConfig) {
    this.config = config;
  }

  /**
   * Fetch campaigns for the configured ad account
   *
   * @returns Promise<FacebookCampaign[]>
   */
  async getCampaigns(): Promise<FacebookCampaign[]> {
    try {
      const url = `${this.baseUrl}/act_${this.config.accountId}/campaigns`;
      const params = new URLSearchParams({
        access_token: this.config.accessToken,
        fields: "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time",
      });

      const response = await fetch(`${url}?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data) {
        return [];
      }

      return data.data.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        dailyBudget: campaign.daily_budget ? parseInt(campaign.daily_budget) / 100 : 0,
        lifetimeBudget: campaign.lifetime_budget ? parseInt(campaign.lifetime_budget) / 100 : 0,
        startTime: campaign.start_time,
        stopTime: campaign.stop_time,
      }));
    } catch (error) {
      console.error("Error fetching Facebook campaigns:", error);
      throw new Error(
        `Failed to fetch Facebook campaigns: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Fetch campaign performance insights
   *
   * @param campaignIds - Array of campaign IDs to fetch insights for
   * @param datePreset - Date range preset (e.g., "last_7d", "last_30d")
   * @returns Promise<FacebookCampaignPerformance[]>
   */
  async getCampaignInsights(
    campaignIds: string[],
    datePreset: string = "last_7d"
  ): Promise<FacebookCampaignPerformance[]> {
    const performances: FacebookCampaignPerformance[] = [];

    for (const campaignId of campaignIds) {
      try {
        const url = `${this.baseUrl}/${campaignId}/insights`;
        const params = new URLSearchParams({
          access_token: this.config.accessToken,
          date_preset: datePreset,
          fields: "campaign_id,campaign_name,impressions,reach,clicks,spend,actions,action_values,ctr,cpc",
        });

        const response = await fetch(`${url}?${params}`);

        if (!response.ok) {
          console.error(`Failed to fetch insights for campaign ${campaignId}: ${response.statusText}`);
          continue; // Skip this campaign and continue with others
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
          continue;
        }

        const insight = data.data[0]; // First row is summary

        // Extract conversions from actions array
        let conversions = 0;
        let conversionValue = 0;

        if (insight.actions) {
          const purchaseAction = insight.actions.find(
            (a: any) => a.action_type === "purchase" || a.action_type === "offsite_conversion"
          );
          if (purchaseAction) {
            conversions = parseInt(purchaseAction.value) || 0;
          }
        }

        if (insight.action_values) {
          const purchaseValue = insight.action_values.find(
            (a: any) => a.action_type === "purchase" || a.action_type === "offsite_conversion"
          );
          if (purchaseValue) {
            conversionValue = Math.round(parseFloat(purchaseValue.value) * 100); // Convert to cents
          }
        }

        const spendCents = Math.round(parseFloat(insight.spend || "0") * 100);
        const cpcCents = Math.round(parseFloat(insight.cpc || "0") * 100);
        const costPerConversion = conversions > 0 ? spendCents / conversions : 0;

        performances.push({
          campaignId: insight.campaign_id,
          campaignName: insight.campaign_name,
          impressions: parseInt(insight.impressions) || 0,
          reach: parseInt(insight.reach) || 0,
          clicks: parseInt(insight.clicks) || 0,
          spend: spendCents,
          conversions,
          conversionValue: conversionValue,
          ctr: parseFloat(insight.ctr) || 0,
          cpc: cpcCents,
          costPerConversion,
          dateRange: datePreset,
        });
      } catch (error) {
        console.error(`Error fetching insights for campaign ${campaignId}:`, error);
        // Continue with other campaigns
      }
    }

    return performances;
  }

  /**
   * Create a new campaign
   *
   * @param campaignData - Campaign configuration
   * @returns Promise<FacebookCampaign>
   */
  async createCampaign(campaignData: {
    name: string;
    objective: string;
    status: "ACTIVE" | "PAUSED";
    dailyBudget?: number; // cents
    lifetimeBudget?: number; // cents
  }): Promise<FacebookCampaign> {
    try {
      const url = `${this.baseUrl}/act_${this.config.accountId}/campaigns`;

      const body: any = {
        access_token: this.config.accessToken,
        name: campaignData.name,
        objective: campaignData.objective,
        status: campaignData.status,
      };

      if (campaignData.dailyBudget) {
        body.daily_budget = (campaignData.dailyBudget * 100).toString(); // Convert cents to Facebook's format
      }

      if (campaignData.lifetimeBudget) {
        body.lifetime_budget = (campaignData.lifetimeBudget * 100).toString();
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to create campaign: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        name: campaignData.name,
        status: campaignData.status,
        objective: campaignData.objective,
        dailyBudget: campaignData.dailyBudget || 0,
        lifetimeBudget: campaignData.lifetimeBudget || 0,
        startTime: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error creating Facebook campaign:", error);
      throw new Error(
        `Failed to create Facebook campaign: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Update campaign status (pause/resume)
   *
   * @param campaignId - Campaign ID
   * @param status - New status
   * @returns Promise<boolean>
   */
  async updateCampaignStatus(campaignId: string, status: "ACTIVE" | "PAUSED"): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${campaignId}`;

      const body = {
        access_token: this.config.accessToken,
        status,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to update campaign status: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Error updating campaign ${campaignId} status:`, error);
      throw new Error(
        `Failed to update campaign status: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Update campaign budget
   *
   * @param campaignId - Campaign ID
   * @param dailyBudget - New daily budget in cents
   * @returns Promise<boolean>
   */
  async updateCampaignBudget(campaignId: string, dailyBudget: number): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${campaignId}`;

      const body = {
        access_token: this.config.accessToken,
        daily_budget: (dailyBudget * 100).toString(), // Convert cents to Facebook's format
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to update campaign budget: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Error updating campaign ${campaignId} budget:`, error);
      throw new Error(
        `Failed to update campaign budget: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

/**
 * Create and configure a Facebook Ads client from environment variables
 *
 * @returns FacebookAdsClient instance
 * @throws Error if required environment variables are missing
 */
export function createFacebookAdsClient(): FacebookAdsClient {
  const config: FacebookAdsConfig = {
    accessToken: process.env.FACEBOOK_ADS_ACCESS_TOKEN || "",
    appId: process.env.FACEBOOK_ADS_APP_ID || "",
    appSecret: process.env.FACEBOOK_ADS_APP_SECRET || "",
    accountId: process.env.FACEBOOK_ADS_ACCOUNT_ID || "",
  };

  // Validate required configuration
  if (!config.accessToken || !config.appId || !config.appSecret || !config.accountId) {
    throw new Error("Missing required Facebook Ads API credentials. Check environment variables.");
  }

  return new FacebookAdsClient(config);
}

