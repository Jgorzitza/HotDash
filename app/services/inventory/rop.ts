/**
 * Reorder Point (ROP) Calculation Service
 *
 * Formula: ROP = (Average Daily Demand × Lead Time Days) + Safety Stock
 * Safety Stock = Average Daily Demand × Safety Stock Days
 */

export interface ROPParams {
  avgDailyDemand: number;
  leadTimeDays: number;
  safetyStockDays: number;
}

export interface SafetyStockParams {
  averageDailySales: number;
  averageLeadTimeDays: number;
  maxDailySales: number;
  maxLeadTimeDays: number;
}

/**
 * Calculate Reorder Point (ROP)
 *
 * @param params - ROP calculation parameters
 * @returns Reorder point quantity (floored to whole units)
 *
 * @example
 * ```typescript
 * const rop = calculateROP({
 *   avgDailyDemand: 10,
 *   leadTimeDays: 7,
 *   safetyStockDays: 3
 * });
 * // Returns: 100 (10 * 7 + 10 * 3)
 * ```
 */
export function calculateROP(params: ROPParams): number {
  const { avgDailyDemand, leadTimeDays, safetyStockDays } = params;

  // Input validation
  if (avgDailyDemand < 0 || leadTimeDays < 0 || safetyStockDays < 0) {
    return 0;
  }

  const leadTimeDemand = avgDailyDemand * leadTimeDays;
  const safetyStock = avgDailyDemand * safetyStockDays;

  return Math.floor(leadTimeDemand + safetyStock);
}

/**
 * Calculate Safety Stock using min-max method
 *
 * Formula: (Max Daily Sales × Max Lead Time) - (Avg Daily Sales × Avg Lead Time)
 *
 * @param params - Safety stock calculation parameters
 * @returns Safety stock quantity (floored to whole units, minimum 0)
 *
 * @example
 * ```typescript
 * const safety = calculateSafetyStock({
 *   averageDailySales: 12,
 *   averageLeadTimeDays: 5,
 *   maxDailySales: 18,
 *   maxLeadTimeDays: 8
 * });
 * // Returns: 84 ((18 * 8) - (12 * 5))
 * ```
 */
export function calculateSafetyStock(params: SafetyStockParams): number {
  const {
    averageDailySales,
    averageLeadTimeDays,
    maxDailySales,
    maxLeadTimeDays,
  } = params;

  // Input validation
  if (
    averageDailySales <= 0 ||
    averageLeadTimeDays < 0 ||
    maxDailySales <= 0 ||
    maxLeadTimeDays <= 0
  ) {
    return 0;
  }

  const maxDemand = maxDailySales * maxLeadTimeDays;
  const avgDemand = averageDailySales * averageLeadTimeDays;
  const safety = maxDemand - avgDemand;

  return Math.max(0, Math.floor(safety));
}

/**
 * Calculate ROP with automatic safety stock calculation
 *
 * @param params - Combined parameters for ROP with safety stock calculation
 * @returns Reorder point quantity
 */
export function calculateROPWithSafety(
  params: ROPParams & Partial<SafetyStockParams>,
): number {
  const { avgDailyDemand, leadTimeDays, safetyStockDays } = params;

  // If we have min-max parameters, calculate safety stock
  if (
    params.averageDailySales !== undefined &&
    params.averageLeadTimeDays !== undefined &&
    params.maxDailySales !== undefined &&
    params.maxLeadTimeDays !== undefined
  ) {
    const calculatedSafety = calculateSafetyStock({
      averageDailySales: params.averageDailySales,
      averageLeadTimeDays: params.averageLeadTimeDays,
      maxDailySales: params.maxDailySales,
      maxLeadTimeDays: params.maxLeadTimeDays,
    });

    // Convert calculated safety stock to days equivalent
    const safetyDays =
      avgDailyDemand > 0 ? calculatedSafety / avgDailyDemand : safetyStockDays;

    return calculateROP({
      avgDailyDemand,
      leadTimeDays,
      safetyStockDays: safetyDays,
    });
  }

  // Otherwise use provided safety stock days
  return calculateROP({ avgDailyDemand, leadTimeDays, safetyStockDays });
}
