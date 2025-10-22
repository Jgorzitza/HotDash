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

import { createHash } from "crypto";
import prisma from "~/db.server";

const db = prisma; // Alias for compatibility

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Experiment {
  id: string; // "tile_order_default_test_001"
  name: string; // "Tile Order Default Test"
  variants: ExperimentVariant[]; // Array of variants
  metrics: string[]; // ["tile_engagement_rate", "time_to_first_click"]
  status: "draft" | "running" | "paused" | "completed";
  startDate: Date;
  endDate?: Date;
  targetSampleSize: number; // Users per variant
  minDetectableEffect: number; // 0.10 = 10%
}

export interface ExperimentVariant {
  id: string; // "control", "variant_a", "variant_b"
  name: string; // Display name
  weight: number; // 0-1, must sum to 1.0 across variants
  config?: any; // Variant-specific configuration
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  userId: string; // Shop domain
  assignedAt: Date;
}

export interface ABTestEvent {
  test_id: string; // "tile_order_default_test_001"
  variant: string; // "control" | "variant_a" | "variant_b"
  user_id: string; // Shop domain
  event_type: string; // "exposure" | "conversion" | "engagement"
  event_name: string; // "tile_reordered" | "settings_saved"
  timestamp: Date;
  metadata: Record<string, any>; // Additional context
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

// ============================================================================
// A/B Testing Service Class
// ============================================================================

export class ABTestingService {
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
  assignVariant(userId: string, experiment: Experiment): ExperimentAssignment {
    const hash = this.hashUserId(userId, experiment.id);
    const variantIndex = this.weightedSelection(hash, experiment.variants);
    const variant = experiment.variants[variantIndex];

    return {
      experimentId: experiment.id,
      variantId: variant.id,
      userId,
      assignedAt: new Date(),
    };
  }

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
  async trackExposure(
    experimentId: string,
    variantId: string,
    userId: string,
  ): Promise<void> {
    await this.trackEvent({
      test_id: experimentId,
      variant: variantId,
      user_id: userId,
      event_type: "exposure",
      event_name: "variant_exposed",
      timestamp: new Date(),
      metadata: {},
    });
  }

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
  async trackConversion(
    experimentId: string,
    variantId: string,
    userId: string,
    conversionName: string,
    value?: number,
  ): Promise<void> {
    await this.trackEvent({
      test_id: experimentId,
      variant: variantId,
      user_id: userId,
      event_type: "conversion",
      event_name: conversionName,
      timestamp: new Date(),
      metadata: { value },
    });
  }

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
  async trackEngagement(
    experimentId: string,
    variantId: string,
    userId: string,
    engagementName: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.trackEvent({
      test_id: experimentId,
      variant: variantId,
      user_id: userId,
      event_type: "engagement",
      event_name: engagementName,
      timestamp: new Date(),
      metadata: metadata || {},
    });
  }

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
  async calculateSignificance(
    experimentId: string,
  ): Promise<SignificanceResult> {
    const data = await this.getExperimentData(experimentId);

    // Chi-square test for conversion rates
    const chiSquare = this.chiSquareTest(data);
    const pValue = this.calculatePValue(chiSquare, data.degreesOfFreedom);

    return {
      isSignificant: pValue < 0.05,
      pValue,
      chiSquare,
      sampleSizes: data.sampleSizes,
      conversionRates: data.conversionRates,
      winner: pValue < 0.05 ? data.bestVariant : null,
    };
  }

  /**
   * Get experiment configuration for user
   *
   * Returns the variant-specific configuration for the assigned variant.
   *
   * @param userId - User identifier
   * @param experimentId - Experiment identifier
   * @returns Variant configuration object
   */
  getExperimentConfig(userId: string, experimentId: string): any {
    const experiment = this.getExperiment(experimentId);
    if (!experiment) return null;

    const assignment = this.assignVariant(userId, experiment);
    const variant = experiment.variants.find(
      (v) => v.id === assignment.variantId,
    );
    return variant?.config || {};
  }

  /**
   * Get all active experiments
   *
   * Returns list of experiments with status "running".
   *
   * @returns Array of active experiments
   */
  getActiveExperiments(): Experiment[] {
    // TODO: Implement database query
    // For now, return empty array
    return [];
  }

