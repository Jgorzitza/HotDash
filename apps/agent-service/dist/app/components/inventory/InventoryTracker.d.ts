import React from 'react';
interface InventoryData {
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
interface InventoryAlert {
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
interface InventoryTrackerProps {
    variantIds: string[];
    autoRefresh?: boolean;
    refreshInterval?: number;
    onInventoryUpdate?: (data: InventoryData) => void;
    onAlert?: (alert: InventoryAlert) => void;
    onError?: (error: string) => void;
}
export declare const InventoryTracker: React.FC<InventoryTrackerProps>;
export default InventoryTracker;
//# sourceMappingURL=InventoryTracker.d.ts.map