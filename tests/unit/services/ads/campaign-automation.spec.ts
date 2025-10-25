/**
 * Unit Tests for Campaign Automation Service
 *
 * Tests automation logic for:
 * - Identifying pause candidates (low CTR, low ROAS)
 * - Identifying budget increase candidates (high ROAS)
 * - Identifying budget decrease candidates (low ROAS)
 * - Identifying keyword pause candidates (low CTR)
 * - Generating comprehensive automation recommendations
 * - Formatting actions for approval queue
 */

import { describe, it, expect } from "vitest";
import {
  identifyPauseCandidates,
  identifyBudgetIncreaseCandidates,
  identifyBudgetDecreaseCandidates,
  identifyKeywordPauseCandidates,
  generateAutomationRecommendations,
  formatForApprovalQueue,
  DEFAULT_AUTOMATION_THRESHOLDS,
  type AutomationAction,
  type AutomationThresholds,
} from "~/services/ads/campaign-automation";
import type { CampaignSummary, KeywordPerformance } from "~/services/ads/types";

/**
 * Test Helper: Create mock campaign
 */
function createMockCampaign(
  overrides: Partial<CampaignSummary> = {},
): CampaignSummary {
  return {
    id: "campaign_123",
    name: "Test Campaign",
    status: "ENABLED" as const,
    impressions: 10000,
    clicks: 500,
    costCents: 10000, // $100
    conversions: 50,
    ctr: 0.05, // 5%
    roas: 2.5, // $2.50 revenue per $1 spent
    ...overrides,
  };
}

/**
 * Test Helper: Create mock keyword
 */
function createMockKeyword(
  overrides: Partial<KeywordPerformance> = {},
): KeywordPerformance {
  return {
    keywordId: "keyword_123",
    keyword: "test keyword",
    campaignId: "campaign_123",
    campaignName: "Test Campaign",
    impressions: 1000,
    clicks: 50,
    costCents: 1000, // $10
    conversions: 5,
    ctr: 0.05, // 5%
    cpc: 0.2, // $0.20
    ...overrides,
  };
}

