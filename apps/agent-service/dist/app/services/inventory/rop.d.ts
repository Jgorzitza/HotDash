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
import { type ProductCategory } from "~/lib/inventory/seasonality";
export interface ROPParams {
    avgDailySales: number;
    leadTimeDays: number;
    maxDailySales: number;
    maxLeadDays: number;
    category?: ProductCategory;
    currentMonth?: number;
}
export interface ROPResult {
    reorderPoint: number;
    safetyStock: number;
    leadTimeDemand: number;
    seasonalityFactor?: number;
    adjustedDailySales?: number;
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
export declare function calculateReorderPoint(params: ROPParams): ROPResult;
/**
 * Determine inventory status based on current inventory level and ROP
 *
 * @param currentInventory - Current inventory on hand
 * @param rop - Reorder point
 * @returns Inventory status: 'urgent_reorder' | 'low_stock' | 'out_of_stock' | 'in_stock'
 */
export declare function getInventoryStatus(currentInventory: number, rop: number): "urgent_reorder" | "low_stock" | "out_of_stock" | "in_stock";
//# sourceMappingURL=rop.d.ts.map