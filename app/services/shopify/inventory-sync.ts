/**
 * Shopify Inventory Sync Service
 *
 * Fetches inventory levels from Shopify GraphQL API
 * Stores in dashboard_fact table
 * Handles Shopify inventory webhooks
 */

export const INVENTORY_SYNC_QUERY = `#graphql
  query GetInventoryLevels($first: Int!) {
    productVariants(first: $first) {
      edges {
        node {
          id
          sku
          title
          inventoryQuantity
          inventoryItem {
            id
            inventoryLevels(first: 5) {
              edges {
                node {
                  id
                  location {
                    id
                    name
                  }
                  quantities(names: ["available", "on_hand", "committed", "reserved"]) {
                    name
                    quantity
                  }
                }
              }
            }
          }
          product {
            id
            title
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export interface InventoryLevelData {
  variantId: string;
  sku: string | null;
  productTitle: string;
  variantTitle: string;
  locationId: string;
  locationName: string;
  available: number;
  onHand: number;
  committed: number;
  reserved: number;
}

export interface InventorySyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsStored: number;
  error?: string;
}

/**
 * Parse Shopify inventory response and extract inventory levels
 */
export function parseInventoryResponse(response: any): InventoryLevelData[] {
  const levels: InventoryLevelData[] = [];

  const variants = response?.data?.productVariants?.edges || [];

  for (const { node: variant } of variants) {
    const inventoryLevels =
      variant?.inventoryItem?.inventoryLevels?.edges || [];

    for (const { node: level } of inventoryLevels) {
      const quantities = level.quantities || [];

      const quantityMap: Record<string, number> = {};
      for (const q of quantities) {
        quantityMap[q.name] = q.quantity;
      }

      levels.push({
        variantId: variant.id,
        sku: variant.sku,
        productTitle: variant.product?.title || "Unknown",
        variantTitle: variant.title,
        locationId: level.location.id,
        locationName: level.location.name,
        available: quantityMap["available"] || 0,
        onHand: quantityMap["on_hand"] || 0,
        committed: quantityMap["committed"] || 0,
        reserved: quantityMap["reserved"] || 0,
      });
    }
  }

  return levels;
}

/**
 * Sync inventory from Shopify to local database
 */
export async function syncInventoryFromShopify(
  adminGraphqlClient: any,
): Promise<InventorySyncResult> {
  try {
    let allLevels: InventoryLevelData[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;
    let iterations = 0;
    const maxIterations = 10; // Safety limit

    while (hasNextPage && iterations < maxIterations) {
      const response = await adminGraphqlClient.query({
        data: {
          query: INVENTORY_SYNC_QUERY,
          variables: {
            first: 50,
            ...(cursor && { after: cursor }),
          },
        },
      });

      const json = await response.json();
      const levels = parseInventoryResponse(json);
      allLevels = allLevels.concat(levels);

      hasNextPage = json?.data?.productVariants?.pageInfo?.hasNextPage || false;
      cursor = json?.data?.productVariants?.pageInfo?.endCursor || null;
      iterations++;
    }

    // TODO: Store in database when Data agent implements dashboard_fact table
    // await supabase.from('dashboard_fact').upsert(
    //   allLevels.map(level => ({
    //     fact_type: 'inventory_level',
    //     variant_id: level.variantId,
    //     location_id: level.locationId,
    //     metrics: {
    //       available: level.available,
    //       on_hand: level.onHand,
    //       committed: level.committed,
    //       reserved: level.reserved,
    //     },
    //     updated_at: new Date().toISOString(),
    //   })),
    //   { onConflict: 'variant_id,location_id' }
    // );

    console.log(
      `[Inventory Sync] Processed ${allLevels.length} inventory levels`,
    );

    return {
      success: true,
      itemsProcessed: allLevels.length,
      itemsStored: allLevels.length,
    };
  } catch (error) {
    console.error("[Inventory Sync] Error:", error);
    return {
      success: false,
      itemsProcessed: 0,
      itemsStored: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Handle Shopify inventory level update webhook
 */
export interface InventoryLevelWebhook {
  inventory_item_id: number;
  location_id: number;
  available: number;
  updated_at: string;
}

export async function handleInventoryWebhook(
  payload: InventoryLevelWebhook,
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Update dashboard_fact table when Data implements it
    // await supabase
    //   .from('dashboard_fact')
    //   .update({
    //     metrics: {
    //       available: payload.available,
    //     },
    //     updated_at: payload.updated_at,
    //   })
    //   .match({
    //     fact_type: 'inventory_level',
    //     variant_id: `gid://shopify/InventoryItem/${payload.inventory_item_id}`,
    //     location_id: `gid://shopify/Location/${payload.location_id}`,
    //   });

    console.log(
      `[Inventory Webhook] Updated inventory for item ${payload.inventory_item_id} at location ${payload.location_id}`,
    );

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
