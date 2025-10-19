/**
 * Inventory Turnover Analysis
 * 
 * Calculates sales velocity, days on hand, and identifies slow/fast movers
 * Manager-specified path: app/lib/inventory/turnover.ts
 */

export interface TurnoverMetrics {
  salesVelocity: number; // units per day
  daysOnHand: number | null; // current inventory / velocity
  turnoverRate: number | null; // annual turns
  classification: "fast" | "medium" | "slow";
}

/**
 * Calculate inventory turnover metrics
 * 
 * @param currentQty - Current on-hand quantity
 * @param avgDailySales - Average units sold per day
 * @param annualCOGS - Optional: Annual cost of goods sold
 * @param avgInventoryValue - Optional: Average inventory value
 * @returns Turnover metrics with classification
 */
export function calculateTurnover(params: {
  currentQty: number;
  avgDailySales: number;
  annualCOGS?: number;
  avgInventoryValue?: number;
}): TurnoverMetrics {
  const { currentQty, avgDailySales, annualCOGS, avgInventoryValue } = params;

  const salesVelocity = avgDailySales;
  const daysOnHand = avgDailySales > 0 ? currentQty / avgDailySales : null;
  
  let turnoverRate: number | null = null;
  if (annualCOGS && avgInventoryValue && avgInventoryValue > 0) {
    turnoverRate = annualCOGS / avgInventoryValue;
  }

  const classification = classifyTurnover(salesVelocity, daysOnHand);

  return {
    salesVelocity,
    daysOnHand,
    turnoverRate,
    classification,
  };
}

function classifyTurnover(velocity: number, daysOnHand: number | null): "fast" | "medium" | "slow" {
  if (daysOnHand === null) return "medium";
  
  if (velocity >= 10 || daysOnHand < 14) return "fast"; // High velocity, low stock
  if (velocity >= 3 || daysOnHand < 30) return "medium"; // Medium velocity
  return "slow"; // Low velocity, high stock
}

export function identifySlowMovers<T extends { avgDailySales: number; quantity: number }>(
  items: T[],
  slowThreshold: number = 1, // < 1 unit/day
): T[] {
  return items.filter(item => item.avgDailySales < slowThreshold);
}

export function identifyFastMovers<T extends { avgDailySales: number }>(
  items: T[],
  fastThreshold: number = 10, // >= 10 units/day
): T[] {
  return items.filter(item => item.avgDailySales >= fastThreshold);
}
