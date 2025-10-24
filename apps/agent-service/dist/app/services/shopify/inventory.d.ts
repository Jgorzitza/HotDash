import type { InventoryAlertResult, ShopifyServiceContext } from "./types";
interface GetInventoryAlertsOptions {
    threshold?: number;
    first?: number;
    averageDailySales?: number;
}
export declare function getInventoryAlerts(context: ShopifyServiceContext, options?: GetInventoryAlertsOptions): Promise<InventoryAlertResult>;
/**
 * Get bundle and pack metadata from product tags
 * Identifies products with BUNDLE:TRUE or PACK:X tags
 */
export declare function getBundlePackMetadata(ctx: ShopifyServiceContext, options?: {
    limit?: number;
}): Promise<Array<{
    productId: string;
    title: string;
    isBundle: boolean;
    packSize: number | null;
    tags: string[];
    variants: Array<{
        id: string;
        title: string;
        sku: string;
        inventoryQuantity: number;
    }>;
}>>;
export {};
//# sourceMappingURL=inventory.d.ts.map