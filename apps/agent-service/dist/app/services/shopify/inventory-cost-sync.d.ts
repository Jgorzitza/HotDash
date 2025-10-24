/**
 * Shopify Inventory Cost Sync Service
 *
 * Updates Shopify inventoryItem.unitCost via GraphQL mutation
 * Called from Inventory receiving workflow after ALC calculation
 */
import type { ShopifyServiceContext } from "./types";
export interface CostSyncResult {
    success: boolean;
    variantId: string;
    previousCost?: number;
    newCost: number;
    shopifyInventoryItemId?: string;
    updatedAt?: string;
    error?: string;
}
/**
 * Update inventory item cost
 *
 * @param context Shopify service context with authenticated admin client
 * @param variantId Shopify variant GID (e.g., "gid://shopify/ProductVariant/123")
 * @param newCost New unit cost in shop's default currency
 * @returns CostSyncResult with success status and details
 */
export declare function syncInventoryCostToShopify(context: ShopifyServiceContext, variantId: string, newCost: number): Promise<CostSyncResult>;
/**
 * Batch update for multiple variants (from single PO receipt)
 *
 * @param context Shopify service context
 * @param updates Array of { variantId, newCost } objects
 * @returns Array of CostSyncResult objects
 */
export declare function syncMultipleInventoryCosts(context: ShopifyServiceContext, updates: Array<{
    variantId: string;
    newCost: number;
}>): Promise<CostSyncResult[]>;
//# sourceMappingURL=inventory-cost-sync.d.ts.map