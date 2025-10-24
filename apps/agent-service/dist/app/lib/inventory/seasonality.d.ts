/**
 * Seasonal Demand Adjustments for Inventory Management
 *
 * Adjusts reorder point calculations based on seasonal demand patterns.
 * Peak seasons (e.g., winter for snowboards) get 20-30% ROP buffer increase.
 *
 * Context7 Source: /microsoft/typescript (type guards, interfaces)
 */
export type Season = "winter" | "spring" | "summer" | "fall";
export type ProductCategory = "snowboards" | "skis" | "winter-sports" | "summer-sports" | "apparel-winter" | "apparel-summer" | "general";
export interface SeasonalityPattern {
    category: ProductCategory;
    peakMonths: number[];
    peakFactor: number;
    offSeasonFactor: number;
}
/**
 * Predefined seasonality patterns for Hot Rodan product categories
 *
 * Based on historical sales patterns:
 * - Winter sports peak: Nov-Feb (months 10, 11, 0, 1)
 * - Summer sports peak: May-Aug (months 4, 5, 6, 7)
 */
export declare const SEASONALITY_PATTERNS: Record<ProductCategory, SeasonalityPattern>;
/**
 * Get current season from month
 *
 * @param month - Month (0-11, where 0=Jan, 11=Dec)
 * @returns Season name
 */
export declare function getSeason(month: number): Season;
/**
 * Calculate seasonality factor for a product category and current month
 *
 * Returns a multiplier to adjust demand forecasts:
 * - Peak season: 1.2-1.3 (20-30% increase)
 * - Off-season: 0.7-0.8 (20-30% decrease)
 * - Normal: 1.0 (no adjustment)
 *
 * @param category - Product category
 * @param currentMonth - Current month (0-11)
 * @returns Seasonality multiplier
 */
export declare function getSeasonalityFactor(category: ProductCategory, currentMonth: number): number;
/**
 * Calculate seasonal adjusted average daily sales
 *
 * Applies seasonality factor to base average daily sales to account
 * for expected demand fluctuations.
 *
 * @param avgDailySales - Base average daily sales
 * @param category - Product category
 * @param currentMonth - Current month (0-11), defaults to current date
 * @returns Seasonally adjusted daily sales
 */
export declare function calculateSeasonalAdjustedSales(avgDailySales: number, category: ProductCategory, currentMonth?: number): number;
/**
 * Determine if a month is in peak season for a category
 *
 * @param category - Product category
 * @param month - Month to check (0-11)
 * @returns True if month is in peak season
 */
export declare function isPeakSeason(category: ProductCategory, month: number): boolean;
/**
 * Get months until next peak season for planning purposes
 *
 * @param category - Product category
 * @param currentMonth - Current month (0-11)
 * @returns Number of months until next peak season (0 if currently in peak)
 */
export declare function getMonthsUntilPeak(category: ProductCategory, currentMonth: number): number;
//# sourceMappingURL=seasonality.d.ts.map