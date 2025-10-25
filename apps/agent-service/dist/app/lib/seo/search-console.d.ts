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
export interface SearchAnalyticsMetrics {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    change7d: {
        clicksChange: number;
        impressionsChange: number;
        ctrChange: number;
        positionChange: number;
    };
    period: {
        start: string;
        end: string;
    };
}
export interface TopQuery {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}
export interface LandingPageMetrics {
    url: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    change7dPct: number;
}
export interface IndexStatusMetrics {
    totalPages: number;
    indexedPages: number;
    notIndexed: number;
    errors: number;
    warnings: number;
    coveragePct: number;
}
export interface SearchConsoleSummary {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
    indexCoveragePct: number;
    topQueries: TopQuery[];
    landingPages: LandingPageMetrics[];
}
/**
 * Fetch search analytics metrics for the last 30 days with 7-day trend
 */
export declare function getSearchAnalytics(): Promise<SearchAnalyticsMetrics>;
export declare function getTopQueries(limit?: number): Promise<TopQuery[]>;
export declare function getLandingPages(limit?: number): Promise<LandingPageMetrics[]>;
export declare function getIndexStatus(): Promise<IndexStatusMetrics>;
export declare function getSearchConsoleSummary(): Promise<SearchConsoleSummary>;
//# sourceMappingURL=search-console.d.ts.map