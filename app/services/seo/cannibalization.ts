/**
 * Keyword Cannibalization Detection Service
 *
 * Identifies keyword cannibalization issues where multiple pages
 * from the same site compete for the same keywords in search results.
 *
 * Features:
 * - Detect multiple pages ranking for the same keyword
 * - Calculate cannibalization severity score
 * - Recommend consolidation strategies
 * - Track cannibalization trends over time
 *
 * @module services/seo/cannibalization
 */

import { getCached, setCached } from "../cache.server";
import { appMetrics } from "../../utils/metrics.server";

// ============================================================================
// Types
// ============================================================================

export interface KeywordRanking {
  keyword: string;
  url: string;
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
}

export interface CannibalizationIssue {
  keyword: string;
  severity: "critical" | "warning" | "info";
  affectedUrls: Array<{
    url: string;
    position: number;
    clicks: number;
    impressions: number;
    ctr: number;
  }>;
  totalClicks: number;
  totalImpressions: number;
  potentialClicksLost: number;
  recommendation: {
    action: "consolidate" | "differentiate" | "canonical" | "redirect";
    primaryUrl: string;
    secondaryUrls: string[];
    rationale: string;
  };
  detectedAt: string;
}

export interface CannibalizationReport {
  summary: {
    totalKeywords: number;
    keywordsWithCannibalization: number;
    criticalIssues: number;
    warningIssues: number;
    infoIssues: number;
    estimatedClicksLost: number;
  };
  issues: CannibalizationIssue[];
  topIssues: CannibalizationIssue[];
  generatedAt: string;
}

// ============================================================================
// Constants
// ============================================================================

const CANNIBALIZATION_THRESHOLDS = {
  // Number of URLs competing for the same keyword
  urlCount: {
    critical: 3, // 3+ URLs = critical
    warning: 2, // 2 URLs = warning
  },
  // Position difference threshold
  positionSpread: {
    critical: 10, // Positions spread by 10+ = critical
    warning: 5, // Positions spread by 5-10 = warning
  },
  // Minimum clicks to consider
  minClicks: 10,
} as const;

// ============================================================================
// Detection Logic
// ============================================================================

/**
 * Group rankings by keyword to detect cannibalization
 */
function groupRankingsByKeyword(
  rankings: KeywordRanking[],
): Map<string, KeywordRanking[]> {
  const keywordMap = new Map<string, KeywordRanking[]>();

  rankings.forEach((ranking) => {
    const existing = keywordMap.get(ranking.keyword) || [];
    existing.push(ranking);
    keywordMap.set(ranking.keyword, existing);
  });

  return keywordMap;
}

/**
 * Calculate cannibalization severity
 */
function calculateSeverity(
  urlCount: number,
  positionSpread: number,
  totalClicks: number,
): "critical" | "warning" | "info" {
  // Critical: 3+ URLs OR large position spread with significant traffic
  if (
    urlCount >= CANNIBALIZATION_THRESHOLDS.urlCount.critical ||
    (positionSpread >= CANNIBALIZATION_THRESHOLDS.positionSpread.critical &&
      totalClicks >= CANNIBALIZATION_THRESHOLDS.minClicks)
  ) {
    return "critical";
  }

  // Warning: 2 URLs OR moderate position spread
  if (
    urlCount >= CANNIBALIZATION_THRESHOLDS.urlCount.warning ||
    positionSpread >= CANNIBALIZATION_THRESHOLDS.positionSpread.warning
  ) {
    return "warning";
  }

  return "info";
}

/**
 * Estimate potential clicks lost due to cannibalization
 */
function estimateClicksLost(rankings: KeywordRanking[]): number {
  if (rankings.length < 2) return 0;

  // Sort by position (best first)
  const sorted = [...rankings].sort((a, b) => a.position - b.position);
  const bestPage = sorted[0];
  const otherPages = sorted.slice(1);

  // Estimate: If we consolidated to best page, it would get additional clicks
  // from improved position (assumption: consolidated page would rank better)
  const potentialClicks = otherPages.reduce((sum, page) => {
    // Conservative estimate: 50% of secondary page clicks could go to primary
    return sum + page.clicks * 0.5;
  }, 0);

  return Math.round(potentialClicks);
}

/**
 * Generate consolidation recommendation
 */
function generateRecommendation(
  keyword: string,
  rankings: KeywordRanking[],
): CannibalizationIssue["recommendation"] {
  // Sort by performance (clicks first, then position)
  const sorted = [...rankings].sort((a, b) => {
    if (a.clicks !== b.clicks) return b.clicks - a.clicks;
    return a.position - b.position;
  });

  const primaryUrl = sorted[0].url;
  const secondaryUrls = sorted.slice(1).map((r) => r.url);

  // Determine action based on keyword intent and page similarity
  let action: "consolidate" | "differentiate" | "canonical" | "redirect";
  let rationale: string;

  if (rankings.length >= 3) {
    action = "consolidate";
    rationale = `Consolidate content from ${rankings.length} pages into "${primaryUrl}" (best performer with ${sorted[0].clicks} clicks). Consider 301 redirects from secondary pages.`;
  } else if (sorted[0].position > 10 && sorted[1].position > 10) {
    action = "differentiate";
    rationale = `Both pages rank poorly (positions ${sorted[0].position}, ${sorted[1].position}). Consider differentiating content to target different keyword variations.`;
  } else {
    action = "canonical";
    rationale = `Set "${primaryUrl}" as canonical page for "${keyword}". Add canonical tag to "${secondaryUrls[0]}" pointing to primary page.`;
  }

  return {
    action,
    primaryUrl,
    secondaryUrls,
    rationale,
  };
}

