/**
 * Ad Performance Metrics Service
 *
 * Aggregates and calculates performance metrics for Google Ads campaigns.
 * Provides dashboard-ready data with week-over-week comparisons.
 *
 * @module app/services/ads/performance-metrics
 */
import type { CampaignPerformance, CampaignSummary, PerformanceSummary, BudgetAlert } from "./types";
/**
 * Aggregate campaign performance data into dashboard summary
 *
 * @param performances - Array of campaign performance data
 * @returns PerformanceSummary with aggregated metrics
 */
export declare function aggregatePerformanceData(performances: CampaignPerformance[], alerts?: BudgetAlert[], dateRange?: string): PerformanceSummary;
/**
 * Calculate week-over-week comparison
 *
 * @param currentWeek - Performance data for current week
 * @param previousWeek - Performance data for previous week
 * @returns Comparison object with percentage changes
 */
export declare function calculateWoWComparison(currentWeek: CampaignPerformance[], previousWeek: CampaignPerformance[]): {
    spendChange: number;
    conversionsChange: number;
    roasChange: number;
    ctrChange: number;
};
/**
 * Identify best and worst performing campaigns
 *
 * @param campaigns - Array of campaign summaries
 * @param metric - Metric to sort by ("roas", "conversions", "ctr")
 * @param limit - Number of campaigns to return (default: 5)
 * @returns Object with best and worst performing campaigns
 */
export declare function identifyBestAndWorst(campaigns: CampaignSummary[], metric?: "roas" | "conversions" | "ctr", limit?: number): {
    best: CampaignSummary[];
    worst: CampaignSummary[];
};
/**
 * Calculate performance trends (7-day moving averages)
 *
 * @param dailyPerformances - Array of daily performance data
 * @returns Trend analysis with moving averages
 */
export declare function calculatePerformanceTrends(dailyPerformances: Array<{
    date: string;
    performances: CampaignPerformance[];
}>): {
    dates: string[];
    spendTrend: number[];
    conversionsTrend: number[];
    roasTrend: (number | null)[];
};
//# sourceMappingURL=performance-metrics.d.ts.map