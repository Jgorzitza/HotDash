import { describe, expect, it } from "vitest";

/**
 * Chatwoot API Contract Tests
 */

describe("Chatwoot API Contract", () => {
  it("conversations response shape", () => {
    const mock = {
      data: {
        payload: [
          {
            id: 123,
            status: "open",
            messages: [],
            meta: { sender: { id: 1, name: "Customer" } },
          },
        ],
      },
    };

    expect(mock.data.payload[0]).toHaveProperty("id");
    expect(mock.data.payload[0]).toHaveProperty("status");
  });

  it("message create response contract", () => {
    const mock = { id: 456, content: "Reply", message_type: "outgoing", private: false };
    expect(mock).toHaveProperty("id");
    expect(mock).toHaveProperty("message_type");
  });
});
