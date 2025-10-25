/**
 * Ad Creative A/B Testing Service
 *
 * Manages A/B tests for ad creatives:
 * - Create tests with 2-3 variants
 * - Track performance per variant
 * - Determine winner using Chi-square statistical test
 * - HITL approval to implement winner
 *
 * @module app/services/ads/ab-testing
 */
import type { AdCopy } from "./types";
/**
 * A/B Test Status
 */
export type ABTestStatus = "draft" | "active" | "completed" | "cancelled";
/**
 * A/B Test Variant
 */
export interface ABTestVariant {
    id: string;
    name: string;
    copy: AdCopy;
    impressions: number;
    clicks: number;
    conversions: number;
    costCents: number;
    revenueCents: number;
}
/**
 * A/B Test
 */
export interface ABTest {
    id: string;
    campaignId: string;
    campaignName: string;
    name: string;
    description: string;
    variants: ABTestVariant[];
    status: ABTestStatus;
    startedAt?: string;
    completedAt?: string;
    winnerId?: string;
    confidenceLevel: number;
    createdBy: string;
    createdAt: string;
}
/**
 * Statistical Test Result
 */
export interface StatisticalResult {
    winner: string | null;
    confidence: number;
    chiSquare: number;
    pValue: number;
    isSigificant: boolean;
    recommendation: string;
}
/**
 * Create a new A/B test
 *
 * @param campaignId - Campaign ID
 * @param campaignName - Campaign name
 * @param name - Test name
 * @param description - Test description
 * @param variants - Array of ad copy variants (2-3)
 * @param createdBy - Creator identifier
 * @returns ABTest object
 * @throws Error if invalid number of variants
 */
export declare function createABTest(campaignId: string, campaignName: string, name: string, description: string, variants: Array<{
    name: string;
    copy: AdCopy;
}>, createdBy: string): ABTest;
/**
 * Start an A/B test
 *
 * @param testId - Test ID
 * @returns Updated test
 */
export declare function startTest(testId: string): ABTest;
/**
 * Update variant performance data
 *
 * @param testId - Test ID
 * @param variantId - Variant ID
 * @param performance - Performance metrics to update
 * @returns Updated test
 */
export declare function updateVariantPerformance(testId: string, variantId: string, performance: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    costCents?: number;
    revenueCents?: number;
}): ABTest;
/**
 * Calculate Chi-square statistic for A/B test
 *
 * Tests if conversion rates are significantly different between variants.
 *
 * @param variants - Array of test variants with performance data
 * @returns Chi-square statistic and p-value
 */
export declare function calculateChiSquare(variants: ABTestVariant[]): {
    chiSquare: number;
    pValue: number;
    degreesOfFreedom: number;
};
/**
 * Determine test winner
 *
 * @param test - A/B test with performance data
 * @returns Statistical result with winner and confidence
 */
export declare function determineWinner(test: ABTest): StatisticalResult;
/**
 * Complete an A/B test and determine winner
 *
 * @param testId - Test ID
 * @returns Updated test with winner determination
 */
export declare function completeTest(testId: string): {
    test: ABTest;
    result: StatisticalResult;
};
/**
 * Get test by ID
 */
export declare function getTest(testId: string): ABTest | undefined;
/**
 * Get all tests for a campaign
 */
export declare function getCampaignTests(campaignId: string): ABTest[];
/**
 * Get all active tests
 */
export declare function getActiveTests(): ABTest[];
/**
 * Cancel a test
 */
export declare function cancelTest(testId: string, reason: string): ABTest;
//# sourceMappingURL=ab-testing.d.ts.map