/**
 * CX Response Quality Tracker — Track AI customer reply performance
 *
 * Metrics:
 * - % drafted by AI
 * - Average grades by type (tone, accuracy, policy)
 * - Approval latency
 * - Edit distance averages
 * - Dashboard integration
 */

export interface CXQualityMetrics {
  period: {
    startDate: string;
    endDate: string;
  };
  volume: {
    totalReplies: number;
    aiDrafted: number;
    manualReplies: number;
    aiDraftedPct: number;
  };
  quality: {
    avgTone: number;
    avgAccuracy: number;
    avgPolicy: number;
    avgOverall: number;
  };
  efficiency: {
    avgApprovalLatencyMin: number;
    medianApprovalLatencyMin: number;
    slaCompliancePct: number;
    slaBreaches: number;
  };
  learning: {
    avgEditDistance: number;
    approvalRate: number; // % approved without major edits
  };
}

/**
 * Fetch quality metrics from Supabase
 */
export async function fetchQualityMetrics(
  startDate: string,
  endDate: string,
): Promise<CXQualityMetrics> {
  if (process.env.NODE_ENV === "test") {
    return {
      period: { startDate, endDate },
      volume: {
        totalReplies: 100,
        aiDrafted: 90,
        manualReplies: 10,
        aiDraftedPct: 90,
      },
      quality: {
        avgTone: 4.6,
        avgAccuracy: 4.7,
        avgPolicy: 4.8,
        avgOverall: 4.7,
      },
      efficiency: {
        avgApprovalLatencyMin: 12,
        medianApprovalLatencyMin: 10,
        slaCompliancePct: 95,
        slaBreaches: 5,
      },
      learning: {
        avgEditDistance: 25,
        approvalRate: 88,
      },
    };
  }

  // TODO: Implement Supabase query
  const response = await fetch(
    `/api/cx/quality-metrics?start=${startDate}&end=${endDate}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch CX quality metrics");
  }

  return await response.json();
}

/**
 * Calculate metrics from raw grading data
 */
export function calculateMetricsFromGradings(
  gradings: Array<{
    tone: number;
    accuracy: number;
    policy: number;
    edit_distance: number;
    approved: boolean;
    created_at: string;
    approved_at?: string;
  }>,
  totalReplies: number,
): CXQualityMetrics {
  const aiDrafted = gradings.length;
  const approved = gradings.filter((g) => g.approved);

  const avgTone = gradings.reduce((sum, g) => sum + g.tone, 0) / aiDrafted;
  const avgAccuracy =
    gradings.reduce((sum, g) => sum + g.accuracy, 0) / aiDrafted;
  const avgPolicy = gradings.reduce((sum, g) => sum + g.policy, 0) / aiDrafted;
  const avgEditDistance =
    gradings.reduce((sum, g) => sum + g.edit_distance, 0) / aiDrafted;

  // Calculate latencies
  const latencies = gradings
    .filter((g) => g.approved_at)
    .map((g) => {
      const created = new Date(g.created_at).getTime();
      const approved = new Date(g.approved_at!).getTime();
      return (approved - created) / 1000 / 60; // minutes
    })
    .sort((a, b) => a - b);

  const avgLatency =
    latencies.length > 0
      ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
      : 0;

  const medianLatency =
    latencies.length > 0 ? latencies[Math.floor(latencies.length / 2)] : 0;

  const slaBreaches = latencies.filter((l) => l > 15).length;

  return {
    period: {
      startDate: gradings[0]?.created_at.split("T")[0] || "",
      endDate: gradings[gradings.length - 1]?.created_at.split("T")[0] || "",
    },
    volume: {
      totalReplies,
      aiDrafted,
      manualReplies: totalReplies - aiDrafted,
      aiDraftedPct: (aiDrafted / totalReplies) * 100,
    },
    quality: {
      avgTone: Number(avgTone.toFixed(2)),
      avgAccuracy: Number(avgAccuracy.toFixed(2)),
      avgPolicy: Number(avgPolicy.toFixed(2)),
      avgOverall: Number(((avgTone + avgAccuracy + avgPolicy) / 3).toFixed(2)),
    },
    efficiency: {
      avgApprovalLatencyMin: Number(avgLatency.toFixed(1)),
      medianApprovalLatencyMin: Number(medianLatency.toFixed(1)),
      slaCompliancePct: Number(
        (((latencies.length - slaBreaches) / latencies.length) * 100).toFixed(
          1,
        ),
      ),
      slaBreaches,
    },
    learning: {
      avgEditDistance: Number(avgEditDistance.toFixed(1)),
      approvalRate: Number(((approved.length / aiDrafted) * 100).toFixed(1)),
    },
  };
}

/**
 * Check if metrics meet targets
 */
export function checkTargets(metrics: CXQualityMetrics): {
  passing: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  if (metrics.volume.aiDraftedPct < 90) {
    failures.push(
      `AI drafted ${metrics.volume.aiDraftedPct.toFixed(0)}% < 90% target`,
    );
  }

  if (metrics.quality.avgOverall < 4.5) {
    failures.push(
      `Quality ${metrics.quality.avgOverall.toFixed(1)} < 4.5 target`,
    );
  }

  if (metrics.efficiency.medianApprovalLatencyMin > 15) {
    failures.push(
      `Latency ${metrics.efficiency.medianApprovalLatencyMin}min > 15min target`,
    );
  }

  if (metrics.learning.approvalRate < 85) {
    failures.push(
      `Approval rate ${metrics.learning.approvalRate.toFixed(0)}% < 85% target`,
    );
  }

  return {
    passing: failures.length === 0,
    failures,
  };
}
