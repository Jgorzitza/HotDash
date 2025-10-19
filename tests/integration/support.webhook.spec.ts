import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import type { ActionFunctionArgs } from "@remix-run/node";
import { action } from "~/routes/api.webhooks.chatwoot";
import { forwardChatwootWebhook } from "~/services/support/chatwoot-webhook.server";
import { collectSupportHealthArtifacts } from "~/services/support/health-artifacts.server";
import * as learningModule from "~/services/support/chatwoot-learning.server";

interface ResponseLike {
  ok: boolean;
  status: number;
  headers: {
    get(name: string): string | null;
  };
  json(): Promise<unknown>;
  text(): Promise<string>;
}

interface MockResponseOptions {
  ok: boolean;
  status: number;
  headers?: Record<string, string>;
  jsonBody?: unknown;
  textBody?: string;
}

function createMockResponse(options: MockResponseOptions): ResponseLike {
  const { ok, status, headers = {}, jsonBody = {}, textBody = "" } = options;

  return {
    ok,
    status,
    headers: {
      get(name: string) {
        return headers[name] ?? null;
      },
    },
    async json() {
      return jsonBody;
    },
    async text() {
      return textBody;
    },
  };
}

describe("forwardChatwootWebhook", () => {
  const payload = JSON.stringify({ event: "message_created" });
  const agentSdkUrl = "https://agent.example";

  it("returns immediately on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createMockResponse({
        ok: true,
        status: 200,
        jsonBody: { status: "ok" },
      }),
    );

    const { response, attempts } = await forwardChatwootWebhook({
      payload,
      agentSdkUrl,
      fetchImpl: fetchMock,
      sleep: vi.fn(),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(attempts).toBe(1);
    await expect(response.json()).resolves.toStrictEqual({ status: "ok" });
  });

  it("retries once on retryable error then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createMockResponse({ ok: false, status: 500, textBody: "boom" }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          status: 200,
          jsonBody: { status: "ok" },
        }),
      );

    const sleepMock = vi.fn().mockResolvedValue(undefined);

    const { response, attempts } = await forwardChatwootWebhook({
      payload,
      agentSdkUrl,
      fetchImpl: fetchMock,
      sleep: sleepMock,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sleepMock).toHaveBeenCalledTimes(1);
    expect(attempts).toBe(2);
    await expect(response.json()).resolves.toStrictEqual({ status: "ok" });
  });

  it("respects Retry-After header", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 503,
          headers: { "Retry-After": "3" },
        }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          status: 200,
          jsonBody: { status: "ok" },
        }),
      );

    const sleepMock = vi.fn().mockResolvedValue(undefined);

    await forwardChatwootWebhook({
      payload,
      agentSdkUrl,
      fetchImpl: fetchMock,
      sleep: sleepMock,
    });

    expect(sleepMock).toHaveBeenCalledWith(3000);
  });

  it("returns final failure response after exhausting retries", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createMockResponse({ ok: false, status: 502, textBody: "bad" }),
      );
    const sleepMock = vi.fn().mockResolvedValue(undefined);

    const result = await forwardChatwootWebhook({
      payload,
      agentSdkUrl,
      fetchImpl: fetchMock,
      retryAttempts: 2,
      sleep: sleepMock,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.attempts).toBe(2);
    expect(result.response.ok).toBe(false);
  });

  it("times out slow Agent SDK responses and retries", async () => {
    vi.useFakeTimers();
    const randomSpy = vi.spyOn(global.Math, "random").mockReturnValue(0);

    const delayedResponse = () =>
      new Promise<ResponseLike>((resolve) => {
        setTimeout(() => {
          resolve(
            createMockResponse({
              ok: true,
              status: 200,
              jsonBody: { status: "ok" },
            }),
          );
        }, 1500);
      });

    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => delayedResponse())
      .mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          status: 200,
          jsonBody: { status: "ok" },
        }),
      );

    const sleepMock = vi.fn().mockResolvedValue(undefined);

    const resultPromise = forwardChatwootWebhook({
      payload,
      agentSdkUrl,
      fetchImpl: fetchMock as any,
      sleep: sleepMock,
      retryAttempts: 2,
      retryBaseDelayMs: 500,
      timeoutMs: 1000,
    });

    await vi.advanceTimersByTimeAsync(1000);
    await vi.runAllTicks();

    const result = await resultPromise;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sleepMock).toHaveBeenCalledWith(500);
    expect(result.attempts).toBe(2);
    randomSpy.mockRestore();
    vi.useRealTimers();
  });
});

