import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the logger before importing the client
vi.mock("../../../app/utils/logger.server", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../app/services/types", () => ({
  ServiceError: class ServiceError extends Error {
    scope: string;
    code?: string;
    retryable: boolean;
    cause?: unknown;

    constructor(
      message: string,
      options: {
        scope: string;
        code?: string;
        retryable: boolean;
        cause?: unknown;
      },
    ) {
      super(message);
      this.scope = options.scope;
      this.code = options.code;
      this.retryable = options.retryable;
      this.cause = options.cause;
    }
  },
}));

describe("Chatwoot Client Contract Tests", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  describe("Fetch Conversations", () => {
    it("builds correct API URL with parameters", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { payload: [], meta: { count: 0 } },
        }),
      });

      const { ChatwootClient } = await import(
        "../../../app/services/support/chatwoot-client"
      );
      const client = new ChatwootClient({
        baseUrl: "https://test.chatwoot.com",
        apiKey: "test-key",
        accountId: "123",
      });

      await client.fetchConversations({ status: "open", page: 1 });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://test.chatwoot.com/api/v1/accounts/123/conversations?status=open&page=1",
        expect.objectContaining({
          headers: expect.objectContaining({
            api_access_token: "test-key",
          }),
        }),
      );
    });
  });

  describe("Private Note Creation", () => {
    it("creates private note with correct payload structure", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 100, content: "Note" }),
      });

      const { ChatwootClient } = await import(
        "../../../app/services/support/chatwoot-client"
      );
      const client = new ChatwootClient({
        baseUrl: "https://test.chatwoot.com",
        apiKey: "test-key",
        accountId: "123",
      });

      await client.createPrivateNote({
        conversationId: 42,
        content: "AI Draft: Hello",
        metadata: { ai_generated: true },
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain("/conversations/42/messages");

      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody).toMatchObject({
        content: "AI Draft: Hello",
        message_type: "outgoing",
        private: true,
        content_attributes: { ai_generated: true },
      });
    });
  });

  describe("Public Reply Creation", () => {
    it("creates public reply with private=false", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 101, content: "Reply" }),
      });

      const { ChatwootClient } = await import(
        "../../../app/services/support/chatwoot-client"
      );
      const client = new ChatwootClient({
        baseUrl: "https://test.chatwoot.com",
        apiKey: "test-key",
        accountId: "123",
      });

      await client.createPublicReply({
        conversationId: 42,
        content: "Thank you!",
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        content: "Thank you!",
        message_type: "outgoing",
        private: false,
      });
    });
  });

  describe("HITL Workflow: Private Note to Public Reply", () => {
    it("supports full approval workflow", async () => {
      const { ChatwootClient } = await import(
        "../../../app/services/support/chatwoot-client"
      );
      const client = new ChatwootClient({
        baseUrl: "https://test.chatwoot.com",
        apiKey: "test-key",
        accountId: "123",
      });

      // Step 1: AI creates private note
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 100, content: "AI Draft" }),
      });

      await client.createPrivateNote({
        conversationId: 1,
        content: "AI Draft: Hello",
        metadata: { ai_generated: true, needs_review: true },
      });

      const privateCall = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(privateCall.private).toBe(true);

      // Step 2: Human approves, creates public reply
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 101, content: "Hello" }),
      });

      await client.createPublicReply({
        conversationId: 1,
        content: "Hello", // Human-approved content
      });

      const publicCall = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(publicCall.private).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error Handling", () => {
    it("marks 5xx errors as retryable", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => "Service Unavailable",
      });

      const { ChatwootClient } = await import(
        "../../../app/services/support/chatwoot-client"
      );
      const client = new ChatwootClient({
        baseUrl: "https://test.chatwoot.com",
        apiKey: "test-key",
        accountId: "123",
      });

      try {
        await client.fetchConversations();
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error.retryable).toBe(true);
        expect(error.code).toBe("HTTP_503");
      }
    });

    it("marks 4xx errors as non-retryable", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "Bad Request",
      });

      const { ChatwootClient } = await import(
        "../../../app/services/support/chatwoot-client"
      );
      const client = new ChatwootClient({
        baseUrl: "https://test.chatwoot.com",
        apiKey: "test-key",
        accountId: "123",
      });

      try {
        await client.fetchConversations();
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error.retryable).toBe(false);
        expect(error.code).toBe("HTTP_400");
      }
    });
  });
});
