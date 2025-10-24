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
    forecast_30d: number;
    daily_forecast: number;
    confidence: ConfidenceLevel;
    trend: TrendDirection;
    recommended_reorder_qty: number;
    analysis: {
        historical_avg: number;
        recent_avg_7d: number;
        recent_avg_30d: number;
        trend_coefficient: number;
        variability_coefficient: number;
    };
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
export declare function generateDemandForecast(sku: string, historicalData: HistoricalSalesData[]): DemandForecast;
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
export declare function detectAnomalies(historicalData: HistoricalSalesData[], threshold?: number): HistoricalSalesData[];
/**
 * Get forecast summary for multiple SKUs
 *
 * @param forecasts - Array of demand forecasts
 * @returns Summary statistics
 */
export declare function getForecastSummary(forecasts: DemandForecast[]): {
    total_forecasted_demand: number;
    high_confidence_count: number;
    medium_confidence_count: number;
    low_confidence_count: number;
    growing_trend_count: number;
    stable_trend_count: number;
    declining_trend_count: number;
};
/**
 * Get 30-day demand forecast for a product (API helper)
 *
 * INVENTORY-006: Used by API route to get forecast data
 *
 * @param productId - Product identifier
 * @param options - Forecast options (avgDailySales, category)
 * @returns Promise resolving to demand forecast
 */
export declare function getDemandForecast(productId: string, options?: {
    avgDailySales?: number;
    category?: string;
}): Promise<DemandForecast>;
/**
 * Get 14-day demand velocity data for charting (INVENTORY-006)
 *
 * Returns daily sales for the last 14 days in chart-ready format.
 *
 * @param productId - Product identifier
 * @returns Promise resolving to array of daily sales data
 */
export declare function get14DayDemandVelocity(productId: string): Promise<Array<{
    date: string;
    quantity: number;
}>>;
//# sourceMappingURL=demand-forecast.d.ts.map