  /**
   * Get experiment by ID
   *
   * @param experimentId - Experiment identifier
   * @returns Experiment configuration or null
   */
  getExperiment(experimentId: string): Experiment | null {
    // TODO: Implement database query
    // For now, return null
    return null;
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Hash user ID with experiment ID for deterministic assignment
   *
   * @param userId - User identifier
   * @param experimentId - Experiment identifier
   * @returns Numeric hash value
   */
  private hashUserId(userId: string, experimentId: string): number {
    const hash = createHash("md5")
      .update(userId + experimentId)
      .digest("hex");
    return parseInt(hash.substring(0, 8), 16);
  }

  /**
   * Weighted random selection based on variant weights
   *
   * Converts hash to 0-1 range and selects variant based on cumulative weights.
   *
   * @param hash - Numeric hash from hashUserId
   * @param variants - Array of variants with weights
   * @returns Index of selected variant
   */
  private weightedSelection(
    hash: number,
    variants: ExperimentVariant[],
  ): number {
    const random = (hash % 10000) / 10000; // 0-1
    let cumulative = 0;
    for (let i = 0; i < variants.length; i++) {
      cumulative += variants[i].weight;
      if (random < cumulative) return i;
    }
    return variants.length - 1; // Fallback
  }

  /**
   * Track event to database
   *
   * Stores event in DashboardFact table with category "ab_test".
   *
   * @param event - Event data to track
   */
  private async trackEvent(event: ABTestEvent): Promise<void> {
    // Store in DashboardFact table
    await db.dashboardFact.create({
      data: {
        shop: event.user_id,
        category: "ab_test",
        metric: event.event_name,
        value: 1, // Count
        metadata: JSON.stringify(event),
        timestamp: event.timestamp,
      },
    });
  }

  /**
   * Get aggregated experiment data from database
   *
   * Queries DashboardFact for all events related to experiment,
   * calculates conversion rates per variant.
   *
   * @param experimentId - Experiment identifier
   * @returns Aggregated experiment data
   */
  private async getExperimentData(
    experimentId: string,
  ): Promise<ExperimentData> {
    // Query DashboardFact for experiment events
    const events = await db.dashboardFact.findMany({
      where: {
        category: "ab_test",
        metadata: {
          path: ["test_id"],
          equals: experimentId,
        },
      },
    });

    // Parse events and aggregate by variant
    const exposures: Record<string, number> = {};
    const conversions: Record<string, number> = {};
    const variants: string[] = [];

    for (const event of events) {
      const metadata = JSON.parse(event.metadata as string);
      const variant = metadata.variant;

      if (!variants.includes(variant)) {
        variants.push(variant);
      }

      if (metadata.event_type === "exposure") {
        exposures[variant] = (exposures[variant] || 0) + 1;
      } else if (metadata.event_type === "conversion") {
        conversions[variant] = (conversions[variant] || 0) + 1;
      }
    }

    // Calculate conversion rates
    const sampleSizes: Record<string, number> = {};
    const conversionRates: Record<string, number> = {};
    let bestVariant = variants[0];
    let bestRate = 0;

    for (const variant of variants) {
      const exposureCount = exposures[variant] || 0;
      const conversionCount = conversions[variant] || 0;
      sampleSizes[variant] = exposureCount;
      conversionRates[variant] =
        exposureCount > 0 ? conversionCount / exposureCount : 0;

      if (conversionRates[variant] > bestRate) {
        bestRate = conversionRates[variant];
        bestVariant = variant;
      }
    }

    return {
      variants,
      exposures,
      conversions,
      sampleSizes,
      conversionRates,
      bestVariant,
      degreesOfFreedom: variants.length - 1,
    };
  }

  /**
   * Chi-square test for conversion rate differences
   *
   * Formula: χ² = Σ[(Observed - Expected)² / Expected]
   *
   * @param data - Aggregated experiment data
   * @returns Chi-square statistic
   */
  private chiSquareTest(data: ExperimentData): number {
    const { variants, exposures, conversions } = data;

    // Calculate total exposures and conversions
    const totalExposures = variants.reduce(
      (sum, v) => sum + (exposures[v] || 0),
      0,
    );
    const totalConversions = variants.reduce(
      (sum, v) => sum + (conversions[v] || 0),
      0,
    );

    // Overall conversion rate (expected)
    const expectedRate = totalConversions / totalExposures;

    // Calculate chi-square statistic
    let chiSquare = 0;
    for (const variant of variants) {
      const observed = conversions[variant] || 0;
      const expected = (exposures[variant] || 0) * expectedRate;

      if (expected > 0) {
        chiSquare += Math.pow(observed - expected, 2) / expected;
      }
    }

    return chiSquare;
  }

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
  private calculatePValue(chiSquare: number, df: number): number {
    // Simplified chi-square p-value calculation
    // For more accurate results, use a statistics library

    // Critical values for chi-square distribution (df = 1 to 5)
    const criticalValues: Record<number, number> = {
      1: 3.841, // 95% confidence (α = 0.05)
      2: 5.991,
      3: 7.815,
      4: 9.488,
      5: 11.07,
    };

    const critical = criticalValues[df] || criticalValues[5];

    // Simple approximation: if chiSquare > critical, p < 0.05
    if (chiSquare > critical) {
      // Approximate p-value based on how far above critical
      const ratio = chiSquare / critical;
      return Math.max(0.001, 0.05 / ratio); // Approximate
    }

    // If below critical, p > 0.05
    return 0.05 + 0.95 * (1 - chiSquare / critical);
  }

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
  calculateSampleSize(
    baselineRate: number,
    minDetectableEffect: number,
    alpha: number = 0.05,
    power: number = 0.8,
  ): number {
    // Simplified formula (use proper stats library in production)
    const zAlpha = 1.96; // 95% confidence
    const zBeta = 0.84; // 80% power
    const p1 = baselineRate;
    const p2 = baselineRate * (1 + minDetectableEffect);
    const pBar = (p1 + p2) / 2;

    return Math.ceil(
      (2 * Math.pow(zAlpha + zBeta, 2) * pBar * (1 - pBar)) /
        Math.pow(p2 - p1, 2),
    );
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const abTestingService = new ABTestingService();
