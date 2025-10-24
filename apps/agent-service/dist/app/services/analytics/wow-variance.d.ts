/**
 * Week-over-Week Variance Service
 *
 * Calculates variance between this week's sales vs last week's sales
 * for the Sales Pulse Modal. Provides trend analysis for revenue, orders,
 * and conversion rate metrics.
 *
 * @module app/services/analytics/wow-variance
 * @see docs/directions/analytics.md ANALYTICS-005
 */
/**
 * Metric types supported for WoW variance
 */
export type MetricType = "revenue" | "orders" | "conversion";
/**
 * Trend direction based on variance threshold
 */
export type TrendDirection = "up" | "down" | "flat";
/**
 * WoW variance calculation result
 */
export interface WoWVariance {
    current: number;
    previous: number;
    variance: number;
    trend: TrendDirection;
}
/**
 * Calculate Week-over-Week variance for a given metric
 *
 * Strategy:
 * 1. Current week: Last 7 days (0-6 days ago)
 * 2. Previous week: 8-14 days ago
 * 3. Variance: ((current - previous) / previous) * 100
 * 4. Trend determination:
 *    - variance > 5% = 'up'
 *    - variance < -5% = 'down'
 *    - else = 'flat'
 *
 * @param project - Shop domain or project identifier
 * @param metric - Metric to calculate variance for
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon key
 * @returns WoW variance data
 */
export declare function getWoWVariance(project: string, metric: MetricType, supabaseUrl: string, supabaseKey: string): Promise<WoWVariance>;
//# sourceMappingURL=wow-variance.d.ts.map