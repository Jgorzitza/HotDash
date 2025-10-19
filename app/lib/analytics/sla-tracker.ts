/**
 * SLA Compliance Tracker
 *
 * Tracks analytics SLA metrics:
 * - P95 response time < 3s (North Star requirement)
 * - Uptime > 99.9%
 * - Error rate < 0.5%
 */

export interface SLAMetrics {
  responseTime: {
    p95: number;
    target: number;
    compliant: boolean;
  };
  uptime: {
    percentage: number;
    target: number;
    compliant: boolean;
  };
  errorRate: {
    percentage: number;
    target: number;
    compliant: boolean;
  };
  overall: "compliant" | "at_risk" | "violated";
}

/**
 * Calculate SLA compliance
 */
export function calculateSLA(
  p95ResponseTime: number,
  uptimePercentage: number,
  errorRate: number,
): SLAMetrics {
  const sla: SLAMetrics = {
    responseTime: {
      p95: p95ResponseTime,
      target: 3000, // 3 seconds
      compliant: p95ResponseTime < 3000,
    },
    uptime: {
      percentage: uptimePercentage,
      target: 99.9,
      compliant: uptimePercentage >= 99.9,
    },
    errorRate: {
      percentage: errorRate,
      target: 0.5,
      compliant: errorRate < 0.5,
    },
    overall: "compliant",
  };

  // Determine overall status
  const violations = [
    !sla.responseTime.compliant,
    !sla.uptime.compliant,
    !sla.errorRate.compliant,
  ].filter(Boolean).length;

  if (violations >= 2) {
    sla.overall = "violated";
  } else if (violations === 1) {
    sla.overall = "at_risk";
  }

  return sla;
}

/**
 * Get current SLA status (mock)
 */
export function getCurrentSLA(): SLAMetrics {
  return calculateSLA(450, 99.95, 0.2);
}
