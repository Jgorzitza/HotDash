/**
 * SEO Approvals Evidence Package
 *
 * Wires SEO recommendations to HITL approvals system
 */

import type { SEORecommendation } from "./recommendations";
import type { VitalsAssessment } from "./vitals";

export interface SEOApprovalPayload {
  kind: "seo.recommendation";
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  evidence: Array<{
    source: string;
    timestamp: string;
    data: Record<string, any>;
  }>;
  proposedChanges: Array<{
    type: string;
    action: string;
  }>;
  projectedImpact: {
    metric: string;
    projected: string;
    confidence: string;
  };
  rollback: {
    steps: string[];
    monitoringWindow: string;
  };
  approversRequired: string[];
}

/**
 * Converts SEO recommendation to approval payload for HITL workflow
 *
 * Packages recommendation with evidence, impact projections, and rollback plan
 * per North Star HITL requirements.
 *
 * @param recommendation - SEO recommendation to convert
 * @param vitals - Optional Core Web Vitals data for evidence
 * @returns Approval payload ready for approvals drawer
 *
 * @example
 * ```typescript
 * const recommendation = generatePerformanceRecommendations(vitals, url)[0];
 * const payload = createSEOApprovalPayload(recommendation, vitals);
 * // Payload includes evidence, impact, rollback for Product/Engineer approval
 * ```
 */
export function createSEOApprovalPayload(
  recommendation: SEORecommendation,
  vitals?: VitalsAssessment[],
): SEOApprovalPayload {
  const evidence: Array<{
    source: string;
    timestamp: string;
    data: Record<string, any>;
  }> = [
    {
      source: "SEO Agent",
      timestamp: new Date().toISOString(),
      data: { recommendation: recommendation.title },
    },
  ];

  if (vitals) {
    evidence.push({
      source: "Core Web Vitals",
      timestamp: new Date().toISOString(),
      data: {
        vitals: vitals.map((v) => ({ metric: v.metric, passes: v.passes })),
      },
    });
  }

  return {
    kind: "seo.recommendation",
    id: recommendation.id,
    title: recommendation.title,
    description: recommendation.description,
    priority: recommendation.priority,
    evidence,
    proposedChanges: recommendation.proposedActions.map((action) => ({
      type: recommendation.type,
      action,
    })),
    projectedImpact: {
      metric: recommendation.projectedImpact.metric,
      projected: `+${recommendation.projectedImpact.estimatedChange * 100}%`,
      confidence: recommendation.projectedImpact.confidence,
    },
    rollback: {
      steps: recommendation.rollbackPlan,
      monitoringWindow: "48 hours",
    },
    approversRequired: recommendation.approversRequired,
  };
}
