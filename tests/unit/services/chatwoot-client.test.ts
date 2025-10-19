/**
 * Unit tests for Chatwoot client
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { convertMessages } from "~/services/chatwoot/client";
import type { ChatwootMessage } from "~/services/chatwoot/client";

describe("Chatwoot Client", () => {
  describe("convertMessages", () => {
    it("should convert incoming messages to customer sender", () => {
      const messages: ChatwootMessage[] = [
        {
          id: 1,
          content: "Hello, I need help",
          message_type: "incoming",
          private: false,
          created_at: "2025-10-19T10:00:00Z",
          conversation_id: 123,
        },
      ];

      const result = convertMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0].sender).toBe("customer");
      expect(result[0].content).toBe("Hello, I need help");
    });

    it("should convert outgoing messages to agent sender", () => {
      const messages: ChatwootMessage[] = [
        {
          id: 2,
          content: "How can I help you?",
          message_type: "outgoing",
          private: false,
          created_at: "2025-10-19T10:01:00Z",
          conversation_id: 123,
        },
      ];

      const result = convertMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0].sender).toBe("agent");
    });

    it("should preserve private flag", () => {
      const messages: ChatwootMessage[] = [
        {
          id: 3,
          content: "Internal note",
          message_type: "outgoing",
          private: true,
          created_at: "2025-10-19T10:02:00Z",
          conversation_id: 123,
        },
      ];

      const result = convertMessages(messages);

      expect(result[0].isPrivate).toBe(true);
    });

    it("should convert multiple messages maintaining order", () => {
      const messages: ChatwootMessage[] = [
        {
          id: 1,
          content: "First message",
          message_type: "incoming",
          private: false,
          created_at: "2025-10-19T10:00:00Z",
          conversation_id: 123,
        },
        {
          id: 2,
          content: "Second message",
          message_type: "outgoing",
          private: false,
          created_at: "2025-10-19T10:01:00Z",
          conversation_id: 123,
        },
      ];

      const result = convertMessages(messages);

      expect(result).toHaveLength(2);
      expect(result[0].content).toBe("First message");
      expect(result[1].content).toBe("Second message");
    });
  });
});
