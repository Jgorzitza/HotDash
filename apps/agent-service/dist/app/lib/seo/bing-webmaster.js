/**
 * Bing Webmaster Tools Service
 *
 * Provides search analytics data from Bing Webmaster Tools:
 * - Search performance (clicks, impressions)
 * - Top keywords
 * - Crawl statistics
 * - Index coverage
 *
 * Uses API key authentication.
 */
import { getBingWebmasterConfig } from "../../config/bing-webmaster.server";
import { getCached, setCached } from "../../services/cache.server";
import { appMetrics } from "../../utils/metrics.server";
const BING_API_BASE = "https://ssl.bing.com/webmaster/api.svc/json";
async function bingApiRequest(endpoint, params = {}) {
    const config = getBingWebmasterConfig();
    const url = new URL(`${BING_API_BASE}/${endpoint}`);
    url.searchParams.set("apikey", config.apiKey);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value));
        }
    });
    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) {
        throw new Error(`Bing API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}
export async function getBingSearchAnalytics() {
    const startTime = Date.now();
    const cacheKey = "bing-webmaster:analytics:30d";
    const cached = getCached(cacheKey);
    if (cached) {
        appMetrics.cacheHit(cacheKey);
        return cached;
    }
    appMetrics.cacheMiss(cacheKey);
    try {
        const config = getBingWebmasterConfig();
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const currentStart = thirtyDaysAgo.toISOString().split("T")[0];
        const currentEnd = today.toISOString().split("T")[0];
        const response = await bingApiRequest("GetPageStats", {
            siteUrl: config.siteUrl,
            startDate: currentStart,
            endDate: currentEnd,
        });
        const data = response.d || response;
        const rows = Array.isArray(data) ? data : data.results || [];
        let totalClicks = 0;
        let totalImpressions = 0;
        let totalPosition = 0;
        let pageCount = 0;
        rows.forEach((row) => {
            totalClicks += row.Clicks || row.clicks || 0;
            totalImpressions += row.Impressions || row.impressions || 0;
            totalPosition += row.AvgImpressions || row.avgImpressions || 0;
            pageCount++;
        });
        const avgPosition = pageCount > 0 ? totalPosition / pageCount : 0;
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getBingSearchAnalytics", true, duration);
        const result = {
            clicks: totalClicks,
            impressions: totalImpressions,
            ctr,
            avgPosition,
            change7d: {
                clicksChange: 0,
                impressionsChange: 0,
                ctrChange: 0,
            },
            period: {
                start: currentStart,
                end: currentEnd,
            },
        };
        setCached(cacheKey, result, 300000);
        return result;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getBingSearchAnalytics", false, duration);
        throw error;
    }
}
export async function getBingTopKeywords(limit = 10) {
    const startTime = Date.now();
    const cacheKey = `bing-webmaster:top-keywords:${limit}`;
    const cached = getCached(cacheKey);
    if (cached) {
        appMetrics.cacheHit(cacheKey);
        return cached;
    }
    appMetrics.cacheMiss(cacheKey);
    try {
        const config = getBingWebmasterConfig();
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString().split("T")[0];
        const endDate = today.toISOString().split("T")[0];
        const response = await bingApiRequest("GetKeywordStats", {
            siteUrl: config.siteUrl,
            startDate,
            endDate,
        });
        const data = response.d || response;
        const rows = Array.isArray(data) ? data : data.results || [];
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getBingTopKeywords", true, duration);
        const keywords = rows.slice(0, limit).map((row) => ({
            keyword: row.Query || row.query || "",
            clicks: row.Clicks || row.clicks || 0,
            impressions: row.Impressions || row.impressions || 0,
            ctr: row.Ctr || row.ctr || (row.Clicks || 0) / (row.Impressions || 1),
            avgPosition: row.AvgImpressions || row.avgImpressions || 0,
        }));
        setCached(cacheKey, keywords, 300000);
        return keywords;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getBingTopKeywords", false, duration);
        throw error;
    }
}
export async function getBingTopPages(limit = 10) {
    const startTime = Date.now();
    const cacheKey = `bing-webmaster:top-pages:${limit}`;
    const cached = getCached(cacheKey);
    if (cached) {
        appMetrics.cacheHit(cacheKey);
        return cached;
    }
    appMetrics.cacheMiss(cacheKey);
    try {
        const config = getBingWebmasterConfig();
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString().split("T")[0];
        const endDate = today.toISOString().split("T")[0];
        const response = await bingApiRequest("GetPageStats", {
            siteUrl: config.siteUrl,
            startDate,
            endDate,
        });
        const data = response.d || response;
        const rows = Array.isArray(data) ? data : data.results || [];
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getBingTopPages", true, duration);
        const pages = rows.slice(0, limit).map((row) => ({
            url: row.Url || row.url || "",
            clicks: row.Clicks || row.clicks || 0,
            impressions: row.Impressions || row.impressions || 0,
            ctr: row.Ctr || row.ctr || (row.Clicks || 0) / (row.Impressions || 1),
        }));
        pages.sort((a, b) => b.clicks - a.clicks);
        setCached(cacheKey, pages, 300000);
        return pages;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getBingTopPages", false, duration);
        throw error;
    }
}
export async function getBingCrawlStats() {
    const startTime = Date.now();
    const cacheKey = "bing-webmaster:crawl-stats";
    const cached = getCached(cacheKey);
    if (cached) {
        appMetrics.cacheHit(cacheKey);
        return cached;
    }
    appMetrics.cacheMiss(cacheKey);
    try {
        const config = getBingWebmasterConfig();
        const response = await bingApiRequest("GetCrawlStats", {
            siteUrl: config.siteUrl,
        });
        const data = response.d || response;
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getBingCrawlStats", true, duration);
        const result = {
            crawledPages: data.CrawledPages || data.crawledPages || 0,
            crawlErrors: data.CrawlErrors || data.crawlErrors || 0,
            blockedPages: data.BlockedPages || data.blockedPages || 0,
            indexedPages: data.InCrawlQueue || data.inCrawlQueue || 0,
        };
        setCached(cacheKey, result, 900000);
        return result;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getBingCrawlStats", false, duration);
        throw error;
    }
}
export async function getBingWebmasterSummary() {
    const [analytics, topKeywords, topPages, crawlStats] = await Promise.all([
        getBingSearchAnalytics(),
        getBingTopKeywords(10),
        getBingTopPages(10),
        getBingCrawlStats(),
    ]);
    return {
        totalClicks: analytics.clicks,
        totalImpressions: analytics.impressions,
        avgCtr: analytics.ctr,
        avgPosition: analytics.avgPosition,
        crawlErrors: crawlStats.crawlErrors,
        indexedPages: crawlStats.indexedPages,
        topKeywords,
        topPages,
    };
}
//# sourceMappingURL=bing-webmaster.js.map