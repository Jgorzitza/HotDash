/**
 * ROP (Reorder Point) Calculation Service
 * 
 * Calculates reorder points for products based on:
 * - Average daily sales
 * - Lead time days
 * - Safety stock
 * 
 * Formula: ROP = (Average Daily Sales × Lead Time Days) + Safety Stock
 */

import type { ShopifyServiceContext } from "../shopify/types";
import { recordDashboardFact } from "../facts.server";
import { toInputJson } from "../json";

export interface ROPInput {
  sku: string;
  productId: string;
  variantId: string;
  currentQuantity: number;
  salesHistory?: SalesDataPoint[];
  leadTimeDays?: number;
  safetyStock?: number;
  safetyFactor?: number;
}

export interface SalesDataPoint {
  date: string;
  quantity: number;
}

export interface ROPResult {
  sku: string;
  productId: string;
  variantId: string;
  currentQuantity: number;
  averageDailySales: number;
  leadTimeDays: number;
  safetyStock: number;
  rop: number;
  statusBucket: 'in_stock' | 'low_stock' | 'urgent_reorder' | 'out_of_stock';
  daysOfCover: number | null;
  weeksOfStock: number | null;
  shouldReorder: boolean;
  calculatedAt: string;
}

export interface ROPCalculationOptions {
  salesPeriodDays?: number; // Default: 30
  defaultLeadTimeDays?: number; // Default: 14
  defaultSafetyFactor?: number; // Default: 1.0
}

const DEFAULT_SALES_PERIOD = 30;
const DEFAULT_LEAD_TIME = 14;
const DEFAULT_SAFETY_FACTOR = 1.0;

/**
 * Calculate average daily sales from sales history
 */
function calculateAverageDailySales(
  salesHistory: SalesDataPoint[],
  periodDays: number
): number {
  if (!salesHistory || salesHistory.length === 0) {
    return 0;
  }

  const totalQuantity = salesHistory.reduce((sum, point) => sum + point.quantity, 0);
  const actualDays = Math.max(periodDays, 1);
  
  return totalQuantity / actualDays;
}

/**
 * Calculate safety stock
 * 
 * If explicit safety stock provided, use it.
 * Otherwise: Average Daily Sales × Safety Factor
 */
function calculateSafetyStock(
  averageDailySales: number,
  explicitSafetyStock?: number,
  safetyFactor: number = DEFAULT_SAFETY_FACTOR
): number {
  if (explicitSafetyStock !== undefined && explicitSafetyStock >= 0) {
    return explicitSafetyStock;
  }

  return Math.ceil(averageDailySales * safetyFactor);
}

/**
 * Calculate days of cover (WOS - Weeks of Stock)
 */
function calculateDaysOfCover(
  currentQuantity: number,
  averageDailySales: number
): number | null {
  if (!averageDailySales || averageDailySales <= 0) {
    return null;
  }

  return Number((currentQuantity / averageDailySales).toFixed(2));
}

/**
 * Determine status bucket based on current quantity and ROP
 */
function getStatusBucket(
  currentQuantity: number,
  rop: number
): 'in_stock' | 'low_stock' | 'urgent_reorder' | 'out_of_stock' {
  if (currentQuantity === 0) {
    return 'out_of_stock';
  }
  
  if (currentQuantity <= rop * 0.5) {
    return 'urgent_reorder';
  }
  
  if (currentQuantity <= rop) {
    return 'low_stock';
  }
  
  return 'in_stock';
}

/**
 * Calculate ROP for a single product/variant
 */
