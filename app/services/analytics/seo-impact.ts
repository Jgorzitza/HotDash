/**
 * SEO Impact Analysis Service
 * 
 * Tracks keyword rankings over time
 * Identifies ranking improvements and declines
 * Correlates with content changes
 * Stores in DashboardFact table with factType="seo_ranking"
 */

import prisma from "~/db.server";

const db = prisma; // Alias for compatibility

export interface KeywordRanking {
  keyword: string;
  position: number;
  previousPosition?: number;
  change: number; // Positive = improved, negative = declined
  changePercent: number;
  url: string;
  searchVolume?: number;
}

export interface SEORankingData {
  keyword: string;
  currentPosition: number;
  previousPosition: number | null;
  change: number;
  trend: "up" | "down" | "stable" | "new";
  searchVolume?: number;
  url: string;
  trackedAt: Date;
}

export interface SEOImpactSummary {
  totalKeywords: number;
  improved: number;
  declined: number;
  stable: number;
  newKeywords: number;
  avgPosition: number;
  topMovers: Array<{ keyword: string; change: number }>;
  topDecliners: Array<{ keyword: string; change: number }>;
}

/**
 * Track keyword ranking for SEO analysis
 * Stores historical data and identifies trends
 */
export async function trackKeywordRanking(
  keyword: string,
  position: number,
  url: string,
  shopDomain: string = "occ",
  searchVolume?: number
): Promise<SEORankingData> {
  // Get previous ranking from last record
  const previousRanking = await getLatestKeywordRanking(keyword, shopDomain);

  const previousPosition = previousRanking?.position || null;
  const change = previousPosition ? previousPosition - position : 0;
  const trend = determineTrend(change, previousPosition);

  // Store ranking in DashboardFact
  await db.dashboardFact.create({
    data: {
      shopDomain,
      factType: "seo_ranking",
      scope: keyword,
      value: {
        keyword,
        position,
        previousPosition,
        change,
        trend,
        url,
        searchVolume,
      },
      metadata: {
        trackedAt: new Date().toISOString(),
      },
    },
  });

  return {
    keyword,
    currentPosition: position,
    previousPosition,
    change,
    trend,
    searchVolume,
    url,
    trackedAt: new Date(),
  };
}

/**
 * Get latest ranking for a keyword
 */
async function getLatestKeywordRanking(
  keyword: string,
  shopDomain: string
): Promise<{ position: number; trackedAt: Date } | null> {
  const latest = await db.dashboardFact.findFirst({
    where: {
      shopDomain,
      factType: "seo_ranking",
      scope: keyword,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latest) return null;

  const value = latest.value as any;
  return {
    position: value.position,
    trackedAt: latest.createdAt,
  };
}

/**
 * Determine ranking trend based on position change
 */
function determineTrend(
  change: number,
  previousPosition: number | null
): "up" | "down" | "stable" | "new" {
  if (previousPosition === null) return "new";
  if (change > 0) return "up"; // Lower position number = better ranking
  if (change < 0) return "down";
  return "stable";
}

/**
 * Get SEO impact analysis for a time period
 * Returns summary of ranking changes and trends
 */
export async function getSEOImpactAnalysis(
  shopDomain: string = "occ",
  days: number = 30
): Promise<SEOImpactSummary> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get all ranking records in the period
  const rankings = await db.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: "seo_ranking",
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (rankings.length === 0) {
    return {
      totalKeywords: 0,
      improved: 0,
      declined: 0,
      stable: 0,
      newKeywords: 0,
      avgPosition: 0,
      topMovers: [],
      topDecliners: [],
    };
  }

  // Get latest ranking for each keyword
  // Rankings are already sorted by createdAt desc, so first occurrence is latest
  const keywordMap = new Map<string, any>();
  for (const ranking of rankings) {
    const value = ranking.value as any;
    const keyword = value.keyword;
    
    // Only add if not already in map (first occurrence = latest due to desc sort)
    if (!keywordMap.has(keyword)) {
      keywordMap.set(keyword, value);
    }
  }

  const latestRankings = Array.from(keywordMap.values());

  // Calculate metrics
  const improved = latestRankings.filter(r => r.trend === "up").length;
  const declined = latestRankings.filter(r => r.trend === "down").length;
  const stable = latestRankings.filter(r => r.trend === "stable").length;
  const newKeywords = latestRankings.filter(r => r.trend === "new").length;

  const totalPositions = latestRankings.reduce((sum, r) => sum + r.position, 0);
  const avgPosition = latestRankings.length > 0
    ? Number((totalPositions / latestRankings.length).toFixed(1))
    : 0;

  // Get top movers (biggest improvements)
  const topMovers = latestRankings
    .filter(r => r.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 5)
    .map(r => ({ keyword: r.keyword, change: r.change }));

  // Get top decliners (biggest drops)
  const topDecliners = latestRankings
    .filter(r => r.change < 0)
    .sort((a, b) => a.change - b.change)
    .slice(0, 5)
    .map(r => ({ keyword: r.keyword, change: r.change }));

  return {
    totalKeywords: latestRankings.length,
    improved,
    declined,
    stable,
    newKeywords,
    avgPosition,
    topMovers,
    topDecliners,
  };
}

/**
 * Correlate SEO ranking changes with content updates
 * Finds content changes that coincide with ranking improvements
 */
export async function correlateSEOWithContent(
  shopDomain: string = "occ",
  days: number = 30
): Promise<Array<{
  keyword: string;
  rankingChange: number;
  contentUpdates: number;
  correlation: "positive" | "negative" | "neutral";
}>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get SEO rankings with changes
  const rankings = await db.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: "seo_ranking",
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get content update events (stored as decision logs or dashboard facts)
  const contentUpdates = await db.decisionLog.findMany({
    where: {
      shopDomain,
      scope: "content",
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Build correlation map
  const keywordMap = new Map<string, { change: number; updates: number }>();

  for (const ranking of rankings) {
    const value = ranking.value as any;
    const keyword = value.keyword;
    const change = value.change || 0;

    if (!keywordMap.has(keyword)) {
      // Count content updates around the same time (±7 days)
      const rankingDate = ranking.createdAt;
      const updates = contentUpdates.filter(update => {
        const diff = Math.abs(
          rankingDate.getTime() - update.createdAt.getTime()
        );
        return diff <= 7 * 24 * 60 * 60 * 1000; // 7 days in ms
      }).length;

      keywordMap.set(keyword, { change, updates });
    }
  }

  return Array.from(keywordMap.entries()).map(([keyword, data]) => ({
    keyword,
    rankingChange: data.change,
    contentUpdates: data.updates,
    correlation: determineCorrelation(data.change, data.updates),
  }));
}

/**
 * Determine correlation between content updates and ranking changes
 */
function determineCorrelation(
  change: number,
  updates: number
): "positive" | "negative" | "neutral" {
  if (updates === 0) return "neutral";
  if (change > 0 && updates > 0) return "positive"; // Improved with updates
  if (change < 0 && updates > 0) return "negative"; // Declined despite updates
  return "neutral";
}

/**
 * Get historical ranking trend for a specific keyword
 */
export async function getKeywordHistory(
  keyword: string,
  shopDomain: string = "occ",
  days: number = 90
): Promise<Array<{
  position: number;
  date: Date;
  change: number;
  trend: string;
}>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rankings = await db.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: "seo_ranking",
      scope: keyword,
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return rankings.map(ranking => {
    const value = ranking.value as any;
    return {
      position: value.position,
      date: ranking.createdAt,
      change: value.change || 0,
      trend: value.trend || "stable",
    };
  });
}

