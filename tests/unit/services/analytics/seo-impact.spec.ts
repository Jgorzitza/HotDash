/**
 * Tests for SEO Impact Analysis Service
 * 
 * @see app/services/analytics/seo-impact.ts
 * @see docs/directions/analytics.md ANALYTICS-007
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  trackKeywordRanking,
  getSEOImpactAnalysis,
  correlateSEOWithContent,
  getKeywordHistory,
} from "../../../../app/services/analytics/seo-impact";

// Mock database client
let mockDashboardFacts: any[] = [];
let mockDecisionLogs: any[] = [];
let mockCreateCalled = false;
let mockFindFirstResult: any = null;

vi.mock("../../../../app/db.server", () => ({
  default: {
    dashboardFact: {
      create: vi.fn((data) => {
        mockCreateCalled = true;
        return Promise.resolve({ id: 1, ...data.data });
      }),
      findFirst: vi.fn(() => Promise.resolve(mockFindFirstResult)),
      findMany: vi.fn(() => Promise.resolve(mockDashboardFacts)),
    },
    decisionLog: {
      findMany: vi.fn(() => Promise.resolve(mockDecisionLogs)),
    },
  },
}));

describe("SEO Impact Analysis Service", () => {
  const mockShopDomain = "test-shop.myshopify.com";
  const mockKeyword = "best running shoes";
  const mockUrl = "https://example.com/running-shoes";

  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardFacts = [];
    mockDecisionLogs = [];
    mockCreateCalled = false;
    mockFindFirstResult = null;
  });

  describe("trackKeywordRanking", () => {
    it("should track new keyword ranking (no previous data)", async () => {
      mockFindFirstResult = null;

      const result = await trackKeywordRanking(
        mockKeyword,
        5,
        mockUrl,
        mockShopDomain,
        1000
      );

      expect(result.keyword).toBe(mockKeyword);
      expect(result.currentPosition).toBe(5);
      expect(result.previousPosition).toBeNull();
      expect(result.change).toBe(0);
      expect(result.trend).toBe("new");
      expect(result.url).toBe(mockUrl);
      expect(result.searchVolume).toBe(1000);
      expect(mockCreateCalled).toBe(true);
    });

    it("should track improved ranking (lower position number)", async () => {
      mockFindFirstResult = {
        value: { position: 10 },
        createdAt: new Date("2025-10-15"),
      };

      const result = await trackKeywordRanking(
        mockKeyword,
        5,
        mockUrl,
        mockShopDomain
      );

      expect(result.currentPosition).toBe(5);
      expect(result.previousPosition).toBe(10);
      expect(result.change).toBe(5); // Improved by 5 positions
      expect(result.trend).toBe("up");
    });

    it("should track declined ranking (higher position number)", async () => {
      mockFindFirstResult = {
        value: { position: 3 },
        createdAt: new Date("2025-10-15"),
      };

      const result = await trackKeywordRanking(
        mockKeyword,
        8,
        mockUrl,
        mockShopDomain
      );

      expect(result.currentPosition).toBe(8);
      expect(result.previousPosition).toBe(3);
      expect(result.change).toBe(-5); // Declined by 5 positions
      expect(result.trend).toBe("down");
    });

    it("should track stable ranking (no change)", async () => {
      mockFindFirstResult = {
        value: { position: 7 },
        createdAt: new Date("2025-10-15"),
      };

      const result = await trackKeywordRanking(
        mockKeyword,
        7,
        mockUrl,
        mockShopDomain
      );

      expect(result.currentPosition).toBe(7);
      expect(result.previousPosition).toBe(7);
      expect(result.change).toBe(0);
      expect(result.trend).toBe("stable");
    });

    it("should store ranking data in DashboardFact", async () => {
      mockFindFirstResult = null;

      await trackKeywordRanking(mockKeyword, 5, mockUrl, mockShopDomain);

      expect(mockCreateCalled).toBe(true);
    });
  });

  describe("getSEOImpactAnalysis", () => {
    it("should return summary with all keyword trends", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: {
            keyword: "keyword1",
            position: 3,
            change: 5,
            trend: "up",
          },
          createdAt: now,
        },
        {
          id: 2,
          value: {
            keyword: "keyword2",
            position: 8,
            change: -3,
            trend: "down",
          },
          createdAt: now,
        },
        {
          id: 3,
          value: {
            keyword: "keyword3",
            position: 5,
            change: 0,
            trend: "stable",
          },
          createdAt: now,
        },
        {
          id: 4,
          value: {
            keyword: "keyword4",
            position: 10,
            change: 0,
            trend: "new",
          },
          createdAt: now,
        },
      ];

      const result = await getSEOImpactAnalysis(mockShopDomain, 30);

      expect(result.totalKeywords).toBe(4);
      expect(result.improved).toBe(1);
      expect(result.declined).toBe(1);
      expect(result.stable).toBe(1);
      expect(result.newKeywords).toBe(1);
      expect(result.avgPosition).toBe(6.5); // (3+8+5+10)/4
    });

    it("should identify top movers (biggest improvements)", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: { keyword: "keyword1", position: 2, change: 10, trend: "up" },
          createdAt: now,
        },
        {
          id: 2,
          value: { keyword: "keyword2", position: 5, change: 3, trend: "up" },
          createdAt: now,
        },
        {
          id: 3,
          value: { keyword: "keyword3", position: 7, change: 7, trend: "up" },
          createdAt: now,
        },
      ];

      const result = await getSEOImpactAnalysis(mockShopDomain, 30);

      expect(result.topMovers).toHaveLength(3);
      expect(result.topMovers[0].keyword).toBe("keyword1");
      expect(result.topMovers[0].change).toBe(10);
    });

    it("should identify top decliners (biggest drops)", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: { keyword: "keyword1", position: 20, change: -10, trend: "down" },
          createdAt: now,
        },
        {
          id: 2,
          value: { keyword: "keyword2", position: 15, change: -3, trend: "down" },
          createdAt: now,
        },
      ];

      const result = await getSEOImpactAnalysis(mockShopDomain, 30);

      expect(result.topDecliners).toHaveLength(2);
      expect(result.topDecliners[0].keyword).toBe("keyword1");
      expect(result.topDecliners[0].change).toBe(-10);
    });

    it("should return zeros when no rankings found", async () => {
      mockDashboardFacts = [];

      const result = await getSEOImpactAnalysis(mockShopDomain, 30);

      expect(result.totalKeywords).toBe(0);
      expect(result.improved).toBe(0);
      expect(result.declined).toBe(0);
      expect(result.stable).toBe(0);
      expect(result.newKeywords).toBe(0);
      expect(result.avgPosition).toBe(0);
      expect(result.topMovers).toEqual([]);
      expect(result.topDecliners).toEqual([]);
    });

    it("should handle duplicate keywords (use latest)", async () => {
      const now = new Date();
      // Mock returns in DESC order (newest first) to match query
      mockDashboardFacts = [
        {
          id: 2,
          value: { keyword: "keyword1", position: 8, change: 7, trend: "up" },
          createdAt: now, // Newest first
        },
        {
          id: 1,
          value: { keyword: "keyword1", position: 10, change: 5, trend: "up" },
          createdAt: new Date(now.getTime() - 1000), // Older second
        },
      ];

      const result = await getSEOImpactAnalysis(mockShopDomain, 30);

      expect(result.totalKeywords).toBe(1);
      expect(result.avgPosition).toBe(8); // Should use latest position (first in desc order)
    });
  });

  describe("correlateSEOWithContent", () => {
    it("should identify positive correlation (improved with updates)", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: { keyword: "keyword1", position: 5, change: 5, trend: "up" },
          createdAt: now,
        },
      ];
      mockDecisionLogs = [
        {
          id: 1,
          scope: "content",
          action: "update",
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
      ];

      const result = await correlateSEOWithContent(mockShopDomain, 30);

      expect(result).toHaveLength(1);
      expect(result[0].keyword).toBe("keyword1");
      expect(result[0].rankingChange).toBe(5);
      expect(result[0].contentUpdates).toBeGreaterThan(0);
      expect(result[0].correlation).toBe("positive");
    });

    it("should identify negative correlation (declined despite updates)", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: { keyword: "keyword1", position: 15, change: -5, trend: "down" },
          createdAt: now,
        },
      ];
      mockDecisionLogs = [
        {
          id: 1,
          scope: "content",
          action: "update",
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
      ];

      const result = await correlateSEOWithContent(mockShopDomain, 30);

      expect(result[0].correlation).toBe("negative");
    });

    it("should identify neutral correlation (no updates)", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: { keyword: "keyword1", position: 5, change: 5, trend: "up" },
          createdAt: now,
        },
      ];
      mockDecisionLogs = [];

      const result = await correlateSEOWithContent(mockShopDomain, 30);

      expect(result[0].correlation).toBe("neutral");
    });

    it("should only count content updates within 7 days", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: { keyword: "keyword1", position: 5, change: 5, trend: "up" },
          createdAt: now,
        },
      ];
      mockDecisionLogs = [
        {
          id: 1,
          scope: "content",
          action: "update",
          createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago (too old)
        },
      ];

      const result = await correlateSEOWithContent(mockShopDomain, 30);

      expect(result[0].contentUpdates).toBe(0);
      expect(result[0].correlation).toBe("neutral");
    });
  });

  describe("getKeywordHistory", () => {
    it("should return historical ranking data for keyword", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          value: {
            keyword: mockKeyword,
            position: 10,
            change: 0,
            trend: "new",
          },
          createdAt: new Date("2025-10-01"),
        },
        {
          id: 2,
          value: {
            keyword: mockKeyword,
            position: 7,
            change: 3,
            trend: "up",
          },
          createdAt: new Date("2025-10-08"),
        },
        {
          id: 3,
          value: {
            keyword: mockKeyword,
            position: 5,
            change: 2,
            trend: "up",
          },
          createdAt: new Date("2025-10-15"),
        },
      ];

      const result = await getKeywordHistory(mockKeyword, mockShopDomain, 90);

      expect(result).toHaveLength(3);
      expect(result[0].position).toBe(10);
      expect(result[1].position).toBe(7);
      expect(result[2].position).toBe(5);
      expect(result[2].trend).toBe("up");
    });

    it("should return empty array when no history exists", async () => {
      mockDashboardFacts = [];

      const result = await getKeywordHistory(mockKeyword, mockShopDomain, 90);

      expect(result).toEqual([]);
    });

    it("should sort history by date ascending", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          value: { keyword: mockKeyword, position: 5, change: 2, trend: "up" },
          createdAt: new Date("2025-10-15"),
        },
        {
          id: 2,
          value: { keyword: mockKeyword, position: 10, change: 0, trend: "new" },
          createdAt: new Date("2025-10-01"),
        },
      ];

      const result = await getKeywordHistory(mockKeyword, mockShopDomain, 90);

      // Should be sorted by date ascending (already sorted by mock query)
      expect(result[0].position).toBe(5);
      expect(result[1].position).toBe(10);
    });
  });

  describe("Trend Determination", () => {
    it("should mark as 'new' when no previous ranking exists", async () => {
      mockFindFirstResult = null;

      const result = await trackKeywordRanking(
        mockKeyword,
        5,
        mockUrl,
        mockShopDomain
      );

      expect(result.trend).toBe("new");
    });

    it("should mark as 'up' when position improves (lower number)", async () => {
      mockFindFirstResult = {
        value: { position: 10 },
        createdAt: new Date(),
      };

      const result = await trackKeywordRanking(
        mockKeyword,
        5,
        mockUrl,
        mockShopDomain
      );

      expect(result.trend).toBe("up");
    });

    it("should mark as 'down' when position declines (higher number)", async () => {
      mockFindFirstResult = {
        value: { position: 3 },
        createdAt: new Date(),
      };

      const result = await trackKeywordRanking(
        mockKeyword,
        8,
        mockUrl,
        mockShopDomain
      );

      expect(result.trend).toBe("down");
    });

    it("should mark as 'stable' when position unchanged", async () => {
      mockFindFirstResult = {
        value: { position: 7 },
        createdAt: new Date(),
      };

      const result = await trackKeywordRanking(
        mockKeyword,
        7,
        mockUrl,
        mockShopDomain
      );

      expect(result.trend).toBe("stable");
    });
  });
});

