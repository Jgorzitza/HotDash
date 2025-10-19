/**
 * CX Approval Flow — Complete HITL implementation
 *
 * Full workflow:
 * 1. AI generates draft → private note
 * 2. Human reviews in drawer
 * 3. Human grades (tone/accuracy/policy)
 * 4. Human approves → public reply via Chatwoot API
 * 5. Learning signal captured
 */

import { generateDraft, formatAsPrivateNote } from "./drafter";
import type { DraftRequest, DraftResponse } from "./drafter";
import {
  getConfig,
  postPrivateNote,
  sendPublicReply,
} from "../chatwoot/client";
import { captureLearningSignal, saveLearningSignal } from "./learning-capture";

export interface ApprovalFlowResult {
  success: boolean;
  step:
    | "draft"
    | "private_note"
    | "approval"
    | "public_reply"
    | "learning_signal";
  messageId?: number;
  learningSignalId?: string;
  error?: string;
}

/**
 * Step 1: Generate draft and post as Private Note
 */
export async function generateAndPostDraft(
  request: DraftRequest,
): Promise<{ draft: DraftResponse; privateNoteId: number }> {
  // Generate draft
  const draft = await generateDraft(request);

  // Format as Private Note
  const privateNote = formatAsPrivateNote(draft);

  // Post to Chatwoot
  const config = getConfig();
  const message = await postPrivateNote(
    config,
    Number(request.conversationId),
    privateNote,
  );

  return {
    draft,
    privateNoteId: message.id,
  };
}

/**
 * Step 2: Approve and send public reply
 */
export async function approveAndSendReply(
  conversationId: string,
  finalReply: string,
  grading: {
    tone: number;
    accuracy: number;
    policy: number;
  },
  draftMetadata: {
    originalDraft: string;
    ragSources: string[];
    confidence: number;
    gradedBy: string;
  },
): Promise<ApprovalFlowResult> {
  try {
    // Send public reply to customer
    const config = getConfig();
    const message = await sendPublicReply(
      config,
      Number(conversationId),
      finalReply,
    );

    // Capture learning signal
    const learningSignal = captureLearningSignal(
      conversationId,
      draftMetadata.originalDraft,
      finalReply,
      grading,
      {
        ragSources: draftMetadata.ragSources,
        confidence: draftMetadata.confidence,
        gradedBy: draftMetadata.gradedBy,
      },
    );

    // Save learning signal
    const saveResult = await saveLearningSignal(learningSignal);

    return {
      success: true,
      step: "learning_signal",
      messageId: message.id,
      learningSignalId: saveResult.id,
    };
  } catch (error) {
    return {
      success: false,
      step: "public_reply",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Step 3: Reject and capture learning signal
 */
export async function rejectAndCaptureLearning(
  conversationId: string,
  manualReply: string,
  grading: {
    tone: number;
    accuracy: number;
    policy: number;
  },
  draftMetadata: {
    originalDraft: string;
    ragSources: string[];
    confidence: number;
    gradedBy: string;
  },
): Promise<ApprovalFlowResult> {
  try {
    // Capture learning signal (rejected draft)
    const learningSignal = {
      ...captureLearningSignal(
        conversationId,
        draftMetadata.originalDraft,
        manualReply,
        grading,
        {
          ragSources: draftMetadata.ragSources,
          confidence: draftMetadata.confidence,
          gradedBy: draftMetadata.gradedBy,
        },
      ),
      approved: false, // Override to rejected
    };

    // Save learning signal
    const saveResult = await saveLearningSignal(learningSignal);

    return {
      success: true,
      step: "learning_signal",
      learningSignalId: saveResult.id,
    };
  } catch (error) {
    return {
      success: false,
      step: "learning_signal",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Complete approval flow - from draft to public reply
 */
export async function executeFullApprovalFlow(
  request: DraftRequest,
  approvalData: {
    finalReply: string;
    grading: { tone: number; accuracy: number; policy: number };
    gradedBy: string;
  },
): Promise<ApprovalFlowResult[]> {
  const results: ApprovalFlowResult[] = [];

  try {
    // Step 1: Generate and post draft
    const { draft } = await generateAndPostDraft(request);
    results.push({ success: true, step: "draft" });
    results.push({ success: true, step: "private_note" });

    // Step 2: Approve and send
    const approvalResult = await approveAndSendReply(
      request.conversationId,
      approvalData.finalReply,
      approvalData.grading,
      {
        originalDraft: draft.suggestedReply,
        ragSources: draft.ragSources,
        confidence: draft.confidence,
        gradedBy: approvalData.gradedBy,
      },
    );

    results.push(approvalResult);

    return results;
  } catch (error) {
    results.push({
      success: false,
      step: "draft",
      error: error instanceof Error ? error.message : String(error),
    });
    return results;
  }
}
