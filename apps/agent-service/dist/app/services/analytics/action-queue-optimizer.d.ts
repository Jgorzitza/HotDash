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
export interface RankingFactors {
    expectedImpact: number;
    confidence: number;
    ease: 'simple' | 'medium' | 'hard';
    riskTier: 'none' | 'perf' | 'safety' | 'policy';
    freshnessLabel: string;
    realizedRevenue28d?: number;
    executionCount?: number;
    successCount?: number;
    avgRealizedROI?: number;
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
/**
 * V1: Basic ranking (original algorithm)
 * Score = (delta × confidence × ease) + freshness - risk
 */
export declare function calculateV1Score(factors: RankingFactors): number;
/**
 * V2: Hybrid ranking (combines expected and realized ROI)
 * Score = (0.7 × expected) + (0.3 × realized) + freshness - risk
 */
export declare function calculateV2Score(factors: RankingFactors): number;
/**
 * V3: ML-based ranking (full historical performance weighting)
 * Score = base × confidence × ease × success_rate + realized_roi_bonus + freshness - risk
 */
export declare function calculateV3Score(factors: RankingFactors): number;
export declare class ActionQueueOptimizer {
    /**
     * Calculate optimized score for an action
     */
    static calculateScore(factors: RankingFactors, version?: string): RankingResult;
    /**
     * Re-rank all pending actions using optimized algorithm
     */
    static rerankActions(version?: string): Promise<RankingResult[]>;
    /**
     * Update historical performance metrics for an action type
     */
    static updateHistoricalMetrics(actionType: string): Promise<void>;
    /**
     * Run A/B test comparing ranking versions
     */
    static runABTest(): Promise<{
        v1: RankingResult[];
        v2: RankingResult[];
        v3: RankingResult[];
        comparison: {
            topActionDifference: boolean;
            avgScoreDelta: number;
            recommendation: string;
        };
    }>;
}
//# sourceMappingURL=action-queue-optimizer.d.ts.map