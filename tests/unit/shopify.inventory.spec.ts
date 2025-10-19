import { beforeEach, describe, expect, it, vi } from "vitest";

import { getInventoryAlerts } from "../../app/services/shopify/inventory";
import type {
  ShopifyGraphqlClient,
  ShopifyServiceContext,
} from "../../app/services/shopify/types";

type MockResponsePayload = Record<string, unknown>;

interface RecordDashboardFactInput {
  shopDomain: string;
  factType: string;
  value: unknown;
  metadata?: unknown;
}

const defaultFact = {
  id: 2,
  shopDomain: "test-shop",
  factType: "shopify.inventory.alerts",
  scope: "ops",
  value: {},
  metadata: null,
  evidenceUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock("../../app/services/facts.server", () => ({
  recordDashboardFact: vi.fn(async (data: RecordDashboardFactInput) => ({
    ...defaultFact,
    shopDomain: data.shopDomain,
    factType: data.factType,
    value: data.value,
    metadata: data.metadata ?? null,
  })),
}));

const mockAdmin = (payload: MockResponsePayload): ShopifyGraphqlClient => ({
  graphql: vi.fn(
    async () =>
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  ),
});

describe("getInventoryAlerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns inventory alerts below threshold", async () => {
    const payload = {
      data: {
        productVariants: {
          edges: [
            {
              node: {
                id: "gid://shopify/ProductVariant/1",
                title: "Small",
                sku: "SKU-LOW",
                inventoryQuantity: 3,
                product: { id: "gid://shopify/Product/1", title: "T-Shirt" },
                inventoryItem: {
                  id: "gid://shopify/InventoryItem/1",
                  inventoryLevels: {
                    edges: [
                      {
                        node: {
                          id: "gid://shopify/InventoryLevel/1",
                          location: {
                            id: "gid://shopify/Location/1",
                            name: "HQ",
                          },
                          available: 3,
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    } satisfies MockResponsePayload;

    const admin = mockAdmin(payload);
    const context: ShopifyServiceContext = {
      admin,
      shopDomain: "test-shop",
    };

    const result = await getInventoryAlerts(context, {
      threshold: 5,
      averageDailySales: 1,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.quantityAvailable).toBe(3);
    expect(result.data[0]?.daysOfCover).toBe(3);
    expect(result.source).toBe("fresh");

    const cached = await getInventoryAlerts(context, {
      threshold: 5,
      averageDailySales: 1,
    });
    expect(cached.source).toBe("cache");
    expect(admin.graphql).toHaveBeenCalledTimes(1);
  });
});
