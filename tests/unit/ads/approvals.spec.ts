/**
 * Approvals Integration Tests
 */

import { describe, it, expect } from "vitest";
import {
  createCampaignApprovalRequest,
  createBudgetChangeApprovalRequest,
  createPauseApprovalRequest,
  formatApprovalForDisplay,
  type Campaign,
  AdPlatform,
  CampaignStatus,
} from "~/lib/ads";

const mockCampaign: Campaign = {
  id: "test-campaign-1",
  name: "Test Campaign",
  platform: AdPlatform.META,
  status: CampaignStatus.ACTIVE,
  startDate: "2025-06-01T00:00:00Z",
  dailyBudget: 100,
  totalBudget: 3000,
  metrics: {
    spend: 500,
    revenue: 2500,
    impressions: 50000,
    clicks: 1000,
    conversions: 50,
    roas: 5.0,
    cpc: 0.5,
    cpa: 10.0,
    ctr: 2.0,
    conversionRate: 5.0,
  },
  createdAt: "2025-05-15T00:00:00Z",
  updatedAt: "2025-06-15T00:00:00Z",
};

describe("Campaign Approval Requests", () => {
  it("creates campaign creation approval request", () => {
    const request = createCampaignApprovalRequest(
      { name: "New Campaign", dailyBudget: 200 },
      { notes: "Based on Q2 performance" },
    );

    expect(request.type).toBe("campaign_create");
    expect(request.campaign.name).toBe("New Campaign");
    expect(request.rollback.actions).toHaveLength(4);
    expect(request.risk.level).toBeDefined();
  });

  it("assesses high risk for large budgets", () => {
    const request = createCampaignApprovalRequest({ dailyBudget: 1000 }, {});

    expect(request.risk.level).toBe("high");
    expect(request.risk.factors.some((f) => f.includes("budget"))).toBe(true);
  });

  it("creates budget change approval request", () => {
    const request = createBudgetChangeApprovalRequest(
      "campaign-1",
      100,
      250,
      "Scaling successful campaign",
    );

    expect(request.type).toBe("budget_change");
    expect(request.campaign.dailyBudget).toBe(250);
    expect(request.evidence.notes).toContain("150.0%");
  });

  it("creates pause approval request", () => {
    const request = createPauseApprovalRequest(
      mockCampaign,
      "ROAS below threshold",
    );

    expect(request.type).toBe("campaign_pause");
    expect(request.campaign.status).toBe("paused");
    expect(request.risk.level).toBe("low");
  });

  it("formats approval for display", () => {
    const request = createCampaignApprovalRequest(
      { name: "Display Campaign", dailyBudget: 150 },
      { projectedROAS: 3.5 },
    );

    const display = formatApprovalForDisplay(request);

    expect(display.title).toContain("Display Campaign");
    expect(
      display.evidenceItems.some((item) => item.includes("Projected ROAS")),
    ).toBe(true);
    expect(display.riskLevel).toBeDefined();
  });
});
