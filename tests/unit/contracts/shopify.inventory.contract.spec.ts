import { describe, test, expect } from "vitest";
import inventoryFixture from "../../fixtures/shopify/inventory.json";

/**
 * Contract tests for Shopify Admin GraphQL Inventory API
 * Validates that mock/live responses match expected schema from docs/data/data_contracts.md
 */

describe("Shopify Inventory API Contract", () => {
  test("fixture matches expected schema structure", () => {
    expect(inventoryFixture.data).toBeDefined();
    expect(inventoryFixture.data.productVariants).toBeDefined();
    expect(inventoryFixture.data.productVariants.edges).toBeInstanceOf(Array);
  });

  test("each variant node has required fields", () => {
    const edges = inventoryFixture.data.productVariants.edges;
    expect(edges.length).toBeGreaterThan(0);

    for (const edge of edges) {
      const { node } = edge;

      // Required fields (per data_contracts.md)
      expect(node.id).toMatch(/^gid:\/\/shopify\/ProductVariant\/\d+$/);
      expect(node.title).toBeTypeOf("string");
      expect(node.inventoryQuantity).toBeTypeOf("number");
      expect(Number.isInteger(node.inventoryQuantity)).toBe(true);

      // Product title required
      expect(node.product).toBeDefined();
      expect(node.product.title).toBeTypeOf("string");
      expect(node.product.title.length).toBeGreaterThan(0);
    }
  });

  test("SKU is nullable with fallback to title", () => {
    const edges = inventoryFixture.data.productVariants.edges;

    const withSku = edges.filter((e) => e.node.sku !== null);
    const withoutSku = edges.filter((e) => e.node.sku === null);

    // Fixture should include both cases
    expect(withSku.length).toBeGreaterThan(0);
    expect(withoutSku.length).toBeGreaterThan(0);

    // All variants without SKU should have meaningful title
    for (const edge of withoutSku) {
      expect(edge.node.title).toBeTypeOf("string");
      expect(edge.node.product.title).toBeTypeOf("string");
    }
  });

  test("inventoryQuantity can be zero or negative", () => {
    const edges = inventoryFixture.data.productVariants.edges;

    // Check for zero inventory case
    const zeroInventory = edges.filter((e) => e.node.inventoryQuantity === 0);
    expect(zeroInventory.length).toBeGreaterThan(0);

    // All inventory quantities should be integers
    for (const edge of edges) {
      expect(Number.isInteger(edge.node.inventoryQuantity)).toBe(true);
    }
  });

  test("aggregates inventory across locations assumption", () => {
    const edges = inventoryFixture.data.productVariants.edges;

    // Per contract: inventoryQuantity is aggregate across all locations
    // Fixture represents post-aggregation values (single number per variant)
    for (const edge of edges) {
      expect(typeof edge.node.inventoryQuantity).toBe("number");

      // Should not have location-specific breakdown in this response
      expect(edge.node).not.toHaveProperty("inventoryLevels");
    }
  });

  test("variant identification works with and without SKU", () => {
    const edges = inventoryFixture.data.productVariants.edges;

    for (const edge of edges) {
      const { node } = edge;

      // Identification strategy: SKU > product.title + variant.title
      const identifier = node.sku || `${node.product.title} - ${node.title}`;

      expect(identifier).toBeTypeOf("string");
      expect(identifier.length).toBeGreaterThan(0);
    }
  });

  test("fixture includes realistic inventory range", () => {
    const edges = inventoryFixture.data.productVariants.edges;
    const quantities = edges.map((e) => e.node.inventoryQuantity);

    // Should include low, medium, and high stock examples
    expect(Math.min(...quantities)).toBeLessThanOrEqual(10); // low stock
    expect(Math.max(...quantities)).toBeGreaterThanOrEqual(50); // high stock
  });

  test("validates variant title is non-empty", () => {
    const edges = inventoryFixture.data.productVariants.edges;

    for (const edge of edges) {
      expect(edge.node.title.length).toBeGreaterThan(0);
      expect(edge.node.title).not.toMatch(/^\s*$/); // not just whitespace
    }
  });
});
