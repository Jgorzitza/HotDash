/**
 * Purchase Order Generator
 * Re-export from scripts/inventory/generate-po.mjs
 * Manager-specified path: app/lib/inventory/po-generator.ts
 */

// Note: PO generation script at scripts/inventory/generate-po.mjs
// This module provides TypeScript-compatible functions

export interface POItem {
  sku: string | null;
  productTitle: string;
  variantTitle: string;
  currentQty: number;
  reorderPoint: number;
  safetyStock: number;
  orderQuantity: number;
  supplier?: string;
  unitCost?: number;
  priority?: "low" | "medium" | "high" | "critical";
}

export function generatePOItems(items: Array<{
  sku: string | null;
  productTitle: string;
  variantTitle: string;
  quantity: number;
  reorderPoint: number;
  safetyStock: number;
}>): POItem[] {
  return items
    .filter(item => item.quantity <= item.reorderPoint)
    .map(item => ({
      sku: item.sku,
      productTitle: item.productTitle,
      variantTitle: item.variantTitle,
      currentQty: item.quantity,
      reorderPoint: item.reorderPoint,
      safetyStock: item.safetyStock,
      orderQuantity: Math.max(0, (item.reorderPoint + item.safetyStock) - item.quantity),
      priority: item.quantity <= item.safetyStock ? "critical" : "high",
    }));
}
