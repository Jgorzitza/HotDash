/**
 * API Route: Inventory Product Data
 *
 * GET /api/inventory/product/:productId
 *
 * Returns comprehensive inventory data for a specific product including:
 * - Current stock levels
 * - Reorder point (ROP) with seasonal adjustments
 * - Safety stock
 * - Seasonal factors
 * - 30-day demand forecast
 * - Vendor information
 * - Purchase order status
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-006: Inventory Modal Backend Integration
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ params }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.inventory.product.$productId.d.ts.map