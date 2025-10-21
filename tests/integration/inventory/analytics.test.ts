/**
 * Integration Tests: Inventory Analytics (INVENTORY-010)
 *
 * Tests inventory analytics including:
 * - Turnover rate calculations
 * - Stock aging classification
 * - ABC analysis (Pareto rule)
 */

import { describe, it, expect } from "vitest";
import {
  calculateTurnoverRate,
  classifyStockAge,
  performABCAnalysis,
} from "~/services/inventory/analytics";

describe("Inventory Analytics - Turnover Rate", () => {
  it("should calculate turnover rate correctly", () => {
    const result = calculateTurnoverRate(10000, 120000);
    expect(result.turnoverRate).toBe(12);
    expect(result.daysInventoryOutstanding).toBe(30);
    expect(result.classification).toBe("fast");
  });

  it("should classify normal turnover", () => {
    const result = calculateTurnoverRate(10000, 80000);
    expect(result.turnoverRate).toBe(8);
    expect(result.classification).toBe("normal");
  });

  it("should classify slow turnover", () => {
    const result = calculateTurnoverRate(10000, 40000);
    expect(result.turnoverRate).toBe(4);
    expect(result.classification).toBe("slow");
  });

  it("should handle zero inventory", () => {
    const result = calculateTurnoverRate(0, 50000);
    expect(result.turnoverRate).toBe(0);
    expect(result.classification).toBe("very_slow");
  });
});

describe("Inventory Analytics - Stock Aging", () => {
  it("should classify fresh stock (< 30 days)", () => {
    expect(classifyStockAge(15)).toBe("fresh");
  });

  it("should classify aging stock (31-90 days)", () => {
    expect(classifyStockAge(60)).toBe("aging");
  });

  it("should classify stale stock (91-180 days)", () => {
    expect(classifyStockAge(120)).toBe("stale");
  });

  it("should classify dead stock (> 180 days)", () => {
    expect(classifyStockAge(200)).toBe("dead");
  });

  it("should classify never sold as dead", () => {
    expect(classifyStockAge(null)).toBe("dead");
  });
});

describe("Inventory Analytics - ABC Analysis", () => {
  it("should perform ABC classification correctly", () => {
    const products = [
      { productId: "1", productName: "Product A", annualRevenue: 80000 },
      { productId: "2", productName: "Product B", annualRevenue: 15000 },
      { productId: "3", productName: "Product C", annualRevenue: 5000 },
    ];

    const result = performABCAnalysis(products);

    expect(result).toHaveLength(3);
    expect(result[0].abcClass).toBe("A"); // Highest revenue
    expect(result[0].percentageOfTotalRevenue).toBe(80);
    expect(result[1].abcClass).toBe("B");
    expect(result[2].abcClass).toBe("C");
  });

  it("should handle empty product list", () => {
    const result = performABCAnalysis([]);
    expect(result).toHaveLength(0);
  });

  it("should calculate cumulative percentages", () => {
    const products = [
      { productId: "1", productName: "P1", annualRevenue: 50 },
      { productId: "2", productName: "P2", annualRevenue: 30 },
      { productId: "3", productName: "P3", annualRevenue: 20 },
    ];

    const result = performABCAnalysis(products);

    expect(result[0].cumulativePercentage).toBe(50);
    expect(result[1].cumulativePercentage).toBe(80);
    expect(result[2].cumulativePercentage).toBe(100);
  });
});

