/**
 * Performance Alerts - Monitor campaign performance and trigger alerts
 *
 * Monitors ROAS (Return On Ad Spend) and other performance metrics,
 * generating alerts when campaigns underperform and recommending actions.
 *
 * Default ROAS threshold: 1.5x (minimum for profitability)
 */

import { createClient } from "~/lib/supabase.server";

export interface PerformanceAlert {
  id?: string;
  campaign_id: string;
  campaign_name: string;
  platform: string;
  alert_type: "low_roas" | "no_conversions" | "high_cpa" | "low_ctr";
  current_value: number | null;
  threshold_value: number;
  severity: "info" | "warning" | "critical";
  message: string;
  recommendation: string;
  action: "pause" | "optimize" | "monitor" | "scale_down";
  triggered_at: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

export interface PerformanceCheckResult {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  metrics: {
    roas: number | null;
    cpa_cents: number | null;
    ctr: number | null;
    conversions: number;
  };
  is_underperforming: boolean;
  alerts: PerformanceAlert[];
}

/**
 * Check campaign performance and generate alerts
 *
 * @param campaign - Campaign data with performance metrics
 * @param thresholds - Custom thresholds (optional)
 * @returns Performance check result with alerts
 *
 * @example
 * const result = checkCampaignPerformance({
 *   id: 'camp_123',
 *   name: 'Spring Sale',
 *   platform: 'meta',
 *   spend_cents: 100000,
 *   revenue_cents: 120000,  // ROAS: 1.2x (below 1.5x threshold)
 *   impressions: 10000,
 *   clicks: 200,
 *   conversions: 5
 * });
 * // Returns: { is_underperforming: true, alerts: [{...}] }
 */
export function checkCampaignPerformance(
  campaign: {
    id: string;
    name: string;
    platform: string;
    spend_cents: number;
    revenue_cents: number;
    impressions: number;
    clicks: number;
    conversions: number;
  },
  thresholds: {
    minROAS?: number; // Default: 1.5
    maxCPA?: number; // Default: null (no limit)
    minCTR?: number; // Default: 0.01 (1%)
    minConversions?: number; // Default: 1
  } = {},
): PerformanceCheckResult {
  const {
    id,
    name,
    platform,
    spend_cents,
    revenue_cents,
    impressions,
    clicks,
    conversions,
  } = campaign;

  // Set default thresholds
  const minROAS = thresholds.minROAS ?? 1.5;
  const minCTR = thresholds.minCTR ?? 0.01;
  const minConversions = thresholds.minConversions ?? 1;

  // Calculate metrics
  const roas = spend_cents > 0 ? revenue_cents / spend_cents : null;
  const cpa_cents = conversions > 0 ? spend_cents / conversions : null;
  const ctr = impressions > 0 ? clicks / impressions : null;

  const alerts: PerformanceAlert[] = [];

  // Check ROAS
  if (roas !== null && roas < minROAS) {
    const severity: "warning" | "critical" =
      roas < 1.0 ? "critical" : "warning";
    const action: "pause" | "optimize" = roas < 1.0 ? "pause" : "optimize";

    alerts.push({
      campaign_id: id,
      campaign_name: name,
      platform,
      alert_type: "low_roas",
      current_value: roas,
      threshold_value: minROAS,
      severity,
      message: `Campaign "${name}" has ROAS of ${roas.toFixed(
        2,
      )}x, below target of ${minROAS.toFixed(2)}x. ${
        roas < 1.0
          ? "Campaign is unprofitable (ROAS < 1.0)."
          : "Campaign profitability is at risk."
      }`,
      recommendation:
        roas < 1.0
          ? "PAUSE campaign immediately. Review targeting, creative, and audience. Consider reducing budget or testing new ad variations."
          : "OPTIMIZE campaign targeting and creative. Test different audiences, ad copy, and bidding strategies. Monitor closely for 48 hours.",
      action,
      triggered_at: new Date().toISOString(),
      acknowledged: false,
    });
  }

  // Check for no conversions (if campaign has spend)
  if (conversions < minConversions && spend_cents > 5000) {
    // Only alert if spent >$50
    alerts.push({
      campaign_id: id,
      campaign_name: name,
      platform,
      alert_type: "no_conversions",
      current_value: conversions,
      threshold_value: minConversions,
      severity: "warning",
      message: `Campaign "${name}" has ${conversions} conversion(s) with spend of $${(
        spend_cents / 100
      ).toFixed(
        2,
      )}. Conversion tracking may be broken or targeting is ineffective.`,
      recommendation:
        "CHECK conversion tracking setup. Verify pixel installation and test checkout flow. If tracking is correct, review targeting and pause if no conversions after $100 spend.",
      action: "monitor",
      triggered_at: new Date().toISOString(),
      acknowledged: false,
    });
  }

  // Check CTR
  if (ctr !== null && ctr < minCTR && impressions > 1000) {
    // Only alert if >1000 impressions
    alerts.push({
      campaign_id: id,
      campaign_name: name,
      platform,
      alert_type: "low_ctr",
      current_value: ctr,
      threshold_value: minCTR,
      severity: "warning",
      message: `Campaign "${name}" has CTR of ${(ctr * 100).toFixed(
        2,
      )}%, below target of ${(minCTR * 100).toFixed(
        2,
      )}%. Ad creative may not be engaging.`,
      recommendation:
        "UPDATE ad creative. Test new images, headlines, and copy. Consider A/B testing different ad formats. Review audience targeting for relevance.",
      action: "optimize",
      triggered_at: new Date().toISOString(),
      acknowledged: false,
    });
  }

  // Check CPA (if threshold provided and we have conversions)
  if (
    thresholds.maxCPA &&
    cpa_cents !== null &&
    cpa_cents > thresholds.maxCPA
  ) {
    alerts.push({
      campaign_id: id,
      campaign_name: name,
      platform,
      alert_type: "high_cpa",
      current_value: cpa_cents,
      threshold_value: thresholds.maxCPA,
      severity: "warning",
      message: `Campaign "${name}" has CPA of $${(cpa_cents / 100).toFixed(
        2,
      )}, above target of $${(thresholds.maxCPA / 100).toFixed(
        2,
      )}. Acquisition cost is too high.`,
      recommendation:
        "SCALE DOWN campaign budget by 30-50%. Optimize for higher-intent audiences. Consider adjusting bid strategy or trying different ad placements.",
      action: "scale_down",
      triggered_at: new Date().toISOString(),
      acknowledged: false,
    });
  }

  return {
    campaign_id: id,
    campaign_name: name,
    platform,
    metrics: {
      roas,
      cpa_cents,
      ctr,
      conversions,
    },
    is_underperforming: alerts.length > 0,
    alerts,
  };
}

/**
 * Check multiple campaigns for performance alerts
 *
 * @param campaigns - Array of campaigns to check
 * @param thresholds - Custom thresholds
 * @returns Array of performance check results with alerts
 *
 * @example
 * const results = checkMultipleCampaignPerformance(campaigns);
 */
export function checkMultipleCampaignPerformance(
  campaigns: Parameters<typeof checkCampaignPerformance>[0][],
  thresholds?: Parameters<typeof checkCampaignPerformance>[1],
): PerformanceCheckResult[] {
  return campaigns
    .map((campaign) => checkCampaignPerformance(campaign, thresholds))
    .filter((result) => result.is_underperforming);
}

/**
 * Store performance alert in database
 *
 * @param alert - Alert to store
 * @param request - Request object for Supabase client
 * @returns Success status
 *
 * @example
 * await storePerformanceAlert(alert, request);
 */
export async function storePerformanceAlert(
  alert: Omit<PerformanceAlert, "id">,
  request: Request,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(request);

    // Check for existing unacknowledged alert of same type
    const { data: existing } = await supabase
      .from("performance_alerts")
      .select("id")
      .eq("campaign_id", alert.campaign_id)
      .eq("alert_type", alert.alert_type)
      .eq("acknowledged", false)
      .single();

    if (existing) {
      // Alert already exists - don't duplicate
      return { success: true };
    }

    // Insert new alert
    const { error } = await supabase.from("performance_alerts").insert({
      campaign_id: alert.campaign_id,
      campaign_name: alert.campaign_name,
      platform: alert.platform,
      alert_type: alert.alert_type,
      current_value: alert.current_value,
      threshold_value: alert.threshold_value,
      severity: alert.severity,
      message: alert.message,
      recommendation: alert.recommendation,
      action: alert.action,
      triggered_at: alert.triggered_at,
      acknowledged: false,
    });

    if (error) {
      console.error("Error storing performance alert:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception storing performance alert:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get unacknowledged performance alerts
 *
 * @param request - Request object for Supabase client
 * @param severity - Optional severity filter
 * @returns Array of unacknowledged alerts
 *
 * @example
 * const criticalAlerts = await getPerformanceAlerts(request, 'critical');
 */
export async function getPerformanceAlerts(
  request: Request,
  severity?: "info" | "warning" | "critical",
): Promise<PerformanceAlert[]> {
  try {
    const supabase = createClient(request);

    let query = supabase
      .from("performance_alerts")
      .select("*")
      .eq("acknowledged", false)
      .order("triggered_at", { ascending: false });

    if (severity) {
      query = query.eq("severity", severity);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching performance alerts:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Exception fetching performance alerts:", error);
    return [];
  }
}
