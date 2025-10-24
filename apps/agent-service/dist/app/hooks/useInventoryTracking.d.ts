export interface InventoryData {
    variantId: string;
    sku: string;
    productName: string;
    currentStock: number;
    availableStock: number;
    committedStock: number;
    incomingStock: number;
    averageLandedCost: number;
    lastUpdated: string;
    location: string;
}
export interface InventoryAlert {
    id: string;
    variantId: string;
    sku: string;
    productName: string;
    alertType: 'low_stock' | 'out_of_stock' | 'overstock' | 'reorder_point' | 'negative_stock';
    currentStock: number;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    createdAt: string;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
}
export interface InventoryUpdate {
    variantId: string;
    sku: string;
    productName: string;
    previousStock: number;
    newStock: number;
    changeType: 'increase' | 'decrease' | 'adjustment';
    changeAmount: number;
    reason: string;
    timestamp: string;
    userId?: string;
}
export interface UseInventoryTrackingOptions {
    variantIds: string[];
    autoConnect?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
    onInventoryUpdate?: (data: InventoryData) => void;
    onAlert?: (alert: InventoryAlert) => void;
    onError?: (error: string) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
}
export interface UseInventoryTrackingReturn {
    isConnected: boolean;
    isConnecting: boolean;
    lastUpdate: Date | null;
    inventoryData: InventoryData[];
    alerts: InventoryAlert[];
    connect: () => void;
    disconnect: () => void;
    refreshInventory: (variantIds?: string[]) => Promise<void>;
    updateInventory: (variantId: string, newStock: number, reason: string) => Promise<void>;
    acknowledgeAlert: (alertId: string, userId: string) => Promise<void>;
    getInventoryData: (variantId: string) => InventoryData | undefined;
    getVariantAlerts: (variantId: string) => InventoryAlert[];
    getCriticalAlerts: () => InventoryAlert[];
    getUnacknowledgedAlerts: () => InventoryAlert[];
    subscribeToVariant: (variantId: string) => void;
    unsubscribeFromVariant: (variantId: string) => void;
}
export declare const useInventoryTracking: (options: UseInventoryTrackingOptions) => UseInventoryTrackingReturn;
//# sourceMappingURL=useInventoryTracking.d.ts.map