/**
 * Ads ROAS (Return on Ad Spend) Calculator
 * 
 * Calculates ROAS for ad campaigns
 * Tracks campaign performance metrics
 * Identifies best and worst performing campaigns
 * Stores in DashboardFact table with factType="ads_roas"
 */

import prisma from "~/db.server";

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  platform: "google" | "meta" | "bing" | "other";
  spend: number;
  revenue: number;
  roas: number; // Revenue / Spend
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  conversionRate: number; // Conversions / Clicks
  costPerConversion: number; // Spend / Conversions
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
export async function calculateCampaignROAS(
  campaignId: string,
  campaignName: string,
  platform: CampaignPerformance["platform"],
  spend: number,
  revenue: number,
  impressions: number,
  clicks: number,
  conversions: number,
  shopDomain: string = "occ"
): Promise<AdsROASData> {
  // Calculate metrics
  const roas = spend > 0 ? revenue / spend : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const costPerConversion = conversions > 0 ? spend / conversions : 0;

  const performance: CampaignPerformance = {
    campaignId,
    campaignName,
    platform,
    spend,
    revenue,
    roas: Number(roas.toFixed(2)),
    impressions,
    clicks,
    conversions,
    ctr: Number(ctr.toFixed(2)),
    conversionRate: Number(conversionRate.toFixed(2)),
    costPerConversion: Number(costPerConversion.toFixed(2)),
  };

  // Determine status
  const status = determineStatus(roas);
  const recommendation = generateRecommendation(performance);

  // Store in DashboardFact
  await prisma.dashboardFact.create({
    data: {
      shopDomain,
      factType: "ads_roas",
      scope: platform,
      value: {
        campaignId,
        campaignName,
        ...performance,
        status,
        recommendation,
      },
      metadata: {
        trackedAt: new Date().toISOString(),
        platform,
      },
    },
  });

  return {
    campaignId,
    performance,
    status,
    recommendation,
  };
}

/**
 * Determine campaign status based on ROAS
 */
function determineStatus(
  roas: number
): "profitable" | "break-even" | "unprofitable" {
  if (roas > 2.0) return "profitable"; // Making money
  if (roas >= 1.0) return "break-even"; // Recovering costs
  return "unprofitable"; // Losing money
}

/**
 * Generate actionable recommendation based on performance
 */
function generateRecommendation(performance: CampaignPerformance): string {
  const { roas, ctr, conversionRate, costPerConversion } = performance;

  if (roas > 3.0) {
    return "Excellent ROAS! Consider increasing budget to scale.";
  }

  if (roas > 2.0) {
    return "Strong ROAS. Maintain current strategy or test optimization.";
  }

  if (roas >= 1.0 && roas <= 2.0) {
    if (ctr < 1.0) {
      return "Low CTR detected. Review ad creative and targeting.";
    }
    if (conversionRate < 2.0) {
      return "Low conversion rate. Optimize landing pages and offers.";
    }
    return "Break-even ROAS. Test improvements to ad copy and targeting.";
  }

  if (costPerConversion > 50) {
    return "High cost per conversion. Review targeting and bidding strategy.";
  }

  return "Unprofitable ROAS. Consider pausing campaign and reviewing strategy.";
}

/**
 * Get ROAS summary across all campaigns
 */
export async function getROASSummary(
  shopDomain: string = "occ",
  platform?: string,
  days: number = 30
): Promise<ROASSummary> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const campaigns = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: "ads_roas",
      ...(platform && { scope: platform }),
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (campaigns.length === 0) {
    return {
      totalSpend: 0,
      totalRevenue: 0,
      overallROAS: 0,
      campaignCount: 0,
      profitableCampaigns: 0,
      unprofitableCampaigns: 0,
      bestPerformers: [],
      worstPerformers: [],
    };
  }

  // Get latest data for each campaign
  const campaignMap = new Map<string, any>();
  for (const campaign of campaigns) {
    const value = campaign.value as any;
    const campaignId = value.campaignId;

    if (!campaignMap.has(campaignId)) {
      campaignMap.set(campaignId, value);
    }
  }

  const latestCampaigns = Array.from(campaignMap.values());

  // Calculate totals
  const totals = latestCampaigns.reduce(
    (acc, campaign) => ({
      spend: acc.spend + (campaign.spend || 0),
      revenue: acc.revenue + (campaign.revenue || 0),
    }),
    { spend: 0, revenue: 0 }
  );

  const overallROAS = totals.spend > 0
    ? Number((totals.revenue / totals.spend).toFixed(2))
    : 0;

  const profitableCampaigns = latestCampaigns.filter(
    (c) => c.status === "profitable"
  ).length;

  const unprofitableCampaigns = latestCampaigns.filter(
    (c) => c.status === "unprofitable"
  ).length;

  // Get best performers (top 5 by ROAS)
  const bestPerformers = latestCampaigns
    .filter((c) => c.roas > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 5)
    .map((c) => ({
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      roas: c.roas,
    }));

  // Get worst performers (bottom 5 by ROAS)
  const worstPerformers = latestCampaigns
    .filter((c) => c.roas >= 0)
    .sort((a, b) => a.roas - b.roas)
    .slice(0, 5)
    .map((c) => ({
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      roas: c.roas,
    }));

  return {
    totalSpend: totals.spend,
    totalRevenue: totals.revenue,
    overallROAS,
    campaignCount: latestCampaigns.length,
    profitableCampaigns,
    unprofitableCampaigns,
    bestPerformers,
    worstPerformers,
  };
}

/**
 * Get detailed performance for a specific campaign
 */
export async function getCampaignPerformance(
  campaignId: string,
  shopDomain: string = "occ",
  days: number = 90
): Promise<Array<{
  date: Date;
  roas: number;
  spend: number;
  revenue: number;
  status: string;
}>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const history = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: "ads_roas",
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return history
    .filter((record) => {
      const value = record.value as any;
      return value.campaignId === campaignId;
    })
    .map((record) => {
      const value = record.value as any;
      return {
        date: record.createdAt,
        roas: value.roas || 0,
        spend: value.spend || 0,
        revenue: value.revenue || 0,
        status: value.status || "unknown",
      };
    });
}

/**
 * Compare campaigns by performance metrics
 */
export async function compareCampaigns(
  campaignIds: string[],
  shopDomain: string = "occ"
): Promise<
  Array<{
    campaignId: string;
    campaignName: string;
    roas: number;
    spend: number;
    revenue: number;
    conversions: number;
    rank: number;
  }>
> {
  const campaigns = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: "ads_roas",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get latest data for requested campaigns
  const campaignMap = new Map<string, any>();
  for (const campaign of campaigns) {
    const value = campaign.value as any;
    const campaignId = value.campaignId;

    if (campaignIds.includes(campaignId) && !campaignMap.has(campaignId)) {
      campaignMap.set(campaignId, value);
    }
  }

  // Sort by ROAS and assign ranks
  const sorted = Array.from(campaignMap.values())
    .map((c) => ({
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      roas: c.roas,
      spend: c.spend,
      revenue: c.revenue,
      conversions: c.conversions,
      rank: 0,
    }))
    .sort((a, b) => b.roas - a.roas);

  // Assign ranks
  return sorted.map((campaign, index) => ({
    ...campaign,
    rank: index + 1,
  }));
}

