/**
 * Demand Forecasting Service (INVENTORY-002)
 *
 * Provides 30-day demand forecasts using simple statistical methods
 * (moving averages, exponential smoothing, trend analysis).
 *
 * Context7 Source: /simple-statistics/simple-statistics (forecasting methods)
 * Context7 Source: /microsoft/typescript (type definitions)
 *
 * No complex ML needed - uses proven statistical forecasting techniques.
 */

export type TrendDirection = "growing" | "stable" | "declining";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface HistoricalSalesData {
  date: Date;
  quantity: number;
}

export interface DemandForecast {
  sku: string;
  forecast_30d: number; // Predicted total demand for next 30 days
  daily_forecast: number; // Average daily forecast
  confidence: ConfidenceLevel;
  trend: TrendDirection;
  recommended_reorder_qty: number;
  analysis: {
    historical_avg: number;
    recent_avg_7d: number;
    recent_avg_30d: number;
    trend_coefficient: number; // Positive = growing, negative = declining
    variability_coefficient: number; // Higher = more volatile = lower confidence
  };
}

/**
 * Calculate simple moving average
 *
 * @param values - Array of numeric values
 * @param window - Window size (e.g., 7 for 7-day average)
 * @returns Moving average
 */
function calculateMovingAverage(values: number[], window: number): number {
  if (values.length === 0) return 0;
  if (values.length < window) window = values.length;

  const recent = values.slice(-window);
  const sum = recent.reduce((acc, val) => acc + val, 0);
  return sum / recent.length;
}

/**
 * Calculate exponential moving average (gives more weight to recent data)
 *
 * @param values - Array of numeric values
 * @param alpha - Smoothing factor (0-1, higher = more weight to recent)
 * @returns Exponential moving average
 */
function calculateExponentialMovingAverage(
  values: number[],
  alpha: number = 0.3,
): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  let ema = values[0]; // Start with first value

  for (let i = 1; i < values.length; i++) {
    ema = alpha * values[i] + (1 - alpha) * ema;
  }

  return ema;
}

/**
 * Calculate trend coefficient using linear regression
 *
 * Positive coefficient = growing trend
 * Negative coefficient = declining trend
 * Near zero = stable trend
 *
 * @param values - Array of numeric values (time series)
 * @returns Trend coefficient
 */
function calculateTrendCoefficient(values: number[]): number {
  if (values.length < 2) return 0;

  const n = values.length;
  const xValues = Array.from({ length: n }, (_, i) => i); // 0, 1, 2, ...
  const yValues = values;

  // Calculate means
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;

  // Calculate slope (trend coefficient)
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += (xValues[i] - xMean) ** 2;
  }

  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * Calculate coefficient of variation (measures variability)
 *
 * Higher values indicate more volatile demand = lower confidence
 *
 * @param values - Array of numeric values
 * @returns Coefficient of variation (0-1+)
 */
function calculateVariabilityCoefficient(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

  if (mean === 0) return 0;

  // Calculate standard deviation
  const squaredDiffs = values.map((val) => (val - mean) ** 2);
  const variance =
    squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation = std dev / mean
  return stdDev / mean;
}

/**
 * Determine trend direction from trend coefficient
 *
 * @param coefficient - Trend coefficient
 * @param avgValue - Average value (for scaling threshold)
 * @returns Trend direction
 */
function determineTrend(coefficient: number, avgValue: number): TrendDirection {
  // Threshold: 5% change per period is considered a trend
  const threshold = avgValue * 0.05;

  if (coefficient > threshold) {
    return "growing";
  } else if (coefficient < -threshold) {
    return "declining";
  } else {
    return "stable";
  }
}

/**
 * Determine confidence level from variability coefficient
 *
 * @param variability - Coefficient of variation
 * @returns Confidence level
 */
