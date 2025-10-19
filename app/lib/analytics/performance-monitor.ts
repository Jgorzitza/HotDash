/**
 * Performance Degradation Detector
 *
 * Monitors analytics endpoint performance and alerts on degradation.
 */

export interface PerformanceMetric {
  endpoint: string;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  throughput: number;
}

export interface PerformanceBaseline {
  endpoint: string;
  baselineP95: number;
  baselineP99: number;
  baselineErrorRate: number;
}

const BASELINES: PerformanceBaseline[] = [
  {
    endpoint: "/api/analytics/revenue",
    baselineP95: 500,
    baselineP99: 800,
    baselineErrorRate: 0.01,
  },
  {
    endpoint: "/api/analytics/conversion-rate",
    baselineP95: 450,
    baselineP99: 750,
    baselineErrorRate: 0.01,
  },
  {
    endpoint: "/api/analytics/traffic",
    baselineP95: 600,
    baselineP99: 1000,
    baselineErrorRate: 0.01,
  },
];

/**
 * Check for performance degradation
 */
export function detectDegradation(current: PerformanceMetric): {
  degraded: boolean;
  reasons: string[];
  severity: "none" | "minor" | "major";
} {
  const baseline = BASELINES.find((b) => b.endpoint === current.endpoint);
  if (!baseline) {
    return { degraded: false, reasons: [], severity: "none" };
  }

  const reasons: string[] = [];

  // Check P95
  if (current.p95ResponseTime > baseline.baselineP95 * 1.5) {
    reasons.push(
      `P95 response time ${current.p95ResponseTime}ms exceeds baseline ${baseline.baselineP95}ms by >50%`,
    );
  }

  // Check error rate
  if (current.errorRate > baseline.baselineErrorRate * 3) {
    reasons.push(
      `Error rate ${(current.errorRate * 100).toFixed(2)}% is 3x baseline`,
    );
  }

  const severity =
    reasons.length >= 2 ? "major" : reasons.length === 1 ? "minor" : "none";

  return {
    degraded: reasons.length > 0,
    reasons,
    severity,
  };
}
