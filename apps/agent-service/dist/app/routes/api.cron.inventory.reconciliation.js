/**
 * API Route: Nightly Warehouse Reconciliation Cron Job
 *
 * POST /api/cron/inventory/reconciliation
 *
 * Nightly cron job that:
 * - Enforces Canada warehouse available=0
 * - Recomputes virtual bundle stock for all bundles
 * - Syncs to Shopify via inventoryAdjust mutation
 * - Logs discrepancies to observability_logs
 * - Sends alerts if critical OOS detected
 *
 * Context7: /websites/reactrouter - action patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-102: Nightly Warehouse Reconciliation Job
 */
import { runNightlyWarehouseReconciliation } from "~/services/jobs/nightly-warehouse-reconciliation";
export async function action({ request }) {
    try {
        // Verify this is a legitimate cron request
        const authHeader = request.headers.get('authorization');
        const expectedAuth = process.env.CRON_SECRET || 'default-cron-secret';
        if (authHeader !== `Bearer ${expectedAuth}`) {
            return Response.json({
                success: false,
                error: "Unauthorized cron request",
            }, { status: 401 });
        }
        const body = await request.json();
        const { shopDomain = 'hotrodan.myshopify.com', forceReconciliation = false, dryRun = false, alertThreshold = 5 } = body;
        // Run the nightly warehouse reconciliation
        const result = await runNightlyWarehouseReconciliation({
            shopDomain,
            forceReconciliation,
            dryRun,
            alertThreshold
        });
        // Return appropriate response based on status
        const statusCode = result.status === 'success' ? 200 :
            result.status === 'partial_success' ? 207 : 500;
        return Response.json({
            success: result.status === 'success',
            data: {
                jobId: result.jobId,
                status: result.status,
                duration: result.duration,
                summary: {
                    canadaWarehouseUpdated: result.canadaWarehouseUpdated,
                    bundlesProcessed: result.bundlesProcessed,
                    bundlesUpdated: result.bundlesUpdated,
                    bundlesWithErrors: result.bundlesWithErrors,
                    virtualStockRecalculated: result.virtualStockRecalculated,
                    shopifySyncSuccess: result.shopifySyncSuccess,
                    shopifyAdjustments: result.shopifyAdjustments,
                    criticalAlerts: result.criticalAlerts.length
                },
                alerts: result.criticalAlerts,
                errors: result.shopifyErrors,
                logs: result.logs.slice(-10) // Last 10 log entries
            },
            metadata: {
                startTime: result.startTime,
                endTime: result.endTime,
                shopDomain,
                forceReconciliation,
                dryRun,
                alertThreshold
            }
        }, { status: statusCode });
    }
    catch (error) {
        console.error("[Cron] Nightly warehouse reconciliation error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to run nightly warehouse reconciliation",
            data: {
                jobId: `error_${Date.now()}`,
                status: 'failed',
                duration: 0,
                summary: {
                    canadaWarehouseUpdated: false,
                    bundlesProcessed: 0,
                    bundlesUpdated: 0,
                    bundlesWithErrors: 0,
                    virtualStockRecalculated: 0,
                    shopifySyncSuccess: false,
                    shopifyAdjustments: 0,
                    criticalAlerts: 0
                },
                alerts: [],
                errors: [{ bundleId: 'unknown', error: error.message }],
                logs: [{
                        timestamp: new Date().toISOString(),
                        level: 'error',
                        message: error.message
                    }]
            }
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.cron.inventory.reconciliation.js.map