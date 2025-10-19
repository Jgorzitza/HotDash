/**
 * Predictive Revenue Forecasting
 *
 * Forecasts future revenue based on historical trends.
 * Uses multiple forecasting methods for confidence intervals.
 */

export interface ForecastResult {
  date: string;
  predicted: number;
  confidenceLow: number; // 95% confidence interval lower bound
  confidenceHigh: number; // 95% confidence interval upper bound
  method: "linear" | "exponential" | "seasonal";
}

/**
 * Simple linear regression forecast
 */
export function forecastLinear(
  historicalData: Array<{ date: string; revenue: number }>,
  daysAhead: number,
): ForecastResult[] {
  if (historicalData.length < 7) {
    throw new Error("Need at least 7 days of historical data");
  }

  // Calculate linear trend
  const n = historicalData.length;
  const values = historicalData.map((d) => d.revenue);
  const mean = values.reduce((sum, v) => sum + v, 0) / n;

  // Simple trend: average change per day
  const dailyChange =
    (values[values.length - 1] - values[0]) / historicalData.length;

  const lastValue = values[values.length - 1];
  const stdDev = Math.sqrt(
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n,
  );

  const forecasts: ForecastResult[] = [];

  for (let i = 1; i <= daysAhead; i++) {
    const predicted = lastValue + dailyChange * i;
    const confidence = stdDev * 1.96; // 95% CI

    const forecastDate = new Date(
      historicalData[historicalData.length - 1].date,
    );
    forecastDate.setDate(forecastDate.getDate() + i);

    forecasts.push({
      date: forecastDate.toISOString().split("T")[0],
      predicted,
      confidenceLow: Math.max(0, predicted - confidence),
      confidenceHigh: predicted + confidence,
      method: "linear",
    });
  }

  return forecasts;
}

/**
 * Exponential smoothing forecast
 */
export function forecastExponential(
  historicalData: Array<{ date: string; revenue: number }>,
  daysAhead: number,
  alpha: number = 0.3,
): ForecastResult[] {
  if (historicalData.length < 7) {
    throw new Error("Need at least 7 days of historical data");
  }

  const values = historicalData.map((d) => d.revenue);

  // Calculate smoothed values
  const smoothed: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    smoothed[i] = alpha * values[i] + (1 - alpha) * smoothed[i - 1];
  }

  const lastSmoothed = smoothed[smoothed.length - 1];
  const trend = (smoothed[smoothed.length - 1] - smoothed[0]) / smoothed.length;

  const forecasts: ForecastResult[] = [];

  for (let i = 1; i <= daysAhead; i++) {
    const predicted = lastSmoothed + trend * i;
    const confidence = Math.abs(trend) * i * 2; // Confidence grows with distance

    const forecastDate = new Date(
      historicalData[historicalData.length - 1].date,
    );
    forecastDate.setDate(forecastDate.getDate() + i);

    forecasts.push({
      date: forecastDate.toISOString().split("T")[0],
      predicted,
      confidenceLow: Math.max(0, predicted - confidence),
      confidenceHigh: predicted + confidence,
      method: "exponential",
    });
  }

  return forecasts;
}

/**
 * Get 7-day revenue forecast
 */
export function get7DayForecast(
  historicalData: Array<{ date: string; revenue: number }>,
): ForecastResult[] {
  return forecastLinear(historicalData, 7);
}

/**
 * Get 30-day revenue forecast
 */
export function get30DayForecast(
  historicalData: Array<{ date: string; revenue: number }>,
): ForecastResult[] {
  return forecastExponential(historicalData, 30);
}
