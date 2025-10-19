import { describe, expect, it, vi } from "vitest";
import {
  parseShopifyInventoryResponse,
  fetchAllInventory,
  filterInventory,
  groupByProduct,
  calculateInventoryValue,
  sortInventory,
  type InventoryItem,
} from "../../../../app/services/inventory/shopify-sync";

describe("Shopify Inventory Sync Service", () => {
  const mockShopifyResponse = {
    data: {
      products: {
        pageInfo: { hasNextPage: false, endCursor: null },
        edges: [
          {
            node: {
              id: "gid://shopify/Product/1",
              title: "Hot Sauce Variety Pack",
              handle: "hot-sauce-variety",
              tags: ["BUNDLE:TRUE", "PACK:12"],
              variants: [
                {
                  node: {
                    id: "gid://shopify/ProductVariant/1",
                    sku: "HSVP-12",
                    title: "Default",
                    inventoryQuantity: 50,
                    price: "48.00",
                  },
                },
              ],
            },
          },
          {
            node: {
              id: "gid://shopify/Product/2",
              title: "Jalapeño Salsa",
              handle: "jalapeno-salsa",
              tags: ["seasonal"],
              variants: [
                {
                  node: {
                    id: "gid://shopify/ProductVariant/2",
                    sku: "JAL-001",
                    title: "8oz",
                    inventoryQuantity: 100,
                    price: "8.99",
                  },
                },
                {
                  node: {
                    id: "gid://shopify/ProductVariant/3",
                    sku: "JAL-002",
                    title: "16oz",
                    inventoryQuantity: 75,
                    price: "14.99",
                  },
                },
              ],
            },
          },
        ],
      },
    },
  };

  describe("parseShopifyInventoryResponse", () => {
    it("parses GraphQL response correctly", () => {
      const result = parseShopifyInventoryResponse(mockShopifyResponse);

      expect(result.items).toHaveLength(3); // 1 + 2 variants
      expect(result.pageInfo.hasNextPage).toBe(false);
      expect(result.pageInfo.endCursor).toBeNull();
    });

    it("extracts product and variant data", () => {
      const result = parseShopifyInventoryResponse(mockShopifyResponse);
      const item = result.items[0];

      expect(item.productId).toBe("gid://shopify/Product/1");
      expect(item.productTitle).toBe("Hot Sauce Variety Pack");
      expect(item.variantId).toBe("gid://shopify/ProductVariant/1");
      expect(item.variantTitle).toBe("Default");
      expect(item.sku).toBe("HSVP-12");
      expect(item.quantity).toBe(50);
      expect(item.price).toBe(48.0);
      expect(item.tags).toEqual(["BUNDLE:TRUE", "PACK:12"]);
    });

    it("handles products with multiple variants", () => {
      const result = parseShopifyInventoryResponse(mockShopifyResponse);
      const jalapenoItems = result.items.filter((item) =>
        item.productTitle.includes("Jalapeño"),
      );

      expect(jalapenoItems).toHaveLength(2);
      expect(jalapenoItems[0].variantTitle).toBe("8oz");
      expect(jalapenoItems[1].variantTitle).toBe("16oz");
    });

    it("converts price strings to numbers", () => {
      const result = parseShopifyInventoryResponse(mockShopifyResponse);

      expect(result.items[0].price).toBe(48.0);
      expect(result.items[1].price).toBe(8.99);
      expect(result.items[2].price).toBe(14.99);
    });

    it("handles null inventory quantities", () => {
      const responseWithNull = {
        data: {
          products: {
            pageInfo: { hasNextPage: false, endCursor: null },
            edges: [
              {
                node: {
                  id: "gid://shopify/Product/3",
                  title: "Test Product",
                  handle: "test",
                  tags: [],
                  variants: [
                    {
                      node: {
                        id: "gid://shopify/ProductVariant/4",
                        sku: null,
                        title: "Default",
                        inventoryQuantity: null,
                        price: "10.00",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      };

      const result = parseShopifyInventoryResponse(responseWithNull as any);
      expect(result.items[0].quantity).toBe(0);
    });
  });

  describe("fetchAllInventory", () => {
    it("fetches single page of results", async () => {
      const mockFetch = vi.fn().mockResolvedValue(mockShopifyResponse);

      const items = await fetchAllInventory(mockFetch, 100);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(items).toHaveLength(3);
    });

    it("handles pagination", async () => {
      const page1 = {
        data: {
          products: {
            pageInfo: { hasNextPage: true, endCursor: "cursor1" },
            edges: [
              {
                node: {
                  id: "gid://shopify/Product/1",
                  title: "Product 1",
                  handle: "product-1",
                  tags: [],
                  variants: [
                    {
                      node: {
                        id: "gid://shopify/ProductVariant/1",
                        sku: "P1",
                        title: "Default",
                        inventoryQuantity: 10,
                        price: "10.00",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      };

      const page2 = {
        data: {
          products: {
            pageInfo: { hasNextPage: false, endCursor: null },
            edges: [
              {
                node: {
                  id: "gid://shopify/Product/2",
                  title: "Product 2",
                  handle: "product-2",
                  tags: [],
                  variants: [
                    {
                      node: {
                        id: "gid://shopify/ProductVariant/2",
                        sku: "P2",
                        title: "Default",
                        inventoryQuantity: 20,
                        price: "20.00",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      };

      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);

      const items = await fetchAllInventory(mockFetch, 1);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(1, expect.any(String), {
        first: 1,
      });
      expect(mockFetch).toHaveBeenNthCalledWith(2, expect.any(String), {
        first: 1,
        after: "cursor1",
      });
      expect(items).toHaveLength(2);
    });
  });

  describe("filterInventory", () => {
    const items: InventoryItem[] = [
      {
        productId: "1",
        productTitle: "Product 1",
        variantId: "1",
        variantTitle: "Default",
        sku: "SKU1",
        quantity: 10,
        tags: ["BUNDLE:TRUE"],
        price: 10.0,
      },
      {
        productId: "2",
        productTitle: "Product 2",
        variantId: "2",
        variantTitle: "Default",
        sku: null,
        quantity: 50,
        tags: ["seasonal"],
        price: 20.0,
      },
      {
        productId: "3",
        productTitle: "Product 3",
        variantId: "3",
        variantTitle: "Default",
        sku: "SKU3",
        quantity: 100,
        tags: ["BUNDLE:TRUE", "PACK:6"],
        price: 30.0,
      },
    ];

    it("filters by minimum quantity", () => {
      const filtered = filterInventory(items, { minQuantity: 50 });
      expect(filtered).toHaveLength(2);
      expect(filtered[0].quantity).toBe(50);
      expect(filtered[1].quantity).toBe(100);
    });

    it("filters by maximum quantity", () => {
      const filtered = filterInventory(items, { maxQuantity: 50 });
      expect(filtered).toHaveLength(2);
      expect(filtered[0].quantity).toBe(10);
      expect(filtered[1].quantity).toBe(50);
    });

    it("filters by quantity range", () => {
      const filtered = filterInventory(items, {
        minQuantity: 20,
        maxQuantity: 80,
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].quantity).toBe(50);
    });

    it("filters by tags (case insensitive)", () => {
      const filtered = filterInventory(items, { tags: ["bundle:true"] });
      expect(filtered).toHaveLength(2);
    });

    it("filters by multiple tags (AND logic)", () => {
      const filtered = filterInventory(items, {
        tags: ["BUNDLE:TRUE", "PACK:6"],
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].productId).toBe("3");
    });

    it("filters by SKU presence", () => {
      const withSku = filterInventory(items, { hasSku: true });
      expect(withSku).toHaveLength(2);

      const withoutSku = filterInventory(items, { hasSku: false });
      expect(withoutSku).toHaveLength(1);
      expect(withoutSku[0].sku).toBeNull();
    });

    it("combines multiple filters", () => {
      const filtered = filterInventory(items, {
        minQuantity: 10,
        tags: ["BUNDLE:TRUE"],
        hasSku: true,
      });
      expect(filtered).toHaveLength(2);
    });
  });

  describe("groupByProduct", () => {
    const items: InventoryItem[] = [
      {
        productId: "1",
        productTitle: "Product 1",
        variantId: "1a",
        variantTitle: "Small",
        sku: "P1-S",
        quantity: 10,
        tags: [],
        price: 10.0,
      },
      {
        productId: "1",
        productTitle: "Product 1",
        variantId: "1b",
        variantTitle: "Large",
        sku: "P1-L",
        quantity: 20,
        tags: [],
        price: 15.0,
      },
      {
        productId: "2",
        productTitle: "Product 2",
        variantId: "2a",
        variantTitle: "Default",
        sku: "P2",
        quantity: 30,
        tags: [],
        price: 20.0,
      },
    ];

    it("groups items by product ID", () => {
      const grouped = groupByProduct(items);

      expect(grouped.size).toBe(2);
      expect(grouped.get("1")).toHaveLength(2);
      expect(grouped.get("2")).toHaveLength(1);
    });

    it("maintains variant data in groups", () => {
      const grouped = groupByProduct(items);
      const product1Variants = grouped.get("1")!;

      expect(product1Variants[0].variantTitle).toBe("Small");
      expect(product1Variants[1].variantTitle).toBe("Large");
    });
  });

  describe("calculateInventoryValue", () => {
    const items: InventoryItem[] = [
      {
        productId: "1",
        productTitle: "Product 1",
        variantId: "1",
        variantTitle: "Default",
        sku: "P1",
        quantity: 10,
        tags: [],
        price: 12.5,
      },
      {
        productId: "2",
        productTitle: "Product 2",
        variantId: "2",
        variantTitle: "Default",
        sku: "P2",
        quantity: 5,
        tags: [],
        price: 20.0,
      },
    ];

    it("calculates total inventory value", () => {
      const value = calculateInventoryValue(items);
      // (10 * 12.5) + (5 * 20.0) = 125 + 100 = 225
      expect(value).toBe(225.0);
    });

    it("handles empty array", () => {
      expect(calculateInventoryValue([])).toBe(0);
    });
  });

  describe("sortInventory", () => {
    const items: InventoryItem[] = [
      {
        productId: "1",
        productTitle: "Zebra Product",
        variantId: "1",
        variantTitle: "Default",
        sku: "Z1",
        quantity: 50,
        tags: [],
        price: 15.0,
      },
      {
        productId: "2",
        productTitle: "Apple Product",
        variantId: "2",
        variantTitle: "Default",
        sku: "A1",
        quantity: 100,
        tags: [],
        price: 10.0,
      },
      {
        productId: "3",
        productTitle: "Mango Product",
        variantId: "3",
        variantTitle: "Default",
        sku: "M1",
        quantity: 25,
        tags: [],
        price: 20.0,
      },
    ];

    it("sorts by quantity ascending", () => {
      const sorted = sortInventory(items, "quantity", "asc");
      expect(sorted[0].quantity).toBe(25);
      expect(sorted[1].quantity).toBe(50);
      expect(sorted[2].quantity).toBe(100);
    });

    it("sorts by quantity descending", () => {
      const sorted = sortInventory(items, "quantity", "desc");
      expect(sorted[0].quantity).toBe(100);
      expect(sorted[1].quantity).toBe(50);
      expect(sorted[2].quantity).toBe(25);
    });

    it("sorts by price ascending", () => {
      const sorted = sortInventory(items, "price", "asc");
      expect(sorted[0].price).toBe(10.0);
      expect(sorted[1].price).toBe(15.0);
      expect(sorted[2].price).toBe(20.0);
    });

    it("sorts by title ascending", () => {
      const sorted = sortInventory(items, "title", "asc");
      expect(sorted[0].productTitle).toBe("Apple Product");
      expect(sorted[1].productTitle).toBe("Mango Product");
      expect(sorted[2].productTitle).toBe("Zebra Product");
    });

    it("sorts by title descending", () => {
      const sorted = sortInventory(items, "title", "desc");
      expect(sorted[0].productTitle).toBe("Zebra Product");
      expect(sorted[1].productTitle).toBe("Mango Product");
      expect(sorted[2].productTitle).toBe("Apple Product");
    });

    it("does not mutate original array", () => {
      const originalOrder = [...items];
      sortInventory(items, "quantity", "asc");
      expect(items).toEqual(originalOrder);
    });
  });
});
