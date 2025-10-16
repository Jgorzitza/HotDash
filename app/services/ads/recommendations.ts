/**
 * HITL Campaign Recommendations
 * 
 * Purpose: AI-powered campaign suggestions with human-in-the-loop approval
 * Owner: ads agent
 * Date: 2025-10-15
 */

import type { AdPlatform, CampaignMetrics } from '../../lib/ads/tracking';
import { calculateRoas } from '../../lib/ads/roas';
import { optimizeBudgetAllocation, type BudgetConstraint } from './budget-optimizer';

export type RecommendationType = 
  | 'budget_increase'
  | 'budget_decrease'
  | 'pause_campaign'
  | 'new_campaign'
  | 'optimize_targeting'
  | 'refresh_creative'
  | 'adjust_bidding';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface CampaignRecommendation {
  recommendationId: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  campaignId?: string;
  campaignName?: string;
  platform: AdPlatform;
  title: string;
  description: string;
  reasoning: string;
  evidence: {
    currentMetrics: {
      adSpend: number;
      revenue: number;
      roas: number;
      cpa: number;
      ctr: number;
    };
    projectedImpact: {
      expectedRevenue: number;
      expectedRoas: number;
      revenueIncrease: number;
      roasImprovement: number;
    };
    dataPoints: string[];
  };
  action: {
    description: string;
    parameters: Record<string, any>;
    rollback: string;
  };
  requiresApproval: boolean;
  estimatedImpact: 'high' | 'medium' | 'low';
  confidence: number;
  createdAt: string;
}

export interface RecommendationBatch {
  batchId: string;
  recommendations: CampaignRecommendation[];
  summary: string;
  totalProjectedRevenue: number;
  totalProjectedRoasImprovement: number;
  createdAt: string;
}

export function generateRecommendations(
  campaigns: CampaignMetrics[],
  constraint: BudgetConstraint
): RecommendationBatch {
  const recommendations: CampaignRecommendation[] = [];

  for (const campaign of campaigns) {
    const roas = calculateRoas(campaign.revenue, campaign.adSpend);
    const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
    const cpa = campaign.conversions > 0 ? campaign.adSpend / campaign.conversions : 0;

    if (roas >= 4.0 && ctr >= 2.0) {
      recommendations.push(createBudgetIncreaseRecommendation(campaign, roas, ctr, cpa));
    }

    if (roas < 2.0 || ctr < 0.5) {
      if (roas < 1.0) {
        recommendations.push(createPauseCampaignRecommendation(campaign, roas, ctr, cpa));
      } else {
        recommendations.push(createOptimizeTargetingRecommendation(campaign, roas, ctr, cpa));
      }
    }

    if (roas >= 2.0 && roas < 3.5 && ctr < 1.5) {
      recommendations.push(createRefreshCreativeRecommendation(campaign, roas, ctr, cpa));
    }
  }

  if (campaigns.length > 1) {
    const budgetOptimization = optimizeBudgetAllocation(campaigns, constraint);
    recommendations.push(createBudgetReallocationRecommendation(budgetOptimization));
  }

  const sortedRecommendations = recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.confidence - a.confidence;
  });

  const totalProjectedRevenue = recommendations.reduce((sum, r) => sum + r.evidence.projectedImpact.revenueIncrease, 0);
  const totalProjectedRoasImprovement = recommendations.reduce((sum, r) => sum + r.evidence.projectedImpact.roasImprovement, 0);

  const summary = `Generated ${recommendations.length} recommendations. Projected revenue increase: $${totalProjectedRevenue.toLocaleString()}. Top priority: ${sortedRecommendations[0]?.title || 'None'}.`;

  return {
    batchId: `batch_${Date.now()}`,
    recommendations: sortedRecommendations,
    summary,
    totalProjectedRevenue,
    totalProjectedRoasImprovement,
    createdAt: new Date().toISOString(),
  };
}

