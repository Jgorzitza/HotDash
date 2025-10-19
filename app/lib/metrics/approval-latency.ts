/**
 * Approval Latency Tracker — Monitor SLA compliance for HITL approvals
 *
 * Tracks time from draft creation to approval/rejection.
 * Target: ≤ 15 minutes median approval time (North Star SLA).
 */

export interface ApprovalLatencyRecord {
  conversationId: string;
  draftCreatedAt: string; // ISO 8601
  approvalCompletedAt: string; // ISO 8601
  latencySeconds: number;
  approved: boolean;
  withinSLA: boolean; // <= 15 minutes
}

export interface LatencyMetrics {
  totalApprovals: number;
  medianLatencySeconds: number;
  meanLatencySeconds: number;
  p95LatencySeconds: number;
  slaComplianceRate: number; // 0-100%
  withinSLACount: number;
  breachCount: number;
  fastestSeconds: number;
  slowestSeconds: number;
}

const SLA_TARGET_SECONDS = 15 * 60; // 15 minutes

/**
 * Calculate latency between two timestamps
 */
export function calculateLatency(
  draftCreatedAt: string,
  approvalCompletedAt: string,
): number {
  const start = new Date(draftCreatedAt).getTime();
  const end = new Date(approvalCompletedAt).getTime();
  return Math.floor((end - start) / 1000); // seconds
}

/**
 * Check if latency meets SLA target
 */
export function isWithinSLA(latencySeconds: number): boolean {
  return latencySeconds <= SLA_TARGET_SECONDS;
}

/**
 * Create approval latency record
 */
export function createLatencyRecord(
  conversationId: string,
  draftCreatedAt: string,
  approvalCompletedAt: string,
  approved: boolean,
): ApprovalLatencyRecord {
  const latencySeconds = calculateLatency(draftCreatedAt, approvalCompletedAt);

  return {
    conversationId,
    draftCreatedAt,
    approvalCompletedAt,
    latencySeconds,
    approved,
    withinSLA: isWithinSLA(latencySeconds),
  };
}

/**
 * Calculate percentile from sorted array
 */
function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;

  const index = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

/**
 * Analyze latency metrics from records
 */
export function analyzeLatencyMetrics(
  records: ApprovalLatencyRecord[],
): LatencyMetrics {
  if (records.length === 0) {
    return {
      totalApprovals: 0,
      medianLatencySeconds: 0,
      meanLatencySeconds: 0,
      p95LatencySeconds: 0,
      slaComplianceRate: 0,
      withinSLACount: 0,
      breachCount: 0,
      fastestSeconds: 0,
      slowestSeconds: 0,
    };
  }

  const latencies = records.map((r) => r.latencySeconds).sort((a, b) => a - b);
  const withinSLACount = records.filter((r) => r.withinSLA).length;

  const meanLatency =
    latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
  const medianLatency = percentile(latencies, 50);
  const p95Latency = percentile(latencies, 95);

  return {
    totalApprovals: records.length,
    medianLatencySeconds: Math.round(medianLatency),
    meanLatencySeconds: Math.round(meanLatency),
    p95LatencySeconds: Math.round(p95Latency),
    slaComplianceRate: Number(
      ((withinSLACount / records.length) * 100).toFixed(2),
    ),
    withinSLACount,
    breachCount: records.length - withinSLACount,
    fastestSeconds: latencies[0],
    slowestSeconds: latencies[latencies.length - 1],
  };
}

/**
 * Format latency for human-readable display
 */
export function formatLatency(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Get SLA status badge info
 */
export function getSLAStatus(latencySeconds: number): {
  label: string;
  tone: "success" | "attention" | "critical";
} {
  const withinSLA = isWithinSLA(latencySeconds);

  if (withinSLA && latencySeconds <= 5 * 60) {
    return { label: "Excellent", tone: "success" };
  }

  if (withinSLA) {
    return { label: "Within SLA", tone: "success" };
  }

  if (latencySeconds <= 30 * 60) {
    return { label: "SLA Breach", tone: "attention" };
  }

  return { label: "Critical Delay", tone: "critical" };
}

/**
 * Identify records needing escalation
 */
export function getBreachedApprovals(
  records: ApprovalLatencyRecord[],
): ApprovalLatencyRecord[] {
  return records.filter((r) => !r.withinSLA);
}

/**
 * Calculate SLA compliance trend (compare to previous period)
 */
export function calculateComplianceTrend(
  currentRecords: ApprovalLatencyRecord[],
  previousRecords: ApprovalLatencyRecord[],
): {
  direction: "up" | "down" | "neutral";
  change: number; // percentage points
} {
  const current = analyzeLatencyMetrics(currentRecords);
  const previous = analyzeLatencyMetrics(previousRecords);

  if (previous.totalApprovals === 0) {
    return { direction: "neutral", change: 0 };
  }

  const change = current.slaComplianceRate - previous.slaComplianceRate;

  if (Math.abs(change) < 1) {
    return { direction: "neutral", change: 0 };
  }

  return {
    direction: change > 0 ? "up" : "down",
    change: Number(Math.abs(change).toFixed(2)),
  };
}
