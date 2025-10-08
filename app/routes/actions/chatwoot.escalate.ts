import type { ActionFunctionArgs } from "react-router";

import { chatwootClient } from "../../../packages/integrations/chatwoot";
import { getChatwootConfig } from "../../config/chatwoot.server";
import { logDecision } from "../../services/decisions.server";
import { findTemplate } from "../../services/chatwoot/templates";
import { authenticate } from "../../shopify.server";
import { isFeatureEnabled } from "../../config/featureFlags";

function renderTemplate(body: string, variables: Record<string, string | undefined>) {
  return body.replace(/{{(.*?)}}/g, (_, key) => {
    const value = variables[key.trim()];
    return value ?? "";
  });
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!session?.shop) {
    throw jsonResponse({ error: "Missing shop context" }, { status: 400 });
  }

  const contentType = request.headers.get("content-type");
  const isFormData = contentType?.includes("application/x-www-form-urlencoded");

  let conversationId: number;
  let actionType: string | undefined;
  let templateId: string | undefined;
  let note: string | undefined;
  let customerName: string | undefined;
  let suggestedReply: string | undefined;
  let selectedReply: string | undefined;
  let aiSuggestionUsed = false;
  let aiSuggestionMetadata: unknown;

  if (isFormData) {
    // Handle form submissions from modal
    const formData = await request.formData();
    conversationId = Number(formData.get("conversationId"));
    actionType = formData.get("action") as string;
    suggestedReply = formData.get("suggestedReply") as string | undefined;
    selectedReply = formData.get("selectedReply") as string | undefined;
    aiSuggestionUsed = formData.get("aiSuggestionUsed") === "true";
    const metadataRaw = formData.get("aiSuggestionMetadata");
    if (typeof metadataRaw === "string" && metadataRaw.trim()) {
      try {
        aiSuggestionMetadata = JSON.parse(metadataRaw);
      } catch (error) {
        console.warn("Failed to parse aiSuggestionMetadata payload", error);
      }
    }
    const noteValue = formData.get("note");
    note = typeof noteValue === "string" ? noteValue : undefined;
    const customerValue = formData.get("customerName");
    customerName = typeof customerValue === "string" ? customerValue : undefined;
  } else {
    // Handle JSON submissions (legacy API)
    const payload = await request.json();
    conversationId = payload.conversationId;
    templateId = payload.templateId;
    note = payload.note;
    customerName = payload.customerName;
  }

  if (!conversationId) {
    throw jsonResponse(
      { error: "conversationId is required" },
      { status: 400 },
    );
  }

  const config = getChatwootConfig();
  const client = chatwootClient(config);
  const actor = (session as { email?: string | null }).email ?? session.shop;

  const aiFeatureEnabled = isFeatureEnabled("ai_escalations");

  // Handle form-based actions from modal
  if (actionType) {
    try {
      switch (actionType) {
        case "approve_send": {
          const replyBody = (selectedReply ?? suggestedReply)?.trim();
          if (!replyBody) {
            throw jsonResponse(
              { error: "Reply text is required for approve_send" },
              { status: 400 },
            );
          }
          await client.sendReply(conversationId, replyBody);

          const didUseAISuggestion = aiFeatureEnabled && aiSuggestionUsed;
          const aiMetadata = didUseAISuggestion ? aiSuggestionMetadata ?? null : null;

          await logDecision({
            scope: "ops",
            actor,
            action: "chatwoot.approve_send",
            rationale: note ?? (didUseAISuggestion ? "Approved AI suggestion" : "Approved template reply"),
            shopDomain: session.shop,
            externalRef: `chatwoot:${conversationId}`,
            payload: {
              conversationId,
              replyBody,
              note: note ?? null,
              aiSuggestionUsed: didUseAISuggestion,
              aiSuggestion: aiMetadata,
            },
          });
          break;
        }

      case "escalate": {
        // Tag conversation for manager attention
          await client.addLabel(conversationId, "escalation");
          await logDecision({
            scope: "ops",
            actor,
            action: "chatwoot.escalate",
            rationale: note ?? "Escalated to manager",
            shopDomain: session.shop,
            externalRef: `chatwoot:${conversationId}`,
            payload: { conversationId, note: note ?? null },
          });
          break;
        }

        case "mark_resolved": {
          await client.resolveConversation(conversationId);
          await logDecision({
            scope: "ops",
            actor,
            action: "chatwoot.mark_resolved",
            rationale: note ?? "Marked conversation as resolved",
            shopDomain: session.shop,
            externalRef: `chatwoot:${conversationId}`,
            payload: { conversationId, note: note ?? null },
          });
          break;
        }

        default:
          throw jsonResponse(
            { error: `Unknown action type: ${actionType}` },
            { status: 400 },
          );
      }
    } catch (error) {
      if (error instanceof Response) throw error;
      throw jsonResponse(
        { error: "Failed to execute Chatwoot action" },
        {
          status: 502,
          statusText: error instanceof Error ? error.message : String(error),
        },
      );
    }

    return jsonResponse({ ok: true });
  }

  // Handle legacy template-based API
  if (!templateId) {
    throw jsonResponse(
      { error: "templateId is required for legacy API" },
      { status: 400 },
    );
  }

  const template = findTemplate(templateId);
  if (!template) {
    throw jsonResponse({ error: "Template not found" }, { status: 404 });
  }

  const replyBody = renderTemplate(template.body, {
    name: customerName ?? "there",
    note: note ?? "",
  });

  try {
    await client.sendReply(conversationId, replyBody);
  } catch (error) {
    throw jsonResponse(
      { error: "Failed to send Chatwoot reply" },
      {
        status: 502,
        statusText: error instanceof Error ? error.message : String(error),
      },
    );
  }

  await logDecision({
    scope: "ops",
    actor,
    action: `chatwoot.reply.${templateId}`,
    rationale: note,
    shopDomain: session.shop,
    externalRef: `chatwoot:${conversationId}`,
    payload: {
      conversationId,
      templateId,
      replyBody,
    },
  });

  return jsonResponse({ ok: true });
};

export default action;
