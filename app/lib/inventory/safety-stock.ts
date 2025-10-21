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
export function calculateSafetyStock(params: SafetyStockParams): number {
  const { avgDailySales, avgLeadDays, maxDailySales, maxLeadDays } = params;

  // Validate inputs
  if (
    avgDailySales < 0 ||
    avgLeadDays < 0 ||
    maxDailySales < 0 ||
    maxLeadDays < 0
  ) {
    throw new Error("All safety stock parameters must be non-negative");
  }

  if (maxDailySales < avgDailySales) {
    throw new Error(
      "Maximum daily sales cannot be less than average daily sales",
    );
  }

  if (maxLeadDays < avgLeadDays) {
    throw new Error("Maximum lead days cannot be less than average lead days");
  }

  // Calculate safety stock
  const maxDemand = maxDailySales * maxLeadDays;
  const avgDemand = avgDailySales * avgLeadDays;
  const safetyStock = maxDemand - avgDemand;

  // Round up to ensure adequate buffer
  return Math.ceil(safetyStock);
}


