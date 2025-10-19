import { describe, it, expect } from "vitest";
import {
  calculateROAS,
  calculateCPC,
  calculateCPA,
  calculateAdMetrics,
} from "~/lib/ads";

describe("Ads Metrics Calculations", () => {
  describe("calculateROAS", () => {
    it("calculates ROAS correctly", () => {
      expect(calculateROAS(1000, 100)).toBe(10);
      expect(calculateROAS(500, 250)).toBe(2);
    });

    it("handles zero spend with zero-guard", () => {
      expect(calculateROAS(1000, 0)).toBe(0);
    });

    it("handles zero revenue", () => {
      expect(calculateROAS(0, 100)).toBe(0);
    });
  });

  describe("calculateCPC", () => {
    it("calculates CPC correctly", () => {
      expect(calculateCPC(100, 50)).toBe(2);
      expect(calculateCPC(250, 100)).toBe(2.5);
    });

    it("handles zero clicks with zero-guard", () => {
      expect(calculateCPC(100, 0)).toBe(0);
    });
  });

  describe("calculateCPA", () => {
    it("calculates CPA correctly", () => {
      expect(calculateCPA(100, 10)).toBe(10);
      expect(calculateCPA(500, 25)).toBe(20);
    });

    it("handles zero conversions with zero-guard", () => {
      expect(calculateCPA(100, 0)).toBe(0);
    });
  });

  describe("calculateAdMetrics", () => {
    it("calculates all metrics correctly", () => {
      const result = calculateAdMetrics({
        spend: 100,
        revenue: 500,
        clicks: 50,
        conversions: 10,
      });

      expect(result.roas).toBe(5);
      expect(result.cpc).toBe(2);
      expect(result.cpa).toBe(10);
      expect(result.spend).toBe(100);
      expect(result.revenue).toBe(500);
      expect(result.clicks).toBe(50);
      expect(result.conversions).toBe(10);
    });

    it("handles all zero-guards", () => {
      const result = calculateAdMetrics({
        spend: 0,
        revenue: 100,
        clicks: 0,
        conversions: 0,
      });

      expect(result.roas).toBe(0);
      expect(result.cpc).toBe(0);
      expect(result.cpa).toBe(0);
    });
  });
});
