/**
 * Tests for Scheduled Analytics Reports
 * 
 * @see app/services/analytics/scheduled-reports.ts
 * @see docs/directions/analytics.md ANALYTICS-014
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
} from "../../../../app/services/analytics/scheduled-reports";

// Mock dependencies
let mockDashboardFacts: any[] = [];

vi.mock("../../../../app/db.server", () => ({
  default: {
    dashboardFact: {
      findMany: vi.fn((query: any) => {
        // Filter by factType if specified
        let results = mockDashboardFacts;

        if (query?.where?.factType?.in) {
          results = results.filter((f) =>
            query.where.factType.in.includes(f.factType)
          );
        }

        if (query?.select?.shopDomain && query?.distinct) {
          // Return distinct shops
          return Promise.resolve([{ shopDomain: "test-shop.myshopify.com" }]);
        }

        return Promise.resolve(results);
      }),
    },
  },
}));

describe("Scheduled Analytics Reports", () => {
  const mockShopDomain = "test-shop.myshopify.com";

  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardFacts = [];
  });

  describe("generateDailyReport", () => {
    beforeEach(() => {
      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: mockShopDomain,
          factType: "ads_roas",
          value: {
            impressions: 1000,
            clicks: 50,
            conversions: 5,
            revenue: 500,
            spend: 100,
            ctr: 5.0,
            roas: 5.0,
          },
          createdAt: new Date(),
        },
      ];
    });

    it("should generate daily report with all sections", async () => {
      const result = await generateDailyReport(mockShopDomain);

      expect(result.reportId).toContain("daily");
      expect(result.reportType).toBe("daily");
      expect(result.shopDomain).toBe(mockShopDomain);
      expect(result.generatedAt).toBeInstanceOf(Date);
      expect(result.period).toHaveProperty("start");
      expect(result.period).toHaveProperty("end");
      expect(result.metrics).toBeDefined();
      expect(result.highlights).toBeInstanceOf(Array);
      expect(result.emailTemplate).toBeDefined();
    });

    it("should include key metrics in report", async () => {
      const result = await generateDailyReport(mockShopDomain);

      expect(result.metrics).toHaveProperty("impressions");
      expect(result.metrics).toHaveProperty("clicks");
      expect(result.metrics).toHaveProperty("conversions");
      expect(result.metrics).toHaveProperty("revenue");
      expect(result.metrics).toHaveProperty("ctr");
      expect(result.metrics).toHaveProperty("conversionRate");
      expect(result.metrics).toHaveProperty("roas");
    });

    it("should include email template with subject, body, and HTML", async () => {
      const result = await generateDailyReport(mockShopDomain);

      expect(result.emailTemplate).toHaveProperty("subject");
      expect(result.emailTemplate).toHaveProperty("body");
      expect(result.emailTemplate).toHaveProperty("html");
      expect(result.emailTemplate.subject).toContain("Daily");
      expect(result.emailTemplate.subject).toContain(mockShopDomain);
    });

    it("should include forecast information", async () => {
      const result = await generateDailyReport(mockShopDomain);

      expect(result.forecast).toHaveProperty("trend");
      expect(result.forecast).toHaveProperty("prediction");
      expect(["up", "down", "stable"]).toContain(result.forecast.trend);
    });

    it("should generate highlights array", async () => {
      const result = await generateDailyReport(mockShopDomain);

      expect(result.highlights).toBeInstanceOf(Array);
      expect(result.highlights.length).toBeGreaterThan(0);
    });
  });

  describe("generateWeeklyReport", () => {
    beforeEach(() => {
      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: mockShopDomain,
          factType: "ads_roas",
          value: {
            impressions: 7000,
            clicks: 350,
            conversions: 35,
            revenue: 3500,
            spend: 700,
            ctr: 5.0,
            roas: 5.0,
          },
          createdAt: new Date(),
        },
      ];
    });

    it("should generate weekly report", async () => {
      const result = await generateWeeklyReport(mockShopDomain);

      expect(result.reportType).toBe("weekly");
      expect(result.reportId).toContain("weekly");
      expect(result.emailTemplate.subject).toContain("Weekly");
    });

    it("should have correct period (7 days)", async () => {
      const result = await generateWeeklyReport(mockShopDomain);

      const periodDays = Math.round(
        (result.period.end.getTime() - result.period.start.getTime()) /
          (24 * 60 * 60 * 1000)
      );

      expect(periodDays).toBe(7);
    });
  });

  describe("generateMonthlyReport", () => {
    beforeEach(() => {
      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: mockShopDomain,
          factType: "ads_roas",
          value: {
            impressions: 30000,
            clicks: 1500,
            conversions: 150,
            revenue: 15000,
            spend: 3000,
            ctr: 5.0,
            roas: 5.0,
          },
          createdAt: new Date(),
        },
      ];
    });

    it("should generate monthly report", async () => {
      const result = await generateMonthlyReport(mockShopDomain);

      expect(result.reportType).toBe("monthly");
      expect(result.reportId).toContain("monthly");
      expect(result.emailTemplate.subject).toContain("Monthly");
    });

    it("should have correct period (30 days)", async () => {
      const result = await generateMonthlyReport(mockShopDomain);

      const periodDays = Math.round(
        (result.period.end.getTime() - result.period.start.getTime()) /
          (24 * 60 * 60 * 1000)
      );

      expect(periodDays).toBe(30);
    });
  });

  describe("Email Templates", () => {
    beforeEach(() => {
      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: mockShopDomain,
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500, spend: 100 },
          createdAt: new Date(),
        },
      ];
    });

    it("should generate HTML template for email clients", async () => {
      const result = await generateDailyReport(mockShopDomain);

      expect(result.emailTemplate.html).toContain("<h2>");
      expect(result.emailTemplate.html).toContain("<ul>");
      expect(result.emailTemplate.html).toContain("<li>");
    });

    it("should generate plain text template for fallback", async () => {
      const result = await generateDailyReport(mockShopDomain);

      expect(result.emailTemplate.body).not.toContain("<");
      expect(result.emailTemplate.body).toContain(mockShopDomain);
      expect(result.emailTemplate.body).toContain("Revenue:");
    });
  });
});


