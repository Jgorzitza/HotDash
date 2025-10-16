/**
 * Budget Allocation Optimizer
 * 
 * Purpose: Optimize ad budget allocation across channels and campaigns
 * Owner: ads agent
 * Date: 2025-10-15
 */

import type { AdPlatform, CampaignMetrics } from '../../lib/ads/tracking';
import { calculateRoas } from '../../lib/ads/roas';

export interface BudgetConstraint {
  totalBudget: number;
  minBudgetPerPlatform?: number;
  maxBudgetPerPlatform?: number;
  minBudgetPerCampaign?: number;
  platformLimits?: Partial<Record<AdPlatform, { min: number; max: number }>>;
}

export interface CampaignBudgetAllocation {
  campaignId: string;
  campaignName: string;
  platform: AdPlatform;
  currentBudget: number;
  recommendedBudget: number;
  budgetChange: number;
  budgetChangePercent: number;
  expectedRoas: number;
  reasoning: string;
}

export interface PlatformBudgetAllocation {
  platform: AdPlatform;
  currentBudget: number;
  recommendedBudget: number;
  budgetChange: number;
  budgetChangePercent: number;
  campaigns: number;
  averageRoas: number;
}

export interface BudgetOptimizationResult {
  totalBudget: number;
  currentAllocation: {
    byPlatform: PlatformBudgetAllocation[];
    byCampaign: CampaignBudgetAllocation[];
  };
  recommendedAllocation: {
    byPlatform: PlatformBudgetAllocation[];
    byCampaign: CampaignBudgetAllocation[];
  };
  expectedImpact: {
    currentTotalRoas: number;
    projectedTotalRoas: number;
    roasImprovement: number;
    roasImprovementPercent: number;
  };
  summary: string;
}

export function optimizeBudgetAllocation(
  campaigns: CampaignMetrics[],
  constraint: BudgetConstraint
): BudgetOptimizationResult {
  if (campaigns.length === 0) {
    throw new Error('Cannot optimize budget with no campaigns');
  }

  const campaignsWithRoas = campaigns.map(c => ({
    ...c,
    roas: calculateRoas(c.revenue, c.adSpend),
  }));

  const sortedCampaigns = [...campaignsWithRoas].sort((a, b) => b.roas - a.roas);

  const currentTotalBudget = campaigns.reduce((sum, c) => sum + c.adSpend, 0);
  const currentTotalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const currentTotalRoas = calculateRoas(currentTotalRevenue, currentTotalBudget);

  const totalRoasWeight = sortedCampaigns.reduce((sum, c) => sum + c.roas, 0);
  
  const campaignAllocations: CampaignBudgetAllocation[] = sortedCampaigns.map(campaign => {
    const roasWeight = campaign.roas / totalRoasWeight;
    let recommendedBudget = constraint.totalBudget * roasWeight;

    if (constraint.minBudgetPerCampaign) {
      recommendedBudget = Math.max(recommendedBudget, constraint.minBudgetPerCampaign);
    }

    const budgetChange = recommendedBudget - campaign.adSpend;
    const budgetChangePercent = (budgetChange / campaign.adSpend) * 100;

    let reasoning = '';
    if (campaign.roas >= 4.0) {
      reasoning = `High ROAS (${campaign.roas.toFixed(2)}x) - increase budget to scale`;
    } else if (campaign.roas >= 2.5) {
      reasoning = `Good ROAS (${campaign.roas.toFixed(2)}x) - maintain or slightly increase`;
    } else if (campaign.roas >= 1.5) {
      reasoning = `Moderate ROAS (${campaign.roas.toFixed(2)}x) - optimize or reduce`;
    } else {
      reasoning = `Low ROAS (${campaign.roas.toFixed(2)}x) - consider pausing or major optimization`;
    }

    return {
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      platform: campaign.platform,
      currentBudget: campaign.adSpend,
      recommendedBudget,
      budgetChange,
      budgetChangePercent,
      expectedRoas: campaign.roas,
      reasoning,
    };
  });

  const totalRecommended = campaignAllocations.reduce((sum, c) => sum + c.recommendedBudget, 0);
  const normalizationFactor = constraint.totalBudget / totalRecommended;

  campaignAllocations.forEach(allocation => {
    allocation.recommendedBudget *= normalizationFactor;
    allocation.budgetChange = allocation.recommendedBudget - allocation.currentBudget;
    allocation.budgetChangePercent = (allocation.budgetChange / allocation.currentBudget) * 100;
  });

  const platformMap = new Map<AdPlatform, {
    currentBudget: number;
    recommendedBudget: number;
    campaigns: number;
    totalRoas: number;
  }>();

  for (const allocation of campaignAllocations) {
    const existing = platformMap.get(allocation.platform) || {
      currentBudget: 0,
      recommendedBudget: 0,
      campaigns: 0,
      totalRoas: 0,
    };

    platformMap.set(allocation.platform, {
      currentBudget: existing.currentBudget + allocation.currentBudget,
      recommendedBudget: existing.recommendedBudget + allocation.recommendedBudget,
      campaigns: existing.campaigns + 1,
      totalRoas: existing.totalRoas + allocation.expectedRoas,
    });
  }

  const currentPlatformAllocations: PlatformBudgetAllocation[] = [];
  const recommendedPlatformAllocations: PlatformBudgetAllocation[] = [];

  for (const [platform, data] of platformMap.entries()) {
    const budgetChange = data.recommendedBudget - data.currentBudget;
    const budgetChangePercent = (budgetChange / data.currentBudget) * 100;
    const averageRoas = data.totalRoas / data.campaigns;

    currentPlatformAllocations.push({
      platform,
      currentBudget: data.currentBudget,
      recommendedBudget: data.currentBudget,
      budgetChange: 0,
      budgetChangePercent: 0,
      campaigns: data.campaigns,
      averageRoas,
    });

    recommendedPlatformAllocations.push({
      platform,
      currentBudget: data.currentBudget,
      recommendedBudget: data.recommendedBudget,
      budgetChange,
      budgetChangePercent,
      campaigns: data.campaigns,
      averageRoas,
    });
  }

  const projectedTotalRevenue = campaignAllocations.reduce(
    (sum, c) => sum + (c.recommendedBudget * c.expectedRoas),
    0
  );
  const projectedTotalRoas = calculateRoas(projectedTotalRevenue, constraint.totalBudget);
  const roasImprovement = projectedTotalRoas - currentTotalRoas;
  const roasImprovementPercent = (roasImprovement / currentTotalRoas) * 100;

  const topCampaign = campaignAllocations[0];
  const summary = `Reallocate budget to prioritize high-ROAS campaigns. ` +
    `Top performer: ${topCampaign.campaignName} (${topCampaign.expectedRoas.toFixed(2)}x ROAS). ` +
    `Expected ROAS improvement: ${roasImprovementPercent.toFixed(1)}% ` +
    `(${currentTotalRoas.toFixed(2)}x → ${projectedTotalRoas.toFixed(2)}x)`;

  return {
    totalBudget: constraint.totalBudget,
    currentAllocation: {
      byPlatform: currentPlatformAllocations,
      byCampaign: campaignAllocations.map(c => ({
        ...c,
        recommendedBudget: c.currentBudget,
        budgetChange: 0,
        budgetChangePercent: 0,
      })),
    },
    recommendedAllocation: {
      byPlatform: recommendedPlatformAllocations,
      byCampaign: campaignAllocations,
    },
    expectedImpact: {
      currentTotalRoas,
      projectedTotalRoas,
      roasImprovement,
      roasImprovementPercent,
    },
    summary,
  };
}

