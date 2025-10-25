/**
 * Product Metrics Dashboard Service
 *
 * Aggregates product metrics for high-level health monitoring.
 * Provides DAU/MAU, product health score, and key performance indicators.
 */
export interface ProductMetrics {
    dau: number;
    wau: number;
    mau: number;
    dauMauRatio: number;
    avgSessionsPerUser: number;
    avgEngagementScore: number;
    totalFeatures: number;
    activeFeatures: number;
    featureAdoptionRate: number;
    productHealthScore: number;
    healthFactors: HealthScoreFactors;
    calculatedAt: Date;
    periodStart: Date;
    periodEnd: Date;
}
export interface HealthScoreFactors {
    userRetention: number;
    featureAdoption: number;
    userEngagement: number;
    approvalQuality: number;
}
export interface TrendData {
    date: string;
    value: number;
}
export declare class ProductMetricsService {
    /**
     * Calculate Daily Active Users (DAU)
     *
     * Count of unique users who had any activity in the last 24 hours.
     *
     * @param date - Date to calculate DAU for (default: today)
     * @returns DAU count
     */
    calculateDAU(date?: Date): Promise<number>;
    /**
     * Calculate Weekly Active Users (WAU)
     *
     * Count of unique users who had any activity in the last 7 days.
     *
     * @param endDate - End date (default: today)
     * @returns WAU count
     */
    calculateWAU(endDate?: Date): Promise<number>;
    /**
     * Calculate Monthly Active Users (MAU)
     *
     * Count of unique users who had any activity in the last 30 days.
     *
     * @param endDate - End date (default: today)
     * @returns MAU count
     */
    calculateMAU(endDate?: Date): Promise<number>;
    /**
     * Calculate product health score (0-100)
     *
     * Composite score based on:
     * - User Retention (30 points): DAU/MAU ratio
     * - Feature Adoption (25 points): % features with >10% adoption
     * - User Engagement (25 points): Avg engagement score
     * - Approval Quality (20 points): Approval rate
     *
     * @returns Product health score and factors
     */
    calculateProductHealthScore(): Promise<{
        score: number;
        factors: HealthScoreFactors;
    }>;
    /**
     * Get complete product metrics
     *
     * Returns all key product metrics for dashboard display.
     *
     * @returns Complete product metrics
     */
    getProductMetrics(): Promise<ProductMetrics>;
    /**
     * Get DAU trend (last 30 days)
     *
     * @returns Array of DAU values by date
     */
    getDAUTrend(days?: number): Promise<TrendData[]>;
    /**
     * Get health score interpretation
     *
     * @param score - Health score (0-100)
     * @returns Interpretation and status
     */
    getHealthInterpretation(score: number): {
        status: "excellent" | "good" | "fair" | "poor";
        message: string;
        color: string;
    };
}
export declare const productMetricsService: ProductMetricsService;
//# sourceMappingURL=product-metrics.d.ts.map