function createBudgetIncreaseRecommendation(
  campaign: CampaignMetrics,
  roas: number,
  ctr: number,
  cpa: number
): CampaignRecommendation {
  const newBudget = campaign.adSpend * 1.5;
  const expectedRevenue = newBudget * roas;
  const revenueIncrease = expectedRevenue - campaign.revenue;

  return {
    recommendationId: `rec_${campaign.campaignId}_${Date.now()}`,
    type: 'budget_increase',
    priority: 'high',
    campaignId: campaign.campaignId,
    campaignName: campaign.campaignName,
    platform: campaign.platform,
    title: `Scale ${campaign.campaignName} by 50%`,
    description: `Increase budget from $${campaign.adSpend} to $${newBudget} to maximize returns`,
    reasoning: `Campaign is performing excellently with ${roas.toFixed(2)}x ROAS and ${ctr.toFixed(2)}% CTR. High-performing campaigns should be scaled to maximize revenue.`,
    evidence: {
      currentMetrics: { adSpend: campaign.adSpend, revenue: campaign.revenue, roas, cpa, ctr },
      projectedImpact: {
        expectedRevenue,
        expectedRoas: roas * 0.95,
        revenueIncrease,
        roasImprovement: 0,
      },
      dataPoints: [
        `Current ROAS: ${roas.toFixed(2)}x (excellent)`,
        `Current CTR: ${ctr.toFixed(2)}% (above average)`,
        `Current CPA: $${cpa.toFixed(2)}`,
        `${campaign.conversions} conversions in current period`,
      ],
    },
    action: {
      description: 'Increase daily budget by 50%',
      parameters: { campaignId: campaign.campaignId, currentBudget: campaign.adSpend, newBudget, increasePercent: 50 },
      rollback: `Revert budget to $${campaign.adSpend} if ROAS drops below ${(roas * 0.8).toFixed(2)}x`,
    },
    requiresApproval: true,
    estimatedImpact: 'high',
    confidence: 85,
    createdAt: new Date().toISOString(),
  };
}

function createPauseCampaignRecommendation(
  campaign: CampaignMetrics,
  roas: number,
  ctr: number,
  cpa: number
): CampaignRecommendation {
  return {
    recommendationId: `rec_${campaign.campaignId}_${Date.now()}`,
    type: 'pause_campaign',
    priority: 'critical',
    campaignId: campaign.campaignId,
    campaignName: campaign.campaignName,
    platform: campaign.platform,
    title: `Pause ${campaign.campaignName}`,
    description: `Campaign is underperforming and wasting budget`,
    reasoning: `Campaign has poor ROAS (${roas.toFixed(2)}x) and low CTR (${ctr.toFixed(2)}%). Pausing will prevent further budget waste while you optimize.`,
    evidence: {
      currentMetrics: { adSpend: campaign.adSpend, revenue: campaign.revenue, roas, cpa, ctr },
      projectedImpact: { expectedRevenue: 0, expectedRoas: 0, revenueIncrease: -campaign.revenue, roasImprovement: 0 },
      dataPoints: [
        `Current ROAS: ${roas.toFixed(2)}x (below breakeven)`,
        `Current CTR: ${ctr.toFixed(2)}% (very low)`,
        `Current CPA: $${cpa.toFixed(2)} (too high)`,
        `Wasting $${(campaign.adSpend - campaign.revenue).toFixed(2)} per period`,
      ],
    },
    action: {
      description: 'Pause campaign immediately',
      parameters: { campaignId: campaign.campaignId, action: 'pause' },
      rollback: `Resume campaign after optimization. Test with 25% of original budget.`,
    },
    requiresApproval: true,
    estimatedImpact: 'high',
    confidence: 95,
    createdAt: new Date().toISOString(),
  };
}

function createOptimizeTargetingRecommendation(
  campaign: CampaignMetrics,
  roas: number,
  ctr: number,
  cpa: number
): CampaignRecommendation {
  return {
    recommendationId: `rec_${campaign.campaignId}_${Date.now()}`,
    type: 'optimize_targeting',
    priority: 'medium',
    campaignId: campaign.campaignId,
    campaignName: campaign.campaignName,
    platform: campaign.platform,
    title: `Optimize targeting for ${campaign.campaignName}`,
    description: `Refine audience targeting to improve performance`,
    reasoning: `Campaign has moderate ROAS (${roas.toFixed(2)}x) but could perform better with optimized targeting.`,
    evidence: {
      currentMetrics: { adSpend: campaign.adSpend, revenue: campaign.revenue, roas, cpa, ctr },
      projectedImpact: {
        expectedRevenue: campaign.revenue * 1.3,
        expectedRoas: roas * 1.3,
        revenueIncrease: campaign.revenue * 0.3,
        roasImprovement: roas * 0.3,
      },
      dataPoints: [
        `Current ROAS: ${roas.toFixed(2)}x (below target)`,
        `Current CTR: ${ctr.toFixed(2)}%`,
        `Potential for 30% improvement with better targeting`,
      ],
    },
    action: {
      description: 'Narrow targeting to high-intent audiences',
      parameters: {
        campaignId: campaign.campaignId,
        action: 'optimize_targeting',
        suggestions: ['Exclude low-performing demographics', 'Add negative keywords', 'Refine interest targeting'],
      },
      rollback: `Revert to original targeting if performance doesn't improve in 7 days`,
    },
    requiresApproval: true,
    estimatedImpact: 'medium',
    confidence: 70,
    createdAt: new Date().toISOString(),
  };
}

