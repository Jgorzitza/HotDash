import { describe, expect, it } from "vitest";
import {
  calculateROP,
  calculateSafetyStock,
  calculateROPWithSafety,
} from "../../../../app/services/inventory/rop";

describe("ROP Calculation Service", () => {
  describe("calculateROP", () => {
    it("calculates basic ROP correctly", () => {
      const rop = calculateROP({
        avgDailyDemand: 10,
        leadTimeDays: 7,
        safetyStockDays: 3,
      });

      // (10 * 7) + (10 * 3) = 70 + 30 = 100
      expect(rop).toBe(100);
    });

    it("handles zero demand", () => {
      const rop = calculateROP({
        avgDailyDemand: 0,
        leadTimeDays: 7,
        safetyStockDays: 3,
      });

      expect(rop).toBe(0);
    });

    it("handles zero lead time", () => {
      const rop = calculateROP({
        avgDailyDemand: 10,
        leadTimeDays: 0,
        safetyStockDays: 3,
      });

      // (10 * 0) + (10 * 3) = 0 + 30 = 30
      expect(rop).toBe(30);
    });

    it("handles zero safety stock days", () => {
      const rop = calculateROP({
        avgDailyDemand: 10,
        leadTimeDays: 7,
        safetyStockDays: 0,
      });

      // (10 * 7) + (10 * 0) = 70 + 0 = 70
      expect(rop).toBe(70);
    });

    it("floors fractional results", () => {
      const rop = calculateROP({
        avgDailyDemand: 3.7,
        leadTimeDays: 5,
        safetyStockDays: 2,
      });

      // (3.7 * 5) + (3.7 * 2) = 18.5 + 7.4 = 25.9 → 25
      expect(rop).toBe(25);
    });

    it("returns 0 for negative inputs", () => {
      expect(
        calculateROP({
          avgDailyDemand: -10,
          leadTimeDays: 7,
          safetyStockDays: 3,
        }),
      ).toBe(0);

      expect(
        calculateROP({
          avgDailyDemand: 10,
          leadTimeDays: -7,
          safetyStockDays: 3,
        }),
      ).toBe(0);

      expect(
        calculateROP({
          avgDailyDemand: 10,
          leadTimeDays: 7,
          safetyStockDays: -3,
        }),
      ).toBe(0);
    });

    it("handles realistic Hot Rod AN data", () => {
      // Example: Salsa product
      const rop = calculateROP({
        avgDailyDemand: 12, // Selling ~12 jars/day average
        leadTimeDays: 14, // 2-week lead time from supplier
        safetyStockDays: 7, // 1 week buffer
      });

      // (12 * 14) + (12 * 7) = 168 + 84 = 252
      expect(rop).toBe(252);
    });
  });

  describe("calculateSafetyStock", () => {
    it("calculates safety stock using min-max method", () => {
      const safety = calculateSafetyStock({
        averageDailySales: 12,
        averageLeadTimeDays: 5,
        maxDailySales: 18,
        maxLeadTimeDays: 8,
      });

      // (18 * 8) - (12 * 5) = 144 - 60 = 84
      expect(safety).toBe(84);
    });

    it("returns 0 when average exceeds max", () => {
      const safety = calculateSafetyStock({
        averageDailySales: 20,
        averageLeadTimeDays: 10,
        maxDailySales: 15,
        maxLeadTimeDays: 8,
      });

      // (15 * 8) - (20 * 10) = 120 - 200 = -80 → 0
      expect(safety).toBe(0);
    });

    it("handles zero average lead time", () => {
      const safety = calculateSafetyStock({
        averageDailySales: 10,
        averageLeadTimeDays: 0,
        maxDailySales: 15,
        maxLeadTimeDays: 5,
      });

      // (15 * 5) - (10 * 0) = 75 - 0 = 75
      expect(safety).toBe(75);
    });

    it("returns 0 for invalid inputs", () => {
      expect(
        calculateSafetyStock({
          averageDailySales: 0,
          averageLeadTimeDays: 5,
          maxDailySales: 10,
          maxLeadTimeDays: 8,
        }),
      ).toBe(0);

      expect(
        calculateSafetyStock({
          averageDailySales: 10,
          averageLeadTimeDays: 5,
          maxDailySales: 0,
          maxLeadTimeDays: 8,
        }),
      ).toBe(0);

      expect(
        calculateSafetyStock({
          averageDailySales: 10,
          averageLeadTimeDays: 5,
          maxDailySales: 15,
          maxLeadTimeDays: 0,
        }),
      ).toBe(0);
    });

    it("floors fractional results", () => {
      const safety = calculateSafetyStock({
        averageDailySales: 8.5,
        averageLeadTimeDays: 4,
        maxDailySales: 12.5,
        maxLeadTimeDays: 6,
      });

      // (12.5 * 6) - (8.5 * 4) = 75.0 - 34.0 = 41.0 → 41
      expect(safety).toBe(41);
    });
  });

  describe("calculateROPWithSafety", () => {
    it("uses min-max safety stock calculation when parameters provided", () => {
      const rop = calculateROPWithSafety({
        avgDailyDemand: 10,
        leadTimeDays: 7,
        safetyStockDays: 0, // Will be overridden
        averageDailySales: 10,
        averageLeadTimeDays: 5,
        maxDailySales: 15,
        maxLeadTimeDays: 8,
      });

      // Safety stock: (15 * 8) - (10 * 5) = 120 - 50 = 70
      // Safety days: 70 / 10 = 7
      // ROP: (10 * 7) + (10 * 7) = 70 + 70 = 140
      expect(rop).toBe(140);
    });

    it("falls back to basic ROP when min-max parameters not provided", () => {
      const rop = calculateROPWithSafety({
        avgDailyDemand: 10,
        leadTimeDays: 7,
        safetyStockDays: 3,
      });

      // (10 * 7) + (10 * 3) = 100
      expect(rop).toBe(100);
    });

    it("handles zero demand with min-max parameters", () => {
      const rop = calculateROPWithSafety({
        avgDailyDemand: 0,
        leadTimeDays: 7,
        safetyStockDays: 3,
        averageDailySales: 10,
        averageLeadTimeDays: 5,
        maxDailySales: 15,
        maxLeadTimeDays: 8,
      });

      expect(rop).toBe(0);
    });
  });

  describe("edge cases and real-world scenarios", () => {
    it("handles high-velocity product with long lead time", () => {
      // Bestselling hot sauce
      const rop = calculateROP({
        avgDailyDemand: 25,
        leadTimeDays: 21, // 3 weeks international shipping
        safetyStockDays: 14, // 2 week buffer
      });

      // (25 * 21) + (25 * 14) = 525 + 350 = 875
      expect(rop).toBe(875);
    });

    it("handles slow-moving specialty item", () => {
      // Limited edition item
      const rop = calculateROP({
        avgDailyDemand: 0.5, // Sells every other day
        leadTimeDays: 7,
        safetyStockDays: 3,
      });

      // (0.5 * 7) + (0.5 * 3) = 3.5 + 1.5 = 5.0 → 5
      expect(rop).toBe(5);
    });

    it("handles bundle with multiple pieces", () => {
      // 3-pack bundle
      const rop = calculateROP({
        avgDailyDemand: 8, // 8 bundles/day = 24 individual units
        leadTimeDays: 10,
        safetyStockDays: 5,
      });

      // (8 * 10) + (8 * 5) = 80 + 40 = 120 bundles
      expect(rop).toBe(120);
    });
  });
});