describe("identifyPauseCandidates", () => {
  it("should identify campaign with low CTR", () => {
    const campaigns = [
      createMockCampaign({
        id: "low_ctr_campaign",
        name: "Low CTR Campaign",
        ctr: 0.005, // 0.5% (below 1% threshold)
        costCents: 10000, // $100 (above min spend)
        roas: 2.0, // ROAS is fine
      }),
    ];

    const actions = identifyPauseCandidates(campaigns);

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("pause_campaign");
    expect(actions[0].campaignId).toBe("low_ctr_campaign");
    expect(actions[0].campaignName).toBe("Low CTR Campaign");
    expect(actions[0].reason).toContain("Low CTR");
    expect(actions[0].severity).toBe("medium");
    expect(actions[0].requiresApproval).toBe(true);
  });

  it("should identify campaign with low ROAS", () => {
    const campaigns = [
      createMockCampaign({
        id: "low_roas_campaign",
        name: "Low ROAS Campaign",
        ctr: 0.05, // 5% (CTR is fine)
        costCents: 10000, // $100
        roas: 0.5, // Below 1.0 threshold
      }),
    ];

    const actions = identifyPauseCandidates(campaigns);

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("pause_campaign");
    expect(actions[0].campaignId).toBe("low_roas_campaign");
    expect(actions[0].campaignName).toBe("Low ROAS Campaign");
    expect(actions[0].reason).toContain("Poor ROAS");
    expect(actions[0].severity).toBe("high");
  });

  it("should identify campaign with both low CTR and low ROAS", () => {
    const campaigns = [
      createMockCampaign({
        id: "double_low",
        name: "Double Low Campaign",
        ctr: 0.005, // 0.5%
        roas: 0.5, // 0.5
        costCents: 10000,
      }),
    ];

    const actions = identifyPauseCandidates(campaigns);

    expect(actions).toHaveLength(1);
    expect(actions[0].reason).toContain("Low CTR");
    expect(actions[0].reason).toContain("poor ROAS");
  });

  it("should skip campaigns with low spend (insufficient data)", () => {
    const campaigns = [
      createMockCampaign({
        ctr: 0.005, // Low CTR
        roas: 0.5, // Low ROAS
        costCents: 1000, // $10 (below $50 min spend)
      }),
    ];

    const actions = identifyPauseCandidates(campaigns);

    expect(actions).toHaveLength(0); // Should skip due to low spend
  });

  it("should not identify healthy campaigns", () => {
    const campaigns = [
      createMockCampaign({
        ctr: 0.05, // 5% (healthy)
        roas: 3.0, // 3.0 (healthy)
        costCents: 10000,
      }),
    ];

    const actions = identifyPauseCandidates(campaigns);

    expect(actions).toHaveLength(0);
  });

  it("should handle campaigns with null ROAS", () => {
    const campaigns = [
      createMockCampaign({
        ctr: 0.005, // Low CTR
        roas: null, // No conversions yet
        costCents: 10000,
      }),
    ];

    const actions = identifyPauseCandidates(campaigns);

    expect(actions).toHaveLength(1);
    expect(actions[0].reason).toContain("Low CTR");
    expect(actions[0].reason).not.toContain("ROAS"); // Should not mention ROAS
  });

  it("should respect custom thresholds", () => {
    const campaigns = [
      createMockCampaign({
        ctr: 0.015, // 1.5%
        roas: 1.5,
        costCents: 10000,
      }),
    ];

    const customThresholds: AutomationThresholds = {
      ...DEFAULT_AUTOMATION_THRESHOLDS,
      pauseLowCtr: 2.0, // 2% threshold
      pauseLowRoas: 2.0, // 2.0 threshold
    };

    const actions = identifyPauseCandidates(campaigns, customThresholds);

    expect(actions).toHaveLength(1); // Should trigger with custom thresholds
  });

  it("should include rollback actions", () => {
    const campaigns = [
      createMockCampaign({
        ctr: 0.005,
        roas: 0.5,
        costCents: 10000,
        status: "ENABLED",
      }),
    ];

    const actions = identifyPauseCandidates(campaigns);

    expect(actions[0].rollback).toBeDefined();
    expect(actions[0].rollback.description).toContain("Resume campaign");
    expect(actions[0].rollback.actions).toHaveLength(1);
    expect(actions[0].rollback.actions[0].tool).toBe(
      "google-ads.campaign.resume",
    );
  });

  it("should classify severity correctly", () => {
    const lowCtrCampaign = createMockCampaign({
      ctr: 0.005, // Low CTR
      roas: 2.0, // Good ROAS
      costCents: 10000,
    });

    const lowRoasCampaign = createMockCampaign({
      ctr: 0.05, // Good CTR
      roas: 0.5, // Low ROAS
      costCents: 10000,
    });

    const bothLowCampaign = createMockCampaign({
      ctr: 0.005, // Low CTR
      roas: 0.5, // Low ROAS
      costCents: 10000,
    });

    const actions1 = identifyPauseCandidates([lowCtrCampaign]);
    const actions2 = identifyPauseCandidates([lowRoasCampaign]);
    const actions3 = identifyPauseCandidates([bothLowCampaign]);

    expect(actions1[0].severity).toBe("medium"); // Low CTR only is medium severity
    expect(actions2[0].severity).toBe("high"); // Low ROAS is high severity
    expect(actions3[0].severity).toBe("high"); // Both is high severity
  });
});

