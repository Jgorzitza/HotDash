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
import { type ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.cron.inventory.reconciliation.d.ts.map