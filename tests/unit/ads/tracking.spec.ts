/**
 * Ads Metrics Tracking Tests
 * Contract test for AD-001: ROAS Metrics Helpers
 *
 * Tests ROAS, CPC, CPA calculations with zero-guards
 */

import { describe, it, expect } from "vitest";
import {
  calculateROAS,
  calculateCPC,
  calculateCPA,
  calculateCTR,
  calculateConversionRate,
  formatCurrency,
  formatPercentage,
} from "../../../app/lib/ads/metrics";

describe("Ads Metrics - ROAS", () => {
  it("calculates ROAS correctly with positive revenue and spend", () => {
    expect(calculateROAS(1000, 250)).toBe(4.0);
    expect(calculateROAS(500, 100)).toBe(5.0);
    expect(calculateROAS(100, 50)).toBe(2.0);
  });

  it("returns 0 when spend is zero (zero-guard)", () => {
    expect(calculateROAS(500, 0)).toBe(0);
    expect(calculateROAS(1000, 0)).toBe(0);
  });

  it("returns 0 when spend is negative (zero-guard)", () => {
    expect(calculateROAS(500, -100)).toBe(0);
  });

  it("returns 0 when revenue is zero", () => {
    expect(calculateROAS(0, 100)).toBe(0);
  });

  it("returns 0 when revenue is negative (zero-guard)", () => {
    expect(calculateROAS(-100, 50)).toBe(0);
  });

  it("handles fractional ROAS values", () => {
    expect(calculateROAS(75, 100)).toBe(0.75);
    expect(calculateROAS(125, 100)).toBe(1.25);
  });
});

describe("Ads Metrics - CPC", () => {
  it("calculates CPC correctly with positive spend and clicks", () => {
    expect(calculateCPC(100, 50)).toBe(2.0);
    expect(calculateCPC(250, 100)).toBe(2.5);
    expect(calculateCPC(75, 25)).toBe(3.0);
  });

  it("returns 0 when clicks is zero (zero-guard)", () => {
    expect(calculateCPC(100, 0)).toBe(0);
    expect(calculateCPC(500, 0)).toBe(0);
  });

  it("returns 0 when clicks is negative (zero-guard)", () => {
    expect(calculateCPC(100, -50)).toBe(0);
  });

  it("returns 0 when spend is negative (zero-guard)", () => {
    expect(calculateCPC(-100, 50)).toBe(0);
  });

  it("handles fractional CPC values", () => {
    expect(calculateCPC(100, 75)).toBeCloseTo(1.333, 2);
    expect(calculateCPC(50, 33)).toBeCloseTo(1.515, 2);
  });
});

describe("Ads Metrics - CPA", () => {
  it("calculates CPA correctly with positive spend and conversions", () => {
    expect(calculateCPA(500, 25)).toBe(20.0);
    expect(calculateCPA(1000, 50)).toBe(20.0);
    expect(calculateCPA(300, 10)).toBe(30.0);
  });

  it("returns 0 when conversions is zero (zero-guard)", () => {
    expect(calculateCPA(500, 0)).toBe(0);
    expect(calculateCPA(1000, 0)).toBe(0);
  });

  it("returns 0 when conversions is negative (zero-guard)", () => {
    expect(calculateCPA(500, -10)).toBe(0);
  });

  it("returns 0 when spend is negative (zero-guard)", () => {
    expect(calculateCPA(-500, 10)).toBe(0);
  });

  it("handles fractional CPA values", () => {
    expect(calculateCPA(100, 7)).toBeCloseTo(14.286, 2);
  });
});

