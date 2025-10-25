/**
 * Ad Creative Search Service
 *
 * Searches for similar ad creatives using the image search system.
 * Filters results by performance metrics and generates recommendations.
 *
 * Part of ADS-IMAGE-SEARCH-001: Use Image Search for Ad Creative Optimization
 *
 * @module app/services/ads/creative-search
 */
import type { SimilarCreative, CreativeSearchRequest, CreativeSearchResponse, CreativeSearchFilters, RecommendationRequest, RecommendationResponse } from './creative-types';
/**
 * Search for similar ad creatives by reference image
 *
 * @param request - Creative search request
 * @returns Search response with similar creatives
 *
 * @example
 * ```typescript
 * const response = await searchSimilarCreatives({
 *   referenceImageId: 'img_123',
 *   filters: {
 *     minRoas: 2.0,
 *     minCtr: 0.02,
 *     platforms: ['google', 'facebook'],
 *   },
 *   limit: 10,
 * });
 * ```
 */
export declare function searchSimilarCreatives(request: CreativeSearchRequest): Promise<CreativeSearchResponse>;
/**
 * Find similar high-performing ad creatives
 *
 * @param request - Recommendation request
 * @returns Recommendations with actionable insights
 *
 * @example
 * ```typescript
 * const response = await findSimilarHighPerformers({
 *   referenceImageId: 'img_123',
 *   minRoas: 2.5,
 *   minCtr: 0.03,
 *   limit: 5,
 * });
 * ```
 */
export declare function findSimilarHighPerformers(request: RecommendationRequest): Promise<RecommendationResponse>;
/**
 * Search for creatives by text query
 *
 * @param query - Text search query (e.g., "red shoes", "summer sale")
 * @param filters - Optional performance filters
 * @param limit - Maximum results to return
 * @returns Search response with matching creatives
 *
 * @example
 * ```typescript
 * const response = await searchCreativesByText(
 *   'red shoes on white background',
 *   { minRoas: 2.0 },
 *   10
 * );
 * ```
 */
export declare function searchCreativesByText(query: string, filters?: CreativeSearchFilters, limit?: number): Promise<CreativeSearchResponse>;
/**
 * Get top performing creatives across all campaigns
 *
 * @param filters - Performance filters
 * @param limit - Maximum results to return
 * @returns Array of top performing creatives
 *
 * @example
 * ```typescript
 * const topCreatives = await getTopPerformingCreatives(
 *   { minRoas: 3.0, platforms: ['google'] },
 *   20
 * );
 * ```
 */
export declare function getTopPerformingCreatives(filters: CreativeSearchFilters, limit?: number): Promise<SimilarCreative[]>;
/**
 * Compare two creatives for A/B testing insights
 *
 * @param imageIdA - First creative image ID
 * @param imageIdB - Second creative image ID
 * @returns Comparison insights
 */
export declare function compareCreatives(imageIdA: string, imageIdB: string): Promise<{
    creativeA: SimilarCreative;
    creativeB: SimilarCreative;
    winner: 'A' | 'B' | 'tie';
    insights: string[];
}>;
//# sourceMappingURL=creative-search.d.ts.map