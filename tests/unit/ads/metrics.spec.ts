import { describe, expect, it } from "vitest";
import {
  calculateROAS,
  calculateCPC,
  calculateCPA,
  calculateCTR,
  calculateConversionRate,
  calculateAllMetrics,
  formatCentsToDollars,
  formatPercentage,
  formatROAS,
} from "~/lib/ads/metrics";

/**
 * Ads Metrics Calculations Unit Tests
 *
 * Comprehensive coverage of:
 * - ROAS, CPC, CPA, CTR, Conversion Rate calculations
 * - Zero-guard behavior (division by zero protection)
 * - Edge cases (negative values, very large numbers, null handling)
 * - Formatting functions
 * - Rounding precision
 */

describe("Ads Metrics Calculations", () => {
  describe("calculateROAS", () => {
    it("calculates ROAS correctly for profitable campaign", () => {
      // $10,000 revenue / $2,500 spend = 4.0x ROAS
      const roas = calculateROAS(1000000, 250000);
      expect(roas).toBe(4.0);
    });

    it("calculates ROAS correctly for break-even campaign", () => {
      // $5,000 revenue / $5,000 spend = 1.0x ROAS
      const roas = calculateROAS(500000, 500000);
      expect(roas).toBe(1.0);
    });

    it("calculates ROAS correctly for unprofitable campaign", () => {
      // $3,000 revenue / $5,000 spend = 0.6x ROAS
      const roas = calculateROAS(300000, 500000);
      expect(roas).toBe(0.6);
    });

    it("returns null when spend is zero (zero-guard)", () => {
      const roas = calculateROAS(1000000, 0);
      expect(roas).toBeNull();
    });

    it("returns 0 when revenue is zero", () => {
      const roas = calculateROAS(0, 250000);
      expect(roas).toBe(0);
    });

    it("handles very large numbers", () => {
      // $100M revenue / $20M spend = 5.0x ROAS
      const roas = calculateROAS(10000000000, 2000000000);
      expect(roas).toBe(5.0);
    });

    it("rounds to 2 decimal places", () => {
      // $3,333.33 revenue / $1,000 spend = 3.33x ROAS
      const roas = calculateROAS(333333, 100000);
      expect(roas).toBe(3.33);
    });
  });

  describe("calculateCPC", () => {
    it("calculates CPC correctly for standard campaign", () => {
      // $1,000 spend / 500 clicks = $2.00 CPC (200 cents)
      const cpc = calculateCPC(100000, 500);
      expect(cpc).toBe(200);
    });

    it("calculates CPC correctly for high-volume campaign", () => {
      // $5,000 spend / 10,000 clicks = $0.50 CPC (50 cents)
      const cpc = calculateCPC(500000, 10000);
      expect(cpc).toBe(50);
    });

    it("returns null when clicks is zero (zero-guard)", () => {
      const cpc = calculateCPC(100000, 0);
      expect(cpc).toBeNull();
    });

    it("returns 0 when spend is zero", () => {
      const cpc = calculateCPC(0, 1000);
      expect(cpc).toBe(0);
    });

    it("handles fractional cents by rounding", () => {
      // $10 spend / 3 clicks = $3.33333... CPC → rounds to 333 cents
      const cpc = calculateCPC(1000, 3);
      expect(cpc).toBe(333);
    });

    it("handles very high CPC", () => {
      // $1,000 spend / 1 click = $1,000 CPC (100,000 cents)
      const cpc = calculateCPC(100000, 1);
      expect(cpc).toBe(100000);
    });
  });

  describe("calculateCPA", () => {
    it("calculates CPA correctly for standard campaign", () => {
      // $2,500 spend / 50 conversions = $50.00 CPA (5000 cents)
      const cpa = calculateCPA(250000, 50);
      expect(cpa).toBe(5000);
    });

    it("calculates CPA correctly for high-converting campaign", () => {
      // $1,000 spend / 100 conversions = $10.00 CPA (1000 cents)
      const cpa = calculateCPA(100000, 100);
      expect(cpa).toBe(1000);
    });

    it("returns null when conversions is zero (zero-guard)", () => {
      const cpa = calculateCPA(250000, 0);
      expect(cpa).toBeNull();
    });

    it("returns 0 when spend is zero", () => {
      const cpa = calculateCPA(0, 50);
      expect(cpa).toBe(0);
    });

    it("handles fractional cents by rounding", () => {
      // $100 spend / 3 conversions = $33.33333... CPA → rounds to 3333 cents
      const cpa = calculateCPA(10000, 3);
      expect(cpa).toBe(3333);
    });

    it("handles very high CPA", () => {
      // $10,000 spend / 1 conversion = $10,000 CPA (1,000,000 cents)
      const cpa = calculateCPA(1000000, 1);
      expect(cpa).toBe(1000000);
    });
  });

  describe("calculateCTR", () => {
    it("calculates CTR correctly for good performance", () => {
      // 350 clicks / 10,000 impressions = 0.035 (3.5%)
      const ctr = calculateCTR(350, 10000);
      expect(ctr).toBe(0.035);
    });

    it("calculates CTR correctly for average performance", () => {
      // 200 clicks / 10,000 impressions = 0.02 (2.0%)
      const ctr = calculateCTR(200, 10000);
      expect(ctr).toBe(0.02);
    });

    it("calculates CTR correctly for poor performance", () => {
      // 50 clicks / 10,000 impressions = 0.005 (0.5%)
      const ctr = calculateCTR(50, 10000);
      expect(ctr).toBe(0.005);
    });

    it("returns null when impressions is zero (zero-guard)", () => {
      const ctr = calculateCTR(100, 0);
      expect(ctr).toBeNull();
    });

    it("returns 0 when clicks is zero", () => {
      const ctr = calculateCTR(0, 10000);
      expect(ctr).toBe(0);
    });

    it("handles very high CTR (100% engagement)", () => {
      // 1000 clicks / 1000 impressions = 1.0 (100%)
      const ctr = calculateCTR(1000, 1000);
      expect(ctr).toBe(1.0);
    });

    it("rounds to 4 decimal places", () => {
      // 123 clicks / 10,000 impressions = 0.0123 (1.23%)
      const ctr = calculateCTR(123, 10000);
      expect(ctr).toBe(0.0123);
    });
  });

  describe("calculateConversionRate", () => {
    it("calculates conversion rate correctly for good performance", () => {
      // 40 conversions / 1,000 clicks = 0.04 (4%)
      const rate = calculateConversionRate(40, 1000);
      expect(rate).toBe(0.04);
    });

    it("calculates conversion rate correctly for average performance", () => {
      // 20 conversions / 1,000 clicks = 0.02 (2%)
      const rate = calculateConversionRate(20, 1000);
      expect(rate).toBe(0.02);
    });

    it("calculates conversion rate correctly for poor performance", () => {
      // 5 conversions / 1,000 clicks = 0.005 (0.5%)
      const rate = calculateConversionRate(5, 1000);
      expect(rate).toBe(0.005);
    });

    it("returns null when clicks is zero (zero-guard)", () => {
      const rate = calculateConversionRate(10, 0);
      expect(rate).toBeNull();
    });

    it("returns 0 when conversions is zero", () => {
      const rate = calculateConversionRate(0, 1000);
      expect(rate).toBe(0);
    });

    it("handles very high conversion rate (100%)", () => {
      // 100 conversions / 100 clicks = 1.0 (100%)
      const rate = calculateConversionRate(100, 100);
      expect(rate).toBe(1.0);
    });

    it("rounds to 4 decimal places", () => {
      // 123 conversions / 10,000 clicks = 0.0123 (1.23%)
      const rate = calculateConversionRate(123, 10000);
      expect(rate).toBe(0.0123);
    });
  });

  describe("calculateAllMetrics", () => {
    it("calculates all metrics for a successful campaign", () => {
      const data = {
        spend_cents: 250000, // $2,500
        revenue_cents: 1000000, // $10,000
        impressions: 100000,
        clicks: 4000,
        conversions: 160,
      };

      const metrics = calculateAllMetrics(data);

      expect(metrics).toEqual({
        roas: 4.0, // $10k / $2.5k
        cpc: 63, // $2,500 / 4,000 clicks = $0.625 (63 cents)
        cpa: 1563, // $2,500 / 160 conversions = $15.625 (1563 cents)
        ctr: 0.04, // 4,000 / 100,000 = 4%
        conversionRate: 0.04, // 160 / 4,000 = 4%
      });
    });

    it("handles zero spend gracefully", () => {
      const data = {
        spend_cents: 0,
        revenue_cents: 1000000,
        impressions: 100000,
        clicks: 4000,
        conversions: 160,
      };

      const metrics = calculateAllMetrics(data);

      expect(metrics.roas).toBeNull(); // Can't calculate ROAS with 0 spend
      expect(metrics.cpc).toBe(0);
      expect(metrics.cpa).toBe(0);
      expect(metrics.ctr).toBe(0.04);
      expect(metrics.conversionRate).toBe(0.04);
    });

    it("handles zero clicks gracefully (zero-guards)", () => {
      const data = {
        spend_cents: 250000,
        revenue_cents: 1000000,
        impressions: 100000,
        clicks: 0,
        conversions: 0,
      };

      const metrics = calculateAllMetrics(data);

      expect(metrics.roas).toBe(4.0);
      expect(metrics.cpc).toBeNull(); // Can't calculate CPC with 0 clicks
      expect(metrics.cpa).toBeNull(); // Can't calculate CPA with 0 conversions
      expect(metrics.ctr).toBe(0);
      expect(metrics.conversionRate).toBeNull(); // Can't calculate with 0 clicks
    });

    it("handles all zeros gracefully", () => {
      const data = {
        spend_cents: 0,
        revenue_cents: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      };

      const metrics = calculateAllMetrics(data);

      expect(metrics.roas).toBeNull();
      expect(metrics.cpc).toBeNull();
      expect(metrics.cpa).toBeNull();
      expect(metrics.ctr).toBeNull();
      expect(metrics.conversionRate).toBeNull();
    });

    it("calculates metrics for unprofitable campaign", () => {
      const data = {
        spend_cents: 500000, // $5,000 spend
        revenue_cents: 300000, // $3,000 revenue (losing money)
        impressions: 100000,
        clicks: 2000,
        conversions: 30,
      };

      const metrics = calculateAllMetrics(data);

      expect(metrics.roas).toBe(0.6); // Unprofitable (< 1.0)
      expect(metrics.cpc).toBe(250); // $2.50/click
      expect(metrics.cpa).toBe(16667); // $166.67/conversion (expensive)
      expect(metrics.ctr).toBe(0.02); // 2%
      expect(metrics.conversionRate).toBe(0.015); // 1.5%
    });
  });

  describe("formatCentsToDollars", () => {
    it("formats standard amounts correctly", () => {
      expect(formatCentsToDollars(250000)).toBe("$2500.00");
      expect(formatCentsToDollars(100000)).toBe("$1000.00");
      expect(formatCentsToDollars(50)).toBe("$0.50");
    });

    it("formats zero correctly", () => {
      expect(formatCentsToDollars(0)).toBe("$0.00");
    });

    it("formats large amounts", () => {
      expect(formatCentsToDollars(1000000)).toBe("$10000.00");
      expect(formatCentsToDollars(100000000)).toBe("$1000000.00");
    });

    it("handles fractional cents", () => {
      expect(formatCentsToDollars(12345)).toBe("$123.45");
      expect(formatCentsToDollars(99)).toBe("$0.99");
    });

    it("formats negative amounts", () => {
      expect(formatCentsToDollars(-50000)).toBe("$-500.00");
    });
  });

  describe("formatPercentage", () => {
    it("formats standard percentages correctly", () => {
      expect(formatPercentage(0.035)).toBe("3.50%");
      expect(formatPercentage(0.02)).toBe("2.00%");
      expect(formatPercentage(0.5)).toBe("50.00%");
    });

    it("formats zero correctly", () => {
      expect(formatPercentage(0)).toBe("0.00%");
    });

    it("formats 100% correctly", () => {
      expect(formatPercentage(1.0)).toBe("100.00%");
    });

    it("respects custom decimal places", () => {
      expect(formatPercentage(0.12345, 0)).toBe("12%");
      expect(formatPercentage(0.12345, 1)).toBe("12.3%");
      expect(formatPercentage(0.12345, 2)).toBe("12.35%");
      expect(formatPercentage(0.12345, 3)).toBe("12.345%");
    });

    it("handles very small percentages", () => {
      expect(formatPercentage(0.0001)).toBe("0.01%");
      expect(formatPercentage(0.00001, 3)).toBe("0.001%");
    });

    it("handles percentages over 100%", () => {
      expect(formatPercentage(1.5)).toBe("150.00%");
      expect(formatPercentage(3.25)).toBe("325.00%");
    });
  });

  describe("formatROAS", () => {
    it("formats standard ROAS correctly", () => {
      expect(formatROAS(3.5)).toBe("3.50x");
      expect(formatROAS(2.0)).toBe("2.00x");
      expect(formatROAS(1.0)).toBe("1.00x");
    });

    it("formats zero ROAS", () => {
      expect(formatROAS(0)).toBe("0.00x");
    });

    it("formats ROAS less than 1.0 (unprofitable)", () => {
      expect(formatROAS(0.6)).toBe("0.60x");
      expect(formatROAS(0.8)).toBe("0.80x");
    });

    it("formats high ROAS", () => {
      expect(formatROAS(10.5)).toBe("10.50x");
      expect(formatROAS(25.0)).toBe("25.00x");
    });

    it("handles decimal precision", () => {
      expect(formatROAS(3.14159)).toBe("3.14x");
      expect(formatROAS(2.999)).toBe("3.00x");
    });
  });

  describe("Edge Cases & Robustness", () => {
    it("handles negative revenue (refunds scenario)", () => {
      const roas = calculateROAS(-50000, 100000);
      expect(roas).toBe(-0.5); // Negative ROAS indicates net loss
    });

    it("handles negative spend (credit scenario)", () => {
      const roas = calculateROAS(100000, -50000);
      expect(roas).toBe(-2.0); // Negative spend might occur with credits
    });

    it("handles very small numbers without precision loss", () => {
      const cpc = calculateCPC(100, 1000); // $1 / 1000 clicks = $0.001/click (0 cents)
      expect(cpc).toBe(0);
    });

    it("handles maximum safe integer", () => {
      const maxSafe = Number.MAX_SAFE_INTEGER;
      const roas = calculateROAS(maxSafe, 1000000);
      expect(roas).toBeGreaterThan(0);
      expect(Number.isFinite(roas)).toBe(true);
    });

    it("calculateAllMetrics handles partial data", () => {
      const data = {
        spend_cents: 100000,
        revenue_cents: 300000,
        impressions: 10000,
        clicks: 0, // No clicks yet
        conversions: 0,
      };

      const metrics = calculateAllMetrics(data);

      expect(metrics.roas).toBe(3.0);
      expect(metrics.ctr).toBe(0);
      expect(metrics.cpc).toBeNull(); // Zero-guarded
      expect(metrics.cpa).toBeNull(); // Zero-guarded
      expect(metrics.conversionRate).toBeNull(); // Zero-guarded
    });
  });

  describe("Zero-Guard Summary Test", () => {
    it("verifies all functions protect against division by zero", () => {
      // Test all zero-guard scenarios
      expect(calculateROAS(1000, 0)).toBeNull();
      expect(calculateCPC(1000, 0)).toBeNull();
      expect(calculateCPA(1000, 0)).toBeNull();
      expect(calculateCTR(100, 0)).toBeNull();
      expect(calculateConversionRate(10, 0)).toBeNull();

      // Verify functions return reasonable values (not Infinity or NaN)
      expect(Number.isNaN(calculateROAS(1000, 0) as any)).toBe(false);
      expect(calculateCPC(1000, 0)).not.toBe(Infinity);
      expect(calculateCPA(1000, 0)).not.toBe(Infinity);
      expect(calculateCTR(100, 0)).not.toBe(Infinity);
      expect(calculateConversionRate(10, 0)).not.toBe(Infinity);
    });
  });
});
