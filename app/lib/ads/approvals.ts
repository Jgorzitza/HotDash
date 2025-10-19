/**
 * Ads Approvals Integration
 *
 * Wires ads campaign operations to the centralized approvals drawer
 * Provides evidence, projected impact, risk assessment, and rollback plans
 *
 * @module app/lib/ads/approvals
 */

import type { AdsApprovalRequest, Campaign, CampaignMetrics } from "./types";

/**
 * Generate approval request for campaign creation
 *
 * @param campaign - Campaign data to create
 * @param evidence - Supporting evidence data
 * @returns Formatted approval request
 */
export function createCampaignApprovalRequest(
  campaign: Partial<Campaign>,
  evidence: {
    historicalData?: CampaignMetrics;
    similarCampaigns?: Campaign[];
    notes?: string;
  },
): AdsApprovalRequest {
  // Calculate projected ROAS based on historical data or similar campaigns
  const projectedROAS = calculateProjectedROAS(evidence);

  // Assess risk level based on budget and projected performance
  const risk = assessCampaignRisk(campaign, projectedROAS);

  return {
    type: "campaign_create",
    campaign,
    evidence: {
      historicalData: evidence.historicalData,
      projectedROAS,
      similarCampaigns: evidence.similarCampaigns,
      notes: evidence.notes,
    },
    rollback: {
      description:
        "Campaign can be paused immediately if performance is below expectations",
      actions: [
        "Pause campaign via platform API",
        "Stop all active ad sets",
        "Refund unused budget (if within platform policy)",
        "Archive campaign data to ads_metrics_daily table",
      ],
    },
    risk,
  };
}

/**
 * Generate approval request for campaign budget change
 *
 * @param campaignId - Campaign to update
 * @param currentBudget - Current daily budget
 * @param newBudget - Proposed new daily budget
 * @param justification - Reason for budget change
 * @returns Formatted approval request
 */
export function createBudgetChangeApprovalRequest(
  campaignId: string,
  currentBudget: number,
  newBudget: number,
  justification: string,
): AdsApprovalRequest {
  const budgetIncrease = newBudget - currentBudget;
  const percentChange = ((budgetIncrease / currentBudget) * 100).toFixed(1);

  // Higher budget changes carry higher risk
  const risk = assessBudgetChangeRisk(currentBudget, newBudget);

  return {
    type: "budget_change",
    campaign: {
      id: campaignId,
      dailyBudget: newBudget,
    },
    evidence: {
      notes: `${justification}\n\nBudget change: $${currentBudget} → $${newBudget} (${percentChange > 0 ? "+" : ""}${percentChange}%)`,
    },
    rollback: {
      description: `Revert daily budget to $${currentBudget}`,
      actions: [
        `Update campaign ${campaignId} daily budget to ${currentBudget}`,
        "Monitor performance for 24 hours post-rollback",
        "Document rollback reason in ads_metrics_daily table",
      ],
    },
    risk,
  };
}

/**
 * Generate approval request for campaign pause
 *
 * @param campaign - Campaign to pause
 * @param reason - Reason for pausing
 * @returns Formatted approval request
 */
export function createPauseApprovalRequest(
  campaign: Campaign,
  reason: string,
): AdsApprovalRequest {
  return {
    type: "campaign_pause",
    campaign: {
      id: campaign.id,
      name: campaign.name,
      status: "paused",
    },
    evidence: {
      notes: `Pause requested: ${reason}\n\nCurrent performance:\n- ROAS: ${campaign.metrics.roas.toFixed(2)}x\n- Spend: $${campaign.metrics.spend}\n- CPC: $${campaign.metrics.cpc.toFixed(2)}`,
    },
    rollback: {
      description: "Resume campaign to active status",
      actions: [
        `Update campaign ${campaign.id} status to active`,
        "Verify ad sets are running",
        "Monitor performance resumption within 1 hour",
      ],
    },
    risk: {
      level: "low",
      factors: [
        "Pausing is reversible",
        "No budget impact during pause",
        "Can resume at any time",
      ],
    },
  };
}

/**
 * Calculate projected ROAS based on evidence
 *
 * @param evidence - Historical or comparative data
 * @returns Projected ROAS value
 */
function calculateProjectedROAS(evidence: {
  historicalData?: CampaignMetrics;
  similarCampaigns?: Campaign[];
}): number {
  // If we have historical data, use it
  if (evidence.historicalData && evidence.historicalData.roas > 0) {
    return evidence.historicalData.roas;
  }

  // If we have similar campaigns, average their ROAS
  if (evidence.similarCampaigns && evidence.similarCampaigns.length > 0) {
    const avgROAS =
      evidence.similarCampaigns.reduce(
        (sum, campaign) => sum + campaign.metrics.roas,
        0,
      ) / evidence.similarCampaigns.length;
    return avgROAS;
  }

  // Conservative default for new campaigns
  return 2.0;
}

