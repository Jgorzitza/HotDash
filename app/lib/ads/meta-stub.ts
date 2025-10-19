/**
 * Meta (Facebook/Instagram) Data Source Stub
 *
 * Stub implementation until Meta API credentials are approved
 * Documents real API requirements for future implementation
 *
 * @module app/lib/ads/meta-stub
 *
 * @see https://developers.facebook.com/docs/marketing-apis
 * @see https://developers.facebook.com/docs/marketing-api/reference/ad-campaign
 */

import type { MetaCampaign, CampaignMetrics } from "./types";
import { AdPlatform, CampaignStatus } from "./types";

/**
 * Meta API Requirements Documentation
 *
 * **Authentication:**
 * - App ID and App Secret from Meta for Developers
 * - User Access Token (short-lived or long-lived)
 * - System User Access Token (recommended for server-to-server)
 *
 * **Required Permissions:**
 * - ads_read: Read ad account data
 * - ads_management: Create and modify campaigns
 * - business_management: Access business-level data
 *
 * **OAuth Flow:**
 * 1. Redirect user to Facebook OAuth dialog
 * 2. User authorizes app and grants permissions
 * 3. Exchange authorization code for access token
 * 4. Exchange short-lived token for long-lived token (60 days)
 *
 * **API Endpoints:**
 * - GET /v18.0/{ad_account_id}/campaigns
 * - GET /v18.0/{campaign_id}/insights
 * - POST /v18.0/{ad_account_id}/campaigns
 * - POST /v18.0/{campaign_id}
 *
 * **Rate Limits:**
 * - 200 calls per hour per user
 * - Additional limits based on ad account spend
 */

const STUB_MODE = true;

/**
 * Mock Meta campaigns for testing
 */
const MOCK_CAMPAIGNS: MetaCampaign[] = [
  {
    id: "meta-campaign-1",
    name: "Summer Sale - Facebook/Instagram",
    platform: AdPlatform.META,
    status: CampaignStatus.ACTIVE,
    startDate: "2025-06-01T00:00:00Z",
    endDate: "2025-06-30T23:59:59Z",
    dailyBudget: 150,
    totalBudget: 4500,
    metrics: {
      spend: 2100,
      revenue: 9450,
      impressions: 125000,
      clicks: 3750,
      conversions: 189,
      roas: 4.5,
      cpc: 0.56,
      cpa: 11.11,
      ctr: 3.0,
      conversionRate: 5.04,
    },
    createdAt: "2025-05-15T10:00:00Z",
    updatedAt: "2025-06-15T14:30:00Z",
    metaCampaignId: "23849567123456789",
    adAccountId: "act_1234567890",
    objective: "CONVERSIONS",
    audienceIds: ["23851234567890123", "23851234567890124"],
    placements: ["facebook", "instagram", "messenger"],
  },
  {
    id: "meta-campaign-2",
    name: "Brand Awareness - Feed Only",
    platform: AdPlatform.META,
    status: CampaignStatus.ACTIVE,
    startDate: "2025-05-01T00:00:00Z",
    dailyBudget: 75,
    totalBudget: 0,
    metrics: {
      spend: 3225,
      revenue: 6450,
      impressions: 450000,
      clicks: 9000,
      conversions: 135,
      roas: 2.0,
      cpc: 0.36,
      cpa: 23.89,
      ctr: 2.0,
      conversionRate: 1.5,
    },
    createdAt: "2025-04-15T09:00:00Z",
    updatedAt: "2025-06-18T16:20:00Z",
    metaCampaignId: "23849567123456790",
    adAccountId: "act_1234567890",
    objective: "REACH",
    audienceIds: ["23851234567890125"],
    placements: ["facebook"],
  },
];

/**
 * Fetch Meta campaigns (stub implementation)
 *
 * @param adAccountId - Meta ad account ID
 * @returns Array of Meta campaigns
 */
export async function fetchMetaCampaigns(
  _adAccountId?: string,
): Promise<MetaCampaign[]> {
  if (STUB_MODE) {
    // Stub: return mock data
    return Promise.resolve(MOCK_CAMPAIGNS);
  }

  // Real implementation would be:
  // const response = await fetch(
  //   `https://graph.facebook.com/v18.0/${adAccountId}/campaigns`,
  //   {
  //     headers: {
  //       'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
  //     },
  //   }
  // );
  // return response.json();

  throw new Error(
    "Meta API not configured. Set META_ACCESS_TOKEN environment variable.",
  );
}

/**
 * Fetch campaign insights/metrics (stub implementation)
 *
 * @param campaignId - Meta campaign ID
 * @returns Campaign metrics
 */
export async function fetchMetaCampaignMetrics(
  campaignId: string,
): Promise<CampaignMetrics> {
  if (STUB_MODE) {
    // Stub: find mock campaign and return metrics
    const campaign = MOCK_CAMPAIGNS.find(
      (c) => c.metaCampaignId === campaignId,
    );
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found in stub data`);
    }
    return Promise.resolve(campaign.metrics);
  }

  // Real implementation would be:
  // const response = await fetch(
  //   `https://graph.facebook.com/v18.0/${campaignId}/insights`,
  //   {
  //     headers: {
  //       'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
  //     },
  //     params: {
  //       fields: 'spend,impressions,clicks,actions,purchase_roas',
  //       time_range: JSON.stringify({ since: '2025-06-01', until: '2025-06-15' }),
  //     },
  //   }
  // );
  // return transformMetaInsightsToMetrics(response.json());

  throw new Error("Meta API not configured.");
}

/**
 * Create Meta campaign (stub implementation)
 *
 * @param campaign - Campaign data
 * @returns Created campaign
 */
export async function createMetaCampaign(
  campaign: Partial<MetaCampaign>,
): Promise<MetaCampaign> {
  if (STUB_MODE) {
    // Stub: create mock campaign
    const newCampaign: MetaCampaign = {
      id: `meta-campaign-stub-${Date.now()}`,
      name: campaign.name || "Untitled Campaign",
      platform: AdPlatform.META,
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
      metaCampaignId: `stub-${Math.random().toString(36).substr(2, 16)}`,
      adAccountId: campaign.adAccountId || "act_stub",
      objective: campaign.objective || "CONVERSIONS",
      audienceIds: campaign.audienceIds || [],
      placements: campaign.placements || ["facebook", "instagram"],
    };

    return Promise.resolve(newCampaign);
  }

  // Real implementation would be:
  // const response = await fetch(
  //   `https://graph.facebook.com/v18.0/${campaign.adAccountId}/campaigns`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       name: campaign.name,
  //       objective: campaign.objective,
  //       status: 'PAUSED',
  //       daily_budget: campaign.dailyBudget * 100, // cents
  //     }),
  //   }
  // );
  // return transformMetaResponse(response.json());

  throw new Error("Meta API not configured.");
}

/**
 * Check Meta API health (stub implementation)
 *
 * @returns Health status
 */
export async function checkMetaHealth(): Promise<{
  status: "ok" | "error";
  mode: "stub" | "real";
  message: string;
}> {
  if (STUB_MODE) {
    return {
      status: "ok",
      mode: "stub",
      message: "Meta stub mode active. Real API requires META_ACCESS_TOKEN.",
    };
  }

  // Real implementation would check token validity
  if (!process.env.META_ACCESS_TOKEN) {
    return {
      status: "error",
      mode: "real",
      message: "META_ACCESS_TOKEN environment variable not set",
    };
  }

  return {
    status: "ok",
    mode: "real",
    message: "Meta API configured with access token",
  };
}
