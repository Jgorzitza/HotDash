/**
 * Core Web Vitals Monitoring Service Tests
 * 
 * Tests for Core Web Vitals monitoring including:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - PageSpeed Insights API integration
 * - Performance recommendations
 */

import { describe, expect, it, vi } from "vitest";
import { analyzeWebVitals } from "../../../../app/services/seo/core-web-vitals";

describe("Core Web Vitals Service", () => {
  describe("analyzeWebVitals", () => {
    it("should analyze web vitals and return comprehensive analysis", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      expect(result).toHaveProperty("mobile");
      expect(result).toHaveProperty("desktop");
      expect(result).toHaveProperty("opportunities");
      expect(result).toHaveProperty("diagnostics");
      expect(result).toHaveProperty("analyzedAt");
    });

    it("should return mobile and desktop metrics", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      // Mobile metrics
      expect(result.mobile).toHaveProperty("url", url);
      expect(result.mobile).toHaveProperty("device", "mobile");
      expect(result.mobile).toHaveProperty("lcp");
      expect(result.mobile).toHaveProperty("fid");
      expect(result.mobile).toHaveProperty("cls");
      expect(result.mobile).toHaveProperty("overallScore");
      expect(result.mobile).toHaveProperty("recommendations");

      // Desktop metrics
      expect(result.desktop).toHaveProperty("url", url);
      expect(result.desktop).toHaveProperty("device", "desktop");
      expect(result.desktop).toHaveProperty("lcp");
      expect(result.desktop).toHaveProperty("fid");
      expect(result.desktop).toHaveProperty("cls");
      expect(result.desktop).toHaveProperty("overallScore");
      expect(result.desktop).toHaveProperty("recommendations");
    });

    it("should include LCP metrics with proper structure", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      const lcp = result.mobile.lcp;

      expect(lcp).toHaveProperty("value");
      expect(lcp).toHaveProperty("unit", "ms");
      expect(lcp).toHaveProperty("rating");
      expect(["good", "needs-improvement", "poor"]).toContain(lcp.rating);
      expect(lcp).toHaveProperty("percentile", 75);
      expect(lcp).toHaveProperty("threshold");
      expect(lcp.threshold).toHaveProperty("good", 2500);
      expect(lcp.threshold).toHaveProperty("needsImprovement", 4000);
    });

    it("should include FID metrics with proper structure", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      const fid = result.mobile.fid;

      expect(fid).toHaveProperty("value");
      expect(fid).toHaveProperty("unit", "ms");
      expect(fid).toHaveProperty("rating");
      expect(["good", "needs-improvement", "poor"]).toContain(fid.rating);
      expect(fid).toHaveProperty("threshold");
      expect(fid.threshold).toHaveProperty("good", 100);
      expect(fid.threshold).toHaveProperty("needsImprovement", 300);
    });

    it("should include CLS metrics with proper structure", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      const cls = result.mobile.cls;

      expect(cls).toHaveProperty("value");
      expect(cls).toHaveProperty("unit", "score");
      expect(cls).toHaveProperty("rating");
      expect(["good", "needs-improvement", "poor"]).toContain(cls.rating);
      expect(cls).toHaveProperty("threshold");
      expect(cls.threshold).toHaveProperty("good", 0.1);
      expect(cls.threshold).toHaveProperty("needsImprovement", 0.25);
    });

    it("should rate LCP as good when value <= 2500ms", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      const lcp = result.desktop.lcp; // Desktop typically has better values

      if (lcp.value <= 2500) {
        expect(lcp.rating).toBe("good");
      }
    });

    it("should rate FID as good when value <= 100ms", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      const fid = result.desktop.fid;

      if (fid.value <= 100) {
        expect(fid.rating).toBe("good");
      }
    });

    it("should rate CLS as good when value <= 0.1", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      const cls = result.desktop.cls;

      if (cls.value <= 0.1) {
        expect(cls.rating).toBe("good");
      }
    });

    it("should include overall performance score (0-100)", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      expect(result.mobile.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.mobile.overallScore).toBeLessThanOrEqual(100);
      expect(result.desktop.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.desktop.overallScore).toBeLessThanOrEqual(100);
    });

    it("should provide performance recommendations", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      expect(Array.isArray(result.mobile.recommendations)).toBe(true);
      expect(Array.isArray(result.desktop.recommendations)).toBe(true);
      
      // Should have at least some recommendations or confirmation message
      expect(result.mobile.recommendations.length).toBeGreaterThan(0);
    });

    it("should include performance opportunities", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      expect(Array.isArray(result.opportunities)).toBe(true);
      
      if (result.opportunities.length > 0) {
        const opportunity = result.opportunities[0];
        expect(opportunity).toHaveProperty("title");
        expect(opportunity).toHaveProperty("description");
        expect(opportunity).toHaveProperty("estimatedSavings");
        expect(opportunity).toHaveProperty("impact");
        expect(["high", "medium", "low"]).toContain(opportunity.impact);
      }
    });

    it("should include performance diagnostics", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      expect(Array.isArray(result.diagnostics)).toBe(true);
      
      if (result.diagnostics.length > 0) {
        const diagnostic = result.diagnostics[0];
        expect(diagnostic).toHaveProperty("title");
        expect(diagnostic).toHaveProperty("description");
        expect(diagnostic).toHaveProperty("severity");
        expect(["critical", "warning", "info"]).toContain(diagnostic.severity);
      }
    });

    it("should sort opportunities by impact", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      if (result.opportunities.length > 1) {
        const impactOrder = { high: 0, medium: 1, low: 2 };
        
        for (let i = 0; i < result.opportunities.length - 1; i++) {
          const current = impactOrder[result.opportunities[i].impact];
          const next = impactOrder[result.opportunities[i + 1].impact];
          expect(current).toBeLessThanOrEqual(next);
        }
      }
    });

    it("should include timestamp in analyzedAt field", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      expect(result.analyzedAt).toBeTruthy();
      expect(new Date(result.analyzedAt).toString()).not.toBe("Invalid Date");
    });

    it("should include measuredAt timestamp for mobile metrics", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      expect(result.mobile.measuredAt).toBeTruthy();
      expect(new Date(result.mobile.measuredAt).toString()).not.toBe("Invalid Date");
    });

    it("should include measuredAt timestamp for desktop metrics", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      expect(result.desktop.measuredAt).toBeTruthy();
      expect(new Date(result.desktop.measuredAt).toString()).not.toBe("Invalid Date");
    });

    it("should recommend LCP improvements for poor scores", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      if (result.mobile.lcp.rating !== "good") {
        const hasLCPRecommendation = result.mobile.recommendations.some(r => 
          r.toLowerCase().includes("lcp") || r.toLowerCase().includes("largest contentful paint")
        );
        expect(hasLCPRecommendation).toBe(true);
      }
    });

    it("should recommend FID improvements for poor scores", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      if (result.mobile.fid.rating !== "good") {
        const hasFIDRecommendation = result.mobile.recommendations.some(r => 
          r.toLowerCase().includes("fid") || r.toLowerCase().includes("first input delay")
        );
        expect(hasFIDRecommendation).toBe(true);
      }
    });

    it("should recommend CLS improvements for poor scores", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      if (result.mobile.cls.rating !== "good") {
        const hasCLSRecommendation = result.mobile.recommendations.some(r => 
          r.toLowerCase().includes("cls") || r.toLowerCase().includes("cumulative layout shift")
        );
        expect(hasCLSRecommendation).toBe(true);
      }
    });

    it("should provide positive feedback when all vitals are good", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      const allGood = 
        result.desktop.lcp.rating === "good" && 
        result.desktop.fid.rating === "good" && 
        result.desktop.cls.rating === "good";

      if (allGood) {
        const hasPositiveMessage = result.desktop.recommendations.some(r => 
          r.toLowerCase().includes("good") || r.toLowerCase().includes("keep")
        );
        expect(hasPositiveMessage).toBe(true);
      }
    });

    it("should handle analysis without PageSpeed API key (mock data)", async () => {
      // This test verifies the service works with mock data when API key is not available
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      // Should still return valid structure with mock data
      expect(result.mobile.lcp.value).toBeGreaterThan(0);
      expect(result.mobile.fid.value).toBeGreaterThan(0);
      expect(result.mobile.cls.value).toBeGreaterThan(0);
    });

    it("should have mobile metrics worse than desktop (typical pattern)", async () => {
      const url = "https://example.com/test";

      const result = await analyzeWebVitals(url);

      // Typically mobile has worse performance
      // This is expected in mock data
      expect(result.mobile.lcp.value).toBeGreaterThanOrEqual(result.desktop.lcp.value);
      expect(result.mobile.overallScore).toBeLessThanOrEqual(result.desktop.overallScore);
    });
  });
});

