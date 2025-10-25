/**
 * A/B Testing Service
 *
 * Implements A/B testing infrastructure for feature experimentation
 * Based on: docs/specs/ab-test-campaigns.md (PRODUCT-007)
 *
 * Features:
 * - Deterministic variant assignment (consistent per user)
 * - Event tracking (exposure, conversion, engagement)
 * - Statistical significance calculation (Chi-square test)
 * - Results aggregation and analysis
 */
export interface Experiment {
    id: string;
    name: string;
    variants: ExperimentVariant[];
    metrics: string[];
    status: "draft" | "running" | "paused" | "completed";
    startDate: Date;
    endDate?: Date;
    targetSampleSize: number;
    minDetectableEffect: number;
}
export interface ExperimentVariant {
    id: string;
    name: string;
    weight: number;
    config?: any;
}
export interface ExperimentAssignment {
    experimentId: string;
    variantId: string;
    userId: string;
    assignedAt: Date;
}
export interface ABTestEvent {
    test_id: string;
    variant: string;
    user_id: string;
    event_type: string;
    event_name: string;
    timestamp: Date;
    metadata: Record<string, any>;
}
export interface SignificanceResult {
    isSignificant: boolean;
    pValue: number;
    chiSquare: number;
    sampleSizes: Record<string, number>;
    conversionRates: Record<string, number>;
    winner: string | null;
}
export interface ExperimentData {
    variants: string[];
    exposures: Record<string, number>;
    conversions: Record<string, number>;
    sampleSizes: Record<string, number>;
    conversionRates: Record<string, number>;
    bestVariant: string;
    degreesOfFreedom: number;
}
export declare class ABTestingService {
    /**
     * Assign user to experiment variant (deterministic hashing)
     *
     * Uses MD5 hash of userId + experimentId to ensure:
     * - Consistent assignment across sessions
     * - Even distribution across variants
     * - No state storage required
     *
     * @param userId - Shop domain or user identifier
     * @param experiment - Experiment configuration
     * @returns Assignment with variant details
     */
    assignVariant(userId: string, experiment: Experiment): ExperimentAssignment;
    /**
     * Track experiment exposure (user saw variant)
     *
     * Records that a user was exposed to a specific variant.
     * This is the denominator for conversion rate calculations.
     *
     * @param experimentId - Experiment identifier
     * @param variantId - Variant identifier
     * @param userId - User identifier
     */
    trackExposure(experimentId: string, variantId: string, userId: string): Promise<void>;
    /**
     * Track conversion event
     *
     * Records a successful conversion (user completed desired action).
     * This is the numerator for conversion rate calculations.
     *
     * @param experimentId - Experiment identifier
     * @param variantId - Variant identifier
     * @param userId - User identifier
     * @param conversionName - Name of conversion event
     * @param value - Optional numeric value (e.g., revenue)
     */
    trackConversion(experimentId: string, variantId: string, userId: string, conversionName: string, value?: number): Promise<void>;
    /**
     * Track engagement event
     *
     * Records user interaction with feature (clicks, time spent, etc.).
     * Used for secondary metrics and behavior analysis.
     *
     * @param experimentId - Experiment identifier
     * @param variantId - Variant identifier
     * @param userId - User identifier
     * @param engagementName - Name of engagement event
     * @param metadata - Additional event data
     */
    trackEngagement(experimentId: string, variantId: string, userId: string, engagementName: string, metadata?: Record<string, any>): Promise<void>;
    /**
     * Calculate statistical significance (chi-square test)
     *
     * Determines if the difference in conversion rates between variants
     * is statistically significant (not due to random chance).
     *
     * Uses chi-square test for proportions:
     * - H0: Conversion rates are equal across variants
     * - H1: Conversion rates differ significantly
     * - Significance level: α = 0.05 (95% confidence)
     *
     * @param experimentId - Experiment identifier
     * @returns Statistical significance results
     */
    calculateSignificance(experimentId: string): Promise<SignificanceResult>;
    /**
     * Get experiment configuration for user
     *
     * Returns the variant-specific configuration for the assigned variant.
     *
     * @param userId - User identifier
     * @param experimentId - Experiment identifier
     * @returns Variant configuration object
     */
    getExperimentConfig(userId: string, experimentId: string): any;
    /**
     * Get all active experiments
     *
     * Returns list of experiments with status "running".
     *
     * @returns Array of active experiments
     */
    getActiveExperiments(): Experiment[];
    /**
     * Get experiment by ID
     *
     * @param experimentId - Experiment identifier
     * @returns Experiment configuration or null
     */
    getExperiment(experimentId: string): Experiment | null;
    /**
     * Hash user ID with experiment ID for deterministic assignment
     *
     * @param userId - User identifier
     * @param experimentId - Experiment identifier
     * @returns Numeric hash value
     */
    private hashUserId;
    /**
     * Weighted random selection based on variant weights
     *
     * Converts hash to 0-1 range and selects variant based on cumulative weights.
     *
     * @param hash - Numeric hash from hashUserId
     * @param variants - Array of variants with weights
     * @returns Index of selected variant
     */
    private weightedSelection;
    /**
     * Track event to database
     *
     * Stores event in DashboardFact table with category "ab_test".
     *
     * @param event - Event data to track
     */
    private trackEvent;
    /**
     * Get aggregated experiment data from database
     *
     * Queries DashboardFact for all events related to experiment,
     * calculates conversion rates per variant.
     *
     * @param experimentId - Experiment identifier
     * @returns Aggregated experiment data
     */
    private getExperimentData;
    /**
     * Chi-square test for conversion rate differences
     *
     * Formula: χ² = Σ[(Observed - Expected)² / Expected]
     *
     * @param data - Aggregated experiment data
     * @returns Chi-square statistic
     */
    private chiSquareTest;
    /**
     * Calculate p-value from chi-square statistic
     *
     * Uses chi-square distribution approximation.
     * For production, consider using a statistics library (e.g., jStat).
     *
     * @param chiSquare - Chi-square statistic
     * @param df - Degrees of freedom (variants - 1)
     * @returns P-value (probability of observing this result by chance)
     */
    private calculatePValue;
    /**
     * Calculate sample size required for test
     *
     * Uses power analysis to determine minimum sample size needed
     * to detect a specified effect with given confidence and power.
     *
     * @param baselineRate - Current conversion rate (0-1)
     * @param minDetectableEffect - Minimum effect to detect (e.g., 0.05 = 5%)
     * @param alpha - Significance level (default: 0.05)
     * @param power - Statistical power (default: 0.80)
     * @returns Required sample size per variant
     */
    calculateSampleSize(baselineRate: number, minDetectableEffect: number, alpha?: number, power?: number): number;
}
export declare const abTestingService: ABTestingService;
//# sourceMappingURL=ab-testing.d.ts.map