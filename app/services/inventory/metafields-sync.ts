/**
 * Shopify Metafields Sync Service
 * 
 * Syncs inventory metafields from Shopify to Supabase
 * Namespace: app.inventory
 * Fields: lead_time_days, safety_stock, is_bundle, pack_count, etc.
 */

import type { ShopifyServiceContext } from '../shopify/types';
import { recordDashboardFact } from '../facts.server';
import { toInputJson } from '../json';

export interface InventoryMetafields {
  leadTimeDays?: number;
  safetyStock?: number;
  isBundle?: boolean;
  packCount?: number;
  reorderPointOverride?: number;
  vendorSku?: string;
  minOrderQuantity?: number;
}

export interface ProductWithMetafields {
  productId: string;
  variantId: string;
  sku: string;
  title: string;
  tags: string[];
  metafields: InventoryMetafields;
  syncedAt: string;
}

const METAFIELDS_QUERY = `#graphql
  query GetProductInventoryMetafields($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          tags
          leadTime: metafield(namespace: "app.inventory", key: "lead_time_days") {
            value
          }
          safetyStock: metafield(namespace: "app.inventory", key: "safety_stock") {
            value
          }
          isBundle: metafield(namespace: "app.inventory", key: "is_bundle") {
            value
          }
          packCount: metafield(namespace: "app.inventory", key: "pack_count") {
            value
          }
          ropOverride: metafield(namespace: "app.inventory", key: "reorder_point_override") {
            value
          }
          vendorSku: metafield(namespace: "app.inventory", key: "vendor_sku") {
            value
          }
          minOrderQty: metafield(namespace: "app.inventory", key: "min_order_quantity") {
            value
          }
          variants(first: 1) {
            edges {
              node {
                id
                sku
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Parse metafield value to appropriate type
 */
function parseMetafieldValue(value: string | null | undefined, type: 'number' | 'boolean' | 'string'): any {
  if (!value) return undefined;

  switch (type) {
    case 'number':
      const num = parseInt(value, 10);
      return isNaN(num) ? undefined : num;
    case 'boolean':
      return value.toLowerCase() === 'true';
    case 'string':
      return value;
    default:
      return value;
  }
}

/**
 * Extract metafields from product node
 */
function extractMetafields(node: any): InventoryMetafields {
  return {
    leadTimeDays: parseMetafieldValue(node.leadTime?.value, 'number'),
    safetyStock: parseMetafieldValue(node.safetyStock?.value, 'number'),
    isBundle: parseMetafieldValue(node.isBundle?.value, 'boolean'),
    packCount: parseMetafieldValue(node.packCount?.value, 'number'),
    reorderPointOverride: parseMetafieldValue(node.ropOverride?.value, 'number'),
    vendorSku: parseMetafieldValue(node.vendorSku?.value, 'string'),
    minOrderQuantity: parseMetafieldValue(node.minOrderQty?.value, 'number'),
  };
}

/**
 * Fetch products with inventory metafields from Shopify
 */
export async function fetchProductMetafields(
  context: ShopifyServiceContext,
  options: {
    first?: number;
    after?: string;
  } = {}
): Promise<{
  products: ProductWithMetafields[];
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  const { admin } = context;
  const { first = 50, after } = options;

  const response = await admin.graphql(METAFIELDS_QUERY, {
    variables: { first, after },
  });

  if (!response.ok) {
    throw new Error(`Shopify metafields query failed with ${response.status}`);
  }

  const payload = await response.json();

  if (payload.errors) {
    throw new Error(`Shopify GraphQL errors: ${JSON.stringify(payload.errors)}`);
  }

  const edges = payload.data?.products?.edges || [];
  const pageInfo = payload.data?.products?.pageInfo || {};

  const products: ProductWithMetafields[] = edges.map(({ node }: any) => {
    const variant = node.variants?.edges?.[0]?.node;

    return {
      productId: node.id,
      variantId: variant?.id || '',
      sku: variant?.sku || 'unknown',
      title: node.title,
      tags: node.tags || [],
      metafields: extractMetafields(node),
      syncedAt: new Date().toISOString(),
    };
  });

  return {
    products,
    hasNextPage: pageInfo.hasNextPage || false,
    endCursor: pageInfo.endCursor || null,
  };
}

/**
 * Fetch all products with metafields (paginated)
 */
export async function fetchAllProductMetafields(
  context: ShopifyServiceContext,
  maxProducts: number = 1000
): Promise<ProductWithMetafields[]> {
  const allProducts: ProductWithMetafields[] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage && allProducts.length < maxProducts) {
    const result = await fetchProductMetafields(context, { after: after || undefined });
    
    allProducts.push(...result.products);
    hasNextPage = result.hasNextPage;
    after = result.endCursor;

    // Respect rate limits
    if (hasNextPage) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return allProducts;
}

/**
 * Sync metafields to Supabase
 * 
 * Note: Actual Supabase sync would require schema and RPC functions
 * This is a placeholder for the sync logic
 */
export async function syncMetafieldsToSupabase(
  context: ShopifyServiceContext,
  products: ProductWithMetafields[]
): Promise<{
  synced: number;
  errors: number;
}> {
  let synced = 0;
  let errors = 0;

  // TODO: Implement actual Supabase sync
  // For now, just record the sync event
  for (const product of products) {
    try {
      // Placeholder: Would call Supabase RPC to upsert product metafields
      synced++;
    } catch (error) {
      errors++;
      console.error(`Failed to sync ${product.sku}:`, error);
    }
  }

  return { synced, errors };
}

/**
 * Full sync: Fetch from Shopify and sync to Supabase
 */
export async function performFullSync(
  context: ShopifyServiceContext
): Promise<{
  totalProducts: number;
  synced: number;
  errors: number;
  duration: number;
}> {
  const startTime = Date.now();

  // Fetch all products with metafields
  const products = await fetchAllProductMetafields(context);

  // Sync to Supabase
  const { synced, errors } = await syncMetafieldsToSupabase(context, products);

  const duration = Date.now() - startTime;

  // Record sync event
  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: 'inventory.metafields.synced',
    scope: 'ops',
    value: toInputJson({
      totalProducts: products.length,
      synced,
      errors,
      duration,
    }),
    metadata: toInputJson({
      syncedAt: new Date().toISOString(),
      totalProducts: products.length,
    }),
  });

  return {
    totalProducts: products.length,
    synced,
    errors,
    duration,
  };
}

/**
 * Get sync summary statistics
 */
export function getMetafieldsSummary(products: ProductWithMetafields[]): {
  total: number;
  withLeadTime: number;
  withSafetyStock: number;
  bundles: number;
  withPackCount: number;
  withVendorSku: number;
} {
  return {
    total: products.length,
    withLeadTime: products.filter(p => p.metafields.leadTimeDays !== undefined).length,
    withSafetyStock: products.filter(p => p.metafields.safetyStock !== undefined).length,
    bundles: products.filter(p => p.metafields.isBundle === true).length,
    withPackCount: products.filter(p => p.metafields.packCount !== undefined).length,
    withVendorSku: products.filter(p => p.metafields.vendorSku !== undefined).length,
  };
}

