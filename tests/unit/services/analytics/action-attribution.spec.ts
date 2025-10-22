/**
 * Unit Tests: Action Attribution Service
 *
 * Tests GA4 Data API integration, action ROI updates, and queue re-ranking.
 *
 * Coverage:
 * - GA4 query with custom dimension (hd_action_key)
 * - Update action ROI (3 windows: 7d, 14d, 28d)
 * - Re-rank Action Queue by realized ROI
 * - Nightly attribution update job
 * - Rate limiting enforcement
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getActionAttribution,
  updateActionROI,
  rerankActionQueue,
  runNightlyAttributionUpdate,
} from "~/services/analytics/action-attribution";
import prisma from "~/db.server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

// ============================================================================
// Mocks
// ============================================================================

// Mock Prisma client
vi.mock("~/db.server", () => ({
  default: {
    actionQueue: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    actionAttribution: {
      create: vi.fn(),
    },
  },
}));

// Mock GA4 Data API client
vi.mock("@google-analytics/data", () => ({
  BetaAnalyticsDataClient: vi.fn().mockImplementation(() => ({
    runReport: vi.fn(),
  })),
}));

// Mock decisions logger
vi.mock("~/services/decisions.server", () => ({
  logDecision: vi.fn(),
}));

// ============================================================================
// Test Data
// ============================================================================

const mockGA4Response = {
  rows: [
    {
      dimensionValues: [{ value: "campaign_seo_123" }],
      metricValues: [
        { value: "1500" }, // sessions
        { value: "4200" }, // pageviews
        { value: "180" }, // addToCarts
        { value: "75" }, // purchases
        { value: "8250.50" }, // revenue
      ],
    },
  ],
};

const mockGA4EmptyResponse = {
  rows: [],
};

const mockActionRecord = {
  id: "action-123",
  actionKey: "campaign_seo_123",
  status: "approved",
  expectedRevenue: 10000,
  realizedRevenue7d: null,
  realizedRevenue14d: null,
  realizedRevenue28d: null,
  conversionRate: null,
  lastAttributionCheck: null,
  approvedAt: new Date("2025-10-15"),
  attributions: [],
};

const mockActions = [
  {
    id: "action-1",
    actionKey: "action_key_1",
    status: "approved",
    approvedAt: new Date("2025-10-15"),
  },
  {
    id: "action-2",
    actionKey: "action_key_2",
    status: "approved",
    approvedAt: new Date("2025-10-16"),
  },
];

// ============================================================================
// Tests: getActionAttribution
// ============================================================================

describe("getActionAttribution", () => {
  let mockRunReport: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Get the mock runReport function
    const mockClient = new BetaAnalyticsDataClient();
    mockRunReport = mockClient.runReport;
  });

  it("should query GA4 with correct parameters", async () => {
    mockRunReport.mockResolvedValue([mockGA4Response]);

    await getActionAttribution("campaign_seo_123", 28);

    expect(mockRunReport).toHaveBeenCalledWith(
      expect.objectContaining({
        property: "properties/339826228",
        dimensions: [{ name: "customEvent:hd_action_key" }],
        metrics: [
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "addToCarts" },
          { name: "ecommercePurchases" },
          { name: "totalRevenue" },
        ],
        dimensionFilter: {
          filter: {
            fieldName: "customEvent:hd_action_key",
            stringFilter: {
              value: "campaign_seo_123",
              matchType: "EXACT",
            },
          },
        },
      }),
    );
  });

  it("should return attribution metrics for 7-day window", async () => {
    mockRunReport.mockResolvedValue([mockGA4Response]);

    const result = await getActionAttribution("campaign_seo_123", 7);

    expect(result).toEqual({
      actionKey: "campaign_seo_123",
      periodDays: 7,
      sessions: 1500,
      pageviews: 4200,
      addToCarts: 180,
      purchases: 75,
      revenue: 8250.5,
      conversionRate: 5.0, // 75/1500 * 100
      averageOrderValue: 110.01, // 8250.50/75
      realizedROI: 8250.5,
    });
  });

  it("should return attribution metrics for 14-day window", async () => {
    mockRunReport.mockResolvedValue([mockGA4Response]);

    const result = await getActionAttribution("campaign_seo_123", 14);

    expect(result.periodDays).toBe(14);
    expect(result.revenue).toBe(8250.5);
  });

  it("should return attribution metrics for 28-day window", async () => {
    mockRunReport.mockResolvedValue([mockGA4Response]);

    const result = await getActionAttribution("campaign_seo_123", 28);

    expect(result.periodDays).toBe(28);
    expect(result.revenue).toBe(8250.5);
  });

  it("should return zero metrics when GA4 returns no data", async () => {
    mockRunReport.mockResolvedValue([mockGA4EmptyResponse]);

    const result = await getActionAttribution("campaign_missing_123", 28);

    expect(result).toEqual({
      actionKey: "campaign_missing_123",
      periodDays: 28,
      sessions: 0,
      pageviews: 0,
      addToCarts: 0,
      purchases: 0,
      revenue: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      realizedROI: 0,
    });
  });

  it("should calculate conversion rate correctly", async () => {
    const customResponse = {
      rows: [
        {
          dimensionValues: [{ value: "test_key" }],
          metricValues: [
            { value: "1000" }, // sessions
            { value: "3000" }, // pageviews
            { value: "100" }, // addToCarts
            { value: "50" }, // purchases (50/1000 = 5%)
            { value: "5000" }, // revenue
          ],
        },
      ],
    };
    mockRunReport.mockResolvedValue([customResponse]);

    const result = await getActionAttribution("test_key", 28);

    expect(result.conversionRate).toBe(5.0);
  });

  it("should handle zero sessions gracefully", async () => {
    const customResponse = {
      rows: [
        {
          dimensionValues: [{ value: "test_key" }],
          metricValues: [
            { value: "0" },
            { value: "0" },
            { value: "0" },
            { value: "0" },
            { value: "0" },
          ],
        },
      ],
    };
    mockRunReport.mockResolvedValue([customResponse]);

    const result = await getActionAttribution("test_key", 28);

    expect(result.conversionRate).toBe(0);
    expect(result.averageOrderValue).toBe(0);
  });

  it("should throw error on GA4 API failure", async () => {
    mockRunReport.mockRejectedValue(new Error("GA4 API quota exceeded"));

    await expect(getActionAttribution("campaign_seo_123", 28)).rejects.toThrow(
      "Failed to fetch GA4 attribution data",
    );
  });
});

// ============================================================================
// Tests: updateActionROI
// ============================================================================

describe("updateActionROI", () => {
  let mockRunReport: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockClient = new BetaAnalyticsDataClient();
    mockRunReport = mockClient.runReport;
  });

  it("should query all 3 windows in parallel", async () => {
    mockRunReport.mockResolvedValue([mockGA4Response]);

    await updateActionROI("action-123", "campaign_seo_123");

    // Should be called 3 times (7d, 14d, 28d)
    expect(mockRunReport).toHaveBeenCalledTimes(3);
  });

  it("should update action_queue record with realized ROI", async () => {
    mockRunReport.mockResolvedValue([mockGA4Response]);

    await updateActionROI("action-123", "campaign_seo_123");

    expect(prisma.actionQueue.update).toHaveBeenCalledWith({
      where: { id: "action-123" },
      data: expect.objectContaining({
        realizedRevenue7d: 8250.5,
        realizedRevenue14d: 8250.5,
        realizedRevenue28d: 8250.5,
        conversionRate: 5.0,
        lastAttributionCheck: expect.any(Date),
      }),
    });
  });

  it("should create action_attribution record", async () => {
    mockRunReport.mockResolvedValue([mockGA4Response]);

    await updateActionROI("action-123", "campaign_seo_123");

    expect(prisma.actionAttribution.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actionId: "action-123",
        actionKey: "campaign_seo_123",
        periodDays: 28,
        sessions: 1500,
        pageviews: 4200,
        addToCarts: 180,
        purchases: 75,
        revenue: 8250.5,
        conversionRate: 5.0,
        recordedAt: expect.any(Date),
      }),
    });
  });

  it("should return attribution summary for all windows", async () => {
    mockRunReport.mockResolvedValue([mockGA4Response]);

    const result = await updateActionROI("action-123", "campaign_seo_123");

    expect(result).toHaveProperty("roi7d");
    expect(result).toHaveProperty("roi14d");
    expect(result).toHaveProperty("roi28d");
    expect(result.roi7d.periodDays).toBe(7);
    expect(result.roi14d.periodDays).toBe(14);
    expect(result.roi28d.periodDays).toBe(28);
  });
});

// ============================================================================
// Tests: rerankActionQueue
// ============================================================================

describe("rerankActionQueue", () => {
  let mockRunReport: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockClient = new BetaAnalyticsDataClient();
    mockRunReport = mockClient.runReport;

    // Mock timer for rate limiting tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should fetch approved actions from last 30 days", async () => {
    (prisma.actionQueue.findMany as any).mockResolvedValueOnce(mockActions);
    (prisma.actionQueue.findMany as any).mockResolvedValueOnce([]);
    mockRunReport.mockResolvedValue([mockGA4Response]);

    await rerankActionQueue();

    expect(prisma.actionQueue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "approved",
          approvedAt: expect.objectContaining({
            gte: expect.any(Date),
          }),
          actionKey: { not: null },
        }),
      }),
    );
  });

  it("should update attribution for each action", async () => {
    (prisma.actionQueue.findMany as any).mockResolvedValueOnce([
      mockActions[0],
    ]);
    (prisma.actionQueue.findMany as any).mockResolvedValueOnce([]);
    mockRunReport.mockResolvedValue([mockGA4Response]);

    await rerankActionQueue();

    expect(prisma.actionQueue.update).toHaveBeenCalled();
    expect(prisma.actionAttribution.create).toHaveBeenCalled();
  });

  it("should enforce rate limiting (3 seconds per action)", async () => {
    (prisma.actionQueue.findMany as any).mockResolvedValueOnce(mockActions);
    (prisma.actionQueue.findMany as any).mockResolvedValueOnce([]);
    mockRunReport.mockResolvedValue([mockGA4Response]);

    const promise = rerankActionQueue();

    // Fast-forward through rate limits
    await vi.advanceTimersByTimeAsync(3000); // First action
    await vi.advanceTimersByTimeAsync(3000); // Second action

    await promise;

    // Verify rate limiting was applied
    expect(setTimeout).toHaveBeenCalledTimes(2);
  });

  it("should return top 10 actions ranked by realized ROI", async () => {
    const rankedActions = [
      { id: "1", actionKey: "top_action", realizedRevenue28d: 10000 },
      { id: "2", actionKey: "second_action", realizedRevenue28d: 8000 },
    ];

    (prisma.actionQueue.findMany as any)
      .mockResolvedValueOnce([]) // No actions to update
      .mockResolvedValueOnce(rankedActions); // Ranked results

    const result = await rerankActionQueue();

    expect(result).toEqual(rankedActions);
    expect(prisma.actionQueue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "pending" },
        orderBy: [{ realizedRevenue28d: "desc" }, { expectedRevenue: "desc" }],
        take: 10,
      }),
    );
  });

  it("should continue on error for individual actions", async () => {
    (prisma.actionQueue.findMany as any).mockResolvedValueOnce([
      mockActions[0],
      mockActions[1],
    ]);
    (prisma.actionQueue.findMany as any).mockResolvedValueOnce([]);

    // First action succeeds, second fails
    mockRunReport
      .mockResolvedValueOnce([mockGA4Response])
      .mockResolvedValueOnce([mockGA4Response])
      .mockResolvedValueOnce([mockGA4Response])
      .mockRejectedValueOnce(new Error("API error"))
      .mockRejectedValueOnce(new Error("API error"))
      .mockRejectedValueOnce(new Error("API error"));

    await rerankActionQueue();

    // Should have attempted both actions
    expect(mockRunReport).toHaveBeenCalled();
    // Should have updated only the successful action
    expect(prisma.actionQueue.update).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Tests: runNightlyAttributionUpdate
// ============================================================================

describe("runNightlyAttributionUpdate", () => {
  let mockRunReport: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockClient = new BetaAnalyticsDataClient();
    mockRunReport = mockClient.runReport;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should call rerankActionQueue", async () => {
    (prisma.actionQueue.findMany as any).mockResolvedValue([]);
    mockRunReport.mockResolvedValue([mockGA4Response]);

    await runNightlyAttributionUpdate();

    expect(prisma.actionQueue.findMany).toHaveBeenCalled();
  });

  it("should log decision on success", async () => {
    const rankedActions = [
      { id: "1", actionKey: "top_action", realizedRevenue28d: 10000 },
    ];

    (prisma.actionQueue.findMany as any)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(rankedActions);

    const { logDecision } = await import("~/services/decisions.server");

    await runNightlyAttributionUpdate();

    expect(logDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: "ops",
        actor: "system",
        action: "action_attribution_update",
        rationale: expect.stringContaining("Nightly ROI sync"),
      }),
    );
  });

  it("should log decision on failure", async () => {
    (prisma.actionQueue.findMany as any).mockRejectedValue(
      new Error("Database error"),
    );

    const { logDecision } = await import("~/services/decisions.server");

    await expect(runNightlyAttributionUpdate()).rejects.toThrow();

    expect(logDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: "ops",
        actor: "system",
        action: "action_attribution_update_failed",
      }),
    );
  });

  it("should return success result", async () => {
    const rankedActions = [
      { id: "1", actionKey: "top_action", realizedRevenue28d: 10000 },
    ];

    (prisma.actionQueue.findMany as any)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(rankedActions);

    const result = await runNightlyAttributionUpdate();

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("actionsUpdated");
    expect(result).toHaveProperty("durationMs");
  });
});
