/**
 * Budget Alert System
 *
 * Monitors campaign budgets and generates alerts for budget depletion,
 * low CTR, high CPC, and conversion drops. Supports automatic campaign pausing.
 *
 * @module app/services/ads/budget-alerts
 */

import type {
  CampaignPerformance,
  BudgetAlert,
  AlertType,
  AlertSeverity,
  Campaign,
} from "./types";

/**
 * Budget Alert Thresholds
 */
export interface AlertThresholds {
  budgetDepletionPercent: number; // Alert when spent > X% of budget (default: 80)
  lowCtrPercent: number; // Alert when CTR < X% (default: 1.0)
  highCpcMultiplier: number; // Alert when CPC > X times target (default: 1.5)
  conversionDropPercent: number; // Alert when conversions drop > X% (default: 20)
}

/**
 * Default alert thresholds
 */
export const DEFAULT_THRESHOLDS: AlertThresholds = {
  budgetDepletionPercent: 80,
  lowCtrPercent: 1.0,
  highCpcMultiplier: 1.5,
  conversionDropPercent: 20,
};

/**
 * Check for budget depletion alerts
 *
 * @param campaigns - Array of campaigns with budget data
 * @param performances - Array of campaign performance data
 * @param thresholds - Alert thresholds
 * @returns Array of budget depletion alerts
 */
