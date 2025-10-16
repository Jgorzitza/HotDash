/**
 * Audience Insights
 * 
 * Purpose: Analyze audience performance and targeting effectiveness
 * Owner: ads agent
 * Date: 2025-10-15
 */

import type { AdPlatform } from './tracking';

export type AudienceType = 'custom' | 'lookalike' | 'interest' | 'demographic' | 'behavioral' | 'retargeting';

export interface DemographicSegment {
  ageRange: string;
  gender: 'male' | 'female' | 'all';
  location: string;
}

export interface AudienceMetrics {
  audienceId: string;
  audienceName: string;
  type: AudienceType;
  platform: AdPlatform;
  size: number;
  impressions: number;
  clicks: number;
  conversions: number;
  adSpend: number;
  revenue: number;
  demographic?: DemographicSegment;
  interests?: string[];
}

export interface AudiencePerformance extends AudienceMetrics {
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  conversionRate: number;
  costPerImpression: number;
  performanceScore: number;
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';
  scalability: 'high' | 'medium' | 'low';
}

export interface AudienceComparison {
  audiences: AudiencePerformance[];
  topPerformer: AudiencePerformance;
  worstPerformer: AudiencePerformance;
  averageRoas: number;
  recommendation: string;
}

export interface LookalikeRecommendation {
  sourceAudienceId: string;
  sourceAudienceName: string;
  sourcePerformance: {
    roas: number;
    cpa: number;
    conversionRate: number;
  };
  recommendedSimilarity: number;
  estimatedSize: number;
  estimatedPerformance: {
    expectedRoas: number;
    expectedCpa: number;
  };
  reasoning: string;
}

export interface AudienceOverlap {
  audienceA: string;
  audienceB: string;
  overlapSize: number;
  overlapPercent: number;
  recommendation: string;
}

export function analyzeAudiencePerformance(metrics: AudienceMetrics): AudiencePerformance {
  const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
  const cpc = metrics.clicks > 0 ? metrics.adSpend / metrics.clicks : 0;
  const cpa = metrics.conversions > 0 ? metrics.adSpend / metrics.conversions : 0;
  const roas = metrics.adSpend > 0 ? metrics.revenue / metrics.adSpend : 0;
  const conversionRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;
  const costPerImpression = metrics.impressions > 0 ? metrics.adSpend / metrics.impressions : 0;

  const roasScore = Math.min((roas / 5) * 40, 40);
  const ctrScore = Math.min(ctr * 10, 30);
  const conversionScore = Math.min(conversionRate * 3, 30);
  const performanceScore = Math.min(roasScore + ctrScore + conversionScore, 100);

  let performanceRating: AudiencePerformance['performanceRating'] = 'average';
  if (performanceScore >= 80) {
    performanceRating = 'excellent';
  } else if (performanceScore >= 60) {
    performanceRating = 'good';
  } else if (performanceScore < 40) {
    performanceRating = 'poor';
  }

  let scalability: AudiencePerformance['scalability'] = 'medium';
  if (metrics.size > 1000000 && roas >= 3.0) {
    scalability = 'high';
  } else if (metrics.size < 100000 || roas < 2.0) {
    scalability = 'low';
  }

  return {
    ...metrics,
    ctr,
    cpc,
    cpa,
    roas,
    conversionRate,
    costPerImpression,
    performanceScore,
    performanceRating,
    scalability,
  };
}

export function compareAudiences(audiences: AudiencePerformance[]): AudienceComparison {
  if (audiences.length === 0) {
    throw new Error('Cannot compare empty audience list');
  }

  const sortedByRoas = [...audiences].sort((a, b) => b.roas - a.roas);
  const topPerformer = sortedByRoas[0];
  const worstPerformer = sortedByRoas[sortedByRoas.length - 1];
  const averageRoas = audiences.reduce((sum, a) => sum + a.roas, 0) / audiences.length;

  const recommendation = `Top performer: ${topPerformer.audienceName} (${topPerformer.roas.toFixed(2)}x ROAS). Allocate more budget to high-performing audiences. Consider pausing or optimizing ${worstPerformer.audienceName} (${worstPerformer.roas.toFixed(2)}x ROAS).`;

  return {
    audiences: sortedByRoas,
    topPerformer,
    worstPerformer,
    averageRoas,
    recommendation,
  };
}

