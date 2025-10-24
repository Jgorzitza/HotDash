/**
 * SEO Impact Analysis Service
 *
 * Tracks keyword rankings over time
 * Identifies ranking improvements and declines
 * Correlates with content changes
 * Stores in DashboardFact table with factType="seo_ranking"
 */
export interface KeywordRanking {
    keyword: string;
    position: number;
    previousPosition?: number;
    change: number;
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
    topMovers: Array<{
        keyword: string;
        change: number;
    }>;
    topDecliners: Array<{
        keyword: string;
        change: number;
    }>;
}
/**
 * Track keyword ranking for SEO analysis
 * Stores historical data and identifies trends
 */
export declare function trackKeywordRanking(keyword: string, position: number, url: string, shopDomain?: string, searchVolume?: number): Promise<SEORankingData>;
/**
 * Get SEO impact analysis for a time period
 * Returns summary of ranking changes and trends
 */
export declare function getSEOImpactAnalysis(shopDomain?: string, days?: number): Promise<SEOImpactSummary>;
/**
 * Correlate SEO ranking changes with content updates
 * Finds content changes that coincide with ranking improvements
 */
export declare function correlateSEOWithContent(shopDomain?: string, days?: number): Promise<Array<{
    keyword: string;
    rankingChange: number;
    contentUpdates: number;
    correlation: "positive" | "negative" | "neutral";
}>>;
/**
 * Get historical ranking trend for a specific keyword
 */
export declare function getKeywordHistory(keyword: string, shopDomain?: string, days?: number): Promise<Array<{
    position: number;
    date: Date;
    change: number;
    trend: string;
}>>;
//# sourceMappingURL=seo-impact.d.ts.map