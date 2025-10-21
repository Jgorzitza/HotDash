/**
 * Shopify Inventory Cost Sync Service
 * 
 * Updates Shopify inventoryItem.unitCost via GraphQL mutation
 * Called from Inventory receiving workflow after ALC calculation
 */

import type { ShopifyServiceContext } from "./types";

// Get inventory item ID from variant ID
const GET_INVENTORY_ITEM_ID_QUERY = `#graphql
  query getInventoryItemId($id: ID!) {
    productVariant(id: $id) {
      inventoryItem {
        id
        unitCost {
          amount
          currencyCode
        }
      }
    }
  }
`;

// Update inventory item cost
const INVENTORY_ITEM_UPDATE_MUTATION = `#graphql
  mutation inventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
    inventoryItemUpdate(id: $id, input: $input) {
      inventoryItem {
        id
        unitCost {
          amount
          currencyCode
        }
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface CostSyncResult {
  success: boolean;
  variantId: string;
  previousCost?: number;
  newCost: number;
  shopifyInventoryItemId?: string;
  updatedAt?: string;
  error?: string;
}

/**
 * Get inventory item ID and current cost from variant ID
 */
async function getInventoryItemFromVariant(
  context: ShopifyServiceContext,
  variantGid: string
): Promise<{ inventoryItemId: string | null; currentCost: number | null }> {
  const response = await context.admin.graphql(
    GET_INVENTORY_ITEM_ID_QUERY,
    {
      variables: { id: variantGid }
    }
  );

  const json = await response.json();
  
  const inventoryItemId = json.data?.productVariant?.inventoryItem?.id || null;
  const currentCostAmount = json.data?.productVariant?.inventoryItem?.unitCost?.amount || null;
  const currentCost = currentCostAmount ? parseFloat(currentCostAmount) : null;

  return { inventoryItemId, currentCost };
}

/**
 * Update inventory item cost
 * 
 * @param context Shopify service context with authenticated admin client
 * @param variantId Shopify variant GID (e.g., "gid://shopify/ProductVariant/123")
 * @param newCost New unit cost in shop's default currency
 * @returns CostSyncResult with success status and details
 */
export async function syncInventoryCostToShopify(
  context: ShopifyServiceContext,
  variantId: string,
  newCost: number
): Promise<CostSyncResult> {
  try {
    // 1. Get inventory item ID and current cost
    const { inventoryItemId, currentCost } = await getInventoryItemFromVariant(
      context,
      variantId
    );
    
    if (!inventoryItemId) {
      return {
        success: false,
        variantId,
        newCost,
        error: "Inventory item not found for variant"
      };
    }
    
    // 2. Update cost
    const response = await context.admin.graphql(
      INVENTORY_ITEM_UPDATE_MUTATION,
      {
        variables: {
          id: inventoryItemId,
          input: {
            cost: newCost.toFixed(2) // Shopify expects string with 2 decimals
          }
        }
      }
    );
    
    const json = await response.json();
    
    // 3. Check for errors
    const userErrors = json.data?.inventoryItemUpdate?.userErrors || [];
    
    if (userErrors.length > 0) {
      return {
        success: false,
        variantId,
        newCost,
        shopifyInventoryItemId: inventoryItemId,
        error: userErrors.map((e: any) => e.message).join(", ")
      };
    }
    
    // 4. Success
    const updatedItem = json.data?.inventoryItemUpdate?.inventoryItem;
    
    return {
      success: true,
      variantId,
      previousCost: currentCost !== null ? currentCost : undefined,
      newCost,
      shopifyInventoryItemId: inventoryItemId,
      updatedAt: updatedItem?.updatedAt
    };
  } catch (error: any) {
    console.error("[Shopify] Cost sync error:", error);
    
    return {
      success: false,
      variantId,
      newCost,
      error: error.message || "Unknown error"
    };
  }
}

/**
 * Batch update for multiple variants (from single PO receipt)
 * 
 * @param context Shopify service context
 * @param updates Array of { variantId, newCost } objects
 * @returns Array of CostSyncResult objects
 */
export async function syncMultipleInventoryCosts(
  context: ShopifyServiceContext,
  updates: Array<{ variantId: string; newCost: number }>
): Promise<CostSyncResult[]> {
  const results: CostSyncResult[] = [];
  
  for (const update of updates) {
    const result = await syncInventoryCostToShopify(
      context,
      update.variantId,
      update.newCost
    );
    results.push(result);
    
    // Rate limit: 2 requests/second (Shopify limit)
    // Each syncInventoryCostToShopify makes 2 requests (get + update)
    // So we wait 1 second between items
    if (updates.indexOf(update) < updates.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
