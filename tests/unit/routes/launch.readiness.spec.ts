import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const mockGetDashboardMetrics = vi.fn();
const mockGetHealthSummary = vi.fn();
const mockGenerateHealthReport = vi.fn();
const mockGetIntegrationHealth = vi.fn();
const mockGenerateGrowthAnalytics = vi.fn();
const mockGetLaunchMetrics = vi.fn();

vi.mock("../../../app/lib/monitoring/dashboard", () => ({
  getDashboardMetrics: (...args: unknown[]) =>
    mockGetDashboardMetrics(...args),
  getHealthSummary: (...args: unknown[]) => mockGetHealthSummary(...args),
}));

vi.mock("../../../app/services/analytics/production-monitoring", () => ({
  ProductionMonitoringService: vi.fn().mockImplementation(() => ({
    generateHealthReport: (...args: unknown[]) =>
      mockGenerateHealthReport(...args),
  })),
}));

vi.mock("../../../app/services/integrations/integration-manager", () => ({
  IntegrationManager: vi.fn().mockImplementation(() => ({
    getHealthStatus: (...args: unknown[]) =>
      mockGetIntegrationHealth(...args),
  })),
}));

vi.mock("../../../app/services/analytics/growthEngine", () => ({
  generateGrowthEngineAnalytics: (...args: unknown[]) =>
    mockGenerateGrowthAnalytics(...args),
}));

vi.mock("../../../app/services/metrics/launch-metrics", () => ({
  getLaunchMetrics: (...args: unknown[]) => mockGetLaunchMetrics(...args),
}));

beforeEach(() => {
  mockGetDashboardMetrics.mockReset();
  mockGetHealthSummary.mockReset();
  mockGenerateHealthReport.mockReset();
  mockGetIntegrationHealth.mockReset();
  mockGenerateGrowthAnalytics.mockReset();
  mockGetLaunchMetrics.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("launch.readiness loader", () => {
  it("aggregates tile health, blockers, and status checks", async () => {
    mockGetDashboardMetrics.mockReturnValue({
      timestamp: "2025-10-25T06:45:00.000Z",
      health: {
        status: "healthy",
        issues: [],
      },
      alerts: {
        total: 3,
        unacknowledged: 1,
        critical: 1,
        bySeverity: {
          critical: 1,
          warning: 1,
          info: 1,
        },
      },
      uptime: {
        overall: 98.4,
        services: [],
        incidents: 0,
      },
      performance: {
        routes: {
          count: 100,
          avgDuration: 160,
          p95: 2800,
        },
        apis: {
          count: 50,
          avgDuration: 120,
          p95: 2100,
        },
        database: {
          count: 30,
          avgDuration: 80,
          p95: 1500,
        },
      },
    });

    mockGetHealthSummary.mockReturnValue({
      status: "degraded",
      message: "System degraded: sample issue",
      timestamp: "2025-10-25T06:45:00.000Z",
    });

    mockGenerateHealthReport.mockResolvedValue({
      overall: {
        status: "degraded",
        score: 72,
        timestamp: "2025-10-25T06:45:00.000Z",
      },
      metrics: {
        analytics: {
          pageViews: 1200,
          sessions: 900,
          conversions: 32,
          revenue: 8200,
          conversionRate: 3.5,
        },
        performance: {
          avgResponseTime: 540,
          errorRate: 1.6,
          uptime: 98.4,
          throughput: 1400,
        },
        funnel: {
          landingPageViews: 1200,
          productViews: 900,
          addToCarts: 300,
          checkouts: 120,
          purchases: 80,
          dropoffRates: {
            landingToProduct: 25,
            productToCart: 20,
            cartToCheckout: 60,
            checkoutToPurchase: 30,
          },
        },
        health: {
          status: "degraded",
          issues: ["Checkout drop-off"],
          score: 72,
        },
        timestamp: "2025-10-25T06:40:00.000Z",
      },
      anomalies: {
        anomalies: [],
        actionRequired: false,
        summary: "No anomalies",
      },
      alerts: [],
      recommendations: [],
    });

    mockGetIntegrationHealth.mockResolvedValue([
      {
        service: "https://api.integration-a.dev",
        healthy: true,
        lastChecked: "2025-10-25T06:40:00.000Z",
      },
      {
        service: "https://api.integration-b.dev",
        healthy: false,
        error: "Timeout",
        lastChecked: "2025-10-25T06:40:00.000Z",
      },
    ]);

    mockGenerateGrowthAnalytics.mockResolvedValue({
      overview: {},
      phases: [],
      actions: [],
      performance: {
        topPerformingActions: [],
        underperformingActions: [],
        criticalActions: [],
        blockedActions: [
          {
            actionId: "ACTION-1",
            title: "Fix checkout bug",
            actionType: "product",
            priority: "high",
            blockers: ["QA validation pending"],
          },
        ],
      },
      insights: {},
      recommendations: {},
    });

    mockGetLaunchMetrics.mockResolvedValue({
      adoption: {
        dauMau: {
          date: "2025-10-25",
          dau: 45,
          mau: 100,
          ratio: 45,
          trend: "up",
        },
        signups: {
          period: "weekly",
          signups: 12,
          target: 10,
          percentOfTarget: 120,
          trend: "up",
        },
        activation: {
          cohort: "default",
          totalUsers: 100,
          activatedUsers: 64,
          activationRate: 64,
          milestoneCompletion: {
            profileSetup: 82,
            firstIntegration: 70,
            viewDashboard: 68,
            firstApproval: 55,
            firstWorkflow: 40,
          },
        },
        ttfv: {
          median: 32,
          p50: 30,
          p75: 48,
          p90: 60,
          p99: 90,
          distribution: {
            under15min: 22,
            under30min: 48,
            under60min: 78,
            over60min: 22,
          },
        },
        featureAdoption: [],
      },
      satisfaction: {
        nps: {
          period: "weekly",
          totalResponses: 25,
          promoters: 16,
          passives: 6,
          detractors: 3,
          npsScore: 52,
          trend: "improving",
        },
        csat: [],
        sentiment: {
          positive: 60,
          neutral: 25,
          negative: 15,
          averageSentiment: 0.35,
        },
      },
      usage: {
        engagement: [],
        retention: [],
        powerUsers: {},
      },
      businessImpact: {
        revenue: {},
        costSavings: {},
        timeSavings: {},
        roi: {},
      },
    });

    const { loader } = await import("../../../app/routes/launch.readiness");

    const response = await loader({
      request: new Request("https://hotdash.local/launch/readiness"),
      params: {},
      context: {},
    } as never);

    const body = (await response.json()) as {
      tiles: unknown[];
      blockers: unknown[];
      checks: unknown[];
      lastUpdated: string;
    };

    expect(body.tiles).toHaveLength(4);
    expect(body.tiles[0]).toMatchObject({
      id: "system-health",
      status: "warning",
    });
    expect(body.tiles[2]).toMatchObject({
      id: "integration-health",
      status: "warning",
    });

    expect(body.blockers).toHaveLength(1);
    expect(body.blockers[0]).toMatchObject({
      id: "ACTION-1",
      title: "Fix checkout bug",
      detail: "QA validation pending",
    });

    expect(body.checks).toHaveLength(4);
    expect(body.checks[0]).toMatchObject({
      id: "uptime",
      status: "warn",
    });
    expect(new Date(body.lastUpdated).toString()).not.toBe("Invalid Date");
  });
});
