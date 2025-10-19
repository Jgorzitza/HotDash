/**
 * Confidence Threshold Tuner — Auto-adjust based on grading trends
 *
 * Analyzes approval patterns and quality scores to dynamically adjust
 * the confidence threshold for when drafts should be auto-sent vs require review.
 *
 * Current policy: ALL drafts require HITL review (production-safe default).
 * This module prepares for future auto-send capability when quality is proven.
 */

export interface ConfidenceThreshold {
  minConfidence: number; // 0-1, minimum confidence to enable auto-send
  minQualityScore: number; // 1-5, minimum average quality score
  minApprovalRate: number; // 0-1, minimum approval rate without edits
  requiresReview: boolean; // Always true for production safety
}

export interface ThresholdAdjustment {
  previousThreshold: ConfidenceThreshold;
  newThreshold: ConfidenceThreshold;
  reason: string;
  recommendation: string;
}

/**
 * Default production threshold (conservative, HITL required)
 */
export const DEFAULT_THRESHOLD: ConfidenceThreshold = {
  minConfidence: 0.95, // Very high confidence required
  minQualityScore: 4.8, // Near-perfect quality
  minApprovalRate: 0.95, // 95% approval without edits
  requiresReview: true, // ALWAYS require human review
};

/**
 * Calculate recommended confidence threshold based on historical performance
 */
export function calculateRecommendedThreshold(
  avgQualityScore: number, // 1-5
  approvalRate: number, // 0-1
  avgConfidence: number, // 0-1
  totalDrafts: number,
): ConfidenceThreshold {
  // SAFETY: Always require review unless explicitly proven safe
  // This is a future-proofing function, not currently used in production

  // Require significant data before considering auto-send
  if (totalDrafts < 100) {
    return {
      ...DEFAULT_THRESHOLD,
      requiresReview: true,
    };
  }

  // Require exceptional performance across all metrics
  const meetsQualityBar =
    avgQualityScore >= 4.8 && approvalRate >= 0.95 && avgConfidence >= 0.9;

  if (!meetsQualityBar) {
    return {
      ...DEFAULT_THRESHOLD,
      requiresReview: true,
    };
  }

  // Even with excellent performance, require review for production safety
  // Future: This could be relaxed with CEO approval and monitoring
  return {
    minConfidence: Math.min(0.95, avgConfidence + 0.05),
    minQualityScore: Math.max(4.5, avgQualityScore - 0.2),
    minApprovalRate: Math.max(0.9, approvalRate - 0.05),
    requiresReview: true, // ALWAYS true for safety
  };
}

/**
 * Evaluate if threshold should be adjusted
 */
export function evaluateThresholdAdjustment(
  currentThreshold: ConfidenceThreshold,
  recentAvgQualityScore: number,
  recentApprovalRate: number,
  recentAvgConfidence: number,
  recentTotalDrafts: number,
): ThresholdAdjustment {
  const recommendedThreshold = calculateRecommendedThreshold(
    recentAvgQualityScore,
    recentApprovalRate,
    recentAvgConfidence,
    recentTotalDrafts,
  );

  // Determine if adjustment is needed
  const needsAdjustment =
    Math.abs(
      recommendedThreshold.minConfidence - currentThreshold.minConfidence,
    ) > 0.05 ||
    Math.abs(
      recommendedThreshold.minQualityScore - currentThreshold.minQualityScore,
    ) > 0.2;

  let reason = "No adjustment needed - performance stable";
  let recommendation = "Continue monitoring current performance";

  if (recentTotalDrafts < 100) {
    reason = "Insufficient data for threshold adjustment";
    recommendation = `Collect ${100 - recentTotalDrafts} more drafts before adjusting`;
  } else if (recentAvgQualityScore < 4.5) {
    reason = "Quality score below target (< 4.5)";
    recommendation =
      "Focus on improving draft quality through RAG knowledge base updates";
  } else if (recentApprovalRate < 0.85) {
    reason = "Approval rate below target (< 85%)";
    recommendation = "Analyze rejection reasons and update prompt templates";
  } else if (needsAdjustment && recentAvgQualityScore >= 4.8) {
    reason = "Excellent performance - threshold could be adjusted";
    recommendation =
      "Performance meets criteria but HITL review still required for safety";
  }

  return {
    previousThreshold: currentThreshold,
    newThreshold: recommendedThreshold,
    reason,
    recommendation,
  };
}

/**
 * Check if draft meets threshold for auto-send (future capability)
 */
export function meetsAutoSendThreshold(
  draftConfidence: number,
  qualityScore: number,
  threshold: ConfidenceThreshold,
): { autoSend: boolean; reason: string } {
  // SAFETY: Never auto-send in production (requiresReview always true)
  if (threshold.requiresReview) {
    return {
      autoSend: false,
      reason: "HITL review required per production safety policy",
    };
  }

  if (draftConfidence < threshold.minConfidence) {
    return {
      autoSend: false,
      reason: `Confidence ${(draftConfidence * 100).toFixed(0)}% below threshold ${(threshold.minConfidence * 100).toFixed(0)}%`,
    };
  }

  if (qualityScore < threshold.minQualityScore) {
    return {
      autoSend: false,
      reason: `Quality score ${qualityScore.toFixed(1)} below threshold ${threshold.minQualityScore.toFixed(1)}`,
    };
  }

  return {
    autoSend: true,
    reason: "Meets all auto-send criteria",
  };
}

/**
 * Generate confidence tuning report
 */
export function generateTuningReport(
  adjustment: ThresholdAdjustment,
  recentMetrics: {
    avgQualityScore: number;
    approvalRate: number;
    avgConfidence: number;
    totalDrafts: number;
  },
): string {
  const lines = [
    "# Confidence Threshold Tuning Report",
    "",
    "## Recent Performance",
    `- Total Drafts: ${recentMetrics.totalDrafts}`,
    `- Avg Quality Score: ${recentMetrics.avgQualityScore.toFixed(2)} / 5.0`,
    `- Approval Rate: ${(recentMetrics.approvalRate * 100).toFixed(1)}%`,
    `- Avg Confidence: ${(recentMetrics.avgConfidence * 100).toFixed(1)}%`,
    "",
    "## Current Threshold",
    `- Min Confidence: ${(adjustment.previousThreshold.minConfidence * 100).toFixed(0)}%`,
    `- Min Quality Score: ${adjustment.previousThreshold.minQualityScore.toFixed(1)}`,
    `- Min Approval Rate: ${(adjustment.previousThreshold.minApprovalRate * 100).toFixed(0)}%`,
    `- Requires Review: ${adjustment.previousThreshold.requiresReview ? "Yes (PRODUCTION SAFE)" : "No"}`,
    "",
    "## Recommended Threshold",
    `- Min Confidence: ${(adjustment.newThreshold.minConfidence * 100).toFixed(0)}%`,
    `- Min Quality Score: ${adjustment.newThreshold.minQualityScore.toFixed(1)}`,
    `- Min Approval Rate: ${(adjustment.newThreshold.minApprovalRate * 100).toFixed(0)}%`,
    `- Requires Review: ${adjustment.newThreshold.requiresReview ? "Yes (PRODUCTION SAFE)" : "No"}`,
    "",
    "## Analysis",
    `**Reason:** ${adjustment.reason}`,
    "",
    `**Recommendation:** ${adjustment.recommendation}`,
    "",
    "## Safety Note",
    "All customer-facing replies require human review per HITL policy.",
    "Auto-send is disabled in production for customer trust and safety.",
  ];

  return lines.join("\n");
}
