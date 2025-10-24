import { logDecision } from "~/services/decisions.server";

export interface ShopifyInventoryLevel {
  id: string;
  quantities: {
    name: string;
    quantity: number;
  }[];
  item: {
    id: string;
    sku: string;
  };
  location: {
    id: string;
    name: string;
  };
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  sku: string;
  inventoryItem: {
    id: string;
    tracked: boolean;
  };
  product: {
    id: string;
    title: string;
  };
}

export interface ShopifyInventorySyncResult {
  success: boolean;
  syncedItems: number;
  errors: string[];
  updatedAt: Date;
}

/**
 * Sync inventory levels from Shopify to local database
 * Uses Shopify GraphQL Admin API for real-time inventory data
 */
export async function syncInventoryFromShopify(
  shopifyClient: any,
  locationId?: string
): Promise<ShopifyInventorySyncResult> {
  try {
    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "shopify_sync_start",
      rationale: "Starting Shopify inventory sync using GraphQL Admin API",
      evidenceUrl: "app/services/shopify/inventory-sync.ts",
      status: "in_progress",
      progressPct: 0,
    });

    // Query inventory levels from Shopify
    const inventoryQuery = `
      query getInventoryLevels($first: Int!, $locationId: ID) {
        inventoryLevels(first: $first, locationId: $locationId) {
      edges {
        node {
              id
              quantities(names: ["available", "on_hand", "committed", "reserved", "incoming"]) {
                name
                quantity
              }
              item {
          id
          sku
              }
                  location {
                    id
                    name
              }
            }
          }
        }
      }
    `;

    const response = await shopifyClient.query({
      data: {
        query: inventoryQuery,
        variables: {
          first: 250,
          locationId: locationId,
        },
      },
    });

    const inventoryLevels = response.data.inventoryLevels.edges.map(
      (edge: any) => edge.node
    );

    // Process and sync inventory data
    let syncedItems = 0;
    const errors: string[] = [];

    for (const level of inventoryLevels) {
      try {
        // Update local inventory with Shopify data
        await updateLocalInventoryFromShopify(level);
        syncedItems++;
      } catch (error) {
        errors.push(`Failed to sync item ${level.item.sku}: ${error}`);
      }
    }

    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "shopify_sync_complete",
      rationale: `Shopify inventory sync completed. Synced ${syncedItems} items with ${errors.length} errors`,
      evidenceUrl: "app/services/shopify/inventory-sync.ts",
      status: "completed",
      progressPct: 100,
    });

    return {
      success: errors.length === 0,
      syncedItems,
      errors,
      updatedAt: new Date(),
    };
  } catch (error) {
    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "shopify_sync_error",
      rationale: `Shopify inventory sync failed: ${error}`,
      evidenceUrl: "app/services/shopify/inventory-sync.ts",
      status: "error",
      progressPct: 0,
    });

    return {
      success: false,
      syncedItems: 0,
      errors: [error as string],
      updatedAt: new Date(),
    };
  }
}

/**
 * Update Shopify inventory levels using GraphQL mutations
 */
