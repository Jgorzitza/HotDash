/**
 * Social Post Performance Tracking Service
 *
 * ANALYTICS-006: Track Publer metrics for social media performance
 *
 * Features:
 * - Track social post metrics (likes, shares, comments, reach)
 * - Calculate engagement rates
 * - Monitor performance trends
 * - Export metrics for dashboard
 */
export interface SocialPostMetrics {
    postId: string;
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
    content: string;
    publishedAt: string;
    metrics: {
        likes: number;
        shares: number;
        comments: number;
        reach: number;
        impressions: number;
        clicks: number;
        engagement: number;
    };
    performance: {
        engagementRate: number;
        clickThroughRate: number;
        reachRate: number;
    };
    trend: {
        engagementChange: number;
        reachChange: number;
        clicksChange: number;
    };
}
export interface SocialPerformanceSummary {
    totalPosts: number;
    totalReach: number;
    totalEngagement: number;
    averageEngagementRate: number;
    topPerformingPost: SocialPostMetrics | null;
    platformBreakdown: {
        platform: string;
        posts: number;
        reach: number;
        engagement: number;
        avgEngagementRate: number;
    }[];
    period: {
        start: string;
        end: string;
    };
}
/**
 * Track social post performance metrics
 *
 * ANALYTICS-006: Core function for social media performance tracking
 *
 * @param postId - Unique post identifier
 * @param platform - Social media platform
 * @param content - Post content
 * @param publishedAt - Publication timestamp
 * @param metrics - Raw metrics from Publer
 * @returns SocialPostMetrics
 */
export declare function trackSocialPostPerformanceV2(postId: string, platform: SocialPostMetrics['platform'], content: string, publishedAt: string, metrics: {
    likes: number;
    shares: number;
    comments: number;
    reach: number;
    impressions: number;
    clicks: number;
}): SocialPostMetrics;
/**
 * Calculate social performance summary for a period
 *
 * ANALYTICS-006: Aggregate social media performance metrics
 *
 * @param posts - Array of social post metrics
 * @param startDate - Period start date
 * @param endDate - Period end date
 * @returns SocialPerformanceSummary
 */
export declare function calculateSocialPerformanceSummary(posts: SocialPostMetrics[], startDate: string, endDate: string): SocialPerformanceSummary;
/**
 * Track social post performance trends
 *
 * ANALYTICS-006: Calculate performance changes over time
 *
 * @param currentPosts - Current period posts
 * @param previousPosts - Previous period posts
 * @returns Updated posts with trend data
 */
export declare function calculateSocialPerformanceTrends(currentPosts: SocialPostMetrics[], previousPosts: SocialPostMetrics[]): SocialPostMetrics[];
/**
 * Export social performance data for dashboard
 *
 * ANALYTICS-006: Format data for dashboard display
 *
 * @param summary - Social performance summary
 * @returns Formatted data for dashboard
 */
export declare function exportSocialPerformanceData(summary: SocialPerformanceSummary): {
    metrics: {
        totalPosts: number;
        totalReach: number;
        totalEngagement: number;
        averageEngagementRate: number;
    };
    topPost: {
        platform: "facebook" | "instagram" | "twitter" | "linkedin" | "tiktok";
        content: string;
        engagement: number;
        engagementRate: number;
    };
    platforms: {
        name: string;
        posts: number;
        reach: number;
        engagement: number;
        engagementRate: number;
    }[];
    period: {
        start: string;
        end: string;
    };
};
//# sourceMappingURL=socialPerformance.d.ts.map