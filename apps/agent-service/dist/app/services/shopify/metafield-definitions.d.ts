/**
 * Shopify Metafield Definitions Service
 *
 * Create and manage metafield definitions for BOM (Bill of Materials) components
 * Used for bundle products that consist of multiple component variants
 */
import type { ShopifyServiceContext } from "./types";
export interface BOMComponent {
    handle: string;
    variantMap: Record<string, string>;
    qty: number;
}
export interface BOMData {
    components: BOMComponent[];
    parameters: string[];
}
/**
 * Create BOM metafield definitions (run once per shop)
 * Creates two definitions:
 * 1. hotdash.bom_components (json) - BOM structure with components and parameters
 * 2. hotdash.bom_is_component (boolean) - Marks products as components
 */
export declare function createBOMMetafieldDefinitions(context: ShopifyServiceContext): Promise<{
    success: boolean;
    errors: string[];
}>;
/**
 * Set BOM components on a bundle product
 *
 * @param context Shopify service context
 * @param productId Product GID (e.g., "gid://shopify/Product/123")
 * @param components Array of components with handle, variant map, and quantity
 * @param parameters Array of parameter names (e.g., ["color", "size"])
 */
export declare function setBOMComponents(context: ShopifyServiceContext, productId: string, components: BOMComponent[], parameters: string[]): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Get BOM components for a bundle product
 *
 * @param context Shopify service context
 * @param productId Product GID
 * @returns BOMData or null if not found
 */
export declare function getBOMComponents(context: ShopifyServiceContext, productId: string): Promise<BOMData | null>;
/**
 * Mark a product as a component (not sold standalone)
 *
 * @param context Shopify service context
 * @param productId Product GID
 */
export declare function markAsComponent(context: ShopifyServiceContext, productId: string): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=metafield-definitions.d.ts.map