function determineConfidence(variability: number): ConfidenceLevel {
  // Low variability = high confidence
  // High variability = low confidence

  if (variability < 0.15) {
    return "high"; // Very consistent demand
  } else if (variability < 0.3) {
    return "medium"; // Moderate consistency
  } else {
    return "low"; // Highly variable demand
  }
}

/**
 * Generate demand forecast for next 30 days
 *
 * Uses combination of:
 * - Moving averages (7-day and 30-day)
 * - Exponential smoothing (for recent trends)
 * - Trend analysis (linear regression)
 *
 * @param sku - Product SKU identifier
 * @param historicalData - Historical sales data (ideally 60-90 days)
 * @returns 30-day demand forecast with confidence and trend analysis
 */
export function generateDemandForecast(
  sku: string,
  historicalData: HistoricalSalesData[],
): DemandForecast {
  // Validate input
  if (historicalData.length === 0) {
    throw new Error("Historical data is required for forecasting");
  }

  // Sort by date (oldest to newest)
  const sortedData = [...historicalData].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  const quantities = sortedData.map((d) => d.quantity);

  // Calculate various averages
  const historicalAvg =
    quantities.reduce((sum, qty) => sum + qty, 0) / quantities.length;
  const recent7dAvg = calculateMovingAverage(quantities, 7);
  const recent30dAvg = calculateMovingAverage(quantities, 30);
  const ema = calculateExponentialMovingAverage(quantities, 0.3);

  // Calculate trend
  const trendCoefficient = calculateTrendCoefficient(quantities);
  const trend = determineTrend(trendCoefficient, historicalAvg);

  // Calculate variability (for confidence)
  const variability = calculateVariabilityCoefficient(quantities);
  const confidence = determineConfidence(variability);

  // Forecast daily demand (weighted average of recent trends)
  // Give more weight to recent data and exponential moving average
  let dailyForecast =
    0.4 * ema + // 40% weight to exponential moving average
    0.3 * recent7dAvg + // 30% weight to recent 7-day average
    0.2 * recent30dAvg + // 20% weight to recent 30-day average
    0.1 * historicalAvg; // 10% weight to overall historical average

  // Adjust for trend (project trend forward)
  // For 30-day forecast, apply trend coefficient scaled by forecast period
  const trendAdjustment = trendCoefficient * 15; // Mid-point of 30-day period
  dailyForecast = Math.max(0, dailyForecast + trendAdjustment);

  // Calculate 30-day forecast
  const forecast30d = Math.round(dailyForecast * 30);

  // Recommended reorder quantity (with buffer based on confidence)
  // Low confidence = higher buffer (20%)
  // Medium confidence = moderate buffer (10%)
  // High confidence = low buffer (5%)
  const bufferMultiplier =
    confidence === "low" ? 1.2 : confidence === "medium" ? 1.1 : 1.05;
  const recommendedReorderQty = Math.ceil(forecast30d * bufferMultiplier);

  return {
    sku,
    forecast_30d: forecast30d,
    daily_forecast: Math.round(dailyForecast * 100) / 100, // Round to 2 decimals
    confidence,
    trend,
    recommended_reorder_qty: recommendedReorderQty,
    analysis: {
      historical_avg: Math.round(historicalAvg * 100) / 100,
      recent_avg_7d: Math.round(recent7dAvg * 100) / 100,
      recent_avg_30d: Math.round(recent30dAvg * 100) / 100,
      trend_coefficient: Math.round(trendCoefficient * 1000) / 1000,
      variability_coefficient: Math.round(variability * 1000) / 1000,
    },
  };
}

/**
 * Detect anomalies in recent sales data
 *
 * An anomaly is a sudden spike or drop that deviates significantly
 * from the expected range based on historical patterns.
 *
 * @param historicalData - Historical sales data
 * @param threshold - Number of standard deviations to consider anomalous (default: 2)
 * @returns Array of anomalous data points
 */
