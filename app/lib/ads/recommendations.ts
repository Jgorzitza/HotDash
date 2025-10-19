/**
 * Campaign Recommendations
 *
 * AI-powered campaign optimization suggestions
 *
 * @module app/lib/ads/recommendations
 */

import type { Campaign } from "./types";

export enum RecommendationType {
  INCREASE_BUDGET = "increase_budget",
  DECREASE_BUDGET = "decrease_budget",
  PAUSE_CAMPAIGN = "pause_campaign",
  EXPAND_TARGETING = "expand_targeting",
  OPTIMIZE_CREATIVE = "optimize_creative",
  ADJUST_BIDDING = "adjust_bidding",
}

export interface Recommendation {
  type: RecommendationType;
  campaignId: string;
  campaignName: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  evidence: string[];
  projectedImpact: {
    roasChange?: number;
    revenueChange?: number;
    spendChange?: number;
  };
  actionItems: string[];
}

/**
 * Generate recommendations for campaigns
 */
export function generateRecommendations(
  campaigns: Campaign[],
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const campaign of campaigns) {
    // High ROAS - recommend budget increase
    if (campaign.metrics.roas > 4.0 && campaign.metrics.spend > 0) {
      recommendations.push({
        type: RecommendationType.INCREASE_BUDGET,
        campaignId: campaign.id,
        campaignName: campaign.name,
        priority: "high",
        title: `Scale ${campaign.name} - Excellent ROAS`,
        description: `Campaign has ${campaign.metrics.roas.toFixed(1)}x ROAS. Consider increasing budget to capture more revenue.`,
        evidence: [
          `Current ROAS: ${campaign.metrics.roas.toFixed(2)}x (target: 4.0x)`,
          `Current spend: $${campaign.metrics.spend}`,
          `Revenue: $${campaign.metrics.revenue}`,
        ],
        projectedImpact: {
          roasChange: 0,
          revenueChange: campaign.metrics.revenue * 0.5,
          spendChange: campaign.dailyBudget * 0.5,
        },
        actionItems: [
          `Increase daily budget from $${campaign.dailyBudget} to $${campaign.dailyBudget * 1.5}`,
          "Monitor ROAS for 3 days",
          "Rollback if ROAS drops below 3.5x",
        ],
      });
    }

    // Low ROAS - recommend pause
    if (campaign.metrics.roas < 2.0 && campaign.metrics.spend > 100) {
      recommendations.push({
        type: RecommendationType.PAUSE_CAMPAIGN,
        campaignId: campaign.id,
        campaignName: campaign.name,
        priority: "high",
        title: `Pause ${campaign.name} - Low ROAS`,
        description: `Campaign ROAS ${campaign.metrics.roas.toFixed(1)}x is below 2.0x threshold.`,
        evidence: [
          `Current ROAS: ${campaign.metrics.roas.toFixed(2)}x (target: 2.0x)`,
          `Spend: $${campaign.metrics.spend} with low return`,
          `CPA: $${campaign.metrics.cpa.toFixed(2)}`,
        ],
        projectedImpact: {
          spendChange: -campaign.dailyBudget,
          revenueChange: 0,
        },
        actionItems: [
          "Pause campaign immediately",
          "Analyze targeting and creative",
          "Test with lower budget before resuming",
        ],
      });
    }

    // Zero conversions - investigate
    if (campaign.metrics.conversions === 0 && campaign.metrics.spend > 50) {
      recommendations.push({
        type: RecommendationType.OPTIMIZE_CREATIVE,
        campaignId: campaign.id,
        campaignName: campaign.name,
        priority: "medium",
        title: `${campaign.name} - No Conversions`,
        description: `Campaign has ${campaign.metrics.clicks} clicks but zero conversions. Creative or landing page may need optimization.`,
        evidence: [
          `Clicks: ${campaign.metrics.clicks}`,
          `Conversions: 0`,
          `CTR: ${campaign.metrics.ctr.toFixed(2)}% (traffic quality OK)`,
        ],
        projectedImpact: {
          roasChange: 2.0,
        },
        actionItems: [
          "Review landing page conversion funnel",
          "Test new ad creative",
          "Check conversion tracking setup",
        ],
      });
    }
  }

  // Sort by priority
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