/**
 * Assess campaign creation risk
 *
 * @param campaign - Campaign to assess
 * @param projectedROAS - Projected performance
 * @returns Risk assessment
 */
function assessCampaignRisk(
  campaign: Partial<Campaign>,
  projectedROAS: number,
): { level: "low" | "medium" | "high"; factors: string[] } {
  const factors: string[] = [];
  let riskScore = 0;

  // Budget risk
  const dailyBudget = campaign.dailyBudget || 0;
  if (dailyBudget > 500) {
    factors.push("High daily budget (>$500)");
    riskScore += 2;
  } else if (dailyBudget > 200) {
    factors.push("Medium daily budget ($200-$500)");
    riskScore += 1;
  }

  // ROAS risk
  if (projectedROAS < 2.0) {
    factors.push("Projected ROAS below 2x target");
    riskScore += 2;
  } else if (projectedROAS < 3.0) {
    factors.push("Projected ROAS below 3x target");
    riskScore += 1;
  }

  // New campaign (no historical data)
  if (!campaign.id) {
    factors.push("New campaign with no historical data");
    riskScore += 1;
  }

  // Determine risk level
  let level: "low" | "medium" | "high";
  if (riskScore >= 4) {
    level = "high";
  } else if (riskScore >= 2) {
    level = "medium";
  } else {
    level = "low";
  }

  return { level, factors };
}

/**
 * Assess budget change risk
 *
 * @param currentBudget - Current daily budget
 * @param newBudget - Proposed daily budget
 * @returns Risk assessment
 */
function assessBudgetChangeRisk(
  currentBudget: number,
  newBudget: number,
): { level: "low" | "medium" | "high"; factors: string[] } {
  const factors: string[] = [];
  let riskScore = 0;

  const percentChange = Math.abs(
    ((newBudget - currentBudget) / currentBudget) * 100,
  );
  const isIncrease = newBudget > currentBudget;

  // Magnitude of change
  if (percentChange > 100) {
    factors.push(
      `Large ${isIncrease ? "increase" : "decrease"} (${percentChange.toFixed(0)}%)`,
    );
    riskScore += 2;
  } else if (percentChange > 50) {
    factors.push(
      `Moderate ${isIncrease ? "increase" : "decrease"} (${percentChange.toFixed(0)}%)`,
    );
    riskScore += 1;
  }

  // Absolute budget size
  if (newBudget > 1000) {
    factors.push("New budget >$1000/day");
    riskScore += 1;
  }

  // Increases are generally riskier than decreases
  if (isIncrease) {
    factors.push("Budget increase carries spend risk");
    riskScore += 1;
  }

  // Determine risk level
  let level: "low" | "medium" | "high";
  if (riskScore >= 3) {
    level = "high";
  } else if (riskScore >= 2) {
    level = "medium";
  } else {
    level = "low";
  }

  return { level, factors };
}

/**
 * Format approval request for display in approvals drawer
 *
 * @param request - Approval request
 * @returns Formatted display data
 */
export function formatApprovalForDisplay(request: AdsApprovalRequest): {
  title: string;
  summary: string;
  evidenceItems: string[];
  riskLevel: string;
  riskFactors: string[];
  rollbackPlan: string[];
} {
  let title = "";
  let summary = "";

  switch (request.type) {
    case "campaign_create":
      title = `Create Campaign: ${request.campaign.name || "Untitled"}`;
      summary = `Daily budget: $${request.campaign.dailyBudget || 0}\nProjected ROAS: ${request.evidence.projectedROAS?.toFixed(2) || "N/A"}x`;
      break;
    case "campaign_update":
      title = `Update Campaign: ${request.campaign.name || request.campaign.id}`;
      summary = `Updating campaign configuration`;
      break;
    case "campaign_pause":
      title = `Pause Campaign: ${request.campaign.name || request.campaign.id}`;
      summary = request.evidence.notes || "Pausing campaign";
      break;
    case "budget_change":
      title = `Budget Change: ${request.campaign.name || request.campaign.id}`;
      summary =
        request.evidence.notes ||
        `New budget: $${request.campaign.dailyBudget}`;
      break;
  }

  const evidenceItems: string[] = [];
  if (request.evidence.historicalData) {
    evidenceItems.push(
      `Historical ROAS: ${request.evidence.historicalData.roas.toFixed(2)}x`,
    );
    evidenceItems.push(
      `Historical CPC: $${request.evidence.historicalData.cpc.toFixed(2)}`,
    );
  }
  if (request.evidence.similarCampaigns) {
    evidenceItems.push(
      `${request.evidence.similarCampaigns.length} similar campaign(s) analyzed`,
    );
  }
  if (request.evidence.projectedROAS) {
    evidenceItems.push(
      `Projected ROAS: ${request.evidence.projectedROAS.toFixed(2)}x`,
    );
  }

  return {
    title,
    summary,
    evidenceItems,
    riskLevel: request.risk.level.toUpperCase(),
    riskFactors: request.risk.factors,
    rollbackPlan: request.rollback.actions,
  };
}
