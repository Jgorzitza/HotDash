import { describe, it, expect, vi, afterEach } from "vitest";
import { action as chatwootWebhook } from "../../app/routes/api.webhooks.chatwoot";

// Minimal Chatwoot payload fixture
const payload = {
  event: "message_created",
  conversation: { id: 12345 },
  message_type: "incoming",
  content: "Hello, I need help",
};

function buildRequest(body: any) {
  return new Request("http://localhost/api/webhooks/chatwoot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // In tests NODE_ENV !== 'production', signature is skipped
      "X-Chatwoot-Signature": "ignored-in-tests",
    },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Support Webhook Retry Policy", () => {
  it("returns 500 when Agent SDK returns 500 (triggers Chatwoot retry)", async () => {
    // Mock downstream Agent SDK call to fail
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("downstream error", { status: 500 }) as any
    );

    const req = buildRequest(payload);
    const res = (await chatwootWebhook({ request: req } as any)) as Response;

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toMatchObject({ error: expect.any(String) });
  });

  it("returns 200 with success when Agent SDK returns OK", async () => {
    // Mock downstream Agent SDK call to succeed
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "queued" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }) as any
    );

    const req = buildRequest(payload);
    const res = (await chatwootWebhook({ request: req } as any)) as Response;

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ success: true, processed: true });
  });
});

