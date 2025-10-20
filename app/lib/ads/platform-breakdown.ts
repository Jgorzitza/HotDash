/**
 * Platform Breakdown - Group campaigns by platform
 *
 * Aggregates campaign metrics by advertising platform (Meta, Google, etc.)
 * for comparative analysis and reporting.
 */

import { calculateAllMetrics } from "./metrics";

export interface Campaign {
  id: string;
  name: string;
  platform: "meta" | "google" | "organic" | "tiktok" | "pinterest";
  status: "active" | "paused" | "archived" | "draft";
  metrics: {
    spend_cents: number;
    revenue_cents: number;
    impressions: number;
    clicks: number;
    conversions: number;
  };
}

export interface PlatformMetrics {
  platform: "meta" | "google" | "organic" | "tiktok" | "pinterest";
  campaignCount: number;
  activeCampaigns: number;
  totalSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  // Calculated metrics
  roas: number | null;
  cpc: number | null;
  cpa: number | null;
  ctr: number | null;
  conversionRate: number | null;
}

/**
 * Get platform breakdown - Group campaigns by platform and calculate aggregate metrics
 *
 * @param campaigns - Array of campaigns to group by platform
 * @returns Array of platform metrics, empty array if input is empty
 *
 * @example
 * const breakdown = getPlatformBreakdown(campaigns);
 * // Returns:
 * // [
 * //   { platform: 'meta', campaignCount: 4, totalSpend: 1250000, roas: 3.2, ... },
 * //   { platform: 'google', campaignCount: 6, totalSpend: 2092500, roas: 2.8, ... }
 * // ]
 */
export function getPlatformBreakdown(campaigns: Campaign[]): PlatformMetrics[] {
  // Empty array guard - return empty array if no campaigns
  if (!campaigns || campaigns.length === 0) {
    return [];
  }

  // Group campaigns by platform
  const platformGroups = campaigns.reduce(
    (groups, campaign) => {
      const platform = campaign.platform;
      if (!groups[platform]) {
        groups[platform] = [];
      }
      groups[platform].push(campaign);
      return groups;
    },
    {} as Record<string, Campaign[]>,
  );

  // Calculate metrics for each platform
  const platformMetrics: PlatformMetrics[] = Object.entries(platformGroups).map(
    ([platform, platformCampaigns]) => {
      // Aggregate metrics across all campaigns in this platform
      const totalSpend = platformCampaigns.reduce(
        (sum, c) => sum + c.metrics.spend_cents,
        0,
      );
      const totalRevenue = platformCampaigns.reduce(
        (sum, c) => sum + c.metrics.revenue_cents,
        0,
      );
      const totalImpressions = platformCampaigns.reduce(
        (sum, c) => sum + c.metrics.impressions,
        0,
      );
      const totalClicks = platformCampaigns.reduce(
        (sum, c) => sum + c.metrics.clicks,
        0,
      );
      const totalConversions = platformCampaigns.reduce(
        (sum, c) => sum + c.metrics.conversions,
        0,
      );

      // Count active campaigns
      const activeCampaigns = platformCampaigns.filter(
        (c) => c.status === "active",
      ).length;

      // Calculate aggregate metrics using the metrics library
      const calculatedMetrics = calculateAllMetrics({
        spend_cents: totalSpend,
        revenue_cents: totalRevenue,
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
      });

      return {
        platform: platform as PlatformMetrics["platform"],
        campaignCount: platformCampaigns.length,
        activeCampaigns,
        totalSpend,
        totalRevenue,
        totalImpressions,
        totalClicks,
        totalConversions,
        ...calculatedMetrics,
      };
    },
  );

  // Sort by total spend (highest first) for reporting
  return platformMetrics.sort((a, b) => b.totalSpend - a.totalSpend);
}

/**
 * Get top performing platform by ROAS
 *
 * @param campaigns - Array of campaigns
 * @returns Platform with highest ROAS, or null if no campaigns
 *
 * @example
 * const topPlatform = getTopPerformingPlatform(campaigns);
 * // Returns: { platform: 'meta', roas: 3.5, ... }
 */
export function getTopPerformingPlatform(
  campaigns: Campaign[],
): PlatformMetrics | null {
  const breakdown = getPlatformBreakdown(campaigns);

  if (breakdown.length === 0) {
    return null;
  }

  // Find platform with highest ROAS
  const topPlatform = breakdown.reduce((best, current) => {
    const bestROAS = best.roas ?? 0;
    const currentROAS = current.roas ?? 0;
    return currentROAS > bestROAS ? current : best;
  });

  return topPlatform;
}

/**
 * Get platform comparison - Compare two platforms side-by-side
 *
 * @param campaigns - Array of campaigns
 * @param platform1 - First platform to compare
 * @param platform2 - Second platform to compare
 * @returns Comparison object with both platforms' metrics
 *
 * @example
 * const comparison = getPlatformComparison(campaigns, 'meta', 'google');
 * // Returns: { meta: {...}, google: {...}, winner: { roas: 'meta', cpc: 'google' } }
 */
export function getPlatformComparison(
  campaigns: Campaign[],
  platform1: PlatformMetrics["platform"],
  platform2: PlatformMetrics["platform"],
): {
  [platform1: string]: PlatformMetrics | null;
  [platform2: string]: PlatformMetrics | null;
  winner: {
    roas: string;
    cpc: string;
    ctr: string;
    conversionRate: string;
  } | null;
} {
  const breakdown = getPlatformBreakdown(campaigns);

  const p1Metrics = breakdown.find((p) => p.platform === platform1) ?? null;
  const p2Metrics = breakdown.find((p) => p.platform === platform2) ?? null;

  // Calculate winners for each metric
  let winner = null;
  if (p1Metrics && p2Metrics) {
    winner = {
      roas:
        (p1Metrics.roas ?? 0) > (p2Metrics.roas ?? 0) ? platform1 : platform2,
      cpc:
        (p1Metrics.cpc ?? Infinity) < (p2Metrics.cpc ?? Infinity)
          ? platform1
          : platform2,
      ctr: (p1Metrics.ctr ?? 0) > (p2Metrics.ctr ?? 0) ? platform1 : platform2,
      conversionRate:
        (p1Metrics.conversionRate ?? 0) > (p2Metrics.conversionRate ?? 0)
          ? platform1
          : platform2,
    };
  }

  return {
    [platform1]: p1Metrics,
    [platform2]: p2Metrics,
    winner,
  };
}
