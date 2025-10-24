/**
 * Growth Dashboard Metrics Service
 *
 * Aggregates metrics across social, SEO, and ads channels
 * Provides weekly growth reports and trend analysis
 * Consolidates CTR, impressions, conversions data
 * Stores in DashboardFact table with factType="growth_metrics"
 */
export interface GrowthMetrics {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgCTR: number;
    avgConversionRate: number;
    totalRevenue: number;
    totalSpend: number;
    overallROAS: number;
}
export interface WeeklyGrowthReport {
    week: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    spend: number;
    ctr: number;
    conversionRate: number;
    roas: number;
    weekOverWeekGrowth: {
        impressions: number;
        clicks: number;
        conversions: number;
        revenue: number;
    };
}
export interface TrendAnalysis {
    channel: "social" | "seo" | "ads" | "overall";
    trend: "up" | "down" | "stable";
    changePercent: number;
    currentValue: number;
    previousValue: number;
    metric: string;
}
export interface DashboardMetrics {
    current: GrowthMetrics;
    previous: GrowthMetrics;
    weeklyReports: WeeklyGrowthReport[];
    trends: TrendAnalysis[];
    topPerformers: Array<{
        channel: string;
        metric: string;
        value: number;
        change: number;
    }>;
}
/**
 * Get consolidated growth metrics across all channels
 */
export declare function getGrowthMetrics(shopDomain?: string, days?: number): Promise<GrowthMetrics>;
/**
 * Generate weekly growth report
 */
export declare function getWeeklyGrowthReport(shopDomain?: string, weeks?: number): Promise<WeeklyGrowthReport[]>;
/**
 * Analyze trends across channels
 */
export declare function getTrendAnalysis(shopDomain?: string, days?: number): Promise<TrendAnalysis[]>;
/**
 * Get complete dashboard metrics
 */
export declare function getDashboardMetrics(shopDomain?: string): Promise<DashboardMetrics>;
//# sourceMappingURL=growth-metrics.d.ts.map