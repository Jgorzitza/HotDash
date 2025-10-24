/**
 * Shopify Warehouse Reconciliation Service
 *
 * Nightly sync to reset Canada WH negative inventory and adjust Main WH
 * Main WH = primary inventory
 * Canada WH = used for label printing, goes negative
 * Solution: Nightly reset Canada → 0, adjust Main by offset
 */

import type { ShopifyServiceContext } from "./types";

const MAIN_WH_ID = process.env.SHOPIFY_MAIN_WH_LOCATION_ID!;
const CANADA_WH_ID = process.env.SHOPIFY_CANADA_WH_LOCATION_ID!;

// Get inventory levels at location with negative quantities
const GET_NEGATIVE_INVENTORY_QUERY = `#graphql
  query getNegativeInventory($locationId: ID!, $cursor: String) {
    location(id: $locationId) {
      inventoryLevels(first: 50, after: $cursor, query: "available:<0") {
        edges {
          node {
            id
            item {
              id
              variant {
                id
              }
            }
            quantities(names: ["available"]) {
              name
              quantity
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

// Get inventory item with levels at all locations
const GET_INVENTORY_ITEM_LEVELS_QUERY = `#graphql
  query getInventoryItemLevels($id: ID!) {
    inventoryItem(id: $id) {
      id
      inventoryLevels(first: 10) {
        edges {
          node {
            id
            location {
              id
            }
            quantities(names: ["available"]) {
              name
              quantity
            }
          }
        }
      }
    }
  }
`;

// Adjust inventory quantities
const INVENTORY_ADJUST_MUTATION = `#graphql
  mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
    inventoryAdjustQuantities(input: $input) {
      inventoryAdjustmentGroup {
        reason
        changes {
          name
          delta
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface ReconciliationResult {
  variantId: string;
  inventoryItemId: string;
  canadaNegativeQty: number;
  mainPreviousQty: number;
  canadaNewQty: number;
  mainNewQty: number;
  adjusted: boolean;
  error?: string;
}

/**
 * Get all products with negative Canada WH inventory
 */
async function getProductsWithNegativeCanadaInventory(
  context: ShopifyServiceContext,
): Promise<
  Array<{ variantId: string; inventoryItemId: string; available: number }>
> {
  const negativeProducts: Array<{
    variantId: string;
    inventoryItemId: string;
    available: number;
  }> = [];

  let hasNext = true;
  let cursor: string | null = null;

  while (hasNext) {
    const response = await context.admin.graphql(GET_NEGATIVE_INVENTORY_QUERY, {
      variables: {
        locationId: CANADA_WH_ID,
        cursor,
      },
    });

    const json = await response.json();
    const edges = json.data?.location?.inventoryLevels?.edges || [];

    for (const { node: level } of edges) {
      const availableQty = level.quantities?.find(
        (q: any) => q.name === "available",
      );

      if (availableQty && availableQty.quantity < 0) {
        negativeProducts.push({
          variantId: level.item?.variant?.id || "",
          inventoryItemId: level.item?.id || "",
          available: availableQty.quantity,
        });
      }
    }

    hasNext =
      json.data?.location?.inventoryLevels?.pageInfo?.hasNextPage || false;
    cursor = json.data?.location?.inventoryLevels?.pageInfo?.endCursor || null;
  }

  return negativeProducts;
}

/**
 * Reconcile single variant - reset Canada to 0, adjust Main WH by offset
 */
async function reconcileVariant(
  context: ShopifyServiceContext,
  inventoryItemId: string,
  variantId: string,
  canadaNegativeQty: number,
): Promise<ReconciliationResult> {
  try {
    // 1. Get current Main WH inventory
    const mainResponse = await context.admin.graphql(
      GET_INVENTORY_ITEM_LEVELS_QUERY,
      {
        variables: {
          id: inventoryItemId,
        },
      },
    );

    const mainJson = await mainResponse.json();
    const inventoryLevels =
      mainJson.data?.inventoryItem?.inventoryLevels?.edges || [];
    const mainLevel = inventoryLevels.find(
      (edge: any) => edge.node.location.id === MAIN_WH_ID,
    );
    const mainAvailableQty =
      mainLevel?.node.quantities?.find((q: any) => q.name === "available")
        ?.quantity || 0;

    // 2. Calculate adjustments
    const canadaAdjustment = -canadaNegativeQty; // Reset to 0
    const mainAdjustment = canadaNegativeQty; // Reduce by negative amount

    // 3. Apply adjustments
    const adjustResponse = await context.admin.graphql(
      INVENTORY_ADJUST_MUTATION,
      {
        variables: {
          input: {
            reason: "correction",
            name: "available",
            referenceDocumentUri: `gid://hotdash/WarehouseReconciliation/${new Date().toISOString().split("T")[0]}`,
            changes: [
              {
                inventoryItemId,
                locationId: CANADA_WH_ID,
                delta: canadaAdjustment,
              },
              {
                inventoryItemId,
                locationId: MAIN_WH_ID,
                delta: mainAdjustment,
              },
            ],
          },
        },
      },
    );

    const adjustJson = await adjustResponse.json();
    const userErrors =
      adjustJson.data?.inventoryAdjustQuantities?.userErrors || [];

    if (userErrors.length > 0) {
      return {
        variantId,
        inventoryItemId,
        canadaNegativeQty,
        mainPreviousQty: mainAvailableQty,
        canadaNewQty: canadaNegativeQty, // unchanged
        mainNewQty: mainAvailableQty, // unchanged
        adjusted: false,
        error: userErrors.map((e: any) => e.message).join(", "),
      };
    }

    return {
      variantId,
      inventoryItemId,
      canadaNegativeQty,
      mainPreviousQty: mainAvailableQty,
      canadaNewQty: 0,
      mainNewQty: mainAvailableQty + mainAdjustment,
      adjusted: true,
    };
  } catch (error: any) {
    return {
      variantId,
      inventoryItemId,
      canadaNegativeQty,
      mainPreviousQty: 0,
      canadaNewQty: canadaNegativeQty,
      mainNewQty: 0,
      adjusted: false,
      error: error.message,
    };
  }
}

/**
 * Nightly reconciliation - main function
 * Run daily at 02:00 America/Los_Angeles
 */
export async function runNightlyWarehouseReconciliation(
  context: ShopifyServiceContext,
): Promise<{
  totalReconciled: number;
  results: ReconciliationResult[];
  errors: string[];
}> {

  if (!MAIN_WH_ID || !CANADA_WH_ID) {
    throw new Error(
      "SHOPIFY_MAIN_WH_LOCATION_ID and SHOPIFY_CANADA_WH_LOCATION_ID env vars required",
    );
  }

  // 1. Get all products with negative Canada inventory
  const negativeProducts =
    await getProductsWithNegativeCanadaInventory(context);

    `[Warehouse Reconcile] Found ${negativeProducts.length} products to reconcile`,
  );

  // 2. Reconcile each
  const results: ReconciliationResult[] = [];
  const errors: string[] = [];

  for (const product of negativeProducts) {
    try {
      const result = await reconcileVariant(
        context,
        product.inventoryItemId,
        product.variantId,
        product.available,
      );
      results.push(result);

      if (!result.adjusted) {
        errors.push(`${product.variantId}: ${result.error}`);
      }

      // Rate limit: 2 requests/second
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error: any) {
      errors.push(`${product.variantId}: ${error.message}`);
    }
  }

  const totalReconciled = results.filter((r) => r.adjusted).length;

    `[Warehouse Reconcile] Reconciled ${totalReconciled}/${results.length} products`,
  );

  return {
    totalReconciled,
    results,
    errors,
  };
}
