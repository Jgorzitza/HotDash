/**
 * Kits & Bundles Support Service (INVENTORY-008)
 *
 * Handles inventory calculations for bundle products where:
 * - BUNDLE:TRUE indicates a product is composed of multiple components
 * - COMPONENTS:SKU1:2,SKU2:3 defines the component SKUs and quantities
 *
 * Bundle ROP Calculation:
 * ROP = min(component_stock / component_qty_per_bundle)
 * This ensures we can't sell more bundles than we can assemble.
 *
 * Context7: /microsoft/typescript - type guards, async/Promise
 * Context7: /websites/reactrouter - API patterns
 */
import type { ProductCategory } from "~/lib/inventory/seasonality";
export interface BundleComponent {
    componentProductId: string;
    quantity: number;
}
export interface BundleInfo {
    productId: string;
    productName: string;
    isBundle: boolean;
    components: BundleComponent[];
    availableBundles?: number;
    limitingComponent?: string;
}
/**
 * Parse bundle components from metafield value
 *
 * Expected format: "BUNDLE:TRUE,COMPONENTS:SKU1:2,SKU2:3"
 * - BUNDLE:TRUE = This is a bundle
 * - COMPONENTS:SKU1:2 = Component SKU1, quantity 2 per bundle
 *
 * @param metafieldValue - Raw metafield string from product
 * @returns Array of bundle components
 */
export declare function parseBundleMetafield(metafieldValue: string): BundleComponent[];
/**
 * Get bundle components for a product
 *
 * In production: fetch product from Shopify and parse metafield
 * For now: uses mock data
 *
 * @param bundleProductId - Bundle product identifier
 * @returns Promise resolving to array of components (empty if not a bundle)
 */
export declare function getBundleComponents(bundleProductId: string): Promise<BundleComponent[]>;
/**
 * Calculate reorder point for a bundle product
 *
 * For bundles, ROP is calculated based on the limiting component:
 * - Get ROP for each component individually
 * - Divide each component stock by its quantity per bundle
 * - Bundle ROP = minimum across all components
 *
 * Example:
 * - Bundle requires 2x Component A, 3x Component B
 * - Component A stock: 50 → can make 25 bundles
 * - Component B stock: 90 → can make 30 bundles
 * - Bundle stock effectively: min(25, 30) = 25 bundles
 *
 * INVENTORY-008: Kits & Bundles Support
 *
 * @param bundleProductId - Bundle product identifier
 * @param params - ROP calculation parameters
 * @returns Promise resolving to bundle ROP
 */
export declare function calculateBundleROP(bundleProductId: string, params: {
    avgDailySales: number;
    leadTimeDays: number;
    maxDailySales: number;
    maxLeadDays: number;
    category?: ProductCategory;
    currentMonth?: number;
}): Promise<{
    reorderPoint: number;
    isBundle: boolean;
    components?: Array<{
        componentId: string;
        stock: number;
        availableBundles: number;
    }>;
    limitingComponent?: string;
}>;
/**
 * Get bundle information including component availability
 *
 * API helper for INVENTORY-008
 *
 * @param productId - Product identifier
 * @returns Promise resolving to bundle information
 */
export declare function getBundleInfo(productId: string): Promise<BundleInfo>;
//# sourceMappingURL=bundles.d.ts.map