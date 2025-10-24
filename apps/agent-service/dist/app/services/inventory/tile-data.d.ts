/**
 * Inventory Tile Data Service (INVENTORY-007)
 *
 * Calculates real-time inventory status for dashboard tile display:
 * - Status buckets (inStock, lowStock, outOfStock, urgentReorder)
 * - Top risk products (SKUs approaching stockout)
 * - Days until stockout calculations
 * - Integration with ROP and forecasting services
 *
 * Context7: /microsoft/typescript - async/Promise types
 * Context7: /websites/reactrouter - API patterns
 */
export interface InventoryTileData {
    statusBuckets: {
        inStock: number;
        lowStock: number;
        outOfStock: number;
        urgentReorder: number;
    };
    topRisks: Array<{
        productId: string;
        productName: string;
        currentStock: number;
        rop: number;
        daysUntilStockout: number;
        status: "urgent_reorder" | "low_stock" | "out_of_stock";
    }>;
    lastUpdated: string;
}
/**
 * Get real-time inventory tile data
 *
 * Calculates status buckets and top risks across all products.
 * Used by Inventory Risk tile on dashboard.
 *
 * INVENTORY-007: Real-Time Inventory Tile Data
 *
 * @returns Promise resolving to inventory tile data
 */
export declare function getInventoryTileData(): Promise<InventoryTileData>;
//# sourceMappingURL=tile-data.d.ts.map