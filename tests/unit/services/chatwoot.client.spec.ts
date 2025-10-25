import { beforeEach, describe, expect, it, vi } from "vitest";

import { getUnreadCount } from "../../../app/services/chatwoot/client";

const mockListOpenConversations = vi.fn();
const mockListMessages = vi.fn();

vi.mock("../../../app/config/chatwoot.server", () => ({
  getChatwootConfig: vi.fn(() => ({
    baseUrl: "https://chatwoot.example",
    token: "token",
    accountId: 1,
  })),
}));

vi.mock("../../../packages/integrations/chatwoot", () => ({
  chatwootClient: vi.fn(() => ({
    listOpenConversations: mockListOpenConversations,
    listMessages: mockListMessages,
  })),
}));

describe("getUnreadCount", () => {
  beforeEach(() => {
    mockListOpenConversations.mockReset();
    mockListMessages.mockReset();
  });

  it("summarizes unread conversations using existing message payload", async () => {
    const createdAt = Math.floor(Date.now() / 1000) - 120;

    mockListOpenConversations.mockResolvedValueOnce([
      {
        id: 11,
        inbox_id: 1,
        status: "open",
        created_at: createdAt,
        last_activity_at: createdAt,
        unread_count: 2,
        meta: { sender: { name: "Taylor" } },
        messages: [
          {
            id: 91,
            content: "Need help with my order",
            message_type: 0,
            created_at: createdAt,
          },
        ],
      },
    ]);

    const summary = await getUnreadCount();

    expect(summary.unreadCount).toBe(2);
    expect(summary.conversations).toHaveLength(1);
    expect(summary.topConversation?.customerName).toBe("Taylor");
    expect(summary.topConversation?.snippet).toBe("Need help with my order");
    expect(mockListMessages).not.toHaveBeenCalled();
  });

  it("fetches messages when conversation payload lacks them", async () => {
    const createdAt = Math.floor(Date.now() / 1000) - 90;

    mockListOpenConversations.mockImplementationOnce((page?: number) => {
      expect(page).toBe(1);
      return Promise.resolve([
        {
          id: 22,
          inbox_id: 1,
          status: "open",
          created_at: createdAt,
          last_activity_at: createdAt,
          unread_count: 0,
          meta: { sender: { name: "Jordan" } },
        },
      ]);
    });

    mockListMessages.mockResolvedValueOnce([
      {
        id: 100,
        content: "Hello there",
        message_type: 0,
        created_at: createdAt,
      },
    ]);

    const summary = await getUnreadCount();

    expect(summary.unreadCount).toBe(1);
    expect(summary.topConversation?.customerName).toBe("Jordan");
    expect(summary.topConversation?.snippet).toBe("Hello there");
    expect(mockListMessages).toHaveBeenCalledWith(22);
  });

  it("returns zero state when no open conversations", async () => {
    mockListOpenConversations.mockResolvedValueOnce([]);

    const summary = await getUnreadCount();

    expect(summary.unreadCount).toBe(0);
    expect(summary.conversations).toHaveLength(0);
    expect(summary.topConversation).toBeNull();
  });
});
