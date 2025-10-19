/**
 * Batch Draft Generation — Process multiple conversations efficiently
 *
 * POST /api/chatwoot/batch-draft
 *
 * Generates drafts for multiple conversations in a single request.
 * Optimized for high-volume processing with parallel generation.
 */

import type { ActionFunctionArgs } from "react-router";
import { json } from "react-router";
import {
  generateReplyDraft,
  formatAsPrivateNote,
  type ConversationMessage,
} from "~/agents/customer/draft-generator";
import {
  postPrivateNote,
  getChatwootConfig,
} from "~/agents/customer/chatwoot-api";

interface BatchDraftRequest {
  conversations: Array<{
    id: string;
    messages: ConversationMessage[];
  }>;
  options?: {
    maxConcurrent?: number; // Limit parallel processing
    skipIfNoteExists?: boolean; // Don't draft if Private Note already exists
  };
}

interface BatchDraftResponse {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  results: Array<{
    conversationId: string;
    status: "success" | "failed" | "skipped";
    confidence?: number;
    error?: string;
  }>;
  processingTimeMs: number;
}

/**
 * Process batch in chunks to avoid overwhelming the system
 */
async function processBatchInChunks<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  chunkSize: number = 5,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
  }

  return results;
}

/**
 * POST /api/chatwoot/batch-draft
 */
export async function action({ request }: ActionFunctionArgs) {
  const startTime = Date.now();

  try {
    const { conversations, options }: BatchDraftRequest = await request.json();

    if (!conversations || conversations.length === 0) {
      return json({ error: "No conversations provided" }, { status: 400 });
    }

    // Limit batch size to prevent abuse
    if (conversations.length > 50) {
      return json(
        { error: "Batch size limited to 50 conversations" },
        { status: 400 },
      );
    }

    const maxConcurrent = options?.maxConcurrent || 5;
    const config = getChatwootConfig();

    // Process conversations
    const results = await processBatchInChunks(
      conversations,
      async (conv) => {
        try {
          // Generate draft
          const draft = await generateReplyDraft({
            conversationId: conv.id,
            messages: conv.messages,
          });

          // Post as Private Note
          const privateNote = formatAsPrivateNote(draft);
          await postPrivateNote(config, Number(conv.id), privateNote);

          return {
            conversationId: conv.id,
            status: "success" as const,
            confidence: draft.evidence.confidence,
          };
        } catch (error) {
          return {
            conversationId: conv.id,
            status: "failed" as const,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
      maxConcurrent,
    );

    // Calculate stats
    const successful = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const processingTimeMs = Date.now() - startTime;

    const response: BatchDraftResponse = {
      total: conversations.length,
      successful,
      failed,
      skipped,
      results,
      processingTimeMs,
    };

    return json(response, { status: 200 });
  } catch (error) {
    return json(
      {
        error: "Batch processing failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
