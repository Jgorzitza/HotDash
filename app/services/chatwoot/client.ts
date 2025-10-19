/**
 * Chatwoot Client — Production CX API integration
 *
 * Provides complete interface to Chatwoot API:
 * - Fetch conversations
 * - Post private notes
 * - Send public replies
 * - Health checks
 */

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: "incoming" | "outgoing";
  private: boolean;
  created_at: string;
  conversation_id: number;
  sender?: {
    id: number;
    name: string;
    email?: string;
    type: "contact" | "user";
  };
}

export interface ChatwootConversation {
  id: number;
  account_id: number;
  inbox_id: number;
  status: "open" | "resolved" | "pending" | "snoozed";
  messages: ChatwootMessage[];
  contact: {
    id: number;
    name: string;
    email?: string;
    phone_number?: string;
  };
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  last_non_activity_message?: ChatwootMessage;
}

export interface ChatwootConfig {
  baseUrl: string;
  apiKey: string;
  accountId: string;
}

/**
 * Get Chatwoot config from environment
 */
export function getConfig(): ChatwootConfig {
  const baseUrl = process.env.CHATWOOT_BASE_URL;
  const apiKey = process.env.CHATWOOT_API_KEY;
  const accountId = process.env.CHATWOOT_ACCOUNT_ID;

  if (!baseUrl || !apiKey || !accountId) {
    throw new Error(
      "Missing required Chatwoot env vars: CHATWOOT_BASE_URL, CHATWOOT_API_KEY, CHATWOOT_ACCOUNT_ID",
    );
  }

  return { baseUrl, apiKey, accountId };
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

  if (status !== "all") {
    url.searchParams.set("status", status);
  }

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
 * Fetch single conversation with full message history
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
 * Post Private Note to conversation
 * Private notes are visible only to agents, not customers
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
 * Send public reply to customer
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
 * Health check - verify Chatwoot is accessible
 */
export async function healthCheck(config: ChatwootConfig): Promise<{
  healthy: boolean;
  railsHealth: boolean;
  apiHealth: boolean;
  error?: string;
}> {
  try {
    // Check /rails/health
    const railsUrl = new URL("/rails/health", config.baseUrl);
    const railsResponse = await fetch(railsUrl.toString());
    const railsHealth = railsResponse.ok;

    // Check authenticated API
    const apiUrl = new URL(
      `/api/v1/accounts/${config.accountId}`,
      config.baseUrl,
    );
    const apiResponse = await fetch(apiUrl.toString(), {
      headers: { api_access_token: config.apiKey },
    });
    const apiHealth = apiResponse.ok;

    return {
      healthy: railsHealth && apiHealth,
      railsHealth,
      apiHealth,
    };
  } catch (error) {
    return {
      healthy: false,
      railsHealth: false,
      apiHealth: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Convert Chatwoot messages to internal format
 */
export function convertMessages(messages: ChatwootMessage[]): Array<{
  id: string;
  sender: "customer" | "agent";
  content: string;
  timestamp: string;
  isPrivate: boolean;
}> {
  return messages.map((msg) => ({
    id: String(msg.id),
    sender:
      msg.message_type === "incoming"
        ? ("customer" as const)
        : ("agent" as const),
    content: msg.content,
    timestamp: msg.created_at,
    isPrivate: msg.private,
  }));
}
