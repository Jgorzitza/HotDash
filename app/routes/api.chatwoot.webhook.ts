/**
 * Chatwoot Webhook Handler — Real-time conversation notifications
 *
 * Receives webhook events from Chatwoot for:
 * - New conversations
 * - New messages
 * - Conversation status changes
 *
 * Triggers draft generation for open conversations with customer messages.
 */

import type { ActionFunctionArgs } from "react-router";
import { json } from "react-router";
import {
  generateReplyDraft,
  formatAsPrivateNote,
} from "~/agents/customer/draft-generator";
import {
  postPrivateNote,
  getChatwootConfig,
} from "~/agents/customer/chatwoot-api";

interface ChatwootWebhookPayload {
  event: string;
  account: {
    id: number;
    name: string;
  };
  conversation?: {
    id: number;
    status: string;
    messages: Array<{
      id: number;
      content: string;
      message_type: "incoming" | "outgoing";
      created_at: string;
      sender?: {
        id: number;
        name: string;
        type: string;
      };
    }>;
  };
  message_type?: string;
}

/**
 * Verify webhook signature (placeholder - implement HMAC verification)
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
): boolean {
  // TODO: Implement HMAC SHA256 verification with CHATWOOT_WEBHOOK_SECRET
  // For now, accept all requests (dev mode)
  if (process.env.NODE_ENV === "production" && !signature) {
    return false;
  }
  return true;
}

/**
 * Check if conversation needs AI draft
 */
function shouldGenerateDraft(payload: ChatwootWebhookPayload): boolean {
  // Only process message_created events
  if (payload.event !== "message_created") return false;

  // Only for incoming messages (from customer)
  if (payload.message_type !== "incoming") return false;

  // Only for open conversations
  if (payload.conversation?.status !== "open") return false;

  return true;
}

/**
 * POST /api/chatwoot/webhook
 *
 * Receives Chatwoot webhook events and triggers draft generation
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Verify webhook signature
    const signature = request.headers.get("X-Chatwoot-Signature");
    const rawBody = await request.text();

    if (!verifyWebhookSignature(rawBody, signature)) {
      return json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload: ChatwootWebhookPayload = JSON.parse(rawBody);

    // Check if we should generate a draft
    if (!shouldGenerateDraft(payload)) {
      return json({ received: true, action: "ignored" }, { status: 200 });
    }

    const conversation = payload.conversation;
    if (!conversation) {
      return json({ error: "Missing conversation data" }, { status: 400 });
    }

    // Convert messages to draft generator format
    const messages = conversation.messages.map((msg) => ({
      id: String(msg.id),
      sender: msg.message_type === "incoming" ? "customer" : "agent",
      content: msg.content,
      timestamp: msg.created_at,
    }));

    // Generate draft reply
    const draft = await generateReplyDraft({
      conversationId: String(conversation.id),
      messages,
    });

    // Post draft as Private Note
    const config = getChatwootConfig();
    const privateNote = formatAsPrivateNote(draft);

    await postPrivateNote(config, conversation.id, privateNote);

    return json(
      {
        received: true,
        action: "draft_generated",
        conversationId: conversation.id,
        confidence: draft.evidence.confidence,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Chatwoot webhook error:", error);
    return json(
      { error: "Internal server error", message: String(error) },
      { status: 500 },
    );
  }
}
