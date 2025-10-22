/**
 * Growth Engine Action Queue Infrastructure
 * 
 * Implements the unified Action Queue system for Growth Engine phases 9-12
 * Provides standardized contract for all specialist agents to emit actions
 */

export interface ActionQueueItem {
  id: string;
  type: string; // seo_fix, perf_task, inventory_risk, content_draft, etc.
  target: string; // page/SKU/collection/customer-safe-id
  draft: string; // what will change (human-readable)
  evidence: {
    mcp_request_ids: string[];
    dataset_links: string[];
    telemetry_refs: string[];
  };
  expected_impact: {
    metric: string; // revenue, CTR, conversion, etc.
    delta: number; // projected change
    unit: string; // $, %, sessions
  };
  confidence: number; // 0.0-1.0
  ease: 'simple' | 'medium' | 'hard';
  risk_tier: 'policy' | 'safety' | 'perf' | 'none';
  can_execute: boolean; // policy-gated
  rollback_plan: string; // one-liner
  freshness_label: string; // "GSC 48-72h lag", "Real-time", etc.
  created_at: string; // ISO timestamp
  agent: string; // which agent created this action
}

/**
 * Ranking algorithm for Action Queue
 * Primary: Expected Revenue × Confidence × Ease
 * Tie-breaker 1: Freshness (newer data ranks higher)
 * Tie-breaker 2: Risk tier (lower risk ranks higher)
 */
export function calculateActionScore(action: ActionQueueItem): number {
  const baseScore = action.expected_impact.delta * action.confidence * getEaseMultiplier(action.ease);
  
  // Freshness bonus (newer = higher score)
  const freshnessBonus = getFreshnessBonus(action.freshness_label);
  
  // Risk penalty (lower risk = higher score)
  const riskPenalty = getRiskPenalty(action.risk_tier);
  
  return baseScore + freshnessBonus - riskPenalty;
}

function getEaseMultiplier(ease: string): number {
  switch (ease) {
    case 'simple': return 1.0;
    case 'medium': return 0.7;
    case 'hard': return 0.4;
    default: return 0.5;
  }
}

function getFreshnessBonus(freshness: string): number {
  if (freshness.includes('Real-time')) return 10;
  if (freshness.includes('24h')) return 8;
  if (freshness.includes('48-72h')) return 5;
  return 0;
}

function getRiskPenalty(risk: string): number {
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
export function getTopActions(actions: ActionQueueItem[], limit: number = 10): ActionQueueItem[] {
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
export function createActionItem(
  type: string,
  target: string,
  draft: string,
  evidence: ActionQueueItem['evidence'],
  expectedImpact: ActionQueueItem['expected_impact'],
  confidence: number,
  ease: ActionQueueItem['ease'],
  riskTier: ActionQueueItem['risk_tier'],
  canExecute: boolean,
  rollbackPlan: string,
  freshnessLabel: string,
  agent: string
): ActionQueueItem {
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
export function validateActionItem(action: ActionQueueItem): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!action.type) errors.push('Type is required');
  if (!action.target) errors.push('Target is required');
  if (!action.draft) errors.push('Draft is required');
  if (!action.evidence.mcp_request_ids.length) errors.push('At least one MCP request ID is required');
  if (action.confidence < 0 || action.confidence > 1) errors.push('Confidence must be between 0 and 1');
  if (!['simple', 'medium', 'hard'].includes(action.ease)) errors.push('Ease must be simple, medium, or hard');
  if (!['policy', 'safety', 'perf', 'none'].includes(action.risk_tier)) errors.push('Invalid risk tier');
  if (!action.rollback_plan) errors.push('Rollback plan is required');
  if (!action.freshness_label) errors.push('Freshness label is required');
  
  return {
    valid: errors.length === 0,
    errors
  };
}
