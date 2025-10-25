/**
 * Production Launch Metrics Service
 *
 * Provides functions for calculating and tracking production launch metrics
 * including adoption, satisfaction, feature usage, and business impact.
 *
 * @see docs/metrics/production-launch-metrics.md
 */
export interface DAUMAUMetric {
    date: string;
    dau: number;
    mau: number;
    ratio: number;
    trend: 'up' | 'down' | 'stable';
}
export interface SignupMetric {
    period: string;
    signups: number;
    target: number;
    percentOfTarget: number;
    trend: 'up' | 'down' | 'stable';
}
export interface ActivationMetric {
    cohort: string;
    totalUsers: number;
    activatedUsers: number;
    activationRate: number;
    milestoneCompletion: {
        profileSetup: number;
        firstIntegration: number;
        viewDashboard: number;
        firstApproval: number;
        firstWorkflow: number;
    };
}
export interface TTFVMetric {
    median: number;
    p50: number;
    p75: number;
    p90: number;
    p99: number;
    distribution: {
        under15min: number;
        under30min: number;
        under60min: number;
        over60min: number;
    };
}
export interface FeatureAdoptionMetric {
    feature: string;
    week: number;
    adoptionRate: number;
    activeUsers: number;
    totalUsers: number;
    trend: 'accelerating' | 'steady' | 'slowing';
}
export interface NPSMetric {
    period: string;
    totalResponses: number;
    promoters: number;
    passives: number;
    detractors: number;
    npsScore: number;
    trend: 'improving' | 'stable' | 'declining';
}
export interface CSATMetric {
    interactionType: string;
    period: string;
    totalRatings: number;
    averageRating: number;
    satisfactionRate: number;
    distribution: {
        rating5: number;
        rating4: number;
        rating3: number;
        rating2: number;
        rating1: number;
    };
}
export interface LaunchMetrics {
    adoption: {
        dauMau: DAUMAUMetric;
        signups: SignupMetric;
        activation: ActivationMetric;
        ttfv: TTFVMetric;
        featureAdoption: FeatureAdoptionMetric[];
    };
    satisfaction: {
        nps: NPSMetric;
        csat: CSATMetric[];
        sentiment: {
            positive: number;
            neutral: number;
            negative: number;
            averageSentiment: number;
        };
    };
    usage: {
        engagement: any[];
        retention: any[];
        powerUsers: any;
    };
    businessImpact: {
        revenue: any;
        costSavings: any;
        timeSavings: any;
        roi: any;
    };
}
/**
 * Calculate DAU/MAU ratio
 */
export declare function getDAUMAUMetric(): Promise<DAUMAUMetric>;
/**
 * Get new user signups for a period
 */
export declare function getSignupMetric(period?: 'daily' | 'weekly' | 'monthly'): Promise<SignupMetric>;
/**
 * Calculate activation rate for a cohort
 */
export declare function getActivationMetric(cohort: string): Promise<ActivationMetric>;
/**
 * Calculate Time to First Value
 */
export declare function getTTFVMetric(): Promise<TTFVMetric>;
/**
 * Get feature adoption curve
 */
export declare function getFeatureAdoptionCurve(): Promise<FeatureAdoptionMetric[]>;
/**
 * Calculate NPS score
 */
export declare function getNPSMetric(period?: string): Promise<NPSMetric>;
/**
 * Get CSAT metrics by interaction type
 */
export declare function getCSATMetrics(): Promise<CSATMetric[]>;
/**
 * Get sentiment analysis
 */
export declare function getSentimentMetric(): Promise<{
    positive: number;
    neutral: number;
    negative: number;
    averageSentiment: number;
    trend: "improving";
}>;
/**
 * Get all launch metrics
 */
export declare function getLaunchMetrics(): Promise<LaunchMetrics>;
//# sourceMappingURL=launch-metrics.d.ts.map