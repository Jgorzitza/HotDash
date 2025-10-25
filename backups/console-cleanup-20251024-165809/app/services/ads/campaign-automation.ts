/**
 * Campaign Automation Service
 *
 * Automates campaign management with HITL approval:
 * - Auto-pause low performers (CTR <1%, ROAS <1.0)
 * - Auto-increase budgets for high performers (ROAS >3.0)
 * - Keyword optimization (pause low CTR keywords)
 * - All actions require HITL approval before execution
 *
 * @module app/services/ads/campaign-automation
 */

import type {
  CampaignPerformance,
  CampaignSummary,
  KeywordPerformance,
} from "./types";

/**
 * Automation Action Type
 */
export type AutomationActionType =
  | "pause_campaign"
  | "resume_campaign"
  | "increase_budget"
  | "decrease_budget"
  | "pause_keyword"
  | "increase_bid"
  | "decrease_bid";

/**
 * Automation Action
 */
export interface AutomationAction {
  type: AutomationActionType;
  campaignId: string;
  campaignName: string;
  reason: string;
  evidence: {
    currentMetrics: Record<string, any>;
    threshold: Record<string, any>;
    projectedImpact: string;
  };
  actions: Array<{
    tool: string;
    args: Record<string, any>;
  }>;
  rollback: {
    description: string;
    actions: Array<{
      tool: string;
      args: Record<string, any>;
    }>;
  };
  requiresApproval: boolean;
  severity: "high" | "medium" | "low";
}

/**
 * Automation Thresholds
 */
export interface AutomationThresholds {
  pauseLowCtr: number; // Pause if CTR < X% (default: 1.0)
  pauseLowRoas: number; // Pause if ROAS < X (default: 1.0)
  increaseBudgetRoas: number; // Increase budget if ROAS > X (default: 3.0)
  decreaseBudgetRoas: number; // Decrease budget if ROAS < X (default: 1.5)
  pauseKeywordCtr: number; // Pause keyword if CTR < X% (default: 0.5)
  minSpendForAction: number; // Minimum spend (cents) before taking action (default: 5000)
}

/**
 * Default automation thresholds
 */
export const DEFAULT_AUTOMATION_THRESHOLDS: AutomationThresholds = {
  pauseLowCtr: 1.0,
  pauseLowRoas: 1.0,
  increaseBudgetRoas: 3.0,
  decreaseBudgetRoas: 1.5,
  pauseKeywordCtr: 0.5,
  minSpendForAction: 5000, // $50 minimum
};

/**
 * Identify campaigns that should be paused
 *
 * @param campaigns - Campaign performance data
 * @param thresholds - Automation thresholds
 * @returns Array of automation actions for pausing campaigns
 */
export function identifyPauseCandidates(
  campaigns: CampaignSummary[],
  thresholds: AutomationThresholds = DEFAULT_AUTOMATION_THRESHOLDS,
): AutomationAction[] {
  const actions: AutomationAction[] = [];

  for (const campaign of campaigns) {
    // Skip campaigns with low spend (not enough data)
    if (campaign.costCents < thresholds.minSpendForAction) {
      continue;
    }

    const ctrPercent = campaign.ctr * 100;
    const shouldPauseLowCtr = ctrPercent < thresholds.pauseLowCtr;
    const shouldPauseLowRoas =
      campaign.roas !== null && campaign.roas < thresholds.pauseLowRoas;

    if (shouldPauseLowCtr || shouldPauseLowRoas) {
      let reason = "";
      let severity: "high" | "medium" | "low" = "medium";

      if (shouldPauseLowCtr && shouldPauseLowRoas) {
        reason = `Low CTR (${ctrPercent.toFixed(2)}%) and poor ROAS (${campaign.roas?.toFixed(2)}x)`;
        severity = "high";
      } else if (shouldPauseLowCtr) {
        reason = `Low CTR (${ctrPercent.toFixed(2)}%) - below ${thresholds.pauseLowCtr}% threshold`;
        severity = "medium";
      } else {
        reason = `Poor ROAS (${campaign.roas?.toFixed(2)}x) - below ${thresholds.pauseLowRoas}x threshold`;
        severity = "high";
      }

      actions.push({
        type: "pause_campaign",
        campaignId: campaign.id,
        campaignName: campaign.name,
        reason,
        evidence: {
          currentMetrics: {
            ctr: ctrPercent,
            roas: campaign.roas,
            spend: campaign.costCents,
            conversions: campaign.conversions,
          },
          threshold: {
            minCtr: thresholds.pauseLowCtr,
            minRoas: thresholds.pauseLowRoas,
          },
          projectedImpact: `Stop wasting $${(campaign.costCents / 100).toFixed(2)}/day on underperforming campaign`,
        },
        actions: [
          {
            tool: "google-ads.campaign.pause",
            args: {
              campaignId: campaign.id,
            },
          },
        ],
        rollback: {
          description: "Resume campaign if paused incorrectly",
          actions: [
            {
              tool: "google-ads.campaign.resume",
              args: {
                campaignId: campaign.id,
              },
            },
          ],
        },
        requiresApproval: true,
        severity,
      });
    }
  }

  return actions;
}

