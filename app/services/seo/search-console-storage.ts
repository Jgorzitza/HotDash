/**
 * Search Console Storage Service
 *
 * Stores Search Console data to Supabase for historical tracking.
 * Fills the gap: Search Console API works but data NOT persisted (in-memory cache only).
 *
 * Features:
 * - Store site-wide metrics (upsert daily)
 * - Store top queries (replace daily, top 25)
 * - Store landing pages (replace daily, top 25)
 * - Historical trend queries
 * - Nightly sync job
 *
 * Prerequisites:
 * - Data agent: seo_search_console_metrics, seo_search_queries, seo_landing_pages tables (DATA-021)
 * - Search Console API: app/lib/seo/search-console.ts (already working)
 */

import prisma from "~/db.server";
import {
  getSearchAnalytics,
  getTopQueries,
  getLandingPages,
  type SearchAnalyticsMetrics,
  type TopQuery,
  type LandingPageMetrics,
} from "../../lib/seo/search-console";

// ============================================================================
// Store Functions
// ============================================================================

/**
 * Store site-wide Search Console metrics
 *
 * Upserts daily record (replace if exists for same date+period)
 *
 * @param metrics - Search Console metrics from API
 * @param periodDays - Period (default: 30 days)
 */
export async function storeSearchConsoleMetrics(
  metrics: SearchAnalyticsMetrics,
  periodDays: number = 30,
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(
    `[Search Console Storage] Storing metrics for ${today.toISOString().split("T")[0]} (${periodDays}d)`,
  );

  await prisma.seoSearchConsoleMetrics.upsert({
    where: {
      date_periodDays: {
        date: today,
        periodDays,
      },
    },
    create: {
      date: today,
      periodDays,
      clicks: metrics.clicks,
      impressions: metrics.impressions,
      ctr: metrics.ctr,
      position: metrics.position,
      clicksChange7d: metrics.change7d.clicksChange,
      impressionsChange7d: metrics.change7d.impressionsChange,
      ctrChange7d: metrics.change7d.ctrChange,
      positionChange7d: metrics.change7d.positionChange,
      fetchedAt: new Date(),
    },
    update: {
      clicks: metrics.clicks,
      impressions: metrics.impressions,
      ctr: metrics.ctr,
      position: metrics.position,
      clicksChange7d: metrics.change7d.clicksChange,
      impressionsChange7d: metrics.change7d.impressionsChange,
      ctrChange7d: metrics.change7d.ctrChange,
      positionChange7d: metrics.change7d.positionChange,
      fetchedAt: new Date(),
    },
  });

  console.log(
    `[Search Console Storage] ✅ Metrics stored: ${metrics.clicks} clicks, ${metrics.impressions} impressions`,
  );
}

/**
 * Store top search queries
 *
 * Replace strategy: Delete existing for today, insert new batch
 *
 * @param queries - Top queries from Search Console API
 * @param periodDays - Period (default: 30 days)
 */
export async function storeTopQueries(
  queries: TopQuery[],
  periodDays: number = 30,
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(
    `[Search Console Storage] Storing ${queries.length} top queries for ${today.toISOString().split("T")[0]}`,
  );

  // Delete existing queries for today (replace strategy)
  await prisma.seoSearchQuery.deleteMany({
    where: { date: today, periodDays },
  });

  // Insert new queries with ranking
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];

    await prisma.seoSearchQuery.create({
      data: {
        date: today,
        periodDays,
        query: query.query,
        clicks: query.clicks,
        impressions: query.impressions,
        ctr: query.ctr,
        position: query.position,
        rank: i + 1, // 1-based ranking
      },
    });
  }

  console.log(`[Search Console Storage] ✅ ${queries.length} queries stored`);
}

/**
 * Store landing page metrics
 *
 * Replace strategy: Delete existing for today, insert new batch
 *
 * @param pages - Landing pages from Search Console API
 * @param periodDays - Period (default: 30 days)
 */
export async function storeLandingPages(
  pages: LandingPageMetrics[],
  periodDays: number = 30,
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(
    `[Search Console Storage] Storing ${pages.length} landing pages for ${today.toISOString().split("T")[0]}`,
  );

  // Delete existing pages for today (replace strategy)
  await prisma.seoLandingPage.deleteMany({
    where: { date: today, periodDays },
  });

  // Insert new pages with ranking
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    await prisma.seoLandingPage.create({
      data: {
        date: today,
        periodDays,
        url: page.url,
        clicks: page.clicks,
        impressions: page.impressions,
        ctr: page.ctr,
        position: page.position,
        clicksChange7d: page.change7dPct,
        rank: i + 1, // 1-based ranking
      },
    });
  }

  console.log(`[Search Console Storage] ✅ ${pages.length} pages stored`);
}

// ============================================================================
// Complete Summary Storage
// ============================================================================

