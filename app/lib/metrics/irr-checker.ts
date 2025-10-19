/**
 * Inter-Rater Reliability Checker — Ensure scoring consistency
 *
 * Measures agreement between different graders on the same drafts.
 * Helps ensure reliable learning signals.
 */

export interface GraderScore {
  graderId: string;
  tone: number;
  accuracy: number;
  policy: number;
}

export interface IRRAnalysis {
  draftId: string;
  scores: GraderScore[];
  agreement: {
    tone: number; // 0-1, 1 = perfect agreement
    accuracy: number;
    policy: number;
    overall: number;
  };
  interpretation: "excellent" | "good" | "fair" | "poor";
  needsCalibration: boolean;
}

/**
 * Calculate percentage agreement for a dimension
 */
function calculateAgreement(scores: number[]): number {
  if (scores.length < 2) return 1;

  let agreements = 0;
  let comparisons = 0;

  for (let i = 0; i < scores.length; i++) {
    for (let j = i + 1; j < scores.length; j++) {
      comparisons++;
      // Count as agreement if within 1 point
      if (Math.abs(scores[i] - scores[j]) <= 1) {
        agreements++;
      }
    }
  }

  return comparisons > 0 ? agreements / comparisons : 1;
}

/**
 * Calculate IRR for multiple graders on same draft
 */
export function calculateIRR(
  draftId: string,
  graderScores: GraderScore[],
): IRRAnalysis {
  if (graderScores.length < 2) {
    return {
      draftId,
      scores: graderScores,
      agreement: { tone: 1, accuracy: 1, policy: 1, overall: 1 },
      interpretation: "excellent",
      needsCalibration: false,
    };
  }

  const toneScores = graderScores.map((g) => g.tone);
  const accuracyScores = graderScores.map((g) => g.accuracy);
  const policyScores = graderScores.map((g) => g.policy);

  const toneAgreement = calculateAgreement(toneScores);
  const accuracyAgreement = calculateAgreement(accuracyScores);
  const policyAgreement = calculateAgreement(policyScores);
  const overallAgreement =
    (toneAgreement + accuracyAgreement + policyAgreement) / 3;

  let interpretation: IRRAnalysis["interpretation"] = "poor";
  if (overallAgreement >= 0.9) interpretation = "excellent";
  else if (overallAgreement >= 0.75) interpretation = "good";
  else if (overallAgreement >= 0.6) interpretation = "fair";

  const needsCalibration = overallAgreement < 0.75;

  return {
    draftId,
    scores: graderScores,
    agreement: {
      tone: Number(toneAgreement.toFixed(2)),
      accuracy: Number(accuracyAgreement.toFixed(2)),
      policy: Number(policyAgreement.toFixed(2)),
      overall: Number(overallAgreement.toFixed(2)),
    },
    interpretation,
    needsCalibration,
  };
}

/**
 * Analyze IRR across multiple drafts
 */
export function analyzeOverallIRR(analyses: IRRAnalysis[]): {
  avgAgreement: number;
  needsCalibration: number; // count of drafts needing calibration
  gradersNeedingTraining: string[];
  recommendation: string;
} {
  if (analyses.length === 0) {
    return {
      avgAgreement: 0,
      needsCalibration: 0,
      gradersNeedingTraining: [],
      recommendation: "No data to analyze",
    };
  }

  const avgAgreement =
    analyses.reduce((sum, a) => sum + a.agreement.overall, 0) / analyses.length;
  const needsCalibration = analyses.filter((a) => a.needsCalibration).length;

  // Identify graders with consistently low agreement
  const graderStats = new Map<
    string,
    { agreements: number[]; total: number }
  >();

  for (const analysis of analyses) {
    for (const score of analysis.scores) {
      const stats = graderStats.get(score.graderId) || {
        agreements: [],
        total: 0,
      };
      stats.agreements.push(analysis.agreement.overall);
      stats.total++;
      graderStats.set(score.graderId, stats);
    }
  }

  const gradersNeedingTraining: string[] = [];
  for (const [graderId, stats] of graderStats.entries()) {
    const avgGraderAgreement =
      stats.agreements.reduce((sum, a) => sum + a, 0) / stats.total;
    if (avgGraderAgreement < 0.7) {
      gradersNeedingTraining.push(graderId);
    }
  }

  let recommendation = "";
  if (avgAgreement >= 0.9) {
    recommendation =
      "Excellent inter-rater reliability. Grading is consistent.";
  } else if (avgAgreement >= 0.75) {
    recommendation = "Good reliability. Minor calibration may help.";
  } else if (avgAgreement >= 0.6) {
    recommendation = "Fair reliability. Schedule calibration training.";
  } else {
    recommendation =
      "Poor reliability. Immediate calibration training required.";
  }

  if (gradersNeedingTraining.length > 0) {
    recommendation += ` Focus on: ${gradersNeedingTraining.join(", ")}`;
  }

  return {
    avgAgreement: Number(avgAgreement.toFixed(2)),
    needsCalibration,
    gradersNeedingTraining,
    recommendation,
  };
}
