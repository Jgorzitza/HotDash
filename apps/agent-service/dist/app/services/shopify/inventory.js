import { recordDashboardFact } from "../facts.server";
import { toInputJson } from "../json";
import { ServiceError } from "../types";
import { getCached, setCached } from "./cache";
const INVENTORY_CACHE_KEY = (shopDomain, threshold) => `shopify:inventory:${shopDomain}:${threshold}`;
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
function computeAvailableQuantity(variant) {
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
function estimateDaysOfCover(quantity, averageDailySales) {
    if (!averageDailySales || averageDailySales <= 0)
        return null;
    return Number((quantity / averageDailySales).toFixed(2));
}
export async function getInventoryAlerts(context, options = {}) {
    const { admin, shopDomain } = context;
    const threshold = options.threshold ?? Number(process.env.SHOPIFY_LOW_STOCK_THRESHOLD ?? 10);
    const first = options.first ?? Number(process.env.SHOPIFY_INVENTORY_LIMIT ?? 50);
    const averageDailySales = options.averageDailySales ?? 0;
    const cacheKey = INVENTORY_CACHE_KEY(shopDomain, threshold);
    const cached = getCached(cacheKey);
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
        throw new ServiceError(`Shopify inventory query failed with ${response.status}.`, {
            scope: "shopify.inventory",
            code: `${response.status}`,
            retryable: response.status >= 500,
        });
    }
    const payload = (await response.json());
    if (payload.errors?.length) {
        throw new ServiceError(payload.errors.map((err) => err.message).join("; "), {
            scope: "shopify.inventory",
            code: "GRAPHQL_ERROR",
        });
    }
    const edges = payload.data?.productVariants.edges ?? [];
    const generatedAt = new Date().toISOString();
    const alerts = edges.map(({ node }) => {
        const quantityAvailable = node.inventoryQuantity ?? computeAvailableQuantity(node);
        const daysOfCover = estimateDaysOfCover(quantityAvailable, averageDailySales);
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
    const result = {
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
export async function getBundlePackMetadata(ctx, options = {}) {
    const { shopDomain, admin } = ctx;
    const limit = options.limit || 250;
    // Query for products with BUNDLE or PACK tags
    const query = "tag:BUNDLE* OR tag:PACK*";
    const response = await admin.graphql(BUNDLE_PACK_QUERY, {
        variables: { first: limit, query },
    });
    const payload = await response.json();
    if (payload.errors?.length) {
        throw new ServiceError(payload.errors.map((err) => err.message).join("; "), {
            scope: "shopify.inventory.bundlePack",
            code: "GRAPHQL_ERROR",
        });
    }
    const products = payload.data?.products?.edges || [];
    return products.map((edge) => {
        const node = edge.node;
        const tags = node.tags || [];
        // Check for BUNDLE:TRUE tag
        const isBundle = tags.some((tag) => tag.toUpperCase() === "BUNDLE:TRUE");
        // Check for PACK:X tag (e.g., PACK:6, PACK:12)
        const packTag = tags.find((tag) => tag.toUpperCase().startsWith("PACK:"));
        const packSize = packTag
            ? parseInt(packTag.split(":")[1], 10) || null
            : null;
        const variants = (node.variants?.edges || []).map((v) => ({
            id: v.node.id,
            title: v.node.title,
            sku: v.node.sku || "",
            inventoryQuantity: v.node.inventoryQuantity || 0,
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
//# sourceMappingURL=inventory.js.map