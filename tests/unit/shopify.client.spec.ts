import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  __internal,
  getShopifyServiceContext,
} from "../../app/services/shopify/client";

const { mockAuthenticateAdmin } = vi.hoisted(() => ({
  mockAuthenticateAdmin: vi.fn(),
}));

vi.mock("../../app/shopify.server", () => ({
  authenticate: {
    admin: mockAuthenticateAdmin,
  },
}));

describe("getShopifyServiceContext", () => {
  beforeEach(() => {
    mockAuthenticateAdmin.mockReset();
    __internal.resetWaitImplementation();
    __internal.resetRandomImplementation();
  });

  it("returns context with wrapped admin client", async () => {
    const graphql = vi.fn().mockResolvedValue(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    mockAuthenticateAdmin.mockResolvedValue({
      admin: { graphql },
      session: { shop: "test-shop.myshopify.com", email: "ops@example.com" },
    });

    const context = await getShopifyServiceContext(new Request("https://example.com"));
    const response = await context.admin.graphql("#graphql\nquery {}", {});

    expect(response.status).toBe(200);
    expect(graphql).toHaveBeenCalledTimes(1);
    expect(context.shopDomain).toBe("test-shop.myshopify.com");
    expect(context.operatorEmail).toBe("ops@example.com");
  });

  it("retries on retryable responses using exponential backoff with jitter", async () => {
    const responses = [
      new Response("rate limited", { status: 429 }),
      new Response("server error", { status: 503 }),
      new Response("{}", { status: 200 }),
    ];
    const graphql = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          const next = responses.shift();
          if (!next) {
            throw new Error("No response available");
          }
          resolve(next);
        }),
    );
    const waits: number[] = [];

    __internal.setWaitImplementation(async (ms: number) => {
      waits.push(ms);
    });
    __internal.setRandomImplementation(() => 0);

    mockAuthenticateAdmin.mockResolvedValue({
      admin: { graphql },
      session: { shop: "retry-shop.myshopify.com" },
    });

    const context = await getShopifyServiceContext(new Request("https://example.com"));
    const response = await context.admin.graphql("#graphql\nquery {}", {});

    expect(response.status).toBe(200);
    expect(graphql).toHaveBeenCalledTimes(3);
    expect(waits).toEqual([500, 1000]);
  });

  it("returns final response when retries exhausted", async () => {
    const responses = [
      new Response("rate limited", { status: 429 }),
      new Response("still limited", { status: 429 }),
      new Response("retry failed", { status: 429 }),
    ];
    const graphql = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          const next = responses.shift();
          if (!next) {
            throw new Error("No response available");
          }
          resolve(next);
        }),
    );
    const waits: number[] = [];

    __internal.setWaitImplementation(async (ms: number) => {
      waits.push(ms);
    });
    __internal.setRandomImplementation(() => 0);

    mockAuthenticateAdmin.mockResolvedValue({
      admin: { graphql },
      session: { shop: "fail-shop.myshopify.com" },
    });

    const context = await getShopifyServiceContext(new Request("https://example.com"));
    const response = await context.admin.graphql("#graphql\nquery {}", {});

    expect(response.status).toBe(429);
    expect(graphql).toHaveBeenCalledTimes(3);
    expect(waits).toEqual([500, 1000]);
  });
});
