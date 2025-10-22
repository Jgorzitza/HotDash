/**
 * Tests for Seasonal ROP Adjustments (INVENTORY-001)
 *
 * Validates seasonality factor calculations and seasonal ROP enhancements
 */

import { describe, it, expect } from "vitest";
import {
  getSeasonalityFactor,
  calculateSeasonalAdjustedSales,
  getSeason,
  isPeakSeason,
  getMonthsUntilPeak,
  SEASONALITY_PATTERNS,
  type ProductCategory,
} from "~/lib/inventory/seasonality";
import { calculateReorderPoint } from "~/services/inventory/rop";

describe("Seasonality Module (INVENTORY-001)", () => {
  describe("getSeason", () => {
    it("should return correct season for each month", () => {
      expect(getSeason(0)).toBe("winter"); // January
      expect(getSeason(1)).toBe("winter"); // February
      expect(getSeason(2)).toBe("spring"); // March
      expect(getSeason(3)).toBe("spring"); // April
      expect(getSeason(4)).toBe("spring"); // May
      expect(getSeason(5)).toBe("summer"); // June
      expect(getSeason(6)).toBe("summer"); // July
      expect(getSeason(7)).toBe("summer"); // August
      expect(getSeason(8)).toBe("fall"); // September
      expect(getSeason(9)).toBe("fall"); // October
      expect(getSeason(10)).toBe("fall"); // November
      expect(getSeason(11)).toBe("winter"); // December
    });

    it("should throw error for invalid month", () => {
      expect(() => getSeason(-1)).toThrow("Month must be between 0 and 11");
      expect(() => getSeason(12)).toThrow("Month must be between 0 and 11");
    });
  });

  describe("getSeasonalityFactor", () => {
    it("should return peak factor for winter sports in winter months", () => {
      const category: ProductCategory = "snowboards";
      const peakFactor = SEASONALITY_PATTERNS.snowboards.peakFactor;

      // Peak months: Nov, Dec, Jan, Feb (10, 11, 0, 1)
      expect(getSeasonalityFactor(category, 10)).toBe(peakFactor); // November
      expect(getSeasonalityFactor(category, 11)).toBe(peakFactor); // December
      expect(getSeasonalityFactor(category, 0)).toBe(peakFactor); // January
      expect(getSeasonalityFactor(category, 1)).toBe(peakFactor); // February
    });

    it("should return off-season factor for winter sports in summer months", () => {
      const category: ProductCategory = "snowboards";
      const offSeasonFactor = SEASONALITY_PATTERNS.snowboards.offSeasonFactor;

      // Off-season months
      expect(getSeasonalityFactor(category, 5)).toBe(offSeasonFactor); // June
      expect(getSeasonalityFactor(category, 6)).toBe(offSeasonFactor); // July
    });

    it("should return peak factor for summer sports in summer months", () => {
      const category: ProductCategory = "summer-sports";
      const peakFactor = SEASONALITY_PATTERNS["summer-sports"].peakFactor;

      // Peak months: May, Jun, Jul, Aug (4, 5, 6, 7)
      expect(getSeasonalityFactor(category, 4)).toBe(peakFactor); // May
      expect(getSeasonalityFactor(category, 5)).toBe(peakFactor); // June
      expect(getSeasonalityFactor(category, 6)).toBe(peakFactor); // July
      expect(getSeasonalityFactor(category, 7)).toBe(peakFactor); // August
    });

    it("should return 1.0 for general products (no seasonality)", () => {
      const category: ProductCategory = "general";

      // All months should return 1.0 for general products
      for (let month = 0; month < 12; month++) {
        expect(getSeasonalityFactor(category, month)).toBe(1.0);
      }
    });

    it("should throw error for invalid month", () => {
      expect(() => getSeasonalityFactor("snowboards", -1)).toThrow(
        "Month must be between 0 and 11",
      );
      expect(() => getSeasonalityFactor("snowboards", 12)).toThrow(
        "Month must be between 0 and 11",
      );
    });
  });

  describe("calculateSeasonalAdjustedSales", () => {
    it("should increase sales by 30% for snowboards in winter (peak)", () => {
      const avgDailySales = 100;
      const category: ProductCategory = "snowboards";
      const peakMonth = 11; // December

      const adjusted = calculateSeasonalAdjustedSales(
        avgDailySales,
        category,
        peakMonth,
      );

      // Peak factor is 1.3 (30% increase)
      expect(adjusted).toBe(130);
    });

    it("should decrease sales by 30% for snowboards in summer (off-season)", () => {
      const avgDailySales = 100;
      const category: ProductCategory = "snowboards";
      const offSeasonMonth = 6; // July

      const adjusted = calculateSeasonalAdjustedSales(
        avgDailySales,
        category,
        offSeasonMonth,
      );

      // Off-season factor is 0.7 (30% decrease)
      expect(adjusted).toBe(70);
    });

    it("should not adjust sales for general products", () => {
      const avgDailySales = 100;
      const category: ProductCategory = "general";

      // Should be 100 for any month
      expect(calculateSeasonalAdjustedSales(avgDailySales, category, 0)).toBe(
        100,
      );
      expect(calculateSeasonalAdjustedSales(avgDailySales, category, 6)).toBe(
        100,
      );
    });

    it("should handle zero sales correctly", () => {
      const avgDailySales = 0;
      const category: ProductCategory = "snowboards";

      expect(calculateSeasonalAdjustedSales(avgDailySales, category, 11)).toBe(
        0,
      );
    });

    it("should throw error for negative sales", () => {
      expect(() =>
        calculateSeasonalAdjustedSales(-10, "snowboards", 11),
      ).toThrow("Average daily sales must be non-negative");
    });
  });

  describe("isPeakSeason", () => {
    it("should correctly identify peak months for snowboards", () => {
      const category: ProductCategory = "snowboards";

      // Peak months: Nov, Dec, Jan, Feb
      expect(isPeakSeason(category, 10)).toBe(true); // November
      expect(isPeakSeason(category, 11)).toBe(true); // December
      expect(isPeakSeason(category, 0)).toBe(true); // January
      expect(isPeakSeason(category, 1)).toBe(true); // February

      // Off-season months
      expect(isPeakSeason(category, 5)).toBe(false); // June
      expect(isPeakSeason(category, 6)).toBe(false); // July
    });

    it("should return false for all months for general products", () => {
      const category: ProductCategory = "general";

      for (let month = 0; month < 12; month++) {
        expect(isPeakSeason(category, month)).toBe(false);
      }
    });
  });

  describe("getMonthsUntilPeak", () => {
    it("should return 0 when currently in peak season", () => {
      const category: ProductCategory = "snowboards";

      // Currently in peak (November)
      expect(getMonthsUntilPeak(category, 10)).toBe(0);
      expect(getMonthsUntilPeak(category, 11)).toBe(0); // December
    });

    it("should return correct months until next peak", () => {
      const category: ProductCategory = "snowboards";

      // Peak starts in November (month 10)
      // From September (month 8) to November: 2 months
      expect(getMonthsUntilPeak(category, 8)).toBe(2);

      // From June (month 5) to November: 5 months
      expect(getMonthsUntilPeak(category, 5)).toBe(5);
    });

    it("should return 0 for general products (no peak)", () => {
      const category: ProductCategory = "general";

      for (let month = 0; month < 12; month++) {
        expect(getMonthsUntilPeak(category, month)).toBe(0);
      }
    });
  });
});

