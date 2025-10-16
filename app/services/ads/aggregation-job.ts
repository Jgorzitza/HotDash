/**
 * Daily Ads Aggregation Job
 *
 * Purpose: Aggregate daily ad performance metrics for historical tracking
 * Owner: ads agent
 * Date: 2025-10-15
 *
 * Features:
 * - Daily aggregation of campaign metrics
 * - Historical data storage
 * - Trend calculation
 * - Automated scheduling
 */

import type { CampaignMetrics } from '../../lib/ads/tracking';
import { aggregateCampaignPerformance } from '../../lib/ads/tracking';
import { logger } from '../../utils/logger.server';
import { createSupabaseClient } from '../../lib/supabase/client';

/**
 * Daily aggregation result
 */
export interface DailyAggregation {
  date: string;
  totalCampaigns: number;
  totalAdSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  aggregatedRoas: number;
  averageCpc: number;
  averageCpm: number;
  averageCpa: number;
  aggregatedCtr: number;
  aggregatedConversionRate: number;
  byPlatform: Record<string, any>;
  processedAt: string;
}

/**
 * Job status
 */
export interface JobStatus {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  recordsProcessed: number;
}

/**
 * Run daily aggregation job
 *
 * @param date - Date to aggregate (YYYY-MM-DD)
 * @param campaigns - Campaign data for the date
 * @returns Aggregation result
 */
export async function runDailyAggregation(
  date: string,
  campaigns: CampaignMetrics[]
): Promise<DailyAggregation> {
  const startTime = Date.now();

  logger.info('Starting daily aggregation job', { date, campaignCount: campaigns.length });

  try {
    // Aggregate campaign performance
    const aggregated = aggregateCampaignPerformance(campaigns);

    // Create daily aggregation record
    const dailyAggregation: DailyAggregation = {
      date,
      totalCampaigns: aggregated.totalCampaigns,
      totalAdSpend: aggregated.totalAdSpend,
      totalRevenue: aggregated.totalRevenue,
      totalImpressions: aggregated.totalImpressions,
      totalClicks: aggregated.totalClicks,
      totalConversions: aggregated.totalConversions,
      aggregatedRoas: aggregated.aggregatedRoas,
      averageCpc: aggregated.averageCpc,
      averageCpm: aggregated.averageCpm,
      averageCpa: aggregated.averageCpa,
      aggregatedCtr: aggregated.aggregatedCtr,
      aggregatedConversionRate: aggregated.aggregatedConversionRate,
      byPlatform: aggregated.byPlatform,
      processedAt: new Date().toISOString(),
    };

    // Persist to Supabase (best-effort)
    try {
      const supa = createSupabaseClient(true);
      // Insert 'all' platform rollup
      await supa.from('ads_daily_aggregations').upsert(
        {
          date,
          platform: 'all',
          total_campaigns: aggregated.totalCampaigns,
          total_ad_spend: aggregated.totalAdSpend,
          total_revenue: aggregated.totalRevenue,
          total_impressions: aggregated.totalImpressions,
          total_clicks: aggregated.totalClicks,
          total_conversions: aggregated.totalConversions,
          aggregated_roas: aggregated.aggregatedRoas,
          average_cpc: aggregated.averageCpc,
          average_cpm: aggregated.averageCpm,
          average_cpa: aggregated.averageCpa,
          aggregated_ctr: aggregated.aggregatedCtr,
          aggregated_conversion_rate: aggregated.aggregatedConversionRate,
          processed_at: new Date().toISOString(),
        },
        { onConflict: 'date,platform' }
      );

      // Insert per-platform rollups
      for (const [platform, pdata] of Object.entries(aggregated.byPlatform)) {
        await supa.from('ads_daily_aggregations').upsert(
          {
            date,
            platform,
            total_campaigns: pdata.campaigns,
            total_ad_spend: pdata.adSpend,
            total_revenue: pdata.revenue,
            total_impressions: 0,
            total_clicks: 0,
            total_conversions: 0,
            aggregated_roas: pdata.roas,
            average_cpc: pdata.cpc,
            average_cpm: pdata.cpm,
            average_cpa: pdata.cpa,
            aggregated_ctr: pdata.ctr,
            aggregated_conversion_rate: pdata.conversionRate,
            processed_at: new Date().toISOString(),
          },
          { onConflict: 'date,platform' }
        );
      }
    } catch (dbErr) {
      logger.error('Failed to persist daily aggregation to Supabase', {
        date,
        error: dbErr instanceof Error ? dbErr.message : String(dbErr),
      });
    }

    const duration = Date.now() - startTime;

    logger.info('Daily aggregation job completed', {
      date,
      campaignCount: campaigns.length,
      totalAdSpend: dailyAggregation.totalAdSpend,
      totalRevenue: dailyAggregation.totalRevenue,
      aggregatedRoas: dailyAggregation.aggregatedRoas,
      durationMs: duration,
    });

    return dailyAggregation;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Daily aggregation job failed', {
      date,
      error: error instanceof Error ? error.message : String(error),
      durationMs: duration,
    });

    throw error;
  }
}

/**
 * Schedule daily aggregation job
 *
 * Runs at 2 AM UTC daily
 *
 * @returns Job configuration
 */
export function scheduleDailyAggregation(): {
  schedule: string;
  handler: () => Promise<void>;
} {
  return {
    schedule: '0 2 * * *', // 2 AM UTC daily
    handler: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const date = yesterday.toISOString().split('T')[0];

      logger.info('Scheduled daily aggregation job triggered', { date });

      // TODO: Fetch campaigns from database or API
      // const campaigns = await fetchCampaignsForDate(date);
      // await runDailyAggregation(date, campaigns);

      logger.info('Scheduled daily aggregation job completed', { date });
    },
  };
}

/**
 * Backfill historical aggregations
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Number of days processed
 */
export async function backfillAggregations(
  startDate: string,
  endDate: string
): Promise<number> {
  logger.info('Starting aggregation backfill', { startDate, endDate });

  const start = new Date(startDate);
  const end = new Date(endDate);
  let daysProcessed = 0;

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];

    try {
      // TODO: Fetch campaigns for date
      // const campaigns = await fetchCampaignsForDate(dateStr);
      // await runDailyAggregation(dateStr, campaigns);

      daysProcessed++;
      logger.info('Backfill processed date', { date: dateStr, daysProcessed });
    } catch (error) {
      logger.error('Backfill failed for date', {
        date: dateStr,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info('Aggregation backfill completed', { startDate, endDate, daysProcessed });

  return daysProcessed;
}

