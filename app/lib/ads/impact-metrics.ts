/**
 * Campaign Impact Metrics
 *
 * Calculate per-campaign impact and store in Supabase ads_metrics_daily table
 *
 * @module app/lib/ads/impact-metrics
 */

import type {
  Campaign,
  CampaignDailySnapshot,
  AdsMetricsDailyRow,
} from "./types";
import {
  calculateROAS,
  calculateCPC,
  calculateCPA,
  calculateCTR,
  calculateConversionRate,
} from "./metrics";

/**
 * Calculate campaign impact metrics
 *
 * @param campaign - Campaign data
 * @param date - Date for the snapshot (YYYY-MM-DD)
 * @returns Daily snapshot with calculated metrics
 */
export function calculateCampaignImpact(
  campaign: Campaign,
  date: string,
): CampaignDailySnapshot {
  const { metrics } = campaign;

  // Recalculate all metrics to ensure consistency
  const calculatedMetrics = {
    spend: metrics.spend,
    revenue: metrics.revenue,
    impressions: metrics.impressions,
    clicks: metrics.clicks,
    conversions: metrics.conversions,
    roas: calculateROAS(metrics.revenue, metrics.spend),
    cpc: calculateCPC(metrics.spend, metrics.clicks),
    cpa: calculateCPA(metrics.spend, metrics.conversions),
    ctr: calculateCTR(metrics.clicks, metrics.impressions),
    conversionRate: calculateConversionRate(
      metrics.conversions,
      metrics.clicks,
    ),
  };

  return {
    campaignId: campaign.id,
    date,
    platform: campaign.platform,
    metrics: calculatedMetrics,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Transform daily snapshot to Supabase row format
 *
 * @param snapshot - Campaign daily snapshot
 * @returns Supabase ads_metrics_daily row
 */
export function transformToSupabaseRow(
  snapshot: CampaignDailySnapshot,
): Omit<AdsMetricsDailyRow, "id" | "created_at" | "updated_at"> {
  return {
    campaign_id: snapshot.campaignId,
    platform: snapshot.platform,
    date: snapshot.date,
    spend: snapshot.metrics.spend,
    revenue: snapshot.metrics.revenue,
    impressions: snapshot.metrics.impressions,
    clicks: snapshot.metrics.clicks,
    conversions: snapshot.metrics.conversions,
    roas: snapshot.metrics.roas,
    cpc: snapshot.metrics.cpc,
    cpa: snapshot.metrics.cpa,
    ctr: snapshot.metrics.ctr,
    conversion_rate: snapshot.metrics.conversionRate,
  };
}

/**
 * Store campaign metrics in Supabase (stub implementation)
 *
 * @param snapshot - Campaign daily snapshot
 * @returns Success status
 *
 * @note Real implementation would use Supabase client:
 * ```ts
 * const { data, error } = await supabase
 *   .from('ads_metrics_daily')
 *   .upsert(transformToSupabaseRow(snapshot), {
 *     onConflict: 'campaign_id,date',
 *   });
 * ```
 */
export async function storeCampaignMetrics(
  snapshot: CampaignDailySnapshot,
): Promise<{ success: boolean; error?: string }> {
  // Stub mode: simulate success
  console.log("[STUB] Would store to Supabase ads_metrics_daily:", {
    campaign: snapshot.campaignId,
    date: snapshot.date,
    roas: snapshot.metrics.roas.toFixed(2),
    spend: snapshot.metrics.spend,
  });

  return { success: true };

  // Real implementation:
  // const row = transformToSupabaseRow(snapshot);
  // const { data, error } = await supabase
  //   .from('ads_metrics_daily')
  //   .upsert(row, { onConflict: 'campaign_id,date' });
  //
  // if (error) {
  //   return { success: false, error: error.message };
  // }
  //
  // return { success: true };
}

/**
 * Batch store multiple campaign snapshots
 *
 * @param snapshots - Array of campaign daily snapshots
 * @returns Batch operation result
 */
export async function batchStoreCampaignMetrics(
  snapshots: CampaignDailySnapshot[],
): Promise<{
  success: boolean;
  stored: number;
  failed: number;
  errors: string[];
}> {
  const results = await Promise.allSettled(
    snapshots.map((snapshot) => storeCampaignMetrics(snapshot)),
  );

  const stored = results.filter(
    (r) => r.status === "fulfilled" && r.value.success,
  ).length;
  const failed = results.length - stored;
  const errors = results
    .filter(
      (r) =>
        r.status === "rejected" ||
        (r.status === "fulfilled" && !r.value.success),
    )
    .map((r) =>
      r.status === "rejected"
        ? r.reason.message
        : (r.value as { error?: string }).error || "Unknown error",
    );

  return {
    success: failed === 0,
    stored,
    failed,
    errors,
  };
}

/**
 * Calculate aggregate impact across all campaigns
 *
 * @param campaigns - Array of campaigns
 * @param date - Date for aggregation
 * @returns Aggregate metrics
 */
export function calculateAggregateImpact(
  campaigns: Campaign[],
  _date: string,
): {
  totalSpend: number;
  totalRevenue: number;
  averageROAS: number;
  averageCPC: number;
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  campaignCount: number;
} {
  const totals = campaigns.reduce(
    (acc, campaign) => ({
      spend: acc.spend + campaign.metrics.spend,
      revenue: acc.revenue + campaign.metrics.revenue,
      clicks: acc.clicks + campaign.metrics.clicks,
      impressions: acc.impressions + campaign.metrics.impressions,
      conversions: acc.conversions + campaign.metrics.conversions,
      roasSum: acc.roasSum + campaign.metrics.roas,
      cpcSum: acc.cpcSum + campaign.metrics.cpc,
    }),
    {
      spend: 0,
      revenue: 0,
      clicks: 0,
      impressions: 0,
      conversions: 0,
      roasSum: 0,
      cpcSum: 0,
    },
  );

  const campaignCount = campaigns.length;

  return {
    totalSpend: totals.spend,
    totalRevenue: totals.revenue,
    averageROAS: campaignCount > 0 ? totals.roasSum / campaignCount : 0,
    averageCPC: campaignCount > 0 ? totals.cpcSum / campaignCount : 0,
    totalClicks: totals.clicks,
    totalImpressions: totals.impressions,
    totalConversions: totals.conversions,
    campaignCount,
  };
}
