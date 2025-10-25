/**
 * Automated Meta Tag Optimization Service
 *
 * Automatically optimizes meta tags for pages based on:
 * - Content analysis
 * - Keyword research
 * - Search Console data
 * - Competitor analysis
 * - Best practices
 */
export interface MetaOptimizationResult {
    originalTitle: string;
    optimizedTitle: string;
    originalDescription: string;
    optimizedDescription: string;
    keywords: string[];
    improvements: string[];
    score: number;
}
export interface PageContent {
    url: string;
    title?: string;
    description?: string;
    content: string;
    headings: string[];
}
/**
 * Optimize meta tags for a page
 */
export declare function optimizeMetaTags(pageContent: PageContent): Promise<MetaOptimizationResult>;
/**
 * Batch optimize meta tags for multiple pages
 */
export declare function batchOptimizeMetaTags(pages: PageContent[]): Promise<Map<string, MetaOptimizationResult>>;
//# sourceMappingURL=meta-optimizer.d.ts.map