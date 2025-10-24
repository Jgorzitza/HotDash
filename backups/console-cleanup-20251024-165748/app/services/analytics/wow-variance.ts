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

import { createClient } from "@supabase/supabase-js";

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
  variance: number; // Percentage change
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
export async function getWoWVariance(
  project: string,
  metric: MetricType,
  supabaseUrl: string,
  supabaseKey: string,
): Promise<WoWVariance> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Calculate date ranges
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - 6);
    currentWeekStart.setHours(0, 0, 0, 0);

    const currentWeekEnd = new Date(now);
    currentWeekEnd.setHours(23, 59, 59, 999);

    const previousWeekStart = new Date(now);
    previousWeekStart.setDate(now.getDate() - 13);
    previousWeekStart.setHours(0, 0, 0, 0);

    const previousWeekEnd = new Date(now);
    previousWeekEnd.setDate(now.getDate() - 7);
    previousWeekEnd.setHours(23, 59, 59, 999);

    // Query DashboardFact table for current week data
    const { data: currentData, error: currentError } = await supabase
      .from("dashboard_fact")
      .select("value")
      .eq("shop_domain", project)
      .eq("fact_type", getFactTypeForMetric(metric))
      .gte("created_at", currentWeekStart.toISOString())
      .lte("created_at", currentWeekEnd.toISOString());

    if (currentError) throw currentError;

    // Query DashboardFact table for previous week data
    const { data: previousData, error: previousError } = await supabase
      .from("dashboard_fact")
      .select("value")
      .eq("shop_domain", project)
      .eq("fact_type", getFactTypeForMetric(metric))
      .gte("created_at", previousWeekStart.toISOString())
      .lte("created_at", previousWeekEnd.toISOString());

    if (previousError) throw previousError;

    // Aggregate values
    const current = aggregateMetricValue(currentData || [], metric);
    const previous = aggregateMetricValue(previousData || [], metric);

    // Calculate variance
    const variance =
      previous === 0
        ? current === 0
          ? 0
          : 100 // If previous was 0 and current is non-zero, that's 100% increase
        : ((current - previous) / previous) * 100;

    // Determine trend
    const trend: TrendDirection =
      variance > 5 ? "up" : variance < -5 ? "down" : "flat";

    return {
      current,
      previous,
      variance: Number(variance.toFixed(2)),
      trend,
    };
  } catch (error) {
    console.error("[WoW Variance] Error calculating variance:", error);

    // Return safe fallback values if data is unavailable
    return {
      current: 0,
      previous: 0,
      variance: 0,
      trend: "flat",
    };
  }
}

/**
 * Map metric type to DashboardFact fact_type
 */
function getFactTypeForMetric(metric: MetricType): string {
  switch (metric) {
    case "revenue":
      return "sales_revenue";
    case "orders":
      return "sales_orders";
    case "conversion":
      return "sales_conversion";
    default:
      throw new Error(`Unknown metric type: ${metric}`);
  }
}

/**
 * Aggregate metric values from DashboardFact records
 *
 * Revenue & Orders: Sum of all values
 * Conversion: Average of all values
 */
function aggregateMetricValue(
  data: Array<{ value: any }>,
  metric: MetricType,
): number {
  if (data.length === 0) return 0;

  if (metric === "conversion") {
    // Conversion rate: average
    const sum = data.reduce((acc, record) => {
      const value = extractNumericValue(record.value);
      return acc + value;
    }, 0);
    return sum / data.length;
  } else {
    // Revenue & Orders: sum
    return data.reduce((acc, record) => {
      const value = extractNumericValue(record.value);
      return acc + value;
    }, 0);
  }
}

/**
 * Extract numeric value from DashboardFact value JSON
 * Handles different value formats: number, {amount: number}, {value: number}
 */
function extractNumericValue(value: any): number {
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null) {
    if ("amount" in value && typeof value.amount === "number")
      return value.amount;
    if ("value" in value && typeof value.value === "number") return value.value;
  }
  return 0;
}
