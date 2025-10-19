/**
 * A/B Test Results Tracking
 *
 * Tracks and analyzes A/B test results for statistical significance.
 */

export interface ABTestResult {
  testId: string;
  testName: string;
  startDate: string;
  endDate?: string;
  status: "running" | "completed" | "stopped";
  variants: {
    control: ABTestVariant;
    treatment: ABTestVariant;
  };
  winner?: "control" | "treatment" | "inconclusive";
  confidence: number; // 0-100
  statistically_significant: boolean;
}

export interface ABTestVariant {
  name: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
}

/**
 * Calculate statistical significance using Z-test
 */
function calculateSignificance(
  control: ABTestVariant,
  treatment: ABTestVariant,
): { significant: boolean; confidence: number; pValue: number } {
  const p1 = control.conversionRate / 100;
  const p2 = treatment.conversionRate / 100;
  const n1 = control.sessions;
  const n2 = treatment.sessions;

  const pooled = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  const zScore = Math.abs((p2 - p1) / se);

  // Approximate p-value from z-score
  const pValue = 2 * (1 - normalCDF(zScore));
  const confidence = (1 - pValue) * 100;

  return {
    significant: pValue < 0.05,
    confidence,
    pValue,
  };
}

/**
 * Approximation of normal CDF
 */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

/**
 * Analyze A/B test results
 */
export function analyzeABTest(
  control: ABTestVariant,
  treatment: ABTestVariant,
): {
  winner: "control" | "treatment" | "inconclusive";
  confidence: number;
  lift: number;
  significant: boolean;
} {
  const { significant, confidence } = calculateSignificance(control, treatment);

  const lift =
    ((treatment.conversionRate - control.conversionRate) /
      control.conversionRate) *
    100;

  let winner: "control" | "treatment" | "inconclusive";

  if (!significant) {
    winner = "inconclusive";
  } else if (treatment.conversionRate > control.conversionRate) {
    winner = "treatment";
  } else {
    winner = "control";
  }

  return {
    winner,
    confidence,
    lift,
    significant,
  };
}
