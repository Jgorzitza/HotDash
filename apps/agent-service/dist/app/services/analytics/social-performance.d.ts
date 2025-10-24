/**
 * Social Post Performance Tracking Service
 *
 * Tracks Publer post metrics: impressions, clicks, engagement
 * Calculates CTR and engagement rate
 * Stores in DashboardFact table with factType="social_performance"
 */
export interface SocialMetrics {
    impressions: number;
    clicks: number;
    engagement: number;
    ctr: number;
    engagementRate: number;
}
export interface SocialPerformanceData {
    postId: string;
    platform: string;
    publishedAt: Date;
    metrics: SocialMetrics;
    metadata?: Record<string, any>;
}
/**
 * Track social post performance metrics
 * Fetches from Publer API and stores in DashboardFact
 */
export declare function trackSocialPostPerformance(postId: string, shopDomain?: string): Promise<SocialPerformanceData>;
/**
 * Get social performance metrics for a project
 * Returns aggregated metrics across all posts
 */
export declare function getSocialPerformanceSummary(shopDomain?: string, platform?: string, days?: number): Promise<{
    totalImpressions: number;
    totalClicks: number;
    totalEngagement: number;
    avgCtr: number;
    avgEngagementRate: number;
    postCount: number;
}>;
//# sourceMappingURL=social-performance.d.ts.map