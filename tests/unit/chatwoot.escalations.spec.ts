import { beforeEach, describe, expect, it, vi } from "vitest";

import { getEscalations } from "../../app/services/chatwoot/escalations";
import { clearCache } from "../../app/services/cache.server";

const mockListOpenConversations = vi.fn();
const mockListMessages = vi.fn();
const mockIsFeatureEnabled = vi.fn();

vi.mock("../../packages/integrations/chatwoot", () => ({
  chatwootClient: vi.fn(() => ({
    listOpenConversations: mockListOpenConversations,
    listMessages: mockListMessages,
    sendReply: vi.fn(),
    addLabel: vi.fn(),
    resolveConversation: vi.fn(),
  })),
}));

vi.mock("../../app/services/facts.server", () => ({
  recordDashboardFact: vi.fn(async (data) => ({
    id: 99,
    shopDomain: data.shopDomain,
    factType: data.factType,
    scope: data.scope ?? null,
    value: data.value,
    metadata: data.metadata ?? null,
    evidenceUrl: data.evidenceUrl ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
}));

vi.mock("../../app/config/featureFlags", () => ({
  isFeatureEnabled: (...args: unknown[]) => mockIsFeatureEnabled(...args),
}));

describe("getEscalations", () => {
  beforeEach(() => {
    process.env.CHATWOOT_BASE_URL = "https://chatwoot.example";
    process.env.CHATWOOT_TOKEN = "token";
    process.env.CHATWOOT_ACCOUNT_ID = "1";
    process.env.CHATWOOT_SLA_MINUTES = "30";
    clearCache();
    mockListOpenConversations.mockReset();
    mockListMessages.mockReset();
    mockIsFeatureEnabled.mockReset();
    mockIsFeatureEnabled.mockReturnValue(false);
  });

  it("returns escalations when SLA breached", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000) - 60 * 60; // 1 hour ago
    mockListOpenConversations
      .mockResolvedValueOnce([
        {
          id: 10,
          inbox_id: 1,
          status: "open",
          created_at: nowSeconds,
          tags: [],
          meta: { sender: { name: "Jamie" } },
        },
      ])
      .mockResolvedValueOnce([]);
    mockListMessages.mockResolvedValueOnce([
      {
        id: 1,
        message_type: 0,
        content: "Hello",
        created_at: nowSeconds,
      },
    ]);

    const result = await getEscalations("test-shop");

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.customerName).toBe("Jamie");
    expect(result.data[0]?.slaBreached).toBe(true);
    expect(result.data[0]?.messages).toHaveLength(1);
    expect(result.data[0]?.messages?.[0]?.author).toBe("contact");
    expect(result.data[0]?.suggestedReplyId).toBe("ack_delay");
    expect(result.data[0]?.suggestedReply).toContain("Hi Jamie");
    expect(result.data[0]?.aiSuggestion).toBeNull();
    expect(result.data[0]?.aiSuggestionEnabled).toBe(false);
    expect(result.aiEnabled).toBe(false);
    expect(result.source).toBe("fresh");

    const cached = await getEscalations("test-shop");
    expect(cached.source).toBe("cache");
    expect(cached.aiEnabled).toBe(false);
    expect(mockListOpenConversations).toHaveBeenCalledTimes(2);
  });

  it("supports CHATWOOT_ACCESS_TOKEN as alias", async () => {
    delete process.env.CHATWOOT_TOKEN;
    process.env.CHATWOOT_ACCESS_TOKEN = "alias-token";

    mockListOpenConversations.mockResolvedValueOnce([]);

    const result = await getEscalations("alias-shop");
    expect(result.data).toEqual([]);
    expect(mockListOpenConversations).toHaveBeenCalled();

    // cleanup for next test
    delete process.env.CHATWOOT_ACCESS_TOKEN;
    process.env.CHATWOOT_TOKEN = "token";
  });

  it("selects ship_update template when shipping keywords detected", async () => {
    const createdAt = Math.floor(Date.now() / 1000) - 90 * 60;
    mockListOpenConversations
      .mockResolvedValueOnce([
        {
          id: 20,
          inbox_id: 2,
          status: "open",
          created_at: createdAt,
          tags: ["shipping_delay"],
          meta: { sender: { name: "Alex" } },
        },
      ])
      .mockResolvedValueOnce([]);
    mockListMessages.mockResolvedValueOnce([
      {
        id: 2,
        message_type: 0,
        content: "Can you check the tracking number?",
        created_at: createdAt,
      },
    ]);

    const result = await getEscalations("ship-shop");

    expect(result.data[0]?.suggestedReplyId).toBe("ship_update");
    expect(result.data[0]?.suggestedReply).toContain("Alex");
  });

  it("selects refund_offer template when refund keywords detected", async () => {
    const createdAt = Math.floor(Date.now() / 1000) - 120 * 60;
    mockListOpenConversations
      .mockResolvedValueOnce([
        {
          id: 30,
          inbox_id: 3,
          status: "open",
          created_at: createdAt,
          tags: [],
          meta: { sender: { name: "Morgan" } },
        },
      ])
      .mockResolvedValueOnce([]);
    mockListMessages.mockResolvedValueOnce([
      {
        id: 3,
        message_type: 0,
        content: "The product arrived damaged, I need a refund.",
        created_at: createdAt,
      },
    ]);

    const result = await getEscalations("refund-shop");

    expect(result.data[0]?.suggestedReplyId).toBe("refund_offer");
    expect(result.data[0]?.suggestedReply).toContain("Morgan");
  });

  it("selects ship_update template using expanded heuristics for delivery delays", async () => {
    const createdAt = Math.floor(Date.now() / 1000) - 75 * 60;
    mockListOpenConversations
      .mockResolvedValueOnce([
        {
          id: 40,
          inbox_id: 4,
          status: "open",
          created_at: createdAt,
          tags: [],
          meta: { sender: { name: "Taylor" } },
        },
      ])
      .mockResolvedValueOnce([]);
    mockListMessages.mockResolvedValueOnce([
      {
        id: 4,
        message_type: 0,
        content:
          "My package is a lost package and the delivery is delayed again",
        created_at: createdAt,
      },
    ]);

    const result = await getEscalations("delayed-delivery-shop");

    expect(result.data[0]?.suggestedReplyId).toBe("ship_update");
    expect(result.data[0]?.suggestedReply).toContain("Taylor");
  });

  it("falls back to ack_delay when no keywords match but text exists", async () => {
    const createdAt = Math.floor(Date.now() / 1000) - 45 * 60;
    mockListOpenConversations
      .mockResolvedValueOnce([
        {
          id: 50,
          inbox_id: 5,
          status: "open",
          created_at: createdAt,
          tags: [],
          meta: { sender: { name: "Jordan" } },
        },
      ])
      .mockResolvedValueOnce([]);
    mockListMessages.mockResolvedValueOnce([
      {
        id: 5,
        message_type: 0,
        content: "Checking in on my order status, please advise.",
        created_at: createdAt,
      },
    ]);

    const result = await getEscalations("generic-inquiry-shop");

    expect(result.data[0]?.suggestedReplyId).toBe("ack_delay");
    expect(result.data[0]?.suggestedReply).toContain("Jordan");
  });

  it("uses tags when customer message is agent-only", async () => {
    const createdAt = Math.floor(Date.now() / 1000) - 110 * 60;
    mockListOpenConversations
      .mockResolvedValueOnce([
        {
          id: 60,
          inbox_id: 6,
          status: "open",
          created_at: createdAt,
          tags: ["Refund Issue"],
          meta: { sender: { name: "Quinn" } },
        },
      ])
      .mockResolvedValueOnce([]);
    mockListMessages.mockResolvedValueOnce([
      {
        id: 6,
        message_type: 1,
        content: "Agent followed up",
        created_at: createdAt,
      },
    ]);

    const result = await getEscalations("tag-only-shop");

    expect(result.data[0]?.suggestedReplyId).toBe("refund_offer");
    expect(result.data[0]?.suggestedReply).toContain("Quinn");
  });
});
