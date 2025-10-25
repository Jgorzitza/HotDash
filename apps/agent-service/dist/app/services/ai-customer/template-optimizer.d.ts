/**
 * AI-Customer Template Optimization Service
 *
 * Identifies high-performing response templates based on HITL grades,
 * extracts common patterns, and provides recommendations for template
 * improvements. Supports A/B testing preparation by tracking template
 * performance over time.
 *
 * @module app/services/ai-customer/template-optimizer
 * @see docs/directions/ai-customer.md AI-CUSTOMER-002
 */
/**
 * Template performance metrics
 */
export interface TemplatePerformance {
    templateId: string;
    templateName: string;
    usageCount: number;
    averageGrade: number;
    toneAverage: number;
    accuracyAverage: number;
    policyAverage: number;
    successRate: number;
    firstUsed: string;
    lastUsed: string;
    trend: "improving" | "declining" | "stable";
}
/**
 * Common pattern identified across high-performing templates
 */
export interface TemplatePattern {
    patternType: "opening" | "closing" | "structure" | "tone" | "keyword";
    description: string;
    frequency: number;
    exampleTemplates: string[];
    avgGradeImprovement: number;
}
/**
 * Template optimization recommendations
 */
export interface TemplateOptimization {
    /** Top performing templates (avg grade >= 4.5) */
    topTemplates: TemplatePerformance[];
    /** Templates needing improvement (avg grade < 3.5) */
    lowPerformingTemplates: TemplatePerformance[];
    /** Common patterns in high-performing templates */
    patterns: TemplatePattern[];
    /** Actionable recommendations for template improvement */
    recommendations: string[];
    /** Templates ready for A/B testing */
    abTestCandidates: ABTestCandidate[];
    /** Analysis metadata */
    metadata: {
        totalTemplates: number;
        totalResponses: number;
        analysisTimeRange: string;
        timestamp: string;
    };
}
/**
 * A/B test candidate pairing
 */
export interface ABTestCandidate {
    currentTemplate: string;
    currentGrade: number;
    proposedTemplate: string;
    proposedChanges: string[];
    expectedImprovement: number;
    confidenceLevel: "high" | "medium" | "low";
}
/**
 * Analyze templates and provide optimization recommendations
 *
 * Strategy:
 * 1. Query decision_log for all graded responses with template info
 * 2. Calculate performance metrics for each template
 * 3. Identify high-performing vs low-performing templates
 * 4. Extract common patterns from high performers
 * 5. Generate recommendations based on patterns
 * 6. Prepare A/B test candidates
 *
 * @param timeRange - Time range to analyze: '7d', '30d', '90d', 'all'
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon/service key
 * @returns Template optimization analysis
 */
export declare function optimizeTemplates(timeRange: string, supabaseUrl: string, supabaseKey: string): Promise<TemplateOptimization>;
//# sourceMappingURL=template-optimizer.d.ts.map