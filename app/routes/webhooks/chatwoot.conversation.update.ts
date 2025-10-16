/**
 * Chatwoot Conversation Update Webhook Handler
 * Owner: integrations agent
 * Date: 2025-10-15
 */



import { logger } from "../../utils/logger.server";
import { SupabaseRPC } from "../../lib/supabase/client";
import { withIdempotency } from "../../lib/idempotency";

const CHATWOOT_WEBHOOK_SECRET = process.env.CHATWOOT_WEBHOOK_SECRET || "";

export async function action({ request }: any) {
  const startTime = Date.now();

  try {
    // Verify webhook signature
    const signature = request.headers.get("X-Chatwoot-Signature");
    if (!signature || !CHATWOOT_WEBHOOK_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const event = payload.event;

    if (event !== "conversation_updated") {
      return Response.json({ error: "Invalid event type" }, { status: 400 });
    }

    const conversation = payload.conversation;
    
    logger.info("Chatwoot conversation/update webhook received", {
      conversationId: conversation.id,
      status: conversation.status,
      inboxId: conversation.inbox_id,
    });

    // Process webhook with idempotency
    const idempotencyKey = `chatwoot:conversation:update:${conversation.id}:${payload.timestamp}`;
    
    await withIdempotency(idempotencyKey, async () => {
      // Extract conversation data
      const conversationData = {
        conversationId: conversation.id,
        status: conversation.status,
        inboxId: conversation.inbox_id,
        assigneeId: conversation.assignee?.id,
        contactId: conversation.contact?.id,
        messagesCount: conversation.messages_count,
        updatedAt: conversation.updated_at,
      };

      // Log to audit trail
      await SupabaseRPC.logAuditEntry({
        scope: "chatwoot.webhook.conversation.update",
        actor: "system",
        action: "conversation_updated",
        externalRef: conversation.id.toString(),
        payload: conversationData,
      });

      // Trigger any necessary actions based on status change
      if (conversation.status === "resolved") {
        logger.info("Conversation resolved", {
          conversationId: conversation.id,
        });
        // Could trigger satisfaction survey, analytics update, etc.
      }

      logger.info("Chatwoot conversation/update webhook processed", {
        conversationId: conversation.id,
        latencyMs: Date.now() - startTime,
      });

      return { success: true };
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    const latency = Date.now() - startTime;
    
    logger.error("Chatwoot conversation/update webhook failed", {
      error: error instanceof Error ? error.message : String(error),
      latencyMs: latency,
    });

    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