/**
 * Identify campaigns eligible for budget increases
 *
 * @param campaigns - Campaign performance data
 * @param thresholds - Automation thresholds
 * @returns Array of automation actions for increasing budgets
 */
export function identifyBudgetIncreaseCandidates(
  campaigns: CampaignSummary[],
  thresholds: AutomationThresholds = DEFAULT_AUTOMATION_THRESHOLDS,
): AutomationAction[] {
  const actions: AutomationAction[] = [];

  for (const campaign of campaigns) {
    // Skip campaigns with low spend
    if (campaign.costCents < thresholds.minSpendForAction) {
      continue;
    }

    // Increase budget if ROAS is high
    if (
      campaign.roas !== null &&
      campaign.roas >= thresholds.increaseBudgetRoas
    ) {
      const currentBudget = campaign.costCents; // Simplified (actual would come from Campaign object)
      const proposedIncrease = Math.round(currentBudget * 0.2); // 20% increase
      const newBudget = currentBudget + proposedIncrease;
      const projectedRevenue = newBudget * campaign.roas;

      actions.push({
        type: "increase_budget",
        campaignId: campaign.id,
        campaignName: campaign.name,
        reason: `High ROAS (${campaign.roas.toFixed(2)}x) - scale up winning campaign`,
        evidence: {
          currentMetrics: {
            roas: campaign.roas,
            currentBudget,
            conversions: campaign.conversions,
            ctr: campaign.ctr * 100,
          },
          threshold: {
            minRoas: thresholds.increaseBudgetRoas,
          },
          projectedImpact: `+$${(proposedIncrease / 100).toFixed(2)}/day spend → +$${(projectedRevenue / 100).toFixed(2)}/day revenue`,
        },
        actions: [
          {
            tool: "google-ads.campaign.updateBudget",
            args: {
              campaignId: campaign.id,
              budgetMicros: newBudget * 10000, // Convert cents to micros
            },
          },
        ],
        rollback: {
          description: "Revert budget to previous level",
          actions: [
            {
              tool: "google-ads.campaign.updateBudget",
              args: {
                campaignId: campaign.id,
                budgetMicros: currentBudget * 10000,
              },
            },
          ],
        },
        requiresApproval: true,
        severity: "low",
      });
    }
  }

  return actions;
}

/**
 * Identify campaigns eligible for budget decreases
 *
 * @param campaigns - Campaign performance data
 * @param thresholds - Automation thresholds
 * @returns Array of automation actions for decreasing budgets
 */
