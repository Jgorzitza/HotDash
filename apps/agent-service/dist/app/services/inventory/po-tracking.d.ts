/**
 * Purchase Order (PO) Tracking System (INVENTORY-004)
 *
 * Tracks purchase orders through their lifecycle:
 * - PO status (ordered, shipped, received, cancelled)
 * - Expected vs actual delivery dates
 * - Lead time accuracy calculation
 * - Integration with vendor management
 *
 * Context7 Source: /microsoft/typescript (type definitions)
 */
export type POStatus = "draft" | "ordered" | "shipped" | "received" | "cancelled";
export interface PurchaseOrder {
    po_number: string;
    vendor_id: string;
    vendor_name: string;
    sku: string;
    product_name: string;
    quantity: number;
    cost_per_unit: number;
    total_cost: number;
    status: POStatus;
    created_date: Date;
    ordered_date?: Date;
    expected_delivery_date?: Date;
    shipped_date?: Date;
    actual_delivery_date?: Date;
    notes?: string;
}
export interface POTrackingDetails extends PurchaseOrder {
    days_since_order?: number;
    days_until_expected?: number;
    actual_lead_time?: number;
    expected_lead_time?: number;
    lead_time_variance?: number;
    is_overdue?: boolean;
    is_on_track?: boolean;
}
export interface POSummary {
    total_pos: number;
    draft_count: number;
    ordered_count: number;
    shipped_count: number;
    received_count: number;
    cancelled_count: number;
    overdue_count: number;
    total_value: number;
    average_lead_time?: number;
}
/**
 * Create a new purchase order (draft status)
 *
 * @param params - PO creation parameters
 * @returns Draft purchase order
 */
export declare function createPurchaseOrder(params: {
    po_number: string;
    vendor_id: string;
    vendor_name: string;
    sku: string;
    product_name: string;
    quantity: number;
    cost_per_unit: number;
    expected_lead_time_days?: number;
    notes?: string;
}): PurchaseOrder;
/**
 * Mark PO as ordered
 *
 * @param po - Purchase order
 * @param ordered_date - Date order was placed (defaults to now)
 * @param expected_delivery_date - Expected delivery date (optional, uses existing if not provided)
 * @returns Updated purchase order
 */
export declare function markPOAsOrdered(po: PurchaseOrder, ordered_date?: Date, expected_delivery_date?: Date): PurchaseOrder;
/**
 * Mark PO as shipped
 *
 * @param po - Purchase order
 * @param shipped_date - Date order was shipped (defaults to now)
 * @returns Updated purchase order
 */
export declare function markPOAsShipped(po: PurchaseOrder, shipped_date?: Date): PurchaseOrder;
/**
 * Mark PO as received
 *
 * @param po - Purchase order
 * @param received_date - Date order was received (defaults to now)
 * @returns Updated purchase order
 */
export declare function markPOAsReceived(po: PurchaseOrder, received_date?: Date): PurchaseOrder;
/**
 * Mark PO as cancelled
 *
 * @param po - Purchase order
 * @param notes - Cancellation reason (optional)
 * @returns Updated purchase order
 */
export declare function markPOAsCancelled(po: PurchaseOrder, notes?: string): PurchaseOrder;
/**
 * Get detailed tracking information for a PO
 *
 * @param po - Purchase order
 * @returns PO with tracking details
 */
export declare function getPOTrackingDetails(po: PurchaseOrder): POTrackingDetails;
/**
 * Get summary statistics for multiple POs
 *
 * @param pos - Array of purchase orders
 * @returns Summary statistics
 */
export declare function getPOSummary(pos: PurchaseOrder[]): POSummary;
/**
 * Get overdue POs (past expected delivery date)
 *
 * @param pos - Array of purchase orders
 * @returns Array of overdue POs with tracking details
 */
export declare function getOverduePOs(pos: PurchaseOrder[]): POTrackingDetails[];
/**
 * Get POs expected to arrive soon (within specified days)
 *
 * @param pos - Array of purchase orders
 * @param days - Number of days threshold (default: 7)
 * @returns Array of POs expected soon with tracking details
 */
export declare function getPOsExpectedSoon(pos: PurchaseOrder[], days?: number): POTrackingDetails[];
/**
 * Calculate lead time accuracy for vendor
 *
 * @param pos - Array of received purchase orders for a vendor
 * @returns Lead time accuracy metrics
 */
export declare function calculateLeadTimeAccuracy(pos: PurchaseOrder[]): {
    total_orders: number;
    on_time_count: number;
    early_count: number;
    late_count: number;
    accuracy_percentage: number;
    average_variance_days: number;
};
/**
 * Generate CSV export data for POs
 *
 * @param pos - Array of purchase orders
 * @returns CSV string
 */
export declare function exportPOsToCSV(pos: PurchaseOrder[]): string;
/**
 * Get purchase order tracking for a product (API helper for INVENTORY-006)
 *
 * In production: fetch from database by productId
 * For now: returns mock PO data
 *
 * @param productId - Product identifier
 * @returns Promise resolving to array of purchase orders
 */
export declare function getPOTracking(productId: string): Promise<Array<{
    po_number: string;
    status: POStatus;
    quantity: number;
    expected_delivery_date: string;
    days_until_expected?: number;
}>>;
//# sourceMappingURL=po-tracking.d.ts.map