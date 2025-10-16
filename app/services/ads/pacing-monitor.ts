/**
 * Ads Budget Pacing Monitor Service
 *
 * Purpose: Compute pacing alerts from budget configs + current spend
 */

import { monitorBudgetPacing, getCampaignsRequiringAttention, type BudgetConfig, type BudgetPacing } from '../../lib/ads/budget-pacing';
import type { CampaignMetrics } from '../../lib/ads/tracking';

export interface PacingAlert {
  campaignId: string;
  campaignName: string;
  platform: CampaignMetrics['platform'];
  status: 'overspending' | 'depleted';
  pacingPercent: number;
  recommendation: string;
}

export function buildBudgetConfigs(campaigns: CampaignMetrics[], period: 'monthly' | 'weekly' | 'daily' = 'monthly'): Array<{ config: BudgetConfig; currentSpend: number }> {
  // Demo: derive budgets from historical spend; in real impl, fetch budgets from DB
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const toDate = (d: Date) => d.toISOString().split('T')[0];

  return campaigns.map((c) => ({
    config: {
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      platform: c.platform,
      totalBudget: Math.max(500, Math.round((c.adSpend || 0) * 1.2)),
      period,
      startDate: toDate(start),
      endDate: toDate(end),
    },
    currentSpend: c.adSpend || 0,
  }));
}

export function computePacingAlerts(campaigns: CampaignMetrics[]): { pacings: BudgetPacing[]; alerts: PacingAlert[] } {
  const budgets = buildBudgetConfigs(campaigns);
  const pacings = monitorBudgetPacing(budgets);
  const needsAttention = getCampaignsRequiringAttention(pacings);

  const alerts: PacingAlert[] = needsAttention.map((p) => ({
    campaignId: p.config.campaignId,
    campaignName: p.config.campaignName,
    platform: p.config.platform,
    status: p.pacingStatus as PacingAlert['status'],
    pacingPercent: p.pacingPercent,
    recommendation: p.recommendation,
  }));

  return { pacings, alerts };
}

