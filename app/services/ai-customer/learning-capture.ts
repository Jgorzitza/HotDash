/**
 * Learning Signals Capture — Store human edits and grades
 *
 * When approved with edits:
 * - Calculate edit distance
 * - Store human edits
 * - Store grades
 * - Save to Supabase: customer_learning_signals table
 */

import { calculateEditDistance } from "~/agents/customer/logger.stub";

export interface LearningSignal {
  conversationId: string;
  draftReply: string;
  humanReply: string;
  editDistance: number;
  grading: {
    tone: number;
    accuracy: number;
    policy: number;
  };
  ragSources: string[];
  confidence: number;
  approved: boolean;
  gradedBy: string;
}

/**
 * Capture learning signal from approval
 */
export function captureLearningSignal(
  conversationId: string,
  draftReply: string,
  humanReply: string,
  grading: { tone: number; accuracy: number; policy: number },
  metadata: {
    ragSources: string[];
    confidence: number;
    gradedBy: string;
  },
): LearningSignal {
  const editDistance = calculateEditDistance(draftReply, humanReply);

  return {
    conversationId,
    draftReply,
    humanReply,
    editDistance,
    grading,
    ragSources: metadata.ragSources,
    confidence: metadata.confidence,
    approved: true,
    gradedBy: metadata.gradedBy,
  };
}

/**
 * Save learning signal to Supabase
 */
export async function saveLearningSignal(
  signal: LearningSignal,
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (process.env.NODE_ENV === "test") {
    return { success: true, id: `test-signal-${Date.now()}` };
  }

  try {
    // TODO: Implement Supabase client call
    // Insert into customer_learning_signals table

    const response = await fetch("/api/learning-signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: signal.conversationId,
        draft_reply: signal.draftReply,
        human_reply: signal.humanReply,
        edit_distance: signal.editDistance,
        tone: signal.grading.tone,
        accuracy: signal.grading.accuracy,
        policy: signal.grading.policy,
        rag_sources: signal.ragSources,
        confidence: signal.confidence,
        approved: signal.approved,
        graded_by: signal.gradedBy,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Batch save multiple learning signals
 */
export async function batchSaveLearningSignals(
  signals: LearningSignal[],
): Promise<{ successful: number; failed: number; errors: string[] }> {
  const results = await Promise.allSettled(
    signals.map((signal) => saveLearningSignal(signal)),
  );

  let successful = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.success) {
      successful++;
    } else {
      failed++;
      if (result.status === "fulfilled") {
        errors.push(result.value.error || "Unknown error");
      } else {
        errors.push(result.reason);
      }
    }
  }

  return { successful, failed, errors };
}
