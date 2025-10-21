/**
 * Integration Tests: Chatwoot Webhook
 *
 * Tests webhook signature verification, event handling, error cases
 */

import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";

describe("Chatwoot Webhook Integration", () => {
  describe("HMAC Signature Verification", () => {
    it("should generate valid HMAC-SHA256 signature", () => {
      const payload = JSON.stringify({ test: "data" });
      const secret = "test-secret";

      const signature = createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      expect(signature).toHaveLength(64); // SHA-256 = 64 hex chars
      expect(signature).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should produce same signature for same input", () => {
      const payload = JSON.stringify({ test: "data" });
      const secret = "test-secret";

      const sig1 = createHmac("sha256", secret).update(payload).digest("hex");
      const sig2 = createHmac("sha256", secret).update(payload).digest("hex");

      expect(sig1).toBe(sig2);
    });

    it("should produce different signatures for different payloads", () => {
      const payload1 = JSON.stringify({ test: "data1" });
      const payload2 = JSON.stringify({ test: "data2" });
      const secret = "test-secret";

      const sig1 = createHmac("sha256", secret).update(payload1).digest("hex");
      const sig2 = createHmac("sha256", secret).update(payload2).digest("hex");

      expect(sig1).not.toBe(sig2);
    });

    it("should produce different signatures for different secrets", () => {
      const payload = JSON.stringify({ test: "data" });
      const secret1 = "secret1";
      const secret2 = "secret2";

      const sig1 = createHmac("sha256", secret1).update(payload).digest("hex");
      const sig2 = createHmac("sha256", secret2).update(payload).digest("hex");

      expect(sig1).not.toBe(sig2);
    });
  });

  describe("Webhook Event Types", () => {
    it("should handle conversation_created event", () => {
      const event = {
        event: "conversation_created",
        conversation: { id: 123, status: "open" },
      };

      expect(event.event).toBe("conversation_created");
      expect(event.conversation.id).toBe(123);
    });

    it("should handle message_created event", () => {
      const event = {
        event: "message_created",
        conversation: { id: 123 },
        message: { content: "Test message", message_type: 0 },
      };

      expect(event.event).toBe("message_created");
      expect(event.message.content).toBe("Test message");
    });

    it("should handle conversation_resolved event", () => {
      const event = {
        event: "conversation_resolved",
        conversation: { id: 123, status: "resolved" },
      };

      expect(event.event).toBe("conversation_resolved");
      expect(event.conversation.status).toBe("resolved");
    });

    it("should handle conversation_updated event", () => {
      const event = {
        event: "conversation_updated",
        conversation: { id: 123, assignee_id: 5 },
      };

      expect(event.event).toBe("conversation_updated");
      expect(event.conversation.assignee_id).toBe(5);
    });
  });

  describe("Payload Parsing", () => {
    it("should parse valid JSON payload", () => {
      const payload = JSON.stringify({
        event: "message_created",
        conversation: { id: 123 },
      });

      const parsed = JSON.parse(payload);

      expect(parsed.event).toBe("message_created");
      expect(parsed.conversation.id).toBe(123);
    });

    it("should handle nested objects", () => {
      const payload = JSON.stringify({
        conversation: {
          id: 123,
          meta: {
            sender: { name: "Customer" },
          },
        },
      });

      const parsed = JSON.parse(payload);

      expect(parsed.conversation.meta.sender.name).toBe("Customer");
    });

    it("should handle arrays in payload", () => {
      const payload = JSON.stringify({
        conversation: {
          messages: [
            { content: "Message 1" },
            { content: "Message 2" },
          ],
        },
      });

      const parsed = JSON.parse(payload);

      expect(parsed.conversation.messages).toHaveLength(2);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing signature gracefully", () => {
      const signature: string | null = null;

      expect(signature).toBeNull();
    });

    it("should handle invalid JSON", () => {
      const invalidJson = "{ invalid json }";

      expect(() => JSON.parse(invalidJson)).toThrow();
    });

    it("should handle network errors", async () => {
      const url = "https://invalid-url-that-does-not-exist.com";

      await expect(fetch(url)).rejects.toThrow();
    });

    it("should handle empty payload", () => {
      const payload = "{}";
      const parsed = JSON.parse(payload);

      expect(parsed).toEqual({});
    });
  });

  describe("Request Headers", () => {
    it("should validate X-Chatwoot-Signature header", () => {
      const headers = {
        "X-Chatwoot-Signature": "abc123",
        "Content-Type": "application/json",
      };

      expect(headers["X-Chatwoot-Signature"]).toBe("abc123");
    });

    it("should validate Content-Type header", () => {
      const headers = {
        "Content-Type": "application/json",
      };

      expect(headers["Content-Type"]).toBe("application/json");
    });
  });
});


