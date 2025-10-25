export interface InventoryItem {
    id: string;
    variantId: string;
    sku: string;
    productName: string;
    currentStock: number;
    reorderPoint: number;
    reorderQuantity: number;
    averageLandedCost: number;
    lastUpdated: Date;
}
export interface VendorMetrics {
    id: string;
    name: string;
    reliabilityScore: number;
    totalOrders: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
    averageLeadTime: number;
    isActive: boolean;
}
export interface ReorderRecommendation {
    variantId: string;
    sku: string;
    productName: string;
    currentStock: number;
    reorderPoint: number;
    recommendedQuantity: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    estimatedLeadTime: number;
    bestVendor: VendorMetrics | null;
}
export interface InventoryAlert {
    id: string;
    type: 'low_stock' | 'out_of_stock' | 'overstock' | 'reorder_needed';
    variantId: string;
    sku: string;
    productName: string;
    currentStock: number;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    createdAt: Date;
}
export declare class InventoryManagementService {
    /**
     * Get current inventory levels for all products
     */
    getInventoryLevels(): Promise<InventoryItem[]>;
    /**
     * Get vendor performance metrics
     */
    getVendorMetrics(): Promise<VendorMetrics[]>;
    /**
     * Generate reorder recommendations based on current stock levels
     */
    generateReorderRecommendations(): Promise<ReorderRecommendation[]>;
    /**
     * Generate inventory alerts for low stock, out of stock, etc.
     */
    generateInventoryAlerts(): Promise<InventoryAlert[]>;
    /**
     * Find the best vendor for a product based on reliability and performance
     */
    private findBestVendor;
    /**
     * Calculate urgency level based on current stock vs reorder point
     */
    private calculateUrgency;
    /**
     * Generate inventory reports
     */
    generateInventoryReport(): Promise<{
        totalProducts: number;
        lowStockItems: number;
        outOfStockItems: number;
        totalValue: number;
        reorderRecommendations: number;
        alerts: number;
    }>;
    /**
     * Sync inventory with Shopify using GraphQL Admin API
     * This method uses Shopify Dev MCP patterns for real-time inventory data
     */
    syncWithShopify(shopifyClient: any, locationId?: string): Promise<{
        success: boolean;
        syncedItems: number;
        errors: string[];
    }>;
    /**
     * Update Shopify inventory levels using GraphQL mutations
     * Uses Shopify Dev MCP patterns for inventory management
     */
    updateShopifyInventory(shopifyClient: any, updates: {
        inventoryItemId: string;
        locationId: string;
        quantity: number;
    }[]): Promise<{
        success: boolean;
        syncedItems: number;
        errors: string[];
    }>;
}
//# sourceMappingURL=inventory-management.d.ts.map