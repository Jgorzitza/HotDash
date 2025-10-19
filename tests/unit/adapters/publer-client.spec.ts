/**
 * Publer Mock Client Tests
 */

import { describe, it, expect } from "vitest";
import {
  getPublerClient,
  PUBLER_LIVE_POSTING_ENABLED,
} from "~/adapters/publer/client.mock";

describe("Publer Mock Client", () => {
  it("returns mock client", () => {
    expect(PUBLER_LIVE_POSTING_ENABLED).toBe(false);
    const client = getPublerClient();
    expect(client).toBeDefined();
  });

  it("schedules post", async () => {
    const client = getPublerClient();
    const response = await client.schedulePost({
      bulk: {
        state: "scheduled",
        posts: [
          {
            networks: { instagram: { type: "status", text: "Test" } },
            accounts: [{ id: "test", scheduled_at: "2025-10-25T14:00:00Z" }],
          },
        ],
      },
    });

    expect(response.success).toBe(true);
    expect(response.data.job_id).toBeTruthy();
  });
});