function createRefreshCreativeRecommendation(
  campaign: CampaignMetrics,
  roas: number,
  ctr: number,
  cpa: number
): CampaignRecommendation {
  return {
    recommendationId: `rec_${campaign.campaignId}_${Date.now()}`,
    type: 'refresh_creative',
    priority: 'medium',
    campaignId: campaign.campaignId,
    campaignName: campaign.campaignName,
    platform: campaign.platform,
    title: `Refresh creative for ${campaign.campaignName}`,
    description: `Update ad creative to improve engagement`,
    reasoning: `Low CTR (${ctr.toFixed(2)}%) suggests creative fatigue or poor engagement. Fresh creative can boost performance.`,
    evidence: {
      currentMetrics: { adSpend: campaign.adSpend, revenue: campaign.revenue, roas, cpa, ctr },
      projectedImpact: {
        expectedRevenue: campaign.revenue * 1.2,
        expectedRoas: roas * 1.2,
        revenueIncrease: campaign.revenue * 0.2,
        roasImprovement: roas * 0.2,
      },
      dataPoints: [
        `Current CTR: ${ctr.toFixed(2)}% (below average)`,
        `Creative refresh typically improves CTR by 20-40%`,
        `Current ROAS: ${roas.toFixed(2)}x (room for improvement)`,
      ],
    },
    action: {
      description: 'Launch new creative variations',
      parameters: {
        campaignId: campaign.campaignId,
        action: 'refresh_creative',
        suggestions: ['Test new imagery', 'Update copy and CTA', 'Try video format'],
      },
      rollback: `Revert to original creative if new variations underperform`,
    },
    requiresApproval: true,
    estimatedImpact: 'medium',
    confidence: 75,
    createdAt: new Date().toISOString(),
  };
}

function createBudgetReallocationRecommendation(optimization: any): CampaignRecommendation {
  return {
    recommendationId: `rec_reallocation_${Date.now()}`,
    type: 'budget_increase',
    priority: 'high',
    platform: 'meta',
    title: 'Reallocate budget to high-ROAS campaigns',
    description: optimization.summary,
    reasoning: `Budget optimization analysis shows potential for ${optimization.expectedImpact.roasImprovementPercent.toFixed(1)}% ROAS improvement`,
    evidence: {
      currentMetrics: {
        adSpend: optimization.totalBudget,
        revenue: 0,
        roas: optimization.expectedImpact.currentTotalRoas,
        cpa: 0,
        ctr: 0,
      },
      projectedImpact: {
        expectedRevenue: 0,
        expectedRoas: optimization.expectedImpact.projectedTotalRoas,
        revenueIncrease: 0,
        roasImprovement: optimization.expectedImpact.roasImprovement,
      },
      dataPoints: [
        `Current ROAS: ${optimization.expectedImpact.currentTotalRoas.toFixed(2)}x`,
        `Projected ROAS: ${optimization.expectedImpact.projectedTotalRoas.toFixed(2)}x`,
        `Improvement: ${optimization.expectedImpact.roasImprovementPercent.toFixed(1)}%`,
      ],
    },
    action: {
      description: 'Reallocate budget based on ROAS performance',
      parameters: { action: 'reallocate_budget', allocations: optimization.recommendedAllocation.byCampaign },
      rollback: 'Revert to original budget allocation if aggregate ROAS declines',
    },
    requiresApproval: true,
    estimatedImpact: 'high',
    confidence: 80,
    createdAt: new Date().toISOString(),
  };
}

