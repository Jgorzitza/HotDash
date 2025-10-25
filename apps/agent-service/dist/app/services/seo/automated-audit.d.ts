/**
 * Automated SEO Audit Service
 *
 * Provides daily automated SEO crawling and auditing:
 * - Title tags (presence, length, uniqueness)
 * - Meta descriptions (presence, length, uniqueness)
 * - Header tags (H1 presence and structure)
 * - Images (alt text presence)
 * - Duplicate content detection
 *
 * Results are stored in seo_audits table for tracking over time.
 *
 * @module services/seo/automated-audit
 */
export interface SEOAuditIssue {
    type: "missing_title" | "title_too_long" | "title_too_short" | "missing_meta" | "meta_too_long" | "meta_too_short" | "missing_h1" | "multiple_h1" | "missing_alt" | "duplicate_content";
    severity: "critical" | "warning" | "info";
    url: string;
    element?: string;
    currentValue?: string;
    recommendedValue?: string;
    description: string;
}
export interface PageAuditResult {
    url: string;
    title: string | null;
    titleLength: number;
    metaDescription: string | null;
    metaLength: number;
    h1Count: number;
    h1Text: string[];
    imageCount: number;
    imagesWithoutAlt: number;
    issues: SEOAuditIssue[];
    auditedAt: string;
}
export interface AuditSummary {
    totalPages: number;
    totalIssues: number;
    criticalIssues: number;
    warningIssues: number;
    infoIssues: number;
    issuesByType: Record<string, number>;
    pagesWithIssues: number;
    auditStartedAt: string;
    auditCompletedAt: string;
    durationMs: number;
}
export interface AuditResult {
    summary: AuditSummary;
    pages: PageAuditResult[];
    topIssues: SEOAuditIssue[];
}
/**
 * Run automated SEO audit on a list of URLs
 */
export declare function runDailyAudit(urls: string[]): Promise<AuditResult>;
/**
 * Get list of URLs to audit (from sitemap or product list)
 */
export declare function getURLsToAudit(shopDomain: string): Promise<string[]>;
//# sourceMappingURL=automated-audit.d.ts.map