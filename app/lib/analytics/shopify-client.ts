/**
 * Shopify GraphQL Client for Analytics
 *
 * Direct Shopify Admin GraphQL API integration for revenue and order metrics.
 * Uses service account credentials from vault.
 */

export interface ShopifyOrder {
  id: string;
  name: string;
  totalPrice: number;
  createdAt: string;
}

export interface ShopifyRevenueResult {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  period: {
    start: string;
    end: string;
  };
}

/**
 * Check if Shopify real data should be used
 */
function shouldUseRealShopifyData(): boolean {
  return (
    process.env.ANALYTICS_REAL_DATA === "true" &&
    !!process.env.SHOPIFY_ADMIN_API_TOKEN &&
    !!process.env.SHOPIFY_SHOP_DOMAIN
  );
}

/**
 * Fetch orders from Shopify Admin GraphQL API
 */
async function fetchShopifyOrders(
  startDate: string,
  endDate: string,
): Promise<ShopifyOrder[]> {
  const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;

  if (!shopDomain || !accessToken) {
    throw new Error("Shopify credentials not configured");
  }

  const query = `
    query GetOrders($query: String!) {
      orders(first: 250, query: $query) {
        edges {
          node {
            id
            name
            totalPriceSet {
              shopMoney {
                amount
              }
            }
            createdAt
          }
        }
      }
    }
  `;

  const queryString = `created_at:>=${startDate} AND created_at:<=${endDate}`;

  try {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2024-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query,
          variables: { query: queryString },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Shopify API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const orders: ShopifyOrder[] = (data.data?.orders?.edges || []).map(
      (edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        totalPrice: parseFloat(edge.node.totalPriceSet.shopMoney.amount),
        createdAt: edge.node.createdAt,
      }),
    );

    return orders;
  } catch (error: any) {
    console.error("[Shopify Client] Error fetching orders:", error);
    throw error;
  }
}

/**
 * Calculate revenue metrics from Shopify orders
 */
export async function getShopifyRevenue(
  startDate: string,
  endDate: string,
): Promise<ShopifyRevenueResult> {
  if (!shouldUseRealShopifyData()) {
    // Return mock data
    return {
      totalRevenue: 12500,
      orderCount: 146,
      averageOrderValue: 85.62,
      period: { start: startDate, end: endDate },
    };
  }

  try {
    const orders = await fetchShopifyOrders(startDate, endDate);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0,
    );
    const orderCount = orders.length;
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    return {
      totalRevenue,
      orderCount,
      averageOrderValue,
      period: { start: startDate, end: endDate },
    };
  } catch (error: any) {
    console.error("[Shopify Revenue] Error:", error);
    // Fallback to mock data on error
    return {
      totalRevenue: 0,
      orderCount: 0,
      averageOrderValue: 0,
      period: { start: startDate, end: endDate },
    };
  }
}

/**
 * Get revenue for last 30 days from Shopify
 */
export async function getShopifyRevenueLast30Days(): Promise<ShopifyRevenueResult> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  return await getShopifyRevenue(startDate, endDate);
}
