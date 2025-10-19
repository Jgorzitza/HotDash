/**
 * Chatwoot API Integration — Fetch conversations, post Private Notes, send replies
 *
 * Provides interface to Chatwoot API for customer support workflow.
 * All endpoints require authentication via CHATWOOT_API_KEY.
 */

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: "incoming" | "outgoing";
  created_at: string;
  sender?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface ChatwootConversation {
  id: number;
  account_id: number;
  inbox_id: number;
  status: "open" | "resolved" | "pending";
  messages: ChatwootMessage[];
  contact?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface ChatwootConfig {
  baseUrl: string;
  apiKey: string;
  accountId: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

/**
 * Get Chatwoot configuration from environment
 */
export function getChatwootConfig(): ChatwootConfig {
  return {
    baseUrl: requireEnv("CHATWOOT_BASE_URL"),
    apiKey: requireEnv("CHATWOOT_API_KEY"),
    accountId: requireEnv("CHATWOOT_ACCOUNT_ID"),
  };
}

/**
 * Fetch conversations from Chatwoot
 */
export async function fetchConversations(
  config: ChatwootConfig,
  status: "open" | "all" = "open",
): Promise<ChatwootConversation[]> {
  const url = new URL(
    `/api/v1/accounts/${config.accountId}/conversations`,
    config.baseUrl,
  );
  url.searchParams.set("status", status);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      api_access_token: config.apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Chatwoot API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data.data?.payload || [];
}

/**
 * Fetch single conversation with all messages
 */
export async function fetchConversation(
  config: ChatwootConfig,
  conversationId: number,
): Promise<ChatwootConversation> {
  const url = new URL(
    `/api/v1/accounts/${config.accountId}/conversations/${conversationId}`,
    config.baseUrl,
  );

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      api_access_token: config.apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Chatwoot API error: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}

/**
 * Post a Private Note to a conversation
 * Private Notes are internal comments visible only to agents
 */
export async function postPrivateNote(
  config: ChatwootConfig,
  conversationId: number,
  content: string,
): Promise<ChatwootMessage> {
  const url = new URL(
    `/api/v1/accounts/${config.accountId}/conversations/${conversationId}/messages`,
    config.baseUrl,
  );

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      api_access_token: config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      message_type: "outgoing",
      private: true,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Chatwoot API error: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}

/**
 * Send a public reply to a conversation
 * This sends the message to the customer
 */
export async function sendPublicReply(
  config: ChatwootConfig,
  conversationId: number,
  content: string,
): Promise<ChatwootMessage> {
  const url = new URL(
    `/api/v1/accounts/${config.accountId}/conversations/${conversationId}/messages`,
    config.baseUrl,
  );

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      api_access_token: config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      message_type: "outgoing",
      private: false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Chatwoot API error: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}

/**
 * Convert conversation to internal format for draft generation
 */
export function convertChatwootMessages(
  conversation: ChatwootConversation,
): Array<{
  id: string;
  sender: "customer" | "agent";
  content: string;
  timestamp: string;
}> {
  return conversation.messages.map((msg) => ({
    id: String(msg.id),
    sender: msg.message_type === "incoming" ? "customer" : "agent",
    content: msg.content,
    timestamp: msg.created_at,
  }));
}

/**
 * Health check for Chatwoot API
 */
export async function healthCheck(config: ChatwootConfig): Promise<boolean> {
  try {
    const url = new URL("/api", config.baseUrl);
    const response = await fetch(url.toString(), { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}
