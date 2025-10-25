/**
 * AI-Powered Ad Optimization
 *
 * ADS-005: AI-driven ad optimization with automated bidding and performance analysis
 * Provides intelligent bid adjustments, audience targeting, and budget allocation
 */
import type { CampaignSummary, CampaignPerformance } from '~/services/ads/types';
/**
 * AI Optimization Recommendation
 */
export interface AIOptimizationRecommendation {
    campaignId: string;
    campaignName: string;
    type: 'bid_adjustment' | 'audience_targeting' | 'budget_allocation' | 'creative_optimization';
    action: string;
    confidence: number;
    expectedImpact: {
        metric: 'roas' | 'ctr' | 'cpc' | 'conversions';
        currentValue: number;
        projectedValue: number;
        improvement: number;
    };
    reasoning: string;
    evidence: {
        historicalData: Record<string, any>;
        marketTrends: Record<string, any>;
        competitorInsights?: Record<string, any>;
    };
    priority: 'high' | 'medium' | 'low';
    estimatedROI: number;
}
/**
 * Audience Targeting Recommendation
 */
export interface AudienceTargetingRecommendation {
    campaignId: string;
    campaignName: string;
    audienceSegment: {
        demographics: {
            ageRange?: string;
            gender?: string;
            location?: string[];
        };
        interests: string[];
        behaviors: string[];
        customAudiences?: string[];
    };
    expectedPerformance: {
        estimatedCTR: number;
        estimatedConversionRate: number;
        estimatedROAS: number;
    };
    confidence: number;
    reasoning: string;
}
/**
 * Bid Adjustment Recommendation
 */
export interface BidAdjustmentRecommendation {
    campaignId: string;
    campaignName: string;
    currentBid: number;
    recommendedBid: number;
    adjustment: number;
    reasoning: string;
    confidence: number;
    expectedImpact: {
        clicks: number;
        conversions: number;
        roas: number;
    };
}
/**
 * Budget Allocation Recommendation
 */
export interface BudgetAllocationRecommendation {
    totalBudget: number;
    allocations: Array<{
        campaignId: string;
        campaignName: string;
        currentBudget: number;
        recommendedBudget: number;
        change: number;
        reasoning: string;
        expectedROAS: number;
    }>;
    projectedTotalROAS: number;
    confidence: number;
}
/**
 * AI Optimization Configuration
 */
export interface AIOptimizerConfig {
    bidAdjustment: {
        enabled: boolean;
        maxAdjustmentPercent: number;
        minConfidence: number;
        learningRate: number;
    };
    audienceTargeting: {
        enabled: boolean;
        minAudienceSize: number;
        maxAudiences: number;
    };
    budgetAllocation: {
        enabled: boolean;
        rebalanceThreshold: number;
        minBudgetPerCampaign: number;
    };
    performanceThresholds: {
        minROAS: number;
        minCTR: number;
        maxCPC: number;
    };
}
/**
 * Default AI Optimizer Configuration
 */
export declare const DEFAULT_AI_OPTIMIZER_CONFIG: AIOptimizerConfig;
/**
 * Generate AI-powered bid adjustment recommendations
 *
 * Uses historical performance data and machine learning patterns to recommend
 * optimal bid adjustments for each campaign.
 */
export declare function generateBidAdjustmentRecommendations(campaigns: CampaignSummary[], performances: CampaignPerformance[], config?: AIOptimizerConfig): BidAdjustmentRecommendation[];
/**
 * Generate AI-powered audience targeting recommendations
 *
 * Analyzes campaign performance to identify high-performing audience segments
 * and recommend new targeting strategies.
 */
export declare function generateAudienceTargetingRecommendations(campaigns: CampaignSummary[], performances: CampaignPerformance[], config?: AIOptimizerConfig): AudienceTargetingRecommendation[];
/**
 * Generate AI-powered budget allocation recommendations
 *
 * Optimizes budget distribution across campaigns based on performance data
 * to maximize overall ROAS.
 */
export declare function generateBudgetAllocationRecommendations(campaigns: CampaignSummary[], totalBudget: number, config?: AIOptimizerConfig): BudgetAllocationRecommendation;
/**
 * Generate comprehensive AI optimization recommendations
 *
 * Combines bid adjustments, audience targeting, and budget allocation
 * into a unified set of recommendations.
 */
export declare function generateAIOptimizationRecommendations(campaigns: CampaignSummary[], performances: CampaignPerformance[], totalBudget: number, config?: AIOptimizerConfig): {
    bidAdjustments: BidAdjustmentRecommendation[];
    audienceTargeting: AudienceTargetingRecommendation[];
    budgetAllocation: BudgetAllocationRecommendation;
    summary: {
        totalRecommendations: number;
        highPriorityCount: number;
        projectedROASImprovement: number;
        confidence: number;
    };
};
//# sourceMappingURL=ai-optimizer.d.ts.map