/**
 * API Route: Inventory Reorder Alerts
 *
 * GET /api/inventory/reorder-alerts
 *
 * Returns automated reorder alerts for all products below ROP threshold.
 * Includes urgency levels, recommended order quantities (EOQ), and cost estimates.
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-009: Automated Reorder Alerts
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.inventory.reorder-alerts.d.ts.map