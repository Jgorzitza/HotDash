import { describe, expect, it } from "vitest";
import {
  calculatePickerPayout,
  parsePieceCount,
  isBundle,
  calculateTotalPieces,
  calculateOrderPayout,
  DEFAULT_PICKER_BRACKETS,
} from "../../../../app/services/inventory/payout";

describe("Picker Payout Service", () => {
  describe("calculatePickerPayout", () => {
    it("uses default brackets correctly", () => {
      // 1-4 pieces: $2.00
      expect(calculatePickerPayout(1)).toBe(2.0);
      expect(calculatePickerPayout(3)).toBe(2.0);
      expect(calculatePickerPayout(4)).toBe(2.0);

      // 5-10 pieces: $4.00
      expect(calculatePickerPayout(5)).toBe(4.0);
      expect(calculatePickerPayout(8)).toBe(4.0);
      expect(calculatePickerPayout(10)).toBe(4.0);

      // 11+ pieces: $7.00
      expect(calculatePickerPayout(11)).toBe(7.0);
      expect(calculatePickerPayout(25)).toBe(7.0);
      expect(calculatePickerPayout(100)).toBe(7.0);
    });

    it("applies rush bonus when threshold met", () => {
      const payout = calculatePickerPayout(40, {
        rushBonus: 2.5,
        rushThreshold: 35,
      });

      // 40 pieces = $7.00 base + $2.50 rush = $9.50
      expect(payout).toBe(9.5);
    });

    it("does not apply rush bonus below threshold", () => {
      const payout = calculatePickerPayout(30, {
        rushBonus: 2.5,
        rushThreshold: 35,
      });

      // 30 pieces = $7.00 (no rush bonus)
      expect(payout).toBe(7.0);
    });

    it("uses custom brackets when provided", () => {
      const customBrackets = [
        { min: 1, max: 5, rate: 3.0 },
        { min: 6, max: Infinity, rate: 8.0 },
      ];

      expect(calculatePickerPayout(3, { brackets: customBrackets })).toBe(3.0);
      expect(calculatePickerPayout(10, { brackets: customBrackets })).toBe(8.0);
    });

    it("returns 0 for invalid piece counts", () => {
      expect(calculatePickerPayout(0)).toBe(0);
      expect(calculatePickerPayout(-5)).toBe(0);
      expect(calculatePickerPayout(NaN)).toBe(0);
      expect(calculatePickerPayout(Infinity)).toBe(0);
    });

    it("rounds to 2 decimal places", () => {
      const payout = calculatePickerPayout(40, {
        rushBonus: 1.567,
        rushThreshold: 35,
      });

      // Should round 8.567 to 8.57
      expect(payout).toBe(8.57);
    });
  });

  describe("parsePieceCount", () => {
    it("extracts piece count from PACK tag", () => {
      expect(parsePieceCount(["PACK:6"])).toBe(6);
      expect(parsePieceCount(["PACK:12"])).toBe(12);
      expect(parsePieceCount(["seasonal", "PACK:3", "hot-sauce"])).toBe(3);
    });

    it("handles case-insensitive PACK tags", () => {
      expect(parsePieceCount(["pack:6"])).toBe(6);
      expect(parsePieceCount(["Pack:12"])).toBe(12);
      expect(parsePieceCount(["PACK:8"])).toBe(8);
    });

    it("returns null when no PACK tag present", () => {
      expect(parsePieceCount([])).toBeNull();
      expect(parsePieceCount(["seasonal", "hot-sauce"])).toBeNull();
      expect(parsePieceCount(["BUNDLE:TRUE"])).toBeNull();
    });

    it("returns null for malformed PACK tags", () => {
      expect(parsePieceCount(["PACK:abc"])).toBeNull();
      expect(parsePieceCount(["PACK:-5"])).toBeNull();
      expect(parsePieceCount(["PACK:0"])).toBeNull();
      expect(parsePieceCount(["PACK:"])).toBeNull();
    });

    it("floors fractional piece counts", () => {
      expect(parsePieceCount(["PACK:6.8"])).toBe(6);
      expect(parsePieceCount(["PACK:12.3"])).toBe(12);
    });
  });

  describe("isBundle", () => {
    it("detects BUNDLE:TRUE tag", () => {
      expect(isBundle(["BUNDLE:TRUE"])).toBe(true);
      expect(isBundle(["seasonal", "BUNDLE:TRUE", "3-pack"])).toBe(true);
    });

    it("handles case-insensitive bundle tags", () => {
      expect(isBundle(["bundle:true"])).toBe(true);
      expect(isBundle(["Bundle:True"])).toBe(true);
      expect(isBundle(["BUNDLE:true"])).toBe(true);
    });

    it("returns false when no BUNDLE tag present", () => {
      expect(isBundle([])).toBe(false);
      expect(isBundle(["seasonal", "hot-sauce"])).toBe(false);
      expect(isBundle(["PACK:6"])).toBe(false);
      expect(isBundle(["BUNDLE:FALSE"])).toBe(false);
    });
  });

  describe("calculateTotalPieces", () => {
    it("calculates pieces for non-pack items", () => {
      // No PACK tag = 1 piece per unit
      expect(calculateTotalPieces(5, [])).toBe(5);
      expect(calculateTotalPieces(10, ["seasonal"])).toBe(10);
    });

    it("calculates pieces for pack items", () => {
      // 3 units × 6 pieces = 18 pieces
      expect(calculateTotalPieces(3, ["PACK:6"])).toBe(18);

      // 5 units × 12 pieces = 60 pieces
      expect(calculateTotalPieces(5, ["PACK:12"])).toBe(60);
    });

    it("calculates pieces for bundles with pack tags", () => {
      // 2 bundles × 3 pieces each = 6 pieces
      expect(calculateTotalPieces(2, ["BUNDLE:TRUE", "PACK:3"])).toBe(6);
    });

    it("floors fractional results", () => {
      expect(calculateTotalPieces(3.7, ["PACK:2"])).toBe(7);
      expect(calculateTotalPieces(2, ["PACK:5.9"])).toBe(10);
    });

    it("returns 0 for invalid quantities", () => {
      expect(calculateTotalPieces(0, ["PACK:6"])).toBe(0);
      expect(calculateTotalPieces(-5, ["PACK:6"])).toBe(0);
      expect(calculateTotalPieces(NaN, ["PACK:6"])).toBe(0);
    });
  });

  describe("calculateOrderPayout", () => {
    it("calculates payout for simple order", () => {
      const lineItems = [
        { quantity: 2, tags: [] },
        { quantity: 3, tags: [] },
      ];

      // 2 + 3 = 5 pieces → $4.00
      const payout = calculateOrderPayout(lineItems);
      expect(payout).toBe(4.0);
    });

    it("calculates payout for order with packs", () => {
      const lineItems = [
        { quantity: 2, tags: ["PACK:6"] }, // 12 pieces
        { quantity: 1, tags: [] }, // 1 piece
      ];

      // 12 + 1 = 13 pieces → $7.00
      const payout = calculateOrderPayout(lineItems);
      expect(payout).toBe(7.0);
    });

    it("calculates payout for order with bundles", () => {
      const lineItems = [
        { quantity: 1, tags: ["PACK:3"] }, // 3 pieces
        { quantity: 2, tags: ["BUNDLE:TRUE", "PACK:2"] }, // 4 pieces
      ];

      // 3 + 4 = 7 pieces → $4.00
      const payout = calculateOrderPayout(lineItems);
      expect(payout).toBe(4.0);
    });

    it("applies rush bonus to total piece count", () => {
      const lineItems = [
        { quantity: 5, tags: ["PACK:6"] }, // 30 pieces
        { quantity: 8, tags: [] }, // 8 pieces
      ];

      // 30 + 8 = 38 pieces → $7.00 + $2.50 rush = $9.50
      const payout = calculateOrderPayout(lineItems, {
        rushBonus: 2.5,
        rushThreshold: 35,
      });
      expect(payout).toBe(9.5);
    });

    it("handles empty order", () => {
      expect(calculateOrderPayout([])).toBe(0);
    });

    it("handles line items without tags", () => {
      const lineItems = [{ quantity: 3 }, { quantity: 2 }];

      // 3 + 2 = 5 pieces → $4.00
      const payout = calculateOrderPayout(lineItems);
      expect(payout).toBe(4.0);
    });
  });

  describe("real-world Hot Rod AN scenarios", () => {
    it("calculates payout for small single-item order", () => {
      // Customer orders 2 jars
      const payout = calculatePickerPayout(2);
      expect(payout).toBe(2.0); // $2.00
    });

    it("calculates payout for medium 6-pack order", () => {
      // Customer orders 1 six-pack
      const pieces = calculateTotalPieces(1, ["PACK:6"]);
      const payout = calculatePickerPayout(pieces);

      expect(pieces).toBe(6);
      expect(payout).toBe(4.0); // $4.00
    });

    it("calculates payout for large variety pack order", () => {
      // Customer orders 2 variety packs (12 jars each)
      const pieces = calculateTotalPieces(2, ["BUNDLE:TRUE", "PACK:12"]);
      const payout = calculatePickerPayout(pieces);

      expect(pieces).toBe(24);
      expect(payout).toBe(7.0); // $7.00
    });

    it("calculates payout for mixed order", () => {
      const lineItems = [
        { quantity: 1, tags: ["PACK:6"] }, // 6-pack
        { quantity: 3, tags: [] }, // 3 single jars
        { quantity: 1, tags: ["BUNDLE:TRUE", "PACK:12"] }, // variety pack
      ];

      // 6 + 3 + 12 = 21 pieces → $7.00
      const payout = calculateOrderPayout(lineItems);
      expect(payout).toBe(7.0);
    });

    it("calculates payout for bulk/wholesale order with rush", () => {
      const lineItems = [
        { quantity: 10, tags: ["PACK:6"] }, // 10 six-packs = 60 pieces
      ];

      // 60 pieces → $7.00 + $3.00 rush = $10.00
      const payout = calculateOrderPayout(lineItems, {
        rushBonus: 3.0,
        rushThreshold: 50,
      });

      expect(payout).toBe(10.0);
    });
  });

  describe("DEFAULT_PICKER_BRACKETS constant", () => {
    it("exports correct bracket configuration", () => {
      expect(DEFAULT_PICKER_BRACKETS).toEqual([
        { min: 1, max: 4, rate: 2.0 },
        { min: 5, max: 10, rate: 4.0 },
        { min: 11, max: Infinity, rate: 7.0 },
      ]);
    });
  });
});
