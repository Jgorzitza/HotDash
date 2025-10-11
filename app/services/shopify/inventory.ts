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

function computeAvailableQuantity(variant: InventoryVariantNode) {
  let total = 0;
  const levels = variant.inventoryItem?.inventoryLevels?.edges ?? [];
  for (const level of levels) {
    const node = level.node;
    // Find the "available" quantity from the quantities array
    const availableQty = node.quantities?.find(q => q.name === 'available');
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
  const threshold = options.threshold ?? Number(process.env.SHOPIFY_LOW_STOCK_THRESHOLD ?? 10);
  const first = options.first ?? Number(process.env.SHOPIFY_INVENTORY_LIMIT ?? 50);
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
    throw new ServiceError(`Shopify inventory query failed with ${response.status}.`, {
      scope: "shopify.inventory",
      code: `${response.status}`,
      retryable: response.status >= 500,
    });
  }

  const payload = (await response.json()) as InventoryResponse;

  if (payload.errors?.length) {
    throw new ServiceError(payload.errors.map((err) => err.message).join("; "), {
      scope: "shopify.inventory",
      code: "GRAPHQL_ERROR",
    });
  }

  const edges = payload.data?.productVariants.edges ?? [];
  const generatedAt = new Date().toISOString();
  const alerts: InventoryAlert[] = edges.map(({ node }) => {
    const quantityAvailable =
      node.inventoryQuantity ?? computeAvailableQuantity(node);
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

  const result: InventoryAlertResult = {
    data: alerts,
    fact,
    source: "fresh",
  };
  setCached(cacheKey, result);
  return result;
}
