/**
 * SEO Reporting Automation Service
 *
 * Generates comprehensive weekly SEO reports:
 * - Keyword ranking changes
 * - Core Web Vitals performance
 * - Site health summary
 * - Competitive opportunities
 * - Actionable recommendations
 *
 * @module services/seo/seo-reporting
 */
export interface SEOWeeklyReport {
    period: {
        start: string;
        end: string;
    };
    summary: ReportSummary;
    rankings: RankingsSection;
    webVitals: WebVitalsSection;
    siteHealth: SiteHealthSection;
    opportunities: OpportunitiesSection;
    recommendations: string[];
    generatedAt: string;
}
export interface ReportSummary {
    overallScore: number;
    grade: "A" | "B" | "C" | "D" | "F";
    keyChanges: string[];
    topWins: string[];
    topIssues: string[];
}
export interface RankingsSection {
    totalKeywords: number;
    avgPosition: number;
    positionChange: number;
    topMovers: Array<{
        keyword: string;
        oldPosition: number;
        newPosition: number;
        change: number;
    }>;
    newRankings: Array<{
        keyword: string;
        position: number;
    }>;
}
export interface WebVitalsSection {
    mobile: {
        lcp: number;
        fid: number;
        cls: number;
        score: number;
    };
    desktop: {
        lcp: number;
        fid: number;
        cls: number;
        score: number;
    };
    changes: {
        lcpChange: number;
        fidChange: number;
        clsChange: number;
    };
}
export interface SiteHealthSection {
    totalPages: number;
    orphanPages: number;
    indexedPages: number;
    crawlErrors: number;
    cannibalizationIssues: number;
    healthScore: number;
}
export interface OpportunitiesSection {
    quickWins: Array<{
        title: string;
        impact: string;
        effort: string;
    }>;
    competitiveGaps: string[];
    contentIdeas: string[];
}
/**
 * Generate weekly SEO report
 */
export declare function generateWeeklyReport(domain: string, options?: {
    competitors?: string[];
    previousData?: any;
}): Promise<SEOWeeklyReport>;
/**
 * Get report summary only (lightweight)
 */
export declare function getReportSummary(domain: string): Promise<ReportSummary>;
//# sourceMappingURL=seo-reporting.d.ts.map