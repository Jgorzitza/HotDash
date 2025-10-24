/**
 * API Route: Purchase Order Automation
 *
 * GET /api/inventory/po-automation
 *
 * Auto-generates purchase orders from reorder alerts.
 * Flags POs >= $1000 for HITL approval.
 *
 * INVENTORY-011: Purchase Order Automation
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.inventory.po-automation.d.ts.map