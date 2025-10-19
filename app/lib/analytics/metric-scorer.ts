/**
 * Metric Accuracy Scoring System
 *
 * Scores metrics based on:
 * - Data completeness
 * - Validation pass rate
 * - Reconciliation accuracy
 * - Freshness
 */

export interface MetricScore {
  metric: string;
  overallScore: number; // 0-100
  components: {
    completeness: number; // 0-100
    validation: number; // 0-100
    reconciliation: number; // 0-100
    freshness: number; // 0-100
  };
  grade: "A" | "B" | "C" | "D" | "F";
  issues: string[];
}

/**
 * Calculate metric completeness score
 * Checks if all required fields are present and non-zero
 */
function scoreCompleteness(metric: any, requiredFields: string[]): number {
  let presentFields = 0;

  for (const field of requiredFields) {
    if (
      metric[field] !== null &&
      metric[field] !== undefined &&
      metric[field] !== 0
    ) {
      presentFields++;
    }
  }

  return (presentFields / requiredFields.length) * 100;
}

/**
 * Calculate validation score
 * Based on validation result from validators.ts
 */
function scoreValidation(validationResult: {
  valid: boolean;
  errors: string[];
  warnings: string[];
}): number {
  if (validationResult.valid && validationResult.warnings.length === 0) {
    return 100;
  }

  if (validationResult.valid && validationResult.warnings.length > 0) {
    return Math.max(70, 100 - validationResult.warnings.length * 10);
  }

  // Has errors
  return Math.max(0, 50 - validationResult.errors.length * 10);
}

/**
 * Calculate reconciliation score
 * How closely GA4 and Shopify data match
 */
function scoreReconciliation(discrepancyPercent: number): number {
  if (discrepancyPercent < 1) return 100; // <1% = perfect
  if (discrepancyPercent < 3) return 90; // <3% = excellent
  if (discrepancyPercent < 5) return 75; // <5% = good
  if (discrepancyPercent < 10) return 50; // <10% = acceptable
  return Math.max(0, 50 - discrepancyPercent); // >10% = poor
}

/**
 * Calculate freshness score
 * How recent is the data
 */
function scoreFreshness(timestamp: string): number {
  const now = Date.now();
  const dataTime = new Date(timestamp).getTime();
  const ageMinutes = (now - dataTime) / (60 * 1000);

  if (ageMinutes < 5) return 100; // <5min = perfect
  if (ageMinutes < 15) return 90; // <15min = excellent
  if (ageMinutes < 60) return 75; // <1hr = good
  if (ageMinutes < 180) return 50; // <3hr = acceptable
  return Math.max(0, 50 - ageMinutes / 10); // >3hr = poor
}

/**
 * Calculate overall metric score
 */
export function scoreMetric(
  metricName: string,
  metricData: any,
  validationResult: { valid: boolean; errors: string[]; warnings: string[] },
  reconciliationDiscrepancy?: number,
): MetricScore {
  const components = {
    completeness: scoreCompleteness(metricData, ["value", "period"]),
    validation: scoreValidation(validationResult),
    reconciliation:
      reconciliationDiscrepancy !== undefined
        ? scoreReconciliation(reconciliationDiscrepancy)
        : 100,
    freshness: metricData.timestamp ? scoreFreshness(metricData.timestamp) : 50,
  };

  // Weighted average
  const weights = {
    completeness: 0.2,
    validation: 0.4,
    reconciliation: 0.3,
    freshness: 0.1,
  };

  const overallScore =
    components.completeness * weights.completeness +
    components.validation * weights.validation +
    components.reconciliation * weights.reconciliation +
    components.freshness * weights.freshness;

  // Assign grade
  let grade: "A" | "B" | "C" | "D" | "F";
  if (overallScore >= 90) grade = "A";
  else if (overallScore >= 80) grade = "B";
  else if (overallScore >= 70) grade = "C";
  else if (overallScore >= 60) grade = "D";
  else grade = "F";

  // Collect issues
  const issues: string[] = [];
  if (components.completeness < 80) {
    issues.push("Incomplete data - missing required fields");
  }
  if (components.validation < 80) {
    issues.push(
      `Validation issues: ${validationResult.errors.length} errors, ${validationResult.warnings.length} warnings`,
    );
  }
  if (components.reconciliation < 80) {
    issues.push(
      `Data reconciliation issue: ${reconciliationDiscrepancy?.toFixed(2)}% discrepancy`,
    );
  }
  if (components.freshness < 80) {
    issues.push("Stale data - update needed");
  }

  return {
    metric: metricName,
    overallScore,
    components,
    grade,
    issues,
  };
}

/**
 * Generate scorecard for all metrics
 */
export function generateScorecard(
  metrics: Array<{
    name: string;
    data: any;
    validation: any;
    reconciliation?: number;
  }>,
): {
  scores: MetricScore[];
  overallGrade: string;
  summary: string;
} {
  const scores = metrics.map((m) =>
    scoreMetric(m.name, m.data, m.validation, m.reconciliation),
  );

  const avgScore =
    scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length;

  let overallGrade;
  if (avgScore >= 90) overallGrade = "A";
  else if (avgScore >= 80) overallGrade = "B";
  else if (avgScore >= 70) overallGrade = "C";
  else if (avgScore >= 60) overallGrade = "D";
  else overallGrade = "F";

  const summary = `Overall Grade: ${overallGrade} (${avgScore.toFixed(1)}/100) - ${scores.length} metrics assessed`;

  return {
    scores,
    overallGrade,
    summary,
  };
}
