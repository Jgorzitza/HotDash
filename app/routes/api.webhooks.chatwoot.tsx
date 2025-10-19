/**
 * Chatwoot Webhook Endpoint
 *
 * Receives webhooks from Chatwoot and routes them to the Agent SDK service.
 * Implements signature verification for security.
 *
 * React Router 7 - Server-side action
 */

import type { Route } from "./+types/api.webhooks.chatwoot";
import { verifyWebhookSignature } from "~/services/support/webhook-auth";
import { forwardChatwootWebhook } from "~/services/support/webhook-retry";

/**
 * POST /api/webhooks/chatwoot
 *
 * React Router 7 action - Receives Chatwoot webhooks with retry logic
 */
export async function action({ request }: Route.ActionArgs) {
  const startTime = Date.now();

  try {
    // Only accept POST
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify signature using webhook-auth service
    const signature = request.headers.get("X-Chatwoot-Signature");
    const signatureValid = await verifyWebhookSignature(rawBody, signature);

    if (!signatureValid) {
      console.error("[Chatwoot Webhook] Invalid signature");
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);

    console.log("[Chatwoot Webhook] Received:", {
      event: payload.event,
      conversationId: payload.conversation?.id,
      messageType: payload.message_type,
    });

    // Forward to Agent SDK with retry logic
    const result = await forwardChatwootWebhook(payload);
    const duration = Date.now() - startTime;

    console.log("[Chatwoot Webhook] Processed successfully", {
      duration: `${duration}ms`,
      attempts: result.attempts,
      agentStatus: result.agentStatus,
    });

    return Response.json({
      success: true,
      processed: true,
      duration: `${duration}ms`,
      attempts: result.attempts,
      agentStatus: result.agentStatus,
    });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    console.error("[Chatwoot Webhook] Error:", error);

    return Response.json(
      {
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : String(error),
        duration: `${duration}ms`,
      },
      { status: 500 },
    );
  }
}