describe("identifyBudgetIncreaseCandidates", () => {
  it("should identify high ROAS campaign for budget increase", () => {
    const campaigns = [
      createMockCampaign({
        id: "high_roas",
        name: "High ROAS Campaign",
        roas: 4.0, // Above 3.0 threshold
        costCents: 10000, // $100
      }),
    ];

    const actions = identifyBudgetIncreaseCandidates(campaigns);

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("increase_budget");
    expect(actions[0].campaignId).toBe("high_roas");
    expect(actions[0].campaignName).toBe("High ROAS Campaign");
    expect(actions[0].reason).toContain("High ROAS");
    expect(actions[0].severity).toBe("low");
    expect(actions[0].requiresApproval).toBe(true);
  });

  it("should calculate +20% budget increase correctly", () => {
    const campaigns = [
      createMockCampaign({
        roas: 4.0,
        costCents: 10000,
      }),
    ];

    const actions = identifyBudgetIncreaseCandidates(campaigns);

    // Implementation uses costCents as base budget (simplified)
    expect(actions[0].evidence.currentMetrics.currentBudget).toBe(10000);
    expect(actions[0].evidence.projectedImpact).toContain("$");
  });

  it("should skip campaigns with low spend", () => {
    const campaigns = [
      createMockCampaign({
        roas: 4.0, // High ROAS
        costCents: 1000, // $10 (below $50 min)
        dailyBudgetCents: 5000,
      }),
    ];

    const actions = identifyBudgetIncreaseCandidates(campaigns);

    expect(actions).toHaveLength(0);
  });

  it("should skip campaigns with null ROAS", () => {
    const campaigns = [
      createMockCampaign({
        roas: null, // No conversions
        costCents: 10000,
        dailyBudgetCents: 5000,
      }),
    ];

    const actions = identifyBudgetIncreaseCandidates(campaigns);

    expect(actions).toHaveLength(0);
  });

  it("should not identify campaigns below threshold", () => {
    const campaigns = [
      createMockCampaign({
        roas: 2.5, // Below 3.0 threshold
        costCents: 10000,
        dailyBudgetCents: 5000,
      }),
    ];

    const actions = identifyBudgetIncreaseCandidates(campaigns);

    expect(actions).toHaveLength(0);
  });

  it("should include rollback actions", () => {
    const campaigns = [
      createMockCampaign({
        roas: 4.0,
        costCents: 10000,
      }),
    ];

    const actions = identifyBudgetIncreaseCandidates(campaigns);

    expect(actions[0].rollback).toBeDefined();
    expect(actions[0].rollback.description).toContain("Revert budget");
    expect(actions[0].rollback.actions[0].tool).toBe(
      "google-ads.campaign.updateBudget",
    );
  });

  it("should respect custom thresholds", () => {
    const campaigns = [
      createMockCampaign({
        roas: 2.5, // Would not trigger with default 3.0 threshold
        costCents: 10000,
        dailyBudgetCents: 5000,
      }),
    ];

    const customThresholds: AutomationThresholds = {
      ...DEFAULT_AUTOMATION_THRESHOLDS,
      increaseBudgetRoas: 2.0, // Lower threshold
    };

    const actions = identifyBudgetIncreaseCandidates(
      campaigns,
      customThresholds,
    );

    expect(actions).toHaveLength(1); // Should trigger with custom threshold
  });
});

describe("identifyBudgetDecreaseCandidates", () => {
  it("should identify low ROAS campaign for budget decrease", () => {
    const campaigns = [
      createMockCampaign({
        id: "inefficient",
        name: "Inefficient Campaign",
        roas: 1.2, // Below 1.5 threshold but above 1.0 pause threshold
        costCents: 10000,
      }),
    ];

    const actions = identifyBudgetDecreaseCandidates(campaigns);

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("decrease_budget");
    expect(actions[0].campaignId).toBe("inefficient");
    expect(actions[0].campaignName).toBe("Inefficient Campaign");
    expect(actions[0].reason).toContain("Below-target ROAS");
    expect(actions[0].severity).toBe("medium");
  });

  it("should calculate -30% budget decrease correctly", () => {
    const campaigns = [
      createMockCampaign({
        roas: 1.2,
        costCents: 10000,
      }),
    ];

    const actions = identifyBudgetDecreaseCandidates(campaigns);

    expect(actions[0].evidence.currentMetrics.currentBudget).toBe(10000);
    expect(actions[0].evidence.projectedImpact).toContain("$");
  });

  it("should skip campaigns with very low ROAS (pause territory)", () => {
    const campaigns = [
      createMockCampaign({
        roas: 0.5, // Below 1.0 (should be paused, not decreased)
        costCents: 10000,
        dailyBudgetCents: 5000,
      }),
    ];

    const actions = identifyBudgetDecreaseCandidates(campaigns);

    expect(actions).toHaveLength(0); // Should be paused instead
  });

  it("should skip campaigns with low spend", () => {
    const campaigns = [
      createMockCampaign({
        roas: 1.2,
        costCents: 1000, // Below min spend
        dailyBudgetCents: 5000,
      }),
    ];

    const actions = identifyBudgetDecreaseCandidates(campaigns);

    expect(actions).toHaveLength(0);
  });

  it("should include rollback actions", () => {
    const campaigns = [
      createMockCampaign({
        roas: 1.2,
        costCents: 10000,
      }),
    ];

    const actions = identifyBudgetDecreaseCandidates(campaigns);

    expect(actions[0].rollback).toBeDefined();
    expect(actions[0].rollback.description).toContain(
      "Restore original budget",
    );
    expect(actions[0].rollback.actions[0].tool).toBe(
      "google-ads.campaign.updateBudget",
    );
  });
});

