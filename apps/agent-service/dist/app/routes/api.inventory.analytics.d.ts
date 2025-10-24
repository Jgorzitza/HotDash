/**
 * API Route: Inventory Analytics
 *
 * GET /api/inventory/analytics
 *
 * Returns comprehensive inventory analytics including:
 * - Turnover rate and DIO (Days Inventory Outstanding)
 * - Aging analysis (fresh/aging/stale/dead stock)
 * - ABC analysis (Pareto 80/15/5 classification)
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-010: Inventory Analytics Service
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.inventory.analytics.d.ts.map