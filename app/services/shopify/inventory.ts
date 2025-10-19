import { recordDashboardFact } from "../facts.server";
import { toInputJson } from "../json";
import { ServiceError } from "../types";
import { getCached, setCached } from "./cache";
import type {
  InventoryAlert,
  InventoryAlertResult,
  ShopifyServiceContext,
} from "./types";

const INVENTORY_CACHE_KEY = (shopDomain: string, threshold: number) =>
  `shopify:inventory:${shopDomain}:${threshold}`;

const LOW_STOCK_QUERY = `#graphql
  query InventoryHeatmap($first: Int!, $query: String!) {
    productVariants(first: $first, query: $query) {
      edges {
        node {
          id
          title
          sku
          inventoryQuantity
          product {
            id
            title
            tags
          }
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
    }
  }
`;

const BUNDLE_PACK_QUERY = `#graphql
  query BundlePackMetadata($first: Int!, $query: String!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          tags
          variants(first: 10) {
            edges {
              node {
                id
                title
                sku
                inventoryQuantity
              }
            }
          }
        }
      }
    }
  }
`;

interface InventoryVariantNode {
  id: string;
  title: string;
  sku: string | null;
  inventoryQuantity: number | null;
  product: {
    id: string;
    title: string;
  };
  inventoryItem: {
    id: string;
    inventoryLevels: {
      edges: Array<{
        node: {
          id: string;
          location: { id: string; name: string };
          quantities: Array<{
            name: string;
            quantity: number | null;
          }>;
        };
      }>;
    };
  };
}

interface InventoryResponse {
  data?: {
    productVariants: {
      edges: Array<{
        node: InventoryVariantNode;
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}

interface BundleVariantEdge {
  node: {
    id: string;
    title: string;
    sku: string | null;
    inventoryQuantity: number | null;
  };
}

interface BundleProductNode {
  id: string;
  title: string;
  tags: string[];
  variants: { edges: BundleVariantEdge[] };
}

interface BundleProductsResponse {
  data?: {
    products?: {
      edges: Array<{ node: BundleProductNode }>;
    };
  };
  errors?: Array<{ message: string }>;
}

function computeAvailableQuantity(variant: InventoryVariantNode) {
  let total = 0;
  const levels = variant.inventoryItem?.inventoryLevels?.edges ?? [];
  for (const level of levels) {
    const node = level.node;
    // Find the "available" quantity from the quantities array
    const availableQty = node.quantities?.find((q) => q.name === "available");
    const quantity = availableQty?.quantity ?? 0;
    total += quantity ?? 0;
  }
  return total;
}

function estimateDaysOfCover(quantity: number, averageDailySales: number) {
  if (!averageDailySales || averageDailySales <= 0) return null;
  return Number((quantity / averageDailySales).toFixed(2));
}

interface GetInventoryAlertsOptions {
  threshold?: number;
  first?: number;
  averageDailySales?: number;
}

export async function getInventoryAlerts(
  context: ShopifyServiceContext,
  options: GetInventoryAlertsOptions = {},
): Promise<InventoryAlertResult> {
  const { admin, shopDomain } = context;
  const threshold =
    options.threshold ?? Number(process.env.SHOPIFY_LOW_STOCK_THRESHOLD ?? 10);
  const first =
    options.first ?? Number(process.env.SHOPIFY_INVENTORY_LIMIT ?? 50);
  const averageDailySales = options.averageDailySales ?? 0;
  const cacheKey = INVENTORY_CACHE_KEY(shopDomain, threshold);
  const cached = getCached<InventoryAlertResult>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" };
  }

  const response = await admin.graphql(LOW_STOCK_QUERY, {
    variables: {
      first,
      query: `inventory_quantity:<${threshold}`,
    },
  });

  if (!response.ok) {
    throw new ServiceError(
      `Shopify inventory query failed with ${response.status}.`,
      {
        scope: "shopify.inventory",
        code: `${response.status}`,
        retryable: response.status >= 500,
      },
    );
  }

  const payload = (await response.json()) as InventoryResponse;

  if (payload.errors?.length) {
    throw new ServiceError(
      payload.errors.map((err) => err.message).join("; "),
      {
        scope: "shopify.inventory",
        code: "GRAPHQL_ERROR",
      },
    );
  }

  const edges = payload.data?.productVariants.edges ?? [];
  const generatedAt = new Date().toISOString();
  const alerts: InventoryAlert[] = edges.map(({ node }) => {
    const quantityAvailable =
      node.inventoryQuantity ?? computeAvailableQuantity(node);
    const daysOfCover = estimateDaysOfCover(
      quantityAvailable,
      averageDailySales,
    );

    return {
      sku: node.sku ?? "unknown",
      productId: node.product.id,
      variantId: node.id,
      title: `${node.product.title} — ${node.title}`,
      quantityAvailable,
      threshold,
      daysOfCover,
      generatedAt,
    };
  });

  const fact = await recordDashboardFact({
    shopDomain,
    factType: "shopify.inventory.alerts",
    scope: "ops",
    value: toInputJson(alerts),
    metadata: toInputJson({
      threshold,
      generatedAt,
    }),
  });

  const result: InventoryAlertResult = {
    data: alerts,
    fact,
    source: "fresh",
  };
  setCached(cacheKey, result);
  return result;
}

/**
 * Get bundle and pack metadata from product tags
 * Identifies products with BUNDLE:TRUE or PACK:X tags
 */
export async function getBundlePackMetadata(
  ctx: ShopifyServiceContext,
  options: { limit?: number } = {},
): Promise<
  Array<{
    productId: string;
    title: string;
    isBundle: boolean;
    packSize: number | null;
    tags: string[];
    variants: Array<{
      id: string;
      title: string;
      sku: string;
      inventoryQuantity: number;
    }>;
  }>
> {
  const { admin } = ctx;
  const limit = options.limit || 250;

  // Query for products with BUNDLE or PACK tags
  const query = "tag:BUNDLE* OR tag:PACK*";

  const response = await admin.graphql(BUNDLE_PACK_QUERY, {
    variables: { first: limit, query },
  });

  const payload = (await response.json()) as BundleProductsResponse;

  if (payload.errors?.length) {
    throw new ServiceError(
      payload.errors.map((err) => err.message).join("; "),
      {
        scope: "shopify.inventory.bundlePack",
        code: "GRAPHQL_ERROR",
      },
    );
  }

  const products = payload.data?.products?.edges ?? [];

  return products.map(({ node }) => {
    const tags = node.tags ?? [];

    // Check for BUNDLE:TRUE tag
    const isBundle = tags.some(
      (tag: string) => tag.toUpperCase() === "BUNDLE:TRUE",
    );

    // Check for PACK:X tag (e.g., PACK:6, PACK:12)
    const packTag = tags.find((tag: string) =>
      tag.toUpperCase().startsWith("PACK:"),
    );
    const packSize = packTag
      ? parseInt(packTag.split(":")[1], 10) || null
      : null;

    const variants = (node.variants?.edges ?? []).map(({ node: variant }) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku ?? "",
      inventoryQuantity: variant.inventoryQuantity ?? 0,
    }));

    return {
      productId: node.id,
      title: node.title,
      isBundle,
      packSize,
      tags,
      variants,
    };
  });
}
