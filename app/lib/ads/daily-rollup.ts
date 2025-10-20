/**
 * Daily Metrics Rollup - Aggregate campaign metrics by day
 *
 * This module handles daily aggregation of campaign metrics and storage
 * in the ads_daily_metrics table for historical trend analysis.
 */

import { createClient } from "~/lib/supabase.server";

export interface DailyMetricsInput {
  campaignId: string;
  metricDate: string; // YYYY-MM-DD format
  spend_cents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue_cents: number;
}

export interface DailyMetricsRow {
  id?: string;
  campaign_id: string;
  metric_date: string;
  spend_cents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue_cents: number;
  cpc_cents: number | null;
  cpa_cents: number | null;
  roas: number | null;
  ctr: number | null;
  conversion_rate: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Aggregate campaign metrics by day and store in database
 *
 * This function takes daily metrics data and upserts it into the
 * ads_daily_metrics table. Calculated metrics (ROAS, CPC, CPA, etc.)
 * are computed by database triggers.
 *
 * @param metrics - Array of daily metrics to store
 * @param request - Request object for Supabase client creation
 * @returns Result with success status and inserted count
 *
 * @example
 * await storeDailyMetrics([
 *   {
 *     campaignId: 'camp_123',
 *     metricDate: '2025-10-19',
 *     spend_cents: 50000,
 *     impressions: 10000,
 *     clicks: 300,
 *     conversions: 12,
 *     revenue_cents: 150000
 *   }
 * ], request);
 */
export async function storeDailyMetrics(
  metrics: DailyMetricsInput[],
  request: Request,
): Promise<{ success: boolean; count: number; errors?: string[] }> {
  if (!metrics || metrics.length === 0) {
    return { success: true, count: 0 };
  }

  try {
    const supabase = createClient(request);

    // Transform input to match database schema
    const rows: Omit<DailyMetricsRow, "id" | "created_at" | "updated_at">[] =
      metrics.map((m) => ({
        campaign_id: m.campaignId,
        metric_date: m.metricDate,
        spend_cents: m.spend_cents,
        impressions: m.impressions,
        clicks: m.clicks,
        conversions: m.conversions,
        revenue_cents: m.revenue_cents,
        cpc_cents: null, // Calculated by DB trigger
        cpa_cents: null, // Calculated by DB trigger
        roas: null, // Calculated by DB trigger
        ctr: null, // Calculated by DB trigger
        conversion_rate: null, // Calculated by DB trigger
      }));

    // Upsert metrics (insert or update if campaign_id + metric_date exists)
    const { data, error } = await supabase
      .from("ads_daily_metrics")
      .upsert(rows, {
        onConflict: "campaign_id,metric_date",
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error("Error storing daily metrics:", error);
      return {
        success: false,
        count: 0,
        errors: [error.message],
      };
    }

    return {
      success: true,
      count: data?.length ?? 0,
    };
  } catch (error) {
    console.error("Exception storing daily metrics:", error);
    return {
      success: false,
      count: 0,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

/**
 * Get daily metrics for a campaign within a date range
 *
 * @param campaignId - UUID or external ID of the campaign
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param request - Request object for Supabase client
 * @returns Array of daily metrics rows
 *
 * @example
 * const metrics = await getDailyMetrics(
 *   'camp_123',
 *   '2025-10-01',
 *   '2025-10-19',
 *   request
 * );
 */
export async function getDailyMetrics(
  campaignId: string,
  startDate: string,
  endDate: string,
  request: Request,
): Promise<DailyMetricsRow[]> {
  try {
    const supabase = createClient(request);

    const { data, error } = await supabase
      .from("ads_daily_metrics")
      .select("*")
      .eq("campaign_id", campaignId)
      .gte("metric_date", startDate)
      .lte("metric_date", endDate)
      .order("metric_date", { ascending: true });

    if (error) {
      console.error("Error fetching daily metrics:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Exception fetching daily metrics:", error);
    return [];
  }
}

/**
 * Aggregate metrics across multiple campaigns for a date range
 *
 * @param campaignIds - Array of campaign IDs to aggregate
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param request - Request object for Supabase client
 * @returns Aggregated metrics by date
 *
 * @example
 * const aggregated = await aggregateDailyMetrics(
 *   ['camp_1', 'camp_2'],
 *   '2025-10-01',
 *   '2025-10-19',
 *   request
 * );
 */
export async function aggregateDailyMetrics(
  campaignIds: string[],
  startDate: string,
  endDate: string,
  request: Request,
): Promise<
  {
    metric_date: string;
    total_spend_cents: number;
    total_revenue_cents: number;
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    avg_roas: number | null;
    avg_cpc_cents: number | null;
  }[]
> {
  if (!campaignIds || campaignIds.length === 0) {
    return [];
  }

  try {
    const supabase = createClient(request);

    // Fetch all metrics for the campaigns in the date range
    const { data, error } = await supabase
      .from("ads_daily_metrics")
      .select("*")
      .in("campaign_id", campaignIds)
      .gte("metric_date", startDate)
      .lte("metric_date", endDate)
      .order("metric_date", { ascending: true });

    if (error) {
      console.error("Error aggregating daily metrics:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Group by date and aggregate
    const grouped = data.reduce(
      (acc, row) => {
        const date = row.metric_date;
        if (!acc[date]) {
          acc[date] = {
            metric_date: date,
            total_spend_cents: 0,
            total_revenue_cents: 0,
            total_impressions: 0,
            total_clicks: 0,
            total_conversions: 0,
            roas_values: [],
            cpc_values: [],
          };
        }

        acc[date].total_spend_cents += row.spend_cents;
        acc[date].total_revenue_cents += row.revenue_cents;
        acc[date].total_impressions += row.impressions;
        acc[date].total_clicks += row.clicks;
        acc[date].total_conversions += row.conversions;

        if (row.roas !== null) {
          acc[date].roas_values.push(row.roas);
        }
        if (row.cpc_cents !== null) {
          acc[date].cpc_values.push(row.cpc_cents);
        }

        return acc;
      },
      {} as Record<string, any>,
    );

    // Calculate averages and return
    return Object.values(grouped).map((g: any) => ({
      metric_date: g.metric_date,
      total_spend_cents: g.total_spend_cents,
      total_revenue_cents: g.total_revenue_cents,
      total_impressions: g.total_impressions,
      total_clicks: g.total_clicks,
      total_conversions: g.total_conversions,
      avg_roas:
        g.roas_values.length > 0
          ? g.roas_values.reduce((sum: number, v: number) => sum + v, 0) /
            g.roas_values.length
          : null,
      avg_cpc_cents:
        g.cpc_values.length > 0
          ? Math.round(
              g.cpc_values.reduce((sum: number, v: number) => sum + v, 0) /
                g.cpc_values.length,
            )
          : null,
    }));
  } catch (error) {
    console.error("Exception aggregating daily metrics:", error);
    return [];
  }
}
