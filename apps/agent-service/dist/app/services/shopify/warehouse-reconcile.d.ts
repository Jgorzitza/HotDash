/**
 * Shopify Warehouse Reconciliation Service
 *
 * Nightly sync to reset Canada WH negative inventory and adjust Main WH
 * Main WH = primary inventory
 * Canada WH = used for label printing, goes negative
 * Solution: Nightly reset Canada → 0, adjust Main by offset
 */
import type { ShopifyServiceContext } from "./types";
export interface ReconciliationResult {
    variantId: string;
    inventoryItemId: string;
    canadaNegativeQty: number;
    mainPreviousQty: number;
    canadaNewQty: number;
    mainNewQty: number;
    adjusted: boolean;
    error?: string;
}
/**
 * Nightly reconciliation - main function
 * Run daily at 02:00 America/Los_Angeles
 */
export declare function runNightlyWarehouseReconciliation(context: ShopifyServiceContext): Promise<{
    totalReconciled: number;
    results: ReconciliationResult[];
    errors: string[];
}>;
//# sourceMappingURL=warehouse-reconcile.d.ts.map