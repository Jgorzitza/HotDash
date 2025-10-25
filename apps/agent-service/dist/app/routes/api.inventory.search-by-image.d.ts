/**
 * Inventory Image Search API
 *
 * Search inventory by uploading an image or using an existing image ID.
 * Returns matching products with inventory data (stock, ROP, vendor info).
 *
 * Task: INVENTORY-IMAGE-SEARCH-001 (Molecule M3)
 * Agent: inventory
 * Date: 2025-10-24
 */
import type { ActionFunctionArgs } from "react-router";
export interface InventoryImageSearchResult {
    imageId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    similarity: number;
    shopifyProductId?: number;
    shopifyVariantId?: number;
    productSku?: string;
    productName?: string;
    inventory?: {
        currentStock: number;
        reorderPoint: number;
        safetyStock: number;
        daysOfCover: number;
        status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown';
    };
    vendor?: {
        name: string;
        leadTimeDays: number;
        costPerUnit: number;
    };
}
/**
 * POST /api/inventory/search-by-image
 *
 * Search inventory by image (upload new or use existing image ID)
 *
 * Request body (JSON):
 * {
 *   imageUrl?: string,        // URL of image to search (for new upload)
 *   imageId?: string,          // Existing customer_photos.id (for existing image)
 *   limit?: number,            // Max results (default: 10)
 *   minSimilarity?: number,    // Min similarity score 0-1 (default: 0.7)
 *   project?: string           // Project filter (default: 'occ')
 * }
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function loader(): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.inventory.search-by-image.d.ts.map