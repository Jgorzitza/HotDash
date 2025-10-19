/**
 * Budget Optimizer
 *
 * Optimize budget allocation across campaigns to maximize ROAS
 *
 * @module app/lib/ads/budget-optimizer
 */

import type { Campaign } from "./types";

export interface BudgetAllocation {
  campaignId: string;
  campaignName: string;
  currentBudget: number;
  recommendedBudget: number;
  change: number;
  percentChange: number;
  projectedROAS: number;
  rationale: string;
}

/**
 * Optimize budget allocation across campaigns
 *
 * @param campaigns - List of campaigns
 * @param totalBudget - Total available daily budget
 * @returns Recommended budget allocations
 */
export function optimizeBudgetAllocation(
  campaigns: Campaign[],
  totalBudget: number,
): BudgetAllocation[] {
  const allocations: BudgetAllocation[] = [];

  // Filter active campaigns with spend
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "active" && c.metrics.spend > 0,
  );

  if (activeCampaigns.length === 0) {
    return allocations;
  }

  // Calculate ROAS-weighted scores
  const totalROASWeight = activeCampaigns.reduce(
    (sum, c) => sum + Math.max(c.metrics.roas, 0.1),
    0,
  );

  for (const campaign of activeCampaigns) {
    const roasWeight = Math.max(campaign.metrics.roas, 0.1);
    const budgetShare = (roasWeight / totalROASWeight) * totalBudget;
    const change = budgetShare - campaign.dailyBudget;
    const percentChange =
      campaign.dailyBudget > 0 ? (change / campaign.dailyBudget) * 100 : 0;

    let rationale = "";
    if (campaign.metrics.roas > 4.0) {
      rationale = "High ROAS - allocate more budget to maximize returns";
    } else if (campaign.metrics.roas > 2.0) {
      rationale = "Good ROAS - maintain or slightly increase budget";
    } else {
      rationale = "Low ROAS - reduce budget or pause";
    }

    allocations.push({
      campaignId: campaign.id,
      campaignName: campaign.name,
      currentBudget: campaign.dailyBudget,
      recommendedBudget: Math.round(budgetShare * 100) / 100,
      change: Math.round(change * 100) / 100,
      percentChange: Math.round(percentChange * 10) / 10,
      projectedROAS: campaign.metrics.roas,
      rationale,
    });
  }

  return allocations.sort((a, b) => b.projectedROAS - a.projectedROAS);
}

/**
 * Calculate optimal budget for a campaign based on ROAS curve
 */
export function calculateOptimalBudget(
  campaign: Campaign,
  targetROAS: number = 3.0,
): number {
  // Simplified model: assume linear ROAS up to saturation point
  const currentROAS = campaign.metrics.roas;
  const currentBudget = campaign.dailyBudget;

  if (currentROAS >= targetROAS) {
    // Already meeting target - can increase budget
    return currentBudget * 1.5;
  } else {
    // Below target - reduce or pause
    return currentBudget * 0.7;
  }
}
