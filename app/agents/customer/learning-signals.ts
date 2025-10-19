/**
 * Learning Signal Collection — Capture human edits for supervised learning
 *
 * Collects and processes learning signals from HITL approvals:
 * - Edit distance between AI draft and human-edited reply
 * - Grading metadata (tone, accuracy, policy)
 * - Context and RAG sources for training data
 */

import { calculateEditDistance } from "./logger.stub";
import type { CustomerReplyGrading } from "./grading-schema";

export interface LearningSignal {
  conversationId: string;
  draftReply: string;
  humanReply: string;
  editDistance: number;
  editRatio: number; // 0-1, where 0 = identical, 1 = completely different
  grading: {
    tone: number;
    accuracy: number;
    policy: number;
  };
  metadata: {
    ragSources?: string[];
    confidence?: number;
    approved: boolean;
  };
  timestamp: string;
}

/**
 * Calculate edit ratio (normalized edit distance)
 * Returns value between 0 (identical) and 1 (completely different)
 */
export function calculateEditRatio(str1: string, str2: string): number {
  const distance = calculateEditDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  if (maxLength === 0) return 0;

  return Math.min(1, distance / maxLength);
}

/**
 * Extract learning signal from grading metadata
 */
export function extractLearningSignal(
  grading: CustomerReplyGrading,
): LearningSignal {
  const editDistance = grading.human_reply
    ? calculateEditDistance(grading.draft_reply, grading.human_reply)
    : 0;

  const editRatio = grading.human_reply
    ? calculateEditRatio(grading.draft_reply, grading.human_reply)
    : 0;

  return {
    conversationId: grading.conversation_id,
    draftReply: grading.draft_reply,
    humanReply: grading.human_reply || grading.draft_reply,
    editDistance,
    editRatio,
    grading: {
      tone: grading.tone,
      accuracy: grading.accuracy,
      policy: grading.policy,
    },
    metadata: {
      ragSources: grading.rag_sources || [],
      confidence: grading.confidence,
      approved: grading.approved,
    },
    timestamp: grading.graded_at,
  };
}

/**
 * Analyze learning signals to identify improvement areas
 */
export interface LearningAnalysis {
  totalSignals: number;
  approvalRate: number; // 0-1
  avgEditRatio: number; // 0-1
  avgGrading: {
    tone: number; // 1-5
    accuracy: number; // 1-5
    policy: number; // 1-5
  };
  recommendations: string[];
}

export function analyzeLearningSignals(
  signals: LearningSignal[],
): LearningAnalysis {
  if (signals.length === 0) {
    return {
      totalSignals: 0,
      approvalRate: 0,
      avgEditRatio: 0,
      avgGrading: { tone: 0, accuracy: 0, policy: 0 },
      recommendations: ["No learning signals collected yet"],
    };
  }

  const approvedCount = signals.filter((s) => s.metadata.approved).length;
  const approvalRate = approvedCount / signals.length;

  const avgEditRatio =
    signals.reduce((sum, s) => sum + s.editRatio, 0) / signals.length;

  const avgTone =
    signals.reduce((sum, s) => sum + s.grading.tone, 0) / signals.length;
  const avgAccuracy =
    signals.reduce((sum, s) => sum + s.grading.accuracy, 0) / signals.length;
  const avgPolicy =
    signals.reduce((sum, s) => sum + s.grading.policy, 0) / signals.length;

  const recommendations: string[] = [];

  // Generate recommendations based on metrics
  if (approvalRate < 0.5) {
    recommendations.push(
      "Low approval rate - review RAG knowledge base for gaps",
    );
  }

  if (avgEditRatio > 0.4) {
    recommendations.push("High edit ratio - drafts need significant revision");
  }

  if (avgTone < 4.0) {
    recommendations.push(
      "Tone improvements needed - review brand voice guidelines",
    );
  }

  if (avgAccuracy < 4.0) {
    recommendations.push(
      "Accuracy issues - update knowledge base with recent policies",
    );
  }

  if (avgPolicy < 4.5) {
    recommendations.push(
      "Policy compliance gaps - review agent prompts and constraints",
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("Performance looks good! Continue monitoring.");
  }

  return {
    totalSignals: signals.length,
    approvalRate,
    avgEditRatio,
    avgGrading: {
      tone: avgTone,
      accuracy: avgAccuracy,
      policy: avgPolicy,
    },
    recommendations,
  };
}

/**
 * Format learning signal for Supabase storage
 */
export function formatForStorage(
  signal: LearningSignal,
): Partial<CustomerReplyGrading> {
  return {
    conversation_id: signal.conversationId,
    draft_reply: signal.draftReply,
    human_reply: signal.humanReply,
    edit_distance: signal.editDistance,
    tone: signal.grading.tone,
    accuracy: signal.grading.accuracy,
    policy: signal.grading.policy,
    approved: signal.metadata.approved,
    rag_sources: signal.metadata.ragSources,
    confidence: signal.metadata.confidence,
    graded_by: "system", // Will be overridden by actual user
    graded_at: signal.timestamp,
  };
}
