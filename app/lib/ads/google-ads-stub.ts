/**
 * Google Ads Data Source Stub
 *
 * Stub implementation until Google Ads OAuth is configured
 * Documents real API requirements for future implementation
 *
 * @module app/lib/ads/google-ads-stub
 *
 * @see https://developers.google.com/google-ads/api/docs/start
 * @see https://developers.google.com/google-ads/api/rest/overview
 */

import type { GoogleCampaign, CampaignMetrics } from "./types";
import { AdPlatform, CampaignStatus } from "./types";

/**
 * Google Ads API Requirements Documentation
 *
 * **Authentication (OAuth 2.0):**
 * - Client ID and Client Secret from Google Cloud Console
 * - Refresh Token (obtained through OAuth flow)
 * - Developer Token (from Google Ads account)
 *
 * **Required Scopes:**
 * - https://www.googleapis.com/auth/adwords
 *
 * **OAuth Flow:**
 * 1. Generate authorization URL with client ID and redirect URI
 * 2. User authorizes app and grants permissions
 * 3. Exchange authorization code for access token and refresh token
 * 4. Store refresh token securely for long-term access
 * 5. Use refresh token to obtain new access tokens (expires in 1 hour)
 *
 * **API Endpoints:**
 * - POST /v15/customers/{customer_id}/googleAds:searchStream
 * - POST /v15/customers/{customer_id}/campaigns:mutate
 * - GET /v15/customers/{customer_id}/campaigns/{campaign_id}
 *
 * **Rate Limits:**
 * - 15,000 operations per day (basic access)
 * - Higher limits available with standard access
 *
 * **Required Headers:**
 * - developer-token: Your Google Ads developer token
 * - login-customer-id: Manager account ID (if applicable)
 * - Authorization: Bearer {access_token}
 */

const STUB_MODE = true;

/**
 * Mock Google Ads campaigns for testing
 */
const MOCK_CAMPAIGNS: GoogleCampaign[] = [
  {
    id: "google-campaign-1",
    name: "Search - Hot Rod Parts",
    platform: AdPlatform.GOOGLE,
    status: CampaignStatus.ACTIVE,
    startDate: "2025-06-01T00:00:00Z",
    endDate: "2025-06-30T23:59:59Z",
    dailyBudget: 200,
    totalBudget: 6000,
    metrics: {
      spend: 2800,
      revenue: 16800,
      impressions: 85000,
      clicks: 2125,
      conversions: 168,
      roas: 6.0,
      cpc: 1.32,
      cpa: 16.67,
      ctr: 2.5,
      conversionRate: 7.91,
    },
    createdAt: "2025-05-15T11:00:00Z",
    updatedAt: "2025-06-15T15:45:00Z",
    googleCampaignId: "12345678901",
    customerId: "9876543210",
    campaignType: "SEARCH",
    biddingStrategy: "TARGET_CPA",
    keywords: [
      "hot rod parts",
      "custom car parts",
      "performance parts",
      "vintage car restoration",
    ],
  },
  {
    id: "google-campaign-2",
    name: "Display - Retargeting",
    platform: AdPlatform.GOOGLE,
    status: CampaignStatus.ACTIVE,
    startDate: "2025-05-15T00:00:00Z",
    dailyBudget: 100,
    totalBudget: 0,
    metrics: {
      spend: 3400,
      revenue: 8160,
      impressions: 425000,
      clicks: 8500,
      conversions: 102,
      roas: 2.4,
      cpc: 0.4,
      cpa: 33.33,
      ctr: 2.0,
      conversionRate: 1.2,
    },
    createdAt: "2025-05-01T10:00:00Z",
    updatedAt: "2025-06-18T17:10:00Z",
    googleCampaignId: "12345678902",
    customerId: "9876543210",
    campaignType: "DISPLAY",
    biddingStrategy: "TARGET_ROAS",
    keywords: [],
  },
];

/**
 * Fetch Google Ads campaigns (stub implementation)
 *
 * @param customerId - Google Ads customer ID
 * @returns Array of Google campaigns
 */
