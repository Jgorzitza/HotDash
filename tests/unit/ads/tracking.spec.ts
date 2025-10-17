import { describe, it, expect } from "vitest";
import { roas, cpc, cpa } from "~/lib/ads/metrics";

// Contract: ROAS/CPC/CPA helpers return correct values and zero guards when spend/clicks are zero.

describe("ads metrics helpers", () => {
  it("computes ROAS = revenue / spend for positive inputs", () => {
    expect(roas(200, 100)).toBe(2);
    expect(roas(150, 50)).toBe(3);
  });

  it("ROAS returns 0 when spend is 0 or negative", () => {
    expect(roas(200, 0)).toBe(0);
    expect(roas(200, -10)).toBe(0);
  });

  it("ROAS returns 0 when revenue is 0 or negative", () => {
    expect(roas(0, 100)).toBe(0);
    expect(roas(-50, 100)).toBe(0);
  });

  it("computes CPC = spend / clicks for positive inputs", () => {
    expect(cpc(100, 50)).toBe(2);
    expect(cpc(12.5, 5)).toBe(2.5);
  });

  it("CPC returns 0 when clicks is 0 or negative", () => {
    expect(cpc(100, 0)).toBe(0);
    expect(cpc(100, -5)).toBe(0);
  });

  it("CPC returns 0 when spend is 0 or negative", () => {
    expect(cpc(0, 50)).toBe(0);
    expect(cpc(-10, 50)).toBe(0);
  });

  it("computes CPA = spend / conversions for positive inputs", () => {
    expect(cpa(100, 20)).toBe(5);
    expect(cpa(45, 9)).toBe(5);
  });

  it("CPA returns 0 when conversions is 0 or negative", () => {
    expect(cpa(100, 0)).toBe(0);
    expect(cpa(100, -3)).toBe(0);
  });

  it("CPA returns 0 when spend is 0 or negative", () => {
    expect(cpa(0, 20)).toBe(0);
    expect(cpa(-10, 20)).toBe(0);
  });

  it("guards against non-finite inputs", () => {
    // @ts-expect-error intentional
    expect(roas(Number.NaN, 100)).toBe(0);
    // @ts-expect-error intentional
    expect(cpc(100, Number.POSITIVE_INFINITY)).toBe(0);
    // @ts-expect-error intentional
    expect(cpa("100" as any, 10)).toBe(0);
  });
});
