/**
 * Tests for Picker Payout Calculation
 */

import { describe, it, expect } from "vitest";
import {
  extractPackSize,
  calculatePayoutAmount,
  getPayoutBracket,
  calculatePickerPayout,
  calculateMultipleOrderPayouts,
  calculateAggregatePickerPayout,
  type PayoutItem,
} from "~/services/inventory/payout";

describe("extractPackSize", () => {
  it("should extract pack size from PACK: tag (uppercase)", () => {
    expect(extractPackSize(["PACK:6"])).toBe(6);
    expect(extractPackSize(["PACK:12"])).toBe(12);
    expect(extractPackSize(["PACK:1"])).toBe(1);
  });

  it("should extract pack size from pack: tag (lowercase)", () => {
    expect(extractPackSize(["pack:6"])).toBe(6);
    expect(extractPackSize(["pack:12"])).toBe(12);
  });

  it("should extract pack size from Pack: tag (mixed case)", () => {
    expect(extractPackSize(["Pack:6"])).toBe(6);
  });

  it("should return 1 when no PACK tag present", () => {
    expect(extractPackSize(["BUNDLE:TRUE", "FEATURED"])).toBe(1);
    expect(extractPackSize([])).toBe(1);
    expect(extractPackSize(undefined)).toBe(1);
  });

  it("should return 1 when PACK tag is malformed", () => {
    expect(extractPackSize(["PACK:"])).toBe(1);
    expect(extractPackSize(["PACK:ABC"])).toBe(1);
    expect(extractPackSize(["PACK:0"])).toBe(1);
    expect(extractPackSize(["PACK:-5"])).toBe(1);
  });

  it("should extract pack size from tags with multiple tags", () => {
    expect(extractPackSize(["BUNDLE:TRUE", "PACK:6", "FEATURED"])).toBe(6);
  });
});

describe("calculatePayoutAmount", () => {
  it("should return $0.00 for 0 pieces", () => {
    expect(calculatePayoutAmount(0)).toBe(0);
  });

  it("should return $2.00 for 1-4 pieces", () => {
    expect(calculatePayoutAmount(1)).toBe(2.0);
    expect(calculatePayoutAmount(2)).toBe(2.0);
    expect(calculatePayoutAmount(3)).toBe(2.0);
    expect(calculatePayoutAmount(4)).toBe(2.0);
  });

  it("should return $4.00 for 5-10 pieces", () => {
    expect(calculatePayoutAmount(5)).toBe(4.0);
    expect(calculatePayoutAmount(7)).toBe(4.0);
    expect(calculatePayoutAmount(10)).toBe(4.0);
  });

  it("should return $7.00 for 11+ pieces", () => {
    expect(calculatePayoutAmount(11)).toBe(7.0);
    expect(calculatePayoutAmount(15)).toBe(7.0);
    expect(calculatePayoutAmount(100)).toBe(7.0);
  });

  it("should return $0.00 for negative pieces", () => {
    expect(calculatePayoutAmount(-5)).toBe(0);
  });
});

describe("getPayoutBracket", () => {
  it("should return correct bracket for 1-4 pieces", () => {
    expect(getPayoutBracket(1)).toBe("1-4");
    expect(getPayoutBracket(4)).toBe("1-4");
  });

  it("should return correct bracket for 5-10 pieces", () => {
    expect(getPayoutBracket(5)).toBe("5-10");
    expect(getPayoutBracket(10)).toBe("5-10");
  });

  it("should return correct bracket for 11+ pieces", () => {
    expect(getPayoutBracket(11)).toBe("11+");
    expect(getPayoutBracket(50)).toBe("11+");
  });
});

