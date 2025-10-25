import { describe, expect, it, vi, beforeEach } from "vitest";

import { action } from "../../app/routes/actions/chatwoot.escalate";
import { logDecision } from "../../app/services/decisions.server";

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

vi.mock("../../app/config/chatwoot.server", () => ({
  getChatwootConfig: vi.fn(() => ({
    baseUrl: "https://chatwoot.example",
    token: "token",
    accountId: "1",
  })),
}));

vi.mock("../../app/config/featureFlags", () => ({
  isFeatureEnabled: vi.fn(() => false),
}));

describe("chatwoot escalate action", () => {
  beforeEach(() => {
    process.env.CHATWOOT_BASE_URL = "https://chatwoot.example";
    process.env.CHATWOOT_TOKEN = "token";
    process.env.CHATWOOT_ACCOUNT_ID = "1";
    sendReplyMock.mockReset();
    vi.mocked(logDecision).mockReset();
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

  it("stores grading data in decision log payload", async () => {
    const params = new URLSearchParams();
    params.set("action", "approve_send");
    params.set("conversationId", "42");
    params.set("selectedReply", "Thank you for your patience");
    params.set("note", "Customer satisfied");
    params.set("customerName", "Alex");
    params.set("suggestedReply", "");
    params.set("aiSuggestionUsed", "false");
    params.set("aiSuggestionMetadata", "");
    params.set("toneGrade", "5");
    params.set("accuracyGrade", "4");
    params.set("policyGrade", "5");

    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const response = await action({ request } as any);
    expect(response.status).toBe(200);

    expect(vi.mocked(logDecision)).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "chatwoot.approve_send",
        payload: expect.objectContaining({
          grades: {
            tone: 5,
            accuracy: 4,
            policy: 5,
          },
        }),
      }),
    );
  });

  it("handles missing grades gracefully", async () => {
    const params = new URLSearchParams();
    params.set("action", "approve_send");
    params.set("conversationId", "42");
    params.set("selectedReply", "Thank you");
    params.set("customerName", "Alex");
    params.set("suggestedReply", "");
    params.set("aiSuggestionUsed", "false");
    params.set("aiSuggestionMetadata", "");
    // No grades provided

    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const response = await action({ request } as any);
    expect(response.status).toBe(200);

    expect(vi.mocked(logDecision)).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          grades: {
            tone: null,
            accuracy: null,
            policy: null,
          },
        }),
      }),
    );
  });

  it("validates grade range (1-5 scale)", async () => {
    const params = new URLSearchParams();
    params.set("action", "approve_send");
    params.set("conversationId", "42");
    params.set("selectedReply", "Thank you");
    params.set("customerName", "Alex");
    params.set("suggestedReply", "");
    params.set("aiSuggestionUsed", "false");
    params.set("aiSuggestionMetadata", "");
    params.set("toneGrade", "3");
    params.set("accuracyGrade", "3");
    params.set("policyGrade", "3");

    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const response = await action({ request } as any);
    expect(response.status).toBe(200);

    const logCall = vi.mocked(logDecision).mock.calls[0][0];
    expect(logCall.payload.grades.tone).toBeGreaterThanOrEqual(1);
    expect(logCall.payload.grades.tone).toBeLessThanOrEqual(5);
    expect(logCall.payload.grades.accuracy).toBeGreaterThanOrEqual(1);
    expect(logCall.payload.grades.accuracy).toBeLessThanOrEqual(5);
    expect(logCall.payload.grades.policy).toBeGreaterThanOrEqual(1);
    expect(logCall.payload.grades.policy).toBeLessThanOrEqual(5);
  });
});
