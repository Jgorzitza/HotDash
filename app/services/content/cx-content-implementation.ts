/**
 * CX Content Implementation Service
 *
 * Implements CX theme content (size charts, installation guides, dimensions, warranty)
 * to Shopify products using metafields via productUpdate mutation.
 *
 * Based on Product agent's CX theme action generator templates.
 */

import { authenticate } from "~/shopify.server";

/**
 * Content types supported by this service
 */
export type CXContentType =
  | "size_chart"
  | "dimensions"
  | "installation_guide"
  | "warranty";

/**
 * CX content implementation request
 */
export interface CXContentRequest {
  productId: string; // Shopify GID format: gid://shopify/Product/123
  contentType: CXContentType;
  content: string; // Markdown or plain text content
  productHandle?: string; // Optional for logging/tracking
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
 * Metafield namespace for CX content
 */
const CX_CONTENT_NAMESPACE = "cx_content";

/**
 * Maps content type to metafield key and type
 */
function getMetafieldConfig(contentType: CXContentType): {
  key: string;
  type: string;
  description: string;
} {
  const configs = {
    size_chart: {
      key: "size_chart",
      type: "multi_line_text_field",
      description: "Size chart for product (customer-facing)",
    },
    dimensions: {
      key: "dimensions",
      type: "multi_line_text_field",
      description: "Product dimensions and measurements",
    },
    installation_guide: {
      key: "installation_guide",
      type: "multi_line_text_field",
      description: "Installation instructions for product",
    },
    warranty: {
      key: "warranty",
      type: "multi_line_text_field",
      description: "Warranty information and coverage details",
    },
  };

  return configs[contentType];
}

/**
 * Applies CX theme content to a Shopify product using productUpdate mutation
 *
 * @param request - Content implementation request
 * @param requestContext - Request context for Shopify authentication
 * @returns Result of the content implementation
 */
export async function applyCXContent(
  request: CXContentRequest,
  requestContext: Request,
): Promise<CXContentResult> {
  try {
    // Authenticate with Shopify
    const { admin } = await authenticate.admin(requestContext);

    // Get metafield configuration
    const metafieldConfig = getMetafieldConfig(request.contentType);

    // Execute productUpdate mutation
    const response = await admin.graphql(
      `#graphql
      mutation UpdateProductWithCXContent($product: ProductInput!) {
        productUpdate(input: $product) {
          product {
            id
            metafields(first: 10, namespace: "${CX_CONTENT_NAMESPACE}") {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                  type
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          product: {
            id: request.productId,
            metafields: [
              {
                namespace: CX_CONTENT_NAMESPACE,
                key: metafieldConfig.key,
                value: request.content,
                type: metafieldConfig.type,
              },
            ],
          },
        },
      },
    );

    const data = await response.json();

    // Check for user errors
    if (data.data?.productUpdate?.userErrors?.length > 0) {
      const errors = data.data.productUpdate.userErrors;
      console.error("[CX Content] productUpdate user errors:", errors);

      return {
        success: false,
        productId: request.productId,
        contentType: request.contentType,
        error: errors.map((e: any) => `${e.field}: ${e.message}`).join(", "),
      };
    }

    // Extract metafield ID from response
    const metafields =
      data.data?.productUpdate?.product?.metafields?.edges || [];
    const appliedMetafield = metafields.find(
      (edge: any) => edge.node.key === metafieldConfig.key,
    );

    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[CX Content] ✅ Applied ${request.contentType} to product ${request.productId}`,
      );
    }

    return {
      success: true,
      productId: request.productId,
      contentType: request.contentType,
      metafieldId: appliedMetafield?.node?.id,
    };
  } catch (error: any) {
    console.error(
      `[CX Content] Error applying content to ${request.productId}:`,
      error,
    );

    return {
      success: false,
      productId: request.productId,
      contentType: request.contentType,
      error: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Applies multiple CX content items to a single product
 *
 * @param productId - Shopify product GID
 * @param contentItems - Array of content type and content pairs
 * @param requestContext - Request context for Shopify authentication
 * @returns Results for each content item
 */
export async function applyMultipleCXContents(
  productId: string,
  contentItems: Array<{ contentType: CXContentType; content: string }>,
  requestContext: Request,
): Promise<CXContentResult[]> {
  const results: CXContentResult[] = [];

  for (const item of contentItems) {
    const result = await applyCXContent(
      {
        productId,
        contentType: item.contentType,
        content: item.content,
      },
      requestContext,
    );

    results.push(result);
  }

  return results;
}

/**
 * Retrieves CX content for a product
 *
 * @param productId - Shopify product GID
 * @param contentType - Type of content to retrieve (optional, returns all if not specified)
 * @param requestContext - Request context for Shopify authentication
 * @returns Content value or null if not found
 */
export async function getCXContent(
  productId: string,
  contentType: CXContentType | null,
  requestContext: Request,
): Promise<Record<string, string> | null> {
  try {
    const { admin } = await authenticate.admin(requestContext);

    let queryFragment = "";
    if (contentType) {
      const config = getMetafieldConfig(contentType);
      queryFragment = `metafield(namespace: "${CX_CONTENT_NAMESPACE}", key: "${config.key}") {
        value
      }`;
    } else {
      queryFragment = `metafields(first: 10, namespace: "${CX_CONTENT_NAMESPACE}") {
        edges {
          node {
            key
            value
          }
        }
      }`;
    }

    const response = await admin.graphql(
      `#graphql
      query GetProductCXContent($productId: ID!) {
        product(id: $productId) {
          id
          ${queryFragment}
        }
      }`,
      {
        variables: {
          productId,
        },
      },
    );

    const data = await response.json();

    if (contentType) {
      // Single content type requested
      const value = data.data?.product?.metafield?.value;
      return value ? { [contentType]: value } : null;
    } else {
      // All content types requested
      const metafields = data.data?.product?.metafields?.edges || [];
      const contents: Record<string, string> = {};

      metafields.forEach((edge: any) => {
        contents[edge.node.key] = edge.node.value;
      });

      return Object.keys(contents).length > 0 ? contents : null;
    }
  } catch (error: any) {
    console.error(
      `[CX Content] Error retrieving content for ${productId}:`,
      error,
    );
    return null;
  }
}

/**
 * Removes CX content from a product
 *
 * @param productId - Shopify product GID
 * @param contentType - Type of content to remove
 * @param requestContext - Request context for Shopify authentication
 * @returns Success status
 */
export async function removeCXContent(
  productId: string,
  contentType: CXContentType,
  requestContext: Request,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { admin } = await authenticate.admin(requestContext);
    const config = getMetafieldConfig(contentType);

    // Delete the metafield using metafieldsDelete
    const response = await admin.graphql(
      `#graphql
      mutation MetafieldsDelete($metafields: [MetafieldIdentifierInput!]!) {
        metafieldsDelete(metafields: $metafields) {
          deletedMetafields {
            key
            namespace
            ownerId
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafields: [
            {
              ownerId: productId,
              namespace: CX_CONTENT_NAMESPACE,
              key: config.key,
            },
          ],
        },
      },
    );

    const data = await response.json();

    if (data.data?.metafieldsDelete?.userErrors?.length > 0) {
      const errors = data.data.metafieldsDelete.userErrors;
      return {
        success: false,
        error: errors.map((e: any) => `${e.field}: ${e.message}`).join(", "),
      };
    }

    // Check if metafield was actually deleted
    const deletedMetafields =
      data.data?.metafieldsDelete?.deletedMetafields || [];
    if (deletedMetafields.length === 0 || !deletedMetafields[0]) {
      return {
        success: false,
        error: "Metafield not found or already deleted",
      };
    }

    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[CX Content] ✅ Removed ${contentType} from product ${productId}`,
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error(
      `[CX Content] Error removing content from ${productId}:`,
      error,
    );
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}
