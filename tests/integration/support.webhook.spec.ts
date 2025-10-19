import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { forwardChatwootWebhook } from "~/services/support/webhook.server";
import { ServiceError } from "~/services/types";

// Mock the facts recording
vi.mock("~/services/facts.server", () => ({
  recordDashboardFact: vi.fn().mockResolvedValue({}),
}));

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function textResponse(body: string, status: number) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain" },
  });
}

describe("support.webhook forwardChatwootWebhook", () => {
  let waitSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    waitSpy = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retries transient Agent SDK errors and succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse("agent down", 502))
      .mockResolvedValueOnce(jsonResponse({ status: "queued" }, 200));

    const result = await forwardChatwootWebhook(
      { event: "test" },
      {
        fetchImpl: fetchMock as unknown as typeof fetch,
        wait: waitSpy,
        baseDelayMs: 25,
        maxAttempts: 3,
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(waitSpy).toHaveBeenCalledTimes(1);
    expect(waitSpy).toHaveBeenCalledWith(25);
    expect(result.success).toBe(true);
    expect(result.attempts).toBe(2);
    expect(result.agentStatus).toBe("queued");
  });

  it("throws after exhausting retry attempts on persistent failure", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(textResponse("downstream error", 503));

    let thrown: unknown;
    try {
      await forwardChatwootWebhook(
        { event: "still failing" },
        {
          fetchImpl: fetchMock as unknown as typeof fetch,
          wait: waitSpy,
          baseDelayMs: 10,
          maxAttempts: 3,
        },
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ServiceError);
    expect((thrown as ServiceError).retryable).toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(waitSpy).toHaveBeenCalledTimes(2);
  });

  it("does not retry on client errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse("invalid payload", 400));

    await expect(
      forwardChatwootWebhook(
        { event: "bad payload" },
        {
          fetchImpl: fetchMock as unknown as typeof fetch,
          wait: waitSpy,
        },
      ),
    ).rejects.toMatchObject({ retryable: false });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(waitSpy).not.toHaveBeenCalled();
  });

  it("retries on HTTP 429 throttling responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse("Too Many Requests", 429))
      .mockResolvedValueOnce(jsonResponse({ status: "processed" }, 200));

    const result = await forwardChatwootWebhook(
      { event: "throttle" },
      {
        fetchImpl: fetchMock as unknown as typeof fetch,
        wait: waitSpy,
        baseDelayMs: 50,
        maxAttempts: 4,
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(waitSpy).toHaveBeenCalledTimes(1);
    expect(waitSpy).toHaveBeenCalledWith(50);
    expect(result.success).toBe(true);
    expect(result.agentStatus).toBe("processed");
  });

  it("handles HTTP 500 server error with retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse("Internal Server Error", 500))
      .mockResolvedValueOnce(jsonResponse({ status: "queued" }, 200));

    const result = await forwardChatwootWebhook(
      { event: "test" },
      {
        fetchImpl: fetchMock as unknown as typeof fetch,
        wait: waitSpy,
        baseDelayMs: 10,
        maxAttempts: 3,
      },
    );

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(waitSpy).toHaveBeenCalledTimes(1);
  });

  it("handles HTTP 502 bad gateway with retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse("Bad Gateway", 502))
      .mockResolvedValueOnce(jsonResponse({ status: "queued" }, 200));

    const result = await forwardChatwootWebhook(
      { event: "test" },
      {
        fetchImpl: fetchMock as unknown as typeof fetch,
        wait: waitSpy,
        baseDelayMs: 10,
        maxAttempts: 3,
      },
    );

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("handles HTTP 504 gateway timeout with retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse("Gateway Timeout", 504))
      .mockResolvedValueOnce(jsonResponse({ status: "queued" }, 200));

    const result = await forwardChatwootWebhook(
      { event: "test" },
      {
        fetchImpl: fetchMock as unknown as typeof fetch,
        wait: waitSpy,
        baseDelayMs: 10,
        maxAttempts: 3,
      },
    );

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry on HTTP 401 unauthorized", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse("Unauthorized", 401));

    await expect(
      forwardChatwootWebhook(
        { event: "bad auth" },
        {
          fetchImpl: fetchMock as unknown as typeof fetch,
          wait: waitSpy,
        },
      ),
    ).rejects.toMatchObject({ retryable: false });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(waitSpy).not.toHaveBeenCalled();
  });

  it("does not retry on HTTP 404 not found", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse("Not Found", 404));

    await expect(
      forwardChatwootWebhook(
        { event: "bad endpoint" },
        {
          fetchImpl: fetchMock as unknown as typeof fetch,
          wait: waitSpy,
        },
      ),
    ).rejects.toMatchObject({ retryable: false });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(waitSpy).not.toHaveBeenCalled();
  });

  it("does not retry on HTTP 422 unprocessable entity", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse("Unprocessable Entity", 422));

    await expect(
      forwardChatwootWebhook(
        { event: "bad payload" },
        {
          fetchImpl: fetchMock as unknown as typeof fetch,
          wait: waitSpy,
        },
      ),
    ).rejects.toMatchObject({ retryable: false });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(waitSpy).not.toHaveBeenCalled();
  });

  it("records success metrics on completion", async () => {
    const factsModule = await import("~/services/facts.server");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ status: "queued" }, 200));

    await forwardChatwootWebhook(
      { event: "test" },
      {
        fetchImpl: fetchMock as unknown as typeof fetch,
        wait: waitSpy,
      },
    );

    expect(factsModule.recordDashboardFact).toHaveBeenCalledWith(
      expect.objectContaining({
        factType: "support.webhook.retry",
        scope: "webhook_forwarding",
        value: expect.objectContaining({
          success: true,
          attempts: 1,
        }),
      }),
    );
  });

  it("throws error after retry exhaustion", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(textResponse("downstream error", 503));

    let thrown: unknown;
    try {
      await forwardChatwootWebhook(
        { event: "persistent failure" },
        {
          fetchImpl: fetchMock as unknown as typeof fetch,
          wait: waitSpy,
          baseDelayMs: 10,
          maxAttempts: 3,
        },
      );
    } catch (error) {
      thrown = error;
    }

    // Verify error thrown
    expect(thrown).toBeInstanceOf(ServiceError);
    expect((thrown as ServiceError).retryable).toBe(true);

    // Verify all attempts were made
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(waitSpy).toHaveBeenCalledTimes(2);
  });

  it("respects exponential backoff timing", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse("error", 503))
      .mockResolvedValueOnce(textResponse("error", 503))
      .mockResolvedValueOnce(jsonResponse({ status: "ok" }, 200));

    await forwardChatwootWebhook(
      { event: "backoff test" },
      {
        fetchImpl: fetchMock as unknown as typeof fetch,
        wait: waitSpy,
        baseDelayMs: 100,
        backoffFactor: 2,
        maxAttempts: 3,
      },
    );

    expect(waitSpy).toHaveBeenCalledTimes(2);
    expect(waitSpy).toHaveBeenNthCalledWith(1, 100); // First retry: 100ms
    expect(waitSpy).toHaveBeenNthCalledWith(2, 200); // Second retry: 200ms
  });

  it("includes duration in result", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ status: "queued" }, 200));

    const result = await forwardChatwootWebhook(
      { event: "timing test" },
      {
        fetchImpl: fetchMock as unknown as typeof fetch,
        wait: waitSpy,
      },
    );

    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.durationMs).toBe("number");
  });

  it("handles network errors as retryable", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(jsonResponse({ status: "queued" }, 200));

    const result = await forwardChatwootWebhook(
      { event: "network recovery" },
      {
        fetchImpl: fetchMock as unknown as typeof fetch,
        wait: waitSpy,
        baseDelayMs: 10,
        maxAttempts: 3,
      },
    );

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
