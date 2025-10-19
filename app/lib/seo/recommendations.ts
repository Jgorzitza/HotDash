/**
 * SEO Recommendations Generator
 *
 * Generates HITL-ready SEO recommendations based on performance metrics
 */

import type { VitalsAssessment } from "./vitals";

export interface SEORecommendation {
  id: string;
  type: "technical" | "content" | "keywords" | "performance";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  proposedActions: string[];
  projectedImpact: {
    metric: string;
    estimatedChange: number;
    confidence: "high" | "medium" | "low";
  };
  rollbackPlan: string[];
  approversRequired: string[];
}

/**
 * Determines severity from vital value and threshold
 */
function getVitalSeverity(
  metric: string,
  value: number,
  threshold: number,
): "critical" | "warning" {
  const CRITICAL_THRESHOLDS = { LCP: 4000, FID: 300, CLS: 0.25 };
  const criticalThreshold =
    CRITICAL_THRESHOLDS[metric as keyof typeof CRITICAL_THRESHOLDS];
  return value > criticalThreshold ? "critical" : "warning";
}

/**
 * Generates performance recommendations from Core Web Vitals data
 *
 * Analyzes failing vitals and creates actionable recommendations with:
 * - Specific optimization steps
 * - Impact estimates
 * - Rollback plans
 * - Required approvers
 *
 * @param vitals - Array of VitalsAssessment metrics
 * @param url - Page URL being analyzed
 * @returns Array of performance recommendations for HITL approval
 * @throws {Error} If vitals array is empty or url is invalid
 *
 * @example
 * ```typescript
 * const vitals = normalizeVitals({ LCP: 4500, FID: 150, CLS: 0.05 }, "mobile");
 * const recommendations = generatePerformanceRecommendations(vitals, "/products/hot-rods");
 * // Returns recommendations for failing LCP and FID
 * ```
 */
export function generatePerformanceRecommendations(
  vitals: VitalsAssessment[],
  url: string,
): SEORecommendation[] {
  // Input validation
  if (!Array.isArray(vitals) || vitals.length === 0) {
    throw new Error("vitals must be a non-empty array");
  }

  if (!url || typeof url !== "string" || url.trim().length === 0) {
    throw new Error("url must be a non-empty string");
  }

  const recommendations: SEORecommendation[] = [];
  const failingVitals = vitals.filter((v) => !v.passes);

  for (const vital of failingVitals) {
    const severity = getVitalSeverity(
      vital.metric,
      vital.value,
      vital.threshold,
    );

    recommendations.push({
      id: `perf-${vital.metric.toLowerCase()}-${url}`,
      type: "performance",
      priority: severity === "critical" ? "critical" : "high",
      title: `Fix ${vital.metric} Performance Issue`,
      description: `${vital.metric} exceeds threshold`,
      proposedActions: ["Optimize assets", "Lazy-load images"],
      projectedImpact: {
        metric: vital.metric,
        estimatedChange: -0.3,
        confidence: "medium",
      },
      rollbackPlan: ["Revert asset changes"],
      approversRequired: ["engineer", "product"],
    });
  }

  return recommendations;
}
