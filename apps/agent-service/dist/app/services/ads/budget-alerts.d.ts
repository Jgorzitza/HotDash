/**
 * Budget Alert System
 *
 * Monitors campaign budgets and generates alerts for budget depletion,
 * low CTR, high CPC, and conversion drops. Supports automatic campaign pausing.
 *
 * @module app/services/ads/budget-alerts
 */
import type { CampaignPerformance, BudgetAlert, Campaign } from "./types";
/**
 * Budget Alert Thresholds
 */
export interface AlertThresholds {
    budgetDepletionPercent: number;
    lowCtrPercent: number;
    highCpcMultiplier: number;
    conversionDropPercent: number;
}
/**
 * Default alert thresholds
 */
export declare const DEFAULT_THRESHOLDS: AlertThresholds;
/**
 * Check for budget depletion alerts
 *
 * @param campaigns - Array of campaigns with budget data
 * @param performances - Array of campaign performance data
 * @param thresholds - Alert thresholds
 * @returns Array of budget depletion alerts
 */
export declare function checkBudgetDepletion(campaigns: Campaign[], performances: CampaignPerformance[], thresholds?: AlertThresholds): BudgetAlert[];
/**
 * Check for low CTR alerts
 *
 * @param performances - Array of campaign performance data
 * @param thresholds - Alert thresholds
 * @returns Array of low CTR alerts
 */
export declare function checkLowCtr(performances: CampaignPerformance[], thresholds?: AlertThresholds): BudgetAlert[];
/**
 * Check for high CPC alerts
 *
 * @param performances - Array of campaign performance data
 * @param targetCpcCents - Target CPC in cents for each campaign
 * @param thresholds - Alert thresholds
 * @returns Array of high CPC alerts
 */
export declare function checkHighCpc(performances: CampaignPerformance[], targetCpcCents: Record<string, number>, thresholds?: AlertThresholds): BudgetAlert[];
/**
 * Check for conversion drop alerts
 *
 * @param currentPeriod - Current period performance data
 * @param previousPeriod - Previous period performance data
 * @param thresholds - Alert thresholds
 * @returns Array of conversion drop alerts
 */
export declare function checkConversionDrops(currentPeriod: CampaignPerformance[], previousPeriod: CampaignPerformance[], thresholds?: AlertThresholds): BudgetAlert[];
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
export declare function generateAllAlerts(campaigns: Campaign[], currentPerformances: CampaignPerformance[], previousPerformances?: CampaignPerformance[], targetCpcCents?: Record<string, number>, thresholds?: AlertThresholds): BudgetAlert[];
/**
 * Determine if a campaign should be auto-paused based on alerts
 *
 * @param alerts - Array of alerts for a specific campaign
 * @returns boolean - True if campaign should be paused
 */
export declare function shouldAutoPause(alerts: BudgetAlert[]): boolean;
/**
 * Get alert summary by severity
 *
 * @param alerts - Array of alerts
 * @returns Summary object with counts by severity
 */
export declare function getAlertSummary(alerts: BudgetAlert[]): {
    high: number;
    medium: number;
    low: number;
    total: number;
};
//# sourceMappingURL=budget-alerts.d.ts.map