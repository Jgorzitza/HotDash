/**
 * Keyword Cannibalization Detection Service
 *
 * Identifies keyword cannibalization issues where multiple pages
 * from the same site compete for the same keywords in search results.
 *
 * Features:
 * - Detect multiple pages ranking for the same keyword
 * - Calculate cannibalization severity score
 * - Recommend consolidation strategies
 * - Track cannibalization trends over time
 *
 * @module services/seo/cannibalization
 */
export interface KeywordRanking {
    keyword: string;
    url: string;
    position: number;
    clicks: number;
    impressions: number;
    ctr: number;
}
export interface CannibalizationIssue {
    keyword: string;
    severity: "critical" | "warning" | "info";
    affectedUrls: Array<{
        url: string;
        position: number;
        clicks: number;
        impressions: number;
        ctr: number;
    }>;
    totalClicks: number;
    totalImpressions: number;
    potentialClicksLost: number;
    recommendation: {
        action: "consolidate" | "differentiate" | "canonical" | "redirect";
        primaryUrl: string;
        secondaryUrls: string[];
        rationale: string;
    };
    detectedAt: string;
}
export interface CannibalizationReport {
    summary: {
        totalKeywords: number;
        keywordsWithCannibalization: number;
        criticalIssues: number;
        warningIssues: number;
        infoIssues: number;
        estimatedClicksLost: number;
    };
    issues: CannibalizationIssue[];
    topIssues: CannibalizationIssue[];
    generatedAt: string;
}
/**
 * Detect keyword cannibalization issues from Search Console data
 */
export declare function detectKeywordCannibalization(shopDomain: string): Promise<CannibalizationReport>;
/**
 * Get detailed cannibalization analysis for a specific keyword
 */
export declare function getKeywordCannibalizationDetails(shopDomain: string, keyword: string): Promise<CannibalizationIssue | null>;
/**
 * Get stored cannibalization conflicts from database
 */
export declare function getStoredCannibalizationConflicts(shopDomain: string, status?: "active" | "resolved" | "ignored"): Promise<CannibalizationIssue[]>;
/**
 * Mark cannibalization as resolved
 */
export declare function resolveCannibalizationConflict(id: number, resolution: string): Promise<void>;
//# sourceMappingURL=cannibalization.d.ts.map