export function calculateROP(
  input: ROPInput,
  options: ROPCalculationOptions = {}
): ROPResult {
  const {
    salesPeriodDays = DEFAULT_SALES_PERIOD,
    defaultLeadTimeDays = DEFAULT_LEAD_TIME,
    defaultSafetyFactor = DEFAULT_SAFETY_FACTOR,
  } = options;

  // Calculate average daily sales
  const averageDailySales = calculateAverageDailySales(
    input.salesHistory || [],
    salesPeriodDays
  );

  // Determine lead time
  const leadTimeDays = input.leadTimeDays ?? defaultLeadTimeDays;

  // Calculate safety stock
  const safetyStock = calculateSafetyStock(
    averageDailySales,
    input.safetyStock,
    input.safetyFactor ?? defaultSafetyFactor
  );

  // Calculate ROP: (Avg Daily Sales × Lead Time) + Safety Stock
  const rop = Math.ceil((averageDailySales * leadTimeDays) + safetyStock);

  // Calculate days of cover
  const daysOfCover = calculateDaysOfCover(input.currentQuantity, averageDailySales);
  const weeksOfStock = daysOfCover !== null ? Number((daysOfCover / 7).toFixed(2)) : null;

  // Determine status bucket
  const statusBucket = getStatusBucket(input.currentQuantity, rop);

  // Should reorder if low_stock, urgent_reorder, or out_of_stock
  const shouldReorder = ['low_stock', 'urgent_reorder', 'out_of_stock'].includes(statusBucket);

  return {
    sku: input.sku,
    productId: input.productId,
    variantId: input.variantId,
    currentQuantity: input.currentQuantity,
    averageDailySales: Number(averageDailySales.toFixed(2)),
    leadTimeDays,
    safetyStock,
    rop,
    statusBucket,
    daysOfCover,
    weeksOfStock,
    shouldReorder,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate ROP for multiple products/variants
 */
export function calculateBulkROP(
  inputs: ROPInput[],
  options: ROPCalculationOptions = {}
): ROPResult[] {
  return inputs.map(input => calculateROP(input, options));
}

/**
 * Calculate ROP and persist to Supabase as dashboard fact
 */
export async function calculateAndRecordROP(
  context: ShopifyServiceContext,
  input: ROPInput,
  options: ROPCalculationOptions = {}
): Promise<ROPResult> {
  const result = calculateROP(input, options);

  // Record to dashboard facts
  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: "inventory.rop.calculated",
    scope: "ops",
    value: toInputJson(result),
    metadata: toInputJson({
      sku: result.sku,
      statusBucket: result.statusBucket,
      shouldReorder: result.shouldReorder,
      calculatedAt: result.calculatedAt,
    }),
  });

  return result;
}

/**
 * Calculate ROP for multiple products and persist to Supabase
 */
export async function calculateAndRecordBulkROP(
  context: ShopifyServiceContext,
  inputs: ROPInput[],
  options: ROPCalculationOptions = {}
): Promise<ROPResult[]> {
  const results = calculateBulkROP(inputs, options);

  // Record summary to dashboard facts
  const summary = {
    totalProducts: results.length,
    inStock: results.filter(r => r.statusBucket === 'in_stock').length,
    lowStock: results.filter(r => r.statusBucket === 'low_stock').length,
    urgentReorder: results.filter(r => r.statusBucket === 'urgent_reorder').length,
    outOfStock: results.filter(r => r.statusBucket === 'out_of_stock').length,
    shouldReorder: results.filter(r => r.shouldReorder).length,
    calculatedAt: new Date().toISOString(),
  };

  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: "inventory.rop.bulk_calculated",
    scope: "ops",
    value: toInputJson(summary),
    metadata: toInputJson({
      productCount: results.length,
      calculatedAt: summary.calculatedAt,
    }),
  });

  return results;
}

/**
 * Get products that need reordering based on ROP
 */
export function getReorderList(results: ROPResult[]): ROPResult[] {
  return results
    .filter(r => r.shouldReorder)
    .sort((a, b) => {
      // Sort by priority: out_of_stock > urgent_reorder > low_stock
      const priorityOrder = {
        'out_of_stock': 0,
        'urgent_reorder': 1,
        'low_stock': 2,
        'in_stock': 3,
      };
      
      return priorityOrder[a.statusBucket] - priorityOrder[b.statusBucket];
    });
}

