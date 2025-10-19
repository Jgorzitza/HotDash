/**
 * Metrics Service
 *
 * Business logic for campaign metrics aggregation and analysis
 *
 * @module app/services/ads/metrics.service
 */

import type { Campaign, CampaignDailySnapshot } from "~/lib/ads";
import {
  calculateCampaignImpact,
  calculateAggregateImpact,
  storeCampaignMetrics,
  batchStoreCampaignMetrics,
  AdPlatform,
} from "~/lib/ads";
import { AdsFeatureFlags } from "~/config/ads.server";

/**
 * Calculate and store daily metrics for all campaigns
 *
 * @param campaigns - List of campaigns
 * @param date - Target date (YYYY-MM-DD)
 * @returns Storage result
 */
export async function processDailyMetrics(
  campaigns: Campaign[],
  date: string,
): Promise<{
  success: boolean;
  processed: number;
  stored: number;
  failed: number;
  errors: string[];
}> {
  // Calculate snapshots for all campaigns
  const snapshots: CampaignDailySnapshot[] = campaigns.map((campaign) =>
    calculateCampaignImpact(campaign, date),
  );

  // Store to Supabase if enabled
  if (AdsFeatureFlags.metricsStorageEnabled) {
    const result = await batchStoreCampaignMetrics(snapshots);
    return {
      success: result.success,
      processed: snapshots.length,
      stored: result.stored,
      failed: result.failed,
      errors: result.errors,
    };
  }

  // Stub mode: just return success
  return {
    success: true,
    processed: snapshots.length,
    stored: 0,
    failed: 0,
    errors: [],
  };
}

/**
 * Get aggregate metrics for date range
 *
 * @param campaigns - List of campaigns
 * @param startDate - Range start (YYYY-MM-DD)
 * @param endDate - Range end (YYYY-MM-DD)
 * @returns Aggregate metrics by date
 */
export async function getAggregateMetricsByDateRange(
  campaigns: Campaign[],
  startDate: string,
  endDate: string,
): Promise<
  Array<{
    date: string;
    totalSpend: number;
    totalRevenue: number;
    averageROAS: number;
    averageCPC: number;
    totalClicks: number;
    totalImpressions: number;
    totalConversions: number;
    campaignCount: number;
  }>
> {
  // Generate date range
  const dates = generateDateRange(startDate, endDate);

  // Calculate aggregate for each date
  return dates.map((date) => ({
    date,
    ...calculateAggregateImpact(campaigns, date),
  }));
}

/**
 * Get platform breakdown
 *
 * @param campaigns - List of campaigns
 * @returns Metrics grouped by platform
 */
export function getPlatformBreakdown(campaigns: Campaign[]): {
  meta: {
    count: number;
    totalSpend: number;
    totalRevenue: number;
    averageROAS: number;
  };
  google: {
    count: number;
    totalSpend: number;
    totalRevenue: number;
    averageROAS: number;
  };
} {
  const metaCampaigns = campaigns.filter((c) => c.platform === AdPlatform.META);
  const googleCampaigns = campaigns.filter(
    (c) => c.platform === AdPlatform.GOOGLE,
  );

  const metaMetrics = calculatePlatformMetrics(metaCampaigns);
  const googleMetrics = calculatePlatformMetrics(googleCampaigns);

  return {
    meta: metaMetrics,
    google: googleMetrics,
  };
}

/**
 * Calculate metrics for a platform
 */
function calculatePlatformMetrics(campaigns: Campaign[]): {
  count: number;
  totalSpend: number;
  totalRevenue: number;
  averageROAS: number;
} {
  if (campaigns.length === 0) {
    return {
      count: 0,
      totalSpend: 0,
      totalRevenue: 0,
      averageROAS: 0,
    };
  }

  const totals = campaigns.reduce(
    (acc, campaign) => ({
      spend: acc.spend + campaign.metrics.spend,
      revenue: acc.revenue + campaign.metrics.revenue,
      roasSum: acc.roasSum + campaign.metrics.roas,
    }),
    { spend: 0, revenue: 0, roasSum: 0 },
  );

  return {
    count: campaigns.length,
    totalSpend: totals.spend,
    totalRevenue: totals.revenue,
    averageROAS: totals.roasSum / campaigns.length,
  };
}

/**
 * Generate array of dates between start and end
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Array of date strings
 */
function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }

  return dates;
}

/**
 * Identify underperforming campaigns
 *
 * @param campaigns - List of campaigns
 * @param roasThreshold - Minimum acceptable ROAS (default: 2.0)
 * @returns Campaigns below threshold
 */
export function getUnderperformingCampaigns(
  campaigns: Campaign[],
  roasThreshold: number = 2.0,
): Campaign[] {
  return campaigns
    .filter((c) => c.metrics.roas < roasThreshold && c.metrics.spend > 0)
    .sort((a, b) => a.metrics.roas - b.metrics.roas);
}

/**
 * Identify top performing campaigns
 *
 * @param campaigns - List of campaigns
 * @param limit - Number of top campaigns to return
 * @returns Top campaigns by ROAS
 */
export function getTopPerformingCampaigns(
  campaigns: Campaign[],
  limit: number = 5,
): Campaign[] {
  return [...campaigns]
    .filter((c) => c.metrics.spend > 0)
    .sort((a, b) => b.metrics.roas - a.metrics.roas)
    .slice(0, limit);
}
