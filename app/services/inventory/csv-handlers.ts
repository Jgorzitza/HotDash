/**
 * CSV Import/Export Handlers
 * 
 * Handles CSV import for backorders and export for inventory reports
 * Supports batch operations and validation
 */

import type { ROPResult } from './rop';
import type { StockAlert } from './alerts';

export interface BackorderImport {
  sku: string;
  quantity: number;
  customerName?: string;
  orderNumber?: string;
  expectedDate?: string;
  notes?: string;
}

export interface InventoryExport {
  sku: string;
  productTitle: string;
  currentQuantity: number;
  rop: number;
  statusBucket: string;
  daysOfCover: number | null;
  weeksOfStock: number | null;
  averageDailySales: number;
  leadTimeDays: number;
  safetyStock: number;
}

export interface CSVParseResult<T> {
  data: T[];
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

/**
 * Parse CSV string to array of objects
 */
function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.trim().split('\n');
  const rows: string[][] = [];

  for (const line of lines) {
    // Simple CSV parsing (doesn't handle quoted commas)
    const row = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
    rows.push(row);
  }

  return rows;
}

/**
 * Parse backorder CSV import
 */
export function parseBackorderCSV(csvContent: string): CSVParseResult<BackorderImport> {
  const rows = parseCSV(csvContent);
  const data: BackorderImport[] = [];
  const errors: CSVParseResult<BackorderImport>['errors'] = [];
  const warnings: CSVParseResult<BackorderImport>['warnings'] = [];

  if (rows.length === 0) {
    errors.push({ row: 0, field: 'file', message: 'CSV file is empty' });
    return { data, errors, warnings };
  }

  // Expected headers: SKU, Quantity, Customer Name, Order Number, Expected Date, Notes
  const headers = rows[0].map(h => h.toLowerCase());
  const skuIndex = headers.indexOf('sku');
  const qtyIndex = headers.indexOf('quantity');
  const customerIndex = headers.indexOf('customer name');
  const orderIndex = headers.indexOf('order number');
  const dateIndex = headers.indexOf('expected date');
  const notesIndex = headers.indexOf('notes');

  if (skuIndex === -1) {
    errors.push({ row: 0, field: 'headers', message: 'Missing required column: SKU' });
  }
  if (qtyIndex === -1) {
    errors.push({ row: 0, field: 'headers', message: 'Missing required column: Quantity' });
  }

  if (errors.length > 0) {
    return { data, errors, warnings };
  }

  // Parse data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    if (row.length === 0 || row.every(cell => !cell)) {
      continue; // Skip empty rows
    }

    const sku = row[skuIndex];
    const quantityStr = row[qtyIndex];

    if (!sku) {
      errors.push({ row: rowNum, field: 'sku', message: 'SKU is required' });
      continue;
    }

    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push({ row: rowNum, field: 'quantity', message: 'Quantity must be a positive number' });
      continue;
    }

    const backorder: BackorderImport = {
      sku,
      quantity,
      customerName: customerIndex >= 0 ? row[customerIndex] : undefined,
      orderNumber: orderIndex >= 0 ? row[orderIndex] : undefined,
      expectedDate: dateIndex >= 0 ? row[dateIndex] : undefined,
      notes: notesIndex >= 0 ? row[notesIndex] : undefined,
    };

    // Validate expected date format if provided
    if (backorder.expectedDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(backorder.expectedDate)) {
        warnings.push({
          row: rowNum,
          field: 'expectedDate',
          message: 'Expected date should be in YYYY-MM-DD format',
        });
      }
    }

    data.push(backorder);
  }

  return { data, errors, warnings };
}

/**
 * Export inventory to CSV
 */
