/**
 * API Route: Inventory Sync
 *
 * POST /api/inventory/sync
 *
 * Triggers manual inventory sync from Shopify
 * Stores inventory levels in dashboard_fact table
 */
import type { ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function loader(): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.inventory.sync.d.ts.map