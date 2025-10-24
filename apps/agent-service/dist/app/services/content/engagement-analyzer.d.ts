/**
 * Engagement Analysis Service
 *
 * Analyzes historical content performance to provide insights for:
 * - Optimal posting times
 * - High-performing hashtags
 * - Content patterns that drive engagement
 * - Platform-specific best practices
 */
import type { SocialPlatform, ContentPerformance } from "../../lib/content/tracking";
/**
 * Engagement insights derived from historical data
 */
export interface EngagementInsights {
    platform: SocialPlatform;
    totalPosts: number;
    averageEngagementRate: number;
    topPerformingHashtags: string[];
    bestPostingTimes: {
        dayOfWeek: string;
        timeOfDay: string;
        timezone: string;
    };
    contentPatterns: {
        pattern: string;
        avgEngagement: number;
        sampleSize: number;
    }[];
    recommendations: string[];
}
/**
 * Hashtag performance metrics
 */
export interface HashtagPerformance {
    hashtag: string;
    usageCount: number;
    averageEngagementRate: number;
    averageReach: number;
    trending: boolean;
}
/**
 * Time-based performance analysis
 */
export interface TimePerformance {
    hour: number;
    dayOfWeek: number;
    averageEngagementRate: number;
    postCount: number;
}
/**
 * Content pattern analysis
 */
export interface ContentPattern {
    type: "question" | "emoji" | "link" | "mention" | "long-form" | "short-form";
    description: string;
    averageEngagementRate: number;
    sampleSize: number;
    recommendation: string;
}
/**
 * Analyze engagement patterns for a specific platform
 *
 * NOTE: This is a placeholder implementation. In production, this would:
 * 1. Query Supabase for historical post performance
 * 2. Aggregate metrics by hashtag, time, content type
 * 3. Apply statistical analysis for significance
 * 4. Return actionable insights
 */
export declare function analyzeEngagementPatterns(platform: SocialPlatform, dateRange?: {
    start: string;
    end: string;
}): Promise<EngagementInsights>;
/**
 * Analyze hashtag performance across posts
 */
export declare function analyzeHashtagPerformance(platform: SocialPlatform, limit?: number): Promise<HashtagPerformance[]>;
/**
 * Analyze optimal posting times based on historical engagement
 */
export declare function analyzePostingTimes(platform: SocialPlatform): Promise<TimePerformance[]>;
/**
 * Identify content patterns that drive engagement
 */
export declare function analyzeContentPatterns(platform: SocialPlatform): Promise<ContentPattern[]>;
/**
 * Compare performance across platforms
 */
export declare function comparePlatformPerformance(): Promise<{
    platforms: Record<SocialPlatform, {
        averageEngagementRate: number;
        averageReach: number;
        totalPosts: number;
    }>;
    recommendations: string[];
}>;
/**
 * Get engagement insights for a specific post
 */
export declare function getPostInsights(postId: string, platform: SocialPlatform): Promise<{
    performance: ContentPerformance | null;
    insights: {
        performanceVsAverage: number;
        topPerformingElements: string[];
        improvementSuggestions: string[];
    };
}>;
/**
 * Predict engagement for a draft post
 */
export declare function predictEngagement(content: string, platform: SocialPlatform, hashtags: string[]): Promise<{
    estimatedEngagementRate: number;
    estimatedReach: number;
    confidence: number;
    factors: {
        factor: string;
        impact: "positive" | "negative" | "neutral";
        weight: number;
    }[];
}>;
/**
 * Calculate engagement rate from metrics
 */
export declare function calculateEngagementRate(likes: number, comments: number, shares: number, impressions: number): number;
/**
 * Determine if a hashtag is trending
 */
export declare function isTrendingHashtag(hashtag: string, recentUsage: number, historicalAverage: number): boolean;
/**
 * Multi-platform engagement metrics
 */
export interface MultiPlatformMetrics {
    platforms: {
        [K in SocialPlatform]: {
            totalPosts: number;
            averageEngagementRate: number;
            totalReach: number;
            totalImpressions: number;
            growthRate: number;
            trendScore: number;
        };
    };
    overall: {
        totalPosts: number;
        averageEngagementRate: number;
        totalReach: number;
        bestPerformingPlatform: SocialPlatform;
        worstPerformingPlatform: SocialPlatform;
    };
    trends: {
        platform: SocialPlatform;
        direction: "up" | "down" | "stable";
        change: number;
        significance: "high" | "medium" | "low";
    }[];
}
/**
 * Aggregate metrics across all platforms
 *
 * NOTE: This is a placeholder implementation. In production, this would:
 * 1. Query Supabase for all platform metrics
 * 2. Calculate aggregated statistics
 * 3. Compute growth rates and trends
 * 4. Return comprehensive multi-platform view
 */
export declare function aggregateMultiPlatformMetrics(dateRange: {
    start: string;
    end: string;
}): Promise<MultiPlatformMetrics>;
/**
 * Trend score components
 */
export interface TrendScoreComponents {
    engagementTrend: number;
    reachTrend: number;
    growthMomentum: number;
    consistency: number;
    totalScore: number;
    grade: "A" | "B" | "C" | "D" | "F";
}
/**
 * Calculate trend score for a platform
 *
 * Scoring algorithm:
 * - Engagement trend (0-25): Week-over-week engagement rate change
 * - Reach trend (0-25): Week-over-week reach growth
 * - Growth momentum (0-25): Acceleration of growth (second derivative)
 * - Consistency (0-25): Standard deviation of engagement rates
 *
 * Total score (0-100):
 * - 90-100: A (Excellent, strong upward trend)
 * - 80-89: B (Good, positive trend)
 * - 70-79: C (Average, stable)
 * - 60-69: D (Below average, declining)
 * - 0-59: F (Poor, significant decline)
 */
export declare function calculateTrendScore(currentWeekMetrics: {
    engagementRate: number;
    reach: number;
    posts: number;
}, previousWeekMetrics: {
    engagementRate: number;
    reach: number;
    posts: number;
}, twoWeeksAgoMetrics: {
    engagementRate: number;
    reach: number;
    posts: number;
}): TrendScoreComponents;
/**
 * Get trend analysis for all platforms
 */
export declare function getTrendAnalysis(dateRange: {
    start: string;
    end: string;
}): Promise<{
    platform: SocialPlatform;
    trendScore: TrendScoreComponents;
    recommendation: string;
}[]>;
/**
 * Get day of week name from number
 */
export declare function getDayName(dayNumber: number): string;
/**
 * Format time for display
 */
export declare function formatTime(hour: number): string;
/**
 * Calculate statistical significance
 */
export declare function isStatisticallySignificant(sampleSize: number, minSampleSize?: number): boolean;
/**
 * Normalize engagement rate for comparison
 */
export declare function normalizeEngagementRate(rate: number, platform: SocialPlatform): number;
//# sourceMappingURL=engagement-analyzer.d.ts.map