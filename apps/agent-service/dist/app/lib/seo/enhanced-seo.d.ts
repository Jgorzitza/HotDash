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
export declare function getEnhancedSEOData(): Promise<EnhancedSEOData>;
//# sourceMappingURL=enhanced-seo.d.ts.map