/**
 * Shopify Metafield Definitions Service
 *
 * Create and manage metafield definitions for BOM (Bill of Materials) components
 * Used for bundle products that consist of multiple component variants
 */

import type { ShopifyServiceContext } from "./types";

// Create metafield definition
const CREATE_METAFIELD_DEFINITION_MUTATION = `#graphql
  mutation metafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        name
        namespace
        key
        type {
          name
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

// Query product metafield
const GET_PRODUCT_METAFIELD_QUERY = `#graphql
  query getProductMetafield($id: ID!, $namespace: String!, $key: String!) {
    product(id: $id) {
      metafield(namespace: $namespace, key: $key) {
        id
        value
        type
      }
    }
  }
`;

// Set product metafields
const PRODUCT_UPDATE_MUTATION = `#graphql
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        metafield(namespace: "hotdash", key: "bom_components") {
          id
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface BOMComponent {
  handle: string;
  variantMap: Record<string, string>; // color -> variantGID mapping
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
export async function createBOMMetafieldDefinitions(
  context: ShopifyServiceContext,
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  const definitions = [
    {
      name: "BOM Components",
      namespace: "hotdash",
      key: "bom_components",
      description:
        "Bill of Materials: Component variants and quantities for bundle products",
      type: "json",
      ownerType: "PRODUCT",
    },
    {
      name: "Is Component",
      namespace: "hotdash",
      key: "bom_is_component",
      description: "Marks product as a component (not sold standalone)",
      type: "boolean",
      ownerType: "PRODUCT",
    },
  ];

  for (const def of definitions) {
    try {
      const response = await context.admin.graphql(
        CREATE_METAFIELD_DEFINITION_MUTATION,
        {
          variables: { definition: def },
        },
      );

      const json = await response.json();
      const userErrors = json.data?.metafieldDefinitionCreate?.userErrors || [];

      if (userErrors.length > 0) {
        errors.push(
          `${def.key}: ${userErrors.map((e: any) => e.message).join(", ")}`,
        );
      }
    } catch (error: any) {
      errors.push(`${def.key}: ${error.message}`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Set BOM components on a bundle product
 *
 * @param context Shopify service context
 * @param productId Product GID (e.g., "gid://shopify/Product/123")
 * @param components Array of components with handle, variant map, and quantity
 * @param parameters Array of parameter names (e.g., ["color", "size"])
 */
export async function setBOMComponents(
  context: ShopifyServiceContext,
  productId: string,
  components: BOMComponent[],
  parameters: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const bomData: BOMData = {
      components: components.map((c) => ({
        handle: c.handle,
        variantMap: c.variantMap,
        qty: c.qty,
      })),
      parameters,
    };

    const response = await context.admin.graphql(PRODUCT_UPDATE_MUTATION, {
      variables: {
        input: {
          id: productId,
          metafields: [
            {
              namespace: "hotdash",
              key: "bom_components",
              type: "json",
              value: JSON.stringify(bomData),
            },
          ],
        },
      },
    });

    const json = await response.json();
    const userErrors = json.data?.productUpdate?.userErrors || [];

    if (userErrors.length > 0) {
      return {
        success: false,
        error: userErrors.map((e: any) => e.message).join(", "),
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Get BOM components for a bundle product
 *
 * @param context Shopify service context
 * @param productId Product GID
 * @returns BOMData or null if not found
 */
export async function getBOMComponents(
  context: ShopifyServiceContext,
  productId: string,
): Promise<BOMData | null> {
  try {
    const response = await context.admin.graphql(GET_PRODUCT_METAFIELD_QUERY, {
      variables: {
        id: productId,
        namespace: "hotdash",
        key: "bom_components",
      },
    });

    const json = await response.json();
    const metafield = json.data?.product?.metafield;

    if (!metafield || !metafield.value) {
      return null;
    }

    return JSON.parse(metafield.value) as BOMData;
  } catch (error: any) {
    console.error("[Shopify] Error getting BOM components:", error);
    return null;
  }
}

/**
 * Mark a product as a component (not sold standalone)
 *
 * @param context Shopify service context
 * @param productId Product GID
 */
export async function markAsComponent(
  context: ShopifyServiceContext,
  productId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await context.admin.graphql(PRODUCT_UPDATE_MUTATION, {
      variables: {
        input: {
          id: productId,
          metafields: [
            {
              namespace: "hotdash",
              key: "bom_is_component",
              type: "boolean",
              value: "true",
            },
          ],
        },
      },
    });

    const json = await response.json();
    const userErrors = json.data?.productUpdate?.userErrors || [];

    if (userErrors.length > 0) {
      return {
        success: false,
        error: userErrors.map((e: any) => e.message).join(", "),
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}
