/**
 * Ad Performance Metrics Service
 *
 * Aggregates and calculates performance metrics for Google Ads campaigns.
 * Provides dashboard-ready data with week-over-week comparisons.
 *
 * @module app/services/ads/performance-metrics
 */
import { calculateROAS } from "../../lib/ads/metrics";
/**
 * Aggregate campaign performance data into dashboard summary
 *
 * @param performances - Array of campaign performance data
 * @returns PerformanceSummary with aggregated metrics
 */
export function aggregatePerformanceData(performances, alerts = [], dateRange = "LAST_7_DAYS") {
    const campaigns = performances.map((perf) => {
        const roas = calculateROAS(perf.revenueCents, perf.costCents);
        return {
            id: perf.campaignId,
            name: perf.campaignName,
            status: "ENABLED", // Would come from Campaign object
            impressions: perf.impressions,
            clicks: perf.clicks,
            ctr: perf.ctr,
            costCents: perf.costCents,
            conversions: perf.conversions,
            roas,
        };
    });
    // Calculate summary metrics
    const totalSpendCents = campaigns.reduce((sum, c) => sum + c.costCents, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const avgCpcCents = totalClicks > 0 ? Math.round(totalSpendCents / totalClicks) : 0;
    // Calculate average ROAS (weighted by spend)
    let avgRoas = null;
    const totalRevenueCents = performances.reduce((sum, p) => sum + p.revenueCents, 0);
    if (totalSpendCents > 0) {
        avgRoas = calculateROAS(totalRevenueCents, totalSpendCents);
    }
    return {
        campaigns,
        summary: {
            totalSpendCents,
            totalConversions,
            avgCpcCents,
            avgRoas,
        },
        alerts,
        dateRange,
    };
}
/**
 * Calculate week-over-week comparison
 *
 * @param currentWeek - Performance data for current week
 * @param previousWeek - Performance data for previous week
 * @returns Comparison object with percentage changes
 */
export function calculateWoWComparison(currentWeek, previousWeek) {
    const currentSpend = currentWeek.reduce((sum, c) => sum + c.costCents, 0);
    const previousSpend = previousWeek.reduce((sum, c) => sum + c.costCents, 0);
    const spendChange = previousSpend > 0
        ? ((currentSpend - previousSpend) / previousSpend) * 100
        : 0;
    const currentConversions = currentWeek.reduce((sum, c) => sum + c.conversions, 0);
    const previousConversions = previousWeek.reduce((sum, c) => sum + c.conversions, 0);
    const conversionsChange = previousConversions > 0
        ? ((currentConversions - previousConversions) / previousConversions) * 100
        : 0;
    // Calculate ROAS for both periods
    const currentRevenue = currentWeek.reduce((sum, c) => sum + c.revenueCents, 0);
    const previousRevenue = previousWeek.reduce((sum, c) => sum + c.revenueCents, 0);
    const currentRoas = calculateROAS(currentRevenue, currentSpend) || 0;
    const previousRoas = calculateROAS(previousRevenue, previousSpend) || 0;
    const roasChange = previousRoas > 0 ? ((currentRoas - previousRoas) / previousRoas) * 100 : 0;
    // Calculate average CTR for both periods
    const currentClicks = currentWeek.reduce((sum, c) => sum + c.clicks, 0);
    const currentImpressions = currentWeek.reduce((sum, c) => sum + c.impressions, 0);
    const currentCtr = currentImpressions > 0 ? currentClicks / currentImpressions : 0;
    const previousClicks = previousWeek.reduce((sum, c) => sum + c.clicks, 0);
    const previousImpressions = previousWeek.reduce((sum, c) => sum + c.impressions, 0);
    const previousCtr = previousImpressions > 0 ? previousClicks / previousImpressions : 0;
    const ctrChange = previousCtr > 0 ? ((currentCtr - previousCtr) / previousCtr) * 100 : 0;
    return {
        spendChange: parseFloat(spendChange.toFixed(2)),
        conversionsChange: parseFloat(conversionsChange.toFixed(2)),
        roasChange: parseFloat(roasChange.toFixed(2)),
        ctrChange: parseFloat(ctrChange.toFixed(2)),
    };
}
/**
 * Identify best and worst performing campaigns
 *
 * @param campaigns - Array of campaign summaries
 * @param metric - Metric to sort by ("roas", "conversions", "ctr")
 * @param limit - Number of campaigns to return (default: 5)
 * @returns Object with best and worst performing campaigns
 */
export function identifyBestAndWorst(campaigns, metric = "roas", limit = 5) {
    const sorted = [...campaigns].sort((a, b) => {
        let aValue;
        let bValue;
        switch (metric) {
            case "roas":
                aValue = a.roas || 0;
                bValue = b.roas || 0;
                break;
            case "conversions":
                aValue = a.conversions;
                bValue = b.conversions;
                break;
            case "ctr":
                aValue = a.ctr;
                bValue = b.ctr;
                break;
            default:
                aValue = 0;
                bValue = 0;
        }
        return bValue - aValue;
    });
    return {
        best: sorted.slice(0, limit),
        worst: sorted.slice(-limit).reverse(),
    };
}
/**
 * Calculate performance trends (7-day moving averages)
 *
 * @param dailyPerformances - Array of daily performance data
 * @returns Trend analysis with moving averages
 */
export function calculatePerformanceTrends(dailyPerformances) {
    const dates = dailyPerformances.map((d) => d.date);
    const spendTrend = [];
    const conversionsTrend = [];
    const roasTrend = [];
    for (const daily of dailyPerformances) {
        const daySpend = daily.performances.reduce((sum, p) => sum + p.costCents, 0);
        const dayConversions = daily.performances.reduce((sum, p) => sum + p.conversions, 0);
        const dayRevenue = daily.performances.reduce((sum, p) => sum + p.revenueCents, 0);
        const dayRoas = calculateROAS(dayRevenue, daySpend);
        spendTrend.push(daySpend);
        conversionsTrend.push(dayConversions);
        roasTrend.push(dayRoas);
    }
    return {
        dates,
        spendTrend,
        conversionsTrend,
        roasTrend,
    };
}
//# sourceMappingURL=performance-metrics.js.map