import { describe, test, expect } from "vitest";
import conversationsFixture from "../../fixtures/chatwoot/conversations.json";

/**
 * Contract tests for Chatwoot REST API Conversations
 * Validates that mock/live responses match expected schema from docs/data/data_contracts.md
 */

describe("Chatwoot Conversations API Contract", () => {
  test("fixture matches expected schema structure", () => {
    expect(conversationsFixture.payload).toBeDefined();
    expect(conversationsFixture.payload).toBeInstanceOf(Array);
    expect(conversationsFixture.payload.length).toBeGreaterThan(0);
  });

  test("each conversation has required fields", () => {
    const conversations = conversationsFixture.payload;

    for (const convo of conversations) {
      // Required fields (per data_contracts.md)
      expect(convo.id).toBeTypeOf("number");
      expect(convo.inbox_id).toBeTypeOf("number");
      expect(convo.status).toBeTypeOf("string");
      expect(convo.created_at).toBeTypeOf("number"); // Unix timestamp (seconds)
      expect(convo.tags).toBeInstanceOf(Array);

      // Validate status enum
      expect(["open", "pending", "resolved", "snoozed"]).toContain(
        convo.status,
      );
    }
  });

  test("created_at is Unix timestamp in seconds", () => {
    const conversations = conversationsFixture.payload;

    for (const convo of conversations) {
      // Should be seconds (not milliseconds)
      expect(convo.created_at).toBeGreaterThan(1000000000); // After year 2001
      expect(convo.created_at).toBeLessThan(2000000000); // Before year 2033

      // Should convert to valid JS Date when multiplied by 1000
      const date = new Date(convo.created_at * 1000);
      expect(date.toString()).not.toBe("Invalid Date");
    }
  });

  test("status enum coverage", () => {
    const conversations = conversationsFixture.payload;
    const statuses = new Set(conversations.map((c) => c.status));

    // Fixture should cover multiple status types
    expect(statuses.size).toBeGreaterThan(1);

    // Common production statuses: open, pending
    expect(statuses.has("open") || statuses.has("pending")).toBe(true);
  });

  test("tags array can be empty", () => {
    const conversations = conversationsFixture.payload;

    const withTags = conversations.filter((c) => c.tags.length > 0);
    const withoutTags = conversations.filter((c) => c.tags.length === 0);

    // Fixture should include both cases
    expect(withTags.length).toBeGreaterThan(0);
    expect(withoutTags.length).toBeGreaterThan(0);

    // Tags should be strings
    for (const convo of withTags) {
      for (const tag of convo.tags) {
        expect(tag).toBeTypeOf("string");
      }
    }
  });

  test("customer name resolution fallback chain", () => {
    const conversations = conversationsFixture.payload;

    // Test meta.sender.name (highest priority)
    const withSenderName = conversations.filter((c) => c.meta?.sender?.name);
    expect(withSenderName.length).toBeGreaterThan(0);

    for (const convo of withSenderName) {
      const senderName = convo.meta?.sender?.name;
      expect(senderName).toBeDefined();
      if (senderName) {
        expect(senderName).toBeTypeOf("string");
        expect(senderName.length).toBeGreaterThan(0);
      }
    }

    // Test contacts[].name (fallback)
    const withContactName = conversations.filter(
      (c) => !c.meta?.sender?.name && c.contacts?.length > 0,
    );

    if (withContactName.length > 0) {
      for (const convo of withContactName) {
        const firstContact = convo.contacts?.[0];
        if (firstContact?.name) {
          expect(firstContact.name).toBeTypeOf("string");
        }
      }
    }
  });

  test("escalation tag detection", () => {
    const conversations = conversationsFixture.payload;

    const escalated = conversations.filter((c) =>
      c.tags.includes("escalation"),
    );
    expect(escalated.length).toBeGreaterThan(0);

    for (const convo of escalated) {
      expect(convo.tags).toContain("escalation");
    }
  });

  test("inbox_id is positive integer", () => {
    const conversations = conversationsFixture.payload;

    for (const convo of conversations) {
      expect(Number.isInteger(convo.inbox_id)).toBe(true);
      expect(convo.inbox_id).toBeGreaterThan(0);
    }
  });

  test("conversation IDs are unique", () => {
    const conversations = conversationsFixture.payload;
    const ids = conversations.map((c) => c.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  test("meta object structure is flexible", () => {
    const conversations = conversationsFixture.payload;

    for (const convo of conversations) {
      expect(convo.meta).toBeDefined();

      // meta can be empty object or have sender
      if (Object.keys(convo.meta).length > 0) {
        // If meta exists, sender is optional
        if (convo.meta.sender) {
          expect(convo.meta.sender).toBeTypeOf("object");
        }
      }
    }
  });

  test("contacts array structure", () => {
    const conversations = conversationsFixture.payload;

    for (const convo of conversations) {
      // contacts can be empty array
      expect(convo.contacts).toBeInstanceOf(Array);

      for (const contact of convo.contacts) {
        expect(contact).toBeTypeOf("object");

        // name is optional within contact
        if (contact.name) {
          expect(contact.name).toBeTypeOf("string");
        }
      }
    }
  });
});