/**
 * Store complete Search Console summary (all-in-one)
 *
 * Fetches from Search Console API and stores to Supabase:
 * - Site-wide metrics
 * - Top 25 queries
 * - Top 25 landing pages
 *
 * @returns Summary of stored data
 */
export async function storeSearchConsoleSummary() {
  console.log(
    "[Search Console Storage] ========================================",
  );
  console.log("[Search Console Storage] Starting complete summary storage");
  console.log(
    "[Search Console Storage] ========================================",
  );

  try {
    // 1. Fetch from Search Console API (cached 5 minutes)
    const [metrics, queries, pages] = await Promise.all([
      getSearchAnalytics(),
      getTopQueries(25),
      getLandingPages(25),
    ]);

    console.log(
      `[Search Console Storage] Fetched: ${metrics.clicks} clicks, ${queries.length} queries, ${pages.length} pages`,
    );

    // 2. Store to Supabase
    await Promise.all([
      storeSearchConsoleMetrics(metrics, 30),
      storeTopQueries(queries, 30),
      storeLandingPages(pages, 30),
    ]);

    console.log(
      "[Search Console Storage] ✅ Complete summary stored successfully",
    );

    return {
      success: true,
      metrics,
      queriesCount: queries.length,
      pagesCount: pages.length,
    };
  } catch (error: any) {
    console.error("[Search Console Storage] ❌ Storage error:", error.message);
    console.error("[Search Console Storage] Stack:", error.stack);
    throw error;
  }
}

// ============================================================================
// Historical Query Functions
// ============================================================================

/**
 * Get historical site-wide metrics
 *
 * @param days - Number of days to fetch (default: 30)
 * @returns Daily metrics, newest first
 */
export async function getHistoricalMetrics(days: number = 30) {
  console.log(
    `[Search Console Storage] Fetching ${days} days of historical metrics`,
  );

  const records = await prisma.seoSearchConsoleMetrics.findMany({
    where: { periodDays: 30 },
    orderBy: { date: "desc" },
    take: days,
  });

  console.log(
    `[Search Console Storage] Found ${records.length} historical metric records`,
  );

  return records;
}

/**
 * Get trend for a specific search query
 *
 * @param query - Search query text
 * @param days - Number of days to fetch (default: 30)
 * @returns Daily query metrics, newest first
 */
export async function getQueryTrend(query: string, days: number = 30) {
  console.log(
    `[Search Console Storage] Fetching ${days}-day trend for query: "${query}"`,
  );

  const records = await prisma.seoSearchQuery.findMany({
    where: { query, periodDays: 30 },
    orderBy: { date: "desc" },
    take: days,
  });

  console.log(
    `[Search Console Storage] Found ${records.length} records for query "${query}"`,
  );

  return records;
}

/**
 * Get trend for a specific landing page
 *
 * @param url - Landing page URL
 * @param days - Number of days to fetch (default: 30)
 * @returns Daily page metrics, newest first
 */
export async function getLandingPageTrend(url: string, days: number = 30) {
  console.log(
    `[Search Console Storage] Fetching ${days}-day trend for page: "${url}"`,
  );

  const records = await prisma.seoLandingPage.findMany({
    where: { url, periodDays: 30 },
    orderBy: { date: "desc" },
    take: days,
  });

  console.log(
    `[Search Console Storage] Found ${records.length} records for page "${url}"`,
  );

  return records;
}

/**
 * Get top queries for a specific date
 *
 * @param date - Date to query (default: today)
 * @param limit - Number of queries to return (default: 10)
 * @returns Top queries for the specified date
 */
export async function getTopQueriesByDate(
  date: Date = new Date(),
  limit: number = 10,
) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  console.log(
    `[Search Console Storage] Fetching top ${limit} queries for ${dateOnly.toISOString().split("T")[0]}`,
  );

  const records = await prisma.seoSearchQuery.findMany({
    where: { date: dateOnly, periodDays: 30 },
    orderBy: { rank: "asc" },
    take: limit,
  });

  console.log(
    `[Search Console Storage] Found ${records.length} queries for date ${dateOnly.toISOString().split("T")[0]}`,
  );

  return records;
}

/**
 * Get top landing pages for a specific date
 *
 * @param date - Date to query (default: today)
 * @param limit - Number of pages to return (default: 10)
 * @returns Top landing pages for the specified date
 */
export async function getTopLandingPagesByDate(
  date: Date = new Date(),
  limit: number = 10,
) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  console.log(
    `[Search Console Storage] Fetching top ${limit} pages for ${dateOnly.toISOString().split("T")[0]}`,
  );

  const records = await prisma.seoLandingPage.findMany({
    where: { date: dateOnly, periodDays: 30 },
    orderBy: { rank: "asc" },
    take: limit,
  });

  console.log(
    `[Search Console Storage] Found ${records.length} pages for date ${dateOnly.toISOString().split("T")[0]}`,
  );

  return records;
}
