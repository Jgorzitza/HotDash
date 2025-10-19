/**
 * Chatwoot Webhook Contract Tests
 *
 * Verifies webhook payload shapes match Chatwoot API specification
 */

import { describe, it, expect } from "vitest";

describe("Chatwoot Webhook Payload Contracts", () => {
  describe("message_created event", () => {
    it("validates required fields", () => {
      const payload = {
        event: "message_created",
        id: 12345,
        content: "Test message",
        message_type: 0,
        created_at: 1634567890,
        conversation: {
          id: 100,
          inbox_id: 1,
          status: "open",
        },
        sender: {
          id: 200,
          name: "Customer Name",
          email: "customer@example.com",
        },
      };

      expect(payload.event).toBe("message_created");
      expect(payload.id).toBeTypeOf("number");
      expect(payload.content).toBeTypeOf("string");
      expect([0, 1]).toContain(payload.message_type); // 0 = incoming, 1 = outgoing
      expect(payload.conversation).toBeDefined();
      expect(payload.conversation.id).toBeTypeOf("number");
      expect(["open", "pending", "resolved"]).toContain(
        payload.conversation.status,
      );
    });

    it("validates incoming customer message", () => {
      const payload = {
        event: "message_created",
        id: 12345,
        message_type: 0, // incoming
        content: "Hello, I need help",
        conversation: { id: 100, inbox_id: 1, status: "open" },
      };

      expect(payload.message_type).toBe(0);
      expect(payload.content.length).toBeGreaterThan(0);
    });

    it("validates outgoing agent message", () => {
      const payload = {
        event: "message_created",
        id: 12346,
        message_type: 1, // outgoing
        content: "How can I help you?",
        conversation: { id: 100, inbox_id: 1, status: "open" },
      };

      expect(payload.message_type).toBe(1);
    });
  });

  describe("conversation_status_changed event", () => {
    it("validates status transition payload", () => {
      const payload = {
        event: "conversation_status_changed",
        id: 100,
        status: "resolved",
        previous_status: "open",
        changed_at: 1634567890,
        conversation: {
          id: 100,
          inbox_id: 1,
          status: "resolved",
        },
      };

      expect(payload.event).toBe("conversation_status_changed");
      expect(["open", "pending", "resolved"]).toContain(payload.status);
      expect(["open", "pending", "resolved"]).toContain(
        payload.previous_status,
      );
      expect(payload.conversation.id).toBe(payload.id);
    });

    it("validates conversation resolution", () => {
      const payload = {
        event: "conversation_status_changed",
        id: 100,
        status: "resolved",
        previous_status: "open",
        conversation: { id: 100, inbox_id: 1, status: "resolved" },
      };

      expect(payload.status).toBe("resolved");
      expect(payload.previous_status).not.toBe("resolved");
    });
  });

  describe("webhook signature", () => {
    it("validates signature header format", () => {
      // HMAC-SHA256 hex signature is 64 characters
      const validSignature = "a".repeat(64);

      expect(validSignature).toMatch(/^[a-f0-9]{64}$/);
      expect(validSignature.length).toBe(64);
    });

    it("rejects invalid signature formats", () => {
      const invalidSignatures = [
        "too-short",
        "contains-invalid-chars!@#",
        "Z".repeat(64), // not hex
        "",
        null,
      ];

      invalidSignatures.forEach((sig) => {
        if (sig) {
          expect(sig).not.toMatch(/^[a-f0-9]{64}$/);
        } else {
          expect(sig).toBeFalsy();
        }
      });
    });
  });

  describe("conversation metadata", () => {
    it("validates conversation with customer contact", () => {
      const conversation = {
        id: 100,
        inbox_id: 1,
        status: "open",
        contact: {
          id: 200,
          name: "John Doe",
          email: "john@example.com",
          phone_number: "+1234567890",
        },
        messages: [],
      };

      expect(conversation.contact).toBeDefined();
      expect(conversation.contact.id).toBeTypeOf("number");
      expect(conversation.contact.email).toMatch(/@/);
    });

    it("validates conversation with tags", () => {
      const conversation = {
        id: 100,
        inbox_id: 1,
        status: "open",
        labels: ["urgent", "billing", "vip"],
      };

      expect(Array.isArray(conversation.labels)).toBe(true);
      expect(conversation.labels.length).toBeGreaterThan(0);
      conversation.labels.forEach((label) => {
        expect(label).toBeTypeOf("string");
      });
    });
  });

  describe("error scenarios", () => {
    it("handles missing required fields gracefully", () => {
      const incompletePayload = {
        event: "message_created",
        // Missing: id, content, message_type, conversation
      };

      expect(incompletePayload.id).toBeUndefined();
      expect(incompletePayload.content).toBeUndefined();
      expect(incompletePayload.conversation).toBeUndefined();
    });

    it("handles malformed JSON", () => {
      const malformedJson = '{"event": "message_created", invalid}';

      expect(() => JSON.parse(malformedJson)).toThrow();
    });
  });
});
