/**
 * Nightly Warehouse Reconciliation Cron Script
 * 
 * Run daily at 02:00 America/Los_Angeles
 * Resets Canada WH negative inventory and adjusts Main WH
 */

import { runNightlyWarehouseReconciliation } from "~/services/shopify/warehouse-reconcile";
import { getShopifyServiceContext } from "~/services/shopify/client";

async function main() {
  console.log("[Cron] Starting nightly warehouse reconciliation");

  try {
    // Create a mock request for authentication
    // In production, this would use a stored session or app authentication
    const mockRequest = new Request("https://internal-cron", {
      headers: new Headers()
    });

    const context = await getShopifyServiceContext(mockRequest);
    const result = await runNightlyWarehouseReconciliation(context);

    console.log(
      `[Cron] Complete: ${result.totalReconciled} reconciled, ${result.errors.length} errors`
    );

    if (result.errors.length > 0) {
      console.error("[Cron] Errors:", result.errors.slice(0, 10)); // First 10 errors
    }

    // Exit with appropriate code
    process.exit(result.errors.length > 0 ? 1 : 0);
  } catch (error: any) {
    console.error("[Cron] Fatal error:", error);
    process.exit(1);
  }
}

main();

