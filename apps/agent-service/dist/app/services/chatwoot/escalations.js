import { chatwootClient } from "../../../packages/integrations/chatwoot";
import { getChatwootConfig } from "../../config/chatwoot.server";
import { isFeatureEnabled } from "../../config/featureFlags";
import { setCached, getCached } from "../cache.server";
import { recordDashboardFact } from "../facts.server";
import { toInputJson } from "../json";
import { ServiceError } from "../types";
import { logger } from "../../utils/logger.server";
import { CHATWOOT_TEMPLATES } from "./templates";
const CACHE_TTL_MS = Number(process.env.CHATWOOT_CACHE_TTL_MS ?? 60_000);
const MAX_PAGES = Number(process.env.CHATWOOT_MAX_PAGES ?? 2);
function toIso(timestamp) {
    return new Date(timestamp * 1000).toISOString();
}
function isSlaBreached(timestamp, slaMinutes) {
    const ageMs = Date.now() - timestamp * 1000;
    return ageMs > slaMinutes * 60 * 1000;
}
function computeBreachTimestamp(createdAtSeconds, slaMinutes, breached) {
    if (!breached)
        return null;
    const breachSeconds = createdAtSeconds + slaMinutes * 60;
    return toIso(breachSeconds);
}
function resolveCustomerName(conversation) {
    return (conversation.meta?.sender?.name ||
        conversation.contacts?.find((contact) => Boolean(contact?.name))?.name ||
        "Customer");
}
const SHIPPING_KEYWORDS = [
    "ship",
    "shipping",
    "delivery",
    "carrier",
    "tracking",
    "tracking number",
    "in transit",
    "delivered",
    "delayed delivery",
    "late delivery",
    "lost package",
    "delayed shipment",
];
const REFUND_KEYWORDS = [
    "refund",
    "return",
    "damage",
    "damaged",
    "broken",
    "defective",
    "replacement",
    "store credit",
    "exchange",
    "faulty",
    "warranty",
];
function normalise(value) {
    return value.toLowerCase();
}
function hasKeyword(haystack, keywords) {
    const text = normalise(haystack);
    return keywords.some((keyword) => text.includes(keyword));
}
function findLatestCustomerMessage(messages) {
    return [...messages]
        .filter((message) => message.author === "contact")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}
