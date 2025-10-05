import { beforeEach, describe, expect, it, vi } from "vitest";

import { getEscalations } from "../../app/services/chatwoot/escalations";
import { clearCache } from "../../app/services/cache.server";

const mockListOpenConversations = vi.fn();
const mockListMessages = vi.fn();

vi.mock("../../packages/integrations/chatwoot", () => ({
  chatwootClient: vi.fn(() => ({
    listOpenConversations: mockListOpenConversations,
    listMessages: mockListMessages,
    sendReply: vi.fn(),
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

describe("getEscalations", () => {
  beforeEach(() => {
    process.env.CHATWOOT_BASE_URL = "https://chatwoot.example";
    process.env.CHATWOOT_TOKEN = "token";
    process.env.CHATWOOT_ACCOUNT_ID = "1";
    process.env.CHATWOOT_SLA_MINUTES = "30";
    clearCache();
    mockListOpenConversations.mockReset();
    mockListMessages.mockReset();
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
    expect(result.source).toBe("fresh");

    const cached = await getEscalations("test-shop");
    expect(cached.source).toBe("cache");
    expect(mockListOpenConversations).toHaveBeenCalledTimes(2);
  });
});
