import { describe, test, expect } from "vitest";
import ordersFixture from "../../fixtures/shopify/orders.json";

/**
 * Contract tests for Shopify Admin GraphQL Orders API
 * Validates that mock/live responses match expected schema from docs/data/data_contracts.md
 */

describe("Shopify Orders API Contract", () => {
  test("fixture matches expected schema structure", () => {
    expect(ordersFixture.data).toBeDefined();
    expect(ordersFixture.data.orders).toBeDefined();
    expect(ordersFixture.data.orders.edges).toBeInstanceOf(Array);
  });

  test("each order node has required fields", () => {
    const edges = ordersFixture.data.orders.edges;
    expect(edges.length).toBeGreaterThan(0);

    for (const edge of edges) {
      const { node } = edge;

      // Required fields (per data_contracts.md)
      expect(node.id).toMatch(/^gid:\/\/shopify\/Order\/\d+$/);
      expect(node.name).toMatch(/^#\d+$/);
      expect(node.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/); // ISO 8601 UTC
      expect(node.displayFulfillmentStatus).toBeTypeOf("string");

      // financialStatus is nullable
      if (node.financialStatus) {
        expect([
          "PENDING",
          "AUTHORIZED",
          "PARTIALLY_PAID",
          "PAID",
          "PARTIALLY_REFUNDED",
          "REFUNDED",
          "VOIDED",
        ]).toContain(node.financialStatus);
      }

      // displayFulfillmentStatus enum validation
      expect([
        "FULFILLED",
        "UNFULFILLED",
        "PARTIAL",
        "RESTOCKED",
        "SCHEDULED",
      ]).toContain(node.displayFulfillmentStatus);
    }
  });

  test("currentTotalPriceSet has valid money structure", () => {
    const edges = ordersFixture.data.orders.edges;

    for (const edge of edges) {
      const { node } = edge;

      // currentTotalPriceSet may be null for draft/test orders
      if (node.currentTotalPriceSet) {
        expect(node.currentTotalPriceSet.shopMoney).toBeDefined();
        expect(node.currentTotalPriceSet.shopMoney.amount).toBeTypeOf("string");
        expect(node.currentTotalPriceSet.shopMoney.currencyCode).toMatch(
          /^[A-Z]{3}$/,
        );

        // Amount should be parseable as decimal
        const amount = parseFloat(node.currentTotalPriceSet.shopMoney.amount);
        expect(Number.isFinite(amount)).toBe(true);
      }
    }
  });

  test("lineItems structure is valid", () => {
    const edges = ordersFixture.data.orders.edges;

    for (const edge of edges) {
      const { node } = edge;

      expect(node.lineItems).toBeDefined();
      expect(node.lineItems.edges).toBeInstanceOf(Array);

      for (const lineItemEdge of node.lineItems.edges) {
        const lineItem = lineItemEdge.node;

        // sku is nullable (fallback to title)
        if (lineItem.sku !== null) {
          expect(lineItem.sku).toBeTypeOf("string");
        }

        // title is required
        expect(lineItem.title).toBeTypeOf("string");
        expect(lineItem.title.length).toBeGreaterThan(0);

        // quantity is required int
        expect(lineItem.quantity).toBeTypeOf("number");
        expect(Number.isInteger(lineItem.quantity)).toBe(true);
        expect(lineItem.quantity).toBeGreaterThan(0);

        // discountedTotalSet may be present
        if (lineItem.discountedTotalSet) {
          expect(lineItem.discountedTotalSet.shopMoney).toBeDefined();
          expect(lineItem.discountedTotalSet.shopMoney.amount).toBeTypeOf(
            "string",
          );
          expect(lineItem.discountedTotalSet.shopMoney.currencyCode).toMatch(
            /^[A-Z]{3}$/,
          );
        }
      }
    }
  });

  test("handles null SKU gracefully", () => {
    const edges = ordersFixture.data.orders.edges;

    // Fixture includes order #1003 with line item that has null SKU
    const order1003 = edges.find((e) => e.node.name === "#1003");
    expect(order1003).toBeDefined();

    const lineItemsWithNullSku = order1003!.node.lineItems.edges.filter(
      (e) => e.node.sku === null,
    );
    expect(lineItemsWithNullSku.length).toBeGreaterThan(0);

    // Should have fallback title
    for (const item of lineItemsWithNullSku) {
      expect(item.node.title).toBeTypeOf("string");
      expect(item.node.title.length).toBeGreaterThan(0);
    }
  });

  test("validates displayFulfillmentStatus enum coverage", () => {
    const edges = ordersFixture.data.orders.edges;
    const statusCoverage = new Set(
      edges.map((e) => e.node.displayFulfillmentStatus),
    );

    // Fixture should cover multiple fulfillment states
    expect(statusCoverage.size).toBeGreaterThan(1);

    // All statuses should be valid enum values
    const validStatuses = [
      "FULFILLED",
      "UNFULFILLED",
      "PARTIAL",
      "RESTOCKED",
      "SCHEDULED",
    ];
    for (const status of statusCoverage) {
      expect(validStatuses).toContain(status);
    }
  });

  test("validates ISO 8601 UTC timestamp format", () => {
    const edges = ordersFixture.data.orders.edges;

    for (const edge of edges) {
      const createdAt = new Date(edge.node.createdAt);

      // Should be valid date
      expect(createdAt.toString()).not.toBe("Invalid Date");

      // Should be in the past or near-present
      expect(createdAt.getTime()).toBeLessThanOrEqual(Date.now());

      // ISO string should round-trip correctly
      expect(edge.node.createdAt).toBe(createdAt.toISOString());
    }
  });
});
