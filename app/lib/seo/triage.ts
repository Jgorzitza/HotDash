/**
 * SEO Anomaly Triage Workflow
 * Classify and assign anomalies by priority with SLA tracking
 */

import type { DetectedAnomaly } from "./anomalies-detector";

export type TriagePriority = "P0" | "P1" | "P2" | "P3";

export interface TriagedAnomaly {
  anomaly: DetectedAnomaly;
  priority: TriagePriority;
  assignedTo: string;
  sla: {
    triageDeadline: string;
    resolutionDeadline: string;
  };
  status: "pending" | "triaged" | "in_progress" | "resolved";
  triagedAt?: string;
  notes?: string;
}

/**
 * Classify anomaly by priority
 *
 * P0 (Critical): <48h triage SLA
 * - Traffic drop ≥40%
 * - Critical vitals failures
 * - Multiple critical issues same URL
 *
 * P1 (High): <72h triage SLA
 * - Traffic drop 20-40%
 * - Warning vitals
 * - Ranking drop ≥10 positions
 *
 * P2 (Medium): <1 week triage SLA
 * - Minor ranking shifts
 * - Cannibalization warnings
 *
 * P3 (Low): <2 weeks triage SLA
 * - Info-level anomalies
 */
export function classifyPriority(anomaly: DetectedAnomaly): TriagePriority {
  if (anomaly.severity === "critical") {
    return "P0";
  }

  if (anomaly.severity === "warning") {
    if (
      anomaly.type === "traffic" &&
      anomaly.metric.changePercent &&
      anomaly.metric.changePercent <= -0.2
    ) {
      return "P1";
    }
    if (anomaly.type === "ranking") {
      return "P1";
    }
    return "P2";
  }

  return "P3";
}

/**
 * Calculate SLA deadlines based on priority
 */
function calculateSLA(
  priority: TriagePriority,
  detectedAt: string,
): {
  triageDeadline: string;
  resolutionDeadline: string;
} {
  const detected = new Date(detectedAt);
  const triageHours = { P0: 48, P1: 72, P2: 168, P3: 336 }[priority];
  const resolutionHours = triageHours * 2;

  return {
    triageDeadline: new Date(
      detected.getTime() + triageHours * 60 * 60 * 1000,
    ).toISOString(),
    resolutionDeadline: new Date(
      detected.getTime() + resolutionHours * 60 * 60 * 1000,
    ).toISOString(),
  };
}

/**
 * Triage anomaly with priority classification and SLA assignment
 */
export function triageAnomaly(anomaly: DetectedAnomaly): TriagedAnomaly {
  const priority = classifyPriority(anomaly);
  const sla = calculateSLA(priority, anomaly.detectedAt);

  return {
    anomaly,
    priority,
    assignedTo: "seo-lane",
    sla,
    status: "pending",
  };
}

/**
 * Batch triage multiple anomalies
 */
export function batchTriage(anomalies: DetectedAnomaly[]): TriagedAnomaly[] {
  return anomalies.map(triageAnomaly).sort((a, b) => {
    const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Check if anomaly is past triage SLA
 */
export function isPastTriageSLA(triaged: TriagedAnomaly): boolean {
  if (triaged.status !== "pending") return false;
  return new Date() > new Date(triaged.sla.triageDeadline);
}

/**
 * Get overdue anomalies
 */
export function getOverdueAnomalies(
  triaged: TriagedAnomaly[],
): TriagedAnomaly[] {
  return triaged.filter(isPastTriageSLA);
}
