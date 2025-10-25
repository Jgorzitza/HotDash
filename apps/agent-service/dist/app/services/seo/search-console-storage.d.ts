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
import { type SearchAnalyticsMetrics, type TopQuery, type LandingPageMetrics } from "../../lib/seo/search-console";
/**
 * Store site-wide Search Console metrics
 *
 * Upserts daily record (replace if exists for same date+period)
 *
 * @param metrics - Search Console metrics from API
 * @param periodDays - Period (default: 30 days)
 */
export declare function storeSearchConsoleMetrics(metrics: SearchAnalyticsMetrics, periodDays?: number): Promise<void>;
/**
 * Store top search queries
 *
 * Replace strategy: Delete existing for today, insert new batch
 *
 * @param queries - Top queries from Search Console API
 * @param periodDays - Period (default: 30 days)
 */
export declare function storeTopQueries(queries: TopQuery[], periodDays?: number): Promise<void>;
/**
 * Store landing page metrics
 *
 * Replace strategy: Delete existing for today, insert new batch
 *
 * @param pages - Landing pages from Search Console API
 * @param periodDays - Period (default: 30 days)
 */
export declare function storeLandingPages(pages: LandingPageMetrics[], periodDays?: number): Promise<void>;
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
export declare function storeSearchConsoleSummary(): Promise<{
    success: boolean;
    metrics: SearchAnalyticsMetrics;
    queriesCount: number;
    pagesCount: number;
}>;
/**
 * Get historical site-wide metrics
 *
 * @param days - Number of days to fetch (default: 30)
 * @returns Daily metrics, newest first
 */
export declare function getHistoricalMetrics(days?: number): Promise<any>;
/**
 * Get trend for a specific search query
 *
 * @param query - Search query text
 * @param days - Number of days to fetch (default: 30)
 * @returns Daily query metrics, newest first
 */
export declare function getQueryTrend(query: string, days?: number): Promise<any>;
/**
 * Get trend for a specific landing page
 *
 * @param url - Landing page URL
 * @param days - Number of days to fetch (default: 30)
 * @returns Daily page metrics, newest first
 */
export declare function getLandingPageTrend(url: string, days?: number): Promise<any>;
/**
 * Get top queries for a specific date
 *
 * @param date - Date to query (default: today)
 * @param limit - Number of queries to return (default: 10)
 * @returns Top queries for the specified date
 */
export declare function getTopQueriesByDate(date?: Date, limit?: number): Promise<any>;
/**
 * Get top landing pages for a specific date
 *
 * @param date - Date to query (default: today)
 * @param limit - Number of pages to return (default: 10)
 * @returns Top landing pages for the specified date
 */
export declare function getTopLandingPagesByDate(date?: Date, limit?: number): Promise<any>;
//# sourceMappingURL=search-console-storage.d.ts.map