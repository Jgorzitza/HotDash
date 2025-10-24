/**
 * Competitor Analysis Service
 *
 * Analyzes competitor SEO strategies:
 * - Track competitor keyword rankings
 * - Compare content metrics
 * - Identify competitive opportunities
 * - Gap analysis for keywords and content
 *
 * @module services/seo/competitor-analysis
 */
export interface CompetitorProfile {
    domain: string;
    estimatedTraffic: number;
    domainAuthority: number;
    topKeywords: CompetitorKeyword[];
    contentMetrics: ContentMetrics;
    backlinks: number;
    analyzedAt: string;
}
export interface CompetitorKeyword {
    keyword: string;
    position: number;
    searchVolume: number;
    difficulty: number;
    traffic: number;
    url: string;
}
export interface ContentMetrics {
    totalPages: number;
    avgWordCount: number;
    avgReadingTime: number;
    contentTypes: Record<string, number>;
    updateFrequency: string;
}
export interface CompetitiveOpportunity {
    type: "keyword-gap" | "content-gap" | "backlink-opportunity" | "ranking-opportunity";
    keyword?: string;
    contentTopic?: string;
    competitor: string;
    opportunity: string;
    estimatedImpact: "high" | "medium" | "low";
    difficulty: "easy" | "medium" | "hard";
}
export interface CompetitorAnalysisReport {
    yourDomain: string;
    competitors: CompetitorProfile[];
    opportunities: CompetitiveOpportunity[];
    keywordGaps: CompetitorKeyword[];
    contentGaps: string[];
    summary: {
        totalCompetitors: number;
        totalOpportunities: number;
        avgCompetitorAuthority: number;
        recommendedActions: string[];
    };
    analyzedAt: string;
}
/**
 * Analyze competitors and identify opportunities
 */
export declare function analyzeCompetitors(yourDomain: string, competitorDomains: string[], yourKeywords?: Set<string>, yourTopics?: Set<string>): Promise<CompetitorAnalysisReport>;
/**
 * Get top opportunities from competitor analysis
 */
export declare function getTopOpportunities(yourDomain: string, competitorDomains: string[]): Promise<CompetitiveOpportunity[]>;
//# sourceMappingURL=competitor-analysis.d.ts.map