describe("Ads Metrics - CTR", () => {
  it("calculates CTR correctly as percentage", () => {
    expect(calculateCTR(50, 1000)).toBe(5.0);
    expect(calculateCTR(25, 500)).toBe(5.0);
    expect(calculateCTR(100, 10000)).toBe(1.0);
  });

  it("returns 0 when impressions is zero (zero-guard)", () => {
    expect(calculateCTR(50, 0)).toBe(0);
    expect(calculateCTR(100, 0)).toBe(0);
  });

  it("returns 0 when impressions is negative (zero-guard)", () => {
    expect(calculateCTR(50, -1000)).toBe(0);
  });

  it("returns 0 when clicks is negative (zero-guard)", () => {
    expect(calculateCTR(-50, 1000)).toBe(0);
  });

  it("handles fractional CTR values", () => {
    expect(calculateCTR(17, 1000)).toBeCloseTo(1.7, 1);
    expect(calculateCTR(123, 5000)).toBeCloseTo(2.46, 2);
  });
});

describe("Ads Metrics - Conversion Rate", () => {
  it("calculates conversion rate correctly as percentage", () => {
    expect(calculateConversionRate(10, 100)).toBe(10.0);
    expect(calculateConversionRate(5, 50)).toBe(10.0);
    expect(calculateConversionRate(25, 1000)).toBe(2.5);
  });

  it("returns 0 when clicks is zero (zero-guard)", () => {
    expect(calculateConversionRate(10, 0)).toBe(0);
    expect(calculateConversionRate(5, 0)).toBe(0);
  });

  it("returns 0 when clicks is negative (zero-guard)", () => {
    expect(calculateConversionRate(10, -100)).toBe(0);
  });

  it("returns 0 when conversions is negative (zero-guard)", () => {
    expect(calculateConversionRate(-10, 100)).toBe(0);
  });

  it("handles zero conversions with positive clicks", () => {
    expect(calculateConversionRate(0, 100)).toBe(0);
  });
});

describe("Ads Metrics - Formatting", () => {
  it("formats currency with default USD", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
    expect(formatCurrency(1000)).toBe("$1,000.00");
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats currency with custom currency code", () => {
    expect(formatCurrency(1000, "EUR")).toContain("1,000.00");
    expect(formatCurrency(1000, "GBP")).toContain("1,000.00");
  });

  it("formats percentage with default 2 decimals", () => {
    expect(formatPercentage(5.5)).toBe("5.50%");
    expect(formatPercentage(12.345)).toBe("12.35%");
    expect(formatPercentage(0)).toBe("0.00%");
  });

  it("formats percentage with custom decimal places", () => {
    expect(formatPercentage(12.345, 1)).toBe("12.3%");
    expect(formatPercentage(12.345, 3)).toBe("12.345%");
    expect(formatPercentage(5.5, 0)).toBe("6%");
  });
});

describe("Ads Metrics - Contract Test Requirements", () => {
  it("verifies ROAS returns correct values", () => {
    // Contract: ROAS = Revenue / Spend
    const revenue = 1000;
    const spend = 250;
    const expectedROAS = 4.0;

    expect(calculateROAS(revenue, spend)).toBe(expectedROAS);
  });

  it("verifies CPC returns correct values", () => {
    // Contract: CPC = Spend / Clicks
    const spend = 100;
    const clicks = 50;
    const expectedCPC = 2.0;

    expect(calculateCPC(spend, clicks)).toBe(expectedCPC);
  });

  it("verifies zero guards prevent division by zero", () => {
    // Contract: All helpers must return 0 when divisor is zero
    expect(calculateROAS(100, 0)).toBe(0);
    expect(calculateCPC(100, 0)).toBe(0);
    expect(calculateCPA(100, 0)).toBe(0);
    expect(calculateCTR(50, 0)).toBe(0);
    expect(calculateConversionRate(10, 0)).toBe(0);
  });

  it("verifies negative input guards", () => {
    // Contract: All helpers must handle negative inputs gracefully
    expect(calculateROAS(-100, 50)).toBe(0);
    expect(calculateROAS(100, -50)).toBe(0);
    expect(calculateCPC(-100, 50)).toBe(0);
    expect(calculateCPC(100, -50)).toBe(0);
    expect(calculateCPA(-100, 10)).toBe(0);
    expect(calculateCPA(100, -10)).toBe(0);
  });
});
