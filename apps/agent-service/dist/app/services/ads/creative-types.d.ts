/**
 * Ad Creative Type Definitions
 *
 * Type definitions for ad creative optimization and image search integration.
 * Part of ADS-IMAGE-SEARCH-001: Use Image Search for Ad Creative Optimization
 *
 * @module app/services/ads/creative-types
 */
/**
 * Ad Platform
 */
export type AdPlatform = 'google' | 'facebook' | 'instagram';
/**
 * Ad Creative Format
 */
export type AdCreativeFormat = 'image' | 'carousel' | 'video' | 'story';
/**
 * Ad Placement
 */
export type AdPlacement = 'feed' | 'story' | 'search' | 'display' | 'shopping';
/**
 * Ad Creative Metadata
 *
 * Extended metadata for ad creative images stored in the image search system.
 * This metadata is stored in the customer_photos.metadata JSONB field.
 */
export interface AdCreativeMetadata {
    type: 'ad_creative';
    platform: AdPlatform;
    campaignId: string;
    campaignName: string;
    adGroupId?: string;
    adGroupName?: string;
    adId: string;
    adName?: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
    ctr: number;
    roas: number;
    cpc: number;
    cvr?: number;
    format: AdCreativeFormat;
    placement: AdPlacement;
    dimensions: {
        width: number;
        height: number;
    };
    dateRange: {
        start: string;
        end: string;
    };
    lastUpdated: string;
    targetAudience?: string;
    adCopy?: {
        headline?: string;
        description?: string;
    };
}
/**
 * Ad Creative Image
 *
 * Represents an ad creative image in the system.
 */
export interface AdCreativeImage {
    id: string;
    imageUrl: string;
    thumbnailUrl?: string;
    metadata: AdCreativeMetadata;
    description?: string;
    uploadedAt: string;
}
/**
 * Similar Creative Result
 *
 * Result from image similarity search.
 */
export interface SimilarCreative {
    imageId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    similarity: number;
    performance: AdCreativeMetadata;
    description?: string;
}
/**
 * Recommendation Action Type
 */
export type RecommendationAction = 'replicate' | 'test_variation' | 'scale_budget' | 'analyze_further';
/**
 * Ad Creative Recommendation
 *
 * Recommendation for optimizing ad creatives based on similar high performers.
 */
export interface AdCreativeRecommendation {
    imageId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    similarity: number;
    performance: AdCreativeMetadata;
    recommendation: {
        action: RecommendationAction;
        reason: string;
        projectedImpact: string;
        suggestedBudget?: number;
        confidence: number;
    };
}
/**
 * Creative Search Filters
 *
 * Filters for searching ad creatives.
 */
export interface CreativeSearchFilters {
    minRoas?: number;
    minCtr?: number;
    minConversions?: number;
    maxCpc?: number;
    platforms?: AdPlatform[];
    formats?: AdCreativeFormat[];
    placements?: AdPlacement[];
    dateRangeStart?: string;
    dateRangeEnd?: string;
    campaignIds?: string[];
    excludeCampaignIds?: string[];
}
/**
 * Creative Indexing Request
 *
 * Request to index an ad creative in the image search system.
 */
export interface CreativeIndexingRequest {
    platform: AdPlatform;
    adId: string;
    imageUrl: string;
    metadata: AdCreativeMetadata;
}
/**
 * Creative Indexing Result
 */
export interface CreativeIndexingResult {
    success: boolean;
    imageId?: string;
    error?: string;
    metadata?: {
        descriptionGenerated: boolean;
        embeddingGenerated: boolean;
        processingTime: number;
    };
}
/**
 * Batch Indexing Request
 */
export interface BatchIndexingRequest {
    platform: AdPlatform;
    campaignId: string;
    dateRange: {
        start: string;
        end: string;
    };
}
/**
 * Batch Indexing Result
 */
export interface BatchIndexingResult {
    totalRequested: number;
    successfullyIndexed: number;
    failed: number;
    errors: Array<{
        adId: string;
        error: string;
    }>;
    processingTime: number;
}
/**
 * Creative Search Request
 */
export interface CreativeSearchRequest {
    referenceImageId?: string;
    query?: string;
    filters?: CreativeSearchFilters;
    limit?: number;
    offset?: number;
}
/**
 * Creative Search Response
 */
export interface CreativeSearchResponse {
    results: SimilarCreative[];
    total: number;
    filters: CreativeSearchFilters;
    processingTime: number;
}
/**
 * Recommendation Request
 */
export interface RecommendationRequest {
    referenceImageId: string;
    minRoas?: number;
    minCtr?: number;
    minConversions?: number;
    limit?: number;
}
/**
 * Recommendation Response
 */
export interface RecommendationResponse {
    recommendations: AdCreativeRecommendation[];
    total: number;
    averageRoas: number;
    averageCtr: number;
    processingTime: number;
}
/**
 * Creative Performance Stats
 *
 * Aggregated performance statistics for a set of creatives.
 */
export interface CreativePerformanceStats {
    totalCreatives: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalSpend: number;
    totalRevenue: number;
    averageRoas: number;
    averageCtr: number;
    averageCpc: number;
    topPerformers: Array<{
        imageId: string;
        roas: number;
        ctr: number;
    }>;
}
/**
 * Creative Optimization Insight
 *
 * Insights derived from analyzing creative performance patterns.
 */
export interface CreativeOptimizationInsight {
    type: 'format' | 'placement' | 'audience' | 'timing' | 'creative_element';
    insight: string;
    evidence: {
        sampleSize: number;
        averageRoas: number;
        comparisonRoas: number;
        lift: number;
    };
    recommendation: string;
}
//# sourceMappingURL=creative-types.d.ts.map