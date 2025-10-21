/**
 * Automated Reorder Alerts Service (INVENTORY-009)
 *
 * Generates intelligent reorder alerts based on:
 * - ROP (Reorder Point) thresholds with seasonal adjustments
 * - Days until stockout calculations
 * - Urgency levels (critical/high/medium/low)
 * - EOQ (Economic Order Quantity) recommendations
 * - Vendor and cost information
 *
 * Context7: /microsoft/typescript - type safety, algorithms
 * Context7: /prisma/docs - inventory queries, aggregations
 */

import { calculateReorderPoint, getInventoryStatus } from "./rop";
import { getDemandForecast } from "./demand-forecast";
import { getVendorInfo } from "./vendor-management";
import type { ProductCategory } from "~/lib/inventory/seasonality";

export type AlertUrgency = "critical" | "high" | "medium" | "low";

export interface ReorderAlert {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  daysUntilStockout: number;
  urgency: AlertUrgency;
  recommendedOrderQty: number;
  eoqQty: number; // Economic Order Quantity
  vendor: {
    vendorId: string;
    vendorName: string;
    costPerUnit: number;
    leadTimeDays: number;
    reliabilityScore: number;
  };
  estimatedCost: number;
  estimatedDeliveryDate: string;
  generatedAt: string;
}

export interface ReorderAlertSummary {
  totalAlerts: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalEstimatedCost: number;
  alerts: ReorderAlert[];
  generatedAt: string;
}

/**
 * Calculate Economic Order Quantity (EOQ)
 *
 * EOQ Formula: √((2 × D × S) / H)
 * Where:
 * - D = Annual demand (units per year)
 * - S = Setup/ordering cost per order
 * - H = Holding cost per unit per year
 *
 * Assumptions for this implementation:
 * - Setup cost: $50 per order (typical small business)
 * - Holding cost: 25% of unit cost per year (industry standard)
 *
 * @param annualDemand - Expected annual demand in units
 * @param costPerUnit - Cost per unit
 * @param setupCost - Cost per order (default: $50)
 * @param holdingCostRate - Annual holding cost as % of unit cost (default: 0.25 = 25%)
 * @returns Economic Order Quantity (rounded to whole units)
 */
export function calculateEOQ(
  annualDemand: number,
  costPerUnit: number,
  setupCost: number = 50,
  holdingCostRate: number = 0.25
): number {
  // Validate inputs
  if (annualDemand <= 0 || costPerUnit <= 0) {
    return 0;
  }

  // H = Holding cost per unit per year = cost per unit × holding cost rate
  const holdingCost = costPerUnit * holdingCostRate;

  if (holdingCost === 0) {
    return 0;
  }

  // EOQ = √((2 × D × S) / H)
  const eoq = Math.sqrt((2 * annualDemand * setupCost) / holdingCost);

  // Round to whole units
  return Math.ceil(eoq);
}

/**
 * Calculate days until stockout
 *
 * Formula: currentStock / averageDailySales
 *
 * @param currentStock - Current inventory level
 * @param avgDailySales - Average daily sales rate
 * @returns Days until stockout (0 if already out of stock)
 */
export function calculateDaysUntilStockout(
  currentStock: number,
  avgDailySales: number
): number {
  if (currentStock <= 0) {
    return 0;
  }

  if (avgDailySales <= 0) {
    return 999; // Effectively infinite (no sales)
  }

  return Math.ceil(currentStock / avgDailySales);
}

/**
 * Determine alert urgency level based on stock status and days until stockout
 *
 * Urgency Levels:
 * - Critical: Out of stock OR < 3 days until stockout
 * - High: 3-7 days until stockout
 * - Medium: 7-14 days until stockout
 * - Low: > 14 days but below ROP
 *
 * @param currentStock - Current inventory level
 * @param rop - Reorder point
 * @param daysUntilStockout - Days until stockout
 * @returns Alert urgency level
 */
export function determineAlertUrgency(
  currentStock: number,
  rop: number,
  daysUntilStockout: number
): AlertUrgency {
  // Critical: Out of stock or critical shortage
  if (currentStock === 0 || daysUntilStockout < 3) {
    return "critical";
  }

  // High: Less than a week of stock
  if (daysUntilStockout < 7) {
    return "high";
  }

  // Medium: 1-2 weeks of stock
  if (daysUntilStockout < 14) {
    return "medium";
  }

  // Low: Below ROP but not urgent
  return "low";
}

/**
 * Calculate recommended order quantity
 *
 * Uses the greater of:
 * - EOQ (Economic Order Quantity)
 * - Quantity to reach safety stock + buffer
 *
 * @param currentStock - Current inventory level
 * @param rop - Reorder point
 * @param safetyStock - Safety stock level
 * @param eoq - Economic order quantity
 * @returns Recommended order quantity
 */