export function identifyBudgetDecreaseCandidates(
  campaigns: CampaignSummary[],
  thresholds: AutomationThresholds = DEFAULT_AUTOMATION_THRESHOLDS,
): AutomationAction[] {
  const actions: AutomationAction[] = [];

  for (const campaign of campaigns) {
    // Skip campaigns with low spend
    if (campaign.costCents < thresholds.minSpendForAction) {
      continue;
    }

    // Decrease budget if ROAS is below target but not low enough to pause
    if (
      campaign.roas !== null &&
      campaign.roas < thresholds.decreaseBudgetRoas &&
      campaign.roas >= thresholds.pauseLowRoas
    ) {
      const currentBudget = campaign.costCents;
      const proposedDecrease = Math.round(currentBudget * 0.3); // 30% decrease
      const newBudget = currentBudget - proposedDecrease;

      actions.push({
        type: "decrease_budget",
        campaignId: campaign.id,
        campaignName: campaign.name,
        reason: `Below-target ROAS (${campaign.roas.toFixed(2)}x) - reduce spend to cut losses`,
        evidence: {
          currentMetrics: {
            roas: campaign.roas,
            currentBudget,
            conversions: campaign.conversions,
          },
          threshold: {
            targetRoas: thresholds.decreaseBudgetRoas,
          },
          projectedImpact: `-$${(proposedDecrease / 100).toFixed(2)}/day spend to improve efficiency`,
        },
        actions: [
          {
            tool: "google-ads.campaign.updateBudget",
            args: {
              campaignId: campaign.id,
              budgetMicros: newBudget * 10000,
            },
          },
        ],
        rollback: {
          description: "Restore original budget",
          actions: [
            {
              tool: "google-ads.campaign.updateBudget",
              args: {
                campaignId: campaign.id,
                budgetMicros: currentBudget * 10000,
              },
            },
          ],
        },
        requiresApproval: true,
        severity: "medium",
      });
    }
  }

  return actions;
}

/**
 * Identify keywords that should be paused
 *
 * @param keywords - Keyword performance data
 * @param thresholds - Automation thresholds
 * @returns Array of automation actions for pausing keywords
 */
export function identifyKeywordPauseCandidates(
  keywords: KeywordPerformance[],
  thresholds: AutomationThresholds = DEFAULT_AUTOMATION_THRESHOLDS,
): AutomationAction[] {
  const actions: AutomationAction[] = [];

  for (const keyword of keywords) {
    // Skip keywords with low impressions (not enough data)
    if (keyword.impressions < 500) {
      continue;
    }

    const ctr =
      keyword.impressions > 0
        ? (keyword.clicks / keyword.impressions) * 100
        : 0;

    if (ctr < thresholds.pauseKeywordCtr) {
      actions.push({
        type: "pause_keyword",
        campaignId: keyword.campaignId,
        campaignName: keyword.campaignName,
        reason: `Keyword "${keyword.keyword}" has low CTR (${ctr.toFixed(2)}%)`,
        evidence: {
          currentMetrics: {
            keyword: keyword.keyword,
            matchType: keyword.matchType,
            ctr,
            impressions: keyword.impressions,
            clicks: keyword.clicks,
            cost: keyword.costCents,
          },
          threshold: {
            minCtr: thresholds.pauseKeywordCtr,
          },
          projectedImpact: `Save $${(keyword.costCents / 100).toFixed(2)} from underperforming keyword`,
        },
        actions: [
          {
            tool: "google-ads.keyword.pause",
            args: {
              adGroupId: keyword.adGroupId,
              keyword: keyword.keyword,
              matchType: keyword.matchType,
            },
          },
        ],
        rollback: {
          description: "Resume keyword if paused incorrectly",
          actions: [
            {
              tool: "google-ads.keyword.resume",
              args: {
                adGroupId: keyword.adGroupId,
                keyword: keyword.keyword,
                matchType: keyword.matchType,
              },
            },
          ],
        },
        requiresApproval: true,
        severity: "low",
      });
    }
  }

  return actions;
}

/**
 * Generate all automation recommendations
 *
 * @param campaigns - Campaign performance data
 * @param keywords - Keyword performance data
 * @param thresholds - Custom automation thresholds
 * @returns Array of all automation actions requiring approval
 */
