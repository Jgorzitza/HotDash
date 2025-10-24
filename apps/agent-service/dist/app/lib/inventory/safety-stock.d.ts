/**
 * Safety Stock Calculation
 *
 * Calculates the safety stock buffer to prevent stockouts during demand variability
 * and lead time fluctuations.
 *
 * Formula: safety_stock = (max_daily_sales * max_lead_days) - (avg_daily_sales * avg_lead_days)
 *
 * Rounds up using Math.ceil to ensure adequate buffer.
 */
export interface SafetyStockParams {
    avgDailySales: number;
    avgLeadDays: number;
    maxDailySales: number;
    maxLeadDays: number;
}
/**
 * Calculate safety stock for a product
 *
 * @param params - Safety stock calculation parameters
 * @returns Safety stock quantity (rounded up to nearest whole unit)
 */
export declare function calculateSafetyStock(params: SafetyStockParams): number;
//# sourceMappingURL=safety-stock.d.ts.map