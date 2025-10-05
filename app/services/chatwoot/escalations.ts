import type { Conversation } from "../../../packages/integrations/chatwoot";
import { chatwootClient } from "../../../packages/integrations/chatwoot";
import { getChatwootConfig } from "../../config/chatwoot.server";
import { setCached, getCached } from "../cache.server";
import { recordDashboardFact } from "../facts.server";
import { toInputJson } from "../json";
import { ServiceError } from "../types";
import { CHATWOOT_TEMPLATES } from "./templates";
import type { EscalationConversation, EscalationResult } from "./types";

const CACHE_TTL_MS = Number(process.env.CHATWOOT_CACHE_TTL_MS ?? 60_000);
const MAX_PAGES = Number(process.env.CHATWOOT_MAX_PAGES ?? 2);

function toIso(timestamp: number) {
  return new Date(timestamp * 1000).toISOString();
}

function isSlaBreached(timestamp: number, slaMinutes: number) {
  const ageMs = Date.now() - timestamp * 1000;
  return ageMs > slaMinutes * 60 * 1000;
}

function computeBreachTimestamp(
  createdAtSeconds: number,
  slaMinutes: number,
  breached: boolean,
) {
  if (!breached) return null;
  const breachSeconds = createdAtSeconds + slaMinutes * 60;
  return toIso(breachSeconds);
}

function resolveCustomerName(conversation: any) {
  return (
    conversation.meta?.sender?.name ||
    conversation.contacts?.find((contact: any) => contact?.name)?.name ||
    "Customer"
  );
}

async function collectConversations() {
  const config = getChatwootConfig();
  const client = chatwootClient(config);
  const results: EscalationConversation[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    let conversations;
    try {
      conversations = await client.listOpenConversations(page);
    } catch (error) {
      throw new ServiceError("Unable to fetch Chatwoot conversations", {
        scope: "chatwoot.escalations",
        retryable: true,
        cause: error,
      });
    }

    if (!Array.isArray(conversations) || conversations.length === 0) {
      break;
    }

    for (const convo of conversations as Conversation[]) {
      if (!convo || (convo.status !== "open" && convo.status !== "pending")) {
        continue;
      }

      const slaBreached = isSlaBreached(convo.created_at, config.slaMinutes);
      const tags: string[] = Array.isArray(convo.tags) ? convo.tags : [];
      const needsEscalation = slaBreached || tags.includes("escalation");

      if (!needsEscalation) continue;

      let messages;
      try {
        messages = await client.listMessages(convo.id);
      } catch (error) {
        throw new ServiceError("Unable to fetch Chatwoot messages", {
          scope: "chatwoot.escalations",
          retryable: true,
          cause: error,
        });
      }

      const lastMessage = [...messages].sort((a, b) => b.created_at - a.created_at)[0];
      const template = CHATWOOT_TEMPLATES[0];

      const createdAt = toIso(convo.created_at);
      const breachedAt = computeBreachTimestamp(
        convo.created_at,
        config.slaMinutes,
        slaBreached,
      );

      results.push({
        id: convo.id,
        inboxId: convo.inbox_id,
        status: convo.status,
        customerName: resolveCustomerName(convo),
        createdAt,
        breachedAt,
        lastMessageAt: lastMessage ? toIso(lastMessage.created_at) : toIso(convo.created_at),
        slaBreached,
        tags,
        suggestedReplyId: template?.id,
        suggestedReply: template?.body,
      });
    }
  }

  return { config, results };
}

export async function getEscalations(shopDomain: string): Promise<EscalationResult> {
  const cacheKey = `chatwoot:escalations:${shopDomain}`;
  const cached = getCached<EscalationResult>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" };
  }

  const { config, results } = await collectConversations();

  const fact = await recordDashboardFact({
    shopDomain,
    factType: "chatwoot.escalations",
    scope: "ops",
    value: toInputJson(results),
    metadata: toInputJson({
      slaMinutes: config.slaMinutes,
      count: results.length,
      breaches: results
        .filter((conversation) => conversation.slaBreached && conversation.breachedAt)
        .map((conversation) => ({
          conversationId: conversation.id,
          breachedAt: conversation.breachedAt,
          createdAt: conversation.createdAt,
        })),
      generatedAt: new Date().toISOString(),
    }),
  });

  const response: EscalationResult = {
    data: results,
    fact,
    source: "fresh",
  };

  setCached(cacheKey, response, CACHE_TTL_MS);
  return response;
}
