/**
 * CX Content Implementation Service
 *
 * Implements CX theme content (size charts, installation guides, dimensions, warranty)
 * to Shopify products using metafields via productUpdate mutation.
 *
 * Based on Product agent's CX theme action generator templates.
 */
/**
 * Content types supported by this service
 */
export type CXContentType = "size_chart" | "dimensions" | "installation_guide" | "warranty";
/**
 * CX content implementation request
 */
export interface CXContentRequest {
    productId: string;
    contentType: CXContentType;
    content: string;
    productHandle?: string;
}
/**
 * CX content implementation result
 */
export interface CXContentResult {
    success: boolean;
    productId: string;
    contentType: CXContentType;
    metafieldId?: string;
    error?: string;
}
/**
 * Applies CX theme content to a Shopify product using productUpdate mutation
 *
 * @param request - Content implementation request
 * @param requestContext - Request context for Shopify authentication
 * @returns Result of the content implementation
 */
export declare function applyCXContent(request: CXContentRequest, requestContext: Request): Promise<CXContentResult>;
/**
 * Applies multiple CX content items to a single product
 *
 * @param productId - Shopify product GID
 * @param contentItems - Array of content type and content pairs
 * @param requestContext - Request context for Shopify authentication
 * @returns Results for each content item
 */
export declare function applyMultipleCXContents(productId: string, contentItems: Array<{
    contentType: CXContentType;
    content: string;
}>, requestContext: Request): Promise<CXContentResult[]>;
/**
 * Retrieves CX content for a product
 *
 * @param productId - Shopify product GID
 * @param contentType - Type of content to retrieve (optional, returns all if not specified)
 * @param requestContext - Request context for Shopify authentication
 * @returns Content value or null if not found
 */
export declare function getCXContent(productId: string, contentType: CXContentType | null, requestContext: Request): Promise<Record<string, string> | null>;
/**
 * Removes CX content from a product
 *
 * @param productId - Shopify product GID
 * @param contentType - Type of content to remove
 * @param requestContext - Request context for Shopify authentication
 * @returns Success status
 */
export declare function removeCXContent(productId: string, contentType: CXContentType, requestContext: Request): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=cx-content-implementation.d.ts.map