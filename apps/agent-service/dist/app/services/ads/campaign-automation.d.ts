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
import type { CampaignSummary, KeywordPerformance } from "./types";
/**
 * Automation Action Type
 */
export type AutomationActionType = "pause_campaign" | "resume_campaign" | "increase_budget" | "decrease_budget" | "pause_keyword" | "increase_bid" | "decrease_bid";
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
    pauseLowCtr: number;
    pauseLowRoas: number;
    increaseBudgetRoas: number;
    decreaseBudgetRoas: number;
    pauseKeywordCtr: number;
    minSpendForAction: number;
}
/**
 * Default automation thresholds
 */
export declare const DEFAULT_AUTOMATION_THRESHOLDS: AutomationThresholds;
/**
 * Identify campaigns that should be paused
 *
 * @param campaigns - Campaign performance data
 * @param thresholds - Automation thresholds
 * @returns Array of automation actions for pausing campaigns
 */
export declare function identifyPauseCandidates(campaigns: CampaignSummary[], thresholds?: AutomationThresholds): AutomationAction[];
/**
 * Identify campaigns eligible for budget increases
 *
 * @param campaigns - Campaign performance data
 * @param thresholds - Automation thresholds
 * @returns Array of automation actions for increasing budgets
 */
export declare function identifyBudgetIncreaseCandidates(campaigns: CampaignSummary[], thresholds?: AutomationThresholds): AutomationAction[];
/**
 * Identify campaigns eligible for budget decreases
 *
 * @param campaigns - Campaign performance data
 * @param thresholds - Automation thresholds
 * @returns Array of automation actions for decreasing budgets
 */
export declare function identifyBudgetDecreaseCandidates(campaigns: CampaignSummary[], thresholds?: AutomationThresholds): AutomationAction[];
/**
 * Identify keywords that should be paused
 *
 * @param keywords - Keyword performance data
 * @param thresholds - Automation thresholds
 * @returns Array of automation actions for pausing keywords
 */
export declare function identifyKeywordPauseCandidates(keywords: KeywordPerformance[], thresholds?: AutomationThresholds): AutomationAction[];
/**
 * Generate all automation recommendations
 *
 * @param campaigns - Campaign performance data
 * @param keywords - Keyword performance data
 * @param thresholds - Custom automation thresholds
 * @returns Array of all automation actions requiring approval
 */
export declare function generateAutomationRecommendations(campaigns: CampaignSummary[], keywords: KeywordPerformance[], thresholds?: AutomationThresholds): AutomationAction[];
/**
 * Format automation action for approval queue
 *
 * Creates an approval record compatible with the centralized HITL workflow.
 *
 * @param action - Automation action
 * @returns Approval record formatted for /api/approvals
 */
export declare function formatForApprovalQueue(action: AutomationAction): {
    kind: "growth";
    summary: string;
    evidence: Record<string, any>;
    impact: Record<string, any>;
    risk: Record<string, any>;
    rollback: Record<string, any>;
    actions: Array<{
        tool: string;
        args: Record<string, any>;
    }>;
};
/**
 * Get automation statistics
 *
 * @param actions - Array of automation actions
 * @returns Statistics about recommended actions
 */
export declare function getAutomationStats(actions: AutomationAction[]): {
    total: number;
    byType: Record<AutomationActionType, number>;
    bySeverity: Record<"high" | "medium" | "low", number>;
    estimatedSavings: number;
    estimatedRevenue: number;
};
//# sourceMappingURL=campaign-automation.d.ts.map