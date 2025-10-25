/**
 * CSV Export Service for Inventory Management
 *
 * Generates CSV files for:
 * - Purchase orders (vendor ordering)
 * - Inventory snapshots (reporting)
 * - Picker payouts (compensation)
 */
export interface PurchaseOrderCSVRow {
    poNumber: string;
    vendorName: string;
    sku: string;
    productTitle: string;
    variantTitle: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    expectedDeliveryDate?: string;
}
export interface InventorySnapshotCSVRow {
    sku: string;
    productTitle: string;
    variantTitle: string;
    availableQuantity: number;
    onHandQuantity: number;
    committedQuantity: number;
    reorderPoint: number;
    status: string;
    avgDailySales: number;
    weeksOfSupply: number;
}
export interface PickerPayoutCSVRow {
    pickerId: string;
    pickerName: string;
    orderId: string;
    orderDate: string;
    totalPieces: number;
    payoutAmount: number;
    bracket: string;
}
/**
 * Export purchase order to CSV format
 *
 * @param rows - Purchase order line items
 * @returns CSV string
 */
export declare function exportPurchaseOrderCSV(rows: PurchaseOrderCSVRow[]): string;
/**
 * Export inventory snapshot to CSV format
 *
 * @param rows - Inventory snapshot rows
 * @returns CSV string
 */
export declare function exportInventorySnapshotCSV(rows: InventorySnapshotCSVRow[]): string;
/**
 * Export picker payouts to CSV format
 *
 * @param rows - Picker payout rows
 * @returns CSV string
 */
export declare function exportPickerPayoutCSV(rows: PickerPayoutCSVRow[]): string;
/**
 * Generate filename for CSV export
 *
 * @param type - Export type (po, inventory, payout)
 * @param identifier - Optional identifier (PO number, date, etc.)
 * @returns Filename string
 */
export declare function generateCSVFilename(type: "po" | "inventory" | "payout", identifier?: string): string;
/**
 * Prepare CSV file for download in browser
 *
 * @param csvContent - CSV content string
 * @param filename - Filename for download
 * @returns Blob URL for download
 */
export declare function prepareCSVDownload(csvContent: string, filename: string): {
    blob: Blob;
    filename: string;
};
//# sourceMappingURL=csv-export.d.ts.map