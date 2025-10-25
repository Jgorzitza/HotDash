/**
 * Shopify Bundle Inventory Service
 *
 * Calculate virtual bundle stock based on BOM component availability
 * Decrement component inventory when bundle is sold
 */
import type { ShopifyServiceContext } from "./types";
export interface ComponentAvailability {
    handle: string;
    available: number;
    required: number;
    possibleBundles: number;
}
export interface BundleStockResult {
    virtualStock: number;
    componentAvailability: ComponentAvailability[];
    limitingComponent?: ComponentAvailability;
}
/**
 * Calculate virtual bundle stock based on BOM components
 *
 * @param context Shopify service context
 * @param productId Bundle product GID
 * @returns BundleStockResult with virtual stock and component availability
 */
export declare function calculateBundleStock(context: ShopifyServiceContext, productId: string): Promise<BundleStockResult>;
/**
 * Decrement component inventory when bundle is sold
 *
 * @param context Shopify service context
 * @param productId Bundle product GID
 * @param qtySold Quantity of bundles sold
 * @returns Success status and any errors
 */
export declare function decrementBundleComponents(context: ShopifyServiceContext, productId: string, qtySold: number): Promise<{
    success: boolean;
    adjustments: number;
    errors: string[];
}>;
/**
 * Fallback: Calculate bundle stock from PACK:X tags (legacy method)
 * Used when BOM metafields are not available
 */
export declare function calculateBundleStockFromTags(context: ShopifyServiceContext, productId: string): Promise<number>;
//# sourceMappingURL=bundle-inventory.d.ts.map