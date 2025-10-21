/**
 * Reorder Point (ROP) Calculation Service
 *
 * Calculates when to reorder inventory based on average daily usage,
 * lead time, and safety stock buffer.
 *
 * Enhanced with seasonal demand adjustments (INVENTORY-001)
 *
 * Formula: ROP = seasonal_adjusted_sales × lead_time + safety_stock
 */

import { calculateSafetyStock } from "~/lib/inventory/safety-stock";
import {
  calculateSeasonalAdjustedSales,
  type ProductCategory,
} from "~/lib/inventory/seasonality";

export interface ROPParams {
  avgDailySales: number;
  leadTimeDays: number;
  maxDailySales: number;
  maxLeadDays: number;
  category?: ProductCategory; // Optional: defaults to "general" if not provided
  currentMonth?: number; // Optional: defaults to current month if not provided
}

export interface ROPResult {
  reorderPoint: number;
  safetyStock: number;
  leadTimeDemand: number;
  seasonalityFactor?: number; // Multiplier applied for seasonal adjustment (1.0 = no adjustment)
  adjustedDailySales?: number; // Seasonally adjusted daily sales used in calculation
}

/**
 * Calculate the Reorder Point (ROP) for a product
 *
 * The ROP is the inventory level at which a new order should be placed
 * to avoid stockouts during the lead time, accounting for demand variability
 * and seasonal patterns.
 *
 * Enhanced with seasonal adjustments (INVENTORY-001):
 * - Peak seasons: 20-30% ROP increase
 * - Off-seasons: 20-30% ROP decrease
 * - General products: No seasonal adjustment
 *
 * @param params - ROP calculation parameters
 * @returns ROP calculation results including reorder point, safety stock, lead time demand, and seasonality factor
 */
export function calculateReorderPoint(params: ROPParams): ROPResult {
  const {
    avgDailySales,
    leadTimeDays,
    maxDailySales,
    maxLeadDays,
    category = "general",
    currentMonth,
  } = params;

  // Validate inputs
  if (avgDailySales < 0 || leadTimeDays < 0) {
    throw new Error("Average daily sales and lead time must be non-negative");
  }

  // Apply seasonal adjustment to average daily sales (INVENTORY-001)
  const adjustedDailySales = calculateSeasonalAdjustedSales(
    avgDailySales,
    category,
    currentMonth,
  );

  // Calculate seasonality factor for transparency
  const seasonalityFactor =
    avgDailySales > 0 ? adjustedDailySales / avgDailySales : 1.0;

  // Also adjust max daily sales proportionally for safety stock calculation
  const adjustedMaxDailySales =
    maxDailySales > 0 ? maxDailySales * seasonalityFactor : maxDailySales;

  // Calculate safety stock using seasonally adjusted values
  const safetyStock = calculateSafetyStock({
    avgDailySales: adjustedDailySales,
    avgLeadDays: leadTimeDays,
    maxDailySales: adjustedMaxDailySales,
    maxLeadDays,
  });

  // Calculate lead time demand (seasonally adjusted usage during lead time)
  const leadTimeDemand = adjustedDailySales * leadTimeDays;

  // Calculate reorder point
  // ROP = seasonal adjusted lead time demand + safety stock
  const reorderPoint = Math.ceil(leadTimeDemand + safetyStock);

  return {
    reorderPoint,
    safetyStock,
    leadTimeDemand,
    seasonalityFactor,
    adjustedDailySales,
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

