import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSalesPulseSummary } from "../../app/services/shopify/orders";

type MockResponsePayload = Record<string, unknown>;

const defaultFact = {
  id: 1,
  shopDomain: "test-shop",
  factType: "shopify.sales.summary",
  scope: "ops",
  value: {},
  metadata: null,
  evidenceUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock("../../app/services/facts.server", () => ({
  recordDashboardFact: vi.fn(async (data: MockResponsePayload) => ({
    ...defaultFact,
    shopDomain: data.shopDomain as string,
    factType: data.factType as string,
    value: data.value,
    metadata: data.metadata ?? null,
  })),
}));

const mockAdmin = (payload: MockResponsePayload) => ({
  graphql: vi.fn(
    async () =>
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  ),
});

describe("getSalesPulseSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates revenue and top SKUs", async () => {
    const responsePayload = {
      data: {
        orders: {
          edges: [
            {
              node: {
                id: "gid://shopify/Order/1",
                name: "#1001",
                createdAt: "2025-10-04T00:00:00.000Z",
                displayFulfillmentStatus: "UNFULFILLED",
                financialStatus: "AUTHORIZED",
                currentTotalPriceSet: {
                  shopMoney: { amount: "120.50", currencyCode: "USD" },
                },
                lineItems: {
                  edges: [
                    {
                      node: {
                        sku: "SKU-1",
                        title: "Widget",
                        quantity: 2,
                        discountedTotalSet: {
                          shopMoney: { amount: "80.00", currencyCode: "USD" },
                        },
                      },
                    },
                    {
                      node: {
                        sku: "SKU-2",
                        title: "Gadget",
                        quantity: 1,
                        discountedTotalSet: {
                          shopMoney: { amount: "40.50", currencyCode: "USD" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    } satisfies MockResponsePayload;

    const admin = mockAdmin(responsePayload);

    const result = await getSalesPulseSummary({
      admin: admin as any,
      shopDomain: "test-shop",
    });

    expect(result.data.totalRevenue).toBe(120.5);
    expect(result.data.orderCount).toBe(1);
    expect(result.data.topSkus).toHaveLength(2);
    expect(result.data.pendingFulfillment[0]?.orderId).toBe(
      "gid://shopify/Order/1",
    );
    expect(result.source).toBe("fresh");

    const { recordDashboardFact } = await import(
      "../../app/services/facts.server"
    );
    expect(recordDashboardFact).toHaveBeenCalledWith(
      expect.objectContaining({
        factType: "shopify.sales.summary",
        shopDomain: "test-shop",
      }),
    );

    // second call should hit cache
    const cachedResult = await getSalesPulseSummary({
      admin: admin as any,
      shopDomain: "test-shop",
    });
    expect(cachedResult.source).toBe("cache");
    expect(admin.graphql).toHaveBeenCalledTimes(1);
  });
});
