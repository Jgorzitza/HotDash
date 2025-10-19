import { describe, expect, it } from "vitest";
import {
  assessInventory,
  calculateDaysOfCover,
  calculatePickerPayout,
  calculateReorderPoint,
  calculateSafetyStock,
  isBundle,
  parsePieceCount,
  recommendOrderQuantity,
} from "../../../../app/services/inventory/calculations";

import type { PickerPayoutBracket } from "../../../../app/services/inventory/types";

describe("inventory calculations", () => {
  describe("calculateSafetyStock", () => {
    it("returns safety stock using demand/lead spread", () => {
      const safety = calculateSafetyStock({
        averageDailySales: 12,
        averageLeadTimeDays: 5,
        maxDailySales: 18,
        maxLeadTimeDays: 8,
      });

      expect(safety).toBe(84);
    });

    it("clamps negative results to zero", () => {
      const safety = calculateSafetyStock({
        averageDailySales: 5,
        averageLeadTimeDays: 3,
        maxDailySales: 4,
        maxLeadTimeDays: 3,
      });

      expect(safety).toBe(0);
    });
  });

  describe("calculateReorderPoint", () => {
    it("adds safety stock to demand during lead time", () => {
      const rop = calculateReorderPoint({
        averageDailySales: 10,
        leadTimeDays: 4,
        safetyStock: 30,
      });

      expect(rop).toBe(70);
    });

    it("falls back to safety stock when demand is zero", () => {
      const rop = calculateReorderPoint({
        averageDailySales: 0,
        leadTimeDays: 4,
        safetyStock: 25,
      });

      expect(rop).toBe(25);
    });
  });

  describe("calculateDaysOfCover", () => {
    it("returns null when daily sales unknown", () => {
      expect(calculateDaysOfCover(100, 0)).toBeNull();
    });

    it("computes days of cover rounded to two decimals", () => {
      expect(calculateDaysOfCover(83, 7)).toBe(11.86);
    });
  });

  describe("parsePieceCount", () => {
    it("extracts integer counts from PACK tags", () => {
      expect(parsePieceCount(["BUNDLE:TRUE", "PACK:12"])).toBe(12);
    });

    it("ignores malformed tags", () => {
      expect(parsePieceCount(["PACK:abc"])).toBeNull();
      expect(parsePieceCount([])).toBeNull();
    });
  });

  describe("isBundle", () => {
    it("detects bundle tags", () => {
      expect(isBundle(["bundle:true"])).toBe(true);
      expect(isBundle(["pack:2"])).toBe(false);
    });
  });

  describe("calculatePickerPayout", () => {
    it("uses default brackets from spec", () => {
      expect(calculatePickerPayout(1)).toBe(2);
      expect(calculatePickerPayout(6)).toBe(4);
      expect(calculatePickerPayout(12)).toBe(7);
    });

    it("applies custom brackets and rush bonus", () => {
      const brackets: PickerPayoutBracket[] = [
        { min: 1, max: 10, rate: 3 },
        { min: 11, max: Infinity, rate: 6 },
      ];

      expect(
        calculatePickerPayout(15, {
          brackets,
          rushBonus: 1.5,
          rushThreshold: 14,
        }),
      ).toBe(7.5);
    });
  });

  describe("recommendOrderQuantity", () => {
    it("accounts for incoming stock before suggesting order", () => {
      const qty = recommendOrderQuantity({
        onHand: 40,
        incoming: 10,
        reorderPoint: 60,
        safetyStock: 20,
      });

      expect(qty).toBe(30);
    });

    it("never returns negative quantities", () => {
      const qty = recommendOrderQuantity({
        onHand: 100,
        incoming: 0,
        reorderPoint: 50,
        safetyStock: 10,
      });

      expect(qty).toBe(0);
    });
  });

  describe("assessInventory", () => {
    it("derives full assessment with status buckets", () => {
      const assessment = assessInventory({
        averageDailySales: 8,
        leadTimeDays: 5,
        onHand: 20,
        incoming: 5,
        tags: ["PACK:6"],
        maxDailySales: 12,
        maxLeadTimeDays: 7,
        averageLeadTimeDays: 4,
      });

      expect(assessment.reorderPoint).toBeGreaterThan(0);
      expect(assessment.safetyStock).toBeGreaterThanOrEqual(0);
      expect(assessment.status).toBeTypeOf("string");
      expect(assessment.recommendedOrderQuantity).toBeGreaterThanOrEqual(0);
      expect(assessment.pieceCount).toBe(6);
      expect(typeof assessment.isBundle).toBe("boolean");
    });

    it("classifies stock urgency based on thresholds", () => {
      const base = assessInventory({
        averageDailySales: 10,
        leadTimeDays: 3,
        onHand: 0,
      });

      expect(base.status).toBe("out_of_stock");

      const urgent = assessInventory({
        averageDailySales: 10,
        leadTimeDays: 3,
        onHand: 4,
        safetyStock: 5,
      });

      expect(urgent.status).toBe("urgent_reorder");

      const low = assessInventory({
        averageDailySales: 10,
        leadTimeDays: 3,
        onHand: 25,
        safetyStock: 5,
      });

      expect(low.status).toBe("low_stock");

      const healthy = assessInventory({
        averageDailySales: 10,
        leadTimeDays: 3,
        onHand: 80,
        safetyStock: 5,
      });

      expect(healthy.status).toBe("in_stock");
    });
  });
});
