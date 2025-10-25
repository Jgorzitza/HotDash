import { describe, expect, it, vi, afterEach } from "vitest";

import { loader } from "../../../app/routes/api.chatwoot.unread";

const mockGetUnreadCount = vi.fn();

vi.mock("../../../app/services/chatwoot/client", () => ({
  getUnreadCount: (...args: unknown[]) => mockGetUnreadCount(...args),
}));

afterEach(() => {
  mockGetUnreadCount.mockReset();
});

describe("/api/chatwoot/unread loader", () => {
  it("maps top conversation keys to snake_case", async () => {
    mockGetUnreadCount.mockResolvedValue({
      unreadCount: 4,
      topConversation: {
        customerName: "Taylor",
        snippet: "Need help with my order",
        createdAt: "2025-10-25T05:20:00.000Z",
      },
    });

    const response = await loader({
      request: new Request("https://hotdash.local/api/chatwoot/unread"),
      params: {},
      context: {},
    } as never);

    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.unread_count).toBe(4);
    expect(body.data.top_conversation).toEqual({
      customer_name: "Taylor",
      snippet: "Need help with my order",
      created_at: "2025-10-25T05:20:00.000Z",
    });
  });

  it("returns graceful fallback when service throws", async () => {
    mockGetUnreadCount.mockRejectedValueOnce(new Error("Network unavailable"));

    const response = await loader({
      request: new Request("https://hotdash.local/api/chatwoot/unread"),
      params: {},
      context: {},
    } as never);

    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.data.unread_count).toBe(0);
    expect(body.data.top_conversation).toBeNull();
    expect(body.error).toBe("Network unavailable");
  });
});

