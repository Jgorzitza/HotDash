/**
 * Chatwoot API Client with Pagination and Filters
 * Owner: integrations agent  
 * Date: 2025-10-15
 */

import { logger } from "../../utils/logger.server";

const CHATWOOT_API_URL = process.env.CHATWOOT_API_URL || "https://app.chatwoot.com";
const CHATWOOT_API_KEY = process.env.CHATWOOT_API_KEY || "";
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || "";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;
const RATE_LIMIT_DELAY_MS = 100;

let lastRequestTime = 0;

interface ClientMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  retriedRequests: number;
  totalLatencyMs: number;
  rateLimitHits: number;
}

const metrics: ClientMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  retriedRequests: 0,
  totalLatencyMs: 0,
  rateLimitHits: 0,
};

export function getClientMetrics(): Readonly<ClientMetrics> {
  return { ...metrics };
}

export function resetClientMetrics(): void {
  Object.assign(metrics, {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    retriedRequests: 0,
    totalLatencyMs: 0,
    rateLimitHits: 0,
  });
}

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
    const waitTime = RATE_LIMIT_DELAY_MS - timeSinceLastRequest;
    metrics.rateLimitHits++;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await waitForRateLimit();
      const startTime = Date.now();
      lastResponse = await fetch(url, options);
      const latency = Date.now() - startTime;
      metrics.totalLatencyMs += latency;

      if (!isRetryableStatus(lastResponse.status)) {
        if (lastResponse.ok) metrics.successfulRequests++;
        else metrics.failedRequests++;
        return lastResponse;
      }

      if (attempt === MAX_RETRIES) {
        metrics.failedRequests++;
        return lastResponse;
      }

      metrics.retriedRequests++;
      const baseDelay = BASE_DELAY_MS * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, baseDelay + Math.random() * baseDelay * 0.1));
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        metrics.failedRequests++;
        throw error;
      }
      metrics.retriedRequests++;
      await new Promise(resolve => setTimeout(resolve, BASE_DELAY_MS * Math.pow(2, attempt)));
    }
  }

  return lastResponse!;
}

export interface ChatwootConversation {
  id: number;
  account_id: number;
  inbox_id: number;
  status: string;
  messages: any[];
  contact: any;
}

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: number;
  created_at: string;
  private: boolean;
  sender: any;
}

export interface ConversationFilters {
  status?: 'open' | 'resolved' | 'pending';
  inboxId?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface ChatwootClient {
  getConversations(filters?: ConversationFilters): Promise<PaginatedResponse<ChatwootConversation>>;
  getConversation(conversationId: number): Promise<ChatwootConversation>;
  createMessage(conversationId: number, content: string, isPrivate?: boolean): Promise<ChatwootMessage>;
  updateConversationStatus(conversationId: number, status: string): Promise<void>;
}

export function createChatwootClient(): ChatwootClient {
  if (!CHATWOOT_API_KEY || !CHATWOOT_ACCOUNT_ID) {
    throw new Error("Chatwoot API credentials not configured");
  }

  const headers = {
    "Content-Type": "application/json",
    "api_access_token": CHATWOOT_API_KEY,
  };

  metrics.totalRequests++;

  return {
    async getConversations(filters: ConversationFilters = {}): Promise<PaginatedResponse<ChatwootConversation>> {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.set("status", filters.status);
      if (filters.inboxId) queryParams.set("inbox_id", filters.inboxId.toString());
      if (filters.page) queryParams.set("page", filters.page.toString());

      const url = CHATWOOT_API_URL + "/api/v1/accounts/" + CHATWOOT_ACCOUNT_ID + "/conversations?" + queryParams.toString();
      const response = await fetchWithRetry(url, { method: "GET", headers });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations: ' + String(response.status));
      }

      const result = await response.json();
      const conversations = result.data?.payload || [];
      const meta = result.data?.meta || { current_page: 1, total_pages: 1, count: conversations.length };

      return {
        data: conversations,
        meta: {
          currentPage: meta.current_page || 1,
          totalPages: meta.total_pages || 1,
          totalCount: meta.count || conversations.length,
        },
      };
    },

    async getConversation(conversationId: number): Promise<ChatwootConversation> {
      const url = CHATWOOT_API_URL + "/api/v1/accounts/" + CHATWOOT_ACCOUNT_ID + "/conversations/" + conversationId;
      const response = await fetchWithRetry(url, { method: "GET", headers });

      if (!response.ok) {
        throw new Error('Failed to fetch conversation: ' + String(response.status));
      }

      return response.json();
    },

    async createMessage(conversationId: number, content: string, isPrivate = false): Promise<ChatwootMessage> {
      const url = CHATWOOT_API_URL + "/api/v1/accounts/" + CHATWOOT_ACCOUNT_ID + "/conversations/" + conversationId + "/messages";
      const response = await fetchWithRetry(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content,
          message_type: isPrivate ? 1 : 0,
          private: isPrivate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create message: ' + String(response.status));
      }

      return response.json();
    },

    async updateConversationStatus(conversationId: number, status: string): Promise<void> {
      const url = CHATWOOT_API_URL + "/api/v1/accounts/" + CHATWOOT_ACCOUNT_ID + "/conversations/" + conversationId;
      const response = await fetchWithRetry(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update conversation status: ' + String(response.status));
      }
    },
  };
}
