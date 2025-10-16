/**
 * Cost Cap & Bid Strategy Report
 * 
 * Purpose: Analyze and report on bidding strategies and cost caps
 * Owner: ads agent
 * Date: 2025-10-15
 */

import type { AdPlatform } from './tracking';

export type BidStrategy = 
  | 'lowest_cost'
  | 'cost_cap'
  | 'bid_cap'
  | 'target_cost'
  | 'maximize_conversions'
  | 'target_roas';

export interface BidStrategyConfig {
  campaignId: string;
  campaignName: string;
  platform: AdPlatform;
  strategy: BidStrategy;
  costCap?: number;
  bidCap?: number;
  targetCpa?: number;
  targetRoas?: number;
}

export interface BidStrategyPerformance extends BidStrategyConfig {
  actualCpa: number;
  actualRoas: number;
  performanceVsTarget: number;
  recommendation: string;
  shouldAdjust: boolean;
}

export function analyzeBidStrategy(
  config: BidStrategyConfig,
  actualCpa: number,
  actualRoas: number
): BidStrategyPerformance {
  let performanceVsTarget = 0;
  let recommendation = '';
  let shouldAdjust = false;

  switch (config.strategy) {
    case 'cost_cap':
      if (config.costCap) {
        performanceVsTarget = ((actualCpa - config.costCap) / config.costCap) * 100;
        if (actualCpa > config.costCap * 1.2) {
          shouldAdjust = true;
          recommendation = `CPA ${actualCpa.toFixed(2)} exceeds cost cap ${config.costCap.toFixed(2)} by ${performanceVsTarget.toFixed(1)}%. Increase cost cap or optimize targeting.`;
        } else {
          recommendation = `CPA within cost cap. Continue monitoring.`;
        }
      }
      break;

    case 'target_cost':
      if (config.targetCpa) {
        performanceVsTarget = ((actualCpa - config.targetCpa) / config.targetCpa) * 100;
        if (Math.abs(performanceVsTarget) > 20) {
          shouldAdjust = true;
          recommendation = `CPA ${actualCpa.toFixed(2)} deviates ${Math.abs(performanceVsTarget).toFixed(1)}% from target ${config.targetCpa.toFixed(2)}. Adjust bid strategy.`;
        } else {
          recommendation = `CPA close to target. Strategy working well.`;
        }
      }
      break;

    case 'target_roas':
      if (config.targetRoas) {
        performanceVsTarget = ((actualRoas - config.targetRoas) / config.targetRoas) * 100;
        if (actualRoas < config.targetRoas * 0.8) {
          shouldAdjust = true;
          recommendation = `ROAS ${actualRoas.toFixed(2)}x below target ${config.targetRoas.toFixed(2)}x by ${Math.abs(performanceVsTarget).toFixed(1)}%. Optimize or reduce budget.`;
        } else {
          recommendation = `ROAS meeting or exceeding target. Consider scaling.`;
        }
      }
      break;

    default:
      recommendation = `Using ${config.strategy} strategy. Monitor performance and consider switching to target-based bidding.`;
  }

  return {
    ...config,
    actualCpa,
    actualRoas,
    performanceVsTarget,
    recommendation,
    shouldAdjust,
  };
}

export function recommendBidStrategy(
  currentRoas: number,
  currentCpa: number,
  targetRoas?: number,
  targetCpa?: number
): {
  recommendedStrategy: BidStrategy;
  reasoning: string;
  suggestedTarget?: number;
} {
  if (targetRoas && currentRoas >= targetRoas * 1.2) {
    return {
      recommendedStrategy: 'target_roas',
      reasoning: `Strong ROAS performance (${currentRoas.toFixed(2)}x). Use target ROAS bidding to scale efficiently.`,
      suggestedTarget: currentRoas * 0.9,
    };
  }

  if (targetCpa && currentCpa <= targetCpa * 0.8) {
    return {
      recommendedStrategy: 'target_cost',
      reasoning: `CPA below target ($${currentCpa.toFixed(2)}). Use target cost bidding to maintain efficiency while scaling.`,
      suggestedTarget: currentCpa * 1.1,
    };
  }

  if (currentRoas < 2.0) {
    return {
      recommendedStrategy: 'cost_cap',
      reasoning: `Low ROAS (${currentRoas.toFixed(2)}x). Use cost cap to control CPA and improve profitability.`,
      suggestedTarget: currentCpa * 0.8,
    };
  }

  return {
    recommendedStrategy: 'lowest_cost',
    reasoning: `Moderate performance. Use lowest cost to maximize volume while monitoring CPA.`,
  };
}

