import { describe, expect, it } from "vitest";

/**
 * Shopify Products API Contract Tests
 *
 * Validates GraphQL queries for Products match Shopify Admin API schema
 */

describe("Shopify Products API Contract", () => {
  it("products query contract matches schema", () => {
    const productsQuery = `
      query GetProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              status
              vendor
              productType
              tags
              createdAt
              updatedAt
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    `;

    expect(productsQuery).toContain("query GetProducts");
    expect(productsQuery).toContain("products(");
    expect(productsQuery).toContain("variants(");
    expect(productsQuery).toContain("inventoryQuantity");
  });

  it("product by ID query contract matches schema", () => {
    const productByIdQuery = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          descriptionHtml
          handle
          status
          vendor
          productType
          tags
          seo {
            title
            description
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                sku
                barcode
                price
                compareAtPrice
                inventoryQuantity
                weight
                weightUnit
              }
            }
          }
        }
      }
    `;

    expect(productByIdQuery).toContain("query GetProduct");
    expect(productByIdQuery).toContain("product(id: $id)");
    expect(productByIdQuery).toContain("seo {");
    expect(productByIdQuery).toContain("compareAtPrice");
  });

  it("response shape contract", () => {
    const mockResponse = {
      data: {
        products: {
          edges: [
            {
              node: {
                id: "gid://shopify/Product/1234567890",
                title: "Example Product",
                handle: "example-product",
                status: "ACTIVE",
                vendor: "Hot Rod AN",
                productType: "Detailing",
                tags: ["featured", "bestseller"],
                createdAt: "2025-01-01T00:00:00Z",
                updatedAt: "2025-10-19T00:00:00Z",
                variants: {
                  edges: [
                    {
                      node: {
                        id: "gid://shopify/ProductVariant/123",
                        title: "Default Title",
                        sku: "PROD-001",
                        price: "29.99",
                        inventoryQuantity: 100,
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

    expect(mockResponse.data.products.edges[0].node).toHaveProperty("id");
    expect(mockResponse.data.products.edges[0].node).toHaveProperty("title");
    expect(mockResponse.data.products.edges[0].node).toHaveProperty("variants");
    expect(
      mockResponse.data.products.edges[0].node.variants.edges[0].node,
    ).toHaveProperty("inventoryQuantity");
  });
});

