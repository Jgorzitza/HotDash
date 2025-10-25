/**
 * Content Performance Tracking Library
 *
 * Provides content performance metrics for social media posts across multiple platforms:
 * - Instagram, Facebook, TikTok
 * - Engagement metrics (likes, comments, shares, saves)
 * - Reach and impressions
 * - Click-through rate
 * - Conversion tracking
 *
 * Designed for future HITL social posting workflow.
 */
/**
 * Supported social media platforms
 */
export type SocialPlatform = "instagram" | "facebook" | "tiktok";
/**
 * Content post data structure
 */
export interface ContentPost {
    id: string;
    platform: SocialPlatform;
    content: string;
    mediaUrls?: string[];
    publishedAt: string;
    status: "draft" | "scheduled" | "published" | "failed";
    metadata?: {
        hashtags?: string[];
        mentions?: string[];
        location?: string;
    };
}
/**
 * Engagement metrics for a content post
 */
export interface EngagementMetrics {
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
    engagementRate: number;
}
/**
 * Reach and impression metrics
 */
export interface ReachMetrics {
    impressions: number;
    reach: number;
    uniqueViews?: number;
}
/**
 * Click-through metrics
 */
export interface ClickMetrics {
    clicks: number;
    clickThroughRate: number;
    linkClicks?: number;
    profileClicks?: number;
}
/**
 * Conversion metrics for content posts
 */
export interface ConversionMetrics {
    conversions: number;
    conversionRate: number;
    revenue?: number;
    averageOrderValue?: number;
}
/**
 * Complete performance metrics for a content post
 */
export interface ContentPerformance {
    postId: string;
    platform: SocialPlatform;
    publishedAt: string;
    engagement: EngagementMetrics;
    reach: ReachMetrics;
    clicks: ClickMetrics;
    conversions?: ConversionMetrics;
    period: {
        start: string;
        end: string;
    };
}
/**
 * Aggregated performance metrics across multiple posts
 */
export interface AggregatedPerformance {
    totalPosts: number;
    platforms: Record<SocialPlatform, number>;
    totalEngagement: {
        likes: number;
        comments: number;
        shares: number;
        saves: number;
    };
    averageEngagementRate: number;
    totalReach: number;
    totalImpressions: number;
    totalClicks: number;
    averageClickThroughRate: number;
    totalConversions: number;
    totalRevenue: number;
    period: {
        start: string;
        end: string;
    };
}
/**
 * Calculate engagement rate for a post
 * Formula: (likes + comments + shares + saves) / impressions * 100
 */
export declare function calculateEngagementRate(engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
}, impressions: number): number;
/**
 * Calculate click-through rate
 * Formula: clicks / impressions * 100
 */
export declare function calculateClickThroughRate(clicks: number, impressions: number): number;
/**
 * Calculate conversion rate
 * Formula: conversions / clicks * 100
 */
export declare function calculateConversionRate(conversions: number, clicks: number): number;
/**
 * Get performance metrics for a specific content post
 *
 * NOTE: This is a placeholder implementation. In production, this would:
 * 1. Fetch data from Publer API or platform-specific APIs
 * 2. Query Supabase for stored metrics
 * 3. Correlate with GA4 conversion data
 */
export declare function getContentPerformance(postId: string, platform: SocialPlatform): Promise<ContentPerformance>;
/**
 * Get aggregated performance metrics for a date range
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param platform - Optional platform filter
 */
export declare function getAggregatedPerformance(startDate: string, endDate: string, platform?: SocialPlatform): Promise<AggregatedPerformance>;
/**
 * Get top performing posts for a date range
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param limit - Number of top posts to return
 * @param sortBy - Metric to sort by
 */
export declare function getTopPerformingPosts(startDate: string, endDate: string, limit?: number, sortBy?: "engagement" | "reach" | "clicks" | "conversions"): Promise<ContentPerformance[]>;
//# sourceMappingURL=tracking.d.ts.map