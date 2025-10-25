/**
 * Enhanced Search Console Integration Service
 *
 * Extended Google Search Console integration with:
 * - More comprehensive metrics (impressions, clicks, CTR, position)
 * - Daily data refresh and storage
 * - Historical tracking in seo_rankings table
 * - Query-level and page-level analysis
 * - Device and country breakdowns
 *
 * @module services/seo/search-console-enhanced
 */
export interface EnhancedSearchMetrics {
    date: string;
    query?: string;
    page?: string;
    device?: "MOBILE" | "DESKTOP" | "TABLET";
    country?: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}
export interface DailyMetricsSnapshot {
    date: string;
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
    topQueries: Array<{
        query: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    topPages: Array<{
        page: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    deviceBreakdown: {
        mobile: {
            clicks: number;
            impressions: number;
        };
        desktop: {
            clicks: number;
            impressions: number;
        };
        tablet: {
            clicks: number;
            impressions: number;
        };
    };
}
export interface HistoricalTrend {
    query: string;
    page: string;
    history: Array<{
        date: string;
        clicks: number;
        impressions: number;
        position: number;
        change: {
            clicks: number;
            impressions: number;
            position: number;
        };
    }>;
}
/**
 * Fetch comprehensive search analytics with all dimensions
 */
export declare function fetchEnhancedMetrics(startDate: string, endDate: string, dimensions?: Array<"query" | "page" | "device" | "country">, limit?: number): Promise<EnhancedSearchMetrics[]>;
/**
 * Fetch daily snapshot of search performance
 */
export declare function fetchDailySnapshot(date: string): Promise<DailyMetricsSnapshot>;
/**
 * Fetch historical trends for a keyword or page
 */
export declare function fetchHistoricalTrend(query: string, page: string, startDate: string, endDate: string): Promise<HistoricalTrend>;
/**
 * Refresh daily search console data and store in database
 * In production, this would be called by a cron job
 */
export declare function refreshDailyData(): Promise<void>;
/**
 * Get comparison between two date ranges
 */
export declare function compareTimeRanges(currentStart: string, currentEnd: string, previousStart: string, previousEnd: string): Promise<{
    current: DailyMetricsSnapshot;
    previous: DailyMetricsSnapshot;
    changes: {
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    };
}>;
//# sourceMappingURL=search-console-enhanced.d.ts.map