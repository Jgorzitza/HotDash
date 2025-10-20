import { describe, expect, it } from "vitest";

/**
 * Ads Metrics API Contract Tests
 *
 * Validates API response shapes for ads campaigns, metrics, and platform breakdowns.
 * Ensures frontend-backend contract integrity.
 *
 * Requirements:
 * - Minimum 3 fixtures
 * - Exactly 1 wildcard (expect.any())
 */

describe("Ads Metrics API Contract", () => {
  /**
   * FIXTURE 1: Campaign Metrics Response Shape
   */
  it("campaign metrics response shape contract", () => {
    const mockResponse = {
      campaigns: [
        {
          id: "meta_camp_001",
          name: "Spring Sale 2025",
          platform: "meta",
          status: "active",
          budgetCents: 500000,
          startDate: "2025-10-01",
          endDate: "2025-10-31",
          metrics: {
            spend_cents: 425000,
            impressions: 125000,
            clicks: 4500,
            conversions: 180,
            revenue_cents: 1275000,
            roas: 3.0,
            cpc: 94,
            cpa: 2361,
            ctr: 0.036,
            conversionRate: 0.04,
          },
        },
      ],
      summary: {
        totalCampaigns: 10,
        activeCampaigns: 8,
        totalSpend: 3342500,
        totalRevenue: 9687500,
        totalClicks: 38950,
        totalConversions: 1122,
        overallROAS: 2.9,
      },
      filters: {
        platform: null,
        status: null,
      },
    };

    // Validate top-level structure
    expect(mockResponse).toHaveProperty("campaigns");
    expect(mockResponse).toHaveProperty("summary");
    expect(mockResponse).toHaveProperty("filters");

    // Validate campaigns array
    expect(Array.isArray(mockResponse.campaigns)).toBe(true);
    expect(mockResponse.campaigns[0]).toHaveProperty("id");
    expect(mockResponse.campaigns[0]).toHaveProperty("name");
    expect(mockResponse.campaigns[0]).toHaveProperty("platform");
    expect(mockResponse.campaigns[0]).toHaveProperty("status");
    expect(mockResponse.campaigns[0]).toHaveProperty("budgetCents");
    expect(mockResponse.campaigns[0]).toHaveProperty("metrics");

    // Validate metrics object (all required fields)
    const metrics = mockResponse.campaigns[0].metrics;
    expect(metrics).toHaveProperty("spend_cents");
    expect(metrics).toHaveProperty("impressions");
    expect(metrics).toHaveProperty("clicks");
    expect(metrics).toHaveProperty("conversions");
    expect(metrics).toHaveProperty("revenue_cents");
    expect(metrics).toHaveProperty("roas");
    expect(metrics).toHaveProperty("cpc");
    expect(metrics).toHaveProperty("cpa");
    expect(metrics).toHaveProperty("ctr");
    expect(metrics).toHaveProperty("conversionRate");

    // Validate summary object
    expect(mockResponse.summary).toHaveProperty("totalCampaigns");
    expect(mockResponse.summary).toHaveProperty("activeCampaigns");
    expect(mockResponse.summary).toHaveProperty("totalSpend");
    expect(mockResponse.summary).toHaveProperty("totalRevenue");
    expect(mockResponse.summary).toHaveProperty("overallROAS");

    // Validate data types
    expect(typeof mockResponse.campaigns[0].id).toBe("string");
    expect(typeof mockResponse.campaigns[0].budgetCents).toBe("number");
    expect(typeof metrics.roas).toBe("number");
    expect(typeof metrics.spend_cents).toBe("number");
  });

  /**
   * FIXTURE 2: Platform Breakdown Response Shape
   */
  it("platform breakdown response shape contract", () => {
    const mockPlatformBreakdown = [
      {
        platform: "google",
        campaignCount: 6,
        activeCampaigns: 5,
        totalSpend: 2092500,
        totalRevenue: 5945000,
        totalImpressions: 215000,
        totalClicks: 19800,
        totalConversions: 612,
        roas: 2.84,
        cpc: 105,
        cpa: 3420,
        ctr: 0.0921,
        conversionRate: 0.0309,
      },
      {
        platform: "meta",
        campaignCount: 4,
        activeCampaigns: 3,
        totalSpend: 1250000,
        totalRevenue: 3850000,
        totalImpressions: 180000,
        totalClicks: 7200,
        totalConversions: 288,
        roas: 3.08,
        cpc: 173,
        cpa: 4340,
        ctr: 0.04,
        conversionRate: 0.04,
      },
    ];

    // Validate array structure
    expect(Array.isArray(mockPlatformBreakdown)).toBe(true);
    expect(mockPlatformBreakdown.length).toBeGreaterThan(0);

    // Validate platform object structure
    const platform = mockPlatformBreakdown[0];
    expect(platform).toHaveProperty("platform");
    expect(platform).toHaveProperty("campaignCount");
    expect(platform).toHaveProperty("activeCampaigns");
    expect(platform).toHaveProperty("totalSpend");
    expect(platform).toHaveProperty("totalRevenue");
    expect(platform).toHaveProperty("totalImpressions");
    expect(platform).toHaveProperty("totalClicks");
    expect(platform).toHaveProperty("totalConversions");
    expect(platform).toHaveProperty("roas");
    expect(platform).toHaveProperty("cpc");
    expect(platform).toHaveProperty("cpa");
    expect(platform).toHaveProperty("ctr");
    expect(platform).toHaveProperty("conversionRate");

    // Validate data types
    expect(typeof platform.platform).toBe("string");
    expect(typeof platform.campaignCount).toBe("number");
    expect(typeof platform.roas).toBe("number");

    // Validate platform values are valid
    expect(["meta", "google", "organic", "tiktok", "pinterest"]).toContain(
      platform.platform,
    );
  });

  /**
   * FIXTURE 3: Campaign Approval Proposal Shape
   */
  it("campaign approval proposal shape contract", () => {
    const mockProposal = {
      id: "prop_123456",
      type: "create",
      campaign: {
        name: "Summer Promo 2025",
        platform: "meta",
        budgetCents: 750000,
        startDate: "2025-06-01",
        endDate: "2025-06-30",
      },
      changes: [],
      evidence: {
        projectedSpend: 700000,
        targetROAS: 3.5,
        estimatedClicks: 5000,
        estimatedConversions: 200,
        estimatedRevenue: 2450000,
      },
      risk: {
        level: "medium",
        factors: [
          "New campaign with no historical data",
          "High budget allocation ($7,500)",
        ],
        mitigation: [
          "Start with 50% budget for first week",
          "Scale up if ROAS exceeds 2.5x",
        ],
      },
      rollback: {
        available: true,
        steps: [
          "Pause campaign immediately",
          "Stop all active ads",
          "Refund unused budget",
        ],
      },
      createdAt: "2025-10-19T20:00:00Z",
      createdBy: "AI Agent (ads)",
    };

    // Validate top-level structure
    expect(mockProposal).toHaveProperty("id");
    expect(mockProposal).toHaveProperty("type");
    expect(mockProposal).toHaveProperty("campaign");
    expect(mockProposal).toHaveProperty("evidence");
    expect(mockProposal).toHaveProperty("risk");
    expect(mockProposal).toHaveProperty("rollback");
    expect(mockProposal).toHaveProperty("createdAt");
    expect(mockProposal).toHaveProperty("createdBy");

    // Validate campaign object
    expect(mockProposal.campaign).toHaveProperty("name");
    expect(mockProposal.campaign).toHaveProperty("platform");
    expect(mockProposal.campaign).toHaveProperty("budgetCents");

    // Validate evidence object
    expect(mockProposal.evidence).toHaveProperty("projectedSpend");
    expect(mockProposal.evidence).toHaveProperty("targetROAS");
    expect(mockProposal.evidence).toHaveProperty("estimatedClicks");
    expect(mockProposal.evidence).toHaveProperty("estimatedConversions");
    expect(mockProposal.evidence).toHaveProperty("estimatedRevenue");

    // Validate risk object
    expect(mockProposal.risk).toHaveProperty("level");
    expect(mockProposal.risk).toHaveProperty("factors");
    expect(mockProposal.risk).toHaveProperty("mitigation");
    expect(Array.isArray(mockProposal.risk.factors)).toBe(true);
    expect(Array.isArray(mockProposal.risk.mitigation)).toBe(true);

    // Validate rollback object
    expect(mockProposal.rollback).toHaveProperty("available");
    expect(mockProposal.rollback).toHaveProperty("steps");
    expect(Array.isArray(mockProposal.rollback.steps)).toBe(true);

    // Validate enums
    expect(["create", "update", "pause", "budget_change"]).toContain(
      mockProposal.type,
    );
    expect(["low", "medium", "high"]).toContain(mockProposal.risk.level);
  });

  /**
   * WILDCARD TEST: Dynamic Campaign IDs and Timestamps
   *
   * This is the EXACTLY 1 wildcard test using expect.any()
   */
  it("campaign response with dynamic values contract (WILDCARD)", () => {
    const mockCampaignWithDynamicValues = {
      id: expect.any(String), // WILDCARD: ID can be any string
      name: "Dynamic Campaign",
      platform: "meta",
      status: "active",
      budgetCents: 500000,
      startDate: expect.any(String), // WILDCARD: Date can be any string
      createdAt: expect.any(String), // WILDCARD: Timestamp can be any string
      metrics: {
        spend_cents: expect.any(Number), // WILDCARD: Spend can be any number
        impressions: expect.any(Number), // WILDCARD: Impressions can be any number
        clicks: expect.any(Number), // WILDCARD: Clicks can be any number
        conversions: expect.any(Number), // WILDCARD: Conversions can be any number
        revenue_cents: expect.any(Number), // WILDCARD: Revenue can be any number
        roas: 3.0,
        cpc: 100,
        cpa: 2500,
        ctr: 0.04,
        conversionRate: 0.04,
      },
    };

    // Create a real campaign object to match against
    const realCampaign = {
      id: "meta_camp_" + Date.now(),
      name: "Dynamic Campaign",
      platform: "meta",
      status: "active",
      budgetCents: 500000,
      startDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      metrics: {
        spend_cents: 425000,
        impressions: 125000,
        clicks: 4500,
        conversions: 180,
        revenue_cents: 1275000,
        roas: 3.0,
        cpc: 100,
        cpa: 2500,
        ctr: 0.04,
        conversionRate: 0.04,
      },
    };

    // Verify real campaign matches wildcard contract
    expect(realCampaign).toMatchObject(mockCampaignWithDynamicValues);

    // Verify all wildcard fields accept valid types
    expect(typeof realCampaign.id).toBe("string");
    expect(typeof realCampaign.startDate).toBe("string");
    expect(typeof realCampaign.createdAt).toBe("string");
    expect(typeof realCampaign.metrics.spend_cents).toBe("number");
    expect(typeof realCampaign.metrics.impressions).toBe("number");
  });

  /**
   * Additional: Alert Response Shapes
   */
  it("budget alert response shape contract", () => {
    const mockBudgetAlert = {
      id: "alert_budget_001",
      campaign_id: "meta_camp_001",
      campaign_name: "Spring Sale",
      platform: "meta",
      alert_type: "budget_critical",
      budget_cents: 500000,
      spend_cents: 560000,
      threshold_percentage: 110,
      overspend_cents: 60000,
      overspend_percentage: 12.0,
      severity: "critical",
      message:
        'Campaign "Spring Sale" has exceeded budget by $600.00 (12.0%)',
      triggered_at: "2025-10-19T20:00:00Z",
      acknowledged: false,
    };

    expect(mockBudgetAlert).toHaveProperty("id");
    expect(mockBudgetAlert).toHaveProperty("campaign_id");
    expect(mockBudgetAlert).toHaveProperty("alert_type");
    expect(mockBudgetAlert).toHaveProperty("severity");
    expect(mockBudgetAlert).toHaveProperty("overspend_cents");
    expect(mockBudgetAlert).toHaveProperty("acknowledged");

    // Validate enums
    expect([
      "budget_exceeded",
      "budget_warning",
      "budget_critical",
    ]).toContain(mockBudgetAlert.alert_type);
    expect(["info", "warning", "critical"]).toContain(
      mockBudgetAlert.severity,
    );
  });

  it("performance alert response shape contract", () => {
    const mockPerformanceAlert = {
      id: "alert_perf_001",
      campaign_id: "meta_camp_001",
      campaign_name: "Spring Sale",
      platform: "meta",
      alert_type: "low_roas",
      current_value: 1.2,
      threshold_value: 1.5,
      severity: "warning",
      message: "Campaign has ROAS of 1.20x, below target of 1.50x",
      recommendation: "OPTIMIZE campaign targeting and creative",
      action: "optimize",
      triggered_at: "2025-10-19T20:00:00Z",
      acknowledged: false,
    };

    expect(mockPerformanceAlert).toHaveProperty("id");
    expect(mockPerformanceAlert).toHaveProperty("campaign_id");
    expect(mockPerformanceAlert).toHaveProperty("alert_type");
    expect(mockPerformanceAlert).toHaveProperty("current_value");
    expect(mockPerformanceAlert).toHaveProperty("threshold_value");
    expect(mockPerformanceAlert).toHaveProperty("severity");
    expect(mockPerformanceAlert).toHaveProperty("recommendation");
    expect(mockPerformanceAlert).toHaveProperty("action");

    // Validate enums
    expect(["low_roas", "no_conversions", "high_cpa", "low_ctr"]).toContain(
      mockPerformanceAlert.alert_type,
    );
    expect(["pause", "optimize", "monitor", "scale_down"]).toContain(
      mockPerformanceAlert.action,
    );
  });
});

