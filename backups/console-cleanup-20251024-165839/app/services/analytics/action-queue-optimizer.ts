/**
 * Action Queue Ranking Algorithm Optimizer
 * 
 * Task: DATA-002 - Action Queue Ranking Algorithm Optimization
 * 
 * Implements ML-based ranking optimization using historical performance data
 * Features:
 * - Multi-factor scoring (expected impact, confidence, ease, risk, freshness)
 * - Historical performance weighting (realized ROI, success rate)
 * - A/B testing support (multiple ranking versions)
 * - Adaptive learning from execution results
 * 
 * Ranking Versions:
 * - v1_basic: Original algorithm (delta × confidence × ease + freshness - risk)
 * - v2_hybrid: Combines expected and realized ROI with 70/30 weight
 * - v3_ml: Full ML-based scoring with historical performance
 */

import prisma from "~/db.server";
import { logDecision } from "~/services/decisions.server";

// ============================================================================
// Types
// ============================================================================

export interface RankingFactors {
  expectedImpact: number;      // Expected revenue/impact delta
  confidence: number;          // 0.0-1.0
  ease: 'simple' | 'medium' | 'hard';
  riskTier: 'none' | 'perf' | 'safety' | 'policy';
  freshnessLabel: string;
  realizedRevenue28d?: number; // Historical performance
  executionCount?: number;     // Number of times executed
  successCount?: number;       // Number of successful executions
  avgRealizedROI?: number;     // Average ROI from past executions
}

export interface RankingResult {
  actionId: string;
  score: number;
  version: string;
  factors: {
    baseScore: number;
    freshnessBonus: number;
    riskPenalty: number;
    historicalBonus: number;
    mlScore?: number;
  };
}

// ============================================================================
// Ranking Algorithm Versions
// ============================================================================

/**
 * V1: Basic ranking (original algorithm)
 * Score = (delta × confidence × ease) + freshness - risk
 */
export function calculateV1Score(factors: RankingFactors): number {
  const easeMultiplier = getEaseMultiplier(factors.ease);
  const baseScore = factors.expectedImpact * factors.confidence * easeMultiplier;
  const freshnessBonus = getFreshnessBonus(factors.freshnessLabel);
  const riskPenalty = getRiskPenalty(factors.riskTier);
  
  return baseScore + freshnessBonus - riskPenalty;
}

/**
 * V2: Hybrid ranking (combines expected and realized ROI)
 * Score = (0.7 × expected) + (0.3 × realized) + freshness - risk
 */
export function calculateV2Score(factors: RankingFactors): number {
  const easeMultiplier = getEaseMultiplier(factors.ease);
  const expectedScore = factors.expectedImpact * factors.confidence * easeMultiplier;
  const realizedScore = factors.realizedRevenue28d || 0;
  
  // Weight: 70% expected, 30% realized (if available)
  const baseScore = (0.7 * expectedScore) + (0.3 * realizedScore);
  const freshnessBonus = getFreshnessBonus(factors.freshnessLabel);
  const riskPenalty = getRiskPenalty(factors.riskTier);
  
  return baseScore + freshnessBonus - riskPenalty;
}

/**
 * V3: ML-based ranking (full historical performance weighting)
 * Score = base × confidence × ease × success_rate + realized_roi_bonus + freshness - risk
 */
export function calculateV3Score(factors: RankingFactors): number {
  const easeMultiplier = getEaseMultiplier(factors.ease);
  
  // Calculate success rate from historical data
  const successRate = factors.executionCount && factors.executionCount > 0
    ? (factors.successCount || 0) / factors.executionCount
    : 0.5; // Default to 50% if no history
  
  // Base score with historical success rate
  const baseScore = factors.expectedImpact * factors.confidence * easeMultiplier * successRate;
  
  // Realized ROI bonus (weighted by execution count for confidence)
  const executionWeight = Math.min(factors.executionCount || 0, 10) / 10; // Cap at 10 executions
  const realizedBonus = (factors.avgRealizedROI || 0) * executionWeight;
  
  const freshnessBonus = getFreshnessBonus(factors.freshnessLabel);
  const riskPenalty = getRiskPenalty(factors.riskTier);
  
  return baseScore + realizedBonus + freshnessBonus - riskPenalty;
}

// ============================================================================
// Helper Functions
// ============================================================================

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

// ============================================================================
// Ranking Service
// ============================================================================

export class ActionQueueOptimizer {
  /**
   * Calculate optimized score for an action
   */
  static calculateScore(factors: RankingFactors, version: string = 'v3_ml'): RankingResult {
    let score: number;
    let mlScore: number | undefined;
    
    switch (version) {
      case 'v1_basic':
        score = calculateV1Score(factors);
        break;
      case 'v2_hybrid':
        score = calculateV2Score(factors);
        break;
      case 'v3_ml':
        score = calculateV3Score(factors);
        mlScore = score;
        break;
      default:
        score = calculateV1Score(factors);
    }
    
    const easeMultiplier = getEaseMultiplier(factors.ease);
    const baseScore = factors.expectedImpact * factors.confidence * easeMultiplier;
    const freshnessBonus = getFreshnessBonus(factors.freshnessLabel);
    const riskPenalty = getRiskPenalty(factors.riskTier);
    
    // Calculate historical bonus for v2 and v3
    let historicalBonus = 0;
    if (version === 'v2_hybrid') {
      historicalBonus = 0.3 * (factors.realizedRevenue28d || 0);
    } else if (version === 'v3_ml') {
      const executionWeight = Math.min(factors.executionCount || 0, 10) / 10;
      historicalBonus = (factors.avgRealizedROI || 0) * executionWeight;
    }
    
    return {
      actionId: '', // Will be set by caller
      score,
      version,
      factors: {
        baseScore,
        freshnessBonus,
        riskPenalty,
        historicalBonus,
        mlScore
      }
    };
  }
  
