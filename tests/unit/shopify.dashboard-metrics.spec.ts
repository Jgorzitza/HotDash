/**
 * Unit Tests: Shopify Dashboard Metrics
 * 
 * Tests for getDashboardMetrics function
 * Owner: integrations agent
 * Date: 2025-10-15
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardMetrics } from "../../app/lib/shopify/dashboard-metrics";
import type { ShopifyServiceContext } from "../../app/services/shopify/types";

type MockResponsePayload = Record<string, unknown>;

const defaultFact = {
  id: 1,
  shopDomain: "test-shop.myshopify.com",
  factType: "shopify.dashboard.metrics",
  scope: "dashboard",
  value: {},
  metadata: null,
  evidenceUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock facts.server
vi.mock("../../app/services/facts.server", () => ({
  recordDashboardFact: vi.fn(async (data: MockResponsePayload) => ({
    ...defaultFact,
    shopDomain: data.shopDomain as string,
    factType: data.factType as string,
    value: data.value,
    metadata: data.metadata ?? null,
  })),
}));

// Mock cache
vi.mock("../../app/services/shopify/cache", () => ({
  getCached: vi.fn(() => null),
  setCached: vi.fn(),
}));

/**
 * Create mock admin client
 */
const mockAdmin = (revenuePayload: MockResponsePayload, returnsPayload: MockResponsePayload) => {
  let callCount = 0;
  return {
    graphql: vi.fn(async () => {
      callCount++;
      const payload = callCount === 1 ? revenuePayload : returnsPayload;
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }),
  };
};

/**
 * Create mock Shopify service context
 */
const createMockContext = (admin: any): ShopifyServiceContext => ({
  admin,
  shopDomain: "test-shop.myshopify.com",
  operatorEmail: "test@example.com",
});

describe("getDashboardMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates revenue, AOV, and returns correctly", async () => {
    const revenuePayload = {
      data: {
        orders: {
          edges: [
            {
              node: {
                id: "gid://shopify/Order/1",
                name: "#1001",
                createdAt: "2025-10-15T10:00:00.000Z",
                currentTotalPriceSet: {
                  shopMoney: { amount: "150.00", currencyCode: "USD" },
                },
              },
            },
            {
              node: {
                id: "gid://shopify/Order/2",
                name: "#1002",
                createdAt: "2025-10-15T11:00:00.000Z",
                currentTotalPriceSet: {
                  shopMoney: { amount: "250.00", currencyCode: "USD" },
                },
              },
            },
          ],
        },
      },
    };

    const returnsPayload = {
      data: {
        refunds: {
          edges: [
            {
              node: {
                id: "gid://shopify/Refund/1",
                createdAt: "2025-10-15T12:00:00.000Z",
                totalRefundedSet: {
                  shopMoney: { amount: "50.00", currencyCode: "USD" },
                },
                order: {
                  id: "gid://shopify/Order/1",
                  name: "#1001",
                },
              },
            },
          ],
        },
      },
    };

    const admin = mockAdmin(revenuePayload, returnsPayload);
    const context = createMockContext(admin);

    const result = await getDashboardMetrics(context);

    expect(result.data.revenue.value).toBe(400.0); // 150 + 250
    expect(result.data.revenue.currency).toBe("USD");
    expect(result.data.revenue.orderCount).toBe(2);

    expect(result.data.aov.value).toBe(200.0); // 400 / 2
    expect(result.data.aov.currency).toBe("USD");

    expect(result.data.returns.count).toBe(1);
    expect(result.data.returns.totalValue).toBe(50.0);
    expect(result.data.returns.currency).toBe("USD");

    expect(result.source).toBe("fresh");
    expect(result.fact).toBeDefined();
  });

  it("handles zero orders correctly", async () => {
    const revenuePayload = {
      data: {
        orders: {
          edges: [],
        },
      },
    };

    const returnsPayload = {
      data: {
        refunds: {
          edges: [],
        },
      },
    };

    const admin = mockAdmin(revenuePayload, returnsPayload);
    const context = createMockContext(admin);

    const result = await getDashboardMetrics(context);

    expect(result.data.revenue.value).toBe(0);
    expect(result.data.revenue.orderCount).toBe(0);
    expect(result.data.aov.value).toBe(0); // 0 / 0 = 0
    expect(result.data.returns.count).toBe(0);
  });

  it("handles missing price data gracefully", async () => {
    const revenuePayload = {
      data: {
        orders: {
          edges: [
            {
              node: {
                id: "gid://shopify/Order/1",
                name: "#1001",
                createdAt: "2025-10-15T10:00:00.000Z",
                currentTotalPriceSet: null, // Missing price
              },
            },
          ],
        },
      },
    };

    const returnsPayload = {
      data: {
        refunds: {
          edges: [],
        },
      },
    };

    const admin = mockAdmin(revenuePayload, returnsPayload);
    const context = createMockContext(admin);

    const result = await getDashboardMetrics(context);

    expect(result.data.revenue.value).toBe(0);
    expect(result.data.revenue.orderCount).toBe(1);
    expect(result.data.aov.value).toBe(0);
  });

  it("throws ServiceError on GraphQL error", async () => {
    const revenuePayload = {
      errors: [{ message: "GraphQL error occurred" }],
    };

    const returnsPayload = {
      data: {
        refunds: {
          edges: [],
        },
      },
    };

    const admin = mockAdmin(revenuePayload, returnsPayload);
    const context = createMockContext(admin);

    await expect(getDashboardMetrics(context)).rejects.toThrow("GraphQL error occurred");
  });

  it("throws ServiceError on HTTP error", async () => {
    const admin = {
      graphql: vi.fn(async () =>
        new Response(JSON.stringify({ error: "Server error" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
      ),
    };

    const context = createMockContext(admin);

    await expect(getDashboardMetrics(context)).rejects.toThrow(
      "Shopify revenue metrics query failed with 500",
    );
  });

  it("calculates AOV with multiple currencies (uses last)", async () => {
    const revenuePayload = {
      data: {
        orders: {
          edges: [
            {
              node: {
                id: "gid://shopify/Order/1",
                name: "#1001",
                createdAt: "2025-10-15T10:00:00.000Z",
                currentTotalPriceSet: {
                  shopMoney: { amount: "100.00", currencyCode: "USD" },
                },
              },
            },
            {
              node: {
                id: "gid://shopify/Order/2",
                name: "#1002",
                createdAt: "2025-10-15T11:00:00.000Z",
                currentTotalPriceSet: {
                  shopMoney: { amount: "200.00", currencyCode: "CAD" },
                },
              },
            },
          ],
        },
      },
    };

    const returnsPayload = {
      data: {
        refunds: {
          edges: [],
        },
      },
    };

    const admin = mockAdmin(revenuePayload, returnsPayload);
    const context = createMockContext(admin);

    const result = await getDashboardMetrics(context);

    expect(result.data.revenue.value).toBe(300.0);
    expect(result.data.revenue.currency).toBe("CAD"); // Last currency encountered
    expect(result.data.aov.value).toBe(150.0); // 300 / 2
  });
});