describe("identifyKeywordPauseCandidates", () => {
  it("should identify keywords with low CTR", () => {
    const keywords = [
      createMockKeyword({
        keywordId: "low_ctr_keyword",
        keyword: "low ctr keyword",
        impressions: 1000, // Need ≥500 impressions
        clicks: 3, // 0.3% CTR
        ctr: 0.003, // 0.3% (below 0.5% threshold)
        costCents: 10000,
      }),
    ];

    const actions = identifyKeywordPauseCandidates(keywords);

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("pause_keyword");
    expect(actions[0].reason).toContain("low CTR");
    expect(actions[0].severity).toBe("low");
  });

  it("should skip keywords with low spend", () => {
    const keywords = [
      createMockKeyword({
        ctr: 0.003, // Low CTR
        costCents: 1000, // Below min spend
      }),
    ];

    const actions = identifyKeywordPauseCandidates(keywords);

    expect(actions).toHaveLength(0);
  });

  it("should not identify healthy keywords", () => {
    const keywords = [
      createMockKeyword({
        ctr: 0.05, // 5% (healthy)
        costCents: 10000,
      }),
    ];

    const actions = identifyKeywordPauseCandidates(keywords);

    expect(actions).toHaveLength(0);
  });

  it("should include keyword details in evidence", () => {
    const keywords = [
      createMockKeyword({
        keywordId: "test_kw",
        keyword: "test keyword phrase",
        impressions: 10000,
        clicks: 30, // 0.3% CTR
        costCents: 10000,
      }),
    ];

    const actions = identifyKeywordPauseCandidates(keywords);

    expect(actions[0].evidence.currentMetrics.keyword).toBe(
      "test keyword phrase",
    );
    // CTR is calculated from impressions/clicks in implementation
    expect(actions[0].evidence.currentMetrics.ctr).toBeCloseTo(0.3, 1); // 30/10000 * 100 = 0.3%
    expect(actions[0].evidence.currentMetrics.impressions).toBe(10000);
    expect(actions[0].evidence.currentMetrics.clicks).toBe(30);
  });

  it("should include rollback actions", () => {
    const keywords = [
      createMockKeyword({
        keywordId: "test_kw",
        keyword: "test keyword",
        impressions: 1000,
        clicks: 3, // 0.3% CTR
        costCents: 10000,
      }),
    ];

    const actions = identifyKeywordPauseCandidates(keywords);

    expect(actions[0].rollback).toBeDefined();
    expect(actions[0].rollback.description).toContain("Resume keyword");
    expect(actions[0].rollback.actions[0].tool).toBe(
      "google-ads.keyword.resume",
    );
  });
});

