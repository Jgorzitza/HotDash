/**
 * Contract Test: API Endpoints
 *
 * Purpose: Verify API contracts remain stable
 * Run: npm run test:contract or vitest run tests/contract/
 */

import { describe, it, expect } from "vitest";

const BASE_URL = process.env.API_URL || "http://localhost:3000";

describe("API Contract Tests", () => {
  describe("Revenue API", () => {
    it("should match expected schema", async () => {
      const response = await fetch(`${BASE_URL}/api/shopify/revenue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: "2025-01-01",
          endDate: "2025-01-31",
        }),
      });

      const data = await response.json();

      // Verify contract shape
      expect(data).toHaveProperty("revenue");
      expect(data).toHaveProperty("orders");
      expect(data).toHaveProperty("period");
      expect(typeof data.revenue).toBe("number");
      expect(typeof data.orders).toBe("number");
    });
  });

  describe("Analytics API", () => {
    it("conversion rate endpoint should match schema", async () => {
      const response = await fetch(
        `${BASE_URL}/api/analytics/conversion-rate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: "2025-01-01",
            endDate: "2025-01-31",
          }),
        },
      );

      const data = await response.json();

      // Verify contract
      expect(data).toHaveProperty("conversionRate");
      expect(typeof data.conversionRate).toBe("number");
    });
  });

  describe("SEO API", () => {
    it("anomalies endpoint should return array", async () => {
      const response = await fetch(`${BASE_URL}/api/seo/anomalies`);
      const data = await response.json();

      // Verify contract
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
