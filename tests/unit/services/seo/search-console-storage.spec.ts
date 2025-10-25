/**
 * Unit Tests: Search Console Storage Service
 *
 * Tests Prisma upsert/batch operations for storing Search Console data
 * to Supabase for historical tracking.
 *
 * Coverage:
 * - Store site-wide metrics (upsert)
 * - Store top queries (batch replace)
 * - Store landing pages (batch replace)
 * - Complete summary storage
 * - Historical query functions
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  storeSearchConsoleMetrics,
  storeTopQueries,
  storeLandingPages,
  storeSearchConsoleSummary,
  getHistoricalMetrics,
  getQueryTrend,
  getLandingPageTrend,
  getTopQueriesByDate,
  getTopLandingPagesByDate,
} from "~/services/seo/search-console-storage";
import prisma from "~/db.server";

// ============================================================================
// Mocks
// ============================================================================

// Mock Prisma client
vi.mock("~/db.server", () => ({
  default: {
    seoSearchConsoleMetrics: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
    seoSearchQuery: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    seoLandingPage: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

// Mock Search Console API
vi.mock("~/lib/seo/search-console", () => ({
  getSearchAnalytics: vi.fn(),
  getTopQueries: vi.fn(),
  getLandingPages: vi.fn(),
}));

// ============================================================================
// Test Data
// ============================================================================

const mockMetrics = {
  clicks: 1200,
  impressions: 25000,
  ctr: 4.8,
  position: 12.5,
  change7d: {
    clicksChange: 5.2,
    impressionsChange: 3.1,
    ctrChange: 0.3,
    positionChange: -0.5,
  },
  period: {
    start: "2025-09-21",
    end: "2025-10-21",
  },
};

const mockQueries = [
  {
    query: "shopify analytics dashboard",
    clicks: 150,
    impressions: 3000,
    ctr: 5.0,
    position: 8.2,
  },
  {
    query: "ecommerce metrics tracking",
    clicks: 120,
    impressions: 2400,
    ctr: 5.0,
    position: 9.5,
  },
  {
    query: "sales dashboard builder",
    clicks: 95,
    impressions: 1900,
    ctr: 5.0,
    position: 11.3,
  },
];

const mockPages = [
  {
    url: "https://example.com/dashboard",
    clicks: 450,
    impressions: 8000,
    ctr: 5.625,
    position: 6.8,
    change7dPct: 12.5,
  },
  {
    url: "https://example.com/features/analytics",
    clicks: 380,
    impressions: 6500,
    ctr: 5.846,
    position: 7.2,
    change7dPct: 8.3,
  },
];

// ============================================================================
// Tests: storeSearchConsoleMetrics
// ============================================================================

describe("storeSearchConsoleMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should upsert metrics with correct data", async () => {
    await storeSearchConsoleMetrics(mockMetrics, 30);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    expect(prisma.seoSearchConsoleMetrics.upsert).toHaveBeenCalledWith({
      where: {
        date_periodDays: {
          date: today,
          periodDays: 30,
        },
      },
      create: expect.objectContaining({
        date: today,
        periodDays: 30,
        clicks: 1200,
        impressions: 25000,
        ctr: 4.8,
        position: 12.5,
        clicksChange7d: 5.2,
        impressionsChange7d: 3.1,
        ctrChange7d: 0.3,
        positionChange7d: -0.5,
        fetchedAt: expect.any(Date),
      }),
      update: expect.objectContaining({
        clicks: 1200,
        impressions: 25000,
        ctr: 4.8,
        position: 12.5,
        clicksChange7d: 5.2,
        impressionsChange7d: 3.1,
        ctrChange7d: 0.3,
        positionChange7d: -0.5,
        fetchedAt: expect.any(Date),
      }),
    });
  });

  it("should normalize date to midnight", async () => {
    await storeSearchConsoleMetrics(mockMetrics, 30);

    const call = (prisma.seoSearchConsoleMetrics.upsert as any).mock
      .calls[0][0];
    const storedDate = call.where.date_periodDays.date;

    expect(storedDate.getHours()).toBe(0);
    expect(storedDate.getMinutes()).toBe(0);
    expect(storedDate.getSeconds()).toBe(0);
    expect(storedDate.getMilliseconds()).toBe(0);
  });

  it("should use custom period days", async () => {
    await storeSearchConsoleMetrics(mockMetrics, 7);

    const call = (prisma.seoSearchConsoleMetrics.upsert as any).mock
      .calls[0][0];

    expect(call.where.date_periodDays.periodDays).toBe(7);
    expect(call.create.periodDays).toBe(7);
  });
});

// ============================================================================
// Tests: storeTopQueries
// ============================================================================

describe("storeTopQueries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete existing queries for today", async () => {
    await storeTopQueries(mockQueries, 30);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    expect(prisma.seoSearchQuery.deleteMany).toHaveBeenCalledWith({
      where: { date: today, periodDays: 30 },
    });
  });

  it("should insert queries with ranking", async () => {
    await storeTopQueries(mockQueries, 30);

    expect(prisma.seoSearchQuery.create).toHaveBeenCalledTimes(3);

    // Check first query (rank 1)
    const firstCall = (prisma.seoSearchQuery.create as any).mock.calls[0][0];
    expect(firstCall.data.query).toBe("shopify analytics dashboard");
    expect(firstCall.data.rank).toBe(1);
    expect(firstCall.data.clicks).toBe(150);

    // Check second query (rank 2)
    const secondCall = (prisma.seoSearchQuery.create as any).mock.calls[1][0];
    expect(secondCall.data.rank).toBe(2);

    // Check third query (rank 3)
    const thirdCall = (prisma.seoSearchQuery.create as any).mock.calls[2][0];
    expect(thirdCall.data.rank).toBe(3);
  });

  it("should store all query metrics", async () => {
    await storeTopQueries([mockQueries[0]], 30);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const call = (prisma.seoSearchQuery.create as any).mock.calls[0][0];

    expect(call.data).toMatchObject({
      date: today,
      periodDays: 30,
      query: "shopify analytics dashboard",
      clicks: 150,
      impressions: 3000,
      ctr: 5.0,
      position: 8.2,
      rank: 1,
    });
  });

  it("should handle empty query list", async () => {
    await storeTopQueries([], 30);

    expect(prisma.seoSearchQuery.deleteMany).toHaveBeenCalled();
    expect(prisma.seoSearchQuery.create).not.toHaveBeenCalled();
  });
});

// ============================================================================
// Tests: storeLandingPages
// ============================================================================

describe("storeLandingPages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete existing pages for today", async () => {
    await storeLandingPages(mockPages, 30);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    expect(prisma.seoLandingPage.deleteMany).toHaveBeenCalledWith({
      where: { date: today, periodDays: 30 },
    });
  });

  it("should insert pages with ranking", async () => {
    await storeLandingPages(mockPages, 30);

    expect(prisma.seoLandingPage.create).toHaveBeenCalledTimes(2);

    // Check first page (rank 1)
    const firstCall = (prisma.seoLandingPage.create as any).mock.calls[0][0];
    expect(firstCall.data.url).toBe("https://example.com/dashboard");
    expect(firstCall.data.rank).toBe(1);
    expect(firstCall.data.clicks).toBe(450);

    // Check second page (rank 2)
    const secondCall = (prisma.seoLandingPage.create as any).mock.calls[1][0];
    expect(secondCall.data.rank).toBe(2);
  });

  it("should store all page metrics", async () => {
    await storeLandingPages([mockPages[0]], 30);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const call = (prisma.seoLandingPage.create as any).mock.calls[0][0];

    expect(call.data).toMatchObject({
      date: today,
      periodDays: 30,
      url: "https://example.com/dashboard",
      clicks: 450,
      impressions: 8000,
      ctr: 5.625,
      position: 6.8,
      clicksChange7d: 12.5,
      rank: 1,
    });
  });

  it("should handle empty page list", async () => {
    await storeLandingPages([], 30);

    expect(prisma.seoLandingPage.deleteMany).toHaveBeenCalled();
    expect(prisma.seoLandingPage.create).not.toHaveBeenCalled();
  });
});

// ============================================================================
// Tests: storeSearchConsoleSummary
// ============================================================================

describe("storeSearchConsoleSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const {
      getSearchAnalytics,
      getTopQueries,
      getLandingPages,
    } = require("~/lib/seo/search-console");

    getSearchAnalytics.mockResolvedValue(mockMetrics);
    getTopQueries.mockResolvedValue(mockQueries);
    getLandingPages.mockResolvedValue(mockPages);
  });

  it("should fetch data from Search Console API", async () => {
    const {
      getSearchAnalytics,
      getTopQueries,
      getLandingPages,
    } = require("~/lib/seo/search-console");

    await storeSearchConsoleSummary();

    expect(getSearchAnalytics).toHaveBeenCalled();
    expect(getTopQueries).toHaveBeenCalledWith(25);
    expect(getLandingPages).toHaveBeenCalledWith(25);
  });

  it("should store all data types", async () => {
    await storeSearchConsoleSummary();

    expect(prisma.seoSearchConsoleMetrics.upsert).toHaveBeenCalled();
    expect(prisma.seoSearchQuery.deleteMany).toHaveBeenCalled();
    expect(prisma.seoSearchQuery.create).toHaveBeenCalledTimes(3);
    expect(prisma.seoLandingPage.deleteMany).toHaveBeenCalled();
    expect(prisma.seoLandingPage.create).toHaveBeenCalledTimes(2);
  });

  it("should return success summary", async () => {
    const result = await storeSearchConsoleSummary();

    expect(result.success).toBe(true);
    expect(result.metrics).toEqual(mockMetrics);
    expect(result.queriesCount).toBe(3);
    expect(result.pagesCount).toBe(2);
  });

  it("should throw error on API failure", async () => {
    const { getSearchAnalytics } = require("~/lib/seo/search-console");
    getSearchAnalytics.mockRejectedValue(new Error("API quota exceeded"));

    await expect(storeSearchConsoleSummary()).rejects.toThrow(
      "API quota exceeded",
    );
  });
});

// ============================================================================
// Tests: getHistoricalMetrics
// ============================================================================

describe("getHistoricalMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch metrics for specified days", async () => {
    const mockRecords = [
      { date: new Date("2025-10-21"), clicks: 1200 },
      { date: new Date("2025-10-20"), clicks: 1150 },
    ];

    (prisma.seoSearchConsoleMetrics.findMany as any).mockResolvedValue(
      mockRecords,
    );

    const result = await getHistoricalMetrics(30);

    expect(prisma.seoSearchConsoleMetrics.findMany).toHaveBeenCalledWith({
      where: { periodDays: 30 },
      orderBy: { date: "desc" },
      take: 30,
    });

    expect(result).toEqual(mockRecords);
  });

  it("should default to 30 days", async () => {
    (prisma.seoSearchConsoleMetrics.findMany as any).mockResolvedValue([]);

    await getHistoricalMetrics();

    const call = (prisma.seoSearchConsoleMetrics.findMany as any).mock
      .calls[0][0];
    expect(call.take).toBe(30);
  });
});

// ============================================================================
// Tests: getQueryTrend
// ============================================================================

describe("getQueryTrend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch trend for specific query", async () => {
    const mockRecords = [
      { date: new Date("2025-10-21"), query: "test query", clicks: 150 },
      { date: new Date("2025-10-20"), query: "test query", clicks: 145 },
    ];

    (prisma.seoSearchQuery.findMany as any).mockResolvedValue(mockRecords);

    const result = await getQueryTrend("test query", 14);

    expect(prisma.seoSearchQuery.findMany).toHaveBeenCalledWith({
      where: { query: "test query", periodDays: 30 },
      orderBy: { date: "desc" },
      take: 14,
    });

    expect(result).toEqual(mockRecords);
  });
});

// ============================================================================
// Tests: getLandingPageTrend
// ============================================================================

describe("getLandingPageTrend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch trend for specific URL", async () => {
    const mockRecords = [
      { date: new Date("2025-10-21"), url: "https://example.com", clicks: 450 },
      { date: new Date("2025-10-20"), url: "https://example.com", clicks: 440 },
    ];

    (prisma.seoLandingPage.findMany as any).mockResolvedValue(mockRecords);

    const result = await getLandingPageTrend("https://example.com", 14);

    expect(prisma.seoLandingPage.findMany).toHaveBeenCalledWith({
      where: { url: "https://example.com", periodDays: 30 },
      orderBy: { date: "desc" },
      take: 14,
    });

    expect(result).toEqual(mockRecords);
  });
});

// ============================================================================
// Tests: getTopQueriesByDate
// ============================================================================

describe("getTopQueriesByDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch top queries for specific date", async () => {
    const targetDate = new Date("2025-10-21");
    const mockRecords = [
      { date: targetDate, query: "query 1", rank: 1, clicks: 150 },
      { date: targetDate, query: "query 2", rank: 2, clicks: 120 },
    ];

    (prisma.seoSearchQuery.findMany as any).mockResolvedValue(mockRecords);

    const result = await getTopQueriesByDate(targetDate, 10);

    const expectedDate = new Date(targetDate);
    expectedDate.setHours(0, 0, 0, 0);

    expect(prisma.seoSearchQuery.findMany).toHaveBeenCalledWith({
      where: { date: expectedDate, periodDays: 30 },
      orderBy: { rank: "asc" },
      take: 10,
    });

    expect(result).toEqual(mockRecords);
  });

  it("should default to today", async () => {
    (prisma.seoSearchQuery.findMany as any).mockResolvedValue([]);

    await getTopQueriesByDate();

    const call = (prisma.seoSearchQuery.findMany as any).mock.calls[0][0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    expect(call.where.date.getDate()).toBe(today.getDate());
  });
});

// ============================================================================
// Tests: getTopLandingPagesByDate
// ============================================================================

describe("getTopLandingPagesByDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch top pages for specific date", async () => {
    const targetDate = new Date("2025-10-21");
    const mockRecords = [
      { date: targetDate, url: "https://example.com/1", rank: 1, clicks: 450 },
      { date: targetDate, url: "https://example.com/2", rank: 2, clicks: 380 },
    ];

    (prisma.seoLandingPage.findMany as any).mockResolvedValue(mockRecords);

    const result = await getTopLandingPagesByDate(targetDate, 10);

    const expectedDate = new Date(targetDate);
    expectedDate.setHours(0, 0, 0, 0);

    expect(prisma.seoLandingPage.findMany).toHaveBeenCalledWith({
      where: { date: expectedDate, periodDays: 30 },
      orderBy: { rank: "asc" },
      take: 10,
    });

    expect(result).toEqual(mockRecords);
  });

  it("should default to today", async () => {
    (prisma.seoLandingPage.findMany as any).mockResolvedValue([]);

    await getTopLandingPagesByDate();

    const call = (prisma.seoLandingPage.findMany as any).mock.calls[0][0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    expect(call.where.date.getDate()).toBe(today.getDate());
  });
});
