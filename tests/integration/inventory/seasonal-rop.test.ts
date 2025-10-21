/**
 * Integration Tests: Seasonal ROP (INVENTORY-001)
 *
 * Tests seasonal reorder point calculations
 */

import { describe, it, expect } from "vitest";
import { calculateReorderPoint } from "~/services/inventory/rop";

describe("Seasonal ROP - Basic Calculation", () => {
  it("should calculate ROP correctly", () => {
    const result = calculateReorderPoint({
      avgDailySales: 5,
      leadTimeDays: 10,
      maxDailySales: 8,
      maxLeadDays: 15,
    });

    expect(result.reorderPoint).toBeGreaterThan(0);
    expect(result.safetyStock).toBeGreaterThan(0);
    expect(result.leadTimeDemand).toBe(50);
  });

  it("should apply seasonal adjustments", () => {
    const winterResult = calculateReorderPoint({
      avgDailySales: 5,
      leadTimeDays: 10,
      maxDailySales: 8,
      maxLeadDays: 15,
      category: "winter",
      currentMonth: 1, // January
    });

    const summerResult = calculateReorderPoint({
      avgDailySales: 5,
      leadTimeDays: 10,
      maxDailySales: 8,
      maxLeadDays: 15,
      category: "winter",
      currentMonth: 7, // July
    });

    expect(winterResult.seasonalityFactor).toBeGreaterThan(1);
    expect(summerResult.seasonalityFactor).toBeLessThan(1);
  });

  it("should handle zero sales gracefully", () => {
    const result = calculateReorderPoint({
      avgDailySales: 0,
      leadTimeDays: 10,
      maxDailySales: 0,
      maxLeadDays: 15,
    });

    expect(result.reorderPoint).toBe(0);
  });

  it("should throw error for negative inputs", () => {
    expect(() =>
      calculateReorderPoint({
        avgDailySales: -5,
        leadTimeDays: 10,
        maxDailySales: 8,
        maxLeadDays: 15,
      })
    ).toThrow();
  });
});

describe("Seasonal ROP - Seasonality Factors", () => {
  it("should increase ROP for peak season", () => {
    const baseResult = calculateReorderPoint({
      avgDailySales: 10,
      leadTimeDays: 7,
      maxDailySales: 15,
      maxLeadDays: 10,
      category: "general",
    });

    const peakResult = calculateReorderPoint({
      avgDailySales: 10,
      leadTimeDays: 7,
      maxDailySales: 15,
      maxLeadDays: 10,
      category: "winter",
      currentMonth: 12, // December (peak for winter items)
    });

    expect(peakResult.reorderPoint).toBeGreaterThan(baseResult.reorderPoint);
  });

  it("should decrease ROP for off-season", () => {
    const baseResult = calculateReorderPoint({
      avgDailySales: 10,
      leadTimeDays: 7,
      maxDailySales: 15,
      maxLeadDays: 10,
      category: "general",
    });

    const offSeasonResult = calculateReorderPoint({
      avgDailySales: 10,
      leadTimeDays: 7,
      maxDailySales: 15,
      maxLeadDays: 10,
      category: "winter",
      currentMonth: 7, // July (off-season for winter items)
    });

    expect(offSeasonResult.reorderPoint).toBeLessThan(baseResult.reorderPoint);
  });
});

