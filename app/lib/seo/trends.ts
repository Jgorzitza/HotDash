/**
 * SEO Historical Trend Analysis
 * Analyze click trends, impression trends, position trends over 90 days
 */

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface TrendAnalysis {
  metric: "clicks" | "impressions" | "position";
  period: number; // days
  data: TrendDataPoint[];
  trend: "up" | "down" | "stable";
  changePercent: number;
  forecast?: number;
}

/**
 * Calculate trend direction from data points
 */
function calculateTrendDirection(
  data: TrendDataPoint[],
): "up" | "down" | "stable" {
  if (data.length < 2) return "stable";

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const changePercent = ((last - first) / first) * 100;

  if (changePercent > 5) return "up";
  if (changePercent < -5) return "down";
  return "stable";
}

/**
 * Analyze trends for a specific metric
 */
export function analyzeTrend(
  data: TrendDataPoint[],
  metric: "clicks" | "impressions" | "position",
): TrendAnalysis {
  const trend = calculateTrendDirection(data);
  const first = data[0]?.value || 0;
  const last = data[data.length - 1]?.value || 0;
  const changePercent = first > 0 ? ((last - first) / first) * 100 : 0;

  return {
    metric,
    period: data.length,
    data,
    trend,
    changePercent,
  };
}

/**
 * Get 90-day trend analysis
 */
export function get90DayTrends(
  dailyMetrics: Array<{
    date: string;
    clicks: number;
    impressions: number;
    position: number;
  }>,
): {
  clicks: TrendAnalysis;
  impressions: TrendAnalysis;
  position: TrendAnalysis;
} {
  return {
    clicks: analyzeTrend(
      dailyMetrics.map((m) => ({ date: m.date, value: m.clicks })),
      "clicks",
    ),
    impressions: analyzeTrend(
      dailyMetrics.map((m) => ({ date: m.date, value: m.impressions })),
      "impressions",
    ),
    position: analyzeTrend(
      dailyMetrics.map((m) => ({ date: m.date, value: m.position })),
      "position",
    ),
  };
}
