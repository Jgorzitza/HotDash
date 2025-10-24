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
export interface BingSearchAnalytics {
    clicks: number;
    impressions: number;
    ctr: number;
    avgPosition: number;
    change7d: {
        clicksChange: number;
        impressionsChange: number;
        ctrChange: number;
    };
    period: {
        start: string;
        end: string;
    };
}
export interface BingTopKeyword {
    keyword: string;
    clicks: number;
    impressions: number;
    ctr: number;
    avgPosition: number;
}
export interface BingPageStats {
    url: string;
    clicks: number;
    impressions: number;
    ctr: number;
}
export interface BingCrawlStats {
    crawledPages: number;
    crawlErrors: number;
    blockedPages: number;
    indexedPages: number;
}
export interface BingWebmasterSummary {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
    crawlErrors: number;
    indexedPages: number;
    topKeywords: BingTopKeyword[];
    topPages: BingPageStats[];
}
export declare function getBingSearchAnalytics(): Promise<BingSearchAnalytics>;
export declare function getBingTopKeywords(limit?: number): Promise<BingTopKeyword[]>;
export declare function getBingTopPages(limit?: number): Promise<BingPageStats[]>;
export declare function getBingCrawlStats(): Promise<BingCrawlStats>;
export declare function getBingWebmasterSummary(): Promise<BingWebmasterSummary>;
//# sourceMappingURL=bing-webmaster.d.ts.map