export function exportInventoryToCSV(
  ropResults: ROPResult[],
  productTitles?: Map<string, string>
): string {
  const headers = [
    'SKU',
    'Product Title',
    'Current Quantity',
    'ROP',
    'Status Bucket',
    'Days of Cover',
    'Weeks of Stock',
    'Avg Daily Sales',
    'Lead Time (Days)',
    'Safety Stock',
  ];

  const rows = ropResults.map(result => {
    const title = productTitles?.get(result.sku) || result.sku;
    return [
      result.sku,
      title,
      result.currentQuantity.toString(),
      result.rop.toString(),
      result.statusBucket,
      result.daysOfCover?.toFixed(1) || 'N/A',
      result.weeksOfStock?.toFixed(2) || 'N/A',
      result.averageDailySales.toFixed(2),
      result.leadTimeDays.toString(),
      result.safetyStock.toString(),
    ];
  });

  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Export alerts to CSV
 */
export function exportAlertsToCSV(alerts: StockAlert[]): string {
  const headers = [
    'SKU',
    'Alert Type',
    'Severity',
    'Current Quantity',
    'ROP',
    'Days of Cover',
    'Weeks of Stock',
    'Message',
    'Generated At',
  ];

  const rows = alerts.map(alert => [
    alert.sku,
    alert.alertType,
    alert.severity,
    alert.currentQuantity.toString(),
    alert.rop.toString(),
    alert.daysOfCover?.toFixed(1) || 'N/A',
    alert.weeksOfStock?.toFixed(2) || 'N/A',
    alert.message,
    alert.generatedAt,
  ]);

  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Export backorders to CSV
 */
export function exportBackordersToCSV(backorders: BackorderImport[]): string {
  const headers = [
    'SKU',
    'Quantity',
    'Customer Name',
    'Order Number',
    'Expected Date',
    'Notes',
  ];

  const rows = backorders.map(bo => [
    bo.sku,
    bo.quantity.toString(),
    bo.customerName || '',
    bo.orderNumber || '',
    bo.expectedDate || '',
    bo.notes || '',
  ]);

  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Validate backorder import data
 */
export function validateBackorders(
  backorders: BackorderImport[],
  validSkus: Set<string>
): {
  valid: BackorderImport[];
  invalid: Array<{
    backorder: BackorderImport;
    reason: string;
  }>;
} {
  const valid: BackorderImport[] = [];
  const invalid: Array<{ backorder: BackorderImport; reason: string }> = [];

  for (const backorder of backorders) {
    if (!validSkus.has(backorder.sku)) {
      invalid.push({
        backorder,
        reason: `SKU ${backorder.sku} not found in inventory`,
      });
      continue;
    }

    if (backorder.quantity <= 0) {
      invalid.push({
        backorder,
        reason: 'Quantity must be positive',
      });
      continue;
    }

    valid.push(backorder);
  }

  return { valid, invalid };
}

/**
 * Generate CSV download response headers
 */
export function getCSVDownloadHeaders(filename: string): Record<string, string> {
  return {
    'Content-Type': 'text/csv',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-cache',
  };
}

/**
 * Parse CSV file from FormData
 */
export async function parseCSVFromFormData(
  formData: FormData,
  fieldName: string = 'file'
): Promise<string> {
  const file = formData.get(fieldName);

  if (!file || !(file instanceof File)) {
    throw new Error('No file provided');
  }

  if (!file.name.endsWith('.csv')) {
    throw new Error('File must be a CSV');
  }

  return await file.text();
}

/**
 * Get CSV import summary
 */
export function getImportSummary<T>(result: CSVParseResult<T>): {
  totalRows: number;
  successfulRows: number;
  errorRows: number;
  warningRows: number;
  successRate: number;
} {
  const totalRows = result.data.length + result.errors.length;
  const successfulRows = result.data.length;
  const errorRows = result.errors.length;
  const warningRows = result.warnings.length;
  const successRate = totalRows > 0 ? (successfulRows / totalRows) * 100 : 0;

  return {
    totalRows,
    successfulRows,
    errorRows,
    warningRows,
    successRate: Number(successRate.toFixed(1)),
  };
}

