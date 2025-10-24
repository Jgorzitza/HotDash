/**
 * Vendor Management Service (INVENTORY-003)
 *
 * Tracks vendor performance metrics for optimal supplier selection:
 * - Lead time tracking (order to delivery)
 * - Reliability scoring (on-time delivery %)
 * - Cost comparison across vendors
 * - Preferred vendor recommendations
 *
 * Context7 Source: /microsoft/typescript (type definitions)
 */
export interface Vendor {
    id: string;
    name: string;
    contact_email?: string;
    contact_phone?: string;
    notes?: string;
}
export interface VendorPerformanceMetrics {
    vendor_id: string;
    vendor_name: string;
    total_orders: number;
    completed_orders: number;
    on_time_deliveries: number;
    late_deliveries: number;
    average_lead_time_days: number;
    expected_lead_time_days: number;
    lead_time_variance: number;
    reliability_score: number;
    average_cost_per_unit: number;
    last_order_date?: Date;
    last_delivery_date?: Date;
}
export interface VendorComparison {
    sku: string;
    vendors: Array<{
        vendor_id: string;
        vendor_name: string;
        cost_per_unit: number;
        lead_time_days: number;
        reliability_score: number;
        total_score: number;
        recommended: boolean;
    }>;
    preferred_vendor_id: string;
    preferred_vendor_name: string;
}
export interface VendorOrder {
    order_id: string;
    vendor_id: string;
    sku: string;
    quantity: number;
    cost_per_unit: number;
    total_cost: number;
    order_date: Date;
    expected_delivery_date: Date;
    actual_delivery_date?: Date;
    status: "ordered" | "shipped" | "delivered" | "cancelled";
}
/**
 * Calculate lead time in days between two dates
 *
 * @param orderDate - Date order was placed
 * @param deliveryDate - Date order was delivered
 * @returns Lead time in days
 */
export declare function calculateLeadTime(orderDate: Date, deliveryDate: Date): number;
/**
 * Determine if delivery was on time
 *
 * @param expectedDate - Expected delivery date
 * @param actualDate - Actual delivery date
 * @param gracePeriodDays - Grace period in days (default: 1)
 * @returns True if on time (within grace period)
 */
export declare function isOnTimeDelivery(expectedDate: Date, actualDate: Date, gracePeriodDays?: number): boolean;
/**
 * Calculate vendor performance metrics from order history
 *
 * @param vendor - Vendor information
 * @param orders - Array of vendor orders
 * @returns Performance metrics
 */
export declare function calculateVendorPerformance(vendor: Vendor, orders: VendorOrder[]): VendorPerformanceMetrics;
/**
 * Calculate composite vendor score (0-100)
 *
 * Weighted scoring:
 * - Reliability: 50% (on-time delivery rate)
 * - Lead Time: 30% (faster is better)
 * - Cost: 20% (lower is better)
 *
 * @param metrics - Vendor performance metrics
 * @param benchmarkLeadTime - Benchmark lead time for comparison (e.g., industry average)
 * @param benchmarkCost - Benchmark cost for comparison
 * @returns Composite score (0-100)
 */
export declare function calculateVendorScore(metrics: VendorPerformanceMetrics, benchmarkLeadTime: number, benchmarkCost: number): number;
/**
 * Compare vendors for a specific SKU
 *
 * @param sku - Product SKU
 * @param vendors - Array of vendors with their metrics
 * @param benchmarkLeadTime - Benchmark lead time for scoring
 * @param benchmarkCost - Benchmark cost for scoring
 * @returns Vendor comparison with recommended vendor
 */
export declare function compareVendorsForSKU(sku: string, vendors: Array<{
    vendor: Vendor;
    metrics: VendorPerformanceMetrics;
}>, benchmarkLeadTime?: number, benchmarkCost?: number): VendorComparison;
/**
 * Get vendor ranking summary across all SKUs
 *
 * @param vendors - Array of vendors with their overall metrics
 * @returns Ranked vendors with scores
 */
export declare function rankVendors(vendors: Array<{
    vendor: Vendor;
    metrics: VendorPerformanceMetrics;
}>): Array<{
    vendor_id: string;
    vendor_name: string;
    reliability_score: number;
    average_lead_time_days: number;
    average_cost_per_unit: number;
    total_orders: number;
    rank: number;
}>;
/**
 * Identify vendors with performance issues
 *
 * Issues flagged:
 * - Low reliability (< 80% on-time)
 * - High lead time variance (inconsistent delivery)
 * - No recent orders (> 90 days)
 *
 * @param metrics - Vendor performance metrics
 * @returns Array of performance issues
 */
export declare function identifyVendorIssues(metrics: VendorPerformanceMetrics): Array<{
    issue_type: "low_reliability" | "high_variance" | "inactive";
    severity: "high" | "medium" | "low";
    description: string;
}>;
/**
 * Get vendor information for a product (API helper for INVENTORY-006)
 *
 * In production: fetch from database by productId
 * For now: returns mock vendor data
 *
 * @param productId - Product identifier
 * @returns Promise resolving to vendor information
 */
export declare function getVendorInfo(productId: string): Promise<{
    vendor_id: string;
    vendor_name: string;
    cost_per_unit: number;
    lead_time_days: number;
    reliability_score: number;
    last_order_date: string;
}>;
//# sourceMappingURL=vendor-management.d.ts.map