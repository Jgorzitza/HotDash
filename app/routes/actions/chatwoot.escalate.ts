import type { ActionFunctionArgs } from "react-router";

import { chatwootClient } from "../../../packages/integrations/chatwoot";
import { getChatwootConfig } from "../../config/chatwoot.server";
import { logDecision } from "../../services/decisions.server";
import { findTemplate } from "../../services/chatwoot/templates";
import { authenticate } from "../../shopify.server";

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

  const payload = await request.json();
  const { conversationId, templateId, note, customerName } = payload ?? {};

  if (!conversationId || !templateId) {
    throw jsonResponse(
      { error: "conversationId and templateId are required" },
      { status: 400 },
    );
  }

  const template = findTemplate(templateId);
  if (!template) {
    throw jsonResponse({ error: "Template not found" }, { status: 404 });
  }

  const config = getChatwootConfig();
  const client = chatwootClient(config);

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

  const actor = (session as { email?: string | null }).email ?? session.shop;

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
