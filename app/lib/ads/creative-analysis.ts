/**
 * Creative Performance Analysis
 * 
 * Purpose: Track and analyze ad creative effectiveness
 * Owner: ads agent
 * Date: 2025-10-15
 */

import type { AdPlatform } from './tracking';

export type CreativeType = 'image' | 'video' | 'carousel' | 'collection' | 'story';
export type CreativeFormat = 'square' | 'landscape' | 'portrait' | 'story';

export interface CreativeMetrics {
  creativeId: string;
  creativeName: string;
  type: CreativeType;
  format: CreativeFormat;
  platform: AdPlatform;
  campaignId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  adSpend: number;
  revenue: number;
  dateStart: string;
  dateEnd: string;
  thumbnailUrl?: string;
}

export interface CreativePerformance extends CreativeMetrics {
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  conversionRate: number;
  engagementScore: number;
  fatigueScore: number;
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';
}

export interface CreativeComparison {
  creativeA: CreativePerformance;
  creativeB: CreativePerformance;
  winner: 'A' | 'B' | 'tie';
  metrics: {
    ctrDiff: number;
    cpcDiff: number;
    roasDiff: number;
    conversionRateDiff: number;
  };
  recommendation: string;
}

export interface CreativeFatigue {
  creativeId: string;
  creativeName: string;
  daysActive: number;
  impressionsPerDay: number;
  ctrTrend: 'increasing' | 'stable' | 'decreasing';
  ctrDeclinePercent: number;
  fatigueLevel: 'none' | 'low' | 'medium' | 'high';
  recommendation: string;
}

export function analyzeCreativePerformance(metrics: CreativeMetrics): CreativePerformance {
  const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
  const cpc = metrics.clicks > 0 ? metrics.adSpend / metrics.clicks : 0;
  const cpa = metrics.conversions > 0 ? metrics.adSpend / metrics.conversions : 0;
  const roas = metrics.adSpend > 0 ? metrics.revenue / metrics.adSpend : 0;
  const conversionRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;

  const ctrScore = Math.min(ctr * 20, 50);
  const conversionScore = Math.min(conversionRate * 5, 50);
  const engagementScore = Math.min(ctrScore + conversionScore, 100);

  const impressionToClickRatio = metrics.clicks > 0 ? metrics.impressions / metrics.clicks : 1000;
  const fatigueScore = Math.min((impressionToClickRatio / 10), 100);

  let performanceRating: CreativePerformance['performanceRating'] = 'average';
  if (roas >= 4.0 && ctr >= 2.0) {
    performanceRating = 'excellent';
  } else if (roas >= 3.0 && ctr >= 1.5) {
    performanceRating = 'good';
  } else if (roas < 2.0 || ctr < 0.5) {
    performanceRating = 'poor';
  }

  return {
    ...metrics,
    ctr,
    cpc,
    cpa,
    roas,
    conversionRate,
    engagementScore,
    fatigueScore,
    performanceRating,
  };
}

export function compareCreatives(
  creativeA: CreativePerformance,
  creativeB: CreativePerformance
): CreativeComparison {
  const ctrDiff = ((creativeA.ctr - creativeB.ctr) / creativeB.ctr) * 100;
  const cpcDiff = ((creativeA.cpc - creativeB.cpc) / creativeB.cpc) * 100;
  const roasDiff = ((creativeA.roas - creativeB.roas) / creativeB.roas) * 100;
  const conversionRateDiff = ((creativeA.conversionRate - creativeB.conversionRate) / creativeB.conversionRate) * 100;

  let winner: 'A' | 'B' | 'tie' = 'tie';
  if (creativeA.roas > creativeB.roas * 1.1) {
    winner = 'A';
  } else if (creativeB.roas > creativeA.roas * 1.1) {
    winner = 'B';
  } else if (creativeA.ctr > creativeB.ctr * 1.1) {
    winner = 'A';
  } else if (creativeB.ctr > creativeA.ctr * 1.1) {
    winner = 'B';
  }

  let recommendation = '';
  if (winner === 'A') {
    recommendation = `Creative A (${creativeA.creativeName}) performs ${Math.abs(roasDiff).toFixed(1)}% better. Allocate more budget to Creative A.`;
  } else if (winner === 'B') {
    recommendation = `Creative B (${creativeB.creativeName}) performs ${Math.abs(roasDiff).toFixed(1)}% better. Allocate more budget to Creative B.`;
  } else {
    recommendation = `Both creatives perform similarly. Continue testing or try new variations.`;
  }

  return {
    creativeA,
    creativeB,
    winner,
    metrics: { ctrDiff, cpcDiff, roasDiff, conversionRateDiff },
    recommendation,
  };
}

