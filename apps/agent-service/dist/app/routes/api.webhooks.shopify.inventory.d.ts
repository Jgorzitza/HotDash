/**
 * API Route: Shopify Inventory Webhooks
 *
 * POST /api/webhooks/shopify/inventory
 *
 * Receives inventory level update webhooks from Shopify
 * Updates dashboard_fact table with new inventory levels
 */
import type { ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function loader(): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.webhooks.shopify.inventory.d.ts.map