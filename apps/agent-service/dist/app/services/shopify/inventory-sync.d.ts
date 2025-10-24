export interface ShopifyInventoryLevel {
    id: string;
    quantities: {
        name: string;
        quantity: number;
    }[];
    item: {
        id: string;
        sku: string;
    };
    location: {
        id: string;
        name: string;
    };
}
export interface ShopifyProductVariant {
    id: string;
    title: string;
    sku: string;
    inventoryItem: {
        id: string;
        tracked: boolean;
    };
    product: {
        id: string;
        title: string;
    };
}
export interface ShopifyInventorySyncResult {
    success: boolean;
    syncedItems: number;
    errors: string[];
    updatedAt: Date;
}
/**
 * Sync inventory levels from Shopify to local database
 * Uses Shopify GraphQL Admin API for real-time inventory data
 */
export declare function syncInventoryFromShopify(shopifyClient: any, locationId?: string): Promise<ShopifyInventorySyncResult>;
/**
 * Update Shopify inventory levels using GraphQL mutations
 */
export declare function updateShopifyInventory(shopifyClient: any, inventoryUpdates: {
    inventoryItemId: string;
    locationId: string;
    quantity: number;
    reason?: string;
}[]): Promise<ShopifyInventorySyncResult>;
/**
 * Get product variants with inventory information from Shopify
 */
export declare function getShopifyProductVariants(shopifyClient: any, productIds?: string[]): Promise<ShopifyProductVariant[]>;
/**
 * Handle inventory webhook from Shopify
 */
export declare function handleInventoryWebhook(payload: any): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=inventory-sync.d.ts.map