export function checkBudgetDepletion(
  campaigns: Campaign[],
  performances: CampaignPerformance[],
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  for (const campaign of campaigns) {
    const perf = performances.find((p) => p.campaignId === campaign.id);
    if (!perf) continue;

    const budgetCents = Math.round(campaign.budgetMicros / 10000);
    if (budgetCents === 0) continue;

    const spentPercent = (perf.costCents / budgetCents) * 100;

    if (spentPercent >= thresholds.budgetDepletionPercent) {
      let severity: AlertSeverity = "medium";
      if (spentPercent >= 95) severity = "high";
      else if (spentPercent >= 90) severity = "high";

      alerts.push({
        campaignId: campaign.id,
        campaignName: campaign.name,
        alertType: spentPercent >= 100 ? "budget_exceeded" : "budget_depleted",
        severity,
        message: `Campaign has spent ${spentPercent.toFixed(1)}% of daily budget`,
        currentValue: spentPercent,
        thresholdValue: thresholds.budgetDepletionPercent,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

/**
 * Check for low CTR alerts
 *
 * @param performances - Array of campaign performance data
 * @param thresholds - Alert thresholds
 * @returns Array of low CTR alerts
 */
export function checkLowCtr(
  performances: CampaignPerformance[],
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  for (const perf of performances) {
    // Only alert if campaign has meaningful impressions
    if (perf.impressions < 1000) continue;

    const ctrPercent = perf.ctr * 100;

    if (ctrPercent < thresholds.lowCtrPercent) {
      let severity: AlertSeverity = "low";
      if (ctrPercent < 0.5) severity = "high";
      else if (ctrPercent < 0.75) severity = "medium";

      alerts.push({
        campaignId: perf.campaignId,
        campaignName: perf.campaignName,
        alertType: "low_ctr",
        severity,
        message: `Campaign CTR (${ctrPercent.toFixed(2)}%) is below target`,
        currentValue: ctrPercent,
        thresholdValue: thresholds.lowCtrPercent,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

/**
 * Check for high CPC alerts
 *
 * @param performances - Array of campaign performance data
 * @param targetCpcCents - Target CPC in cents for each campaign
 * @param thresholds - Alert thresholds
 * @returns Array of high CPC alerts
 */
export function checkHighCpc(
  performances: CampaignPerformance[],
  targetCpcCents: Record<string, number>,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  for (const perf of performances) {
    // Only alert if campaign has clicks
    if (perf.clicks === 0) continue;

    const targetCpc = targetCpcCents[perf.campaignId];
    if (!targetCpc) continue;

    const cpcMultiplier = perf.avgCpcCents / targetCpc;

    if (cpcMultiplier >= thresholds.highCpcMultiplier) {
      let severity: AlertSeverity = "low";
      if (cpcMultiplier >= 2.0) severity = "high";
      else if (cpcMultiplier >= 1.75) severity = "medium";

      alerts.push({
        campaignId: perf.campaignId,
        campaignName: perf.campaignName,
        alertType: "high_cpc",
        severity,
        message: `Campaign CPC ($${(perf.avgCpcCents / 100).toFixed(2)}) is ${cpcMultiplier.toFixed(1)}x target`,
        currentValue: perf.avgCpcCents,
        thresholdValue: targetCpc * thresholds.highCpcMultiplier,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

/**
 * Check for conversion drop alerts
 *
 * @param currentPeriod - Current period performance data
 * @param previousPeriod - Previous period performance data
 * @param thresholds - Alert thresholds
 * @returns Array of conversion drop alerts
 */
export function checkConversionDrops(
  currentPeriod: CampaignPerformance[],
  previousPeriod: CampaignPerformance[],
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  for (const current of currentPeriod) {
    const previous = previousPeriod.find(
      (p) => p.campaignId === current.campaignId,
    );
    if (!previous) continue;

    // Only alert if previous period had meaningful conversions
    if (previous.conversions < 5) continue;

    const dropPercent =
      ((previous.conversions - current.conversions) / previous.conversions) *
      100;

    if (dropPercent >= thresholds.conversionDropPercent) {
      let severity: AlertSeverity = "medium";
      if (dropPercent >= 50) severity = "high";
      else if (dropPercent >= 35) severity = "medium";
      else severity = "low";

      alerts.push({
        campaignId: current.campaignId,
        campaignName: current.campaignName,
        alertType: "conversion_drop",
        severity,
        message: `Conversions dropped ${dropPercent.toFixed(1)}% (${previous.conversions} → ${current.conversions})`,
        currentValue: current.conversions,
        thresholdValue:
          previous.conversions * (1 - thresholds.conversionDropPercent / 100),
        timestamp: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

/**
 * Generate all alerts for campaigns
 *
 * @param campaigns - Array of campaigns
 * @param currentPerformances - Current period performance data
 * @param previousPerformances - Previous period performance data (optional)
 * @param targetCpcCents - Target CPC for each campaign (optional)
 * @param thresholds - Custom alert thresholds (optional)
 * @returns Array of all alerts
 */
export function generateAllAlerts(
  campaigns: Campaign[],
  currentPerformances: CampaignPerformance[],
  previousPerformances?: CampaignPerformance[],
  targetCpcCents?: Record<string, number>,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  // Budget depletion alerts
  alerts.push(
    ...checkBudgetDepletion(campaigns, currentPerformances, thresholds),
  );

  // Low CTR alerts
  alerts.push(...checkLowCtr(currentPerformances, thresholds));

  // High CPC alerts (if target CPCs provided)
  if (targetCpcCents) {
    alerts.push(
      ...checkHighCpc(currentPerformances, targetCpcCents, thresholds),
    );
  }

  // Conversion drop alerts (if previous period provided)
  if (previousPerformances) {
    alerts.push(
      ...checkConversionDrops(
        currentPerformances,
        previousPerformances,
        thresholds,
      ),
    );
  }

  // Sort by severity (high -> medium -> low)
  return alerts.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Determine if a campaign should be auto-paused based on alerts
 *
 * @param alerts - Array of alerts for a specific campaign
 * @returns boolean - True if campaign should be paused
 */
export function shouldAutoPause(alerts: BudgetAlert[]): boolean {
  // Auto-pause if:
  // - Budget exceeded (100%+)
  // - Multiple high severity alerts (2+)
  // - High CPC + conversion drop combination

  const highSeverityCount = alerts.filter((a) => a.severity === "high").length;
  const hasBudgetExceeded = alerts.some(
    (a) => a.alertType === "budget_exceeded",
  );
  const hasHighCpc = alerts.some(
    (a) => a.alertType === "high_cpc" && a.severity === "high",
  );
  const hasConversionDrop = alerts.some(
    (a) => a.alertType === "conversion_drop",
  );

  return (
    hasBudgetExceeded ||
    highSeverityCount >= 2 ||
    (hasHighCpc && hasConversionDrop)
  );
}

/**
 * Get alert summary by severity
 *
 * @param alerts - Array of alerts
 * @returns Summary object with counts by severity
 */
export function getAlertSummary(alerts: BudgetAlert[]): {
  high: number;
  medium: number;
  low: number;
  total: number;
} {
  return {
    high: alerts.filter((a) => a.severity === "high").length,
    medium: alerts.filter((a) => a.severity === "medium").length,
    low: alerts.filter((a) => a.severity === "low").length,
    total: alerts.length,
  };
}