export function generateAutomationRecommendations(
  campaigns: CampaignSummary[],
  keywords: KeywordPerformance[],
  thresholds: AutomationThresholds = DEFAULT_AUTOMATION_THRESHOLDS,
): AutomationAction[] {
  const actions: AutomationAction[] = [];

  // Campaign-level actions
  actions.push(...identifyPauseCandidates(campaigns, thresholds));
  actions.push(...identifyBudgetIncreaseCandidates(campaigns, thresholds));
  actions.push(...identifyBudgetDecreaseCandidates(campaigns, thresholds));

  // Keyword-level actions
  actions.push(...identifyKeywordPauseCandidates(keywords, thresholds));

  // Sort by severity (high -> medium -> low)
  return actions.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Format automation action for approval queue
 *
 * Creates an approval record compatible with the centralized HITL workflow.
 *
 * @param action - Automation action
 * @returns Approval record formatted for /api/approvals
 */
export function formatForApprovalQueue(action: AutomationAction): {
  kind: "growth";
  summary: string;
  evidence: Record<string, any>;
  impact: Record<string, any>;
  risk: Record<string, any>;
  rollback: Record<string, any>;
  actions: Array<{ tool: string; args: Record<string, any> }>;
} {
  return {
    kind: "growth",
    summary: `${action.campaignName}: ${getActionSummary(action)}`,
    evidence: {
      action_type: action.type,
      reason: action.reason,
      current_metrics: action.evidence.currentMetrics,
      threshold: action.evidence.threshold,
    },
    impact: {
      projected: action.evidence.projectedImpact,
      severity: action.severity,
    },
    risk: {
      level: action.severity,
      mitigation: action.rollback.description,
    },
    rollback: {
      description: action.rollback.description,
      actions: action.rollback.actions,
    },
    actions: action.actions,
  };
}

/**
 * Get human-readable action summary
 */
function getActionSummary(action: AutomationAction): string {
  switch (action.type) {
    case "pause_campaign":
      return "Pause underperforming campaign";
    case "resume_campaign":
      return "Resume campaign";
    case "increase_budget":
      return "Increase budget for high performer";
    case "decrease_budget":
      return "Decrease budget to improve efficiency";
    case "pause_keyword":
      return `Pause low-performing keyword`;
    case "increase_bid":
      return "Increase keyword bid";
    case "decrease_bid":
      return "Decrease keyword bid";
    default:
      return "Unknown action";
  }
}

/**
 * Get automation statistics
 *
 * @param actions - Array of automation actions
 * @returns Statistics about recommended actions
 */
export function getAutomationStats(actions: AutomationAction[]): {
  total: number;
  byType: Record<AutomationActionType, number>;
  bySeverity: Record<"high" | "medium" | "low", number>;
  estimatedSavings: number;
  estimatedRevenue: number;
} {
  const byType: Record<string, number> = {};
  const bySeverity = { high: 0, medium: 0, low: 0 };
  let estimatedSavings = 0;
  let estimatedRevenue = 0;

  for (const action of actions) {
    // Count by type
    byType[action.type] = (byType[action.type] || 0) + 1;

    // Count by severity
    bySeverity[action.severity]++;

    // Estimate impact
    if (action.type === "pause_campaign" || action.type === "pause_keyword") {
      const currentCost =
        action.evidence.currentMetrics.cost ||
        action.evidence.currentMetrics.currentBudget ||
        0;
      estimatedSavings += currentCost;
    } else if (action.type === "increase_budget") {
      // Parse projected impact string
      const match = action.evidence.projectedImpact.match(
        /\+\$([0-9.]+)\/day revenue/,
      );
      if (match) {
        estimatedRevenue += parseFloat(match[1]) * 100; // Convert to cents
      }
    }
  }

  return {
    total: actions.length,
    byType: byType as Record<AutomationActionType, number>,
    bySeverity,
    estimatedSavings,
    estimatedRevenue,
  };
}