export function calculateRecommendedOrderQty(
  currentStock: number,
  rop: number,
  safetyStock: number,
  eoq: number
): number {
  // Calculate quantity needed to reach ROP + safety buffer
  const targetStock = rop + safetyStock;
  const qtyToTarget = Math.max(0, targetStock - currentStock);

  // Use the greater of EOQ or qty to reach target
  return Math.max(eoq, qtyToTarget);
}

/**
 * Generate reorder alert for a single product
 *
 * INVENTORY-009: Automated Reorder Alerts
 *
 * @param product - Product information
 * @returns Promise resolving to reorder alert or null if no alert needed
 */
export async function generateReorderAlert(product: {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  avgDailySales: number;
  leadTimeDays: number;
  maxDailySales: number;
  maxLeadDays: number;
  category?: ProductCategory;
  costPerUnit?: number;
}): Promise<ReorderAlert | null> {
  const {
    productId,
    productName,
    sku,
    currentStock,
    avgDailySales,
    leadTimeDays,
    maxDailySales,
    maxLeadDays,
    category = "general",
    costPerUnit = 25, // Default cost if not provided
  } = product;

  // Calculate ROP with seasonal adjustments (INVENTORY-001)
  const ropResult = calculateReorderPoint({
    avgDailySales,
    leadTimeDays,
    maxDailySales,
    maxLeadDays,
    category,
    currentMonth: new Date().getMonth() + 1,
  });

  // Check if alert is needed (stock below ROP)
  const status = getInventoryStatus(currentStock, ropResult.reorderPoint);
  if (status === "in_stock") {
    return null; // No alert needed
  }

  // Get demand forecast (INVENTORY-002)
  const forecast = await getDemandForecast(productId, {
    avgDailySales,
    category,
  });

  // Calculate days until stockout
  const daysUntilStockout = calculateDaysUntilStockout(
    currentStock,
    forecast.daily_forecast
  );

  // Determine urgency level
  const urgency = determineAlertUrgency(
    currentStock,
    ropResult.reorderPoint,
    daysUntilStockout
  );

  // Calculate EOQ (assume 365-day demand)
  const annualDemand = forecast.daily_forecast * 365;
  const eoqQty = calculateEOQ(annualDemand, costPerUnit);

  // Calculate recommended order quantity
  const recommendedOrderQty = calculateRecommendedOrderQty(
    currentStock,
    ropResult.reorderPoint,
    ropResult.safetyStock,
    eoqQty
  );

  // Get vendor information (INVENTORY-003)
  const vendorInfo = await getVendorInfo(productId);

  // Calculate estimated cost
  const estimatedCost = recommendedOrderQty * vendorInfo.cost_per_unit;

  // Calculate estimated delivery date
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + vendorInfo.lead_time_days);

  return {
    productId,
    productName,
    sku,
    currentStock,
    reorderPoint: ropResult.reorderPoint,
    safetyStock: ropResult.safetyStock,
    daysUntilStockout,
    urgency,
    recommendedOrderQty,
    eoqQty,
    vendor: {
      vendorId: vendorInfo.vendor_id,
      vendorName: vendorInfo.vendor_name,
      costPerUnit: vendorInfo.cost_per_unit,
      leadTimeDays: vendorInfo.lead_time_days,
      reliabilityScore: vendorInfo.reliability_score,
    },
    estimatedCost,
    estimatedDeliveryDate: deliveryDate.toISOString(),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate reorder alerts for all products
 *
 * Scans entire inventory and generates alerts for products below ROP.
 *
 * @param products - Array of products to check
 * @returns Promise resolving to alert summary
 */
export async function generateAllReorderAlerts(
  products: Array<{
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    avgDailySales: number;
    leadTimeDays: number;
    maxDailySales: number;
    maxLeadDays: number;
    category?: ProductCategory;
    costPerUnit?: number;
  }>
): Promise<ReorderAlertSummary> {
  // Generate alerts for all products (filter out nulls)
  const alertPromises = products.map((p) => generateReorderAlert(p));
  const alertResults = await Promise.all(alertPromises);
  const alerts = alertResults.filter((a): a is ReorderAlert => a !== null);

  // Count alerts by urgency
  const criticalCount = alerts.filter((a) => a.urgency === "critical").length;
  const highCount = alerts.filter((a) => a.urgency === "high").length;
  const mediumCount = alerts.filter((a) => a.urgency === "medium").length;
  const lowCount = alerts.filter((a) => a.urgency === "low").length;

  // Calculate total estimated cost
  const totalEstimatedCost = alerts.reduce(
    (sum, a) => sum + a.estimatedCost,
    0
  );

  // Sort by urgency (critical first) then by days until stockout
  const urgencyOrder: Record<AlertUrgency, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  alerts.sort((a, b) => {
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    return a.daysUntilStockout - b.daysUntilStockout;
  });

  return {
    totalAlerts: alerts.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    totalEstimatedCost,
    alerts,
    generatedAt: new Date().toISOString(),
  };
}


