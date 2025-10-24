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
export function trackSocialPostPerformanceV2(postId, platform, content, publishedAt, metrics) {
    // Calculate engagement (likes + shares + comments)
    const engagement = metrics.likes + metrics.shares + metrics.comments;
    // Calculate performance rates
    const engagementRate = metrics.reach > 0 ? (engagement / metrics.reach) * 100 : 0;
    const clickThroughRate = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
    const reachRate = metrics.impressions > 0 ? (metrics.reach / metrics.impressions) * 100 : 0;
    return {
        postId,
        platform,
        content,
        publishedAt,
        metrics: {
            ...metrics,
            engagement,
        },
        performance: {
            engagementRate,
            clickThroughRate,
            reachRate,
        },
        trend: {
            engagementChange: 0, // Will be calculated by comparing with historical data
            reachChange: 0,
            clicksChange: 0,
        },
    };
}
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
export function calculateSocialPerformanceSummary(posts, startDate, endDate) {
    if (posts.length === 0) {
        return {
            totalPosts: 0,
            totalReach: 0,
            totalEngagement: 0,
            averageEngagementRate: 0,
            topPerformingPost: null,
            platformBreakdown: [],
            period: { start: startDate, end: endDate },
        };
    }
    // Calculate totals
    const totalReach = posts.reduce((sum, post) => sum + post.metrics.reach, 0);
    const totalEngagement = posts.reduce((sum, post) => sum + post.metrics.engagement, 0);
    const averageEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;
    // Find top performing post
    const topPerformingPost = posts.reduce((top, post) => post.metrics.engagement > (top?.metrics.engagement || 0) ? post : top);
    // Calculate platform breakdown
    const platformStats = new Map();
    posts.forEach(post => {
        const platform = post.platform;
        const existing = platformStats.get(platform) || {
            posts: 0,
            reach: 0,
            engagement: 0,
            totalEngagementRate: 0,
        };
        platformStats.set(platform, {
            posts: existing.posts + 1,
            reach: existing.reach + post.metrics.reach,
            engagement: existing.engagement + post.metrics.engagement,
            totalEngagementRate: existing.totalEngagementRate + post.performance.engagementRate,
        });
    });
    const platformBreakdown = Array.from(platformStats.entries()).map(([platform, stats]) => ({
        platform,
        posts: stats.posts,
        reach: stats.reach,
        engagement: stats.engagement,
        avgEngagementRate: stats.posts > 0 ? stats.totalEngagementRate / stats.posts : 0,
    }));
    return {
        totalPosts: posts.length,
        totalReach,
        totalEngagement,
        averageEngagementRate,
        topPerformingPost,
        platformBreakdown,
        period: { start: startDate, end: endDate },
    };
}
/**
 * Track social post performance trends
 *
 * ANALYTICS-006: Calculate performance changes over time
 *
 * @param currentPosts - Current period posts
 * @param previousPosts - Previous period posts
 * @returns Updated posts with trend data
 */
export function calculateSocialPerformanceTrends(currentPosts, previousPosts) {
    // Create a map of previous posts for comparison
    const previousMap = new Map();
    previousPosts.forEach(post => {
        previousMap.set(post.postId, post);
    });
    return currentPosts.map(post => {
        const previousPost = previousMap.get(post.postId);
        if (!previousPost) {
            return post; // No previous data to compare
        }
        // Calculate trend changes
        const engagementChange = calculatePercentageChange(post.metrics.engagement, previousPost.metrics.engagement);
        const reachChange = calculatePercentageChange(post.metrics.reach, previousPost.metrics.reach);
        const clicksChange = calculatePercentageChange(post.metrics.clicks, previousPost.metrics.clicks);
        return {
            ...post,
            trend: {
                engagementChange,
                reachChange,
                clicksChange,
            },
        };
    });
}
/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current, previous) {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
}
/**
 * Export social performance data for dashboard
 *
 * ANALYTICS-006: Format data for dashboard display
 *
 * @param summary - Social performance summary
 * @returns Formatted data for dashboard
 */
export function exportSocialPerformanceData(summary) {
    return {
        metrics: {
            totalPosts: summary.totalPosts,
            totalReach: summary.totalReach,
            totalEngagement: summary.totalEngagement,
            averageEngagementRate: Math.round(summary.averageEngagementRate * 100) / 100,
        },
        topPost: summary.topPerformingPost ? {
            platform: summary.topPerformingPost.platform,
            content: summary.topPerformingPost.content.substring(0, 100) + '...',
            engagement: summary.topPerformingPost.metrics.engagement,
            engagementRate: Math.round(summary.topPerformingPost.performance.engagementRate * 100) / 100,
        } : null,
        platforms: summary.platformBreakdown.map(platform => ({
            name: platform.platform,
            posts: platform.posts,
            reach: platform.reach,
            engagement: platform.engagement,
            engagementRate: Math.round(platform.avgEngagementRate * 100) / 100,
        })),
        period: summary.period,
    };
}
//# sourceMappingURL=socialPerformance.js.map