function pickTemplate(tags, messages) {
    const flattenedTags = tags.map((tag) => normalise(tag));
    const latestCustomerMessage = findLatestCustomerMessage(messages);
    const customerText = latestCustomerMessage?.content ?? "";
    if (flattenedTags.some((tag) => tag.includes("shipping") || tag.includes("delivery")) ||
        hasKeyword(customerText, SHIPPING_KEYWORDS)) {
        return CHATWOOT_TEMPLATES.find((template) => template.id === "ship_update");
    }
    if (flattenedTags.some((tag) => tag.includes("refund") || tag.includes("return")) ||
        hasKeyword(customerText, REFUND_KEYWORDS)) {
        return CHATWOOT_TEMPLATES.find((template) => template.id === "refund_offer");
    }
    if (customerText.trim().length > 0) {
        return CHATWOOT_TEMPLATES.find((template) => template.id === "ack_delay");
    }
    return CHATWOOT_TEMPLATES.find((template) => template.id === "ack_delay");
}
function renderTemplateBody(template, variables) {
    return template.body.replace(/{{(.*?)}}/g, (_, key) => {
        const value = variables[key.trim()];
        return value ?? "";
    });
}
async function collectConversations() {
    const config = getChatwootConfig();
    const client = chatwootClient(config);
    const results = [];
    logger.info("Starting Chatwoot escalations collection", {
        maxPages: MAX_PAGES,
        slaMinutes: config.slaMinutes,
    });
    for (let page = 1; page <= MAX_PAGES; page += 1) {
        let conversations;
        try {
            conversations = await client.listOpenConversations(page);
            logger.debug(`Retrieved conversations for page ${page}`, {
                page,
                conversationCount: Array.isArray(conversations)
                    ? conversations.length
                    : 0,
            });
        }
        catch (error) {
            const serviceError = new ServiceError("Unable to fetch Chatwoot conversations", {
                scope: "chatwoot.escalations",
                retryable: true,
                cause: error,
            });
            // Log the ServiceError with structured metadata
            logger.logServiceError(serviceError, undefined, {
                page,
                operation: "listOpenConversations",
            });
            throw serviceError;
        }
        if (!Array.isArray(conversations) || conversations.length === 0) {
            logger.debug(`No more conversations found at page ${page}, stopping collection`);
            break;
        }
        for (const convo of conversations) {
            if (!convo || (convo.status !== "open" && convo.status !== "pending")) {
                continue;
            }
            const slaBreached = isSlaBreached(convo.created_at, config.slaMinutes);
            const tags = Array.isArray(convo.tags) ? convo.tags : [];
            const flattenedTags = tags.map((tag) => normalise(tag));
            const needsEscalation = slaBreached ||
                flattenedTags.some((tag) => tag === "escalation" || tag === "escalated");
            if (!needsEscalation)
                continue;
            let messages;
            try {
                messages = await client.listMessages(convo.id);
                logger.debug(`Retrieved messages for conversation ${convo.id}`, {
                    conversationId: convo.id,
                    messageCount: messages.length,
                    slaBreached,
                });
            }
            catch (error) {
                const serviceError = new ServiceError("Unable to fetch Chatwoot messages", {
                    scope: "chatwoot.escalations",
                    retryable: true,
                    cause: error,
                });
                // Log the ServiceError with conversation context
                logger.logServiceError(serviceError, undefined, {
                    conversationId: convo.id,
                    operation: "listMessages",
                });
                throw serviceError;
            }
            const lastMessage = [...messages].sort((a, b) => b.created_at - a.created_at)[0];
            const conversationMessages = [...messages]
                .sort((a, b) => a.created_at - b.created_at)
                .slice(-6)
                .map((message) => {
                const author = message.message_type === 1 ? "agent" : "contact";
                return {
                    id: message.id,
                    author,
                    content: message.content,
                    createdAt: toIso(message.created_at),
                };
            });
            const createdAt = toIso(convo.created_at);
            const breachedAt = computeBreachTimestamp(convo.created_at, config.slaMinutes, slaBreached);
            const customerName = resolveCustomerName(convo);
            const suggestion = pickTemplate(tags, conversationMessages);
            const renderedSuggestion = suggestion
                ? renderTemplateBody(suggestion, { name: customerName })
                : undefined;
            // Log template suggestion for observability
            if (suggestion) {
                logger.debug(`Template suggestion generated for conversation ${convo.id}`, {
                    conversationId: convo.id,
                    templateId: suggestion.id,
                    customerName,
                    tags,
                    slaBreached,
                });
            }
            results.push({
                id: convo.id,
                inboxId: convo.inbox_id,
                status: convo.status,
                customerName,
                createdAt,
                breachedAt,
                lastMessageAt: lastMessage
                    ? toIso(lastMessage.created_at)
                    : toIso(convo.created_at),
                slaBreached,
                tags,
                suggestedReplyId: suggestion?.id,
                suggestedReply: renderedSuggestion,
                messages: conversationMessages,
                aiSuggestion: null,
                aiSuggestionEnabled: false,
            });
        }
    }
    logger.info("Completed Chatwoot escalations collection", {
        totalEscalations: results.length,
        breachedCount: results.filter((r) => r.slaBreached).length,
        templatesGenerated: results.filter((r) => r.suggestedReplyId).length,
    });
    return { config, results };
}
export async function getEscalations(shopDomain) {
    const cacheKey = `chatwoot:escalations:${shopDomain}`;
    const cached = getCached(cacheKey);
    if (cached) {
        logger.debug("Returning cached escalations data", {
            shopDomain,
            cacheKey,
            escalationCount: cached.data.length,
        });
        return { ...cached, source: "cache" };
    }
    try {
        const { config, results } = await collectConversations();
        const aiEnabled = isFeatureEnabled("ai_escalations");
        for (const conversation of results) {
            conversation.aiSuggestionEnabled = aiEnabled;
            if (!aiEnabled) {
                conversation.aiSuggestion = null;
            }
        }
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
        const response = {
            data: results,
            fact,
            source: "fresh",
            aiEnabled,
        };
        setCached(cacheKey, response, CACHE_TTL_MS);
        logger.info("Successfully generated fresh escalations data", {
            shopDomain,
            escalationCount: results.length,
            aiEnabled,
            factId: fact.id,
        });
        return response;
    }
    catch (error) {
        if (error instanceof ServiceError) {
            // ServiceError already logged in collectConversations
            throw error;
        }
        else {
            // Log unexpected errors
            logger.logError(error, "chatwoot.escalations.getEscalations", undefined, {
                shopDomain,
                cacheKey,
            });
            throw error;
        }
    }
}
//# sourceMappingURL=escalations.js.map