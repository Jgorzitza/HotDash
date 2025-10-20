/**
 * Reorder Point (ROP) Calculation Service
 *
 * Calculates when to reorder inventory based on average daily usage,
 * lead time, and safety stock buffer.
 *
 * Formula: ROP = avg_daily_usage × lead_time + safety_stock
 */

import { calculateSafetyStock } from "~/lib/inventory/safety-stock";

export interface ROPParams {
  avgDailySales: number;
  leadTimeDays: number;
  maxDailySales: number;
  maxLeadDays: number;
}

export interface ROPResult {
  reorderPoint: number;
  safetyStock: number;
  leadTimeDemand: number;
}

/**
 * Calculate the Reorder Point (ROP) for a product
 *
 * The ROP is the inventory level at which a new order should be placed
 * to avoid stockouts during the lead time, accounting for demand variability.
 *
 * @param params - ROP calculation parameters
 * @returns ROP calculation results including reorder point, safety stock, and lead time demand
 */
export function calculateReorderPoint(params: ROPParams): ROPResult {
  const { avgDailySales, leadTimeDays, maxDailySales, maxLeadDays } = params;

  // Validate inputs
  if (avgDailySales < 0 || leadTimeDays < 0) {
    throw new Error("Average daily sales and lead time must be non-negative");
  }

  // Calculate safety stock using the dedicated function
  const safetyStock = calculateSafetyStock({
    avgDailySales,
    avgLeadDays: leadTimeDays,
    maxDailySales,
    maxLeadDays,
  });

  // Calculate lead time demand (average usage during lead time)
  const leadTimeDemand = avgDailySales * leadTimeDays;

  // Calculate reorder point
  // ROP = lead time demand + safety stock
  const reorderPoint = Math.ceil(leadTimeDemand + safetyStock);

  return {
    reorderPoint,
    safetyStock,
    leadTimeDemand,
  };
}

/**
 * Determine inventory status based on current inventory level and ROP
 *
 * @param currentInventory - Current inventory on hand
 * @param rop - Reorder point
 * @returns Inventory status: 'urgent_reorder' | 'low_stock' | 'out_of_stock' | 'in_stock'
 */
export function getInventoryStatus(
  currentInventory: number,
  rop: number,
): "urgent_reorder" | "low_stock" | "out_of_stock" | "in_stock" {
  if (currentInventory <= 0) {
    return "out_of_stock";
  }

  if (currentInventory <= rop * 0.5) {
    return "urgent_reorder";
  }

  if (currentInventory <= rop) {
    return "low_stock";
  }

  return "in_stock";
}

