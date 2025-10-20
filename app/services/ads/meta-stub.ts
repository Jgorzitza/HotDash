/**
 * Meta Ads API Stub
 *
 * Feature-flagged stub for Meta (Facebook/Instagram) ads integration.
 * Provides realistic mock campaign data until real Meta API credentials are configured.
 *
 * Feature Flag: ADS_REAL_DATA (default: false)
 * When true: Use real Meta Marketing API
 * When false: Return mock data with realistic CTR (2-5%) and ROAS (2-4x)
 */

export interface MetaCampaign {
  id: string;
  name: string;
  status: "active" | "paused" | "archived";
  platform: "meta";
  objective: "traffic" | "conversions" | "engagement" | "awareness";
  budgetCents: number;
  startDate: string;
  endDate?: string;
  metrics: {
    spend_cents: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue_cents: number;
  };
}

const MOCK_META_CAMPAIGNS: MetaCampaign[] = [
  {
    id: "meta_camp_001",
    name: "Spring Sale 2025 - Facebook Feed",
    status: "active",
    platform: "meta",
    objective: "conversions",
    budgetCents: 500000, // $5,000
    startDate: "2025-10-01",
    metrics: {
      spend_cents: 425000, // $4,250
      impressions: 125000,
      clicks: 4500, // CTR: 3.6%
      conversions: 180, // Conv rate: 4%
      revenue_cents: 1275000, // $12,750 → ROAS: 3.0x
    },
  },
  {
    id: "meta_camp_002",
    name: "Product Launch - Instagram Stories",
    status: "active",
    platform: "meta",
    objective: "conversions",
    budgetCents: 300000, // $3,000
    startDate: "2025-10-10",
    metrics: {
      spend_cents: 287500, // $2,875
      impressions: 98000,
      clicks: 2450, // CTR: 2.5%
      conversions: 92, // Conv rate: 3.76%
      revenue_cents: 690000, // $6,900 → ROAS: 2.4x
    },
  },
  {
    id: "meta_camp_003",
    name: "Retargeting - All Visitors",
    status: "active",
    platform: "meta",
    objective: "conversions",
    budgetCents: 200000, // $2,000
    startDate: "2025-10-05",
    metrics: {
      spend_cents: 195000, // $1,950
      impressions: 65000,
      clicks: 3250, // CTR: 5.0% (higher for retargeting)
      conversions: 145, // Conv rate: 4.46%
      revenue_cents: 780000, // $7,800 → ROAS: 4.0x
    },
  },
  {
    id: "meta_camp_004",
    name: "Brand Awareness - Carousel",
    status: "paused",
    platform: "meta",
    objective: "awareness",
    budgetCents: 150000, // $1,500
    startDate: "2025-09-15",
    endDate: "2025-10-15",
    metrics: {
      spend_cents: 150000, // $1,500 (spent full budget)
      impressions: 200000,
      clicks: 4000, // CTR: 2.0%
      conversions: 40, // Conv rate: 1.0% (lower for awareness)
      revenue_cents: 300000, // $3,000 → ROAS: 2.0x
    },
  },
];

export interface MetaAdsOptions {
  useRealData?: boolean; // Override for ADS_REAL_DATA feature flag
  accessToken?: string; // Meta Marketing API access token
  adAccountId?: string; // Meta ad account ID
}

/**
 * Fetch campaigns from Meta Ads API or stub
 */
export async function getMetaCampaigns(
  options: MetaAdsOptions = {},
): Promise<MetaCampaign[]> {
  const useRealData =
    options.useRealData ?? process.env.ADS_REAL_DATA === "true";

  if (useRealData) {
    // TODO: Implement real Meta Marketing API integration
    // Requires: access_token, ad_account_id, permissions
    // API: https://developers.facebook.com/docs/marketing-api/
    throw new Error(
      "Meta Marketing API integration not yet implemented. Set ADS_REAL_DATA=false to use mock data.",
    );
  }

  // Return mock data
  return MOCK_META_CAMPAIGNS;
}

/**
 * Get daily metrics for a specific campaign
 */
export async function getMetaCampaignMetrics(
  campaignId: string,
  dateRange: { start: Date; end: Date },
  options: MetaAdsOptions = {},
): Promise<MetaCampaign["metrics"] | null> {
  const useRealData =
    options.useRealData ?? process.env.ADS_REAL_DATA === "true";

  if (useRealData) {
    throw new Error(
      "Meta Marketing API integration not yet implemented. Set ADS_REAL_DATA=false to use mock data.",
    );
  }

  // Find campaign in mock data
  const campaign = MOCK_META_CAMPAIGNS.find((c) => c.id === campaignId);
  return campaign?.metrics ?? null;
}