describe("Seasonal ROP Calculation (INVENTORY-001)", () => {
  it("should increase ROP for snowboards in winter (peak season)", () => {
    const params = {
      avgDailySales: 10,
      leadTimeDays: 7,
      maxDailySales: 15,
      maxLeadDays: 10,
      category: "snowboards" as ProductCategory,
      currentMonth: 11, // December (peak)
    };

    const result = calculateReorderPoint(params);

    // Peak factor is 1.3, so adjusted sales = 10 * 1.3 = 13
    // Lead time demand = 13 * 7 = 91
    // Safety stock = (15 * 1.3 * 10) - (13 * 7) = 195 - 91 = 104
    // ROP = 91 + 104 = 195

    expect(result.seasonalityFactor).toBe(1.3);
    expect(result.adjustedDailySales).toBe(13);
    expect(result.leadTimeDemand).toBe(91);
    expect(result.reorderPoint).toBeGreaterThan(91); // Should be higher due to safety stock
  });

  it("should decrease ROP for snowboards in summer (off-season)", () => {
    const params = {
      avgDailySales: 10,
      leadTimeDays: 7,
      maxDailySales: 15,
      maxLeadDays: 10,
      category: "snowboards" as ProductCategory,
      currentMonth: 6, // July (off-season)
    };

    const result = calculateReorderPoint(params);

    // Off-season factor is 0.7, so adjusted sales = 10 * 0.7 = 7
    expect(result.seasonalityFactor).toBe(0.7);
    expect(result.adjustedDailySales).toBe(7);
    expect(result.leadTimeDemand).toBe(49); // 7 * 7
  });

  it("should not adjust ROP for general products (no seasonality)", () => {
    const paramsWithCategory = {
      avgDailySales: 10,
      leadTimeDays: 7,
      maxDailySales: 15,
      maxLeadDays: 10,
      category: "general" as ProductCategory,
      currentMonth: 11,
    };

    const paramsWithoutCategory = {
      avgDailySales: 10,
      leadTimeDays: 7,
      maxDailySales: 15,
      maxLeadDays: 10,
    };

    const resultWith = calculateReorderPoint(paramsWithCategory);
    const resultWithout = calculateReorderPoint(paramsWithoutCategory);

    // Both should be the same (no seasonality adjustment)
    expect(resultWith.seasonalityFactor).toBe(1.0);
    expect(resultWithout.seasonalityFactor).toBe(1.0);
    expect(resultWith.reorderPoint).toBe(resultWithout.reorderPoint);
  });

  it("should maintain backward compatibility (defaults to general category)", () => {
    const params = {
      avgDailySales: 10,
      leadTimeDays: 7,
      maxDailySales: 15,
      maxLeadDays: 10,
      // No category specified - should default to "general"
    };

    const result = calculateReorderPoint(params);

    // Should default to general (no seasonality)
    expect(result.seasonalityFactor).toBe(1.0);
    expect(result.adjustedDailySales).toBe(10);
  });

  it("should use current month when not specified", () => {
    const params = {
      avgDailySales: 10,
      leadTimeDays: 7,
      maxDailySales: 15,
      maxLeadDays: 10,
      category: "snowboards" as ProductCategory,
      // currentMonth not specified - should use current date
    };

    const result = calculateReorderPoint(params);

    // Should have a seasonality factor (not necessarily 1.0)
    expect(result.seasonalityFactor).toBeDefined();
    expect(result.adjustedDailySales).toBeDefined();
  });
});
