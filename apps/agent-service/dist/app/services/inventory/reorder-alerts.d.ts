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
    eoqQty: number;
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
export declare function calculateEOQ(annualDemand: number, costPerUnit: number, setupCost?: number, holdingCostRate?: number): number;
/**
 * Calculate days until stockout
 *
 * Formula: currentStock / averageDailySales
 *
 * @param currentStock - Current inventory level
 * @param avgDailySales - Average daily sales rate
 * @returns Days until stockout (0 if already out of stock)
 */
export declare function calculateDaysUntilStockout(currentStock: number, avgDailySales: number): number;
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
export declare function determineAlertUrgency(currentStock: number, rop: number, daysUntilStockout: number): AlertUrgency;
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
export declare function calculateRecommendedOrderQty(currentStock: number, rop: number, safetyStock: number, eoq: number): number;
/**
 * Generate reorder alert for a single product
 *
 * INVENTORY-009: Automated Reorder Alerts
 *
 * @param product - Product information
 * @returns Promise resolving to reorder alert or null if no alert needed
 */
export declare function generateReorderAlert(product: {
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
}): Promise<ReorderAlert | null>;
/**
 * Generate reorder alerts for all products
 *
 * Scans entire inventory and generates alerts for products below ROP.
 *
 * @param products - Array of products to check
 * @returns Promise resolving to alert summary
 */
export declare function generateAllReorderAlerts(products: Array<{
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
}>): Promise<ReorderAlertSummary>;
//# sourceMappingURL=reorder-alerts.d.ts.map