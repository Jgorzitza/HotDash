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
// ============================================================================
// User Segmentation Service Class
// ============================================================================
export class UserSegmentationService {
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
    async calculateEngagementScore(userId, lookbackDays = 30) {
        const startDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
        const factors = await this.getEngagementFactors(userId, startDate);
        // Recency score (0-30 points): Lower days = higher score
        const recencyScore = Math.max(0, 30 - factors.recency);
        // Frequency score (0-30 points): More sessions = higher score
        const frequencyScore = Math.min(30, factors.frequency * 5); // 6+ sessions/week = 30 points
        // Depth score (0-20 points): More features = higher score
        const depthScore = Math.min(20, factors.depth * 5); // 4+ features = 20 points
        // Value score (0-20 points): More approvals = higher score
        const valueScore = Math.min(20, factors.value * 2); // 10+ approvals = 20 points
        return Math.round(recencyScore + frequencyScore + depthScore + valueScore);
    }
    /**
     * Get engagement score factors
     *
     * @param userId - User identifier
     * @param startDate - Start of analysis period
     * @returns Engagement score factors
     */
    async getEngagementFactors(userId, startDate) {
        // Get user activity data
        const facts = await prisma.dashboardFact.findMany({
            where: {
                shop: userId,
                timestamp: {
                    gte: startDate,
                },
            },
            select: {
                timestamp: true,
                category: true,
                metric: true,
            },
            orderBy: {
                timestamp: "desc",
            },
        });
        if (facts.length === 0) {
            return {
                recency: 30, // No activity = 30 days
                frequency: 0,
                depth: 0,
                value: 0,
            };
        }
        // Recency: Days since last activity
        const lastActive = facts[0].timestamp;
        const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        const recency = Math.min(30, daysSinceActive);
        // Frequency: Sessions per week
        const uniqueDays = new Set(facts.map((f) => f.timestamp.toISOString().split("T")[0]));
        const daysActive = uniqueDays.size;
        const weeksInPeriod = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7);
        const frequency = daysActive / weeksInPeriod;
        // Depth: Unique features used
        const uniqueFeatures = new Set(facts
            .filter((f) => f.category === "product_analytics")
            .map((f) => f.metric.match(/^feature_([^_]+)_/)?.[1])
            .filter(Boolean));
        const depth = uniqueFeatures.size / Math.max(1, daysActive); // Features per session
        // Value: Approvals made
        const approvals = await prisma.decisionLog.count({
            where: {
                shop: userId,
                timestamp: {
                    gte: startDate,
                },
            },
        });
        const value = approvals;
        return { recency, frequency, depth, value };
    }
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
    async segmentUser(userId) {
        const engagementScore = await this.calculateEngagementScore(userId);
        const factors = await this.getEngagementFactors(userId, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        // Check for churned (no activity in 30+ days)
        if (factors.recency >= 30) {
            return "churned";
        }
        // Check for new user (< 7 days since first activity)
        const firstActivity = await this.getUserFirstActivity(userId);
        const daysSinceFirst = firstActivity
            ? Math.floor((Date.now() - firstActivity.getTime()) / (1000 * 60 * 60 * 24))
            : 999;
        if (daysSinceFirst < 7) {
            return "new";
        }
        // Segment by engagement score
        if (engagementScore >= 70) {
            return "power";
        }
        else if (engagementScore >= 40) {
            return "casual";
        }
        else {
            return "churned"; // Low engagement = at risk
        }
    }
    /**
     * Get user segment data with details
     *
     * @param userId - User identifier
     * @returns Complete user segment data
     */
    async getUserSegmentData(userId) {
        const segment = await this.segmentUser(userId);
        const engagementScore = await this.calculateEngagementScore(userId);
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const factors = await this.getEngagementFactors(userId, startDate);
        // Get last active date
        const lastFact = await prisma.dashboardFact.findFirst({
            where: { shop: userId },
            orderBy: { timestamp: "desc" },
            select: { timestamp: true },
        });
        // Get signup date (first activity)
        const signupDate = await this.getUserFirstActivity(userId);
        // Get total sessions (unique days)
        const facts = await prisma.dashboardFact.findMany({
            where: {
                shop: userId,
                timestamp: { gte: startDate },
            },
            select: { timestamp: true },
        });
        const uniqueDays = new Set(facts.map((f) => f.timestamp.toISOString().split("T")[0]));
        const totalSessions = uniqueDays.size;
        // Get unique features used
        const featureFacts = await prisma.dashboardFact.findMany({
            where: {
                shop: userId,
                category: "product_analytics",
                timestamp: { gte: startDate },
            },
            select: { metric: true },
        });
        const uniqueFeatures = new Set(featureFacts
            .map((f) => f.metric.match(/^feature_([^_]+)_/)?.[1])
            .filter(Boolean));
        // Get approval count
        const approvalCount = await prisma.decisionLog.count({
            where: {
                shop: userId,
                timestamp: { gte: startDate },
            },
        });
        // Calculate avg tile clicks per session
        const tileClicks = await prisma.dashboardFact.count({
            where: {
                shop: userId,
                category: "tile_analytics",
                metric: { endsWith: "_clicked" },
                timestamp: { gte: startDate },
            },
        });
        const tileClicksPerSession = totalSessions > 0 ? tileClicks / totalSessions : 0;
        return {
            userId,
            segment,
            engagementScore,
            lastActiveDate: lastFact?.timestamp || new Date(),
            signupDate,
            totalSessions,
            avgSessionDuration: 0, // TODO: Calculate from session tracking
            featuresUsed: uniqueFeatures.size,
            approvalCount,
            tileClicksPerSession,
        };
    }
    /**
     * Get segment analytics
     *
     * Aggregates analytics for each user segment.
     *
     * @returns Array of segment analytics
     */
    async getSegmentAnalytics() {
        // Get all unique users
        const users = await prisma.dashboardFact.findMany({
            select: { shop: true },
            distinct: ["shop"],
        });
        const totalUsers = users.length;
        // Segment each user
        const segmentCounts = new Map();
        const segmentScores = new Map();
        const segmentSessions = new Map();
        for (const user of users) {
            const segmentData = await this.getUserSegmentData(user.shop);
            const segment = segmentData.segment;
            segmentCounts.set(segment, (segmentCounts.get(segment) || 0) + 1);
            if (!segmentScores.has(segment)) {
                segmentScores.set(segment, []);
                segmentSessions.set(segment, []);
            }
            segmentScores.get(segment).push(segmentData.engagementScore);
            segmentSessions.get(segment).push(segmentData.totalSessions);
        }
        // Build analytics
        const analytics = [];
        const segments = ["power", "casual", "new", "churned"];
        for (const segment of segments) {
            const count = segmentCounts.get(segment) || 0;
            const scores = segmentScores.get(segment) || [];
            const sessions = segmentSessions.get(segment) || [];
            const avgEngagementScore = scores.length > 0
                ? scores.reduce((sum, s) => sum + s, 0) / scores.length
                : 0;
            const avgSessionsPerUser = sessions.length > 0
                ? sessions.reduce((sum, s) => sum + s, 0) / sessions.length
                : 0;
            analytics.push({
                segment,
                userCount: count,
                percentage: totalUsers > 0 ? count / totalUsers : 0,
                avgEngagementScore,
                avgSessionsPerUser,
                characteristics: this.getSegmentCharacteristics(segment),
                recommendations: this.getSegmentRecommendations(segment),
            });
        }
        return analytics;
    }
    /**
     * Get segment characteristics
     *
     * @param segment - User segment
     * @returns Array of characteristics
     */
    getSegmentCharacteristics(segment) {
        const characteristics = {
            power: [
                "Daily active users",
                "High feature adoption (>70%)",
                "Frequent approvals (>10/month)",
                "Short time to click (<5s)",
            ],
            casual: [
                "Weekly active users",
                "Moderate feature adoption (40-70%)",
                "Occasional approvals (3-10/month)",
                "Standard usage patterns",
            ],
            new: [
                "Recently signed up (<7 days)",
                "Exploring features",
                "Learning dashboard",
                "Lower engagement initially",
            ],
            churned: [
                "No activity in 30+ days",
                "Low engagement score (<40)",
                "At risk of not returning",
                "May need re-engagement",
            ],
        };
        return characteristics[segment];
    }
    /**
     * Get segment-specific recommendations
     *
     * @param segment - User segment
     * @returns Array of recommendations
     */
    getSegmentRecommendations(segment) {
        const recommendations = {
            power: [
                "Enable beta features early",
                "Request feedback on new features",
                "Offer advanced personalization",
                "Consider as product champion",
            ],
            casual: [
                "Highlight unused features",
                "Send weekly usage summary",
                "Offer quick wins and time-savers",
                "Encourage daily usage",
            ],
            new: [
                "Show onboarding tour",
                "Highlight key features",
                "Provide success examples",
                "Reduce friction in workflows",
            ],
            churned: [
                "Send re-engagement email",
                "Offer support/training",
                "Survey for feedback",
                "Highlight new features added",
            ],
        };
        return recommendations[segment];
    }
    /**
     * Get user first activity date
     *
     * @param userId - User identifier
     * @returns First activity date or null
     */
    async getUserFirstActivity(userId) {
        const firstFact = await prisma.dashboardFact.findFirst({
            where: { shop: userId },
            orderBy: { timestamp: "asc" },
            select: { timestamp: true },
        });
        return firstFact?.timestamp || null;
    }
}
// ============================================================================
// Export singleton instance
// ============================================================================
export const userSegmentationService = new UserSegmentationService();
//# sourceMappingURL=user-segmentation.js.map