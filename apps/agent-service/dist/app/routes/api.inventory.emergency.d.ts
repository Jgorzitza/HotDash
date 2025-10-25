/**
 * API Route: Emergency Sourcing Logic
 *
 * POST /api/inventory/emergency/calculate
 * GET /api/inventory/emergency/history/:bundleId
 * PUT /api/inventory/emergency/recommendations/:id/status
 *
 * Emergency sourcing recommendations with opportunity-cost logic:
 * - Calculates Expected Lost Profit = feasible_sales × bundle_margin
 * - Calculates Incremental Cost = (local_cost - primary_cost) × qty
 * - Recommends local vendor when ELP > IC and margin > 20%
 * - Shows comparison: primary vs local (cost, lead time, profit impact)
 * - Creates approval card for CEO review
 *
 * Context7: /websites/reactrouter - action patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-101: Emergency Sourcing Logic
 */
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
export declare function loader({ request, params }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.inventory.emergency.d.ts.map