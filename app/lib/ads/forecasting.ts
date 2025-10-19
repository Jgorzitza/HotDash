/**
 * Campaign Forecasting
 *
 * Predict campaign performance based on historical data
 *
 * @module app/lib/ads/forecasting
 */

import type { CampaignDailySnapshot, CampaignMetrics } from "./types";

export interface Forecast {
  date: string;
  predictedSpend: number;
  predictedRevenue: number;
  predictedROAS: number;
  confidence: number;
}

/**
 * Forecast campaign performance
 *
 * @param historical - Historical daily snapshots
 * @param daysAhead - Number of days to forecast
 * @returns Array of forecasts
 */
export function forecastCampaignPerformance(
  historical: CampaignDailySnapshot[],
  daysAhead: number = 7,
): Forecast[] {
  if (historical.length < 7) {
    // Need at least 7 days for reliable forecast
    return [];
  }

  // Calculate moving averages
  const recentDays = historical.slice(-7);
  const avgSpend = recentDays.reduce((sum, s) => sum + s.metrics.spend, 0) / 7;
  const avgRevenue =
    recentDays.reduce((sum, s) => sum + s.metrics.revenue, 0) / 7;
  const avgROAS = recentDays.reduce((sum, s) => sum + s.metrics.roas, 0) / 7;

  // Calculate trend (simple linear)
  const trend = calculateTrend(recentDays);

  const forecasts: Forecast[] = [];
  const lastDate = new Date(recentDays[recentDays.length - 1].date);

  for (let i = 1; i <= daysAhead; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);

    const predictedSpend = avgSpend * (1 + trend.spendTrend * i);
    const predictedRevenue = avgRevenue * (1 + trend.revenueTrend * i);
    const predictedROAS = predictedRevenue / predictedSpend;

    // Confidence decreases with distance
    const confidence = Math.max(0.5, 1 - i * 0.05);

    forecasts.push({
      date: forecastDate.toISOString().split("T")[0],
      predictedSpend: Math.round(predictedSpend * 100) / 100,
      predictedRevenue: Math.round(predictedRevenue * 100) / 100,
      predictedROAS: Math.round(predictedROAS * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
    });
  }

  return forecasts;
}

/**
 * Calculate trend from recent data
 */
function calculateTrend(snapshots: CampaignDailySnapshot[]): {
  spendTrend: number;
  revenueTrend: number;
} {
  if (snapshots.length < 2) {
    return { spendTrend: 0, revenueTrend: 0 };
  }

  const first = snapshots[0].metrics;
  const last = snapshots[snapshots.length - 1].metrics;

  const spendTrend =
    first.spend > 0
      ? (last.spend - first.spend) / first.spend / snapshots.length
      : 0;
  const revenueTrend =
    first.revenue > 0
      ? (last.revenue - first.revenue) / first.revenue / snapshots.length
      : 0;

  return { spendTrend, revenueTrend };
}
