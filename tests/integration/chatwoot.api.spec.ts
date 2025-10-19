import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ChatwootClient,
  type ChatwootClientConfig,
} from "../../app/services/support/chatwoot-client";
import type {
  ChatwootConversation,
  ChatwootMessage,
} from "../../app/services/chatwoot/types";

// Mock logger to avoid Node.js environment issues
vi.mock("../../app/utils/logger.server", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Chatwoot API Integration", () => {
  let client: ChatwootClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  const config: ChatwootClientConfig = {
    baseUrl: "https://chatwoot.example.com",
    apiKey: "test-api-key",
    accountId: "123",
  };

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    client = new ChatwootClient(config);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Client initialization", () => {
    it("throws error when configuration is invalid", () => {
      expect(() => new ChatwootClient({} as ChatwootClientConfig)).toThrow(
        "Invalid Chatwoot configuration",
      );
    });

    it("throws error when baseUrl is missing", () => {
      expect(
        () =>
          new ChatwootClient({
            baseUrl: "",
            apiKey: "key",
            accountId: "123",
          }),
      ).toThrow("Invalid Chatwoot configuration");
    });
  });

  describe("fetchConversations", () => {
    it("fetches open conversations successfully", async () => {
      const mockConversations: ChatwootConversation[] = [
        {
          id: 1,
          account_id: 123,
          inbox_id: 456,
          status: "open",
          messages: [],
          meta: {
            sender: {
              id: 1,
              name: "Test User",
              email: "test@example.com",
            },
            assignee: null,
          },
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            payload: mockConversations,
            meta: { count: 1 },
          },
        }),
      });

      const result = await client.fetchConversations({ status: "open" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/conversations?status=open"),
        expect.objectContaining({
          headers: expect.objectContaining({
            api_access_token: "test-api-key",
          }),
        }),
      );
      expect(result.data.payload).toEqual(mockConversations);
      expect(result.data.meta.count).toBe(1);
    });

    it("handles API errors gracefully", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      });

      await expect(client.fetchConversations()).rejects.toThrow(
        "Chatwoot API request failed",
      );
    });

    it("supports pagination", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            payload: [],
            meta: { count: 0 },
          },
        }),
      });

      await client.fetchConversations({ page: 2 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page=2"),
        expect.any(Object),
      );
    });
  });

  describe("fetchConversationMessages", () => {
    it("fetches messages for a conversation", async () => {
      const mockMessages: ChatwootMessage[] = [
        {
          id: 1,
          content: "Hello",
          message_type: "incoming",
          created_at: Date.now(),
          conversation_id: 1,
          sender: {
            id: 1,
            name: "Customer",
          },
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          payload: mockMessages,
        }),
      });

      const result = await client.fetchConversationMessages(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/conversations/1/messages"),
        expect.any(Object),
      );
      expect(result).toEqual(mockMessages);
    });
  });

  describe("createPrivateNote", () => {
    it("creates a private note successfully", async () => {
      const mockResponse = {
        id: 123,
        content: "This is a private note",
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.createPrivateNote({
        conversationId: 1,
        content: "This is a private note",
        metadata: { ai_generated: true },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/conversations/1/messages"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"private":true'),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes metadata in private note", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 123, content: "Note" }),
      });

      await client.createPrivateNote({
        conversationId: 1,
        content: "Note",
        metadata: { draft_version: 2, confidence: 0.85 },
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.content_attributes).toEqual({
        draft_version: 2,
        confidence: 0.85,
      });
    });
  });

  describe("createPublicReply", () => {
    it("creates a public reply successfully", async () => {
      const mockResponse = {
        id: 456,
        content: "Thank you for contacting us!",
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.createPublicReply({
        conversationId: 1,
        content: "Thank you for contacting us!",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/conversations/1/messages"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"private":false'),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("respects private flag override", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 456, content: "Reply" }),
      });

      await client.createPublicReply({
        conversationId: 1,
        content: "Reply",
        private: true,
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.private).toBe(true);
    });
  });

  describe("Private Note to Public Reply Conversion", () => {
    it("can approve a private note by creating a public reply", async () => {
      // Step 1: Create private note (AI draft)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 100,
          content: "AI Draft: Hello, how can we help?",
        }),
      });

      const privateNote = await client.createPrivateNote({
        conversationId: 1,
        content: "AI Draft: Hello, how can we help?",
        metadata: { ai_generated: true, needs_review: true },
      });

      expect(privateNote.id).toBe(100);

      // Step 2: Human reviews and approves, convert to public reply
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 101,
          content: "Hello, how can we help?",
        }),
      });

      const publicReply = await client.createPublicReply({
        conversationId: 1,
        content: "Hello, how can we help?", // Content without "AI Draft:" prefix
      });

      expect(publicReply.id).toBe(101);
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Verify first call was private
      const firstCallBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(firstCallBody.private).toBe(true);

      // Verify second call was public
      const secondCallBody = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(secondCallBody.private).toBe(false);
    });
  });

  describe("updateConversationStatus", () => {
    it("updates conversation status to resolved", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await client.updateConversationStatus(1, "resolved");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/conversations/1/toggle_status"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"status":"resolved"'),
        }),
      );
    });
  });

  describe("assignConversation", () => {
    it("assigns conversation to agent", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await client.assignConversation(1, 42);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/conversations/1/assignments"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"assignee_id":42'),
        }),
      );
    });
  });

  describe("Error handling", () => {
    it("marks 5xx errors as retryable", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => "Service Unavailable",
      });

      try {
        await client.fetchConversations();
      } catch (error: any) {
        expect(error.retryable).toBe(true);
        expect(error.code).toBe("HTTP_503");
      }
    });

    it("marks 429 rate limit errors as retryable", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => "Too Many Requests",
      });

      try {
        await client.fetchConversations();
      } catch (error: any) {
        expect(error.retryable).toBe(true);
        expect(error.code).toBe("HTTP_429");
      }
    });

    it("marks 4xx client errors as non-retryable", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "Bad Request",
      });

      try {
        await client.fetchConversations();
      } catch (error: any) {
        expect(error.retryable).toBe(false);
        expect(error.code).toBe("HTTP_400");
      }
    });
  });
});
