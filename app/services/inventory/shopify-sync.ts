/**
 * Shopify Inventory Sync Service
 *
 * Queries Shopify products and inventory levels using GraphQL
 */

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  tags: string[];
  variants: ShopifyVariant[];
}

export interface ShopifyVariant {
  id: string;
  sku: string | null;
  title: string;
  inventoryQuantity: number;
  price: string;
}

export interface InventoryItem {
  productId: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  sku: string | null;
  quantity: number;
  tags: string[];
  price: number;
}

/**
 * GraphQL query to fetch products with inventory levels
 */
export const PRODUCTS_INVENTORY_QUERY = `
  query GetProductsInventory($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          handle
          tags
          variants(first: 100) {
            edges {
              node {
                id
                sku
                title
                inventoryQuantity
                price
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Parse Shopify GraphQL response into inventory items
 *
 * @param response - Shopify GraphQL response
 * @returns Array of inventory items
 */
export function parseShopifyInventoryResponse(response: {
  data: {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      edges: Array<{ node: ShopifyProduct }>;
    };
  };
}): {
  items: InventoryItem[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
} {
  const products = response.data.products.edges.map((edge) => edge.node);
  const items: InventoryItem[] = [];

  for (const product of products) {
    for (const variantEdge of product.variants) {
      const variant = variantEdge.node;

      items.push({
        productId: product.id,
        productTitle: product.title,
        variantId: variant.id,
        variantTitle: variant.title,
        sku: variant.sku,
        quantity: variant.inventoryQuantity ?? 0,
        tags: product.tags,
        price: parseFloat(variant.price),
      });
    }
  }

  return {
    items,
    pageInfo: response.data.products.pageInfo,
  };
}

/**
 * Fetch all products with inventory from Shopify
 *
 * This is a helper that would be used with the Shopify Admin GraphQL API
 * In production, this would use the actual Shopify client/fetch
 *
 * @param fetchFunction - GraphQL fetch function (from Shopify client)
 * @param batchSize - Number of products per request (max 250)
 * @returns All inventory items
 */
export async function fetchAllInventory(
  fetchFunction: (
    query: string,
    variables: Record<string, unknown>,
  ) => Promise<unknown>,
  batchSize: number = 100,
): Promise<InventoryItem[]> {
  const allItems: InventoryItem[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const variables: Record<string, unknown> = { first: batchSize };
    if (cursor) {
      variables.after = cursor;
    }

    const response = (await fetchFunction(
      PRODUCTS_INVENTORY_QUERY,
      variables,
    )) as {
      data: {
        products: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          edges: Array<{ node: ShopifyProduct }>;
        };
      };
    };

    const { items, pageInfo } = parseShopifyInventoryResponse(response);

    allItems.push(...items);
    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  return allItems;
}

/**
 * Filter inventory items by criteria
 */
export function filterInventory(
  items: InventoryItem[],
  filters: {
    minQuantity?: number;
    maxQuantity?: number;
    tags?: string[];
    hasSku?: boolean;
  },
): InventoryItem[] {
  return items.filter((item) => {
    if (
      filters.minQuantity !== undefined &&
      item.quantity < filters.minQuantity
    ) {
      return false;
    }

    if (
      filters.maxQuantity !== undefined &&
      item.quantity > filters.maxQuantity
    ) {
      return false;
    }

    if (filters.tags && filters.tags.length > 0) {
      const hasAllTags = filters.tags.every((tag) =>
        item.tags.some(
          (itemTag) => itemTag.toUpperCase() === tag.toUpperCase(),
        ),
      );
      if (!hasAllTags) {
        return false;
      }
    }

    if (filters.hasSku !== undefined) {
      const itemHasSku = item.sku !== null && item.sku !== "";
      if (filters.hasSku !== itemHasSku) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Group inventory items by product
 */
export function groupByProduct(
  items: InventoryItem[],
): Map<string, InventoryItem[]> {
  const grouped = new Map<string, InventoryItem[]>();

  for (const item of items) {
    const existing = grouped.get(item.productId) || [];
    existing.push(item);
    grouped.set(item.productId, existing);
  }

  return grouped;
}

/**
 * Calculate total inventory value
 */
export function calculateInventoryValue(items: InventoryItem[]): number {
  return items.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0);
}

/**
 * Sort inventory items
 */
export function sortInventory(
  items: InventoryItem[],
  sortBy: "quantity" | "price" | "title",
  direction: "asc" | "desc" = "asc",
): InventoryItem[] {
  const sorted = [...items].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortBy) {
      case "quantity":
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      case "price":
        aValue = a.price;
        bValue = b.price;
        break;
      case "title":
        aValue = a.productTitle;
        bValue = b.productTitle;
        break;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return direction === "asc"
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  return sorted;
}
