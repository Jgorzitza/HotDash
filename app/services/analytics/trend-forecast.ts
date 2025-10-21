/**
 * Trend Forecasting Service
 * 
 * Forecasts future metrics using linear regression
 * Predicts next 7/14/30 days
 * Calculates confidence intervals
 * Determines trend direction (up/down/stable)
 */

import prisma from "~/db.server";

export interface ForecastPoint {
  date: Date;
  predictedValue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface TrendForecast {
  metric: string;
  currentValue: number;
  trend: "up" | "down" | "stable";
  trendStrength: number; // Slope of regression line
  predictions: ForecastPoint[];
  confidence: number; // R-squared value (0-1)
  recommendation: string;
}

export type ForecastMetric = "impressions" | "clicks" | "conversions" | "revenue" | "roas";

/**
 * Forecast future metrics using linear regression
 */
export async function forecastMetric(
  metric: ForecastMetric,
  shopDomain: string = "occ",
  forecastDays: 7 | 14 | 30 = 7,
  historicalDays: number = 90
): Promise<TrendForecast> {
  // Get historical data
  const historicalData = await getHistoricalData(
    metric,
    shopDomain,
    historicalDays
  );

  if (historicalData.length < 2) {
    // Not enough data for forecast
    return {
      metric,
      currentValue: 0,
      trend: "stable",
      trendStrength: 0,
      predictions: [],
      confidence: 0,
      recommendation: "Insufficient data for forecasting. Need at least 2 data points.",
    };
  }

  // Perform linear regression
  const regression = calculateLinearRegression(historicalData);

  // Generate predictions for next N days
  const predictions: ForecastPoint[] = [];
  const today = new Date();
  const lastDataPoint = historicalData[historicalData.length - 1];

  for (let i = 1; i <= forecastDays; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + i);

    const daysFromStart = lastDataPoint.dayIndex + i;
    const predictedValue = regression.slope * daysFromStart + regression.intercept;

    // Calculate confidence interval (±2 standard deviations)
    const margin = regression.stdError * 2;

    predictions.push({
      date: futureDate,
      predictedValue: Math.max(0, Number(predictedValue.toFixed(2))),
      confidenceInterval: {
        lower: Math.max(0, Number((predictedValue - margin).toFixed(2))),
        upper: Math.max(0, Number((predictedValue + margin).toFixed(2))),
      },
    });
  }

  // Determine trend direction
  const trend = determineTrend(regression.slope);
  const currentValue = historicalData[historicalData.length - 1]?.value || 0;

  return {
    metric,
    currentValue,
    trend,
    trendStrength: Number(regression.slope.toFixed(4)),
    predictions,
    confidence: Number(regression.rSquared.toFixed(4)),
    recommendation: generateForecastRecommendation(trend, regression.rSquared, currentValue),
  };
}

/**
 * Get historical data for a metric
 */
async function getHistoricalData(
  metric: ForecastMetric,
  shopDomain: string,
  days: number
): Promise<Array<{ date: Date; value: number; dayIndex: number }>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const facts = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: {
        in: ["social_performance", "ads_roas", "growth_metrics"],
      },
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Aggregate by date
  const dailyValues = new Map<string, number>();

  for (const fact of facts) {
    const value = fact.value as any;
    const dateKey = fact.createdAt.toISOString().split("T")[0];

    const metricValue = extractMetricValue(value, metric);
    const current = dailyValues.get(dateKey) || 0;
    dailyValues.set(dateKey, current + metricValue);
  }

  // Convert to array with day index
  const startDate = since;
  const data = Array.from(dailyValues.entries()).map(([dateStr, value]) => {
    const date = new Date(dateStr);
    const dayIndex = Math.floor(
      (date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    return { date, value, dayIndex };
  });

  return data.sort((a, b) => a.dayIndex - b.dayIndex);
}

/**
 * Extract specific metric value from DashboardFact
 */
function extractMetricValue(value: any, metric: ForecastMetric): number {
  switch (metric) {
    case "impressions":
      return value.impressions || 0;
    case "clicks":
      return value.clicks || 0;
    case "conversions":
      return value.conversions || 0;
    case "revenue":
      return value.revenue || 0;
    case "roas":
      return value.roas || 0;
    default:
      return 0;
  }
}

/**
 * Calculate linear regression (least squares method)
 */
function calculateLinearRegression(
  data: Array<{ dayIndex: number; value: number }>
): {
  slope: number;
  intercept: number;
  rSquared: number;
  stdError: number;
} {
  const n = data.length;

  // Calculate means
  const meanX = data.reduce((sum, p) => sum + p.dayIndex, 0) / n;
  const meanY = data.reduce((sum, p) => sum + p.value, 0) / n;

  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;

  for (const point of data) {
    numerator += (point.dayIndex - meanX) * (point.value - meanY);
    denominator += (point.dayIndex - meanX) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;

  // Calculate R-squared
  const predictions = data.map((p) => slope * p.dayIndex + intercept);
  const ssRes = data.reduce(
    (sum, p, i) => sum + (p.value - predictions[i]) ** 2,
    0
  );
  const ssTot = data.reduce((sum, p) => sum + (p.value - meanY) ** 2, 0);
  const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

  // Calculate standard error
  const residuals = data.map((p, i) => p.value - predictions[i]);
  const sumSquaredResiduals = residuals.reduce((sum, r) => sum + r ** 2, 0);
  const stdError = Math.sqrt(sumSquaredResiduals / (n - 2));

  return {
    slope,
    intercept,
    rSquared,
    stdError,
  };
}

/**
 * Determine trend direction from slope
 */
function determineTrend(slope: number): "up" | "down" | "stable" {
  const threshold = 0.01; // Minimum slope for trend
  if (slope > threshold) return "up";
  if (slope < -threshold) return "down";
  return "stable";
}

/**
 * Generate recommendation based on forecast
 */
function generateForecastRecommendation(
  trend: "up" | "down" | "stable",
  rSquared: number,
  currentValue: number
): string {
  if (rSquared < 0.5) {
    return "Low confidence forecast. Data is too volatile for reliable predictions. Consider gathering more data.";
  }

  if (trend === "up") {
    return `Strong upward trend detected (R²=${rSquared.toFixed(
      2
    )}). Continue current strategies and monitor for sustained growth.`;
  }

  if (trend === "down") {
    return `Downward trend detected (R²=${rSquared.toFixed(
      2
    )}). Review strategies and implement improvements to reverse the decline.`;
  }

  return `Stable trend (R²=${rSquared.toFixed(
    2
  )}). Metrics are consistent. Consider optimization for growth.`;
}

/**
 * Forecast multiple metrics at once
 */
export async function forecastAllMetrics(
  shopDomain: string = "occ",
  forecastDays: 7 | 14 | 30 = 7
): Promise<Record<ForecastMetric, TrendForecast>> {
  const metrics: ForecastMetric[] = [
    "impressions",
    "clicks",
    "conversions",
    "revenue",
    "roas",
  ];

  const forecasts = await Promise.all(
    metrics.map((metric) => forecastMetric(metric, shopDomain, forecastDays))
  );

  return {
    impressions: forecasts[0],
    clicks: forecasts[1],
    conversions: forecasts[2],
    revenue: forecasts[3],
    roas: forecasts[4],
  };
}

