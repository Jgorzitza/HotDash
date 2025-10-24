/**
 * Analytics Utilities
 *
 * ANALYTICS-002: Utility functions for action attribution and ROI measurement
 * Provides helper functions for analytics calculations and data processing
 */
import type { ActionAttributionResult } from '~/services/analytics/action-attribution';
import type { EnhancedActionAttributionResult } from '~/services/analytics/action-attribution-enhanced';
/**
 * Set action key in session storage with timestamp
 * Used for GA4 attribution tracking
 */
export declare function setActionKey(actionKey: string): void;
/**
 * Get current action key from session storage
 */
export declare function getCurrentActionKey(): string | null;
/**
 * Clear action key and timestamp from session storage
 */
export declare function clearActionKey(): void;
/**
 * Check if action key is expired (>24 hours)
 */
export declare function isActionKeyExpired(): boolean;
/**
 * Calculate Return on Investment (ROI)
 */
export declare function calculateROI(revenue: number, cost: number): number;
/**
 * Calculate Return on Ad Spend (ROAS)
 */
export declare function calculateROAS(revenue: number, adSpend: number): number;
/**
 * Calculate Cost Per Acquisition (CPA)
 */
export declare function calculateCPA(cost: number, acquisitions: number): number;
/**
 * Calculate Cost Per Click (CPC)
 */
export declare function calculateCPC(cost: number, clicks: number): number;
/**
 * Calculate Cost Per Mille (CPM)
 */
export declare function calculateCPM(cost: number, impressions: number): number;
/**
 * Calculate performance score based on multiple metrics
 */
export declare function calculatePerformanceScore(conversionRate: number, averageOrderValue: number, sessions: number, revenue: number): number;
/**
 * Calculate attribution efficiency
 */
export declare function calculateAttributionEfficiency(revenue: number, sessions: number): number;
/**
 * Calculate conversion funnel efficiency
 */
export declare function calculateFunnelEfficiency(sessions: number, pageviews: number, addToCarts: number, purchases: number): {
    sessionToPageview: number;
    pageviewToCart: number;
    cartToPurchase: number;
    overallEfficiency: number;
};
/**
 * Format currency values
 */
export declare function formatCurrency(amount: number, currency?: string): string;
/**
 * Format percentage values
 */
export declare function formatPercentage(value: number, decimals?: number): string;
/**
 * Format large numbers with K/M suffixes
 */
export declare function formatNumber(value: number): string;
/**
 * Format duration in human-readable format
 */
export declare function formatDuration(seconds: number): string;
/**
 * Calculate trend direction
 */
export declare function calculateTrend(current: number, previous: number): {
    direction: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
    significance: 'high' | 'medium' | 'low';
};
/**
 * Calculate correlation between two metrics
 */
export declare function calculateCorrelation(data: Array<{
    x: number;
    y: number;
}>): number;
/**
 * Calculate moving average
 */
export declare function calculateMovingAverage(data: number[], windowSize: number): number[];
/**
 * Calculate attribution confidence score
 */
export declare function calculateAttributionConfidence(touchpointCount: number, conversionRate: number, dataQuality: number): number;
/**
 * Identify attribution patterns
 */
export declare function identifyAttributionPatterns(attributionData: EnhancedActionAttributionResult[]): {
    patterns: string[];
    insights: string[];
    recommendations: string[];
};
/**
 * Calculate attribution lift
 */
export declare function calculateAttributionLift(withAttribution: number, withoutAttribution: number): {
    lift: number;
    liftPercentage: number;
    significance: 'high' | 'medium' | 'low';
};
/**
 * Validate attribution data quality
 */
export declare function validateAttributionData(data: ActionAttributionResult): {
    isValid: boolean;
    qualityScore: number;
    issues: string[];
};
/**
 * Clean and normalize attribution data
 */
export declare function cleanAttributionData(data: ActionAttributionResult): ActionAttributionResult;
//# sourceMappingURL=analytics.d.ts.map