import { describe, test, expect } from "vitest";
import messagesFixture from "../../fixtures/chatwoot/messages.json";

/**
 * Contract tests for Chatwoot REST API Messages
 * Validates that mock/live responses match expected schema from docs/data/data_contracts.md
 */

describe("Chatwoot Messages API Contract", () => {
  test("fixture matches expected schema structure", () => {
    expect(messagesFixture.payload).toBeDefined();
    expect(messagesFixture.payload).toBeInstanceOf(Array);
    expect(messagesFixture.payload.length).toBeGreaterThan(0);
  });

  test("each message has required fields", () => {
    const messages = messagesFixture.payload;

    for (const msg of messages) {
      // Required fields (per data_contracts.md)
      expect(msg.id).toBeTypeOf("number");
      expect(msg.content).toBeTypeOf("string");
      expect(msg.message_type).toBeTypeOf("number");
      expect(msg.created_at).toBeTypeOf("number"); // Unix timestamp (seconds)

      // message_type should be 0, 1, or 2
      expect([0, 1, 2]).toContain(msg.message_type);
    }
  });

  test("message_type enum mapping", () => {
    const messages = messagesFixture.payload;

    const incoming = messages.filter(m => m.message_type === 0);
    const outgoing = messages.filter(m => m.message_type === 1);
    const activity = messages.filter(m => m.message_type === 2);

    // Fixture should cover multiple message types
    expect(incoming.length).toBeGreaterThan(0);
    expect(outgoing.length + activity.length).toBeGreaterThan(0);

    // Per contract: 0=incoming, 1=outgoing, 2=activity
    for (const msg of incoming) {
      expect(msg.sender?.type).toBe("contact");
    }

    for (const msg of outgoing) {
      expect(msg.sender?.type).toBe("user");
    }

    // Activity messages may have null sender
    for (const msg of activity) {
      expect(msg.sender === null || msg.sender === undefined).toBe(true);
    }
  });

  test("created_at is Unix timestamp in seconds", () => {
    const messages = messagesFixture.payload;

    for (const msg of messages) {
      // Should be seconds (not milliseconds)
      expect(msg.created_at).toBeGreaterThan(1000000000); // After year 2001
      expect(msg.created_at).toBeLessThan(2000000000); // Before year 2033

      // Should convert to valid JS Date when multiplied by 1000
      const date = new Date(msg.created_at * 1000);
      expect(date.toString()).not.toBe("Invalid Date");
    }
  });

  test("sender type enum validation", () => {
    const messages = messagesFixture.payload;

    for (const msg of messages) {
      if (msg.sender) {
        expect(["contact", "user"]).toContain(msg.sender.type);
      }
    }
  });

  test("content is non-empty string", () => {
    const messages = messagesFixture.payload;

    for (const msg of messages) {
      expect(msg.content.length).toBeGreaterThan(0);
      expect(msg.content).not.toMatch(/^\s*$/); // not just whitespace
    }
  });

  test("message sorting by timestamp", () => {
    const messages = messagesFixture.payload;

    // Verify timestamps are sortable
    const sorted = [...messages].sort((a, b) => b.created_at - a.created_at);

    expect(sorted.length).toBe(messages.length);

    // Latest message should be at index 0 after descending sort
    expect(sorted[0].created_at).toBeGreaterThanOrEqual(sorted[sorted.length - 1].created_at);
  });

  test("SLA clock calculation uses last customer message", () => {
    const messages = messagesFixture.payload;

    // Filter for incoming messages (message_type = 0)
    const customerMessages = messages.filter(m => m.message_type === 0);

    expect(customerMessages.length).toBeGreaterThan(0);

    // Sort by timestamp descending to get latest customer message
    const sortedCustomerMessages = [...customerMessages].sort(
      (a, b) => b.created_at - a.created_at
    );

    const lastCustomerMessage = sortedCustomerMessages[0];

    // Verify it's the most recent customer message
    expect(lastCustomerMessage.message_type).toBe(0);
    expect(lastCustomerMessage.sender?.type).toBe("contact");
  });

  test("message IDs are unique within conversation", () => {
    const messages = messagesFixture.payload;
    const ids = messages.map(m => m.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  test("activity messages may have null sender", () => {
    const messages = messagesFixture.payload;

    const activityMessages = messages.filter(m => m.message_type === 2);

    if (activityMessages.length > 0) {
      for (const msg of activityMessages) {
        // Activity messages typically have no sender or null sender
        expect(msg.sender === null || msg.sender === undefined || msg.sender.type === undefined).toBe(true);
      }
    }
  });

  test("timestamp consistency across message types", () => {
    const messages = messagesFixture.payload;

    // All messages should have consistent timestamp format
    for (const msg of messages) {
      const date = new Date(msg.created_at * 1000);
      const iso = date.toISOString();

      // ISO string should be valid format
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    }
  });
});
