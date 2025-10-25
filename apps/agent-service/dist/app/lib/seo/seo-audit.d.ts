/**
 * SEO Audit Service
 *
 * Comprehensive SEO auditing capabilities including:
 * - Page-level SEO analysis
 * - Site-wide SEO health checks
 * - Performance optimization recommendations
 * - Technical SEO validation
 */
import { type PageSEOData } from "./seo-optimization";
export interface SEOAuditResult {
    overallScore: number;
    categoryScores: {
        content: number;
        technical: number;
        performance: number;
        accessibility: number;
    };
    issues: SEOIssue[];
    recommendations: SEORecommendation[];
    metrics: SEOMetrics;
}
export interface SEOIssue {
    type: 'error' | 'warning' | 'info';
    category: 'content' | 'technical' | 'performance' | 'accessibility';
    message: string;
    impact: 'high' | 'medium' | 'low';
    fixable: boolean;
    suggestion?: string;
}
export interface SEORecommendation {
    category: 'content' | 'technical' | 'performance' | 'accessibility';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    implementation: string;
    expectedImpact: string;
}
export interface SEOMetrics {
    pageLoadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    totalBlockingTime: number;
    seoScore: number;
    accessibilityScore: number;
    performanceScore: number;
    bestPracticesScore: number;
}
export declare class SEOAuditor {
    /**
     * Perform comprehensive SEO audit on a page
     */
    auditPage(pageData: PageSEOData, htmlContent: string, url: string): Promise<SEOAuditResult>;
    private analyzeContent;
    private analyzeTechnicalSEO;
    private analyzePerformance;
    private analyzeAccessibility;
    private generateMetrics;
}
export declare const seoAuditor: SEOAuditor;
//# sourceMappingURL=seo-audit.d.ts.map