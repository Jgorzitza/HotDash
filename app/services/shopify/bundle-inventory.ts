/**
 * Shopify Bundle Inventory Service
 * 
 * Calculate virtual bundle stock based on BOM component availability
 * Decrement component inventory when bundle is sold
 */

import type { ShopifyServiceContext } from "./types";
import { getBOMComponents } from "./metafield-definitions";

// Query inventory for variant
const GET_VARIANT_INVENTORY_QUERY = `#graphql
  query getVariantInventory($id: ID!) {
    productVariant(id: $id) {
      id
      inventoryItem {
        id
        inventoryLevels(first: 10) {
          edges {
            node {
              id
              location {
                id
                name
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

export interface ComponentAvailability {
  handle: string;
  available: number;
  required: number;
  possibleBundles: number;
}

export interface BundleStockResult {
  virtualStock: number;
  componentAvailability: ComponentAvailability[];
  limitingComponent?: ComponentAvailability;
}

/**
 * Fetch inventory availability for a variant
 */
async function fetchVariantInventory(
  context: ShopifyServiceContext,
  variantGid: string
): Promise<number> {
  try {
    const response = await context.admin.graphql(
      GET_VARIANT_INVENTORY_QUERY,
      {
        variables: { id: variantGid }
      }
    );

    const json = await response.json();
    const inventoryLevels = json.data?.productVariant?.inventoryItem?.inventoryLevels?.edges || [];

    let totalAvailable = 0;
    for (const { node: level } of inventoryLevels) {
      const quantities = level.quantities || [];
      const availableQty = quantities.find((q: any) => q.name === "available");
      if (availableQty) {
        totalAvailable += availableQty.quantity;
      }
    }

    return totalAvailable;
  } catch (error) {
    console.error("[Bundle] Error fetching inventory:", error);
    return 0;
  }
}

/**
 * Calculate virtual bundle stock based on BOM components
 * 
 * @param context Shopify service context
 * @param productId Bundle product GID
 * @returns BundleStockResult with virtual stock and component availability
 */
export async function calculateBundleStock(
  context: ShopifyServiceContext,
  productId: string
): Promise<BundleStockResult> {
  // 1. Get BOM components
  const bom = await getBOMComponents(context, productId);

  if (!bom || !bom.components || bom.components.length === 0) {
    return {
      virtualStock: 0,
      componentAvailability: []
    };
  }

  // 2. For each component, get available qty across all variants
  const componentAvailability: ComponentAvailability[] = [];

  for (const component of bom.components) {
    const variants = Object.values(component.variantMap);

    // Sum available across all variant options (e.g., all colors)
    let totalAvailable = 0;
    for (const variantGid of variants) {
      const available = await fetchVariantInventory(context, variantGid);
      totalAvailable += available;
    }

    const possibleBundles = Math.floor(totalAvailable / component.qty);

    componentAvailability.push({
      handle: component.handle,
      available: totalAvailable,
      required: component.qty,
      possibleBundles
    });
  }

  // 3. Calculate virtual stock (minimum possible bundles)
  const virtualStock = Math.min(...componentAvailability.map(c => c.possibleBundles));

  // 4. Find limiting component
  const limitingComponent = componentAvailability.find(
    c => c.possibleBundles === virtualStock
  );

  return {
    virtualStock,
    componentAvailability,
    limitingComponent
  };
}

/**
 * Decrement component inventory when bundle is sold
 * 
 * @param context Shopify service context
 * @param productId Bundle product GID
 * @param qtySold Quantity of bundles sold
 * @returns Success status and any errors
 */
export async function decrementBundleComponents(
  context: ShopifyServiceContext,
  productId: string,
  qtySold: number
): Promise<{ success: boolean; adjustments: number; errors: string[] }> {
  const errors: string[] = [];
  let adjustments = 0;

  // 1. Get BOM components
  const bom = await getBOMComponents(context, productId);

  if (!bom || !bom.components || bom.components.length === 0) {
    return {
      success: false,
      adjustments: 0,
      errors: ["No BOM components found for bundle"]
    };
  }

  // 2. For each component, decrement from first available variant
  for (const component of bom.components) {
    const qtyToDecrement = component.qty * qtySold;
    const variants = Object.values(component.variantMap);

    let remaining = qtyToDecrement;

    // Decrement from variants until we've decremented the full amount
    for (const variantGid of variants) {
      if (remaining <= 0) break;

      const available = await fetchVariantInventory(context, variantGid);

      if (available > 0) {
        const toDecrement = Math.min(remaining, available);

        try {
          // Get inventory item ID
          const response = await context.admin.graphql(
            GET_VARIANT_INVENTORY_QUERY,
            {
              variables: { id: variantGid }
            }
          );

          const json = await response.json();
          const inventoryItemId = json.data?.productVariant?.inventoryItem?.id;
          const inventoryLevels = json.data?.productVariant?.inventoryItem?.inventoryLevels?.edges || [];

          if (!inventoryItemId || inventoryLevels.length === 0) {
            errors.push(`No inventory item for ${variantGid}`);
            continue;
          }

          // Use first location for simplicity (could be enhanced to distribute across locations)
          const firstLocation = inventoryLevels[0]?.node?.location?.id;

          if (!firstLocation) {
            errors.push(`No location for ${variantGid}`);
            continue;
          }

          // Adjust inventory
          const adjustResponse = await context.admin.graphql(
            INVENTORY_ADJUST_MUTATION,
            {
              variables: {
                input: {
                  reason: "correction",
                  name: "available",
                  changes: [
                    {
                      inventoryItemId,
                      locationId: firstLocation,
                      delta: -toDecrement
                    }
                  ]
                }
              }
            }
          );

          const adjustJson = await adjustResponse.json();
          const userErrors = adjustJson.data?.inventoryAdjustQuantities?.userErrors || [];

          if (userErrors.length > 0) {
            errors.push(`Adjust ${variantGid}: ${userErrors.map((e: any) => e.message).join(", ")}`);
          } else {
            adjustments++;
            remaining -= toDecrement;
          }
        } catch (error: any) {
          errors.push(`Error adjusting ${variantGid}: ${error.message}`);
        }
      }
    }

    if (remaining > 0) {
      errors.push(`Could not fully decrement ${component.handle}: ${remaining} units remaining`);
    }
  }

  return {
    success: errors.length === 0,
    adjustments,
    errors
  };
}

/**
 * Fallback: Calculate bundle stock from PACK:X tags (legacy method)
 * Used when BOM metafields are not available
 */
export async function calculateBundleStockFromTags(
  context: ShopifyServiceContext,
  productId: string
): Promise<number> {
  // This is a simplified fallback - in practice, would parse PACK:X tags
  // and calculate based on component availability
  // For now, return 0 to indicate metafields should be used
  console.warn("[Bundle] Fallback to tags not fully implemented - use BOM metafields");
  return 0;
}

