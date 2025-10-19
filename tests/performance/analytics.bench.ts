/**
 * Analytics Performance Benchmarks
 *
 * Baseline performance metrics for analytics endpoints to detect regressions.
 * Target: P95 response time < 3 seconds (per North Star requirements)
 *
 * Run with: npm run bench (or vitest bench)
 */

import { describe, bench, expect } from "vitest";
import {
  RevenueResponseSchema,
  ConversionResponseSchema,
  TrafficResponseSchema,
  IdeaPoolResponseSchema,
} from "../../app/lib/analytics/schemas";

// ============================================================================
// Mock Data for Performance Testing
// ============================================================================

const mockRevenueResponse = {
  revenue: 12500,
  period: "2024-09-19 to 2024-10-19",
  change: 5.9,
  currency: "USD",
  previousPeriod: {
    revenue: 11800,
    period: "previous 30 days",
  },
};

const mockConversionResponse = {
  conversionRate: 2.8,
  period: "2024-09-19 to 2024-10-19",
  change: 7.7,
  previousPeriod: {
    conversionRate: 2.6,
    period: "previous 30 days",
  },
};

const mockTrafficResponse = {
  sessions: 5214,
  users: 3911,
  pageviews: 13035,
  period: "2024-09-19 to 2024-10-19",
  bounceRate: 45.2,
  avgSessionDuration: 145,
  previousPeriod: {
    sessions: 5500,
    users: 4125,
    pageviews: 13750,
    period: "previous 30 days",
  },
};

const mockIdeaPoolResponse = {
  success: true,
  data: {
    items: Array.from({ length: 20 }, (_, i) => ({
      id: `idea-${i}`,
      title: `Product Idea ${i}`,
      status:
        i % 4 === 0
          ? "pending_review"
          : i % 4 === 1
            ? "approved"
            : i % 4 === 2
              ? "rejected"
              : "draft",
      rationale: `Rationale for idea ${i}`,
      projectedImpact: `+$${(i + 1) * 1000}/month`,
      priority: i % 3 === 0 ? "high" : i % 3 === 1 ? "medium" : "low",
      confidence: (i + 1) / 20,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
      reviewer: i % 2 === 0 ? "manager" : undefined,
    })),
    totals: {
      pending: 5,
      approved: 5,
      rejected: 5,
    },
  },
  source: "mock",
  timestamp: new Date().toISOString(),
};

// ============================================================================
// Schema Validation Benchmarks
// ============================================================================