/**
 * Analyze keyword rankings for cannibalization
 */
function analyzeCannibalization(
  keywordRankings: KeywordRanking[],
): CannibalizationIssue[] {
  const groupedByKeyword = groupRankingsByKeyword(keywordRankings);
  const issues: CannibalizationIssue[] = [];

  groupedByKeyword.forEach((rankings, keyword) => {
    // Only flag if multiple URLs rank for the same keyword
    if (rankings.length < 2) return;

    // Calculate metrics
    const positions = rankings.map((r) => r.position);
    const minPosition = Math.min(...positions);
    const maxPosition = Math.max(...positions);
    const positionSpread = maxPosition - minPosition;

    const totalClicks = rankings.reduce((sum, r) => sum + r.clicks, 0);
    const totalImpressions = rankings.reduce(
      (sum, r) => sum + r.impressions,
      0,
    );

    // Skip low-traffic keywords (less than threshold clicks)
    if (totalClicks < CANNIBALIZATION_THRESHOLDS.minClicks) return;

    const severity = calculateSeverity(
      rankings.length,
      positionSpread,
      totalClicks,
    );
    const potentialClicksLost = estimateClicksLost(rankings);
    const recommendation = generateRecommendation(keyword, rankings);

    issues.push({
      keyword,
      severity,
      affectedUrls: rankings.map((r) => ({
        url: r.url,
        position: r.position,
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
      })),
      totalClicks,
      totalImpressions,
      potentialClicksLost,
      recommendation,
      detectedAt: new Date().toISOString(),
    });
  });

  // Sort by severity and potential impact
  return issues.sort((a, b) => {
    // Sort by severity first
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    if (a.severity !== b.severity) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    // Then by potential clicks lost
    return b.potentialClicksLost - a.potentialClicksLost;
  });
}

// ============================================================================
// Main Detection Function
// ============================================================================

/**
 * Detect keyword cannibalization issues from Search Console data
 */
export async function detectKeywordCannibalization(
  shopDomain: string,
): Promise<CannibalizationReport> {
  const startTime = Date.now();

  const cacheKey = `seo:cannibalization:${shopDomain}`;
  const cached = getCached<CannibalizationReport>(cacheKey);
  if (cached) {
    appMetrics.cacheHit(cacheKey);
    return cached;
  }
  appMetrics.cacheMiss(cacheKey);

  try {
    // In production, fetch real data from Search Console API
    // For now, use sample data
    const keywordRankings = await fetchKeywordRankings(shopDomain);

    // Analyze for cannibalization
    const issues = analyzeCannibalization(keywordRankings);

    // Generate summary
    const criticalIssues = issues.filter(
      (i) => i.severity === "critical",
    ).length;
    const warningIssues = issues.filter((i) => i.severity === "warning").length;
    const infoIssues = issues.filter((i) => i.severity === "info").length;
    const estimatedClicksLost = issues.reduce(
      (sum, i) => sum + i.potentialClicksLost,
      0,
    );

    const report: CannibalizationReport = {
      summary: {
        totalKeywords: new Set(keywordRankings.map((r) => r.keyword)).size,
        keywordsWithCannibalization: issues.length,
        criticalIssues,
        warningIssues,
        infoIssues,
        estimatedClicksLost,
      },
      issues,
      topIssues: issues.slice(0, 10),
      generatedAt: new Date().toISOString(),
    };

    const durationMs = Date.now() - startTime;
    appMetrics.gaApiCall("detectKeywordCannibalization", true, durationMs);

    // Cache for 6 hours
    setCached(cacheKey, report, 21600000);

    return report;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    appMetrics.gaApiCall("detectKeywordCannibalization", false, durationMs);
    throw error;
  }
}

/**
 * Fetch keyword rankings from Search Console
 * In production, this would call the Search Console API
 */
async function fetchKeywordRankings(
  shopDomain: string,
): Promise<KeywordRanking[]> {
  // Sample data for development
  // In production, replace with actual Search Console API calls
  return [
    {
      keyword: "running shoes",
      url: `https://${shopDomain}/products/running-shoes-pro`,
      position: 8,
      clicks: 120,
      impressions: 2500,
      ctr: 0.048,
    },
    {
      keyword: "running shoes",
      url: `https://${shopDomain}/collections/running-shoes`,
      position: 15,
      clicks: 45,
      impressions: 1200,
      ctr: 0.0375,
    },
    {
      keyword: "best running shoes",
      url: `https://${shopDomain}/products/running-shoes-pro`,
      position: 12,
      clicks: 85,
      impressions: 1800,
      ctr: 0.047,
    },
    {
      keyword: "best running shoes",
      url: `https://${shopDomain}/blog/best-running-shoes-2025`,
      position: 9,
      clicks: 95,
      impressions: 2100,
      ctr: 0.045,
    },
  ];
}

/**
 * Get detailed cannibalization analysis for a specific keyword
 */
export async function getKeywordCannibalizationDetails(
  shopDomain: string,
  keyword: string,
): Promise<CannibalizationIssue | null> {
  const report = await detectKeywordCannibalization(shopDomain);
  return report.issues.find((issue) => issue.keyword === keyword) || null;
}
