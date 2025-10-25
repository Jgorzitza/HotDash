/**
 * Enhanced Action Attribution Service
 *
 * ANALYTICS-002: Advanced action attribution and ROI measurement system
 * Builds on existing action-attribution.ts with enhanced features
 */
import type { ActionAttributionResult } from './action-attribution';
export interface EnhancedActionAttributionResult extends ActionAttributionResult {
    costPerAcquisition: number;
    returnOnAdSpend: number;
    lifetimeValue: number;
    attributionEfficiency: number;
    performanceScore: number;
    peakPerformanceHour: number;
    peakPerformanceDay: string;
    seasonalTrend: 'increasing' | 'decreasing' | 'stable';
    attributionPath: string[];
    touchpointCount: number;
    attributionConfidence: number;
}
export interface AttributionInsights {
    topPerformingActions: EnhancedActionAttributionResult[];
    underperformingActions: EnhancedActionAttributionResult[];
    emergingTrends: string[];
    optimizationOpportunities: OptimizationOpportunity[];
    predictedROI: number;
    confidenceScore: number;
}
export interface OptimizationOpportunity {
    actionKey: string;
    currentROI: number;
    potentialROI: number;
    improvementPercentage: number;
    recommendedActions: string[];
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: number;
}
export interface AttributionReport {
    period: {
        start: string;
        end: string;
        timeframe: '7d' | '14d' | '28d';
    };
    summary: {
        totalRevenue: number;
        totalSessions: number;
        totalConversions: number;
        averageConversionRate: number;
        averageOrderValue: number;
        totalROI: number;
    };
    insights: AttributionInsights;
    recommendations: string[];
    generatedAt: string;
}
/**
 * Enhanced action attribution with advanced metrics
 */
export declare function getEnhancedActionAttribution(actionKey: string, periodDays: 7 | 14 | 28): Promise<EnhancedActionAttributionResult>;
/**
 * Generate comprehensive attribution insights
 */
export declare function generateAttributionInsights(attributionData: EnhancedActionAttributionResult[]): Promise<AttributionInsights>;
/**
 * Generate comprehensive attribution report
 */
export declare function generateAttributionReport(timeframe: '7d' | '14d' | '28d'): Promise<AttributionReport>;
/**
 * Enhanced nightly attribution update with insights
 */
export declare function runEnhancedNightlyAttributionUpdate(): Promise<{
    success: boolean;
    reports: {
        report7d: AttributionReport;
        report14d: AttributionReport;
        report28d: AttributionReport;
    };
    durationMs: number;
}>;
export { getActionAttribution, updateActionROI, rerankActionQueue, runNightlyAttributionUpdate } from './action-attribution';
//# sourceMappingURL=action-attribution-enhanced.d.ts.map