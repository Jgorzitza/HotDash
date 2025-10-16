/**
 * Mock Shopify Server for Tests
 * Owner: integrations agent
 * Date: 2025-10-15
 */

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const shopifyHandlers = [
  http.post("*/admin/api/*/graphql.json", async ({ request }) => {
    const body = await request.json() as { query: string; variables?: any };
    
    if (body.query.includes("orders")) {
      return HttpResponse.json({
        data: {
          orders: {
            edges: [
              {
                node: {
                  id: "gid://shopify/Order/1",
                  name: "#1001",
                  createdAt: "2025-10-15T00:00:00Z",
                  currentTotalPriceSet: {
                    shopMoney: {
                      amount: "100.00",
                      currencyCode: "USD",
                    },
                  },
                },
              },
            ],
          },
        },
      });
    }

    if (body.query.includes("refunds")) {
      return HttpResponse.json({
        data: {
          refunds: {
            edges: [
              {
                node: {
                  id: "gid://shopify/Refund/1",
                  totalRefundedSet: {
                    shopMoney: {
                      amount: "25.00",
                      currencyCode: "USD",
                    },
                  },
                },
              },
            ],
          },
        },
      });
    }

    if (body.query.includes("productVariants")) {
      return HttpResponse.json({
        data: {
          productVariants: {
            edges: [
              {
                node: {
                  id: "gid://shopify/ProductVariant/1",
                  title: "Test Variant",
                  sku: "TEST-001",
                  inventoryQuantity: 5,
                  product: {
                    id: "gid://shopify/Product/1",
                    title: "Test Product",
                  },
                },
              },
            ],
          },
        },
      });
    }

    return HttpResponse.json({ data: {} });
  }),
];

export const shopifyMockServer = setupServer(...shopifyHandlers);
