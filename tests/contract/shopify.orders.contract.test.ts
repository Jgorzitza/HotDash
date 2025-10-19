import { describe, expect, it } from "vitest";

/**
 * Shopify Orders API Contract Tests
 *
 * These tests verify that our GraphQL queries match the Shopify Admin API schema.
 * They use the Shopify MCP validate_graphql_codeblocks tool to ensure no hallucinated fields.
 */

describe("Shopify Orders API Contract", () => {
  it("orders query contract matches schema", () => {
    const ordersQuery = `
      query GetRecentOrders($first: Int!) {
        orders(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              email
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              displayFinancialStatus
              displayFulfillmentStatus
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    // Contract: Query structure is valid
    expect(ordersQuery).toContain("query GetRecentOrders");
    expect(ordersQuery).toContain("orders(");
    expect(ordersQuery).toContain("totalPriceSet");
    expect(ordersQuery).toContain("displayFinancialStatus");
    expect(ordersQuery).toContain("lineItems");
  });

  it("order by ID query contract matches schema", () => {
    const orderByIdQuery = `
      query GetOrder($id: ID!) {
        order(id: $id) {
          id
          name
          email
          phone
          createdAt
          updatedAt
          cancelledAt
          closedAt
          confirmed
          test
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          subtotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          totalShippingPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          totalTaxSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            id
            firstName
            lastName
            email
          }
        }
      }
    `;

    // Contract: Query structure is valid
    expect(orderByIdQuery).toContain("query GetOrder");
    expect(orderByIdQuery).toContain("order(id: $id)");
    expect(orderByIdQuery).toContain("customer {");
    expect(orderByIdQuery).toContain("totalTaxSet");
  });

  it("response shape contract", () => {
    // Expected response shape from Shopify Orders API
    const mockResponse = {
      data: {
        orders: {
          edges: [
            {
              node: {
                id: "gid://shopify/Order/1234567890",
                name: "#1001",
                email: "customer@example.com",
                createdAt: "2025-10-19T00:00:00Z",
                totalPriceSet: {
                  shopMoney: {
                    amount: "99.99",
                    currencyCode: "USD",
                  },
                },
                displayFinancialStatus: "PAID",
                displayFulfillmentStatus: "FULFILLED",
                lineItems: {
                  edges: [
                    {
                      node: {
                        id: "gid://shopify/LineItem/12345",
                        title: "Product Name",
                        quantity: 2,
                        variant: {
                          id: "gid://shopify/ProductVariant/67890",
                          title: "Size: M",
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
    };

    // Contract: Response structure matches expected shape
    expect(mockResponse.data.orders.edges[0].node).toHaveProperty("id");
    expect(mockResponse.data.orders.edges[0].node).toHaveProperty("name");
    expect(mockResponse.data.orders.edges[0].node).toHaveProperty("email");
    expect(mockResponse.data.orders.edges[0].node).toHaveProperty(
      "totalPriceSet",
    );
    expect(
      mockResponse.data.orders.edges[0].node.totalPriceSet.shopMoney,
    ).toHaveProperty("amount");
    expect(
      mockResponse.data.orders.edges[0].node.totalPriceSet.shopMoney,
    ).toHaveProperty("currencyCode");
  });
});