export function detectAnomalies(
  historicalData: HistoricalSalesData[],
  threshold: number = 2,
): HistoricalSalesData[] {
  if (historicalData.length < 3) {
    return []; // Need enough data for meaningful anomaly detection
  }

  const quantities = historicalData.map((d) => d.quantity);

  // Calculate mean and standard deviation
  const mean =
    quantities.reduce((sum, qty) => sum + qty, 0) / quantities.length;
  const squaredDiffs = quantities.map((qty) => (qty - mean) ** 2);
  const variance =
    squaredDiffs.reduce((sum, val) => sum + val, 0) / quantities.length;
  const stdDev = Math.sqrt(variance);

  // Identify anomalies (values beyond threshold standard deviations)
  const anomalies: HistoricalSalesData[] = [];

  for (const dataPoint of historicalData) {
    const zScore = Math.abs((dataPoint.quantity - mean) / stdDev);

    if (zScore > threshold) {
      anomalies.push(dataPoint);
    }
  }

  return anomalies;
}

/**
 * Get forecast summary for multiple SKUs
 *
 * @param forecasts - Array of demand forecasts
 * @returns Summary statistics
 */
export function getForecastSummary(forecasts: DemandForecast[]): {
  total_forecasted_demand: number;
  high_confidence_count: number;
  medium_confidence_count: number;
  low_confidence_count: number;
  growing_trend_count: number;
  stable_trend_count: number;
  declining_trend_count: number;
} {
  return {
    total_forecasted_demand: forecasts.reduce(
      (sum, f) => sum + f.forecast_30d,
      0,
    ),
    high_confidence_count: forecasts.filter((f) => f.confidence === "high")
      .length,
    medium_confidence_count: forecasts.filter((f) => f.confidence === "medium")
      .length,
    low_confidence_count: forecasts.filter((f) => f.confidence === "low")
      .length,
    growing_trend_count: forecasts.filter((f) => f.trend === "growing").length,
    stable_trend_count: forecasts.filter((f) => f.trend === "stable").length,
    declining_trend_count: forecasts.filter((f) => f.trend === "declining")
      .length,
  };
}

/**
 * Get 30-day demand forecast for a product (API helper)
 *
 * INVENTORY-006: Used by API route to get forecast data
 *
 * @param productId - Product identifier
 * @param options - Forecast options (avgDailySales, category)
 * @returns Promise resolving to demand forecast
 */
export async function getDemandForecast(
  productId: string,
  options: {
    avgDailySales?: number;
    category?: string;
  } = {},
): Promise<DemandForecast> {
  // In production: fetch real historical data from database
  // For now: generate mock historical data based on avgDailySales
  const avgDailySales = options.avgDailySales || 5;
  const mockHistoricalData: HistoricalSalesData[] = [];

  // Generate 60 days of mock historical data with slight variance
  const today = new Date();
  for (let i = 60; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Add random variance (±30%)
    const variance = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
    const quantity = Math.round(avgDailySales * variance);

    mockHistoricalData.push({
      date,
      quantity,
    });
  }

  // Generate forecast using historical data
  const forecast = generateDemandForecast(productId, mockHistoricalData);

  return forecast;
}

/**
 * Get 14-day demand velocity data for charting (INVENTORY-006)
 *
 * Returns daily sales for the last 14 days in chart-ready format.
 *
 * @param productId - Product identifier
 * @returns Promise resolving to array of daily sales data
 */
export async function get14DayDemandVelocity(
  productId: string,
): Promise<Array<{ date: string; quantity: number }>> {
  // In production: fetch real sales data from database
  // For now: generate mock 14-day data
  const velocityData: Array<{ date: string; quantity: number }> = [];

  const today = new Date();
  const baselineDaily = 5; // Mock baseline sales

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Add variance and slight upward trend
    const trendFactor = 1 + (13 - i) * 0.02; // Slight upward trend
    const variance = 0.7 + Math.random() * 0.6; // Random variance
    const quantity = Math.round(baselineDaily * trendFactor * variance);

    velocityData.push({
      date: date.toISOString(),
      quantity,
    });
  }

  return velocityData;
}
