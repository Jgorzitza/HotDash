/**
 * Ad Creative Indexing Service
 *
 * Indexes ad creative images into the image search system for optimization.
 * Fetches ad creatives from Google Ads and Facebook Ads, downloads images,
 * and uploads them to the image search system with performance metadata.
 *
 * Part of ADS-IMAGE-SEARCH-001: Use Image Search for Ad Creative Optimization
 *
 * @module app/services/ads/creative-indexing
 */
import type { CreativeIndexingRequest, CreativeIndexingResult, BatchIndexingRequest, BatchIndexingResult } from './creative-types';
/**
 * Index a single ad creative in the image search system
 *
 * @param request - Creative indexing request
 * @returns Indexing result with image ID
 *
 * @example
 * ```typescript
 * const result = await indexAdCreative({
 *   platform: 'google',
 *   adId: 'ad_123',
 *   imageUrl: 'https://example.com/ad-image.jpg',
 *   metadata: {
 *     type: 'ad_creative',
 *     platform: 'google',
 *     campaignId: 'campaign_456',
 *     campaignName: 'Summer Sale',
 *     adId: 'ad_123',
 *     impressions: 10000,
 *     clicks: 500,
 *     conversions: 25,
 *     spend: 5000, // cents
 *     revenue: 12500, // cents
 *     ctr: 0.05,
 *     roas: 2.5,
 *     cpc: 10, // cents
 *     format: 'image',
 *     placement: 'search',
 *     dimensions: { width: 1200, height: 628 },
 *     dateRange: { start: '2025-10-01', end: '2025-10-24' },
 *     lastUpdated: new Date().toISOString(),
 *   }
 * });
 * ```
 */
export declare function indexAdCreative(request: CreativeIndexingRequest): Promise<CreativeIndexingResult>;
/**
 * Batch index ad creatives for a campaign
 *
 * @param request - Batch indexing request
 * @returns Batch indexing result with success/failure counts
 *
 * @example
 * ```typescript
 * const result = await batchIndexCreatives({
 *   platform: 'google',
 *   campaignId: 'campaign_456',
 *   dateRange: {
 *     start: '2025-10-01',
 *     end: '2025-10-24',
 *   },
 * });
 * ```
 */
export declare function batchIndexCreatives(request: BatchIndexingRequest): Promise<BatchIndexingResult>;
/**
 * Re-index existing creatives with updated performance data
 *
 * @param imageIds - Array of image IDs to re-index
 * @param dateRange - New date range for performance metrics
 * @returns Batch indexing result
 */
export declare function reindexCreatives(imageIds: string[], dateRange: {
    start: string;
    end: string;
}): Promise<BatchIndexingResult>;
/**
 * Delete indexed creative from image search system
 *
 * @param imageId - Image ID to delete
 * @returns Success status
 */
export declare function deleteIndexedCreative(imageId: string): Promise<boolean>;
//# sourceMappingURL=creative-indexing.d.ts.map