describe("calculatePickerPayout", () => {
  it("should return zero payout for empty order", () => {
    const result = calculatePickerPayout([]);
    expect(result.totalPieces).toBe(0);
    expect(result.payoutAmount).toBe(0);
    expect(result.bracket).toBe("1-4");
    expect(result.items).toHaveLength(0);
  });

  it("should calculate payout for single item without PACK tag (1 piece)", () => {
    const items: PayoutItem[] = [
      { productId: "prod_1", quantity: 1, tags: [] },
    ];

    const result = calculatePickerPayout(items);
    expect(result.totalPieces).toBe(1);
    expect(result.payoutAmount).toBe(2.0);
    expect(result.bracket).toBe("1-4");
  });

  it("should calculate payout for single item with PACK:6 tag", () => {
    const items: PayoutItem[] = [
      { productId: "prod_1", quantity: 1, tags: ["PACK:6"] },
    ];

    const result = calculatePickerPayout(items);
    expect(result.totalPieces).toBe(6);
    expect(result.payoutAmount).toBe(4.0);
    expect(result.bracket).toBe("5-10");
  });

  it("should calculate payout for multiple items (1-4 bracket)", () => {
    const items: PayoutItem[] = [
      { productId: "prod_1", quantity: 2, tags: [] },
      { productId: "prod_2", quantity: 1, tags: [] },
    ];

    const result = calculatePickerPayout(items);
    expect(result.totalPieces).toBe(3);
    expect(result.payoutAmount).toBe(2.0);
    expect(result.bracket).toBe("1-4");
  });

  it("should calculate payout for multiple items (5-10 bracket)", () => {
    const items: PayoutItem[] = [
      { productId: "prod_1", quantity: 1, tags: ["PACK:6"] },
      { productId: "prod_2", quantity: 2, tags: [] },
    ];

    const result = calculatePickerPayout(items);
    expect(result.totalPieces).toBe(8);
    expect(result.payoutAmount).toBe(4.0);
    expect(result.bracket).toBe("5-10");
  });

  it("should calculate payout for multiple items (11+ bracket)", () => {
    const items: PayoutItem[] = [
      { productId: "prod_1", quantity: 2, tags: ["PACK:6"] }, // 12 pieces
      { productId: "prod_2", quantity: 1, tags: [] }, // 1 piece
    ];

    const result = calculatePickerPayout(items);
    expect(result.totalPieces).toBe(13);
    expect(result.payoutAmount).toBe(7.0);
    expect(result.bracket).toBe("11+");
  });

  it("should use explicit packSize when provided", () => {
    const items: PayoutItem[] = [
      { productId: "prod_1", quantity: 1, packSize: 6 },
    ];

    const result = calculatePickerPayout(items);
    expect(result.totalPieces).toBe(6);
    expect(result.items[0].packSize).toBe(6);
  });

  it("should prefer explicit packSize over PACK tag", () => {
    const items: PayoutItem[] = [
      { productId: "prod_1", quantity: 1, packSize: 12, tags: ["PACK:6"] },
    ];

    const result = calculatePickerPayout(items);
    expect(result.totalPieces).toBe(12);
    expect(result.items[0].packSize).toBe(12);
  });

  it("should handle complex order with mixed pack sizes", () => {
    const items: PayoutItem[] = [
      { productId: "prod_1", quantity: 1, tags: ["PACK:6"] }, // 6 pieces
      { productId: "prod_2", quantity: 2, tags: ["PACK:12"] }, // 24 pieces
      { productId: "prod_3", quantity: 3, tags: [] }, // 3 pieces
    ];

    const result = calculatePickerPayout(items);
    expect(result.totalPieces).toBe(33); // 6 + 24 + 3
    expect(result.payoutAmount).toBe(7.0);
    expect(result.bracket).toBe("11+");
    expect(result.items).toHaveLength(3);
  });

  it("should return detailed breakdown for each item", () => {
    const items: PayoutItem[] = [
      { productId: "prod_1", quantity: 2, tags: ["PACK:6"] },
      { productId: "prod_2", quantity: 1, tags: [] },
    ];

    const result = calculatePickerPayout(items);

    expect(result.items[0]).toEqual({
      productId: "prod_1",
      quantity: 2,
      packSize: 6,
      pieces: 12,
    });

    expect(result.items[1]).toEqual({
      productId: "prod_2",
      quantity: 1,
      packSize: 1,
      pieces: 1,
    });
  });
});