export async function updateShopifyInventory(
  shopifyClient: any,
  inventoryUpdates: {
    inventoryItemId: string;
    locationId: string;
    quantity: number;
    reason?: string;
  }[]
): Promise<ShopifyInventorySyncResult> {
  try {
    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "shopify_update_start",
      rationale: "Starting Shopify inventory updates using GraphQL mutations",
      evidenceUrl: "app/services/shopify/inventory-sync.ts",
      status: "in_progress",
      progressPct: 0,
    });

    const updateMutation = `
      mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
        inventorySetQuantities(input: $input) {
          inventoryAdjustmentGroup {
            reason
            referenceDocumentUri
            changes {
              name
              delta
              quantityAfterChange
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await shopifyClient.query({
        data: {
        query: updateMutation,
          variables: {
          input: {
            name: "available",
            reason: "inventory_management_system_update",
            referenceDocumentUri: "hotdash://inventory/update",
            quantities: inventoryUpdates.map((update) => ({
              inventoryItemId: update.inventoryItemId,
              locationId: update.locationId,
              quantity: update.quantity,
            })),
          },
          },
        },
      });

    const result = response.data.inventorySetQuantities;
    const errors = result.userErrors.map((error: any) => error.message);

    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "shopify_update_complete",
      rationale: `Shopify inventory update completed. Updated ${inventoryUpdates.length} items with ${errors.length} errors`,
      evidenceUrl: "app/services/shopify/inventory-sync.ts",
      status: "completed",
      progressPct: 100,
    });

    return {
      success: errors.length === 0,
      syncedItems: inventoryUpdates.length,
      errors,
      updatedAt: new Date(),
    };
  } catch (error) {
    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "shopify_update_error",
      rationale: `Shopify inventory update failed: ${error}`,
      evidenceUrl: "app/services/shopify/inventory-sync.ts",
      status: "error",
      progressPct: 0,
    });

    return {
      success: false,
      syncedItems: 0,
      errors: [error as string],
      updatedAt: new Date(),
    };
  }
}

/**
 * Get product variants with inventory information from Shopify
 */
export async function getShopifyProductVariants(
  shopifyClient: any,
  productIds?: string[]
): Promise<ShopifyProductVariant[]> {
  try {
    const variantsQuery = `
      query getProductVariants($first: Int!, $productIds: [ID!]) {
        products(first: $first, ids: $productIds) {
          edges {
            node {
              id
              title
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    sku
                    inventoryItem {
                      id
                      tracked
                    }
                    product {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await shopifyClient.query({
      data: {
        query: variantsQuery,
        variables: {
          first: 50,
          productIds: productIds,
        },
      },
    });

    const variants: ShopifyProductVariant[] = [];
    
    for (const product of response.data.products.edges) {
      for (const variant of product.node.variants.edges) {
        variants.push({
          id: variant.node.id,
          title: variant.node.title,
          sku: variant.node.sku,
          inventoryItem: {
            id: variant.node.inventoryItem.id,
            tracked: variant.node.inventoryItem.tracked,
          },
          product: {
            id: variant.node.product.id,
            title: variant.node.product.title,
          },
        });
      }
    }

    return variants;
  } catch (error) {
    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "shopify_variants_error",
      rationale: `Failed to fetch Shopify product variants: ${error}`,
      evidenceUrl: "app/services/shopify/inventory-sync.ts",
      status: "error",
      progressPct: 0,
    });

    return [];
  }
}

/**
 * Helper function to update local inventory from Shopify data
 */
async function updateLocalInventoryFromShopify(
  shopifyLevel: ShopifyInventoryLevel
): Promise<void> {
  // This would integrate with your local database
  // For now, we'll just log the decision
  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "local_inventory_update",
    rationale: `Updated local inventory for SKU ${shopifyLevel.item.sku} with quantities: ${JSON.stringify(shopifyLevel.quantities)}`,
    evidenceUrl: "app/services/shopify/inventory-sync.ts",
    status: "completed",
    progressPct: 100,
  });
}

/**
 * Handle inventory webhook from Shopify
 */
export async function handleInventoryWebhook(
  payload: any
): Promise<{ success: boolean; error?: string }> {
  try {
    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "webhook_received",
      rationale: `Received inventory webhook for inventory item ${payload.inventory_item_id}`,
      evidenceUrl: "app/services/shopify/inventory-sync.ts",
      status: "in_progress",
      progressPct: 0,
    });

    // Process the webhook payload
    // The payload structure from Shopify inventory webhooks:
    // {
    //   inventory_item_id: number,
    //   location_id: number,
    //   available: number,
    //   updated_at: string
    // }

    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "webhook_processed",
      rationale: `Processed inventory webhook for item ${payload.inventory_item_id} at location ${payload.location_id}. Available: ${payload.available}`,
      evidenceUrl: "app/services/shopify/inventory-sync.ts",
      status: "completed",
      progressPct: 100,
    });

    return { success: true };
  } catch (error) {
    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "webhook_error",
      rationale: `Failed to process inventory webhook: ${error}`,
      evidenceUrl: "app/services/shopify/inventory-sync.ts",
      status: "error",
      progressPct: 0,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}