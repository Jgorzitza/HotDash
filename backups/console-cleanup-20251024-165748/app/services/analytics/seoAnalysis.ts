/**
 * SEO Impact Analysis Service
 *
 * ANALYTICS-007: Rank tracking + deltas for SEO performance analysis
 *
 * Features:
 * - Track keyword rankings over time
 * - Calculate ranking deltas and trends
 * - Monitor SEO impact of content changes
 * - Generate SEO performance reports
 */

export interface KeywordRanking {
  keyword: string;
  currentRank: number | null; // null if not in top 100
  previousRank: number | null;
  delta: number; // positive = improved, negative = declined
  searchVolume: number;
  difficulty: number; // 1-100 scale
  url: string;
  lastUpdated: string;
}

export interface SEOImpactAnalysis {
  totalKeywords: number;
  rankingImprovements: number;
  rankingDeclines: number;
  averageRankChange: number;
  topGainers: KeywordRanking[];
  topLosers: KeywordRanking[];
  overallTrend: 'improving' | 'declining' | 'stable';
  period: {
    start: string;
    end: string;
  };
}

export interface SEOContentImpact {
  contentId: string;
  title: string;
  url: string;
  publishedAt: string;
  keywordImpact: {
    keyword: string;
    beforeRank: number | null;
    afterRank: number | null;
    improvement: number;
  }[];
  overallImpact: number; // Average ranking improvement
  trafficImpact: number; // Estimated traffic change
}

/**
 * Track keyword ranking changes
 *
 * ANALYTICS-007: Core function for SEO ranking analysis
 *
 * @param currentRankings - Current period rankings
 * @param previousRankings - Previous period rankings
 * @returns Updated rankings with deltas
 */
export function calculateRankingDeltas(
  currentRankings: Omit<KeywordRanking, 'delta' | 'previousRank'>[],
  previousRankings: Omit<KeywordRanking, 'delta' | 'previousRank'>[]
): KeywordRanking[] {
  // Create a map of previous rankings for quick lookup
  const previousMap = new Map<string, Omit<KeywordRanking, 'delta' | 'previousRank'>>();
  previousRankings.forEach(ranking => {
    previousMap.set(ranking.keyword, ranking);
  });

  return currentRankings.map(current => {
    const previous = previousMap.get(current.keyword);
    const previousRank = previous?.currentRank || null;
    
    // Calculate delta
    let delta = 0;
    if (current.currentRank && previousRank) {
      delta = previousRank - current.currentRank; // positive = improved
    } else if (current.currentRank && !previousRank) {
      delta = 100; // New ranking (assume it was >100 before)
    } else if (!current.currentRank && previousRank) {
      delta = -100; // Lost ranking
    }

    return {
      ...current,
      previousRank,
      delta,
    };
  });
}

/**
 * Analyze SEO impact over time
 *
 * ANALYTICS-007: Calculate overall SEO performance trends
 *
 * @param rankings - Keyword rankings with deltas
 * @param startDate - Analysis start date
 * @param endDate - Analysis end date
 * @returns SEO impact analysis
 */
export function analyzeSEOImpact(
  rankings: KeywordRanking[],
  startDate: string,
  endDate: string
): SEOImpactAnalysis {
  const totalKeywords = rankings.length;
  const improvements = rankings.filter(r => r.delta > 0);
  const declines = rankings.filter(r => r.delta < 0);
  
  const rankingImprovements = improvements.length;
  const rankingDeclines = declines.length;
  
  // Calculate average rank change
  const validDeltas = rankings.filter(r => r.delta !== 0);
  const averageRankChange = validDeltas.length > 0 
    ? validDeltas.reduce((sum, r) => sum + r.delta, 0) / validDeltas.length 
    : 0;

  // Get top gainers and losers
  const topGainers = improvements
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 10);
  
  const topLosers = declines
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 10);

  // Determine overall trend
  let overallTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (averageRankChange > 1) {
    overallTrend = 'improving';
  } else if (averageRankChange < -1) {
    overallTrend = 'declining';
  }

  return {
    totalKeywords,
    rankingImprovements,
    rankingDeclines,
    averageRankChange: Math.round(averageRankChange * 100) / 100,
    topGainers,
    topLosers,
    overallTrend,
    period: { start: startDate, end: endDate },
  };
}

/**
 * Analyze content impact on SEO
 *
 * ANALYTICS-007: Track how content changes affect keyword rankings
 *
 * @param contentId - Content identifier
 * @param title - Content title
 * @param url - Content URL
 * @param publishedAt - Publication date
 * @param keywordChanges - Keyword ranking changes
 * @returns Content SEO impact analysis
 */
