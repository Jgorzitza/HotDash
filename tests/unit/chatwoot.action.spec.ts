import { describe, expect, it, vi, beforeEach } from "vitest";

import { action } from "../../app/routes/actions/chatwoot.escalate";

const sendReplyMock = vi.fn();

vi.mock("../../packages/integrations/chatwoot", () => ({
  chatwootClient: vi.fn(() => ({
    sendReply: sendReplyMock,
  })),
}));

vi.mock("../../app/services/decisions.server", () => ({
  logDecision: vi.fn(async () => ({ id: 1 })),
}));

vi.mock("../../app/shopify.server", () => ({
  authenticate: {
    admin: vi.fn(async () => ({
      session: {
        shop: "test-shop",
        email: "ops@example.com",
      },
    })),
  },
}));

describe("chatwoot escalate action", () => {
  beforeEach(() => {
    process.env.CHATWOOT_BASE_URL = "https://chatwoot.example";
    process.env.CHATWOOT_TOKEN = "token";
    process.env.CHATWOOT_ACCOUNT_ID = "1";
    sendReplyMock.mockReset();
  });

  it("sends reply using template", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        conversationId: 42,
        templateId: "ack_delay",
        note: "Customer waiting",
        customerName: "Alex",
      }),
    });

    const response = await action({ request } as any);
    expect(response.status).toBe(200);
    expect(sendReplyMock).toHaveBeenCalledWith(
      42,
      expect.stringContaining("Alex"),
    );
  });
});
