/**
 * Response Quality Metrics — Track AI customer reply performance
 *
 * Metrics tracked:
 * - % of replies drafted by AI
 * - Average grading scores (tone, accuracy, policy)
 * - Approval latency (time from draft to approval)
 * - Approval rate
 */

import type { CustomerReplyQualityMetrics } from "../../agents/customer/grading-schema";

export interface ResponseQualityMetrics {
  // Volume metrics
  totalReplies: number;
  aiDraftedCount: number;
  aiDraftedPercentage: number; // 0-100

  // Quality metrics
  avgTone: number; // 1-5
  avgAccuracy: number; // 1-5
  avgPolicy: number; // 1-5
  avgOverall: number; // 1-5 (average of tone, accuracy, policy)

  // Efficiency metrics
  approvalRate: number; // 0-100
  avgApprovalLatency?: number; // seconds

  // Learning metrics
  avgEditDistance: number;

  // Time period
  startDate: string;
  endDate: string;
}

/**
 * Calculate metrics from Supabase quality metrics view
 */
export function calculateMetrics(
  data: CustomerReplyQualityMetrics[],
  totalReplies: number,
): ResponseQualityMetrics {
  if (data.length === 0 || totalReplies === 0) {
    return {
      totalReplies: 0,
      aiDraftedCount: 0,
      aiDraftedPercentage: 0,
      avgTone: 0,
      avgAccuracy: 0,
      avgPolicy: 0,
      avgOverall: 0,
      approvalRate: 0,
      avgEditDistance: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    };
  }

  // Aggregate across all days
  const aiDraftedCount = data.reduce((sum, row) => sum + row.total_replies, 0);
  const approvedCount = data.reduce((sum, row) => sum + row.approved_count, 0);

  const avgTone =
    data.reduce((sum, row) => sum + row.avg_tone, 0) / data.length;
  const avgAccuracy =
    data.reduce((sum, row) => sum + row.avg_accuracy, 0) / data.length;
  const avgPolicy =
    data.reduce((sum, row) => sum + row.avg_policy, 0) / data.length;
  const avgEditDistance =
    data.reduce((sum, row) => sum + row.avg_edit_distance, 0) / data.length;

  const avgOverall = (avgTone + avgAccuracy + avgPolicy) / 3;
  const approvalRate = (approvedCount / aiDraftedCount) * 100;

  return {
    totalReplies,
    aiDraftedCount,
    aiDraftedPercentage: (aiDraftedCount / totalReplies) * 100,
    avgTone: Number(avgTone.toFixed(2)),
    avgAccuracy: Number(avgAccuracy.toFixed(2)),
    avgPolicy: Number(avgPolicy.toFixed(2)),
    avgOverall: Number(avgOverall.toFixed(2)),
    approvalRate: Number(approvalRate.toFixed(2)),
    avgEditDistance: Number(avgEditDistance.toFixed(2)),
    startDate: data[data.length - 1].date, // Oldest
    endDate: data[0].date, // Newest
  };
}

/**
 * Quality score interpretation
 */
export function interpretQualityScore(score: number): {
  label: string;
  tone: "success" | "attention" | "critical";
} {
  if (score >= 4.5) return { label: "Excellent", tone: "success" };
  if (score >= 4.0) return { label: "Good", tone: "success" };
  if (score >= 3.5) return { label: "Fair", tone: "attention" };
  if (score >= 3.0) return { label: "Needs Improvement", tone: "attention" };
  return { label: "Poor", tone: "critical" };
}

/**
 * Approval rate interpretation
 */
export function interpretApprovalRate(rate: number): {
  label: string;
  tone: "success" | "attention" | "critical";
} {
  if (rate >= 90) return { label: "Excellent", tone: "success" };
  if (rate >= 75) return { label: "Good", tone: "success" };
  if (rate >= 60) return { label: "Fair", tone: "attention" };
  if (rate >= 50) return { label: "Needs Improvement", tone: "attention" };
  return { label: "Poor", tone: "critical" };
}

/**
 * Format metrics for dashboard tile
 */
export interface DashboardTileData {
  title: string;
  value: string;
  subtitle: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
  };
  badge?: {
    label: string;
    tone: "success" | "attention" | "critical";
  };
}

export function formatForDashboardTile(
  metrics: ResponseQualityMetrics,
): DashboardTileData[] {
  const qualityInterp = interpretQualityScore(metrics.avgOverall);
  const approvalInterp = interpretApprovalRate(metrics.approvalRate);

  return [
    {
      title: "AI-Drafted Replies",
      value: `${metrics.aiDraftedPercentage.toFixed(0)}%`,
      subtitle: `${metrics.aiDraftedCount} of ${metrics.totalReplies} total replies`,
    },
    {
      title: "Quality Score",
      value: metrics.avgOverall.toFixed(1),
      subtitle: `Tone: ${metrics.avgTone.toFixed(1)} • Accuracy: ${metrics.avgAccuracy.toFixed(1)} • Policy: ${metrics.avgPolicy.toFixed(1)}`,
      badge: qualityInterp,
    },
    {
      title: "Approval Rate",
      value: `${metrics.approvalRate.toFixed(0)}%`,
      subtitle: "Drafts approved without major edits",
      badge: approvalInterp,
    },
    {
      title: "Avg Edit Distance",
      value: metrics.avgEditDistance.toFixed(0),
      subtitle: "Characters changed from AI draft",
    },
  ];
}
