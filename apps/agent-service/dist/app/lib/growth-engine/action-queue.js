/**
 * Growth Engine Action Queue Infrastructure
 *
 * Implements the unified Action Queue system for Growth Engine phases 9-12
 * Provides standardized contract for all specialist agents to emit actions
 *
 * Updated: DATA-002 - Added attribution tracking and ML-based ranking
 */
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
export function calculateActionScore(action) {
    const baseScore = action.expected_impact.delta * action.confidence * getEaseMultiplier(action.ease);
    // Freshness bonus (newer = higher score)
    const freshnessBonus = getFreshnessBonus(action.freshness_label);
    // Risk penalty (lower risk = higher score)
    const riskPenalty = getRiskPenalty(action.risk_tier);
    return baseScore + freshnessBonus - riskPenalty;
}
function getEaseMultiplier(ease) {
    switch (ease) {
        case 'simple': return 1.0;
        case 'medium': return 0.7;
        case 'hard': return 0.4;
        default: return 0.5;
    }
}
function getFreshnessBonus(freshness) {
    if (freshness.includes('Real-time'))
        return 10;
    if (freshness.includes('24h'))
        return 8;
    if (freshness.includes('48-72h'))
        return 5;
    return 0;
}
function getRiskPenalty(risk) {
    switch (risk) {
        case 'none': return 0;
        case 'perf': return 2;
        case 'safety': return 5;
        case 'policy': return 10;
        default: return 3;
    }
}
/**
 * Get top-ranked actions for display
 */
export function getTopActions(actions, limit = 10) {
    return actions
        .map(action => ({
        ...action,
        score: calculateActionScore(action)
    }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}
/**
 * Create action queue item from specialist agent
 */
export function createActionItem(type, target, draft, evidence, expectedImpact, confidence, ease, riskTier, canExecute, rollbackPlan, freshnessLabel, agent) {
    return {
        id: `${type}-${target}-${Date.now()}`,
        type,
        target,
        draft,
        evidence,
        expected_impact: expectedImpact,
        confidence,
        ease,
        risk_tier: riskTier,
        can_execute: canExecute,
        rollback_plan: rollbackPlan,
        freshness_label: freshnessLabel,
        created_at: new Date().toISOString(),
        agent
    };
}
/**
 * Validate action queue item
 */
export function validateActionItem(action) {
    const errors = [];
    if (!action.type)
        errors.push('Type is required');
    if (!action.target)
        errors.push('Target is required');
    if (!action.draft)
        errors.push('Draft is required');
    if (!action.evidence.mcp_request_ids.length)
        errors.push('At least one MCP request ID is required');
    if (action.confidence < 0 || action.confidence > 1)
        errors.push('Confidence must be between 0 and 1');
    if (!['simple', 'medium', 'hard'].includes(action.ease))
        errors.push('Ease must be simple, medium, or hard');
    if (!['policy', 'safety', 'perf', 'none'].includes(action.risk_tier))
        errors.push('Invalid risk tier');
    if (!action.rollback_plan)
        errors.push('Rollback plan is required');
    if (!action.freshness_label)
        errors.push('Freshness label is required');
    return {
        valid: errors.length === 0,
        errors
    };
}
//# sourceMappingURL=action-queue.js.map