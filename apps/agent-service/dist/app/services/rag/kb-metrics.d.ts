/**
 * Knowledge Base Quality Metrics
 * AI-KNOWLEDGE-014: KB Quality Metrics
 *
 * Measures knowledge base health and quality
 *
 * @module app/services/rag/kb-metrics
 */
export interface KBHealthScore {
    overall: number;
    coverage: number;
    performance: number;
    accuracy: number;
    freshness: number;
    details: {
        documentCount: number;
        indexSizeMB: number;
        avgQueryTime: number;
        indexAgeDays: number;
        categoryCoverage: string[];
    };
}
/**
 * Calculate KB health score (0-100)
 */
export declare function calculateHealthScore(): Promise<KBHealthScore>;
//# sourceMappingURL=kb-metrics.d.ts.map