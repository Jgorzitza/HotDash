/**
 * API Route: Inventory Tile Data
 *
 * GET /api/inventory/tile-data
 *
 * Returns real-time inventory status summary for dashboard tile:
 * - Status buckets (inStock, lowStock, outOfStock, urgentReorder)
 * - Top 5 risk products approaching stockout
 * - Days until stockout for each risk product
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-007: Real-Time Inventory Tile Data
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.inventory.tile-data.d.ts.map