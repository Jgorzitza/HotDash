/**
 * Nightly Warehouse Reconciliation Job (INVENTORY-102)
 *
 * Nightly job that:
 * - Enforces Canada warehouse available=0
 * - Recomputes virtual bundle stock for all bundles
 * - Syncs to Shopify via inventoryAdjust mutation
 * - Logs discrepancies to observability_logs
 * - Sends alerts if critical OOS detected
 *
 * Context7: /microsoft/typescript - advanced type patterns
 * Context7: /websites/reactrouter - API patterns
 */
export interface ReconciliationJobParams {
    shopDomain: string;
    forceReconciliation?: boolean;
    dryRun?: boolean;
    alertThreshold?: number;
}
export interface ReconciliationJobResult {
    jobId: string;
    status: 'success' | 'partial_success' | 'failed';
    startTime: string;
    endTime: string;
    duration: number;
    canadaWarehouseUpdated: boolean;
    bundlesProcessed: number;
    bundlesUpdated: number;
    bundlesWithErrors: number;
    virtualStockRecalculated: number;
    stockDiscrepancies: Array<{
        bundleId: string;
        bundleName: string;
        expectedStock: number;
        actualStock: number;
        discrepancy: number;
    }>;
    shopifySyncSuccess: boolean;
    shopifyAdjustments: number;
    shopifyErrors: Array<{
        bundleId: string;
        error: string;
    }>;
    criticalAlerts: Array<{
        bundleId: string;
        bundleName: string;
        currentStock: number;
        alertLevel: 'critical' | 'warning';
        message: string;
    }>;
    logs: Array<{
        timestamp: string;
        level: 'info' | 'warn' | 'error';
        message: string;
        bundleId?: string;
    }>;
}
/**
 * Set Canada warehouse available to 0
 */
export declare function enforceCanadaWarehouseZero(shopDomain: string): Promise<{
    success: boolean;
    variantsUpdated: number;
    errors: string[];
}>;
/**
 * Recalculate virtual bundle stock for all bundles
 */
export declare function recalculateVirtualBundleStock(shopDomain: string): Promise<{
    bundlesProcessed: number;
    bundlesUpdated: number;
    bundlesWithErrors: number;
    stockDiscrepancies: ReconciliationJobResult['stockDiscrepancies'];
    errors: string[];
}>;
/**
 * Sync inventory adjustments to Shopify
 */
export declare function syncInventoryToShopify(adjustments: Array<{
    bundleId: string;
    variantId: string;
    adjustment: number;
}>, shopDomain: string): Promise<{
    success: boolean;
    adjustmentsProcessed: number;
    errors: Array<{
        bundleId: string;
        error: string;
    }>;
}>;
/**
 * Check for critical out-of-stock situations
 */
export declare function checkCriticalStockAlerts(bundles: Array<{
    bundleId: string;
    bundleName: string;
    currentStock: number;
    reorderPoint: number;
}>, alertThreshold?: number): Promise<Array<{
    bundleId: string;
    bundleName: string;
    currentStock: number;
    alertLevel: 'critical' | 'warning';
    message: string;
}>>;
/**
 * Log reconciliation results to observability_logs
 */
export declare function logReconciliationResults(result: ReconciliationJobResult): Promise<void>;
/**
 * Main nightly warehouse reconciliation job
 */
export declare function runNightlyWarehouseReconciliation(params: ReconciliationJobParams): Promise<ReconciliationJobResult>;
//# sourceMappingURL=nightly-warehouse-reconciliation.d.ts.map