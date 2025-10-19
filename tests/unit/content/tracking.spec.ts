/**
 * Content Tracking Library Tests
 *
 * @see app/lib/content/tracking.ts
 */

import { describe, it, expect } from "vitest";
import {
  calculateEngagementRate,
  calculateClickThroughRate,
  calculateConversionRate,
  getPerformanceTier,
  getPlatformEngagementTarget,
  getPlatformCTRTarget,
  getPlatformConversionTarget,
} from "~/lib/content/tracking";

describe("Content Tracking Library", () => {
  describe("calculateEngagementRate", () => {
    it("calculates correct engagement rate", () => {
      const engagement = {
        likes: 100,
        comments: 20,
        shares: 5,
        saves: 30,
      };
      const impressions = 5000;

      const result = calculateEngagementRate(engagement, impressions);

      expect(result).toBe(3.1); // (155 / 5000) * 100 = 3.1%
    });

    it("handles zero impressions", () => {
      const engagement = { likes: 100, comments: 20, shares: 5 };
      const impressions = 0;

      const result = calculateEngagementRate(engagement, impressions);

      expect(result).toBe(0);
    });

    it("handles missing saves", () => {
      const engagement = { likes: 100, comments: 20, shares: 5 };
      const impressions = 5000;

      const result = calculateEngagementRate(engagement, impressions);

      expect(result).toBe(2.5); // (125 / 5000) * 100 = 2.5%
    });

    it("returns 2 decimal places", () => {
      const engagement = { likes: 33, comments: 7, shares: 2 };
      const impressions = 1000;

      const result = calculateEngagementRate(engagement, impressions);

      expect(result).toBe(4.2);
      expect(result.toString()).toMatch(/^\d+\.\d{1,2}$/);
    });
  });

  describe("calculateClickThroughRate", () => {
    it("calculates correct CTR", () => {
      const clicks = 150;
      const impressions = 5000;

      const result = calculateClickThroughRate(clicks, impressions);

      expect(result).toBe(3.0); // (150 / 5000) * 100 = 3%
    });

    it("handles zero impressions", () => {
      const result = calculateClickThroughRate(100, 0);

      expect(result).toBe(0);
    });

    it("returns 2 decimal places", () => {
      const result = calculateClickThroughRate(17, 1000);

      expect(result).toBe(1.7);
    });
  });

  describe("calculateConversionRate", () => {
    it("calculates correct conversion rate", () => {
      const conversions = 45;
      const clicks = 1500;

      const result = calculateConversionRate(conversions, clicks);

      expect(result).toBe(3.0); // (45 / 1500) * 100 = 3%
    });

    it("handles zero clicks", () => {
      const result = calculateConversionRate(10, 0);

      expect(result).toBe(0);
    });

    it("returns 2 decimal places", () => {
      const result = calculateConversionRate(7, 333);

      expect(result).toBe(2.1);
    });
  });

  describe("getPerformanceTier", () => {
    it("returns exceptional for >150% of target", () => {
      const result = getPerformanceTier(6.2, 4.0);

      expect(result).toBe("exceptional"); // 155% of target
    });

    it("returns above_target for 100-150% of target", () => {
      const result = getPerformanceTier(4.5, 4.0);

      expect(result).toBe("above_target"); // 112.5% of target
    });

    it("returns at_target for 75-100% of target", () => {
      const result = getPerformanceTier(3.2, 4.0);

      expect(result).toBe("at_target"); // 80% of target
    });

    it("returns below_target for <75% of target", () => {
      const result = getPerformanceTier(2.5, 4.0);

      expect(result).toBe("below_target"); // 62.5% of target
    });

    it("handles zero target", () => {
      const result = getPerformanceTier(5.0, 0);

      expect(result).toBe("below_target");
    });
  });

  describe("Platform Targets", () => {
    it("returns correct Instagram engagement target", () => {
      expect(getPlatformEngagementTarget("instagram")).toBe(4.0);
    });

    it("returns correct TikTok engagement target", () => {
      expect(getPlatformEngagementTarget("tiktok")).toBe(5.0);
    });

    it("returns correct Facebook engagement target", () => {
      expect(getPlatformEngagementTarget("facebook")).toBe(2.0);
    });

    it("returns correct CTR target for all platforms", () => {
      expect(getPlatformCTRTarget("instagram")).toBe(1.2);
      expect(getPlatformCTRTarget("facebook")).toBe(1.2);
      expect(getPlatformCTRTarget("tiktok")).toBe(1.2);
    });

    it("returns correct conversion target for all platforms", () => {
      expect(getPlatformConversionTarget("instagram")).toBe(2.0);
      expect(getPlatformConversionTarget("facebook")).toBe(2.0);
      expect(getPlatformConversionTarget("tiktok")).toBe(2.0);
    });
  });
});
