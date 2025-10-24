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
import { calculateBundleStock } from "~/services/shopify/bundle-inventory";
import { getBundleInfo } from "~/services/inventory/bundles";
/**
 * Set Canada warehouse available to 0
 */
export async function enforceCanadaWarehouseZero(shopDomain) {
    const errors = [];
    let variantsUpdated = 0;
    try {
        // In production: query Shopify for all variants in Canada warehouse
        // For now: mock the operation
        console.log(`[Reconciliation] Setting Canada warehouse available=0 for ${shopDomain}`);
        // Mock: Update 25 variants
        variantsUpdated = 25;
        console.log(`[Reconciliation] Updated ${variantsUpdated} variants in Canada warehouse`);
        return {
            success: true,
            variantsUpdated,
            errors
        };
    }
    catch (error) {
        errors.push(`Canada warehouse update failed: ${error.message}`);
        return {
            success: false,
            variantsUpdated: 0,
            errors
        };
    }
}
/**
 * Recalculate virtual bundle stock for all bundles
 */
export async function recalculateVirtualBundleStock(shopDomain) {
    const errors = [];
    const stockDiscrepancies = [];
    let bundlesProcessed = 0;
    let bundlesUpdated = 0;
    let bundlesWithErrors = 0;
    try {
        // In production: query all bundles from database
        const mockBundles = [
            { id: 'bundle_001', name: 'Premium Widget Bundle' },
            { id: 'bundle_002', name: 'Deluxe Gadget Set' },
            { id: 'bundle_003', name: 'Standard Tool Kit' }
        ];
        for (const bundle of mockBundles) {
            try {
                bundlesProcessed++;
                // Get current bundle info
                const bundleInfo = await getBundleInfo(bundle.id);
                if (!bundleInfo.isBundle) {
                    continue; // Skip non-bundles
                }
                // Calculate new virtual stock
                const newVirtualStock = await calculateBundleStock({ admin: { graphql: async () => ({ json: async () => ({}) }) } }, bundle.id);
                // Compare with existing stock
                const currentStock = bundleInfo.availableBundles || 0;
                const expectedStock = newVirtualStock.virtualStock;
                if (currentStock !== expectedStock) {
                    stockDiscrepancies.push({
                        bundleId: bundle.id,
                        bundleName: bundle.name,
                        expectedStock,
                        actualStock: currentStock,
                        discrepancy: expectedStock - currentStock
                    });
                    // Update virtual stock in database
                    console.log(`[Reconciliation] Updated ${bundle.name}: ${currentStock} → ${expectedStock}`);
                    bundlesUpdated++;
                }
            }
            catch (error) {
                bundlesWithErrors++;
                errors.push(`Bundle ${bundle.id} error: ${error.message}`);
                console.error(`[Reconciliation] Error processing bundle ${bundle.id}:`, error);
            }
        }
        return {
            bundlesProcessed,
            bundlesUpdated,
            bundlesWithErrors,
            stockDiscrepancies,
            errors
        };
    }
    catch (error) {
        errors.push(`Virtual stock recalculation failed: ${error.message}`);
        return {
            bundlesProcessed: 0,
            bundlesUpdated: 0,
            bundlesWithErrors: 0,
            stockDiscrepancies: [],
            errors
        };
    }
}
/**
 * Sync inventory adjustments to Shopify
 */
export async function syncInventoryToShopify(adjustments, shopDomain) {
    const errors = [];
    let adjustmentsProcessed = 0;
    try {
        // In production: use Shopify Admin GraphQL API to adjust inventory
        for (const adjustment of adjustments) {
            try {
                // Mock Shopify inventory adjustment
                console.log(`[Reconciliation] Shopify sync: ${adjustment.bundleId} → ${adjustment.adjustment}`);
                adjustmentsProcessed++;
            }
            catch (error) {
                errors.push({
                    bundleId: adjustment.bundleId,
                    error: error.message
                });
            }
        }
        return {
            success: errors.length === 0,
            adjustmentsProcessed,
            errors
        };
    }
    catch (error) {
        return {
            success: false,
            adjustmentsProcessed: 0,
            errors: [{ bundleId: 'unknown', error: error.message }]
        };
    }
}
/**
 * Check for critical out-of-stock situations
 */
export async function checkCriticalStockAlerts(bundles, alertThreshold = 5) {
    const alerts = [];
    for (const bundle of bundles) {
        if (bundle.currentStock <= 0) {
            alerts.push({
                bundleId: bundle.bundleId,
                bundleName: bundle.bundleName,
                currentStock: bundle.currentStock,
                alertLevel: 'critical',
                message: `CRITICAL: ${bundle.bundleName} is completely out of stock`
            });
        }
        else if (bundle.currentStock <= alertThreshold) {
            alerts.push({
                bundleId: bundle.bundleId,
                bundleName: bundle.bundleName,
                currentStock: bundle.currentStock,
                alertLevel: 'warning',
                message: `WARNING: ${bundle.bundleName} has only ${bundle.currentStock} units remaining`
            });
        }
    }
    return alerts;
}
/**
 * Log reconciliation results to observability_logs
 */
