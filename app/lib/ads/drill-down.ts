/**
 * Campaign Drill-Down
 * 
 * Purpose: Hierarchical drill-down from campaign → adset → ad
 * Owner: ads agent
 * Date: 2025-10-15
 * 
 * Features:
 * - Campaign hierarchy navigation
 * - Performance at each level
 * - Drill-down analysis
 * - Top/bottom performers identification
 */

import type { AdPlatform } from './tracking';

/**
 * Ad level metrics
 */
export interface AdMetrics {
  adId: string;
  adName: string;
  adSetId: string;
  creativeId?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  adSpend: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

/**
 * AdSet level metrics
 */
export interface AdSetMetrics {
  adSetId: string;
  adSetName: string;
  campaignId: string;
  targetingType?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  adSpend: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  ads: AdMetrics[];
}

/**
 * Campaign hierarchy
 */
export interface CampaignHierarchy {
  campaignId: string;
  campaignName: string;
  platform: AdPlatform;
  impressions: number;
  clicks: number;
  conversions: number;
  adSpend: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  adSets: AdSetMetrics[];
}

/**
 * Drill-down analysis
 */
export interface DrillDownAnalysis {
  level: 'campaign' | 'adset' | 'ad';
  topPerformers: Array<AdMetrics | AdSetMetrics | CampaignHierarchy>;
  bottomPerformers: Array<AdMetrics | AdSetMetrics | CampaignHierarchy>;
  averageRoas: number;
  totalSpend: number;
  totalRevenue: number;
}

/**
 * Build campaign hierarchy
 * 
 * @param campaignId - Campaign ID
 * @param campaignName - Campaign name
 * @param platform - Ad platform
 * @param adSets - Array of ad sets with ads
 * @returns Complete campaign hierarchy
 */
export function buildCampaignHierarchy(
  campaignId: string,
  campaignName: string,
  platform: AdPlatform,
  adSets: AdSetMetrics[]
): CampaignHierarchy {
  // Aggregate metrics from ad sets
  const impressions = adSets.reduce((sum, as) => sum + as.impressions, 0);
  const clicks = adSets.reduce((sum, as) => sum + as.clicks, 0);
  const conversions = adSets.reduce((sum, as) => sum + as.conversions, 0);
  const adSpend = adSets.reduce((sum, as) => sum + as.adSpend, 0);
  const revenue = adSets.reduce((sum, as) => sum + as.revenue, 0);

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? adSpend / clicks : 0;
  const cpa = conversions > 0 ? adSpend / conversions : 0;
  const roas = adSpend > 0 ? revenue / adSpend : 0;

  return {
    campaignId,
    campaignName,
    platform,
    impressions,
    clicks,
    conversions,
    adSpend,
    revenue,
    ctr,
    cpc,
    cpa,
    roas,
    adSets,
  };
}

/**
 * Analyze campaign drill-down
 * 
 * @param hierarchy - Campaign hierarchy
 * @param level - Level to analyze
 * @param limit - Number of top/bottom performers to return
 * @returns Drill-down analysis
 */
export function analyzeDrillDown(
  hierarchy: CampaignHierarchy,
  level: 'campaign' | 'adset' | 'ad',
  limit: number = 5
): DrillDownAnalysis {
  let items: Array<AdMetrics | AdSetMetrics | CampaignHierarchy> = [];

  if (level === 'campaign') {
    items = [hierarchy];
  } else if (level === 'adset') {
    items = hierarchy.adSets;
  } else {
    items = hierarchy.adSets.flatMap(as => as.ads);
  }

  // Sort by ROAS
  const sorted = [...items].sort((a, b) => b.roas - a.roas);

  const topPerformers = sorted.slice(0, limit);
  const bottomPerformers = sorted.slice(-limit).reverse();

  const totalSpend = items.reduce((sum, item) => sum + item.adSpend, 0);
  const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
  const averageRoas = items.length > 0
    ? items.reduce((sum, item) => sum + item.roas, 0) / items.length
    : 0;

  return {
    level,
    topPerformers,
    bottomPerformers,
    averageRoas,
    totalSpend,
    totalRevenue,
  };
}

/**
 * Find underperforming ads in campaign
 * 
 * @param hierarchy - Campaign hierarchy
 * @param roasThreshold - Minimum acceptable ROAS
 * @returns Array of underperforming ads
 */
export function findUnderperformingAds(
  hierarchy: CampaignHierarchy,
  roasThreshold: number = 2.0
): AdMetrics[] {
  const allAds = hierarchy.adSets.flatMap(as => as.ads);
  return allAds.filter(ad => ad.roas < roasThreshold);
}

/**
 * Find top performing ad sets
 * 
 * @param hierarchy - Campaign hierarchy
 * @param limit - Number of top performers to return
 * @returns Array of top performing ad sets
 */
export function findTopAdSets(
  hierarchy: CampaignHierarchy,
  limit: number = 5
): AdSetMetrics[] {
  return [...hierarchy.adSets]
    .sort((a, b) => b.roas - a.roas)
    .slice(0, limit);
}

/**
 * Calculate ad set contribution to campaign
 * 
 * @param adSet - Ad set metrics
 * @param campaign - Campaign hierarchy
 * @returns Contribution percentage
 */
export function calculateAdSetContribution(
  adSet: AdSetMetrics,
  campaign: CampaignHierarchy
): {
  spendPercent: number;
  revenuePercent: number;
  conversionsPercent: number;
} {
  return {
    spendPercent: campaign.adSpend > 0 ? (adSet.adSpend / campaign.adSpend) * 100 : 0,
    revenuePercent: campaign.revenue > 0 ? (adSet.revenue / campaign.revenue) * 100 : 0,
    conversionsPercent: campaign.conversions > 0 ? (adSet.conversions / campaign.conversions) * 100 : 0,
  };
}

/**
 * Get drill-down path
 * 
 * @param campaignId - Campaign ID
 * @param adSetId - Optional ad set ID
 * @param adId - Optional ad ID
 * @returns Breadcrumb path
 */
export function getDrillDownPath(
  campaignId: string,
  adSetId?: string,
  adId?: string
): string[] {
  const path = [campaignId];
  if (adSetId) path.push(adSetId);
  if (adId) path.push(adId);
  return path;
}