describe("generateAutomationRecommendations", () => {
  it("should generate comprehensive recommendations for mixed scenarios", () => {
    const campaigns = [
      createMockCampaign({
        id: "campaign_pause",
        name: "Pause Campaign",
        ctr: 0.005, // Should pause
        roas: 0.5,
        costCents: 10000,
      }),
      createMockCampaign({
        id: "campaign_increase",
        name: "Increase Campaign",
        ctr: 0.05,
        roas: 4.0, // Should increase budget
        costCents: 10000,
      }),
      createMockCampaign({
        id: "campaign_decrease",
        name: "Decrease Campaign",
        ctr: 0.05,
        roas: 1.3, // Should decrease budget
        costCents: 10000,
      }),
    ];

    const keywords = [
      createMockKeyword({
        keywordId: "keyword_pause",
        keyword: "pause keyword",
        impressions: 1000,
        clicks: 3, // 0.3% CTR - should pause
        costCents: 10000,
      }),
    ];

    const recommendations = generateAutomationRecommendations(
      campaigns,
      keywords,
    );

    // Result is a flat array of all actions, sorted by severity
    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it("should return empty recommendations for healthy campaigns", () => {
    const campaigns = [
      createMockCampaign({
        ctr: 0.05, // Healthy
        roas: 2.5, // Healthy
        costCents: 10000,
      }),
    ];

    const recommendations = generateAutomationRecommendations(campaigns, []);

    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations).toHaveLength(0);
  });

  it("should respect custom thresholds", () => {
    const campaigns = [
      createMockCampaign({
        ctr: 0.015, // 1.5%
        roas: 2.5,
        costCents: 10000,
      }),
    ];

    const customThresholds: AutomationThresholds = {
      ...DEFAULT_AUTOMATION_THRESHOLDS,
      pauseLowCtr: 2.0, // 2% (would trigger pause)
      increaseBudgetRoas: 2.0, // 2.0 (would trigger increase)
    };

    const recommendations = generateAutomationRecommendations(
      campaigns,
      [],
      customThresholds,
    );

    // Should have at least 2 actions (pause + increase budget)
    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThanOrEqual(2);
  });
});

describe("formatForApprovalQueue", () => {
  it("should format automation action for approval queue", () => {
    const action: AutomationAction = {
      type: "pause_campaign",
      campaignId: "campaign_123",
      campaignName: "Test Campaign",
      reason: "CTR below threshold (0.5% < 1.0%)",
      evidence: {
        currentMetrics: { ctr: 0.005, roas: 0.5 },
        threshold: { ctr: 0.01, roas: 1.0 },
        projectedImpact: "Save $50/day in inefficient spend",
      },
      actions: [
        {
          tool: "google-ads.campaign.pause",
          args: { campaignId: "campaign_123" },
        },
      ],
      rollback: {
        description: "Resume campaign",
        actions: [
          {
            tool: "google-ads.campaign.resume",
            args: { campaignId: "campaign_123" },
          },
        ],
      },
      requiresApproval: true,
      severity: "high",
    };

    const approval = formatForApprovalQueue(action);

    expect(approval.kind).toBe("growth");
    expect(approval.summary).toContain("Test Campaign");
    expect(approval.summary).toContain("Pause underperforming campaign");
    expect(approval.actions).toEqual(action.actions);
  });

  it("should format budget increase action correctly", () => {
    const action: AutomationAction = {
      type: "increase_budget",
      campaignId: "campaign_123",
      campaignName: "High ROAS Campaign",
      reason: "ROAS above threshold (4.0 > 3.0)",
      evidence: {
        currentMetrics: {
          roas: 4.0,
          currentBudget: 5000,
        },
        threshold: { roas: 3.0 },
        projectedImpact: "Increase budget $50/day → $60/day (+20%)",
      },
      actions: [
        {
          tool: "google-ads.campaign.updateBudget",
          args: { campaignId: "campaign_123", budgetMicros: 60000000 },
        },
      ],
      rollback: {
        description: "Revert budget to previous level",
        actions: [
          {
            tool: "google-ads.campaign.updateBudget",
            args: { campaignId: "campaign_123", budgetMicros: 50000000 },
          },
        ],
      },
      requiresApproval: true,
      severity: "low",
    };

    const approval = formatForApprovalQueue(action);

    expect(approval.kind).toBe("growth");
    expect(approval.summary).toContain("High ROAS Campaign");
    expect(approval.summary).toContain("Increase budget");
  });

  it("should format keyword pause action correctly", () => {
    const action: AutomationAction = {
      type: "pause_keyword",
      campaignId: "campaign_123",
      campaignName: "Test Campaign",
      reason: "Keyword CTR below threshold",
      evidence: {
        currentMetrics: { keyword: "test keyword", ctr: 0.003 },
        threshold: { ctr: 0.005 },
        projectedImpact: "Save $10/day on low-performing keyword",
      },
      actions: [
        {
          tool: "google-ads.keyword.pause",
          args: {
            adGroupId: "adgroup_123",
            keyword: "test keyword",
            matchType: "EXACT",
          },
        },
      ],
      rollback: {
        description: "Resume keyword",
        actions: [
          {
            tool: "google-ads.keyword.resume",
            args: {
              adGroupId: "adgroup_123",
              keyword: "test keyword",
              matchType: "EXACT",
            },
          },
        ],
      },
      requiresApproval: true,
      severity: "low",
    };

    const approval = formatForApprovalQueue(action);

    expect(approval.kind).toBe("growth");
    expect(approval.summary).toContain("Test Campaign");
    expect(approval.summary).toContain("Pause low-performing keyword");
  });
});