export async function fetchGoogleCampaigns(
  _customerId?: string,
): Promise<GoogleCampaign[]> {
  if (STUB_MODE) {
    // Stub: return mock data
    return Promise.resolve(MOCK_CAMPAIGNS);
  }

  // Real implementation would be:
  // const response = await fetch(
  //   `https://googleads.googleapis.com/v15/customers/${customerId}/googleAds:searchStream`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${accessToken}`,
  //       'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       query: `
  //         SELECT
  //           campaign.id,
  //           campaign.name,
  //           campaign.status,
  //           campaign.bidding_strategy_type,
  //           metrics.cost_micros,
  //           metrics.impressions,
  //           metrics.clicks,
  //           metrics.conversions
  //         FROM campaign
  //         WHERE campaign.status != 'REMOVED'
  //       `,
  //     }),
  //   }
  // );
  // return transformGoogleResponse(response.json());

  throw new Error(
    "Google Ads API not configured. Set GOOGLE_ADS_* environment variables.",
  );
}

/**
 * Fetch campaign metrics (stub implementation)
 *
 * @param campaignId - Google campaign ID
 * @returns Campaign metrics
 */
export async function fetchGoogleCampaignMetrics(
  campaignId: string,
): Promise<CampaignMetrics> {
  if (STUB_MODE) {
    // Stub: find mock campaign and return metrics
    const campaign = MOCK_CAMPAIGNS.find(
      (c) => c.googleCampaignId === campaignId,
    );
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found in stub data`);
    }
    return Promise.resolve(campaign.metrics);
  }

  // Real implementation would use searchStream with specific campaign filter
  throw new Error("Google Ads API not configured.");
}

/**
 * Create Google Ads campaign (stub implementation)
 *
 * @param campaign - Campaign data
 * @returns Created campaign
 */
export async function createGoogleCampaign(
  campaign: Partial<GoogleCampaign>,
): Promise<GoogleCampaign> {
  if (STUB_MODE) {
    // Stub: create mock campaign
    const newCampaign: GoogleCampaign = {
      id: `google-campaign-stub-${Date.now()}`,
      name: campaign.name || "Untitled Campaign",
      platform: AdPlatform.GOOGLE,
      status: CampaignStatus.DRAFT,
      startDate: campaign.startDate || new Date().toISOString(),
      dailyBudget: campaign.dailyBudget || 0,
      totalBudget: campaign.totalBudget || 0,
      metrics: {
        spend: 0,
        revenue: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        roas: 0,
        cpc: 0,
        cpa: 0,
        ctr: 0,
        conversionRate: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      googleCampaignId: `stub-${Math.random().toString(36).substr(2, 11)}`,
      customerId: campaign.customerId || "stub-customer",
      campaignType: campaign.campaignType || "SEARCH",
      biddingStrategy: campaign.biddingStrategy || "MAXIMIZE_CONVERSIONS",
      keywords: campaign.keywords || [],
    };

    return Promise.resolve(newCampaign);
  }

  // Real implementation would be:
  // const response = await fetch(
  //   `https://googleads.googleapis.com/v15/customers/${campaign.customerId}/campaigns:mutate`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${accessToken}`,
  //       'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       operations: [{
  //         create: {
  //           name: campaign.name,
  //           status: 'PAUSED',
  //           advertising_channel_type: campaign.campaignType,
  //           campaign_budget: {
  //             amount_micros: campaign.dailyBudget * 1000000,
  //           },
  //         },
  //       }],
  //     }),
  //   }
  // );
  // return transformGoogleCampaignResponse(response.json());

  throw new Error("Google Ads API not configured.");
}

/**
 * Check Google Ads API health (stub implementation)
 *
 * @returns Health status
 */
export async function checkGoogleAdsHealth(): Promise<{
  status: "ok" | "error";
  mode: "stub" | "real";
  message: string;
}> {
  if (STUB_MODE) {
    return {
      status: "ok",
      mode: "stub",
      message: "Google Ads stub mode active. Real API requires OAuth setup.",
    };
  }

  // Real implementation would check OAuth credentials
  if (
    !process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
    !process.env.GOOGLE_ADS_REFRESH_TOKEN
  ) {
    return {
      status: "error",
      mode: "real",
      message: "Google Ads API credentials not configured",
    };
  }

  return {
    status: "ok",
    mode: "real",
    message: "Google Ads API configured with OAuth credentials",
  };
}
