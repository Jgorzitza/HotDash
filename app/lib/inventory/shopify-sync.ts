/**
 * Shopify Inventory Sync - Live inventory data synchronization
 *
 * Re-exports from app/services/inventory/shopify-sync.ts
 * Manager-specified path: app/lib/inventory/shopify-sync.ts
 */

export {
  PRODUCTS_INVENTORY_QUERY,
  fetchAllInventory,
  parseShopifyInventoryResponse,
  filterInventory,
  groupByProduct,
  calculateInventoryValue,
  sortInventory,
  type ShopifyProduct,
  type ShopifyVariant,
  type InventoryItem,
} from "../../services/inventory/shopify-sync";