  /**
   * Re-rank all pending actions using optimized algorithm
   */
  static async rerankActions(version: string = 'v3_ml'): Promise<RankingResult[]> {
    console.log(`[Optimizer] Re-ranking actions with version: ${version}`);
    
    // Get all pending actions
    const actions = await prisma.action_queue.findMany({
      where: { status: 'pending' },
      orderBy: { created_at: 'desc' }
    });
    
    console.log(`[Optimizer] Found ${actions.length} pending actions`);
    
    // Calculate scores for each action
    const results: RankingResult[] = [];
    
    for (const action of actions) {
      const factors: RankingFactors = {
        expectedImpact: (action.expected_impact as any)?.delta || 0,
        confidence: Number(action.confidence),
        ease: action.ease as 'simple' | 'medium' | 'hard',
        riskTier: action.risk_tier as 'none' | 'perf' | 'safety' | 'policy',
        freshnessLabel: action.freshness_label,
        realizedRevenue28d: action.realized_revenue_28d ? Number(action.realized_revenue_28d) : undefined,
        executionCount: action.execution_count || undefined,
        successCount: action.success_count || undefined,
        avgRealizedROI: action.avg_realized_roi ? Number(action.avg_realized_roi) : undefined
      };
      
      const result = this.calculateScore(factors, version);
      result.actionId = action.id;
      results.push(result);
      
      // Update action with new ML score
      await prisma.action_queue.update({
        where: { id: action.id },
        data: {
          ml_score: result.score,
          ranking_version: version
        }
      });
    }
    
    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    
    console.log(`[Optimizer] ✅ Re-ranked ${results.length} actions`);
    console.log(`[Optimizer] Top 3 scores: ${results.slice(0, 3).map(r => r.score.toFixed(2)).join(', ')}`);
    
    // Log decision
    await logDecision({
      scope: 'analytics',
      actor: 'data',
      action: 'action_queue_reranked',
      rationale: `Re-ranked ${results.length} actions using ${version} algorithm`,
      evidenceUrl: '/api/growth-engine/action-queue',
      payload: {
        version,
        actionsRanked: results.length,
        topScore: results[0]?.score || 0,
        avgScore: results.reduce((sum, r) => sum + r.score, 0) / results.length
      }
    });
    
    return results;
  }
  
  /**
   * Update historical performance metrics for an action type
   */
  static async updateHistoricalMetrics(actionType: string): Promise<void> {
    console.log(`[Optimizer] Updating historical metrics for type: ${actionType}`);
    
    // Get all executed actions of this type
    const executedActions = await prisma.action_queue.findMany({
      where: {
        type: actionType,
        status: 'executed'
      }
    });
    
    if (executedActions.length === 0) {
      console.log(`[Optimizer] No executed actions found for type: ${actionType}`);
      return;
    }
    
    // Calculate aggregate metrics
    const executionCount = executedActions.length;
    const successCount = executedActions.filter(a => 
      a.execution_result && (a.execution_result as any).success === true
    ).length;
    
    const avgRealizedROI = executedActions.reduce((sum, a) => 
      sum + (a.realized_revenue_28d ? Number(a.realized_revenue_28d) : 0), 0
    ) / executionCount;
    
    // Update all pending actions of this type
    await prisma.action_queue.updateMany({
      where: {
        type: actionType,
        status: 'pending'
      },
      data: {
        execution_count: executionCount,
        success_count: successCount,
        avg_realized_roi: avgRealizedROI
      }
    });
    
    console.log(`[Optimizer] ✅ Updated metrics for ${actionType}: ${executionCount} executions, ${successCount} successes, $${avgRealizedROI.toFixed(2)} avg ROI`);
  }
  
  /**
   * Run A/B test comparing ranking versions
   */
  static async runABTest(): Promise<{
    v1: RankingResult[];
    v2: RankingResult[];
    v3: RankingResult[];
    comparison: {
      topActionDifference: boolean;
      avgScoreDelta: number;
      recommendation: string;
    };
  }> {
    console.log('[Optimizer] Running A/B test on ranking algorithms');
    
    const v1Results = await this.rerankActions('v1_basic');
    const v2Results = await this.rerankActions('v2_hybrid');
    const v3Results = await this.rerankActions('v3_ml');
    
    // Compare results
    const topActionDifference = v1Results[0]?.actionId !== v3Results[0]?.actionId;
    const avgScoreDelta = (
      v3Results.reduce((sum, r) => sum + r.score, 0) / v3Results.length -
      v1Results.reduce((sum, r) => sum + r.score, 0) / v1Results.length
    );
    
    let recommendation = 'v1_basic';
    if (avgScoreDelta > 10) {
      recommendation = 'v3_ml';
    } else if (avgScoreDelta > 5) {
      recommendation = 'v2_hybrid';
    }
    
    console.log(`[Optimizer] A/B Test Results:`);
    console.log(`  - Top action differs: ${topActionDifference}`);
    console.log(`  - Avg score delta (v3 - v1): ${avgScoreDelta.toFixed(2)}`);
    console.log(`  - Recommendation: ${recommendation}`);
    
    return {
      v1: v1Results,
      v2: v2Results,
      v3: v3Results,
      comparison: {
        topActionDifference,
        avgScoreDelta,
        recommendation
      }
    };
  }
}