export function analyzeContentSEOImpact(
  contentId: string,
  title: string,
  url: string,
  publishedAt: string,
  keywordChanges: {
    keyword: string;
    beforeRank: number | null;
    afterRank: number | null;
  }[]
): SEOContentImpact {
  const keywordImpact = keywordChanges.map(change => ({
    keyword: change.keyword,
    beforeRank: change.beforeRank,
    afterRank: change.afterRank,
    improvement: change.beforeRank && change.afterRank 
      ? change.beforeRank - change.afterRank 
      : change.afterRank ? 100 : -100,
  }));

  // Calculate overall impact
  const validImprovements = keywordImpact.filter(ki => ki.improvement !== 0);
  const overallImpact = validImprovements.length > 0
    ? validImprovements.reduce((sum, ki) => sum + ki.improvement, 0) / validImprovements.length
    : 0;

  // Estimate traffic impact (simplified calculation)
  const trafficImpact = keywordImpact.reduce((total, ki) => {
    if (ki.afterRank && ki.afterRank <= 10) {
      // Top 10 rankings get significant traffic
      return total + (ki.improvement * 0.1);
    } else if (ki.afterRank && ki.afterRank <= 50) {
      // Rankings 11-50 get moderate traffic
      return total + (ki.improvement * 0.05);
    }
    return total;
  }, 0);

  return {
    contentId,
    title,
    url,
    publishedAt,
    keywordImpact,
    overallImpact: Math.round(overallImpact * 100) / 100,
    trafficImpact: Math.round(trafficImpact * 100) / 100,
  };
}

/**
 * Generate SEO performance report
 *
 * ANALYTICS-007: Create comprehensive SEO performance summary
 *
 * @param analysis - SEO impact analysis
 * @param contentImpacts - Content impact analyses
 * @returns Formatted SEO performance report
 */
export function generateSEOReport(
  analysis: SEOImpactAnalysis,
  contentImpacts: SEOContentImpact[]
) {
  const report = {
    summary: {
      totalKeywords: analysis.totalKeywords,
      improvementRate: analysis.totalKeywords > 0 
        ? Math.round((analysis.rankingImprovements / analysis.totalKeywords) * 100) 
        : 0,
      averageRankChange: analysis.averageRankChange,
      overallTrend: analysis.overallTrend,
    },
    topPerformers: {
      keywords: analysis.topGainers.slice(0, 5).map(r => ({
        keyword: r.keyword,
        currentRank: r.currentRank,
        improvement: r.delta,
        url: r.url,
      })),
      content: contentImpacts
        .sort((a, b) => b.overallImpact - a.overallImpact)
        .slice(0, 5)
        .map(c => ({
          title: c.title,
          url: c.url,
          impact: c.overallImpact,
          trafficImpact: c.trafficImpact,
        })),
    },
    recommendations: generateSEORecommendations(analysis, contentImpacts),
    period: analysis.period,
  };

  return report;
}

/**
 * Generate SEO recommendations based on analysis
 *
 * ANALYTICS-007: Provide actionable SEO recommendations
 *
 * @param analysis - SEO impact analysis
 * @param contentImpacts - Content impact analyses
 * @returns Array of SEO recommendations
 */
function generateSEORecommendations(
  analysis: SEOImpactAnalysis,
  contentImpacts: SEOContentImpact[]
): string[] {
  const recommendations: string[] = [];

  if (analysis.overallTrend === 'declining') {
    recommendations.push('Focus on improving content quality and relevance for declining keywords');
  }

  if (analysis.rankingDeclines > analysis.rankingImprovements) {
    recommendations.push('Review and update content for keywords that have declined in rankings');
  }

  const highImpactContent = contentImpacts.filter(c => c.overallImpact > 5);
  if (highImpactContent.length > 0) {
    recommendations.push(`Continue creating content similar to high-performing pieces: ${highImpactContent.map(c => c.title).join(', ')}`);
  }

  const lowPerformingContent = contentImpacts.filter(c => c.overallImpact < -5);
  if (lowPerformingContent.length > 0) {
    recommendations.push(`Review and optimize content that has declined: ${lowPerformingContent.map(c => c.title).join(', ')}`);
  }

  if (analysis.topGainers.length > 0) {
    recommendations.push(`Focus on maintaining and improving rankings for top-performing keywords: ${analysis.topGainers.slice(0, 3).map(r => r.keyword).join(', ')}`);
  }

  return recommendations;
}

/**
 * Track SEO performance metrics for dashboard
 *
 * ANALYTICS-007: Format SEO data for dashboard display
 *
 * @param analysis - SEO impact analysis
 * @returns Dashboard-ready SEO metrics
 */
export function exportSEOMetrics(analysis: SEOImpactAnalysis) {
  return {
    metrics: {
      totalKeywords: analysis.totalKeywords,
      improvementRate: analysis.totalKeywords > 0 
        ? Math.round((analysis.rankingImprovements / analysis.totalKeywords) * 100) 
        : 0,
      averageRankChange: analysis.averageRankChange,
      overallTrend: analysis.overallTrend,
    },
    topGainers: analysis.topGainers.slice(0, 5).map(r => ({
      keyword: r.keyword,
      rank: r.currentRank,
      improvement: r.delta,
    })),
    topLosers: analysis.topLosers.slice(0, 5).map(r => ({
      keyword: r.keyword,
      rank: r.currentRank,
      decline: Math.abs(r.delta),
    })),
    period: analysis.period,
  };
}
