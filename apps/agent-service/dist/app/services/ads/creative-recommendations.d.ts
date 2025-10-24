/**
 * Ad Creative Recommendations Service
 *
 * Generates recommendations for ad creative optimization based on
 * similar high-performing creatives found via image search.
 *
 * Part of ADS-IMAGE-SEARCH-001: Use Image Search for Ad Creative Optimization
 *
 * @module app/services/ads/creative-recommendations
 */
import type { SimilarCreative, AdCreativeRecommendation, CreativePerformanceStats, CreativeOptimizationInsight } from './creative-types';
/**
 * Recommendation Thresholds
 *
 * Performance thresholds for generating different recommendation actions.
 */
export interface RecommendationThresholds {
    exceptional: {
        minRoas: number;
        minCtr: number;
        minConversions: number;
    };
    strong: {
        minRoas: number;
        minCtr: number;
        minConversions: number;
    };
    good: {
        minRoas: number;
        minCtr: number;
        minConversions: number;
    };
    minSimilarity: number;
}
/**
 * Default recommendation thresholds
 */
export declare const DEFAULT_THRESHOLDS: RecommendationThresholds;
/**
 * Generate recommendation for a similar creative
 *
 * @param creative - Similar creative from image search
 * @param thresholds - Custom thresholds (optional)
 * @returns Ad creative recommendation
 */
export declare function generateRecommendation(creative: SimilarCreative, thresholds?: RecommendationThresholds): AdCreativeRecommendation;
/**
 * Generate recommendations for multiple similar creatives
 *
 * @param creatives - Array of similar creatives
 * @param thresholds - Custom thresholds (optional)
 * @returns Array of recommendations sorted by confidence
 */
export declare function generateRecommendations(creatives: SimilarCreative[], thresholds?: RecommendationThresholds): AdCreativeRecommendation[];
/**
 * Calculate performance statistics for a set of creatives
 *
 * @param creatives - Array of similar creatives
 * @returns Performance statistics
 */
export declare function calculatePerformanceStats(creatives: SimilarCreative[]): CreativePerformanceStats;
/**
 * Generate optimization insights from creative performance patterns
 *
 * @param creatives - Array of similar creatives
 * @returns Array of optimization insights
 */
export declare function generateOptimizationInsights(creatives: SimilarCreative[]): CreativeOptimizationInsight[];
//# sourceMappingURL=creative-recommendations.d.ts.map