describe("calculateMultipleOrderPayouts", () => {
  it("should calculate payouts for multiple orders", () => {
    const orders = [
      {
        orderId: "order_1",
        items: [{ productId: "prod_1", quantity: 2, tags: [] }],
      },
      {
        orderId: "order_2",
        items: [{ productId: "prod_2", quantity: 1, tags: ["PACK:6"] }],
      },
    ];

    const results = calculateMultipleOrderPayouts(orders);

    expect(results).toHaveLength(2);
    expect(results[0].orderId).toBe("order_1");
    expect(results[0].payout.totalPieces).toBe(2);
    expect(results[0].payout.payoutAmount).toBe(2.0);

    expect(results[1].orderId).toBe("order_2");
    expect(results[1].payout.totalPieces).toBe(6);
    expect(results[1].payout.payoutAmount).toBe(4.0);
  });

  it("should return empty array for no orders", () => {
    const results = calculateMultipleOrderPayouts([]);
    expect(results).toHaveLength(0);
  });
});

describe("calculateAggregatePickerPayout", () => {
  it("should calculate aggregate payout across multiple orders", () => {
    const orders = [
      {
        orderId: "order_1",
        items: [{ productId: "prod_1", quantity: 2, tags: [] }], // 2 pieces → $2
      },
      {
        orderId: "order_2",
        items: [{ productId: "prod_2", quantity: 1, tags: ["PACK:6"] }], // 6 pieces → $4
      },
      {
        orderId: "order_3",
        items: [{ productId: "prod_3", quantity: 2, tags: ["PACK:6"] }], // 12 pieces → $7
      },
    ];

    const result = calculateAggregatePickerPayout(orders);

    expect(result.totalOrders).toBe(3);
    expect(result.totalPayout).toBe(13.0); // $2 + $4 + $7
    expect(result.orders).toHaveLength(3);
  });

  it("should return zero totals for no orders", () => {
    const result = calculateAggregatePickerPayout([]);
    expect(result.totalOrders).toBe(0);
    expect(result.totalPayout).toBe(0);
    expect(result.orders).toHaveLength(0);
  });
});

// ============================================================================
// CONTRACT TEST (Referenced in direction file)
// ============================================================================
describe("Payout Contract Test - Expected Brackets", () => {
  it("should match expected payout brackets for contract scenarios", () => {
    // Scenario 1: Small order (1-4 bracket)
    const small = calculatePickerPayout([
      { productId: "prod_1", quantity: 2, tags: [] },
    ]);
    expect(small.payoutAmount).toBe(2.0);
    expect(small.bracket).toBe("1-4");

    // Scenario 2: Medium order (5-10 bracket)
    const medium = calculatePickerPayout([
      { productId: "prod_1", quantity: 1, tags: ["PACK:6"] },
    ]);
    expect(medium.payoutAmount).toBe(4.0);
    expect(medium.bracket).toBe("5-10");

    // Scenario 3: Large order (11+ bracket)
    const large = calculatePickerPayout([
      { productId: "prod_1", quantity: 2, tags: ["PACK:6"] },
    ]);
    expect(large.payoutAmount).toBe(7.0);
    expect(large.bracket).toBe("11+");

    // Scenario 4: Boundary test - exactly 4 pieces
    const boundary4 = calculatePickerPayout([
      { productId: "prod_1", quantity: 4, tags: [] },
    ]);
    expect(boundary4.payoutAmount).toBe(2.0);
    expect(boundary4.bracket).toBe("1-4");

    // Scenario 5: Boundary test - exactly 5 pieces
    const boundary5 = calculatePickerPayout([
      { productId: "prod_1", quantity: 5, tags: [] },
    ]);
    expect(boundary5.payoutAmount).toBe(4.0);
    expect(boundary5.bracket).toBe("5-10");

    // Scenario 6: Boundary test - exactly 10 pieces
    const boundary10 = calculatePickerPayout([
      { productId: "prod_1", quantity: 10, tags: [] },
    ]);
    expect(boundary10.payoutAmount).toBe(4.0);
    expect(boundary10.bracket).toBe("5-10");

    // Scenario 7: Boundary test - exactly 11 pieces
    const boundary11 = calculatePickerPayout([
      { productId: "prod_1", quantity: 11, tags: [] },
    ]);
    expect(boundary11.payoutAmount).toBe(7.0);
    expect(boundary11.bracket).toBe("11+");
  });
});