export function recommendBudgetScaling(
  currentBudget: number,
  currentRoas: number,
  targetRoas: number = 3.0
): {
  recommendedBudget: number;
  budgetChange: number;
  budgetChangePercent: number;
  action: 'increase' | 'decrease' | 'maintain';
  reasoning: string;
} {
  let action: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let recommendedBudget = currentBudget;
  let reasoning = '';

  if (currentRoas >= targetRoas * 1.5) {
    recommendedBudget = currentBudget * 1.5;
    action = 'increase';
    reasoning = `Excellent ROAS (${currentRoas.toFixed(2)}x) - scale up 50% to maximize returns`;
  } else if (currentRoas >= targetRoas) {
    recommendedBudget = currentBudget * 1.25;
    action = 'increase';
    reasoning = `Good ROAS (${currentRoas.toFixed(2)}x) - scale up 25% to grow efficiently`;
  } else if (currentRoas >= targetRoas * 0.75) {
    recommendedBudget = currentBudget;
    action = 'maintain';
    reasoning = `Moderate ROAS (${currentRoas.toFixed(2)}x) - maintain budget and optimize`;
  } else if (currentRoas >= targetRoas * 0.5) {
    recommendedBudget = currentBudget * 0.75;
    action = 'decrease';
    reasoning = `Below target ROAS (${currentRoas.toFixed(2)}x) - reduce 25% and optimize`;
  } else {
    recommendedBudget = currentBudget * 0.5;
    action = 'decrease';
    reasoning = `Low ROAS (${currentRoas.toFixed(2)}x) - reduce 50% or pause for optimization`;
  }

  const budgetChange = recommendedBudget - currentBudget;
  const budgetChangePercent = (budgetChange / currentBudget) * 100;

  return {
    recommendedBudget,
    budgetChange,
    budgetChangePercent,
    action,
    reasoning,
  };
}

