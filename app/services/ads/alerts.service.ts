/**
 * Ads Alerts Service
 *
 * Monitor campaign performance and generate alerts
 *
 * @module app/services/ads/alerts.service
 */

import type { Campaign } from "~/lib/ads";
import { AdsConfig } from "~/config/ads.server";

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = "info",
  WARNING = "warning",
  CRITICAL = "critical",
}

/**
 * Alert type
 */
export interface CampaignAlert {
  campaignId: string;
  campaignName: string;
  severity: AlertSeverity;
  type: string;
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: string;
}

/**
 * Check campaigns for performance issues
 *
 * @param campaigns - List of campaigns to check
 * @returns Array of alerts
 */
export function checkCampaignAlerts(campaigns: Campaign[]): CampaignAlert[] {
  const alerts: CampaignAlert[] = [];
  const now = new Date().toISOString();

  for (const campaign of campaigns) {
    // Check ROAS threshold
    if (
      campaign.metrics.roas < AdsConfig.alerts.minROAS &&
      campaign.metrics.spend > 0
    ) {
      alerts.push({
        campaignId: campaign.id,
        campaignName: campaign.name,
        severity: AlertSeverity.CRITICAL,
        type: "LOW_ROAS",
        message: `ROAS ${campaign.metrics.roas.toFixed(2)}x is below threshold ${AdsConfig.alerts.minROAS}x`,
        threshold: AdsConfig.alerts.minROAS,
        actualValue: campaign.metrics.roas,
        timestamp: now,
      });
    }

    // Check CPA threshold
    if (campaign.metrics.cpa > AdsConfig.alerts.maxCPA) {
      alerts.push({
        campaignId: campaign.id,
        campaignName: campaign.name,
        severity: AlertSeverity.WARNING,
        type: "HIGH_CPA",
        message: `CPA $${campaign.metrics.cpa.toFixed(2)} exceeds threshold $${AdsConfig.alerts.maxCPA}`,
        threshold: AdsConfig.alerts.maxCPA,
        actualValue: campaign.metrics.cpa,
        timestamp: now,
      });
    }

    // Check daily spend limit
    if (campaign.metrics.spend > AdsConfig.alerts.maxDailySpend) {
      alerts.push({
        campaignId: campaign.id,
        campaignName: campaign.name,
        severity: AlertSeverity.CRITICAL,
        type: "OVERSPEND",
        message: `Daily spend $${campaign.metrics.spend.toFixed(2)} exceeds limit $${AdsConfig.alerts.maxDailySpend}`,
        threshold: AdsConfig.alerts.maxDailySpend,
        actualValue: campaign.metrics.spend,
        timestamp: now,
      });
    }

    // Check budget pacing
    if (campaign.dailyBudget > 0) {
      const budgetUtilization =
        (campaign.metrics.spend / campaign.dailyBudget) * 100;
      if (budgetUtilization > 120) {
        alerts.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          severity: AlertSeverity.WARNING,
          type: "BUDGET_OVERRUN",
          message: `Spend is ${budgetUtilization.toFixed(0)}% of daily budget`,
          threshold: 120,
          actualValue: budgetUtilization,
          timestamp: now,
        });
      }
    }

    // Check for zero conversions with significant spend
    if (campaign.metrics.conversions === 0 && campaign.metrics.spend > 100) {
      alerts.push({
        campaignId: campaign.id,
        campaignName: campaign.name,
        severity: AlertSeverity.CRITICAL,
        type: "ZERO_CONVERSIONS",
        message: `No conversions despite $${campaign.metrics.spend.toFixed(2)} spend`,
        threshold: 1,
        actualValue: 0,
        timestamp: now,
      });
    }
  }

  return alerts;
}

/**
 * Get critical alerts only
 */
export function getCriticalAlerts(campaigns: Campaign[]): CampaignAlert[] {
  return checkCampaignAlerts(campaigns).filter(
    (alert) => alert.severity === AlertSeverity.CRITICAL,
  );
}

/**
 * Group alerts by campaign
 */
export function groupAlertsByCampaign(
  alerts: CampaignAlert[],
): Map<string, CampaignAlert[]> {
  const grouped = new Map<string, CampaignAlert[]>();

  for (const alert of alerts) {
    const existing = grouped.get(alert.campaignId) || [];
    existing.push(alert);
    grouped.set(alert.campaignId, existing);
  }

  return grouped;
}
