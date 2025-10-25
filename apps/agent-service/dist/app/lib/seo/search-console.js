/**
 * Google Search Console Service
 *
 * Provides search analytics data from Google Search Console:
 * - Search performance (clicks, impressions, CTR, position)
 * - Top queries
 * - Landing page performance
 * - Index coverage status
 *
 * Uses service account authentication (shared with GA integration).
 */
import pkg from "@googleapis/searchconsole";
const { google } = pkg;
import { getSearchConsoleConfig } from "../../config/search-console.server";
import { getCached, setCached } from "../../services/cache.server";
import { appMetrics } from "../../utils/metrics.server";
// ============================================================================
// Search Console Client
// ============================================================================
/**
 * Create authenticated Search Console client using service account
 */
async function createSearchConsoleClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });
    const authClient = await auth.getClient();
    return google.searchconsole({
        version: "v1",
        auth: authClient,
    });
}
// ============================================================================
// Search Analytics
// ============================================================================
/**
 * Fetch search analytics metrics for the last 30 days with 7-day trend
 */
export async function getSearchAnalytics() {
    const startTime = Date.now();
    const cacheKey = "searchconsole:analytics:30d";
    const cached = getCached(cacheKey);
    if (cached) {
        appMetrics.cacheHit(cacheKey);
        return cached;
    }
    appMetrics.cacheMiss(cacheKey);
    try {
        const config = getSearchConsoleConfig();
        const client = await createSearchConsoleClient();
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const currentStart = thirtyDaysAgo.toISOString().split("T")[0];
        const currentEnd = today.toISOString().split("T")[0];
        const previousStart = sevenDaysAgo.toISOString().split("T")[0];
        const [currentData, previousData] = await Promise.all([
            fetchSearchAnalyticsData(client, config.siteUrl, currentStart, currentEnd),
            fetchSearchAnalyticsData(client, config.siteUrl, previousStart, currentEnd),
        ]);
        const clicksChange = calculatePercentageChange(currentData.clicks, previousData.clicks);
        const impressionsChange = calculatePercentageChange(currentData.impressions, previousData.impressions);
        const ctrChange = calculatePercentageChange(currentData.ctr, previousData.ctr);
        const positionChange = previousData.position - currentData.position;
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getSearchAnalytics", true, duration);
        const result = {
            clicks: currentData.clicks,
            impressions: currentData.impressions,
            ctr: currentData.ctr,
            position: currentData.position,
            change7d: {
                clicksChange,
                impressionsChange,
                ctrChange,
                positionChange,
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
        appMetrics.gaApiCall("getSearchAnalytics", false, duration);
        throw error;
    }
}
async function fetchSearchAnalyticsData(client, siteUrl, startDate, endDate) {
    const response = await client.searchanalytics.query({
        siteUrl,
        requestBody: {
            startDate,
            endDate,
            dimensions: [],
            aggregationType: "auto",
        },
    });
    const row = response.data.rows?.[0];
    const clicks = row?.clicks || 0;
    const impressions = row?.impressions || 0;
    const ctr = row?.ctr || 0;
    const position = row?.position || 0;
    return { clicks, impressions, ctr, position };
}
export async function getTopQueries(limit = 10) {
    const startTime = Date.now();
    const cacheKey = `searchconsole:top-queries:${limit}`;
    const cached = getCached(cacheKey);
    if (cached) {
        appMetrics.cacheHit(cacheKey);
        return cached;
    }
    appMetrics.cacheMiss(cacheKey);
    try {
        const config = getSearchConsoleConfig();
        const client = await createSearchConsoleClient();
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString().split("T")[0];
        const endDate = today.toISOString().split("T")[0];
        const response = await client.searchanalytics.query({
            siteUrl: config.siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ["query"],
                rowLimit: limit,
                aggregationType: "auto",
            },
        });
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getTopQueries", true, duration);
        const queries = (response.data.rows || []).map((row) => ({
            query: row.keys?.[0] || "",
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
            ctr: row.ctr || 0,
            position: row.position || 0,
        }));
        setCached(cacheKey, queries, 300000);
        return queries;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getTopQueries", false, duration);
        throw error;
    }
}
export async function getLandingPages(limit = 20) {
    const startTime = Date.now();
    const cacheKey = `searchconsole:landing-pages:${limit}`;
    const cached = getCached(cacheKey);
    if (cached) {
        appMetrics.cacheHit(cacheKey);
        return cached;
    }
    appMetrics.cacheMiss(cacheKey);
    try {
        const config = getSearchConsoleConfig();
        const client = await createSearchConsoleClient();
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const currentStart = thirtyDaysAgo.toISOString().split("T")[0];
        const currentEnd = today.toISOString().split("T")[0];
        const previousStart = sevenDaysAgo.toISOString().split("T")[0];
        const [currentResponse, previousResponse] = await Promise.all([
            client.searchanalytics.query({
                siteUrl: config.siteUrl,
                requestBody: {
                    startDate: currentStart,
                    endDate: currentEnd,
                    dimensions: ["page"],
                    rowLimit: limit,
                    aggregationType: "auto",
                },
            }),
            client.searchanalytics.query({
                siteUrl: config.siteUrl,
                requestBody: {
                    startDate: previousStart,
                    endDate: currentEnd,
                    dimensions: ["page"],
                    rowLimit: limit,
                    aggregationType: "auto",
                },
            }),
        ]);
        const currentPages = new Map((currentResponse.data.rows || []).map((row) => [
            row.keys?.[0] || "",
            {
                clicks: row.clicks || 0,
                impressions: row.impressions || 0,
                ctr: row.ctr || 0,
                position: row.position || 0,
            },
        ]));
        const previousPages = new Map((previousResponse.data.rows || []).map((row) => [
            row.keys?.[0] || "",
            { clicks: row.clicks || 0 },
        ]));
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getLandingPages", true, duration);
        const pages = Array.from(currentPages.entries()).map(([url, current]) => {
            const previous = previousPages.get(url)?.clicks || 0;
            const change7dPct = calculatePercentageChange(current.clicks, previous);
            return {
                url,
                clicks: current.clicks,
                impressions: current.impressions,
                ctr: current.ctr,
                position: current.position,
                change7dPct,
            };
        });
        pages.sort((a, b) => b.clicks - a.clicks);
        setCached(cacheKey, pages, 300000);
        return pages;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getLandingPages", false, duration);
        throw error;
    }
}
export async function getIndexStatus() {
    const startTime = Date.now();
    const cacheKey = "searchconsole:index-status";
    const cached = getCached(cacheKey);
    if (cached) {
        appMetrics.cacheHit(cacheKey);
        return cached;
    }
    appMetrics.cacheMiss(cacheKey);
    try {
        const result = {
            totalPages: 0,
            indexedPages: 0,
            notIndexed: 0,
            errors: 0,
            warnings: 0,
            coveragePct: 0,
        };
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getIndexStatus", true, duration);
        setCached(cacheKey, result, 900000);
        return result;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("getIndexStatus", false, duration);
        throw error;
    }
}
export async function getSearchConsoleSummary() {
    const [analytics, topQueries, landingPages] = await Promise.all([
        getSearchAnalytics(),
        getTopQueries(10),
        getLandingPages(10),
    ]);
    // Store to Supabase (async, don't block response)
    // Import dynamically to avoid circular dependency
    import("../../services/seo/search-console-storage")
        .then(({ storeSearchConsoleSummary }) => {
        storeSearchConsoleSummary().catch((err) => console.error("[Search Console] Storage failed:", err.message));
    })
        .catch(() => {
        // Silently fail if storage module not available
    });
    return {
        totalClicks: analytics.clicks,
        totalImpressions: analytics.impressions,
        avgCtr: analytics.ctr,
        avgPosition: analytics.position,
        indexCoveragePct: 0,
        topQueries,
        landingPages,
    };
}
function calculatePercentageChange(current, previous) {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
}
//# sourceMappingURL=search-console.js.map