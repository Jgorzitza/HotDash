/**
 * Production Launch Metrics Service
 *
 * Provides functions for calculating and tracking production launch metrics
 * including adoption, satisfaction, feature usage, and business impact.
 *
 * @see docs/metrics/production-launch-metrics.md
 */
// ============================================================================
// Adoption Metrics
// ============================================================================
/**
 * Calculate DAU/MAU ratio
 */
export async function getDAUMAUMetric() {
    // TODO: Implement with GA4 API
    // For now, return mock data
    const today = new Date().toISOString().split('T')[0];
    return {
        date: today,
        dau: 42,
        mau: 100,
        ratio: 42,
        trend: 'up'
    };
}
/**
 * Get new user signups for a period
 */
export async function getSignupMetric(period = 'weekly') {
    const now = new Date();
    let startDate;
    let target;
    switch (period) {
        case 'daily':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            target = 2;
            break;
        case 'weekly':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            target = 10;
            break;
        case 'monthly':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            target = 40;
            break;
    }
    // Query Supabase auth.users table
    // For now, return mock data
    const signups = 15;
    return {
        period,
        signups,
        target,
        percentOfTarget: (signups / target) * 100,
        trend: signups > target ? 'up' : 'down'
    };
}
/**
 * Calculate activation rate for a cohort
 */
export async function getActivationMetric(cohort) {
    // TODO: Implement with user_milestones table
    // For now, return mock data
    return {
        cohort,
        totalUsers: 100,
        activatedUsers: 65,
        activationRate: 65,
        milestoneCompletion: {
            profileSetup: 85,
            firstIntegration: 75,
            viewDashboard: 70,
            firstApproval: 65,
            firstWorkflow: 60
        }
    };
}
/**
 * Calculate Time to First Value
 */
export async function getTTFVMetric() {
    // TODO: Implement with GA4 events + decision_log
    // For now, return mock data
    return {
        median: 25,
        p50: 25,
        p75: 40,
        p90: 55,
        p99: 90,
        distribution: {
            under15min: 35,
            under30min: 60,
            under60min: 85,
            over60min: 15
        }
    };
}
/**
 * Get feature adoption curve
 */
export async function getFeatureAdoptionCurve() {
    // TODO: Implement with GA4 events
    // For now, return mock data
    const features = [
        { name: 'Dashboard', target: 100 },
        { name: 'Approval Queue', target: 80 },
        { name: 'Action Queue', target: 70 },
        { name: 'CX Agent', target: 60 },
        { name: 'Inventory', target: 50 },
        { name: 'Growth Engine', target: 40 }
    ];
    return features.map(feature => ({
        feature: feature.name,
        week: 4,
        adoptionRate: feature.target - 10 + Math.random() * 20,
        activeUsers: 80,
        totalUsers: 100,
        trend: 'steady'
    }));
}
// ============================================================================
// Satisfaction Metrics
// ============================================================================
/**
 * Calculate NPS score
 */
export async function getNPSMetric(period = 'current') {
    // TODO: Implement with user_feedback table
    // For now, return mock data
    const promoters = 60;
    const passives = 32;
    const detractors = 8;
    const total = promoters + passives + detractors;
    return {
        period,
        totalResponses: total,
        promoters,
        passives,
        detractors,
        npsScore: ((promoters - detractors) / total) * 100,
        trend: 'improving'
    };
}
/**
 * Get CSAT metrics by interaction type
 */
export async function getCSATMetrics() {
    // TODO: Implement with interaction_ratings table
    // For now, return mock data
    const interactionTypes = [
        'Approval Workflow',
        'CX Agent Interaction',
        'Support Ticket',
        'Feature Usage'
    ];
    return interactionTypes.map(type => ({
        interactionType: type,
        period: 'last_30_days',
        totalRatings: 50,
        averageRating: 4.2 + Math.random() * 0.6,
        satisfactionRate: 85 + Math.random() * 10,
        distribution: {
            rating5: 30,
            rating4: 15,
            rating3: 3,
            rating2: 1,
            rating1: 1
        }
    }));
}
/**
 * Get sentiment analysis
 */
export async function getSentimentMetric() {
    // TODO: Implement with sentiment analysis on feedback
    // For now, return mock data
    return {
        positive: 70,
        neutral: 20,
        negative: 10,
        averageSentiment: 0.75,
        trend: 'improving'
    };
}
// ============================================================================
// Consolidated Metrics
// ============================================================================
/**
 * Get all launch metrics
 */
export async function getLaunchMetrics() {
    const [dauMau, signups, activation, ttfv, featureAdoption, nps, csat, sentiment] = await Promise.all([
        getDAUMAUMetric(),
        getSignupMetric('weekly'),
        getActivationMetric('week_1'),
        getTTFVMetric(),
        getFeatureAdoptionCurve(),
        getNPSMetric(),
        getCSATMetrics(),
        getSentimentMetric()
    ]);
    return {
        adoption: {
            dauMau,
            signups,
            activation,
            ttfv,
            featureAdoption
        },
        satisfaction: {
            nps,
            csat,
            sentiment
        },
        usage: {
            engagement: [],
            retention: [],
            powerUsers: {}
        },
        businessImpact: {
            revenue: {},
            costSavings: {},
            timeSavings: {},
            roi: {}
        }
    };
}
//# sourceMappingURL=launch-metrics.js.map