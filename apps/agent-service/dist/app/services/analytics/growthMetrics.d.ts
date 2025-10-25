/**
 * Growth Dashboard Metrics Service
 *
 * ANALYTICS-009: CTR, impressions, conversions tracking for growth metrics
 *
 * Features:
 * - Track click-through rates (CTR)
 * - Monitor impressions and reach
 * - Calculate conversion rates
 * - Generate growth performance insights
 */
export interface GrowthMetricsV2 {
    period: {
        start: string;
        end: string;
    };
    traffic: {
        totalImpressions: number;
        totalClicks: number;
        totalConversions: number;
        ctr: number;
        conversionRate: number;
    };
    channels: {
        channel: string;
        impressions: number;
        clicks: number;
        conversions: number;
        ctr: number;
        conversionRate: number;
        revenue: number;
    }[];
    trends: {
        impressionsChange: number;
        clicksChange: number;
        conversionsChange: number;
        ctrChange: number;
        conversionRateChange: number;
    };
    topPerformers: {
        channel: string;
        ctr: number;
        conversionRate: number;
        revenue: number;
    }[];
}
export interface GrowthInsights {
    overallPerformance: 'excellent' | 'good' | 'average' | 'poor';
    keyInsights: string[];
    recommendations: string[];
    opportunities: {
        channel: string;
        potential: number;
        reason: string;
    }[];
}
/**
 * Calculate growth metrics from raw data
 *
 * ANALYTICS-009: Core function for growth metrics calculation
 *
 * @param channelData - Array of channel performance data
 * @param startDate - Analysis start date
 * @param endDate - Analysis end date
 * @param previousMetrics - Previous period metrics for comparison
 * @returns Complete growth metrics
 */
export declare function calculateGrowthMetrics(channelData: Array<{
    channel: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
}>, startDate: string, endDate: string, previousMetrics?: GrowthMetricsV2): GrowthMetricsV2;
/**
 * Generate growth insights and recommendations
 *
 * ANALYTICS-009: Analyze growth metrics and provide actionable insights
 *
 * @param metrics - Growth metrics
 * @returns Growth insights and recommendations
 */
export declare function generateGrowthInsights(metrics: GrowthMetricsV2): GrowthInsights;
/**
 * Export growth metrics for dashboard
 *
 * ANALYTICS-009: Format growth data for dashboard display
 *
 * @param metrics - Growth metrics
 * @param insights - Growth insights
 * @returns Dashboard-ready growth data
 */
export declare function exportGrowthMetrics(metrics: GrowthMetricsV2, insights: GrowthInsights): {
    summary: {
        impressions: number;
        clicks: number;
        conversions: number;
        ctr: number;
        conversionRate: number;
        performance: "excellent" | "good" | "poor" | "average";
    };
    trends: {
        impressionsChange: number;
        clicksChange: number;
        conversionsChange: number;
        ctrChange: number;
        conversionRateChange: number;
    };
    channels: {
        name: string;
        impressions: number;
        clicks: number;
        conversions: number;
        ctr: number;
        conversionRate: number;
        revenue: number;
    }[];
    topPerformers: {
        channel: string;
        ctr: number;
        conversionRate: number;
        revenue: number;
    }[];
    insights: string[];
    recommendations: string[];
    opportunities: {
        channel: string;
        potential: number;
        reason: string;
    }[];
    period: {
        start: string;
        end: string;
    };
};
/**
 * Calculate growth efficiency score
 *
 * ANALYTICS-009: Overall growth performance score
 *
 * @param metrics - Growth metrics
 * @returns Efficiency score (0-100)
 */
export declare function calculateGrowthEfficiencyScore(metrics: GrowthMetricsV2): number;
//# sourceMappingURL=growthMetrics.d.ts.map