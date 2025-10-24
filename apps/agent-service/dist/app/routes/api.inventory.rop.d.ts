/**
 * API Route: ROP Calculation Engine
 *
 * GET /api/inventory/rop
 * POST /api/inventory/rop/calculate
 * GET /api/inventory/rop/suggestions
 * PUT /api/inventory/rop/suggestions/:id/status
 *
 * ROP calculation engine with:
 * - Daily velocity calculation from order history
 * - Lead time demand = velocity × vendor days
 * - Safety stock = Z-score × demand variance
 * - ROP suggestions stored in reorder_suggestions table
 * - Seasonal trends and promotional uplift handling
 * - Vendor + qty + ETA + cost impact recommendations
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-100: ROP Calculation Engine
 */
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.inventory.rop.d.ts.map