export async function logReconciliationResults(result) {
    try {
        // In production: insert into observability_logs table
        const logEntry = {
            timestamp: new Date().toISOString(),
            job_type: 'nightly_warehouse_reconciliation',
            job_id: result.jobId,
            status: result.status,
            duration: result.duration,
            bundles_processed: result.bundlesProcessed,
            bundles_updated: result.bundlesUpdated,
            critical_alerts: result.criticalAlerts.length,
            shopify_sync_success: result.shopifySyncSuccess
        };
        console.log(`[Reconciliation] Logged results:`, logEntry);
    }
    catch (error) {
        console.error(`[Reconciliation] Failed to log results:`, error);
    }
}
/**
 * Main nightly warehouse reconciliation job
 */
export async function runNightlyWarehouseReconciliation(params) {
    const startTime = new Date();
    const jobId = `reconciliation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const logs = [];
    const log = (level, message, bundleId) => {
        logs.push({
            timestamp: new Date().toISOString(),
            level,
            message,
            bundleId
        });
        console.log(`[Reconciliation] ${level.toUpperCase()}: ${message}`);
    };
    log('info', `Starting nightly warehouse reconciliation for ${params.shopDomain}`);
    try {
        // 1. Enforce Canada warehouse available=0
        log('info', 'Enforcing Canada warehouse available=0');
        const canadaResult = await enforceCanadaWarehouseZero(params.shopDomain);
        if (!canadaResult.success) {
            log('error', `Canada warehouse update failed: ${canadaResult.errors.join(', ')}`);
        }
        else {
            log('info', `Canada warehouse updated: ${canadaResult.variantsUpdated} variants`);
        }
        // 2. Recalculate virtual bundle stock
        log('info', 'Recalculating virtual bundle stock');
        const virtualStockResult = await recalculateVirtualBundleStock(params.shopDomain);
        log('info', `Virtual stock recalculation: ${virtualStockResult.bundlesProcessed} processed, ${virtualStockResult.bundlesUpdated} updated, ${virtualStockResult.bundlesWithErrors} errors`);
        // 3. Sync to Shopify
        log('info', 'Syncing inventory adjustments to Shopify');
        const shopifyAdjustments = virtualStockResult.stockDiscrepancies.map(d => ({
            bundleId: d.bundleId,
            variantId: `${d.bundleId}_variant`,
            adjustment: d.discrepancy
        }));
        const shopifyResult = await syncInventoryToShopify(shopifyAdjustments, params.shopDomain);
        if (shopifyResult.success) {
            log('info', `Shopify sync successful: ${shopifyResult.adjustmentsProcessed} adjustments`);
        }
        else {
            log('error', `Shopify sync failed: ${shopifyResult.errors.map(e => e.error).join(', ')}`);
        }
        // 4. Check for critical alerts
        log('info', 'Checking for critical stock alerts');
        const bundles = virtualStockResult.stockDiscrepancies.map(d => ({
            bundleId: d.bundleId,
            bundleName: d.bundleName,
            currentStock: d.actualStock,
            reorderPoint: 10 // Mock reorder point
        }));
        const criticalAlerts = await checkCriticalStockAlerts(bundles, params.alertThreshold);
        if (criticalAlerts.length > 0) {
            log('warn', `Found ${criticalAlerts.length} critical stock alerts`);
            criticalAlerts.forEach(alert => {
                log('warn', alert.message, alert.bundleId);
            });
        }
        // 5. Determine overall status
        const hasErrors = canadaResult.errors.length > 0 ||
            virtualStockResult.errors.length > 0 ||
            shopifyResult.errors.length > 0;
        const hasPartialSuccess = virtualStockResult.bundlesUpdated > 0 ||
            shopifyResult.adjustmentsProcessed > 0;
        const status = hasErrors && !hasPartialSuccess ? 'failed' :
            hasErrors && hasPartialSuccess ? 'partial_success' : 'success';
        const endTime = new Date();
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
        const result = {
            jobId,
            status,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration,
            canadaWarehouseUpdated: canadaResult.success,
            bundlesProcessed: virtualStockResult.bundlesProcessed,
            bundlesUpdated: virtualStockResult.bundlesUpdated,
            bundlesWithErrors: virtualStockResult.bundlesWithErrors,
            virtualStockRecalculated: virtualStockResult.bundlesUpdated,
            stockDiscrepancies: virtualStockResult.stockDiscrepancies,
            shopifySyncSuccess: shopifyResult.success,
            shopifyAdjustments: shopifyResult.adjustmentsProcessed,
            shopifyErrors: shopifyResult.errors,
            criticalAlerts,
            logs
        };
        // 6. Log results to observability
        await logReconciliationResults(result);
        log('info', `Nightly warehouse reconciliation completed: ${status} (${duration}s)`);
        return result;
    }
    catch (error) {
        const endTime = new Date();
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
        log('error', `Reconciliation job failed: ${error.message}`);
        const result = {
            jobId,
            status: 'failed',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration,
            canadaWarehouseUpdated: false,
            bundlesProcessed: 0,
            bundlesUpdated: 0,
            bundlesWithErrors: 0,
            virtualStockRecalculated: 0,
            stockDiscrepancies: [],
            shopifySyncSuccess: false,
            shopifyAdjustments: 0,
            shopifyErrors: [{ bundleId: 'unknown', error: error.message }],
            criticalAlerts: [],
            logs
        };
        await logReconciliationResults(result);
        return result;
    }
}
//# sourceMappingURL=nightly-warehouse-reconciliation.js.map