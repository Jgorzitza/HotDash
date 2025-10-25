/**
 * Enhanced SEO Service
 *
 * Combines data from multiple SEO sources:
 * - Google Analytics (traffic)
 * - Google Search Console (organic search performance)
 * - Bing Webmaster Tools (Bing search performance)
 *
 * Provides a unified SEO dashboard view with graceful degradation.
 */

import { getTrafficMetrics } from "../analytics/ga4";
import { getSearchConsoleSummary } from "./search-console";
import { getBingWebmasterSummary } from "./bing-webmaster";
import { getCached, setCached } from "../../services/cache.server";
import { appMetrics } from "../../utils/metrics.server";

export interface EnhancedSEOData {
  totalSessions: number;
  organicSessions: number;
  organicPercentage: number;
  google: {
    available: boolean;
    clicks: number;
    impressions: number;
    ctr: number;
    avgPosition: number;
    topQueries: Array<{
      query: string;
      clicks: number;
    }>;
  };
  bing: {
    available: boolean;
    clicks: number;
    impressions: number;
    ctr: number;
    avgPosition: number;
    topKeywords: Array<{
      keyword: string;
      clicks: number;
    }>;
  };
  combined: {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    searchEngineBreakdown: {
      google: number;
      bing: number;
    };
  };
  landingPages: Array<{
    url: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    change7dPct: number;
    priority: "high" | "medium" | "low";
  }>;
  period: {
    start: string;
    end: string;
  };
  timestamp: string;
}

export async function getEnhancedSEOData(): Promise<EnhancedSEOData> {
  const startTime = Date.now();

  const cacheKey = "seo:enhanced:dashboard";
  const cached = getCached<EnhancedSEOData>(cacheKey);
  if (cached) {
    appMetrics.cacheHit(cacheKey);
    return cached;
  }
  appMetrics.cacheMiss(cacheKey);

  try {
    const [gaData, googleData, bingData] = await Promise.allSettled([
      getTrafficMetrics(),
      getSearchConsoleSummary(),
      getBingWebmasterSummary(),
    ]);

    const traffic =
      gaData.status === "fulfilled"
        ? gaData.value
        : {
            totalSessions: 0,
            organicSessions: 0,
            organicPercentage: 0,
            trend: { sessionsChange: 0, organicChange: 0 },
            period: { start: "", end: "" },
          };

    const googleAvailable = googleData.status === "fulfilled";
    const google = googleAvailable
      ? googleData.value
      : {
          totalClicks: 0,
          totalImpressions: 0,
          avgCtr: 0,
          avgPosition: 0,
          indexCoveragePct: 0,
          topQueries: [],
          landingPages: [],
        };

    const bingAvailable = bingData.status === "fulfilled";
    const bing = bingAvailable
      ? bingData.value
      : {
          totalClicks: 0,
          totalImpressions: 0,
          avgCtr: 0,
          avgPosition: 0,
          crawlErrors: 0,
          indexedPages: 0,
          topKeywords: [],
          topPages: [],
        };

    const totalClicks = google.totalClicks + bing.totalClicks;
    const totalImpressions = google.totalImpressions + bing.totalImpressions;
    const avgCtr =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    const googlePercentage =
      totalClicks > 0 ? (google.totalClicks / totalClicks) * 100 : 0;
    const bingPercentage =
      totalClicks > 0 ? (bing.totalClicks / totalClicks) * 100 : 0;

    const landingPages = google.landingPages.map((page) => ({
      url: page.url,
      clicks: page.clicks,
      impressions: page.impressions,
      ctr: page.ctr,
      position: page.position,
      change7dPct: page.change7dPct,
      priority: calculatePagePriority(page),
    }));

    landingPages.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.clicks - a.clicks;
    });

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("getEnhancedSEOData", true, duration);

    const result: EnhancedSEOData = {
      totalSessions: traffic.totalSessions,
      organicSessions: traffic.organicSessions,
      organicPercentage: traffic.organicPercentage,
      google: {
        available: googleAvailable,
        clicks: google.totalClicks,
        impressions: google.totalImpressions,
        ctr: google.avgCtr,
        avgPosition: google.avgPosition,
        topQueries: google.topQueries.slice(0, 5).map((q) => ({
          query: q.query,
          clicks: q.clicks,
        })),
      },
      bing: {
        available: bingAvailable,
        clicks: bing.totalClicks,
        impressions: bing.totalImpressions,
        ctr: bing.avgCtr,
        avgPosition: bing.avgPosition,
        topKeywords: bing.topKeywords.slice(0, 5).map((k) => ({
          keyword: k.keyword,
          clicks: k.clicks,
        })),
      },
      combined: {
        totalClicks,
        totalImpressions,
        avgCtr,
        searchEngineBreakdown: {
          google: googlePercentage,
          bing: bingPercentage,
        },
      },
      landingPages: landingPages.slice(0, 10),
      period: traffic.period,
      timestamp: new Date().toISOString(),
    };

    setCached(cacheKey, result, 300000);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("getEnhancedSEOData", false, duration);
    throw error;
  }
}

function calculatePagePriority(page: {
  position: number;
  change7dPct: number;
  clicks: number;
}): "high" | "medium" | "low" {
  const { position, change7dPct } = page;

  if (position > 10 || (change7dPct < -10 && position > 5)) {
    return "high";
  }

  if (position > 5 || change7dPct < -5) {
    return "medium";
  }

  return "low";
}
