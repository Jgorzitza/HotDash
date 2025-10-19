import { logger } from "../../utils/logger.server";
import { ServiceError } from "../types";
import type { ChatwootConversation, ChatwootMessage } from "../chatwoot/types";

export interface ChatwootClientConfig {
  baseUrl: string;
  apiKey: string;
  accountId: string;
}

export interface CreatePrivateNoteOptions {
  conversationId: number;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePublicReplyOptions {
  conversationId: number;
  content: string;
  private?: boolean;
}

export interface FetchConversationsOptions {
  status?: "open" | "pending" | "resolved" | "all";
  assigneeType?: "all" | "assigned" | "unassigned";
  inboxId?: number;
  page?: number;
}

interface RateLimitState {
  tokens: number;
  lastRefill: number;
}

const RATE_LIMIT_TOKENS = 10; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 1000; // 1 second window
const rateLimitState: RateLimitState = {
  tokens: RATE_LIMIT_TOKENS,
  lastRefill: Date.now(),
};

async function waitForRateLimit() {
  const now = Date.now();
  const elapsed = now - rateLimitState.lastRefill;

  if (elapsed >= RATE_LIMIT_WINDOW_MS) {
    rateLimitState.tokens = RATE_LIMIT_TOKENS;
    rateLimitState.lastRefill = now;
  }

  if (rateLimitState.tokens <= 0) {
    const waitTime = RATE_LIMIT_WINDOW_MS - elapsed;
    if (waitTime > 0) {
      logger.debug("[chatwoot-client] Rate limit reached, waiting", {
        waitMs: waitTime,
      });
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      rateLimitState.tokens = RATE_LIMIT_TOKENS;
      rateLimitState.lastRefill = Date.now();
    }
  }

  rateLimitState.tokens -= 1;
}

export class ChatwootClient {
  private config: ChatwootClientConfig;

  constructor(config: ChatwootClientConfig) {
    if (!config.baseUrl || !config.apiKey || !config.accountId) {
      throw new ServiceError("Invalid Chatwoot configuration", {
        scope: "chatwoot-client",
        retryable: false,
      });
    }
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    await waitForRateLimit();

    const url = `${this.config.baseUrl}/api/v1/accounts/${this.config.accountId}${endpoint}`;
    const headers = {
      api_access_token: this.config.apiKey,
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      logger.debug("[chatwoot-client] Making request", {
        method: options.method ?? "GET",
        endpoint,
      });

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new ServiceError("Chatwoot API request failed", {
          scope: "chatwoot-client",
          code: `HTTP_${response.status}`,
          retryable: response.status >= 500 || response.status === 429,
          cause: {
            status: response.status,
            body: errorBody,
          },
        });
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError("Chatwoot API request failed", {
        scope: "chatwoot-client",
        retryable: true,
        cause: error,
      });
    }
  }

  async fetchConversations(options: FetchConversationsOptions = {}): Promise<{
    data: { payload: ChatwootConversation[]; meta: { count: number } };
  }> {
    const params = new URLSearchParams();
    if (options.status && options.status !== "all") {
      params.set("status", options.status);
    }
    if (options.assigneeType) {
      params.set("assignee_type", options.assigneeType);
    }
    if (options.inboxId) {
      params.set("inbox_id", String(options.inboxId));
    }
    if (options.page) {
      params.set("page", String(options.page));
    }

    const endpoint = `/conversations?${params.toString()}`;
    logger.info("[chatwoot-client] Fetching conversations", {
      params: Object.fromEntries(params.entries()),
    });

    return this.request<{
      data: { payload: ChatwootConversation[]; meta: { count: number } };
    }>(endpoint);
  }

  async fetchConversationMessages(
    conversationId: number,
  ): Promise<ChatwootMessage[]> {
    const endpoint = `/conversations/${conversationId}/messages`;
    logger.info("[chatwoot-client] Fetching conversation messages", {
      conversationId,
    });

    const response = await this.request<{ payload: ChatwootMessage[] }>(
      endpoint,
    );
    return response.payload;
  }

  async createPrivateNote(
    options: CreatePrivateNoteOptions,
  ): Promise<{ id: number; content: string }> {
    const endpoint = `/conversations/${options.conversationId}/messages`;
    logger.info("[chatwoot-client] Creating private note", {
      conversationId: options.conversationId,
      contentLength: options.content.length,
    });

    const body = JSON.stringify({
      content: options.content,
      message_type: "outgoing",
      private: true,
      content_attributes: options.metadata ?? {},
    });

    return this.request<{ id: number; content: string }>(endpoint, {
      method: "POST",
      body,
    });
  }

  async createPublicReply(
    options: CreatePublicReplyOptions,
  ): Promise<{ id: number; content: string }> {
    const endpoint = `/conversations/${options.conversationId}/messages`;
    logger.info("[chatwoot-client] Creating public reply", {
      conversationId: options.conversationId,
      contentLength: options.content.length,
      private: options.private ?? false,
    });

    const body = JSON.stringify({
      content: options.content,
      message_type: "outgoing",
      private: options.private ?? false,
    });

    return this.request<{ id: number; content: string }>(endpoint, {
      method: "POST",
      body,
    });
  }

  async updateConversationStatus(
    conversationId: number,
    status: "open" | "pending" | "resolved",
  ): Promise<void> {
    const endpoint = `/conversations/${conversationId}/toggle_status`;
    logger.info("[chatwoot-client] Updating conversation status", {
      conversationId,
      status,
    });

    await this.request(endpoint, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  }

  async assignConversation(
    conversationId: number,
    assigneeId?: number,
  ): Promise<void> {
    const endpoint = `/conversations/${conversationId}/assignments`;
    logger.info("[chatwoot-client] Assigning conversation", {
      conversationId,
      assigneeId,
    });

    await this.request(endpoint, {
      method: "POST",
      body: JSON.stringify({ assignee_id: assigneeId }),
    });
  }
}

// Singleton instance
let chatwootClientInstance: ChatwootClient | null = null;

export function getChatwootClient(): ChatwootClient {
  if (!chatwootClientInstance) {
    const baseUrl = process.env.CHATWOOT_BASE_URL;
    const apiKey = process.env.CHATWOOT_API_KEY;
    const accountId = process.env.CHATWOOT_ACCOUNT_ID;

    if (!baseUrl || !apiKey || !accountId) {
      throw new ServiceError("Chatwoot environment variables not configured", {
        scope: "chatwoot-client",
        retryable: false,
      });
    }

    chatwootClientInstance = new ChatwootClient({
      baseUrl,
      apiKey,
      accountId,
    });
  }

  return chatwootClientInstance;
}