describe("Schema Validation Performance", () => {
  bench("RevenueResponseSchema.parse", () => {
    const result = RevenueResponseSchema.parse(mockRevenueResponse);
    expect(result).toBeDefined();
  });

  bench("RevenueResponseSchema.safeParse", () => {
    const result = RevenueResponseSchema.safeParse(mockRevenueResponse);
    expect(result.success).toBe(true);
  });

  bench("ConversionResponseSchema.parse", () => {
    const result = ConversionResponseSchema.parse(mockConversionResponse);
    expect(result).toBeDefined();
  });

  bench("ConversionResponseSchema.safeParse", () => {
    const result = ConversionResponseSchema.safeParse(mockConversionResponse);
    expect(result.success).toBe(true);
  });

  bench("TrafficResponseSchema.parse", () => {
    const result = TrafficResponseSchema.parse(mockTrafficResponse);
    expect(result).toBeDefined();
  });

  bench("TrafficResponseSchema.safeParse", () => {
    const result = TrafficResponseSchema.safeParse(mockTrafficResponse);
    expect(result.success).toBe(true);
  });

  bench("IdeaPoolResponseSchema.parse (20 items)", () => {
    const result = IdeaPoolResponseSchema.parse(mockIdeaPoolResponse);
    expect(result).toBeDefined();
  });

  bench("IdeaPoolResponseSchema.safeParse (20 items)", () => {
    const result = IdeaPoolResponseSchema.safeParse(mockIdeaPoolResponse);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// Data Processing Benchmarks
// ============================================================================

describe("Data Processing Performance", () => {
  bench("Calculate percentage change (simple)", () => {
    function percentageChange(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    }

    const result = percentageChange(12500, 11800);
    expect(result).toBeGreaterThan(0);
  });

  bench("Filter idea pool items by status", () => {
    const items = mockIdeaPoolResponse.data.items;
    const pending = items.filter((item) => item.status === "pending_review");
    expect(pending.length).toBeGreaterThan(0);
  });

  bench("Calculate idea pool totals", () => {
    const items = mockIdeaPoolResponse.data.items;
    const totals = items.reduce(
      (acc, item) => {
        if (item.status === "pending_review") acc.pending += 1;
        if (item.status === "approved") acc.approved += 1;
        if (item.status === "rejected") acc.rejected += 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 },
    );
    expect(totals.pending).toBeGreaterThan(0);
  });

  bench("Sort idea pool items by date", () => {
    const items = [...mockIdeaPoolResponse.data.items];
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    expect(items.length).toBe(20);
  });

  bench("Map and filter idea pool items", () => {
    const items = mockIdeaPoolResponse.data.items;
    const highPriority = items
      .filter((item) => item.priority === "high")
      .map((item) => ({
        id: item.id,
        title: item.title,
        impact: item.projectedImpact,
      }));
    expect(highPriority).toBeDefined();
  });
});

// ============================================================================
// JSON Operations Benchmarks
// ============================================================================

describe("JSON Operations Performance", () => {
  bench("JSON.stringify (revenue response)", () => {
    const result = JSON.stringify(mockRevenueResponse);
    expect(result).toBeDefined();
  });

  bench("JSON.stringify (traffic response)", () => {
    const result = JSON.stringify(mockTrafficResponse);
    expect(result).toBeDefined();
  });

  bench("JSON.stringify (idea pool response with 20 items)", () => {
    const result = JSON.stringify(mockIdeaPoolResponse);
    expect(result).toBeDefined();
  });

  bench("JSON.parse (revenue response)", () => {
    const jsonString = JSON.stringify(mockRevenueResponse);
    const result = JSON.parse(jsonString);
    expect(result).toBeDefined();
  });

  bench("JSON.parse (idea pool response with 20 items)", () => {
    const jsonString = JSON.stringify(mockIdeaPoolResponse);
    const result = JSON.parse(jsonString);
    expect(result).toBeDefined();
  });
});

// ============================================================================
// Cache Key Generation Benchmarks
// ============================================================================

describe("Cache Key Generation Performance", () => {
  bench("Generate simple cache key", () => {
    const key = `analytics:revenue:30d`;
    expect(key).toBeDefined();
  });

  bench("Generate cache key with date", () => {
    const date = new Date().toISOString().split("T")[0];
    const key = `analytics:revenue:${date}`;
    expect(key).toBeDefined();
  });

  bench("Generate cache key with hash", () => {
    const params = { metric: "revenue", period: "30d", currency: "USD" };
    const key = `analytics:${JSON.stringify(params)}`;
    expect(key).toBeDefined();
  });
});

// ============================================================================
// Response Formatting Benchmarks
// ============================================================================

describe("Response Formatting Performance", () => {
  bench("Format revenue response", () => {
    const metrics = {
      totalRevenue: 12500,
      averageOrderValue: 85.5,
      transactions: 146,
      trend: { revenueChange: 5.9, aovChange: 3.9, transactionsChange: 2.1 },
      period: { start: "2024-09-19", end: "2024-10-19" },
    };

    const response = {
      revenue: metrics.totalRevenue,
      period: `${metrics.period.start} to ${metrics.period.end}`,
      change: metrics.trend.revenueChange,
      currency: "USD",
      previousPeriod: {
        revenue: metrics.totalRevenue / (1 + metrics.trend.revenueChange / 100),
        period: "previous 30 days",
      },
    };

    expect(response).toBeDefined();
  });

  bench("Format traffic response with calculations", () => {
    const metrics = {
      totalSessions: 5214,
      organicSessions: 3240,
      trend: { sessionsChange: -5.2, organicChange: -5.0 },
      period: { start: "2024-09-19", end: "2024-10-19" },
    };

    const response = {
      sessions: metrics.totalSessions,
      users: Math.round(metrics.totalSessions * 0.75),
      pageviews: Math.round(metrics.totalSessions * 2.5),
      period: `${metrics.period.start} to ${metrics.period.end}`,
      bounceRate: 45.2,
      avgSessionDuration: 145,
      previousPeriod: {
        sessions: Math.round(
          metrics.totalSessions / (1 + metrics.trend.sessionsChange / 100),
        ),
        users: Math.round(
          (metrics.totalSessions * 0.75) /
            (1 + metrics.trend.sessionsChange / 100),
        ),
        pageviews: Math.round(
          (metrics.totalSessions * 2.5) /
            (1 + metrics.trend.sessionsChange / 100),
        ),
        period: "previous 30 days",
      },
    };

    expect(response).toBeDefined();
  });
});

// ============================================================================
// Performance Targets (North Star Requirements)
// ============================================================================

/**
 * PERFORMANCE TARGETS
 *
 * Based on North Star success metrics:
 * - P95 tile load < 3 seconds
 *
 * Baseline benchmarks should complete in:
 * - Schema validation: < 1ms per operation
 * - Data processing: < 5ms per operation
 * - JSON operations: < 10ms per operation
 * - Cache operations: < 1ms per operation
 * - Response formatting: < 5ms per operation
 *
 * Run benchmarks regularly to detect regressions:
 *   npm run bench
 *
 * Compare results over time:
 *   npm run bench > benchmarks/baseline-YYYY-MM-DD.txt
 */
