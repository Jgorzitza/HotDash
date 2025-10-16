/**
 * Forecast Spend vs Target
 * 
 * Purpose: Forecast ad spend against budget targets
 * Owner: ads agent
 * Date: 2025-10-15
 */

export interface SpendForecast {
  date: string;
  forecastedSpend: number;
  targetSpend: number;
  variance: number;
  variancePercent: number;
}

export interface ForecastResult {
  forecasts: SpendForecast[];
  totalForecastedSpend: number;
  totalTargetSpend: number;
  projectedOverUnder: number;
  projectedOverUnderPercent: number;
  recommendation: string;
}

export function forecastSpendVsTarget(
  historicalSpend: Array<{ date: string; spend: number }>,
  targetBudget: number,
  daysToForecast: number
): ForecastResult {
  // Simple linear regression for forecast
  const n = historicalSpend.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historicalSpend.map(d => d.spend);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const forecasts: SpendForecast[] = [];
  const dailyTarget = targetBudget / (n + daysToForecast);

  for (let i = 0; i < daysToForecast; i++) {
    const forecastedSpend = slope * (n + i) + intercept;
    const targetSpend = dailyTarget;
    const variance = forecastedSpend - targetSpend;
    const variancePercent = (variance / targetSpend) * 100;

    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + i + 1);

    forecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      forecastedSpend: Math.max(0, forecastedSpend),
      targetSpend,
      variance,
      variancePercent,
    });
  }

  const totalForecastedSpend = forecasts.reduce((sum, f) => sum + f.forecastedSpend, 0);
  const totalTargetSpend = dailyTarget * daysToForecast;
  const projectedOverUnder = totalForecastedSpend - totalTargetSpend;
  const projectedOverUnderPercent = (projectedOverUnder / totalTargetSpend) * 100;

  let recommendation = '';
  if (projectedOverUnderPercent > 10) {
    recommendation = `Projected to overspend by ${projectedOverUnderPercent.toFixed(1)}%. Reduce daily budget.`;
  } else if (projectedOverUnderPercent < -10) {
    recommendation = `Projected to underspend by ${Math.abs(projectedOverUnderPercent).toFixed(1)}%. Increase daily budget.`;
  } else {
    recommendation = 'On track to meet budget target.';
  }

  return {
    forecasts,
    totalForecastedSpend,
    totalTargetSpend,
    projectedOverUnder,
    projectedOverUnderPercent,
    recommendation,
  };
}

