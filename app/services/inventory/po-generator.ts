/**
 * PO (Purchase Order) Generation Service
 * 
 * Generates purchase orders from ROP calculations
 * Outputs: CSV format, email draft, structured data
 */

import type { ROPResult } from './rop';
import { recordDashboardFact } from '../facts.server';
import { toInputJson } from '../json';
import type { ShopifyServiceContext } from '../shopify/types';

export interface POLineItem {
  sku: string;
  productTitle: string;
  currentQuantity: number;
  rop: number;
  recommendedOrderQuantity: number;
  unitCost?: number;
  totalCost?: number;
  vendorSku?: string;
  leadTimeDays: number;
  expectedDeliveryDate: string;
}

export interface PurchaseOrder {
  poNumber: string;
  vendor?: string;
  generatedAt: string;
  expectedDeliveryDate: string;
  lineItems: POLineItem[];
  totalItems: number;
  totalQuantity: number;
  totalCost: number;
  notes?: string;
}

export interface POGenerationOptions {
  vendor?: string;
  orderMultiplier?: number; // Multiply recommended quantity (default: 1.0)
  minOrderQuantity?: number; // Minimum order quantity per SKU
  roundUpTo?: number; // Round up to nearest multiple (e.g., 10)
  includeUnitCosts?: boolean;
  notes?: string;
}

/**
 * Calculate recommended order quantity
 * 
 * Formula: (ROP - Current Quantity) × Order Multiplier
 * Then apply minimum order quantity and rounding
 */
function calculateOrderQuantity(
  rop: number,
  currentQuantity: number,
  options: POGenerationOptions = {}
): number {
  const {
    orderMultiplier = 1.0,
    minOrderQuantity = 1,
    roundUpTo,
  } = options;

  // Base quantity needed to reach ROP
  let quantity = Math.max(0, rop - currentQuantity);

  // Apply multiplier (e.g., 1.5x to build buffer)
  quantity = Math.ceil(quantity * orderMultiplier);

  // Apply minimum order quantity
  quantity = Math.max(quantity, minOrderQuantity);

  // Round up to nearest multiple if specified
  if (roundUpTo && roundUpTo > 1) {
    quantity = Math.ceil(quantity / roundUpTo) * roundUpTo;
  }

  return quantity;
}

/**
 * Calculate expected delivery date based on lead time
 */
function calculateExpectedDelivery(leadTimeDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + leadTimeDays);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Generate PO number
 * Format: PO-YYYYMMDD-HHMMSS
 */
function generatePONumber(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
  return `PO-${date}-${time}`;
}

/**
 * Generate purchase order from ROP results
 */
export function generatePO(
  ropResults: ROPResult[],
  options: POGenerationOptions = {}
): PurchaseOrder {
  const poNumber = generatePONumber();
  const generatedAt = new Date().toISOString();

  // Filter to only products that need reordering
  const needsReorder = ropResults.filter(r => r.shouldReorder);

  // Generate line items
  const lineItems: POLineItem[] = needsReorder.map(result => {
    const recommendedOrderQuantity = calculateOrderQuantity(
      result.rop,
      result.currentQuantity,
      options
    );

    const expectedDeliveryDate = calculateExpectedDelivery(result.leadTimeDays);

    const lineItem: POLineItem = {
      sku: result.sku,
      productTitle: `Product ${result.sku}`, // TODO: Get from Shopify
      currentQuantity: result.currentQuantity,
      rop: result.rop,
      recommendedOrderQuantity,
      leadTimeDays: result.leadTimeDays,
      expectedDeliveryDate,
    };

    return lineItem;
  });

  // Calculate totals
  const totalItems = lineItems.length;
  const totalQuantity = lineItems.reduce((sum, item) => sum + item.recommendedOrderQuantity, 0);
  const totalCost = lineItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);

  // Use earliest expected delivery date
  const expectedDeliveryDate = lineItems.length > 0
    ? lineItems.reduce((earliest, item) => 
        item.expectedDeliveryDate < earliest ? item.expectedDeliveryDate : earliest,
        lineItems[0].expectedDeliveryDate
      )
    : calculateExpectedDelivery(14); // Default 14 days

  return {
    poNumber,
    vendor: options.vendor,
    generatedAt,
    expectedDeliveryDate,
    lineItems,
    totalItems,
    totalQuantity,
    totalCost,
    notes: options.notes,
  };
}

/**
 * Convert PO to CSV format
 */
export function poToCSV(po: PurchaseOrder): string {
  const headers = [
    'SKU',
    'Product Title',
    'Current Quantity',
    'ROP',
    'Order Quantity',
    'Unit Cost',
    'Total Cost',
    'Vendor SKU',
    'Lead Time (Days)',
    'Expected Delivery',
  ];

  const rows = po.lineItems.map(item => [
    item.sku,
    item.productTitle,
    item.currentQuantity.toString(),
    item.rop.toString(),
    item.recommendedOrderQuantity.toString(),
    item.unitCost?.toFixed(2) || '',
    item.totalCost?.toFixed(2) || '',
    item.vendorSku || '',
    item.leadTimeDays.toString(),
    item.expectedDeliveryDate,
  ]);

  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Generate email draft for PO
 */
export function generatePOEmail(po: PurchaseOrder): {
  subject: string;
  body: string;
  attachmentName: string;
  attachmentContent: string;
} {
  const subject = `Purchase Order ${po.poNumber}${po.vendor ? ` - ${po.vendor}` : ''}`;

  const body = `
Hello,

Please find attached Purchase Order ${po.poNumber}.

Order Summary:
- Total Items: ${po.totalItems}
- Total Quantity: ${po.totalQuantity}
- Expected Delivery: ${po.expectedDeliveryDate}
${po.totalCost > 0 ? `- Total Cost: $${po.totalCost.toFixed(2)}` : ''}

${po.notes ? `\nNotes:\n${po.notes}\n` : ''}

Please confirm receipt and provide an estimated delivery date.

Thank you,
Hot Dash Inventory Management
  `.trim();

  return {
    subject,
    body,
    attachmentName: `${po.poNumber}.csv`,
    attachmentContent: poToCSV(po),
  };
}

/**
 * Generate PO and record to Supabase
 */
export async function generateAndRecordPO(
  context: ShopifyServiceContext,
  ropResults: ROPResult[],
  options: POGenerationOptions = {}
): Promise<PurchaseOrder> {
  const po = generatePO(ropResults, options);

  // Record to dashboard facts
  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: 'inventory.po.generated',
    scope: 'ops',
    value: toInputJson(po),
    metadata: toInputJson({
      poNumber: po.poNumber,
      vendor: po.vendor,
      totalItems: po.totalItems,
      totalQuantity: po.totalQuantity,
      generatedAt: po.generatedAt,
    }),
  });

  return po;
}

/**
 * Get PO summary statistics
 */
export function getPOSummary(po: PurchaseOrder): {
  totalItems: number;
  totalQuantity: number;
  totalCost: number;
  urgentItems: number;
  averageLeadTime: number;
} {
  const urgentItems = po.lineItems.filter(item => 
    item.currentQuantity === 0 || item.currentQuantity <= item.rop * 0.5
  ).length;

  const averageLeadTime = po.lineItems.length > 0
    ? po.lineItems.reduce((sum, item) => sum + item.leadTimeDays, 0) / po.lineItems.length
    : 0;

  return {
    totalItems: po.totalItems,
    totalQuantity: po.totalQuantity,
    totalCost: po.totalCost,
    urgentItems,
    averageLeadTime: Number(averageLeadTime.toFixed(1)),
  };
}

