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
/**
 * In-memory store for A/B tests
 */
const tests = new Map();
/**
 * Generate unique ID for test
 */
function generateTestId() {
    return `abtest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
/**
 * Generate unique ID for variant
 */
function generateVariantId() {
    return `variant_${Date.now()}_${Math.random().toString(36).substring(7)}`;
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
export function createABTest(campaignId, campaignName, name, description, variants, createdBy) {
    if (variants.length < 2 || variants.length > 3) {
        throw new Error("A/B test must have 2-3 variants");
    }
    const test = {
        id: generateTestId(),
        campaignId,
        campaignName,
        name,
        description,
        variants: variants.map((v) => ({
            id: generateVariantId(),
            name: v.name,
            copy: v.copy,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            costCents: 0,
            revenueCents: 0,
        })),
        status: "draft",
        confidenceLevel: 95,
        createdBy,
        createdAt: new Date().toISOString(),
    };
    tests.set(test.id, test);
    return test;
}
/**
 * Start an A/B test
 *
 * @param testId - Test ID
 * @returns Updated test
 */
export function startTest(testId) {
    const test = tests.get(testId);
    if (!test) {
        throw new Error(`Test not found: ${testId}`);
    }
    if (test.status !== "draft") {
        throw new Error(`Test already started: ${testId}`);
    }
    test.status = "active";
    test.startedAt = new Date().toISOString();
    tests.set(testId, test);
    return test;
}
/**
 * Update variant performance data
 *
 * @param testId - Test ID
 * @param variantId - Variant ID
 * @param performance - Performance metrics to update
 * @returns Updated test
 */
export function updateVariantPerformance(testId, variantId, performance) {
    const test = tests.get(testId);
    if (!test) {
        throw new Error(`Test not found: ${testId}`);
    }
    const variant = test.variants.find((v) => v.id === variantId);
    if (!variant) {
        throw new Error(`Variant not found: ${variantId}`);
    }
    // Update metrics
    if (performance.impressions !== undefined) {
        variant.impressions = performance.impressions;
    }
    if (performance.clicks !== undefined) {
        variant.clicks = performance.clicks;
    }
    if (performance.conversions !== undefined) {
        variant.conversions = performance.conversions;
    }
    if (performance.costCents !== undefined) {
        variant.costCents = performance.costCents;
    }
    if (performance.revenueCents !== undefined) {
        variant.revenueCents = performance.revenueCents;
    }
    tests.set(testId, test);
    return test;
}
/**
 * Calculate Chi-square statistic for A/B test
 *
 * Tests if conversion rates are significantly different between variants.
 *
 * @param variants - Array of test variants with performance data
 * @returns Chi-square statistic and p-value
 */
export function calculateChiSquare(variants) {
    // Calculate totals
    const totalImpressions = variants.reduce((sum, v) => sum + v.impressions, 0);
    const totalConversions = variants.reduce((sum, v) => sum + v.conversions, 0);
    if (totalImpressions === 0 || totalConversions === 0) {
        return { chiSquare: 0, pValue: 1, degreesOfFreedom: 0 };
    }
    const expectedConversionRate = totalConversions / totalImpressions;
    // Calculate chi-square statistic
    let chiSquare = 0;
    for (const variant of variants) {
        const expectedConversions = variant.impressions * expectedConversionRate;
        const expectedNonConversions = variant.impressions * (1 - expectedConversionRate);
        const actualConversions = variant.conversions;
        const actualNonConversions = variant.impressions - variant.conversions;
        // Chi-square = Σ((observed - expected)² / expected)
        if (expectedConversions > 0) {
            chiSquare +=
                Math.pow(actualConversions - expectedConversions, 2) /
                    expectedConversions;
        }
        if (expectedNonConversions > 0) {
            chiSquare +=
                Math.pow(actualNonConversions - expectedNonConversions, 2) /
                    expectedNonConversions;
        }
    }
    const degreesOfFreedom = variants.length - 1;
    const pValue = chiSquareToPValue(chiSquare, degreesOfFreedom);
    return { chiSquare, pValue, degreesOfFreedom };
}
/**
 * Convert Chi-square statistic to p-value
 *
 * Approximation for degrees of freedom 1-2.
 * For production use, consider using a proper statistical library.
 *
 * @param chiSquare - Chi-square statistic
 * @param df - Degrees of freedom
 * @returns P-value (approximate)
 */
function chiSquareToPValue(chiSquare, df) {
    // Simplified p-value calculation for common significance levels
    // For df=1 (2 variants):
    if (df === 1) {
        if (chiSquare >= 10.83)
            return 0.001; // 99.9% confidence
        if (chiSquare >= 6.63)
            return 0.01; // 99% confidence
        if (chiSquare >= 3.84)
            return 0.05; // 95% confidence
        if (chiSquare >= 2.71)
            return 0.1; // 90% confidence
        return 0.5; // Not significant
    }
    // For df=2 (3 variants):
    if (df === 2) {
        if (chiSquare >= 13.82)
            return 0.001;
        if (chiSquare >= 9.21)
            return 0.01;
        if (chiSquare >= 5.99)
            return 0.05;
        if (chiSquare >= 4.61)
            return 0.1;
        return 0.5;
    }
    // For other degrees of freedom, return conservative estimate
    return chiSquare > 5 ? 0.05 : 0.5;
}
/**
 * Determine test winner
 *
 * @param test - A/B test with performance data
 * @returns Statistical result with winner and confidence
 */
export function determineWinner(test) {
    const { chiSquare, pValue, degreesOfFreedom } = calculateChiSquare(test.variants);
    // Statistical significance threshold (p < 0.05 for 95% confidence)
    const isSignificant = pValue < 0.05;
    // Find variant with highest conversion rate
    let bestVariant = null;
    let bestConversionRate = 0;
    for (const variant of test.variants) {
        const conversionRate = variant.impressions > 0 ? variant.conversions / variant.impressions : 0;
        if (conversionRate > bestConversionRate) {
            bestConversionRate = conversionRate;
            bestVariant = variant;
        }
    }
    const confidence = (1 - pValue) * 100;
    let recommendation = "";
    if (!isSignificant) {
        recommendation =
            "Continue test - not enough data for statistical significance";
    }
    else if (bestVariant) {
        recommendation = `Implement ${bestVariant.name} - statistically significant winner at ${confidence.toFixed(1)}% confidence`;
    }
    else {
        recommendation = "No clear winner - variants perform similarly";
    }
    return {
        winner: isSignificant && bestVariant ? bestVariant.id : null,
        confidence,
        chiSquare,
        pValue,
        isSigificant: isSignificant,
        recommendation,
    };
}
/**
 * Complete an A/B test and determine winner
 *
 * @param testId - Test ID
 * @returns Updated test with winner determination
 */
export function completeTest(testId) {
    const test = tests.get(testId);
    if (!test) {
        throw new Error(`Test not found: ${testId}`);
    }
    if (test.status !== "active") {
        throw new Error(`Test must be active to complete: ${testId}`);
    }
    const result = determineWinner(test);
    test.status = "completed";
    test.completedAt = new Date().toISOString();
    test.winnerId = result.winner || undefined;
    tests.set(testId, test);
    return { test, result };
}
/**
 * Get test by ID
 */
export function getTest(testId) {
    return tests.get(testId);
}
/**
 * Get all tests for a campaign
 */
export function getCampaignTests(campaignId) {
    return Array.from(tests.values()).filter((t) => t.campaignId === campaignId);
}
/**
 * Get all active tests
 */
export function getActiveTests() {
    return Array.from(tests.values()).filter((t) => t.status === "active");
}
/**
 * Cancel a test
 */
export function cancelTest(testId, reason) {
    const test = tests.get(testId);
    if (!test) {
        throw new Error(`Test not found: ${testId}`);
    }
    test.status = "cancelled";
    tests.set(testId, test);
    return test;
}
//# sourceMappingURL=ab-testing.js.map