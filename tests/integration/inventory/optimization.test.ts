/**
 * Integration Tests: Optimization (INVENTORY-012)
 */

import { describe, it, expect } from "vitest";
import { generateOptimizationReport } from "~/services/inventory/optimization";

describe("Optimization - Dead Stock Detection", () => {
  it("should identify dead stock (> 90 days no sales)", async () => {
    const products = [
      {
        productId: "p1",
        productName: "Dead Product",
        currentStock: 100,
        avgDailySales: 0.1,
        lastSaleDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        costPerUnit: 50,
        abcClass: "C" as const,
      },
    ];

    const result = await generateOptimizationReport(products);

    expect(result.deadStock.count).toBe(1);
    expect(result.deadStock.items[0].daysSinceLastSale).toBeGreaterThan(90);
  });
});

describe("Optimization - Overstock Detection", () => {
  it("should identify overstock (> 180 days supply)", async () => {
    const products = [
      {
        productId: "p1",
        productName: "Overstocked Product",
        currentStock: 500,
        avgDailySales: 1, // 500 days supply
        lastSaleDate: new Date(),
        costPerUnit: 25,
        abcClass: "C" as const,
      },
    ];

    const result = await generateOptimizationReport(products);

    expect(result.overstock.count).toBe(1);
    expect(result.overstock.items[0].daysOfSupply).toBeGreaterThan(180);
  });
});


