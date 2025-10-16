/**
 * Engagement Analysis Library
 * 
 * Analyzes engagement metrics: CTR, saves, shares, likes, comments
 * Provides insights for content optimization
 */

import type { SocialPlatform, EngagementMetrics, ContentPerformance } from './tracking';

// ============================================================================
// Types
// ============================================================================

/**
 * Detailed engagement breakdown
 */
export interface EngagementBreakdown {
  total: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  percentages: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
  };
}

/**
 * Engagement trends over time
 */
export interface EngagementTrend {
  period: string; // Date or date range
  engagementRate: number;
  totalEngagement: number;
  change: number; // Percentage change from previous period
}

/**
 * CTR (Click-Through Rate) analysis
 */
export interface CTRAnalysis {
  clickThroughRate: number;
  totalClicks: number;
  totalImpressions: number;
  linkClicks: number;
  profileClicks: number;
  otherClicks: number;
  benchmark: {
    industry: number;
    platform: number;
  };
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

/**
 * Save rate analysis (Instagram/TikTok)
 */
export interface SaveRateAnalysis {
  saveRate: number; // saves / impressions * 100
  totalSaves: number;
  totalImpressions: number;
  benchmark: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  insights: string[];
}

/**
 * Share rate analysis
 */
export interface ShareRateAnalysis {
  shareRate: number; // shares / impressions * 100
  totalShares: number;
  totalImpressions: number;
  viralityScore: number; // 0-100
  benchmark: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Analyze overall engagement breakdown
 */
export function analyzeEngagementBreakdown(
  engagement: EngagementMetrics,
  impressions: number
): EngagementBreakdown {
  const total = 
    engagement.likes + 
    engagement.comments + 
    engagement.shares + 
    (engagement.saves || 0);

  const percentages = {
    likes: total > 0 ? (engagement.likes / total) * 100 : 0,
    comments: total > 0 ? (engagement.comments / total) * 100 : 0,
    shares: total > 0 ? (engagement.shares / total) * 100 : 0,
    saves: total > 0 ? ((engagement.saves || 0) / total) * 100 : 0,
    clicks: 0, // TODO: Add clicks data
  };

  return {
    total,
    likes: engagement.likes,
    comments: engagement.comments,
    shares: engagement.shares,
    saves: engagement.saves || 0,
    clicks: 0,
    percentages,
  };
}

/**
 * Analyze CTR (Click-Through Rate)
 */
export function analyzeCTR(
  clicks: number,
  impressions: number,
  platform: SocialPlatform,
  linkClicks?: number,
  profileClicks?: number
): CTRAnalysis {
  const clickThroughRate = impressions > 0 ? (clicks / impressions) * 100 : 0;

  // Industry benchmarks (approximate)
  const benchmarks = {
    instagram: { industry: 1.5, platform: 1.2 },
    facebook: { industry: 0.9, platform: 0.8 },
    tiktok: { industry: 2.0, platform: 1.8 },
  };

  const benchmark = benchmarks[platform];
  
  let performance: CTRAnalysis['performance'];
  if (clickThroughRate >= benchmark.platform * 1.5) performance = 'excellent';
  else if (clickThroughRate >= benchmark.platform) performance = 'good';
  else if (clickThroughRate >= benchmark.platform * 0.5) performance = 'average';
  else performance = 'poor';

  return {
    clickThroughRate,
    totalClicks: clicks,
    totalImpressions: impressions,
    linkClicks: linkClicks || 0,
    profileClicks: profileClicks || 0,
    otherClicks: clicks - (linkClicks || 0) - (profileClicks || 0),
    benchmark,
    performance,
  };
}

/**
 * Analyze save rate (Instagram/TikTok specific)
 */
export function analyzeSaveRate(
  saves: number,
  impressions: number,
  platform: SocialPlatform
): SaveRateAnalysis {
  const saveRate = impressions > 0 ? (saves / impressions) * 100 : 0;

  // Benchmark: 2-3% is good for Instagram
  const benchmark = platform === 'instagram' ? 2.5 : 2.0;

  let performance: SaveRateAnalysis['performance'];
  if (saveRate >= benchmark * 1.5) performance = 'excellent';
  else if (saveRate >= benchmark) performance = 'good';
  else if (saveRate >= benchmark * 0.5) performance = 'average';
  else performance = 'poor';

  const insights: string[] = [];
  
  if (saveRate > benchmark) {
    insights.push('High save rate indicates valuable, reference-worthy content');
  } else {
    insights.push('Consider creating more educational or tutorial content to increase saves');
  }

  if (saves > 0) {
    insights.push('Saves signal strong content quality to platform algorithms');
  }

  return {
    saveRate,
    totalSaves: saves,
    totalImpressions: impressions,
    benchmark,
    performance,
    insights,
  };
}

/**
 * Analyze share rate and virality
 */
export function analyzeShareRate(
  shares: number,
  impressions: number,
  platform: SocialPlatform
): ShareRateAnalysis {
  const shareRate = impressions > 0 ? (shares / impressions) * 100 : 0;

  // Calculate virality score (0-100)
  // Higher share rate = higher virality
  const viralityScore = Math.min(100, shareRate * 50);

  // Benchmark: 0.5-1% is typical
  const benchmark = 0.75;

  let performance: ShareRateAnalysis['performance'];
  if (shareRate >= benchmark * 2) performance = 'excellent';
  else if (shareRate >= benchmark) performance = 'good';
  else if (shareRate >= benchmark * 0.5) performance = 'average';
  else performance = 'poor';

  return {
    shareRate,
    totalShares: shares,
    totalImpressions: impressions,
    viralityScore,
    benchmark,
    performance,
  };
}

/**
 * Calculate engagement trends over time
 */
export function calculateEngagementTrends(
  performances: ContentPerformance[]
): EngagementTrend[] {
  if (performances.length === 0) return [];

  // Group by period (day, week, or month)
  const grouped = groupByPeriod(performances, 'day');

  const trends: EngagementTrend[] = [];
  let previousRate = 0;

  Object.entries(grouped).forEach(([period, posts]) => {
    const totalEngagement = posts.reduce((sum, p) => {
      return sum + 
        p.engagement.likes + 
        p.engagement.comments + 
        p.engagement.shares + 
        (p.engagement.saves || 0);
    }, 0);

    const avgEngagementRate = posts.reduce((sum, p) => 
      sum + p.engagement.engagementRate, 0
    ) / posts.length;

    const change = previousRate > 0 
      ? ((avgEngagementRate - previousRate) / previousRate) * 100 
      : 0;

    trends.push({
      period,
      engagementRate: avgEngagementRate,
      totalEngagement,
      change,
    });

    previousRate = avgEngagementRate;
  });

  return trends;
}

/**
 * Identify engagement patterns
 */
export function identifyEngagementPatterns(
  performances: ContentPerformance[]
): {
  pattern: string;
  description: string;
  confidence: number;
}[] {
  const patterns: { pattern: string; description: string; confidence: number }[] = [];

  if (performances.length < 5) {
    return [{
      pattern: 'insufficient_data',
      description: 'Not enough posts to identify patterns',
      confidence: 0,
    }];
  }

  // Analyze like-to-comment ratio
  const avgLikes = performances.reduce((sum, p) => sum + p.engagement.likes, 0) / performances.length;
  const avgComments = performances.reduce((sum, p) => sum + p.engagement.comments, 0) / performances.length;
  const likeCommentRatio = avgComments > 0 ? avgLikes / avgComments : 0;

  if (likeCommentRatio > 20) {
    patterns.push({
      pattern: 'passive_engagement',
      description: 'High likes but low comments - audience is passive',
      confidence: 0.8,
    });
  } else if (likeCommentRatio < 10) {
    patterns.push({
      pattern: 'active_engagement',
      description: 'High comment rate - audience is highly engaged',
      confidence: 0.8,
    });
  }

  // Analyze share patterns
  const avgShares = performances.reduce((sum, p) => sum + p.engagement.shares, 0) / performances.length;
  if (avgShares > avgLikes * 0.1) {
    patterns.push({
      pattern: 'viral_potential',
      description: 'High share rate indicates viral content potential',
      confidence: 0.7,
    });
  }

  return patterns;
}

/**
 * Compare engagement across platforms
 */
export function compareEngagementAcrossPlatforms(
  performances: Record<SocialPlatform, ContentPerformance[]>
): {
  platform: SocialPlatform;
  avgEngagementRate: number;
  totalPosts: number;
  bestMetric: 'likes' | 'comments' | 'shares' | 'saves';
}[] {
  const comparison: {
    platform: SocialPlatform;
    avgEngagementRate: number;
    totalPosts: number;
    bestMetric: 'likes' | 'comments' | 'shares' | 'saves';
  }[] = [];

  Object.entries(performances).forEach(([platform, posts]) => {
    if (posts.length === 0) return;

    const avgEngagementRate = posts.reduce((sum, p) => 
      sum + p.engagement.engagementRate, 0
    ) / posts.length;

    // Determine best performing metric
    const avgLikes = posts.reduce((sum, p) => sum + p.engagement.likes, 0) / posts.length;
    const avgComments = posts.reduce((sum, p) => sum + p.engagement.comments, 0) / posts.length;
    const avgShares = posts.reduce((sum, p) => sum + p.engagement.shares, 0) / posts.length;
    const avgSaves = posts.reduce((sum, p) => sum + (p.engagement.saves || 0), 0) / posts.length;

    const metrics = { likes: avgLikes, comments: avgComments, shares: avgShares, saves: avgSaves };
    const bestMetric = Object.entries(metrics).reduce((a, b) => a[1] > b[1] ? a : b)[0] as any;

    comparison.push({
      platform: platform as SocialPlatform,
      avgEngagementRate,
      totalPosts: posts.length,
      bestMetric,
    });
  });

  return comparison.sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Group performances by time period
 */
function groupByPeriod(
  performances: ContentPerformance[],
  period: 'day' | 'week' | 'month'
): Record<string, ContentPerformance[]> {
  const grouped: Record<string, ContentPerformance[]> = {};

  performances.forEach(performance => {
    const date = new Date(performance.publishedAt);
    let key: string;

    if (period === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (period === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(performance);
  });

  return grouped;
}

