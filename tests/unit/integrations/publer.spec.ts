import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  getJobStatus,
  schedulePost,
} from "../../../packages/integrations/publer.ts";

const originalFetch = global.fetch;

beforeEach(() => {
  // @ts-expect-error override for tests
  global.fetch = vi.fn(async (url: string) => {
    if (url.includes("/posts/schedule")) {
      return new Response(JSON.stringify({ job_id: "job_123" }), {
        status: 200,
      });
    }
    if (url.includes("/job_status/")) {
      return new Response(
        JSON.stringify({ status: "complete", payload: { failures: {} } }),
        { status: 200 },
      );
    }
    if (url.includes("/accounts")) {
      return new Response(JSON.stringify({ accounts: [] }), { status: 200 });
    }
    if (url.includes("/workspaces")) {
      return new Response(JSON.stringify([{ id: "ws_1" }]), { status: 200 });
    }
    return new Response("not found", { status: 404 });
  }) as typeof fetch;
  process.env.PUBLER_API_KEY = "TEST";
  process.env.PUBLER_WORKSPACE_ID = "ws_1";
});

afterEach(() => {
  // @ts-expect-error restore after test
  global.fetch = originalFetch;
});

test("schedulePost returns job id", async () => {
  const job = await schedulePost({ text: "Hello", accountIds: ["acc_1"] });
  expect(job.job_id).toBe("job_123");
});

test("getJobStatus returns status", async () => {
  const status = await getJobStatus("job_123");
  expect(status.status).toBe("complete");
});
