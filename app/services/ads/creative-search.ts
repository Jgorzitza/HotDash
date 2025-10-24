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

import type {
  SimilarCreative,
  AdCreativeRecommendation,
  CreativeSearchRequest,
  CreativeSearchResponse,
  CreativeSearchFilters,
  RecommendationRequest,
  RecommendationResponse,
  AdCreativeMetadata,
} from './creative-types';
import { generateRecommendations, calculatePerformanceStats } from './creative-recommendations';

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
export async function searchSimilarCreatives(
  request: CreativeSearchRequest
): Promise<CreativeSearchResponse> {
  const startTime = Date.now();

  try {
    let searchResults: any[];

    // 1. Search by reference image or text query
    if (request.referenceImageId) {
      // Image-to-image search
      const response = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/search/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: request.referenceImageId,
          limit: (request.limit || 10) * 2, // Get more to filter
          project: 'occ',
        }),
      });

      if (!response.ok) {
        throw new Error(`Image search failed: ${response.statusText}`);
      }

      const data = await response.json();
      searchResults = data.results || [];
    } else if (request.query) {
      // Text-to-image search
      const response = await fetch(
        `${process.env.APP_URL || 'http://localhost:3000'}/api/search/images?q=${encodeURIComponent(request.query)}&limit=${(request.limit || 10) * 2}&project=occ`
      );

      if (!response.ok) {
        throw new Error(`Image search failed: ${response.statusText}`);
      }

      const data = await response.json();
      searchResults = data.results || [];
    } else {
      throw new Error('Either referenceImageId or query must be provided');
    }

    // 2. Filter by performance metrics
    const filtered = filterByPerformance(searchResults, request.filters);

    // 3. Transform to SimilarCreative format
    const results: SimilarCreative[] = filtered.map(result => ({
      imageId: result.photoId || result.id,
      imageUrl: result.imageUrl,
      thumbnailUrl: result.thumbnailUrl,
      similarity: result.similarity,
      performance: (result.metadata || {}) as AdCreativeMetadata,
      description: result.description,
    }));

    return {
      results: results.slice(0, request.limit || 10),
      total: results.length,
      filters: request.filters || {},
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    throw new Error(
      `Creative search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

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
export async function findSimilarHighPerformers(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const startTime = Date.now();

  try {
    // 1. Search for similar creatives
    const searchResponse = await searchSimilarCreatives({
      referenceImageId: request.referenceImageId,
      filters: {
        minRoas: request.minRoas,
        minCtr: request.minCtr,
        minConversions: request.minConversions,
      },
      limit: (request.limit || 10) * 2, // Get more to filter
    });

    // 2. Generate recommendations
    const recommendations = generateRecommendations(searchResponse.results);

    // 3. Calculate stats
    const stats = calculatePerformanceStats(searchResponse.results);

    return {
      recommendations: recommendations.slice(0, request.limit || 10),
      total: recommendations.length,
      averageRoas: stats.averageRoas,
      averageCtr: stats.averageCtr,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    throw new Error(
      `Failed to find high performers: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

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
export async function searchCreativesByText(
  query: string,
  filters?: CreativeSearchFilters,
  limit: number = 10
): Promise<CreativeSearchResponse> {
  return searchSimilarCreatives({
    query,
    filters,
    limit,
  });
}

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
export async function getTopPerformingCreatives(
  filters: CreativeSearchFilters,
  limit: number = 20
): Promise<SimilarCreative[]> {
  // TODO: Implement when ENG-IMAGE-SEARCH-003 completes
  // Query database directly for top performers
  // ORDER BY roas DESC, ctr DESC
  
  throw new Error('Not implemented - waiting on ENG-IMAGE-SEARCH-003');
}

/**
 * Filter search results by performance metrics
 * 
 * @param results - Raw search results from image search API
 * @param filters - Performance filters to apply
 * @returns Filtered results
 * 
 * @private
 */
function filterByPerformance(
  results: any[],
  filters?: CreativeSearchFilters
): any[] {
  if (!filters) return results;
  
  return results.filter(result => {
    const metadata = result.metadata as AdCreativeMetadata;
    
    // Check if it's an ad creative
    if (metadata.type !== 'ad_creative') return false;
    
    // Apply performance filters
    if (filters.minRoas && metadata.roas < filters.minRoas) return false;
    if (filters.minCtr && metadata.ctr < filters.minCtr) return false;
    if (filters.minConversions && metadata.conversions < filters.minConversions) return false;
    if (filters.maxCpc && metadata.cpc > filters.maxCpc) return false;
    
    // Apply platform filters
    if (filters.platforms && !filters.platforms.includes(metadata.platform)) return false;
    if (filters.formats && !filters.formats.includes(metadata.format)) return false;
    if (filters.placements && !filters.placements.includes(metadata.placement)) return false;
    
    // Apply date filters
    if (filters.dateRangeStart && metadata.dateRange.start < filters.dateRangeStart) return false;
    if (filters.dateRangeEnd && metadata.dateRange.end > filters.dateRangeEnd) return false;
    
    // Apply campaign filters
    if (filters.campaignIds && !filters.campaignIds.includes(metadata.campaignId)) return false;
    if (filters.excludeCampaignIds && filters.excludeCampaignIds.includes(metadata.campaignId)) return false;
    
    return true;
  });
}

/**
 * Compare two creatives for A/B testing insights
 * 
 * @param imageIdA - First creative image ID
 * @param imageIdB - Second creative image ID
 * @returns Comparison insights
 */
export async function compareCreatives(
  imageIdA: string,
  imageIdB: string
): Promise<{
  creativeA: SimilarCreative;
  creativeB: SimilarCreative;
  winner: 'A' | 'B' | 'tie';
  insights: string[];
}> {
  // TODO: Implement when ENG-IMAGE-SEARCH-003 completes
  // 1. Fetch both creatives
  // 2. Compare performance metrics
  // 3. Generate insights
  
  throw new Error('Not implemented - waiting on ENG-IMAGE-SEARCH-003');
}

