/**
 * User Segmentation Service
 *
 * Segments users by behavior patterns into categories.
 * Enables targeted recommendations and personalization.
 *
 * Segment Types:
 * - Power Users: High engagement, daily usage
 * - Casual Users: Moderate engagement, weekly usage
 * - New Users: Recently signed up, low usage
 * - Churned Users: No activity in 30+ days
 */
export type UserSegment = "power" | "casual" | "new" | "churned";
export interface UserSegmentData {
    userId: string;
    segment: UserSegment;
    engagementScore: number;
    lastActiveDate: Date;
    signupDate: Date | null;
    totalSessions: number;
    avgSessionDuration: number;
    featuresUsed: number;
    approvalCount: number;
    tileClicksPerSession: number;
}
export interface SegmentAnalytics {
    segment: UserSegment;
    userCount: number;
    percentage: number;
    avgEngagementScore: number;
    avgSessionsPerUser: number;
    characteristics: string[];
    recommendations: string[];
}
export interface EngagementScoreFactors {
    recency: number;
    frequency: number;
    depth: number;
    value: number;
}
export declare class UserSegmentationService {
    /**
     * Calculate user engagement score (0-100)
     *
     * Uses RFM-inspired model:
     * - Recency: How recently user was active (30%)
     * - Frequency: How often user visits (30%)
     * - Depth: How many features user uses (20%)
     * - Value: How many approvals user makes (20%)
     *
     * @param userId - User identifier
     * @param lookbackDays - Days to analyze (default: 30)
     * @returns Engagement score (0-100)
     */
    calculateEngagementScore(userId: string, lookbackDays?: number): Promise<number>;
    /**
     * Get engagement score factors
     *
     * @param userId - User identifier
     * @param startDate - Start of analysis period
     * @returns Engagement score factors
     */
    getEngagementFactors(userId: string, startDate: Date): Promise<EngagementScoreFactors>;
    /**
     * Segment user based on engagement
     *
     * Segmentation logic:
     * - Power: Score >= 70, active in last 7 days
     * - Casual: Score 40-69, active in last 14 days
     * - New: Signup date < 7 days ago
     * - Churned: No activity in 30+ days
     *
     * @param userId - User identifier
     * @returns User segment
     */
    segmentUser(userId: string): Promise<UserSegment>;
    /**
     * Get user segment data with details
     *
     * @param userId - User identifier
     * @returns Complete user segment data
     */
    getUserSegmentData(userId: string): Promise<UserSegmentData>;
    /**
     * Get segment analytics
     *
     * Aggregates analytics for each user segment.
     *
     * @returns Array of segment analytics
     */
    getSegmentAnalytics(): Promise<SegmentAnalytics[]>;
    /**
     * Get segment characteristics
     *
     * @param segment - User segment
     * @returns Array of characteristics
     */
    private getSegmentCharacteristics;
    /**
     * Get segment-specific recommendations
     *
     * @param segment - User segment
     * @returns Array of recommendations
     */
    private getSegmentRecommendations;
    /**
     * Get user first activity date
     *
     * @param userId - User identifier
     * @returns First activity date or null
     */
    private getUserFirstActivity;
}
export declare const userSegmentationService: UserSegmentationService;
//# sourceMappingURL=user-segmentation.d.ts.map