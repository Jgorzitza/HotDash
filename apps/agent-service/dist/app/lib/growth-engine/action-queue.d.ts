/**
 * Growth Engine Action Queue Infrastructure
 *
 * Implements the unified Action Queue system for Growth Engine phases 9-12
 * Provides standardized contract for all specialist agents to emit actions
 *
 * Updated: DATA-002 - Added attribution tracking and ML-based ranking
 */
export interface ActionQueueItem {
    id: string;
    type: string;
    target: string;
    draft: string;
    evidence: {
        mcp_request_ids: string[];
        dataset_links: string[];
        telemetry_refs: string[];
    };
    expected_impact: {
        metric: string;
        delta: number;
        unit: string;
    };
    confidence: number;
    ease: 'simple' | 'medium' | 'hard';
    risk_tier: 'policy' | 'safety' | 'perf' | 'none';
    can_execute: boolean;
    rollback_plan: string;
    freshness_label: string;
    created_at: string;
    agent: string;
    action_key?: string;
    expected_revenue?: number;
    realized_revenue_7d?: number;
    realized_revenue_14d?: number;
    realized_revenue_28d?: number;
    conversion_rate?: number;
    execution_count?: number;
    success_count?: number;
    avg_realized_roi?: number;
    ml_score?: number;
    ranking_version?: string;
}
/**
 * Ranking algorithm for Action Queue (v1_basic)
 * Primary: Expected Revenue × Confidence × Ease
 * Tie-breaker 1: Freshness (newer data ranks higher)
 * Tie-breaker 2: Risk tier (lower risk ranks higher)
 *
 * NOTE: This is the basic v1 algorithm. For optimized ML-based ranking,
 * use ActionQueueOptimizer from app/services/analytics/action-queue-optimizer.ts
 * which implements v2_hybrid and v3_ml algorithms with historical performance data.
 */
export declare function calculateActionScore(action: ActionQueueItem): number;
/**
 * Get top-ranked actions for display
 */
export declare function getTopActions(actions: ActionQueueItem[], limit?: number): ActionQueueItem[];
/**
 * Create action queue item from specialist agent
 */
export declare function createActionItem(type: string, target: string, draft: string, evidence: ActionQueueItem['evidence'], expectedImpact: ActionQueueItem['expected_impact'], confidence: number, ease: ActionQueueItem['ease'], riskTier: ActionQueueItem['risk_tier'], canExecute: boolean, rollbackPlan: string, freshnessLabel: string, agent: string): ActionQueueItem;
/**
 * Validate action queue item
 */
export declare function validateActionItem(action: ActionQueueItem): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=action-queue.d.ts.map