/**
 * Growth Engine Advanced Analytics Service
 *
 * Provides sophisticated attribution modeling, performance optimization,
 * and predictive insights for growth actions across all channels.
 * Supports Growth Engine phases 9-12 with advanced analytics.
 */
export interface GrowthAction {
    actionId: string;
    actionType: 'seo' | 'ads' | 'content' | 'social' | 'email' | 'product';
    targetSlug: string;
    title: string;
    description: string;
    approvedAt: string;
    executedAt: string;
    status: 'approved' | 'executed' | 'completed' | 'failed';
    budget?: number;
    expectedROI?: number;
}
export interface AttributionMetrics {
    revenue: number;
    conversions: number;
    sessions: number;
    cost: number;
    roi: number;
    efficiency: number;
}
export interface AttributionData {
    actionId: string;
    actionType: string;
    targetSlug: string;
    attributionWindows: {
        '7d': AttributionMetrics;
        '14d': AttributionMetrics;
        '28d': AttributionMetrics;
    };
    totalAttribution: AttributionMetrics;
    efficiency: {
        costPerConversion: number;
        revenuePerDollar: number;
        efficiencyScore: number;
    };
}
export interface GrowthEngineAnalytics {
    period: {
        start: string;
        end: string;
    };
    summary: {
        totalActions: number;
        totalRevenue: number;
        totalConversions: number;
        averageROI: number;
        overallEfficiency: number;
    };
    attributionAnalysis: AttributionData[];
    performanceInsights: {
        topPerformingActions: GrowthAction[];
        optimizationOpportunities: string[];
        budgetRecommendations: {
            recommendedAllocation: Record<string, number>;
            expectedImpact: number;
        };
    };
    recommendations: {
        scalingActions: GrowthAction[];
        optimizationActions: string[];
        budgetAdjustments: {
            increase: string[];
            decrease: string[];
        };
    };
}
/**
 * Calculate advanced attribution for growth actions
 */
export declare function calculateAdvancedAttribution(actions: GrowthAction[], attributionData: AttributionData[]): Promise<AttributionData[]>;
/**
 * Generate comprehensive Growth Engine analytics
 */
export declare function generateGrowthEngineAnalytics(actions: GrowthAction[], attributionData: AttributionData[], startDate: string, endDate: string): Promise<GrowthEngineAnalytics>;
/**
 * Export analytics data for dashboard display
 */
export declare function exportGrowthEngineAnalytics(analytics: GrowthEngineAnalytics): {
    analytics: GrowthEngineAnalytics;
    timeframe: string;
    period: {
        start: string;
        end: string;
    };
    generatedAt: string;
};
/**
 * Get mock data for development/testing
 */
export declare function getMockGrowthEngineData(): {
    actions: GrowthAction[];
    attributionData: AttributionData[];
};
//# sourceMappingURL=growthEngineAdvanced.d.ts.map