export function recommendLookalikeAudience(
  sourceAudience: AudiencePerformance,
  similarity: number = 1
): LookalikeRecommendation {
  if (similarity < 1 || similarity > 10) {
    throw new Error('Similarity must be between 1 and 10');
  }

  const estimatedSize = sourceAudience.size * similarity * 2;
  const performanceDecay = 1 - ((similarity - 1) * 0.05);
  const expectedRoas = sourceAudience.roas * performanceDecay;
  const expectedCpa = sourceAudience.cpa / performanceDecay;

  let reasoning = '';
  if (similarity <= 3) {
    reasoning = `${similarity}% lookalike will closely match your best customers. Expected high performance (${expectedRoas.toFixed(2)}x ROAS) but smaller reach.`;
  } else if (similarity <= 6) {
    reasoning = `${similarity}% lookalike balances reach and relevance. Good for scaling while maintaining performance (${expectedRoas.toFixed(2)}x ROAS).`;
  } else {
    reasoning = `${similarity}% lookalike maximizes reach but may dilute performance. Use for brand awareness or when scaling aggressively.`;
  }

  return {
    sourceAudienceId: sourceAudience.audienceId,
    sourceAudienceName: sourceAudience.audienceName,
    sourcePerformance: {
      roas: sourceAudience.roas,
      cpa: sourceAudience.cpa,
      conversionRate: sourceAudience.conversionRate,
    },
    recommendedSimilarity: similarity,
    estimatedSize,
    estimatedPerformance: { expectedRoas, expectedCpa },
    reasoning,
  };
}

export function detectAudienceOverlap(
  audienceASize: number,
  audienceBSize: number,
  overlapSize: number,
  audienceAName: string,
  audienceBName: string
): AudienceOverlap {
  const smallerAudience = Math.min(audienceASize, audienceBSize);
  const overlapPercent = (overlapSize / smallerAudience) * 100;

  let recommendation = '';
  if (overlapPercent > 50) {
    recommendation = `High overlap (${overlapPercent.toFixed(1)}%). Consider consolidating these audiences or using exclusions to avoid ad fatigue.`;
  } else if (overlapPercent > 25) {
    recommendation = `Moderate overlap (${overlapPercent.toFixed(1)}%). Monitor frequency and consider exclusions if performance declines.`;
  } else {
    recommendation = `Low overlap (${overlapPercent.toFixed(1)}%). Audiences are sufficiently distinct. Continue targeting both.`;
  }

  return {
    audienceA: audienceAName,
    audienceB: audienceBName,
    overlapSize,
    overlapPercent,
    recommendation,
  };
}

export function findScalableAudiences(
  audiences: AudiencePerformance[],
  minRoas: number = 3.0
): AudiencePerformance[] {
  return audiences
    .filter(a => a.roas >= minRoas && a.scalability !== 'low')
    .sort((a, b) => {
      const scoreA = a.roas * (a.scalability === 'high' ? 1.5 : 1);
      const scoreB = b.roas * (b.scalability === 'high' ? 1.5 : 1);
      return scoreB - scoreA;
    });
}

export function recommendTargetingStrategy(audience: AudiencePerformance): {
  strategy: 'scale' | 'optimize' | 'test' | 'pause';
  budgetAction: 'increase' | 'maintain' | 'decrease';
  reasoning: string;
  nextSteps: string[];
} {
  let strategy: 'scale' | 'optimize' | 'test' | 'pause' = 'test';
  let budgetAction: 'increase' | 'maintain' | 'decrease' = 'maintain';
  const nextSteps: string[] = [];
  let reasoning = '';

  if (audience.performanceRating === 'excellent' && audience.scalability === 'high') {
    strategy = 'scale';
    budgetAction = 'increase';
    reasoning = `Excellent performance (${audience.roas.toFixed(2)}x ROAS) with high scalability. Increase budget 50-100% to maximize returns.`;
    nextSteps.push('Increase daily budget by 50%');
    nextSteps.push('Create lookalike audiences (1-3%)');
    nextSteps.push('Monitor CPA as you scale');
  } else if (audience.performanceRating === 'good') {
    strategy = 'optimize';
    budgetAction = 'maintain';
    reasoning = `Good performance (${audience.roas.toFixed(2)}x ROAS). Maintain budget and optimize for better results.`;
    nextSteps.push('Test new creative variations');
    nextSteps.push('Refine targeting parameters');
    nextSteps.push('Analyze top-performing segments');
  } else if (audience.performanceRating === 'average') {
    strategy = 'test';
    budgetAction = 'maintain';
    reasoning = `Average performance (${audience.roas.toFixed(2)}x ROAS). Test improvements before scaling or pausing.`;
    nextSteps.push('A/B test different creatives');
    nextSteps.push('Try different bidding strategies');
    nextSteps.push('Narrow or broaden targeting');
  } else {
    strategy = 'pause';
    budgetAction = 'decrease';
    reasoning = `Poor performance (${audience.roas.toFixed(2)}x ROAS). Pause or significantly reduce budget.`;
    nextSteps.push('Pause audience and analyze data');
    nextSteps.push('Identify why performance is low');
    nextSteps.push('Test completely different targeting');
  }

  return { strategy, budgetAction, reasoning, nextSteps };
}

