import { createHmac } from "crypto";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { forwardChatwootWebhook } from "~/services/support/chatwoot-webhook.server";
import { recordReplyLearningSignal } from "~/services/support/chatwoot-learning.server";
import { chatwootLogger } from "~/utils/structured-logger.server";

interface ChatwootWebhookPayload {
  event?: string;
  content?: string;
  message_type?: number | string;
  sender?: {
    type?: string;
    name?: string;
  };
  message?: {
    content?: string;
    message_type?: number | string;
    sender?: {
      type?: string;
      name?: string;
    };
  };
  conversation?: {
    id?: number;
    status?: string;
    meta?: {
      sender?: {
        name?: string;
      };
    };
    contact?: {
      name?: string;
    };
  };
  contact?: {
    name?: string;
  };
}

function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    chatwootLogger.warn("Missing signature header");
    return false;
  }

  const webhookSecret = process.env.CHATWOOT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    chatwootLogger.error("CHATWOOT_WEBHOOK_SECRET not configured");
    return false;
  }

  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  return signature === expectedSignature;
}

function extractMessageContent(payload: ChatwootWebhookPayload): string {
  if (payload.content && payload.content.trim().length > 0) {
    return payload.content;
  }
  if (payload.message?.content && payload.message.content.trim().length > 0) {
    return payload.message.content;
  }
  return "";
}

function extractCustomerName(
  payload: ChatwootWebhookPayload,
): string | undefined {
  return (
    payload.contact?.name ??
    payload.conversation?.contact?.name ??
    payload.conversation?.meta?.sender?.name ??
    payload.sender?.name
  );
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const startTime = Date.now();

  try {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get("X-Chatwoot-Signature");

    if (
      process.env.NODE_ENV === "production" &&
      !verifySignature(rawBody, signature)
    ) {
      chatwootLogger.error("Invalid signature");
      return json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as ChatwootWebhookPayload;
    const messageContent = extractMessageContent(payload);
    const customerName = extractCustomerName(payload);
    chatwootLogger.info("Webhook received", {
      event: payload.event,
      conversationId: payload.conversation?.id,
      messageType: payload.message_type,
    });

    const agentSdkUrl =
      process.env.AGENT_SDK_URL ?? "https://hotdash-agent-service.fly.dev";
    const { response, attempts } = await forwardChatwootWebhook({
      payload: rawBody,
      agentSdkUrl,
    });

    if (!response.ok) {
      const errorText = await response.text();
      chatwootLogger.error("Agent SDK response not ok", undefined, {
        status: response.status,
        error: errorText,
        attempts,
      });

      return json(
        {
          error: "Agent SDK processing failed",
          details: errorText,
          attempts,
        },
        { status: 502 },
      );
    }

    const resultJson: unknown = await response.json();
    const agentStatus =
      resultJson && typeof resultJson === "object" && "status" in resultJson
        ? String((resultJson as { status?: unknown }).status ?? "")
        : "";

    const resultDraft =
      resultJson && typeof resultJson === "object" && "draft" in resultJson
        ? (resultJson as { draft?: unknown }).draft
        : undefined;
    const promptVersion =
      resultJson &&
      typeof resultJson === "object" &&
      "promptVersion" in resultJson
        ? (resultJson as { promptVersion?: unknown }).promptVersion
        : undefined;
    const templateId =
      resultJson && typeof resultJson === "object" && "templateId" in resultJson
        ? (resultJson as { templateId?: unknown }).templateId
        : undefined;
    const conversationIdFromResult =
      resultJson &&
      typeof resultJson === "object" &&
      "conversationId" in resultJson
        ? (resultJson as { conversationId?: unknown }).conversationId
        : undefined;
    const conversationId =
      (typeof conversationIdFromResult === "number"
        ? conversationIdFromResult
        : payload.conversation?.id) ?? undefined;

    const duration = Date.now() - startTime;

    chatwootLogger.info("Processed successfully", {
      durationMs: duration,
      status: agentStatus,
      attempts,
    });

    if (agentStatus === "draft_ready") {
      await recordReplyLearningSignal({
        conversationId,
        draft: typeof resultDraft === "string" ? resultDraft : undefined,
        messageContent,
        customerName,
        promptVersion:
          typeof promptVersion === "string" ? promptVersion : undefined,
        templateId: typeof templateId === "string" ? templateId : undefined,
      });
    }

    return json(
      {
        success: true,
        processed: true,
        duration: `${duration}ms`,
        agentStatus,
        attempts,
      },
      {
        headers: {
          "X-Processing-Time": `${duration}ms`,
          attempts,
        },
      },
    );
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    chatwootLogger.error("Unhandled webhook error", error);

    const message =
      error instanceof Error ? error.message : "Webhook processing failed";

    return json(
      {
        error: "Webhook processing failed",
        message,
        duration: `${duration}ms`,
      },
      { status: 500 },
    );
  }
};
