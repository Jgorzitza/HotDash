/**
 * Unit Tests for A/B Testing Service
 *
 * Tests A/B test management for ad creatives:
 * - Creating tests with 2-3 variants
 * - Updating variant performance
 * - Chi-square statistical test calculation
 * - P-value calculation
 * - Winner determination (95% confidence)
 * - Completing tests with statistical analysis
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createABTest,
  updateVariantPerformance,
  calculateChiSquare,
  chiSquareToPValue,
  determineWinner,
  completeTest,
  cancelTest,
  getTest,
  getAllTests,
  type ABTest,
  type ABTestVariant,
  type StatisticalResult,
} from "~/services/ads/ab-testing";
import type { AdCopy } from "~/services/ads/types";

/**
 * Test Helper: Create mock ad copy
 */
function createMockAdCopy(overrides: Partial<AdCopy> = {}): AdCopy {
  return {
    headline1: "Test Headline 1",
    headline2: "Test Headline 2",
    headline3: "Test Headline 3",
    description1: "Test description 1 with compelling copy",
    description2: "Test description 2 with more details",
    finalUrl: "https://example.com/product",
    ...overrides,
  };
}

describe("createABTest", () => {
  it("should create A/B test with 2 variants", () => {
    const variant1 = createMockAdCopy({ headline1: "Variant A Headline" });
    const variant2 = createMockAdCopy({ headline1: "Variant B Headline" });

    const test = createABTest(
      "campaign_123",
      "Test Campaign",
      "Headline Test",
      "Testing different headlines",
      [variant1, variant2],
      "test_user"
    );

    expect(test.campaignId).toBe("campaign_123");
    expect(test.campaignName).toBe("Test Campaign");
    expect(test.name).toBe("Headline Test");
    expect(test.variants).toHaveLength(2);
    expect(test.variants[0].name).toBe("Variant A");
    expect(test.variants[1].name).toBe("Variant B");
    expect(test.status).toBe("draft");
    expect(test.confidenceLevel).toBe(95); // Default
    expect(test.createdBy).toBe("test_user");
  });

  it("should create A/B test with 3 variants", () => {
    const variants = [
      createMockAdCopy({ headline1: "Variant A" }),
      createMockAdCopy({ headline1: "Variant B" }),
      createMockAdCopy({ headline1: "Variant C" }),
    ];

    const test = createABTest(
      "campaign_123",
      "Test Campaign",
      "Three Way Test",
      "Testing three variants",
      variants,
      "test_user"
    );

    expect(test.variants).toHaveLength(3);
    expect(test.variants[0].name).toBe("Variant A");
    expect(test.variants[1].name).toBe("Variant B");
    expect(test.variants[2].name).toBe("Variant C");
  });

  it("should throw error with less than 2 variants", () => {
    const variant1 = createMockAdCopy();

    expect(() => {
      createABTest(
        "campaign_123",
        "Test Campaign",
        "Invalid Test",
        "Only one variant",
        [variant1],
        "test_user"
      );
    }).toThrow("A/B test requires 2-3 variants");
  });

  it("should throw error with more than 3 variants", () => {
    const variants = [
      createMockAdCopy(),
      createMockAdCopy(),
      createMockAdCopy(),
      createMockAdCopy(),
    ];

    expect(() => {
      createABTest(
        "campaign_123",
        "Test Campaign",
        "Invalid Test",
        "Too many variants",
        variants,
        "test_user"
      );
    }).toThrow("A/B test requires 2-3 variants");
  });

  it("should initialize variants with zero metrics", () => {
    const variants = [createMockAdCopy(), createMockAdCopy()];

    const test = createABTest(
      "campaign_123",
      "Test Campaign",
      "Test",
      "Description",
      variants,
      "test_user"
    );

    test.variants.forEach((variant) => {
      expect(variant.impressions).toBe(0);
      expect(variant.clicks).toBe(0);
      expect(variant.conversions).toBe(0);
      expect(variant.costCents).toBe(0);
      expect(variant.revenueCents).toBe(0);
    });
  });

  it("should store test in memory and retrieve it", () => {
    const variants = [createMockAdCopy(), createMockAdCopy()];

    const test = createABTest(
      "campaign_123",
      "Test Campaign",
      "Test",
      "Description",
      variants,
      "test_user"
    );

    const retrieved = getTest(test.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(test.id);
    expect(retrieved?.name).toBe("Test");
  });
});

describe("updateVariantPerformance", () => {
  let testId: string;
  let variantId: string;

  beforeEach(() => {
    const variants = [createMockAdCopy(), createMockAdCopy()];
    const test = createABTest(
      "campaign_123",
      "Test Campaign",
      "Test",
      "Description",
      variants,
      "test_user"
    );
    testId = test.id;
    variantId = test.variants[0].id;
  });

  it("should update variant performance metrics", () => {
    const updated = updateVariantPerformance(testId, variantId, {
      impressions: 1000,
      clicks: 50,
      conversions: 5,
      costCents: 2000, // $20
      revenueCents: 5000, // $50
    });

    expect(updated).toBeDefined();
    const variant = updated?.variants.find((v) => v.id === variantId);
    expect(variant?.impressions).toBe(1000);
    expect(variant?.clicks).toBe(50);
    expect(variant?.conversions).toBe(5);
    expect(variant?.costCents).toBe(2000);
    expect(variant?.revenueCents).toBe(5000);
  });

  it("should return null for non-existent test", () => {
    const updated = updateVariantPerformance("non_existent", variantId, {
      impressions: 1000,
    });

    expect(updated).toBeNull();
  });

  it("should return null for non-existent variant", () => {
    const updated = updateVariantPerformance(testId, "non_existent", {
      impressions: 1000,
    });

    expect(updated).toBeNull();
  });

  it("should allow partial updates", () => {
    // Update impressions only
    updateVariantPerformance(testId, variantId, {
      impressions: 1000,
    });

    // Update clicks and conversions
    const updated = updateVariantPerformance(testId, variantId, {
      clicks: 50,
      conversions: 5,
    });

    const variant = updated?.variants.find((v) => v.id === variantId);
    expect(variant?.impressions).toBe(1000); // Preserved
    expect(variant?.clicks).toBe(50); // Updated
    expect(variant?.conversions).toBe(5); // Updated
  });

  it("should update timestamp when performance changes", () => {
    const test = getTest(testId);
    const originalTimestamp = test?.createdAt;

    // Wait a tiny bit to ensure different timestamp
    const updated = updateVariantPerformance(testId, variantId, {
      impressions: 1000,
    });

    // Timestamps should be the same (createdAt doesn't change)
    expect(updated?.createdAt).toBe(originalTimestamp);
  });
});

describe("calculateChiSquare", () => {
  it("should calculate Chi-square for 2 variants with different conversion rates", () => {
    const variants: ABTestVariant[] = [
      {
        id: "var1",
        name: "Variant A",
        copy: createMockAdCopy(),
        impressions: 1000,
        clicks: 1000,
        conversions: 100, // 10% conversion rate
        costCents: 5000,
        revenueCents: 10000,
      },
      {
        id: "var2",
        name: "Variant B",
        copy: createMockAdCopy(),
        impressions: 1000,
        clicks: 1000,
        conversions: 150, // 15% conversion rate
        costCents: 5000,
        revenueCents: 15000,
      },
    ];

    const chiSquare = calculateChiSquare(variants);

    expect(chiSquare).toBeGreaterThan(0);
    expect(chiSquare).toBeCloseTo(10.0, 0); // Approximate expected value
  });

  it("should return 0 for variants with identical performance", () => {
    const variants: ABTestVariant[] = [
      {
        id: "var1",
        name: "Variant A",
        copy: createMockAdCopy(),
        impressions: 1000,
        clicks: 1000,
        conversions: 100, // 10%
        costCents: 5000,
        revenueCents: 10000,
      },
      {
        id: "var2",
        name: "Variant B",
        copy: createMockAdCopy(),
        impressions: 1000,
        clicks: 1000,
        conversions: 100, // 10% (same)
        costCents: 5000,
        revenueCents: 10000,
      },
    ];

    const chiSquare = calculateChiSquare(variants);

    expect(chiSquare).toBe(0);
  });

  it("should calculate Chi-square for 3 variants", () => {
    const variants: ABTestVariant[] = [
      {
        id: "var1",
        name: "Variant A",
        copy: createMockAdCopy(),
        impressions: 1000,
        clicks: 1000,
        conversions: 100, // 10%
        costCents: 5000,
        revenueCents: 10000,
      },
      {
        id: "var2",
        name: "Variant B",
        copy: createMockAdCopy(),
        impressions: 1000,
        clicks: 1000,
        conversions: 150, // 15%
        costCents: 5000,
        revenueCents: 15000,
      },
      {
        id: "var3",
        name: "Variant C",
        copy: createMockAdCopy(),
        impressions: 1000,
        clicks: 1000,
        conversions: 120, // 12%
        costCents: 5000,
        revenueCents: 12000,
      },
    ];

    const chiSquare = calculateChiSquare(variants);

    expect(chiSquare).toBeGreaterThan(0);
    expect(chiSquare).toBeLessThan(100); // Reasonable range
  });

  it("should handle variants with no clicks", () => {
    const variants: ABTestVariant[] = [
      {
        id: "var1",
        name: "Variant A",
        copy: createMockAdCopy(),
        impressions: 1000,
        clicks: 0, // No clicks
        conversions: 0,
        costCents: 0,
        revenueCents: 0,
      },
      {
        id: "var2",
        name: "Variant B",
        copy: createMockAdCopy(),
        impressions: 1000,
        clicks: 0, // No clicks
        conversions: 0,
        costCents: 0,
        revenueCents: 0,
      },
    ];

    const chiSquare = calculateChiSquare(variants);

    expect(chiSquare).toBe(0); // No data to compare
  });
});

describe("chiSquareToPValue", () => {
  it("should convert Chi-square to p-value for df=1 (2 variants)", () => {
    // Chi-square = 3.84 is approximately p = 0.05 for df=1 (95% confidence)
    const pValue = chiSquareToPValue(3.84, 1);

    expect(pValue).toBeGreaterThan(0);
    expect(pValue).toBeLessThan(1);
    expect(pValue).toBeCloseTo(0.05, 1); // Within 0.1
  });

  it("should convert Chi-square to p-value for df=2 (3 variants)", () => {
    // Chi-square = 5.99 is approximately p = 0.05 for df=2
    const pValue = chiSquareToPValue(5.99, 2);

    expect(pValue).toBeGreaterThan(0);
    expect(pValue).toBeLessThan(1);
    expect(pValue).toBeCloseTo(0.05, 1);
  });

  it("should return high p-value for small Chi-square (not significant)", () => {
    const pValue = chiSquareToPValue(0.5, 1);

    expect(pValue).toBeGreaterThan(0.4); // Not significant
  });

  it("should return low p-value for large Chi-square (significant)", () => {
    const pValue = chiSquareToPValue(10.0, 1);

    expect(pValue).toBeLessThan(0.01); // Highly significant
  });

  it("should handle Chi-square = 0 (identical variants)", () => {
    const pValue = chiSquareToPValue(0, 1);

    expect(pValue).toBeCloseTo(1.0, 1); // p ≈ 1.0 (not significant at all)
  });
});

describe("determineWinner", () => {
  let testId: string;

  beforeEach(() => {
    const variants = [createMockAdCopy(), createMockAdCopy()];
    const test = createABTest(
      "campaign_123",
      "Test Campaign",
      "Test",
      "Description",
      variants,
      "test_user"
    );
    testId = test.id;

    // Update variant A performance
    updateVariantPerformance(testId, test.variants[0].id, {
      impressions: 1000,
      clicks: 1000,
      conversions: 100, // 10% conversion rate
      costCents: 5000,
      revenueCents: 10000,
    });

    // Update variant B performance (better)
    updateVariantPerformance(testId, test.variants[1].id, {
      impressions: 1000,
      clicks: 1000,
      conversions: 150, // 15% conversion rate
      costCents: 5000,
      revenueCents: 15000,
    });
  });

  it("should determine winner with statistical significance", () => {
    const result = determineWinner(testId);

    expect(result).not.toBeNull();
    expect(result?.winner).toBeDefined();
    expect(result?.confidence).toBeGreaterThan(0);
    expect(result?.chiSquare).toBeGreaterThan(0);
    expect(result?.pValue).toBeLessThan(1);
    expect(result?.isSigificant).toBeDefined();
    expect(result?.recommendation).toContain("Variant");
  });

  it("should return null for non-existent test", () => {
    const result = determineWinner("non_existent");

    expect(result).toBeNull();
  });

  it("should indicate non-significant result when variants are similar", () => {
    const variants = [createMockAdCopy(), createMockAdCopy()];
    const test = createABTest(
      "campaign_123",
      "Test Campaign",
      "Similar Test",
      "Description",
      variants,
      "test_user"
    );

    // Update both variants with identical performance
    updateVariantPerformance(test.id, test.variants[0].id, {
      impressions: 1000,
      clicks: 1000,
      conversions: 100,
      costCents: 5000,
      revenueCents: 10000,
    });

    updateVariantPerformance(test.id, test.variants[1].id, {
      impressions: 1000,
      clicks: 1000,
      conversions: 100, // Same as variant A
      costCents: 5000,
      revenueCents: 10000,
    });

    const result = determineWinner(test.id);

    expect(result).not.toBeNull();
    expect(result?.isSigificant).toBe(false);
    expect(result?.recommendation).toContain("not statistically significant");
  });

  it("should identify highest conversion rate variant as winner", () => {
    const result = determineWinner(testId);
    const test = getTest(testId);

    expect(result?.winner).toBeDefined();

    // Find the winning variant
    const winningVariant = test?.variants.find((v) => v.id === result?.winner);

    // Winner should have higher conversion rate
    expect(winningVariant?.conversions).toBeGreaterThan(100);
  });

  it("should calculate correct confidence level", () => {
    const result = determineWinner(testId);

    expect(result?.confidence).toBeGreaterThan(0);
    expect(result?.confidence).toBeLessThanOrEqual(100);
  });
});

describe("completeTest", () => {
  let testId: string;

  beforeEach(() => {
    const variants = [createMockAdCopy(), createMockAdCopy()];
    const test = createABTest(
      "campaign_123",
      "Test Campaign",
      "Test",
      "Description",
      variants,
      "test_user"
    );
    testId = test.id;

    // Add performance data
    updateVariantPerformance(testId, test.variants[0].id, {
      impressions: 1000,
      clicks: 1000,
      conversions: 100,
      costCents: 5000,
      revenueCents: 10000,
    });

    updateVariantPerformance(testId, test.variants[1].id, {
      impressions: 1000,
      clicks: 1000,
      conversions: 150,
      costCents: 5000,
      revenueCents: 15000,
    });
  });

  it("should complete test and determine winner", () => {
    const completed = completeTest(testId);

    expect(completed).not.toBeNull();
    expect(completed?.status).toBe("completed");
    expect(completed?.completedAt).toBeDefined();
    expect(completed?.winnerId).toBeDefined();
  });

  it("should return null for non-existent test", () => {
    const completed = completeTest("non_existent");

    expect(completed).toBeNull();
  });

  it("should set winnerId to highest conversion rate variant", () => {
    const completed = completeTest(testId);
    const test = getTest(testId);

    const winningVariant = test?.variants.find((v) => v.id === completed?.winnerId);

    expect(winningVariant?.conversions).toBe(150); // Higher conversion variant
  });

  it("should preserve completedAt timestamp", () => {
    const completed = completeTest(testId);

    expect(completed?.completedAt).toBeDefined();
    expect(new Date(completed?.completedAt!).getTime()).toBeLessThanOrEqual(Date.now());
  });
});

describe("cancelTest", () => {
  let testId: string;

  beforeEach(() => {
    const variants = [createMockAdCopy(), createMockAdCopy()];
    const test = createABTest(
      "campaign_123",
      "Test Campaign",
      "Test",
      "Description",
      variants,
      "test_user"
    );
    testId = test.id;
  });

  it("should cancel test", () => {
    const cancelled = cancelTest(testId);

    expect(cancelled).not.toBeNull();
    expect(cancelled?.status).toBe("cancelled");
  });

  it("should return null for non-existent test", () => {
    const cancelled = cancelTest("non_existent");

    expect(cancelled).toBeNull();
  });

  it("should clear winnerId when cancelled", () => {
    // Complete test first
    updateVariantPerformance(testId, getTest(testId)!.variants[0].id, {
      conversions: 100,
    });
    updateVariantPerformance(testId, getTest(testId)!.variants[1].id, {
      conversions: 150,
    });
    completeTest(testId);

    // Then cancel
    const cancelled = cancelTest(testId);

    expect(cancelled?.status).toBe("cancelled");
    expect(cancelled?.winnerId).toBeUndefined();
  });
});

describe("getAllTests", () => {
  it("should return all tests for a campaign", () => {
    const variants = [createMockAdCopy(), createMockAdCopy()];

    const test1 = createABTest(
      "campaign_123",
      "Test Campaign",
      "Test 1",
      "First test",
      variants,
      "test_user"
    );

    const test2 = createABTest(
      "campaign_123",
      "Test Campaign",
      "Test 2",
      "Second test",
      variants,
      "test_user"
    );

    const test3 = createABTest(
      "campaign_456",
      "Other Campaign",
      "Test 3",
      "Third test",
      variants,
      "test_user"
    );

    const campaign123Tests = getAllTests("campaign_123");

    expect(campaign123Tests).toHaveLength(2);
    expect(campaign123Tests.map((t) => t.id)).toContain(test1.id);
    expect(campaign123Tests.map((t) => t.id)).toContain(test2.id);
    expect(campaign123Tests.map((t) => t.id)).not.toContain(test3.id);
  });

  it("should return empty array for campaign with no tests", () => {
    const tests = getAllTests("non_existent_campaign");

    expect(tests).toEqual([]);
  });
});

