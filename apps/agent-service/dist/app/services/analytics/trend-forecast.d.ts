/**
 * Trend Forecasting Service
 *
 * Forecasts future metrics using linear regression
 * Predicts next 7/14/30 days
 * Calculates confidence intervals
 * Determines trend direction (up/down/stable)
 */
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
    trendStrength: number;
    predictions: ForecastPoint[];
    confidence: number;
    recommendation: string;
}
export type ForecastMetric = "impressions" | "clicks" | "conversions" | "revenue" | "roas";
/**
 * Forecast future metrics using linear regression
 */
export declare function forecastMetric(metric: ForecastMetric, shopDomain?: string, forecastDays?: 7 | 14 | 30, historicalDays?: number): Promise<TrendForecast>;
/**
 * Forecast multiple metrics at once
 */
export declare function forecastAllMetrics(shopDomain?: string, forecastDays?: 7 | 14 | 30): Promise<Record<ForecastMetric, TrendForecast>>;
//# sourceMappingURL=trend-forecast.d.ts.map