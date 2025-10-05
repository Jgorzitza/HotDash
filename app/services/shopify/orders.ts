import { ORDER_FULFILLMENTS_QUERY } from "../../../packages/integrations/shopify";
import { recordDashboardFact } from "../facts.server";
import { toInputJson } from "../json";
import { ServiceError, type ServiceResult } from "../types";
import { getCached, setCached } from "./cache";
import type {
  FulfillmentIssue,
  OrderSummary,
  OrderSummaryResult,
  ShopifyServiceContext,
  SkuMetric,
} from "./types";

const SALES_CACHE_KEY = (shopDomain: string) => `shopify:sales:${shopDomain}`;
const SALES_WINDOW_DAYS = Number(process.env.SHOPIFY_SALES_WINDOW_DAYS ?? 1);
const MAX_ORDERS = Number(process.env.SHOPIFY_SALES_ORDER_LIMIT ?? 50);
const TOP_SKU_LIMIT = Number(process.env.SHOPIFY_SALES_TOP_SKU_LIMIT ?? 5);

const SALES_PULSE_QUERY = `#graphql
  query SalesPulse($first: Int!, $query: String) {
    orders(first: $first, sortKey: CREATED_AT, reverse: true, query: $query) {
      edges {
        node {
          id
          name
          createdAt
          displayFulfillmentStatus
          financialStatus
          currentTotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          lineItems(first: 20) {
            edges {
              node {
                sku
                title
                quantity
                discountedTotalSet {
                  shopMoney {
                    amount
                    currencyCode
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

interface SalesPulseResponse {
  data?: {
    orders: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          createdAt: string;
          displayFulfillmentStatus: string;
          financialStatus: string | null;
          currentTotalPriceSet?: {
            shopMoney: {
              amount: string;
              currencyCode: string;
            };
          } | null;
          lineItems: {
            edges: Array<{
              node: {
                sku: string | null;
                title: string;
                quantity: number;
                discountedTotalSet?: {
                  shopMoney: {
                    amount: string;
                    currencyCode: string;
                  };
                } | null;
              };
            }>;
          };
        };
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}

function buildQuery() {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - SALES_WINDOW_DAYS);
  return `created_at:>=${since.toISOString()}`;
}

function toNumber(value: string | undefined | null): number {
  if (!value) return 0;
  const asNumber = Number.parseFloat(value);
  return Number.isFinite(asNumber) ? asNumber : 0;
}

export async function getSalesPulseSummary(
  context: ShopifyServiceContext,
): Promise<OrderSummaryResult> {
  const { admin, shopDomain } = context;
  const cacheKey = SALES_CACHE_KEY(shopDomain);
  const cached = getCached<ServiceResult<OrderSummary>>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" };
  }

  const response = await admin.graphql(SALES_PULSE_QUERY, {
    variables: {
      first: MAX_ORDERS,
      query: buildQuery(),
    },
  });

  if (!response.ok) {
    throw new ServiceError(`Shopify orders query failed with ${response.status}.`, {
      scope: "shopify.orders",
      code: `${response.status}`,
      retryable: response.status >= 500,
    });
  }

  const payload = (await response.json()) as SalesPulseResponse;

  if (payload.errors?.length) {
    throw new ServiceError(payload.errors.map((err) => err.message).join("; "), {
      scope: "shopify.orders",
      code: "GRAPHQL_ERROR",
    });
  }

  const edges = payload.data?.orders.edges ?? [];
  const topSkuMap = new Map<string, SkuMetric>();
  const pending: FulfillmentIssue[] = [];
  let totalRevenue = 0;
  let currency = "USD";

  for (const { node } of edges) {
    const orderRevenue = toNumber(node.currentTotalPriceSet?.shopMoney.amount);
    if (orderRevenue > 0) {
      totalRevenue += orderRevenue;
      currency = node.currentTotalPriceSet?.shopMoney.currencyCode ?? currency;
    }

    if (node.displayFulfillmentStatus && node.displayFulfillmentStatus !== "FULFILLED") {
      pending.push({
        orderId: node.id,
        name: node.name,
        displayStatus: node.displayFulfillmentStatus,
        createdAt: node.createdAt,
      });
    }

    for (const { node: lineItem } of node.lineItems.edges) {
      const skuKey = lineItem.sku || lineItem.title;
      const bucket = topSkuMap.get(skuKey) ?? {
        sku: lineItem.sku ?? "unknown",
        title: lineItem.title,
        quantity: 0,
        revenue: 0,
      };
      bucket.quantity += lineItem.quantity;
      const lineRevenue = toNumber(lineItem.discountedTotalSet?.shopMoney.amount);
      bucket.revenue += lineRevenue;
      topSkuMap.set(skuKey, bucket);
    }
  }

  const topSkus = Array.from(topSkuMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, TOP_SKU_LIMIT);

  const summary: OrderSummary = {
    shopDomain,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    currency,
    orderCount: edges.length,
    topSkus,
    pendingFulfillment: pending,
    generatedAt: new Date().toISOString(),
  };

  const fact = await recordDashboardFact({
    shopDomain,
    factType: "shopify.sales.summary",
    scope: "ops",
    value: toInputJson(summary),
    metadata: toInputJson({
      orderCount: edges.length,
      windowDays: SALES_WINDOW_DAYS,
      generatedAt: summary.generatedAt,
    }),
  });

  const result: OrderSummaryResult = {
    data: summary,
    fact,
    source: "fresh",
  };

  setCached(cacheKey, result);
  return result;
}

export async function getPendingFulfillments(
  context: ShopifyServiceContext,
): Promise<ServiceResult<FulfillmentIssue[]>> {
  const { admin, shopDomain } = context;
  const response = await admin.graphql(ORDER_FULFILLMENTS_QUERY, {
    variables: {
      first: MAX_ORDERS,
    },
  });

  if (!response.ok) {
    throw new ServiceError(`Shopify fulfillment query failed with ${response.status}.`, {
      scope: "shopify.fulfillment",
      code: `${response.status}`,
      retryable: response.status >= 500,
    });
  }

  const json = await response.json();

  const edges = json?.data?.orders?.edges ?? [];
  const mappedIssues = edges
    .map((edge: any): FulfillmentIssue => {
      const order = edge.node;
      const createdAt =
        order.fulfillments?.edges?.[0]?.node?.events?.edges?.[0]?.node?.createdAt ??
        order.createdAt ??
        new Date().toISOString();
      const issue: FulfillmentIssue = {
        orderId: order.id,
        name: order.name,
        displayStatus: order.displayFulfillmentStatus,
        createdAt,
      };
      return issue;
    }) as FulfillmentIssue[];

  const fulfillmentIssues = mappedIssues.filter(
    (issue): issue is FulfillmentIssue =>
      Boolean(issue.displayStatus) && issue.displayStatus !== "FULFILLED",
  );

  const fact = await recordDashboardFact({
    shopDomain,
    factType: "shopify.fulfillment.issues",
    scope: "ops",
    value: toInputJson(fulfillmentIssues),
  });

  return {
    data: fulfillmentIssues,
    fact,
    source: "fresh",
  };
}
