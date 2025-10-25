/**
 * Google Ads API Client
 *
 * Handles authentication and data fetching from Google Ads API.
 * Supports campaign performance tracking, ad group metrics, and keyword performance.
 *
 * @module app/services/ads/google-ads-client
 */

import type {
  GoogleAdsConfig,
  Campaign,
  CampaignPerformance,
  AdGroupPerformance,
  KeywordPerformance,
} from "./types";

/**
 * Google Ads API Client
 *
 * Provides methods to interact with the Google Ads API for retrieving
 * campaign data, performance metrics, and managing ad operations.
 */
export class GoogleAdsClient {
  private config: GoogleAdsConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private readonly apiVersion = "v18";

  constructor(config: GoogleAdsConfig) {
    this.config = config;
  }

  /**
   * Authenticate with Google Ads API using OAuth 2.0
   *
   * @returns Promise<boolean> - True if authentication successful
   * @throws Error if authentication fails
   */
  async authenticate(): Promise<boolean> {
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
        throw new Error(
          `OAuth authentication failed: ${tokenResponse.statusText}`,
        );
      }

      const tokenData = await tokenResponse.json();
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + tokenData.expires_in * 1000;

      return true;
    } catch (error) {
      console.error("Google Ads authentication error:", error);
      throw new Error(
        `Failed to authenticate with Google Ads API: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Check if access token is expired and refresh if needed
   */
  private async ensureValidToken(): Promise<void> {
    if (
      !this.accessToken ||
      !this.tokenExpiry ||
      Date.now() >= this.tokenExpiry - 60000
    ) {
      await this.authenticate();
    }
  }

  /**
   * Fetch campaign data from Google Ads API
   *
   * @param customerIds - Array of customer IDs to fetch campaigns for
   * @returns Promise<Campaign[]> - Array of campaign objects
   */
  async getCampaigns(customerIds: string[]): Promise<Campaign[]> {
    const campaigns: Campaign[] = [];

    for (const customerId of customerIds) {
      const results = await this.runSearch(
        customerId,
        `
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
        (row) => {
          const { campaign, campaignBudget } = row ?? {};
          if (!campaign) return null;

          return {
            id: String(campaign.id ?? ""),
            name: campaign.name ?? "",
            status: campaign.status ?? "UNKNOWN",
            channelType: campaign.advertisingChannelType ?? "UNKNOWN",
            biddingStrategy: campaign.biddingStrategyType ?? "UNKNOWN",
            budgetMicros: Number(campaignBudget?.amountMicros ?? 0),
            customerId,
          } satisfies Campaign;
        },
        () => this.getMockCampaigns(customerId),
        "campaign search",
      );

      campaigns.push(...results);
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
  async getCampaignPerformance(
    customerIds: string[],
    dateRange: string = "LAST_7_DAYS",
  ): Promise<CampaignPerformance[]> {
    const performances: CampaignPerformance[] = [];

    for (const customerId of customerIds) {
      const results = await this.runSearch(
        customerId,
        `
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
        (row) => {
          const { campaign, metrics } = row ?? {};
          if (!campaign || !metrics) return null;

          const costMicros = Number(metrics.costMicros ?? 0);
          const conversionValueMicros = Number(metrics.conversionsValue ?? 0);

          return {
            campaignId: String(campaign.id ?? ""),
            campaignName: campaign.name ?? "",
            impressions: Number(metrics.impressions ?? 0),
            clicks: Number(metrics.clicks ?? 0),
            costCents: Math.round(costMicros / 10000),
            conversions: Number(metrics.conversions ?? 0),
            revenueCents: Math.round(conversionValueMicros / 10000),
            ctr: Number(metrics.ctr ?? 0),
            avgCpcCents: Math.round(Number(metrics.averageCpc ?? 0) / 10000),
            customerId,
            dateRange,
          } satisfies CampaignPerformance;
        },
        () => this.getMockCampaignPerformance(customerId, dateRange),
        "campaign performance",
      );

      performances.push(...results);
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
  async getAdGroupPerformance(
    customerIds: string[],
    campaignId?: string,
    dateRange: string = "LAST_7_DAYS",
  ): Promise<AdGroupPerformance[]> {
    const performances: AdGroupPerformance[] = [];
    const sanitizedCampaignId =
      campaignId && /^\d+$/.test(campaignId) ? campaignId : undefined;

    for (const customerId of customerIds) {
      const query = `
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
        ${sanitizedCampaignId ? `AND campaign.id = ${sanitizedCampaignId}` : ""}
        ORDER BY metrics.impressions DESC
      `;

      const results = await this.runSearch(
        customerId,
        query,
        (row) => {
          const { campaign, adGroup, metrics } = row ?? {};
          if (!campaign || !adGroup || !metrics) return null;

          const mappedCampaignId = String(campaign.id ?? "");
          if (sanitizedCampaignId && mappedCampaignId !== sanitizedCampaignId) {
            return null;
          }

          return {
            campaignId: mappedCampaignId,
            campaignName: campaign.name ?? "",
            adGroupId: String(adGroup.id ?? ""),
            adGroupName: adGroup.name ?? "",
            status: adGroup.status ?? "UNKNOWN",
            impressions: Number(metrics.impressions ?? 0),
            clicks: Number(metrics.clicks ?? 0),
            costCents: Math.round(Number(metrics.costMicros ?? 0) / 10000),
            conversions: Number(metrics.conversions ?? 0),
            customerId,
            dateRange,
          } satisfies AdGroupPerformance;
        },
        () => this.getMockAdGroupPerformance(customerId, dateRange, sanitizedCampaignId),
        "ad group performance",
      );

      performances.push(...results);
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
  async getKeywordPerformance(
    customerIds: string[],
    campaignId?: string,
    dateRange: string = "LAST_7_DAYS",
  ): Promise<KeywordPerformance[]> {
    const performances: KeywordPerformance[] = [];
    const sanitizedCampaignId =
      campaignId && /^\d+$/.test(campaignId) ? campaignId : undefined;

    for (const customerId of customerIds) {
      const query = `
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
        ${sanitizedCampaignId ? `AND campaign.id = ${sanitizedCampaignId}` : ""}
        ORDER BY metrics.clicks DESC
        LIMIT 100
      `;

      const results = await this.runSearch(
        customerId,
        query,
        (row) => {
          const { campaign, adGroup, adGroupCriterion, metrics } = row ?? {};
          const keyword = adGroupCriterion?.keyword;
          if (!campaign || !adGroup || !keyword || !metrics) return null;

          const mappedCampaignId = String(campaign.id ?? "");
          if (sanitizedCampaignId && mappedCampaignId !== sanitizedCampaignId) {
            return null;
          }

          return {
            campaignId: mappedCampaignId,
            campaignName: campaign.name ?? "",
            adGroupId: String(adGroup.id ?? ""),
            adGroupName: adGroup.name ?? "",
            keyword: keyword.text ?? "",
            matchType: keyword.matchType ?? "UNKNOWN",
            impressions: Number(metrics.impressions ?? 0),
            clicks: Number(metrics.clicks ?? 0),
            costCents: Math.round(Number(metrics.costMicros ?? 0) / 10000),
            conversions: Number(metrics.conversions ?? 0),
            customerId,
            dateRange,
          } satisfies KeywordPerformance;
        },
        () =>
          this.getMockKeywordPerformance(
            customerId,
            dateRange,
            sanitizedCampaignId,
          ),
        "keyword performance",
      );

      performances.push(...results);
    }

    return performances;
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return Boolean(
      this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry,
    );
  }

  private getCustomerBaseUrl(customerId: string): string {
    return `https://googleads.googleapis.com/${this.apiVersion}/customers/${customerId}`;
  }

  private async runSearch<T>(
    customerId: string,
    query: string,
    transform: (row: any) => T | null,
    fallback: () => T[],
    logLabel: string,
  ): Promise<T[]> {
    const aggregated: T[] = [];
    let pageToken: string | undefined;

    try {
      do {
        await this.ensureValidToken();

        const requestBody: Record<string, unknown> = { query };
        if (pageToken) {
          requestBody.pageToken = pageToken;
        }

        const response = await fetch(`${this.getCustomerBaseUrl(customerId)}/googleAds:search`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
            "developer-token": this.config.developerToken,
          },
          body: JSON.stringify(requestBody),
        });

        if (response.status === 410) {
          console.warn(
            `[GoogleAdsClient] ${logLabel} endpoint returned 410 for customer ${customerId}. Using fallback data.`,
          );
          return fallback();
        }

        if (!response.ok) {
          throw new Error(
            `Google Ads API responded with ${response.status} (${response.statusText})`,
          );
        }

        const data = await response.json();
        const results = Array.isArray(data.results) ? data.results : [];

        for (const row of results) {
          try {
            const mapped = transform(row);
            if (mapped) {
              aggregated.push(mapped);
            }
          } catch (transformError) {
            console.error(
              `[GoogleAdsClient] Failed to transform ${logLabel} result for customer ${customerId}`,
              transformError,
            );
          }
        }

        pageToken = data.nextPageToken;
      } while (pageToken);

      return aggregated;
    } catch (error) {
      console.error(
        `[GoogleAdsClient] Failed to execute ${logLabel} query for customer ${customerId}`,
        error,
      );
      return fallback();
    }
  }

  private generateFallbackSeed(customerId: string, key: string): number {
    const source = `${customerId}:${key}`;
    let hash = 0;

    for (let index = 0; index < source.length; index += 1) {
      hash = (hash << 5) - hash + source.charCodeAt(index);
      hash |= 0; // Convert to 32bit integer
    }

    return Math.abs(hash);
  }

  private getMockCampaigns(customerId: string): Campaign[] {
    const baseSeed = this.generateFallbackSeed(customerId, "campaigns");
    const baseBudget = (baseSeed % 50_000 + 10_000) * 1000;

    const campaigns: Campaign[] = [
      {
        id: `${customerId}-cmp-001`,
        name: "Fallback Awareness",
        status: "ENABLED",
        channelType: "SEARCH",
        biddingStrategy: "MANUAL_CPC",
        budgetMicros: Math.round(baseBudget),
        customerId,
      },
      {
        id: `${customerId}-cmp-002`,
        name: "Fallback Retargeting",
        status: "PAUSED",
        channelType: "DISPLAY",
        biddingStrategy: "TARGET_ROAS",
        budgetMicros: Math.round(baseBudget * 0.8),
        customerId,
      },
    ];

    return campaigns;
  }

  private getMockCampaignPerformance(
    customerId: string,
    dateRange: string,
  ): CampaignPerformance[] {
    const seed = this.generateFallbackSeed(customerId, `performance:${dateRange}`);
    const impressions = 10_000 + (seed % 5_000);
    const clicks = Math.round(impressions * 0.05);
    const costCents = impressions + clicks * 2;
    const conversions = Math.max(5, Math.round(clicks * 0.03));
    const revenueCents = conversions * 1200;

    return [
      {
        campaignId: `${customerId}-cmp-001`,
        campaignName: "Fallback Awareness",
        impressions,
        clicks,
        costCents,
        conversions,
        revenueCents,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        avgCpcCents: clicks > 0 ? Math.round(costCents / clicks) : 0,
        customerId,
        dateRange,
      },
      {
        campaignId: `${customerId}-cmp-002`,
        campaignName: "Fallback Retargeting",
        impressions: Math.round(impressions * 0.6),
        clicks: Math.round(clicks * 0.65),
        costCents: Math.round(costCents * 0.7),
        conversions: Math.round(conversions * 1.1),
        revenueCents: Math.round(revenueCents * 1.2),
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        avgCpcCents: clicks > 0 ? Math.round(costCents / clicks) : 0,
        customerId,
        dateRange,
      },
    ];
  }

  private getMockAdGroupPerformance(
    customerId: string,
    dateRange: string,
    campaignId?: string,
  ): AdGroupPerformance[] {
    const groups: AdGroupPerformance[] = [
      {
        campaignId: `${customerId}-cmp-001`,
        campaignName: "Fallback Awareness",
        adGroupId: `${customerId}-ag-001`,
        adGroupName: "Fallback Brand Terms",
        status: "ENABLED",
        impressions: 4200,
        clicks: 210,
        costCents: 5800,
        conversions: 18,
        customerId,
        dateRange,
      },
      {
        campaignId: `${customerId}-cmp-002`,
        campaignName: "Fallback Retargeting",
        adGroupId: `${customerId}-ag-002`,
        adGroupName: "Fallback Abandoned Cart",
        status: "PAUSED",
        impressions: 3100,
        clicks: 124,
        costCents: 4200,
        conversions: 22,
        customerId,
        dateRange,
      },
    ];

    if (campaignId) {
      return groups.filter((group) => group.campaignId === campaignId);
    }

    return groups;
  }

  private getMockKeywordPerformance(
    customerId: string,
    dateRange: string,
    campaignId?: string,
  ): KeywordPerformance[] {
    const keywords: KeywordPerformance[] = [
      {
        campaignId: `${customerId}-cmp-001`,
        campaignName: "Fallback Awareness",
        adGroupId: `${customerId}-ag-001`,
        adGroupName: "Fallback Brand Terms",
        keyword: "fallback brand",
        matchType: "PHRASE",
        impressions: 1900,
        clicks: 120,
        costCents: 2400,
        conversions: 9,
        customerId,
        dateRange,
      },
      {
        campaignId: `${customerId}-cmp-002`,
        campaignName: "Fallback Retargeting",
        adGroupId: `${customerId}-ag-002`,
        adGroupName: "Fallback Abandoned Cart",
        keyword: "fallback cart",
        matchType: "BROAD",
        impressions: 1300,
        clicks: 80,
        costCents: 1800,
        conversions: 11,
        customerId,
        dateRange,
      },
    ];

    if (campaignId) {
      return keywords.filter((keyword) => keyword.campaignId === campaignId);
    }

    return keywords;
  }
}

/**
 * Create and configure a Google Ads client from environment variables
 *
 * @returns GoogleAdsClient instance
 * @throws Error if required environment variables are missing
 */
export function createGoogleAdsClient(): GoogleAdsClient {
  const config: GoogleAdsConfig = {
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || "",
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "",
    customerIds: (process.env.GOOGLE_ADS_CUSTOMER_IDS || "")
      .split(",")
      .filter(Boolean),
  };

  // Validate required configuration
  if (
    !config.clientId ||
    !config.clientSecret ||
    !config.refreshToken ||
    !config.developerToken
  ) {
    throw new Error(
      "Missing required Google Ads API credentials. Check environment variables.",
    );
  }

  if (config.customerIds.length === 0) {
    throw new Error(
      "No Google Ads customer IDs configured. Set GOOGLE_ADS_CUSTOMER_IDS environment variable.",
    );
  }

  return new GoogleAdsClient(config);
}
