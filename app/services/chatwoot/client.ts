/**
 * Chatwoot Client Service
 *
 * Provides helper functions for interacting with the Chatwoot API
 */

import { chatwootClient } from "../../../packages/integrations/chatwoot";
import { getChatwootConfig } from "../../config/chatwoot.server";
import type { Conversation, Message } from "../../../packages/integrations/chatwoot";

export interface UnreadSummary {
  unreadCount: number;
  conversations: Conversation[];
  topConversation: {
    customerName: string;
    snippet: string;
    createdAt: string;
  } | null;
}

/**
 * Get unread message count and top conversation
 */
export async function getUnreadCount(): Promise<UnreadSummary> {
  const config = getChatwootConfig();
  const client = chatwootClient(config);

  const openConversations: Conversation[] = [];
  const MAX_PAGES = 5;
  const PAGE_SIZE_THRESHOLD = 50;

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const pageResults = await client.listOpenConversations(page);

    if (!Array.isArray(pageResults) || pageResults.length === 0) {
      break;
    }

    const open = pageResults.filter((conversation) => conversation.status === "open");
    openConversations.push(...open);

    if (pageResults.length < PAGE_SIZE_THRESHOLD) {
      break;
    }
  }

  const unreadCount = openConversations.reduce((total, conversation) => {
    const unread = conversation.unread_count;
    if (typeof unread === "number" && !Number.isNaN(unread)) {
      return total + unread;
    }
    return total + 1;
  }, 0);

  let topConversation = null;

  if (openConversations.length > 0) {
    const sorted = [...openConversations].sort((a, b) => {
      const bTimestamp = parseTimestamp(b.last_activity_at ?? b.created_at);
      const aTimestamp = parseTimestamp(a.last_activity_at ?? a.created_at);
      return bTimestamp - aTimestamp;
    });

    const top = sorted[0];
    const customerName =
      top.meta?.sender?.name ||
      top.contacts?.find((contact: { name?: string | null } | undefined) =>
        Boolean(contact?.name),
      )?.name ||
      "Customer";

    let messages: Message[] | undefined = Array.isArray(top.messages)
      ? top.messages
      : undefined;

    if (!messages || messages.length === 0) {
      try {
        messages = await client.listMessages(top.id);
      } catch (messageError) {
        console.warn(
          `[Chatwoot] Failed to load messages for conversation ${top.id}. Using conversation metadata instead.`,
          messageError,
        );
        messages = [];
      }
    }

    const lastMessage = messages?.at(-1) ?? null;
    const content = lastMessage?.content?.trim() ?? "";
    const snippet = content.length > 0 ? content.slice(0, 100) : "No messages yet";

    const createdAt = normalizeTimestamp(
      lastMessage?.created_at ?? top.last_activity_at ?? top.created_at,
    );

    topConversation = {
      customerName,
      snippet,
      createdAt,
    };
  }

  return {
    unreadCount: unreadCount > 0 ? unreadCount : openConversations.length,
    conversations: openConversations,
    topConversation,
  };
}

function parseTimestamp(value: number | string | null | undefined): number {
  if (value == null) {
    return 0;
  }

  if (typeof value === "number") {
    const ms = value > 1_000_000_000_000 ? value : value * 1000;
    return ms;
  }

  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    const ms = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
    return ms;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeTimestamp(value: number | string | null | undefined): string {
  const timestamp = parseTimestamp(value);
  if (timestamp === 0) {
    return new Date().toISOString();
  }

  return new Date(timestamp).toISOString();
}
