import { Server as SocketIOServer } from "socket.io";
export interface InventoryUpdate {
    variantId: string;
    sku: string;
    productName: string;
    previousStock: number;
    newStock: number;
    changeType: 'increase' | 'decrease' | 'adjustment';
    changeAmount: number;
    reason: string;
    timestamp: Date;
    userId?: string;
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
    createdAt: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
}
export interface RealtimeInventoryData {
    variantId: string;
    sku: string;
    productName: string;
    currentStock: number;
    availableStock: number;
    committedStock: number;
    incomingStock: number;
    averageLandedCost: number;
    lastUpdated: Date;
    location: string;
}
export interface InventoryTrackingConfig {
    lowStockThreshold: number;
    reorderPoint: number;
    overstockThreshold: number;
    alertFrequency: number;
    enableRealtimeUpdates: boolean;
    enableAlerts: boolean;
}
export declare class InventoryTrackingService {
    private io;
    private config;
    constructor(io: SocketIOServer, config: InventoryTrackingConfig);
    /**
     * Setup Socket.IO event handlers for real-time inventory tracking
     */
    private setupSocketHandlers;
    /**
     * Track inventory changes and broadcast real-time updates
     */
    trackInventoryChange(update: InventoryUpdate): Promise<void>;
    /**
     * Get real-time inventory data for a specific variant
     */
    getRealtimeInventoryData(variantId: string): Promise<RealtimeInventoryData>;
    /**
     * Get real-time inventory data for multiple variants
     */
    getBulkRealtimeInventoryData(variantIds: string[]): Promise<RealtimeInventoryData[]>;
    /**
     * Check for inventory alerts and create them if needed
     */
    checkAndCreateAlerts(variantId: string, currentStock: number): Promise<void>;
    /**
     * Get active alerts for a variant
     */
    getActiveAlerts(variantId?: string): Promise<InventoryAlert[]>;
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void>;
    /**
     * Get inventory change history for a variant
     */
    getInventoryChangeHistory(variantId: string, limit?: number): Promise<InventoryUpdate[]>;
    /**
     * Update tracking configuration
     */
    updateTrackingConfig(newConfig: Partial<InventoryTrackingConfig>): Promise<void>;
}
//# sourceMappingURL=inventory-tracking.d.ts.map