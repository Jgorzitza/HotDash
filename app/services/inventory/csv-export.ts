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
 * Convert array of objects to CSV string
 * 
 * @param data - Array of data objects
 * @param headers - Column headers (object keys to include)
 * @returns CSV formatted string
 */
function arrayToCSV<T extends Record<string, string | number | boolean | null | undefined>>(
  data: T[],
  headers: Array<keyof T>,
): string {
  if (data.length === 0) {
    return headers.join(",") + "\n";
  }

  // Header row
  const headerRow = headers.join(",");

  // Data rows
  const dataRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header];

        // Handle null/undefined
        if (value === null || value === undefined) {
          return "";
        }

        // Escape values containing commas, quotes, or newlines
        const stringValue = String(value);
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Export purchase order to CSV format
 *
 * @param rows - Purchase order line items
 * @returns CSV string
 */
export function exportPurchaseOrderCSV(rows: PurchaseOrderCSVRow[]): string {
  const headers: Array<keyof PurchaseOrderCSVRow> = [
    "poNumber",
    "vendorName",
    "sku",
    "productTitle",
    "variantTitle",
    "quantity",
    "unitCost",
    "totalCost",
    "expectedDeliveryDate",
  ];

  return arrayToCSV(rows, headers);
}

/**
 * Export inventory snapshot to CSV format
 *
 * @param rows - Inventory snapshot rows
 * @returns CSV string
 */
export function exportInventorySnapshotCSV(
  rows: InventorySnapshotCSVRow[],
): string {
  const headers: Array<keyof InventorySnapshotCSVRow> = [
    "sku",
    "productTitle",
    "variantTitle",
    "availableQuantity",
    "onHandQuantity",
    "committedQuantity",
    "reorderPoint",
    "status",
    "avgDailySales",
    "weeksOfSupply",
  ];

  return arrayToCSV(rows, headers);
}

/**
 * Export picker payouts to CSV format
 *
 * @param rows - Picker payout rows
 * @returns CSV string
 */
export function exportPickerPayoutCSV(rows: PickerPayoutCSVRow[]): string {
  const headers: Array<keyof PickerPayoutCSVRow> = [
    "pickerId",
    "pickerName",
    "orderId",
    "orderDate",
    "totalPieces",
    "payoutAmount",
    "bracket",
  ];

  return arrayToCSV(rows, headers);
}

/**
 * Generate filename for CSV export
 *
 * @param type - Export type (po, inventory, payout)
 * @param identifier - Optional identifier (PO number, date, etc.)
 * @returns Filename string
 */
export function generateCSVFilename(
  type: "po" | "inventory" | "payout",
  identifier?: string,
): string {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const prefix =
    type === "po"
      ? "purchase_order"
      : type === "inventory"
        ? "inventory_snapshot"
        : "picker_payout";

  if (identifier) {
    return `${prefix}_${identifier}_${timestamp}.csv`;
  }

  return `${prefix}_${timestamp}.csv`;
}

/**
 * Prepare CSV file for download in browser
 *
 * @param csvContent - CSV content string
 * @param filename - Filename for download
 * @returns Blob URL for download
 */
export function prepareCSVDownload(
  csvContent: string,
  filename: string,
): {
  blob: Blob;
  filename: string;
} {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  return {
    blob,
    filename,
  };
}