export function detectCreativeFatigue(
  creative: CreativePerformance,
  historicalCtr: number[]
): CreativeFatigue {
  const startDate = new Date(creative.dateStart);
  const endDate = new Date(creative.dateEnd);
  const daysActive = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const impressionsPerDay = creative.impressions / Math.max(daysActive, 1);

  let ctrTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  let ctrDeclinePercent = 0;

  if (historicalCtr.length >= 2) {
    const firstHalf = historicalCtr.slice(0, Math.floor(historicalCtr.length / 2));
    const secondHalf = historicalCtr.slice(Math.floor(historicalCtr.length / 2));
    const firstAvg = firstHalf.reduce((sum, ctr) => sum + ctr, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, ctr) => sum + ctr, 0) / secondHalf.length;
    ctrDeclinePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (ctrDeclinePercent < -10) {
      ctrTrend = 'decreasing';
    } else if (ctrDeclinePercent > 10) {
      ctrTrend = 'increasing';
    }
  }

  let fatigueLevel: CreativeFatigue['fatigueLevel'] = 'none';
  if (ctrTrend === 'decreasing' && Math.abs(ctrDeclinePercent) > 30) {
    fatigueLevel = 'high';
  } else if (ctrTrend === 'decreasing' && Math.abs(ctrDeclinePercent) > 15) {
    fatigueLevel = 'medium';
  } else if (ctrTrend === 'decreasing' && Math.abs(ctrDeclinePercent) > 5) {
    fatigueLevel = 'low';
  }

  let recommendation = '';
  if (fatigueLevel === 'high') {
    recommendation = `High fatigue detected (${Math.abs(ctrDeclinePercent).toFixed(1)}% CTR decline). Pause and launch new variations immediately.`;
  } else if (fatigueLevel === 'medium') {
    recommendation = `Moderate fatigue detected (${Math.abs(ctrDeclinePercent).toFixed(1)}% CTR decline). Prepare new creative variations.`;
  } else if (fatigueLevel === 'low') {
    recommendation = `Slight fatigue detected (${Math.abs(ctrDeclinePercent).toFixed(1)}% CTR decline). Monitor closely.`;
  } else {
    recommendation = `No fatigue detected. Creative is performing well.`;
  }

  return {
    creativeId: creative.creativeId,
    creativeName: creative.creativeName,
    daysActive,
    impressionsPerDay,
    ctrTrend,
    ctrDeclinePercent,
    fatigueLevel,
    recommendation,
  };
}

export function findBestCreatives(
  creatives: CreativePerformance[],
  limit: number = 5
): CreativePerformance[] {
  return [...creatives].sort((a, b) => b.roas - a.roas).slice(0, limit);
}

export function recommendCreativeRefresh(creative: CreativePerformance): {
  shouldRefresh: boolean;
  urgency: 'low' | 'medium' | 'high';
  reasons: string[];
  suggestions: string[];
} {
  const reasons: string[] = [];
  const suggestions: string[] = [];
  let shouldRefresh = false;
  let urgency: 'low' | 'medium' | 'high' = 'low';

  if (creative.performanceRating === 'poor') {
    shouldRefresh = true;
    urgency = 'high';
    reasons.push(`Poor performance (ROAS: ${creative.roas.toFixed(2)}x, CTR: ${creative.ctr.toFixed(2)}%)`);
    suggestions.push('Test completely different creative concepts');
  }

  if (creative.fatigueScore > 70) {
    shouldRefresh = true;
    urgency = urgency === 'high' ? 'high' : 'medium';
    reasons.push(`High creative fatigue (score: ${creative.fatigueScore.toFixed(0)})`);
    suggestions.push('Rotate to fresh creative variations');
  }

  if (creative.engagementScore < 30) {
    shouldRefresh = true;
    urgency = urgency === 'high' ? 'high' : 'medium';
    reasons.push(`Low engagement (score: ${creative.engagementScore.toFixed(0)})`);
    suggestions.push('Test more compelling hooks or CTAs');
  }

  if (!shouldRefresh) {
    reasons.push('Creative is performing well');
    suggestions.push('Continue monitoring performance');
  }

  return { shouldRefresh, urgency, reasons, suggestions };
}

