/**
 * Grading Analytics Service
 *
 * Analyzes AI response grading data from HITL workflow to identify trends,
 * patterns, and opportunities for improvement.
 *
 * @module services/ai-customer/grading-analytics
 */
/**
 * Grading statistics for a segment (template, time period, etc.)
 */
export interface GradeStats {
    count: number;
    avgTone: number;
    avgAccuracy: number;
    avgPolicy: number;
    avgOverall: number;
    minOverall: number;
    maxOverall: number;
}
/**
 * Main grading analytics response
 */
export interface GradeAnalytics {
    averages: {
        tone: number;
        accuracy: number;
        policy: number;
        overall: number;
    };
    byTemplate: Map<string, GradeStats>;
    byTimePeriod: Map<string, GradeStats>;
    insights: string[];
    totalGrades: number;
}
/**
 * Get grading trends over time
 *
 * Analyzes grading data from decision_log to calculate averages,
 * identify trends by template and time period, and generate insights.
 *
 * @param days - Number of days to analyze (default: 30)
 * @returns Comprehensive grading analytics
 *
 * @example
 * ```typescript
 * const analytics = await getGradingTrends(30);
 * console.log(`Average tone: ${analytics.averages.tone}`);
 * console.log(`Insights: ${analytics.insights.join(', ')}`);
 * ```
 */
export declare function getGradingTrends(days?: number): Promise<GradeAnalytics>;
/**
 * Identify low-scoring patterns
 *
 * Analyzes responses with low grades (< 3) to identify common patterns
 * and areas for improvement.
 *
 * @returns Patterns categorized by grade dimension
 *
 * @example
 * ```typescript
 * const patterns = await identifyLowScoringPatterns();
 * console.log(`${patterns.toneIssues.length} responses with tone issues`);
 * ```
 */
export declare function identifyLowScoringPatterns(): Promise<{
    toneIssues: {
        draftText?: string;
        finalText?: string;
        tone: number;
        accuracy: number;
        policy: number;
        editDistance?: number;
        createdAt: Date;
    }[];
    accuracyIssues: {
        draftText?: string;
        finalText?: string;
        tone: number;
        accuracy: number;
        policy: number;
        editDistance?: number;
        createdAt: Date;
    }[];
    policyIssues: {
        draftText?: string;
        finalText?: string;
        tone: number;
        accuracy: number;
        policy: number;
        editDistance?: number;
        createdAt: Date;
    }[];
}>;
/**
 * Main entry point for grading analytics API
 *
 * Converts time range string to days and calls getGradingTrends
 *
 * @param timeRange - Time range string ('7d', '30d', '90d', 'all')
 * @param supabaseUrl - Supabase URL (unused but kept for API compatibility)
 * @param supabaseKey - Supabase key (unused but kept for API compatibility)
 * @returns GradeAnalytics object with trends and insights
 */
export declare function analyzeGrades(timeRange: string, supabaseUrl?: string, supabaseKey?: string): Promise<GradeAnalytics>;
//# sourceMappingURL=grading-analytics.d.ts.map