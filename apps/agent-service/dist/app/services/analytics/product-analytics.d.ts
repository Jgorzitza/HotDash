/**
 * Product Analytics Service
 *
 * Tracks product feature usage and provides insights for product decisions.
 * Based on: docs/directions/product.md (PRODUCT-011)
 *
 * Features:
 * - Event tracking (feature usage, tile clicks, modal actions)
 * - Feature adoption metrics (% users using each feature)
 * - Top features identification
 * - Unused features detection
 * - Engagement analytics
 */
export interface FeatureUsageEvent {
    userId: string;
    featureName: string;
    action: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export interface FeatureAdoptionMetrics {
    featureName: string;
    totalUsers: number;
    activeUsers: number;
    adoptionRate: number;
    firstUsed: Date | null;
    lastUsed: Date | null;
    usageCount: number;
    avgUsagePerUser: number;
}
export interface TileEngagementMetrics {
    tileName: string;
    clickCount: number;
    viewCount: number;
    clickRate: number;
    avgTimeToClick: number;
    modalOpenRate: number;
}
export interface ModalActionMetrics {
    modalType: string;
    approveCount: number;
    rejectCount: number;
    skipCount: number;
    approvalRate: number;
    avgDecisionTime: number;
}
export interface SettingsChangeMetrics {
    settingName: string;
    changeCount: number;
    uniqueUsers: number;
    popularValues: {
        value: string;
        count: number;
    }[];
}
export declare class ProductAnalyticsService {
    /**
     * Track feature usage event
     *
     * Records when a user uses a feature.
     * Stored in DashboardFact with category "product_analytics".
     *
     * @param event - Feature usage event data
     */
    trackFeatureUsage(event: FeatureUsageEvent): Promise<void>;
    /**
     * Get feature adoption metrics
     *
     * Calculates adoption rate for each feature:
     * - Total users in system
     * - Users who used feature at least once
     * - Adoption rate (% of users)
     *
     * @param startDate - Start of analysis period
     * @param endDate - End of analysis period
     * @returns Array of feature adoption metrics
     */
    getFeatureAdoptionMetrics(startDate: Date, endDate: Date): Promise<FeatureAdoptionMetrics[]>;
    /**
     * Get tile engagement metrics
     *
     * Analyzes tile clicks and views to calculate engagement.
     *
     * @param startDate - Start of analysis period
     * @param endDate - End of analysis period
     * @returns Array of tile engagement metrics
     */
    getTileEngagementMetrics(startDate: Date, endDate: Date): Promise<TileEngagementMetrics[]>;
    /**
     * Get modal action metrics
     *
     * Analyzes approve/reject rates for different modal types.
     *
     * @param startDate - Start of analysis period
     * @param endDate - End of analysis period
     * @returns Array of modal action metrics
     */
    getModalActionMetrics(startDate: Date, endDate: Date): Promise<ModalActionMetrics[]>;
    /**
     * Get settings change metrics
     *
     * Analyzes which settings users change most frequently.
     *
     * @param startDate - Start of analysis period
     * @param endDate - End of analysis period
     * @returns Array of settings change metrics
     */
    getSettingsChangeMetrics(startDate: Date, endDate: Date): Promise<SettingsChangeMetrics[]>;
    /**
     * Identify top features by usage
     *
     * Returns most-used features ranked by adoption rate.
     *
     * @param limit - Number of top features to return (default: 10)
     * @param startDate - Start of analysis period
     * @param endDate - End of analysis period
     * @returns Array of top features
     */
    getTopFeatures(limit?: number, startDate?: Date, endDate?: Date): Promise<FeatureAdoptionMetrics[]>;
    /**
     * Identify unused features
     *
     * Returns features with low adoption (<10%) or no recent usage.
     *
     * @param threshold - Adoption rate threshold (default: 0.10 = 10%)
     * @param startDate - Start of analysis period
     * @param endDate - End of analysis period
     * @returns Array of unused features
     */
    getUnusedFeatures(threshold?: number, startDate?: Date, endDate?: Date): Promise<FeatureAdoptionMetrics[]>;
    /**
     * Generate product insights
     *
     * Provides actionable insights based on analytics data.
     *
     * @param startDate - Start of analysis period
     * @param endDate - End of analysis period
     * @returns Array of insights with recommendations
     */
    generateInsights(startDate: Date, endDate: Date): Promise<Array<{
        type: string;
        message: string;
        recommendation: string;
    }>>;
}
export declare const productAnalyticsService: ProductAnalyticsService;
//# sourceMappingURL=product-analytics.d.ts.map