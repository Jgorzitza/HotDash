/**
 * Google Ads API Stub
 *
 * Feature-flagged stub for Google Ads integration.
 * Provides realistic mock campaign data until real Google Ads API credentials are configured.
 *
 * Feature Flag: ADS_REAL_DATA (default: false)
 * When true: Use real Google Ads API
 * When false: Return mock data with realistic CTR (2-5%) and ROAS (2-4x)
 */

export interface GoogleCampaign {
  id: string;
  name: string;
  status: "active" | "paused" | "archived";
  platform: "google";
  type: "search" | "display" | "shopping" | "video" | "pmax";
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

const MOCK_GOOGLE_CAMPAIGNS: GoogleCampaign[] = [
  {
    id: "google_camp_001",
    name: "Search - Brand Keywords",
    status: "active",
    platform: "google",
    type: "search",
    budgetCents: 400000, // $4,000
    startDate: "2025-10-01",
    metrics: {
      spend_cents: 385000, // $3,850
      impressions: 85000,
      clicks: 4250, // CTR: 5.0% (high for brand keywords)
      conversions: 212, // Conv rate: 4.99%
      revenue_cents: 1540000, // $15,400 → ROAS: 4.0x
    },
  },
  {
    id: "google_camp_002",
    name: "Search - Generic Keywords",
    status: "active",
    platform: "google",
    type: "search",
    budgetCents: 600000, // $6,000
    startDate: "2025-10-05",
    metrics: {
      spend_cents: 575000, // $5,750
      impressions: 180000,
      clicks: 5400, // CTR: 3.0%
      conversions: 162, // Conv rate: 3.0%
      revenue_cents: 1437500, // $14,375 → ROAS: 2.5x
    },
  },
  {
    id: "google_camp_003",
    name: "Shopping - Product Feed",
    status: "active",
    platform: "google",
    type: "shopping",
    budgetCents: 350000, // $3,500
    startDate: "2025-10-08",
    metrics: {
      spend_cents: 325000, // $3,250
      impressions: 95000,
      clicks: 2375, // CTR: 2.5%
      conversions: 95, // Conv rate: 4.0%
      revenue_cents: 975000, // $9,750 → ROAS: 3.0x
    },
  },
  {
    id: "google_camp_004",
    name: "Display - Remarketing",
    status: "active",
    platform: "google",
    type: "display",
    budgetCents: 250000, // $2,500
    startDate: "2025-10-01",
    metrics: {
      spend_cents: 235000, // $2,350
      impressions: 450000,
      clicks: 9000, // CTR: 2.0%
      conversions: 108, // Conv rate: 1.2%
      revenue_cents: 470000, // $4,700 → ROAS: 2.0x
    },
  },
  {
    id: "google_camp_005",
    name: "Performance Max - All Products",
    status: "active",
    platform: "google",
    type: "pmax",
    budgetCents: 500000, // $5,000
    startDate: "2025-10-12",
    metrics: {
      spend_cents: 465000, // $4,650
      impressions: 125000,
      clicks: 3750, // CTR: 3.0%
      conversions: 135, // Conv rate: 3.6%
      revenue_cents: 1627500, // $16,275 → ROAS: 3.5x
    },
  },
  {
    id: "google_camp_006",
    name: "YouTube Video - Product Demo",
    status: "paused",
    platform: "google",
    type: "video",
    budgetCents: 200000, // $2,000
    startDate: "2025-09-20",
    endDate: "2025-10-10",
    metrics: {
      spend_cents: 200000, // $2,000
      impressions: 500000,
      clicks: 5000, // CTR: 1.0% (lower for video)
      conversions: 50, // Conv rate: 1.0%
      revenue_cents: 400000, // $4,000 → ROAS: 2.0x
    },
  },
];

export interface GoogleAdsOptions {
  useRealData?: boolean; // Override for ADS_REAL_DATA feature flag
  developerToken?: string; // Google Ads developer token
  clientCustomerId?: string; // Google Ads client customer ID
  refreshToken?: string; // OAuth refresh token
}

/**
 * Fetch campaigns from Google Ads API or stub
 */
export async function getGoogleCampaigns(
  options: GoogleAdsOptions = {},
): Promise<GoogleCampaign[]> {
  const useRealData =
    options.useRealData ?? process.env.ADS_REAL_DATA === "true";

  if (useRealData) {
    // TODO: Implement real Google Ads API integration
    // Requires: developer_token, client_customer_id, OAuth credentials
    // API: https://developers.google.com/google-ads/api/docs/start
    throw new Error(
      "Google Ads API integration not yet implemented. Set ADS_REAL_DATA=false to use mock data.",
    );
  }

  // Return mock data
  return MOCK_GOOGLE_CAMPAIGNS;
}

/**
 * Get daily metrics for a specific campaign
 */
export async function getGoogleCampaignMetrics(
  campaignId: string,
  dateRange: { start: Date; end: Date },
  options: GoogleAdsOptions = {},
): Promise<GoogleCampaign["metrics"] | null> {
  const useRealData =
    options.useRealData ?? process.env.ADS_REAL_DATA === "true";

  if (useRealData) {
    throw new Error(
      "Google Ads API integration not yet implemented. Set ADS_REAL_DATA=false to use mock data.",
    );
  }

  // Find campaign in mock data
  const campaign = MOCK_GOOGLE_CAMPAIGNS.find((c) => c.id === campaignId);
  return campaign?.metrics ?? null;
}