describe("Support health artifacts collector", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty array when directory is missing", async () => {
    const missingError = Object.assign(new Error("missing"), {
      code: "ENOENT",
    });
    const readdirMock = vi
      .spyOn(fs, "readdir" as unknown as never)
      .mockRejectedValue(missingError);

    const result = await collectSupportHealthArtifacts("2025-10-18");

    expect(readdirMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it("collects and sorts artifact metadata", async () => {
    const readdirMock = vi
      .spyOn(fs, "readdir" as unknown as never)
      .mockResolvedValue([
        {
          name: "chatwoot-health.jsonl",
          isFile: () => true,
        },
        {
          name: "subdir",
          isFile: () => false,
        },
      ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);

    const statMock = vi
      .spyOn(fs, "stat" as unknown as never)
      .mockResolvedValue({
        size: 1024,
        mtime: new Date("2025-10-18T12:00:00Z"),
      } as Awaited<ReturnType<typeof fs.stat>>);

    const result = await collectSupportHealthArtifacts("2025-10-18", {
      rootDir: "/workspace",
    });

    expect(readdirMock).toHaveBeenCalledWith(
      "/workspace/artifacts/support/2025-10-18/ops",
      { withFileTypes: true },
    );
    expect(statMock).toHaveBeenCalledWith(
      "/workspace/artifacts/support/2025-10-18/ops/chatwoot-health.jsonl",
    );
    expect(result).toEqual([
      {
        filename: "chatwoot-health.jsonl",
        absolutePath:
          "/workspace/artifacts/support/2025-10-18/ops/chatwoot-health.jsonl",
        size: 1024,
        modifiedAt: new Date("2025-10-18T12:00:00.000Z"),
      },
    ]);
  });
});
describe("Chatwoot webhook route", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.AGENT_SDK_URL = "https://agent.example";
  });

  afterEach(() => {
    Object.assign(process.env, originalEnv);
    global.fetch = originalFetch;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function buildRequest(body: unknown) {
    return new Request("http://localhost/api/webhooks/chatwoot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns success payload when Agent SDK succeeds", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createMockResponse({
        ok: true,
        status: 200,
        jsonBody: {
          status: "draft_ready",
          draft: "Sample reply",
          conversationId: 42,
          promptVersion: "test",
          templateId: "promptA",
        },
      }),
    );
    global.fetch = fetchMock as typeof global.fetch;
    const learningSpy = vi
      .spyOn(learningModule, "recordReplyLearningSignal")
      .mockResolvedValue(undefined);

    const response = await action({
      request: buildRequest({ event: "message_created" }),
    } as ActionFunctionArgs);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const parsed = await response.json();
    expect(parsed.success).toBe(true);
    expect(parsed.agentStatus).toBe("draft_ready");
    expect(parsed.attempts).toBe(1);
    expect(learningSpy).toHaveBeenCalledWith({
      conversationId: 42,
      draft: "Sample reply",
      messageContent: "",
      customerName: undefined,
      promptVersion: "test",
      templateId: "promptA",
    });
  });

  it("retries on failure and surfaces attempts count", async () => {
    vi.spyOn(global.Math, "random").mockReturnValue(0);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createMockResponse({ ok: false, status: 500, textBody: "boom" }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          status: 200,
          jsonBody: { status: "draft_ready" },
        }),
      );
    global.fetch = fetchMock as typeof global.fetch;
    vi.useFakeTimers();

    const actionPromise = action({
      request: buildRequest({ event: "message_created" }),
    } as ActionFunctionArgs);

    await vi.advanceTimersByTimeAsync(500);
    const response = await actionPromise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const parsed = await response.json();
    expect(parsed.success).toBe(true);
    expect(parsed.attempts).toBe(2);
  });

  it("returns 502 when Agent SDK keeps failing", async () => {
    vi.spyOn(global.Math, "random").mockReturnValue(0);
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createMockResponse({ ok: false, status: 503, textBody: "down" }),
      );
    global.fetch = fetchMock as typeof global.fetch;
    vi.useFakeTimers();

    const actionPromise = action({
      request: buildRequest({ event: "message_created" }),
    } as ActionFunctionArgs);

    await vi.advanceTimersByTimeAsync(500);
    await vi.advanceTimersByTimeAsync(1000);

    const response = await actionPromise;
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(response.status).toBe(502);
    const parsed = await response.json();
    expect(parsed.attempts).toBe(3);
  });
});

describe("Support health artifacts collector", () => {
  it("returns empty array when directory is missing", async () => {
    const missingError = Object.assign(new Error("missing"), {
      code: "ENOENT",
    });
    const fsClient = {
      readdir: vi.fn().mockRejectedValue(missingError),
      stat: vi.fn(),
    } as any;

    const result = await collectSupportHealthArtifacts("2025-10-18", {
      fsClient,
    });

    expect(fsClient.readdir).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it("collects and sorts artifact metadata", async () => {
    const fsClient = {
      readdir: vi.fn().mockResolvedValue([
        {
          name: "chatwoot-health.jsonl",
          isFile: () => true,
        },
        {
          name: "subdir",
          isFile: () => false,
        },
      ]),
      stat: vi.fn().mockResolvedValue({
        size: 1024,
        mtime: new Date("2025-10-18T12:00:00Z"),
      }),
    } as any;

    const result = await collectSupportHealthArtifacts("2025-10-18", {
      rootDir: "/workspace",
      fsClient,
    });

    expect(fsClient.readdir).toHaveBeenCalledWith(
      "/workspace/artifacts/support/2025-10-18/ops",
      { withFileTypes: true },
    );
    expect(fsClient.stat).toHaveBeenCalledWith(
      "/workspace/artifacts/support/2025-10-18/ops/chatwoot-health.jsonl",
    );
    expect(result).toEqual([
      {
        filename: "chatwoot-health.jsonl",
        absolutePath:
          "/workspace/artifacts/support/2025-10-18/ops/chatwoot-health.jsonl",
        size: 1024,
        modifiedAt: new Date("2025-10-18T12:00:00.000Z"),
      },
    ]);
  });
});
