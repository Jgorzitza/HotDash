/**
 * SEO Impact Analysis Service
 *
 * ANALYTICS-007: Rank tracking + deltas for SEO performance analysis
 *
 * Features:
 * - Track keyword rankings over time
 * - Calculate ranking deltas and trends
 * - Monitor SEO impact of content changes
 * - Generate SEO performance reports
 */
export interface KeywordRanking {
    keyword: string;
    currentRank: number | null;
    previousRank: number | null;
    delta: number;
    searchVolume: number;
    difficulty: number;
    url: string;
    lastUpdated: string;
}
export interface SEOImpactAnalysis {
    totalKeywords: number;
    rankingImprovements: number;
    rankingDeclines: number;
    averageRankChange: number;
    topGainers: KeywordRanking[];
    topLosers: KeywordRanking[];
    overallTrend: 'improving' | 'declining' | 'stable';
    period: {
        start: string;
        end: string;
    };
}
export interface SEOContentImpact {
    contentId: string;
    title: string;
    url: string;
    publishedAt: string;
    keywordImpact: {
        keyword: string;
        beforeRank: number | null;
        afterRank: number | null;
        improvement: number;
    }[];
    overallImpact: number;
    trafficImpact: number;
}
/**
 * Track keyword ranking changes
 *
 * ANALYTICS-007: Core function for SEO ranking analysis
 *
 * @param currentRankings - Current period rankings
 * @param previousRankings - Previous period rankings
 * @returns Updated rankings with deltas
 */
export declare function calculateRankingDeltas(currentRankings: Omit<KeywordRanking, 'delta' | 'previousRank'>[], previousRankings: Omit<KeywordRanking, 'delta' | 'previousRank'>[]): KeywordRanking[];
/**
 * Analyze SEO impact over time
 *
 * ANALYTICS-007: Calculate overall SEO performance trends
 *
 * @param rankings - Keyword rankings with deltas
 * @param startDate - Analysis start date
 * @param endDate - Analysis end date
 * @returns SEO impact analysis
 */
export declare function analyzeSEOImpact(rankings: KeywordRanking[], startDate: string, endDate: string): SEOImpactAnalysis;
/**
 * Analyze content impact on SEO
 *
 * ANALYTICS-007: Track how content changes affect keyword rankings
 *
 * @param contentId - Content identifier
 * @param title - Content title
 * @param url - Content URL
 * @param publishedAt - Publication date
 * @param keywordChanges - Keyword ranking changes
 * @returns Content SEO impact analysis
 */
export declare function analyzeContentSEOImpact(contentId: string, title: string, url: string, publishedAt: string, keywordChanges: {
    keyword: string;
    beforeRank: number | null;
    afterRank: number | null;
}[]): SEOContentImpact;
/**
 * Generate SEO performance report
 *
 * ANALYTICS-007: Create comprehensive SEO performance summary
 *
 * @param analysis - SEO impact analysis
 * @param contentImpacts - Content impact analyses
 * @returns Formatted SEO performance report
 */
export declare function generateSEOReport(analysis: SEOImpactAnalysis, contentImpacts: SEOContentImpact[]): {
    summary: {
        totalKeywords: number;
        improvementRate: number;
        averageRankChange: number;
        overallTrend: "stable" | "improving" | "declining";
    };
    topPerformers: {
        keywords: {
            keyword: string;
            currentRank: number;
            improvement: number;
            url: string;
        }[];
        content: {
            title: string;
            url: string;
            impact: number;
            trafficImpact: number;
        }[];
    };
    recommendations: string[];
    period: {
        start: string;
        end: string;
    };
};
/**
 * Track SEO performance metrics for dashboard
 *
 * ANALYTICS-007: Format SEO data for dashboard display
 *
 * @param analysis - SEO impact analysis
 * @returns Dashboard-ready SEO metrics
 */
export declare function exportSEOMetrics(analysis: SEOImpactAnalysis): {
    metrics: {
        totalKeywords: number;
        improvementRate: number;
        averageRankChange: number;
        overallTrend: "stable" | "improving" | "declining";
    };
    topGainers: {
        keyword: string;
        rank: number;
        improvement: number;
    }[];
    topLosers: {
        keyword: string;
        rank: number;
        decline: number;
    }[];
    period: {
        start: string;
        end: string;
    };
};
//# sourceMappingURL=seoAnalysis.d.ts.map