/**
 * Tests for Reorder Point (ROP) Calculation
 */

import { describe, it, expect } from "vitest";
import {
  calculateReorderPoint,
  getInventoryStatus,
} from "~/services/inventory/rop";

describe("calculateReorderPoint", () => {
  it("should calculate ROP correctly with whole numbers", () => {
    const result = calculateReorderPoint({
      avgDailySales: 10,
      leadTimeDays: 5,
      maxDailySales: 15,
      maxLeadDays: 7,
    });

    // lead_time_demand = 10 * 5 = 50
    // safety_stock = (15 * 7) - (10 * 5) = 105 - 50 = 55
    // ROP = 50 + 55 = 105
    expect(result.leadTimeDemand).toBe(50);
    expect(result.safetyStock).toBe(55);
    expect(result.reorderPoint).toBe(105);
  });

  it("should round up safety stock when needed", () => {
    const result = calculateReorderPoint({
      avgDailySales: 10,
      leadTimeDays: 5,
      maxDailySales: 12.5,
      maxLeadDays: 6,
    });

    // lead_time_demand = 10 * 5 = 50
    // safety_stock = (12.5 * 6) - (10 * 5) = 75 - 50 = 25
    // ROP = 50 + 25 = 75
    expect(result.leadTimeDemand).toBe(50);
    expect(result.safetyStock).toBe(25);
    expect(result.reorderPoint).toBe(75);
  });

  it("should handle zero safety stock", () => {
    const result = calculateReorderPoint({
      avgDailySales: 10,
      leadTimeDays: 5,
      maxDailySales: 10,
      maxLeadDays: 5,
    });

    // lead_time_demand = 10 * 5 = 50
    // safety_stock = (10 * 5) - (10 * 5) = 0
    // ROP = 50 + 0 = 50
    expect(result.leadTimeDemand).toBe(50);
    expect(result.safetyStock).toBe(0);
    expect(result.reorderPoint).toBe(50);
  });

  it("should handle small fractional values correctly", () => {
    const result = calculateReorderPoint({
      avgDailySales: 2.5,
      leadTimeDays: 3,
      maxDailySales: 4,
      maxLeadDays: 4,
    });

    // lead_time_demand = 2.5 * 3 = 7.5
    // safety_stock = (4 * 4) - (2.5 * 3) = 16 - 7.5 = 8.5 → Math.ceil = 9
    // ROP = Math.ceil(7.5 + 9) = Math.ceil(16.5) = 17
    expect(result.leadTimeDemand).toBe(7.5);
    expect(result.safetyStock).toBe(9);
    expect(result.reorderPoint).toBe(17);
  });

  it("should validate non-negative inputs", () => {
    expect(() => {
      calculateReorderPoint({
        avgDailySales: -5,
        leadTimeDays: 7,
        maxDailySales: 10,
        maxLeadDays: 10,
      });
    }).toThrow("Average daily sales and lead time must be non-negative");
  });

  it("should validate max values are greater than or equal to avg values", () => {
    expect(() => {
      calculateReorderPoint({
        avgDailySales: 10,
        leadTimeDays: 7,
        maxDailySales: 5,
        maxLeadDays: 10,
      });
    }).toThrow("Maximum daily sales cannot be less than average daily sales");

    expect(() => {
      calculateReorderPoint({
        avgDailySales: 10,
        leadTimeDays: 7,
        maxDailySales: 15,
        maxLeadDays: 5,
      });
    }).toThrow("Maximum lead days cannot be less than average lead days");
  });

  it("should handle realistic e-commerce scenario", () => {
    const result = calculateReorderPoint({
      avgDailySales: 15,
      leadTimeDays: 10,
      maxDailySales: 25,
      maxLeadDays: 14,
    });

    // lead_time_demand = 15 * 10 = 150
    // safety_stock = (25 * 14) - (15 * 10) = 350 - 150 = 200
    // ROP = 150 + 200 = 350
    expect(result.leadTimeDemand).toBe(150);
    expect(result.safetyStock).toBe(200);
    expect(result.reorderPoint).toBe(350);
  });

  it("should handle low-volume products", () => {
    const result = calculateReorderPoint({
      avgDailySales: 0.5,
      leadTimeDays: 14,
      maxDailySales: 2,
      maxLeadDays: 21,
    });

    // lead_time_demand = 0.5 * 14 = 7
    // safety_stock = (2 * 21) - (0.5 * 14) = 42 - 7 = 35
    // ROP = 7 + 35 = 42
    expect(result.leadTimeDemand).toBe(7);
    expect(result.safetyStock).toBe(35);
    expect(result.reorderPoint).toBe(42);
  });

  it("should correctly round up ROP when lead time demand has fractional component", () => {
    const result = calculateReorderPoint({
      avgDailySales: 5,
      leadTimeDays: 7.1,
      maxDailySales: 5.6,
      maxLeadDays: 7.5,
    });

    // lead_time_demand = 5 * 7.1 = 35.5
    // safety_stock = (5.6 * 7.5) - (5 * 7.1) = 42 - 35.5 = 6.5 → Math.ceil = 7
    // ROP = Math.ceil(35.5 + 7) = Math.ceil(42.5) = 43
    expect(result.leadTimeDemand).toBe(35.5);
    expect(result.safetyStock).toBe(7);
    expect(result.reorderPoint).toBe(43);
  });

  it("should handle high-velocity products", () => {
    const result = calculateReorderPoint({
      avgDailySales: 100,
      leadTimeDays: 7,
      maxDailySales: 150,
      maxLeadDays: 10,
    });

    // lead_time_demand = 100 * 7 = 700
    // safety_stock = (150 * 10) - (100 * 7) = 1500 - 700 = 800
    // ROP = 700 + 800 = 1500
    expect(result.leadTimeDemand).toBe(700);
    expect(result.safetyStock).toBe(800);
    expect(result.reorderPoint).toBe(1500);
  });
});

describe("getInventoryStatus", () => {
  const rop = 100;

  it("should return out_of_stock when inventory is zero or negative", () => {
    expect(getInventoryStatus(0, rop)).toBe("out_of_stock");
    expect(getInventoryStatus(-5, rop)).toBe("out_of_stock");
  });

  it("should return urgent_reorder when inventory is 50% or less of ROP", () => {
    expect(getInventoryStatus(50, rop)).toBe("urgent_reorder");
    expect(getInventoryStatus(25, rop)).toBe("urgent_reorder");
    expect(getInventoryStatus(1, rop)).toBe("urgent_reorder");
  });

  it("should return low_stock when inventory is between 50% and 100% of ROP", () => {
    expect(getInventoryStatus(51, rop)).toBe("low_stock");
    expect(getInventoryStatus(75, rop)).toBe("low_stock");
    expect(getInventoryStatus(100, rop)).toBe("low_stock");
  });

  it("should return in_stock when inventory is above ROP", () => {
    expect(getInventoryStatus(101, rop)).toBe("in_stock");
    expect(getInventoryStatus(150, rop)).toBe("in_stock");
    expect(getInventoryStatus(500, rop)).toBe("in_stock");
  });
});
