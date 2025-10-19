import { logReplyGeneration } from "~/services/ai-logging.server";
import { chatwootLogger } from "~/utils/structured-logger.server";

export interface LearningSignalInput {
  conversationId?: number;
  messageContent?: string;
  customerName?: string;
  promptVersion?: string;
  draft?: string;
  templateId?: string;
}

const DEFAULT_PROMPT_VERSION = "agent-service.triage.v1";
const DEFAULT_TEMPLATE_ID = "chatwoot-triage";

export async function recordReplyLearningSignal(
  input: LearningSignalInput,
): Promise<void> {
  const {
    conversationId,
    messageContent,
    customerName,
    promptVersion,
    draft,
    templateId,
  } = input;

  if (!conversationId || !draft) {
    chatwootLogger.debug("Skipping learning signal", {
      hasConversationId: Boolean(conversationId),
      hasDraft: Boolean(draft),
    });
    return;
  }

  try {
    await logReplyGeneration(
      templateId ?? DEFAULT_TEMPLATE_ID,
      promptVersion ?? DEFAULT_PROMPT_VERSION,
      {
        customerName: customerName ?? "Customer",
        conversationId,
        context: messageContent ?? "",
      },
      draft,
    );
  } catch (error) {
    chatwootLogger.warn("Failed to record Chatwoot learning signal", {
      error: error instanceof Error ? error.message : String(error),
      conversationId,
    });
  }
}
