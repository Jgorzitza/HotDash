/**
 * Tests for CSV/Excel Data Export Service
 *
 * @see app/services/analytics/csv-export.ts
 * @see docs/directions/analytics.md ANALYTICS-010
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateCSVStream,
  createCSVStream,
  generateExportFilename,
  type ExportType,
} from "../../../../app/services/analytics/csv-export";

// Polyfill ReadableStream for Node.js test environment
if (typeof ReadableStream === "undefined") {
  global.ReadableStream = class ReadableStream {
    private _source: any;

    constructor(source: any) {
      this._source = source;
    }

    getReader() {
      return {
        read: async () => {
          if (this._source.pull) {
            const chunks: any[] = [];
            const controller = {
              enqueue: (chunk: any) => chunks.push(chunk),
              close: () => {},
            };

            try {
              await this._source.pull(controller);
              if (chunks.length > 0) {
                return { value: chunks[0], done: false };
              }
            } catch (e) {
              // Stream closed or error
            }
          }
          return { value: undefined, done: true };
        },
      };
    }
  } as any;
}

// Mock database client
let mockDashboardFacts: any[] = [];

vi.mock("../../../../app/db.server", () => ({
  default: {
    dashboardFact: {
      findMany: vi.fn((query: any) => {
        // Filter by factType if specified
        let results = mockDashboardFacts;

        if (query?.where?.factType) {
          if (typeof query.where.factType === "string") {
            results = results.filter(
              (f) => f.factType === query.where.factType,
            );
          } else if (query.where.factType.in) {
            results = results.filter((f) =>
              query.where.factType.in.includes(f.factType),
            );
          }
        }

        // Apply pagination
        const skip = query?.skip || 0;
        const take = query?.take || results.length;
        results = results.slice(skip, skip + take);

        return Promise.resolve(results);
      }),
    },
  },
}));

describe("CSV Export Service", () => {
  const mockShopDomain = "test-shop.myshopify.com";

  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardFacts = [];
  });

  describe("generateExportFilename", () => {
    it("should generate filename with type and date", () => {
      const filename = generateExportFilename("social", "csv");
      expect(filename).toMatch(/^analytics-social-\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it("should support different export types", () => {
      const types: ExportType[] = ["social", "seo", "ads", "growth", "all"];
      types.forEach((type) => {
        const filename = generateExportFilename(type, "csv");
        expect(filename).toContain(`analytics-${type}`);
      });
    });

    it("should support different formats", () => {
      const csvFile = generateExportFilename("social", "csv");
      const jsonFile = generateExportFilename("social", "json");

      expect(csvFile.endsWith(".csv")).toBe(true);
      expect(jsonFile.endsWith(".json")).toBe(true);
    });
  });

  describe("generateCSVStream", () => {
    it("should generate CSV header for social export", async () => {
      mockDashboardFacts = [];

      const generator = generateCSVStream({
        type: "social",
        shopDomain: mockShopDomain,
      });

      const { value } = await generator.next();
      expect(value).toContain("Date,Post ID,Platform");
      expect(value).toContain("Impressions,Clicks,Engagement");
    });

    it("should generate CSV header for SEO export", async () => {
      mockDashboardFacts = [];

      const generator = generateCSVStream({
        type: "seo",
        shopDomain: mockShopDomain,
      });

      const { value } = await generator.next();
      expect(value).toContain("Date,Keyword,Position");
      expect(value).toContain("Change,Trend,URL");
    });

    it("should generate CSV header for ads export", async () => {
      mockDashboardFacts = [];

      const generator = generateCSVStream({
        type: "ads",
        shopDomain: mockShopDomain,
      });

      const { value } = await generator.next();
      expect(value).toContain("Campaign ID,Campaign Name");
      expect(value).toContain("Spend,Revenue,ROAS");
    });

    it("should stream social data rows", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "social_performance",
          value: {
            postId: "post-123",
            platform: "twitter",
            impressions: 1000,
            clicks: 50,
            engagement: 30,
            ctr: 5.0,
            engagementRate: 3.0,
          },
          createdAt: new Date("2025-10-20T10:00:00Z"),
        },
      ];

      const generator = generateCSVStream({
        type: "social",
        shopDomain: mockShopDomain,
      });

      const chunks: string[] = [];
      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0]).toContain("Post ID"); // Header
      expect(chunks[1]).toContain("post-123"); // Data row
      expect(chunks[1]).toContain("twitter");
      expect(chunks[1]).toContain("1000");
    });

    it("should stream SEO data rows", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "seo_ranking",
          value: {
            keyword: "running shoes",
            position: 5,
            previousPosition: 10,
            change: 5,
            trend: "up",
            url: "https://example.com/shoes",
          },
          createdAt: new Date("2025-10-20T10:00:00Z"),
        },
      ];

      const generator = generateCSVStream({
        type: "seo",
        shopDomain: mockShopDomain,
      });

      const chunks: string[] = [];
      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      expect(chunks[1]).toContain("running shoes");
      expect(chunks[1]).toContain("5"); // position
      expect(chunks[1]).toContain("up"); // trend
    });

    it("should handle date range filtering", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "social_performance",
          value: { postId: "post-1", impressions: 1000, clicks: 50 },
          createdAt: new Date("2025-10-20"),
        },
      ];

      const generator = generateCSVStream({
        type: "social",
        shopDomain: mockShopDomain,
        startDate: new Date("2025-10-15"),
        endDate: new Date("2025-10-25"),
      });

      const chunks: string[] = [];
      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);
    });

    it("should handle empty results", async () => {
      mockDashboardFacts = [];

      const generator = generateCSVStream({
        type: "social",
        shopDomain: mockShopDomain,
      });

      const chunks: string[] = [];
      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      // Should only have header row
      expect(chunks.length).toBe(1);
      expect(chunks[0]).toContain("Date,Post ID");
    });

    it("should escape CSV values with commas", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "seo_ranking",
          value: {
            keyword: "shoes, boots, sandals",
            position: 5,
            url: "https://example.com",
          },
          createdAt: new Date(),
        },
      ];

      const generator = generateCSVStream({
        type: "seo",
        shopDomain: mockShopDomain,
      });

      const chunks: string[] = [];
      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      // Should be wrapped in quotes
      expect(chunks[1]).toContain('"shoes, boots, sandals"');
    });

    it("should batch large datasets for memory efficiency", async () => {
      // Create 250 records (more than 2 batches of 100)
      mockDashboardFacts = Array.from({ length: 250 }, (_, i) => ({
        id: i,
        factType: "social_performance",
        value: {
          postId: `post-${i}`,
          impressions: 1000,
          clicks: 50,
        },
        createdAt: new Date(),
      }));

      const generator = generateCSVStream({
        type: "social",
        shopDomain: mockShopDomain,
      });

      const chunks: string[] = [];
      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      // Header + 250 data rows = 251 chunks
      expect(chunks.length).toBe(251);
    });
  });

  describe("createCSVStream", () => {
    it("should create ReadableStream from async generator", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "social_performance",
          value: {
            postId: "post-1",
            impressions: 1000,
            clicks: 50,
          },
          createdAt: new Date(),
        },
      ];

      const stream = await createCSVStream({
        type: "social",
        shopDomain: mockShopDomain,
      });

      expect(stream).toBeDefined();
      expect(typeof stream).toBe("object");
    });

    it("should create stream that can be used in Response", async () => {
      mockDashboardFacts = [];

      const stream = await createCSVStream({
        type: "social",
        shopDomain: mockShopDomain,
      });

      // Verify stream can be used in Response constructor
      expect(stream).toBeDefined();
      expect(stream.getReader).toBeDefined();
    });
  });

  describe("Export All Types", () => {
    it("should export all analytics types when type='all'", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "social_performance",
          value: { postId: "post-1", impressions: 1000 },
          createdAt: new Date(),
        },
        {
          id: 2,
          factType: "seo_ranking",
          value: { keyword: "test", position: 5 },
          createdAt: new Date(),
        },
        {
          id: 3,
          factType: "ads_roas",
          value: { campaignId: "c1", roas: 3.0 },
          createdAt: new Date(),
        },
      ];

      const generator = generateCSVStream({
        type: "all",
        shopDomain: mockShopDomain,
      });

      const chunks: string[] = [];
      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      // Should have data from all three types
      expect(chunks.length).toBeGreaterThan(3); // Header + at least 3 rows
    });
  });
});
