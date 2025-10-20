/**
 * Budget Alerts - Monitor campaign spending and trigger alerts
 *
 * Monitors ad campaign spending against budget thresholds and generates
 * alerts when spending exceeds defined limits.
 *
 * Default threshold: 110% of budget (10% overspend tolerance)
 */

import { createClient } from "~/lib/supabase.server";

export interface BudgetAlert {
  id?: string;
  campaign_id: string;
  campaign_name: string;
  platform: string;
  alert_type: "budget_exceeded" | "budget_warning" | "budget_critical";
  budget_cents: number;
  spend_cents: number;
  threshold_percentage: number; // e.g., 110 = 110% of budget
  overspend_cents: number; // Amount over budget
  overspend_percentage: number; // Percentage over budget
  severity: "info" | "warning" | "critical";
  message: string;
  triggered_at: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

export interface BudgetCheckResult {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  budget_cents: number;
  spend_cents: number;
  remaining_cents: number;
  spend_percentage: number;
  is_over_budget: boolean;
  is_at_risk: boolean; // >90% spent
  is_critical: boolean; // >110% spent
  alert?: BudgetAlert;
}

/**
 * Check campaign budget status and generate alerts if needed
 *
 * @param campaign - Campaign data with budget and spend
 * @param threshold - Threshold percentage for alerts (default: 110)
 * @returns Budget check result with alert if threshold exceeded
 *
 * @example
 * const result = checkCampaignBudget({
 *   id: 'camp_123',
 *   name: 'Spring Sale',
 *   platform: 'meta',
 *   budgetCents: 500000,  // $5,000
 *   spendCents: 560000     // $5,600 (112% of budget)
 * });
 * // Returns: { is_critical: true, overspend_cents: 60000, alert: {...} }
 */
export function checkCampaignBudget(
  campaign: {
    id: string;
    name: string;
    platform: string;
    budgetCents: number;
    spendCents: number;
  },
  threshold: number = 110,
): BudgetCheckResult {
  const { id, name, platform, budgetCents, spendCents } = campaign;

  // Calculate metrics
  const remaining_cents = budgetCents - spendCents;
  const spend_percentage =
    budgetCents > 0 ? (spendCents / budgetCents) * 100 : 0;
  const is_over_budget = spendCents > budgetCents;
  const is_at_risk = spend_percentage >= 90;
  const is_critical = spend_percentage >= threshold;

  let alert: BudgetAlert | undefined;

  // Generate alert if over threshold
  if (is_critical) {
    const overspend_cents = spendCents - budgetCents;
    const overspend_percentage =
      budgetCents > 0 ? (overspend_cents / budgetCents) * 100 : 0;

    alert = {
      campaign_id: id,
      campaign_name: name,
      platform,
      alert_type: "budget_critical",
      budget_cents: budgetCents,
      spend_cents: spendCents,
      threshold_percentage: threshold,
      overspend_cents,
      overspend_percentage,
      severity: "critical",
      message: `Campaign "${name}" has exceeded budget by $${(
        overspend_cents / 100
      ).toFixed(2)} (${overspend_percentage.toFixed(1)}%). Current spend: $${(
        spendCents / 100
      ).toFixed(2)}, Budget: $${(budgetCents / 100).toFixed(2)}.`,
      triggered_at: new Date().toISOString(),
      acknowledged: false,
    };
  } else if (is_at_risk) {
    // Warning alert at 90% threshold
    alert = {
      campaign_id: id,
      campaign_name: name,
      platform,
      alert_type: "budget_warning",
      budget_cents: budgetCents,
      spend_cents: spendCents,
      threshold_percentage: 90,
      overspend_cents: 0,
      overspend_percentage: 0,
      severity: "warning",
      message: `Campaign "${name}" is at ${spend_percentage.toFixed(
        1,
      )}% of budget. Consider pausing or adjusting budget. Current spend: $${(
        spendCents / 100
      ).toFixed(2)}, Budget: $${(budgetCents / 100).toFixed(2)}.`,
      triggered_at: new Date().toISOString(),
      acknowledged: false,
    };
  }

  return {
    campaign_id: id,
    campaign_name: name,
    platform,
    budget_cents: budgetCents,
    spend_cents: spendCents,
    remaining_cents,
    spend_percentage,
    is_over_budget,
    is_at_risk,
    is_critical,
    alert,
  };
}

/**
 * Check multiple campaigns for budget alerts
 *
 * @param campaigns - Array of campaigns to check
 * @param threshold - Alert threshold percentage
 * @returns Array of budget check results, filtered to only those with alerts
 *
 * @example
 * const alerts = checkMultipleCampaignBudgets(campaigns);
 * // Returns only campaigns with budget issues
 */
export function checkMultipleCampaignBudgets(
  campaigns: {
    id: string;
    name: string;
    platform: string;
    budgetCents: number;
    spendCents: number;
  }[],
  threshold: number = 110,
): BudgetCheckResult[] {
  return campaigns
    .map((campaign) => checkCampaignBudget(campaign, threshold))
    .filter((result) => result.alert !== undefined);
}

/**
 * Store budget alert in database
 *
 * @param alert - Alert to store
 * @param request - Request object for Supabase client
 * @returns Success status
 *
 * @example
 * await storeBudgetAlert(alert, request);
 */
export async function storeBudgetAlert(
  alert: Omit<BudgetAlert, "id">,
  request: Request,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(request);

    // Check if alert already exists for this campaign (don't duplicate)
    const { data: existing } = await supabase
      .from("budget_alerts")
      .select("id")
      .eq("campaign_id", alert.campaign_id)
      .eq("acknowledged", false)
      .single();

    if (existing) {
      // Alert already exists and not acknowledged - don't create duplicate
      return { success: true };
    }

    // Insert new alert
    const { error } = await supabase.from("budget_alerts").insert({
      campaign_id: alert.campaign_id,
      campaign_name: alert.campaign_name,
      platform: alert.platform,
      alert_type: alert.alert_type,
      budget_cents: alert.budget_cents,
      spend_cents: alert.spend_cents,
      threshold_percentage: alert.threshold_percentage,
      overspend_cents: alert.overspend_cents,
      overspend_percentage: alert.overspend_percentage,
      severity: alert.severity,
      message: alert.message,
      triggered_at: alert.triggered_at,
      acknowledged: false,
    });

    if (error) {
      console.error("Error storing budget alert:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception storing budget alert:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Acknowledge a budget alert
 *
 * @param alertId - Alert ID to acknowledge
 * @param acknowledgedBy - User who acknowledged the alert
 * @param request - Request object for Supabase client
 * @returns Success status
 *
 * @example
 * await acknowledgeBudgetAlert('alert_123', 'user@example.com', request);
 */
export async function acknowledgeBudgetAlert(
  alertId: string,
  acknowledgedBy: string,
  request: Request,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(request);

    const { error } = await supabase
      .from("budget_alerts")
      .update({
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: acknowledgedBy,
      })
      .eq("id", alertId);

    if (error) {
      console.error("Error acknowledging budget alert:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception acknowledging budget alert:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get unacknowledged budget alerts
 *
 * @param request - Request object for Supabase client
 * @returns Array of unacknowledged alerts
 *
 * @example
 * const alerts = await getUnacknowledgedAlerts(request);
 */
export async function getUnacknowledgedAlerts(
  request: Request,
): Promise<BudgetAlert[]> {
  try {
    const supabase = createClient(request);

    const { data, error } = await supabase
      .from("budget_alerts")
      .select("*")
      .eq("acknowledged", false)
      .order("triggered_at", { ascending: false });

    if (error) {
      console.error("Error fetching budget alerts:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Exception fetching budget alerts:", error);
    return [];
  }
}
