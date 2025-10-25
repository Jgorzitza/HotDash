/**
 * API Route: Inventory Chart Data
 *
 * GET /api/inventory/chart-data/:productId
 *
 * Returns 14-day demand velocity data formatted for chart display.
 * Used by Inventory Modal to render historical demand trends.
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-006: Inventory Modal Backend Integration (Chart Data)
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ params }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.inventory.chart-data.$productId.d.ts.map