/**
 * Publer Adapter Tests
 */

import { describe, it, expect } from "vitest";
import {
  createPublerAdapter,
  MOCK_CAMPAIGN_DATA,
} from "~/lib/ads/publer-adapter.stub";

describe("Publer Adapter", () => {
  const adapter = createPublerAdapter();

  it("initializes in stub mode by default", () => {
    expect(adapter.isStubMode).toBe(true);
    expect(adapter.config.apiKey).toBe("STUB_API_KEY");
  });

  it("schedules campaign post in stub mode", async () => {
    const response = await adapter.scheduleCampaignPost({
      bulk: {
        state: "scheduled",
        posts: [
          {
            networks: { facebook: { type: "status", text: "Test post" } },
            accounts: [
              { id: "test-account", scheduled_at: "2025-06-15T10:00:00Z" },
            ],
          },
        ],
      },
    });

    expect(response.job_id).toContain("mock-job-");
  });

  it("publishes post immediately in stub mode", async () => {
    const response = await adapter.publishCampaignPostNow({
      bulk: {
        state: "scheduled",
        posts: [
          {
            networks: { facebook: { type: "status", text: "Test post" } },
            accounts: [{ id: "test-account" }],
          },
        ],
      },
    });

    expect(response.job_id).toContain("mock-publish-");
  });

  it("gets job status in stub mode", async () => {
    const status = await adapter.getJobStatus("mock-job-123");

    expect(status.status).toBe("completed");
    expect(status.post_ids).toBeDefined();
  });

  it("exports campaign plan correctly", () => {
    const { plan, publlerPayload } =
      adapter.exportCampaignPlan(MOCK_CAMPAIGN_DATA);

    expect(plan.campaignName).toBe("Summer Sale 2025");
    expect(publlerPayload.bulk.state).toBe("scheduled");
    expect(publlerPayload.bulk.posts).toHaveLength(1);
  });

  it("health check returns stub mode status", async () => {
    const health = await adapter.healthCheck();

    expect(health.status).toBe("ok");
    expect(health.mode).toBe("stub");
    expect(health.message).toContain("stub mode");
  });
});

describe("Publer Contract Tests", () => {
  it("schedule response matches expected shape", async () => {
    const adapter = createPublerAdapter();
    const response = await adapter.scheduleCampaignPost({
      bulk: {
        state: "scheduled",
        posts: [
          {
            networks: { facebook: { type: "status", text: "Test" } },
            accounts: [{ id: "test", scheduled_at: "2025-06-15T10:00:00Z" }],
          },
        ],
      },
    });

    expect(response).toHaveProperty("job_id");
    expect(typeof response.job_id).toBe("string");
  });

  it("publish response matches expected shape", async () => {
    const adapter = createPublerAdapter();
    const response = await adapter.publishCampaignPostNow({
      bulk: {
        state: "scheduled",
        posts: [
          {
            networks: { facebook: { type: "status", text: "Test" } },
            accounts: [{ id: "test" }],
          },
        ],
      },
    });

    expect(response).toHaveProperty("job_id");
    expect(typeof response.job_id).toBe("string");
  });

  it("job status response matches expected shape", async () => {
    const adapter = createPublerAdapter();
    const status = await adapter.getJobStatus("test-job-id");

    expect(status).toHaveProperty("id");
    expect(status).toHaveProperty("status");
    expect(["pending", "processing", "completed", "failed"]).toContain(
      status.status,
    );
  });

  it("export campaign plan produces valid Publer payload", () => {
    const adapter = createPublerAdapter();
    const { publlerPayload } = adapter.exportCampaignPlan(MOCK_CAMPAIGN_DATA);

    expect(publlerPayload).toHaveProperty("bulk");
    expect(publlerPayload.bulk).toHaveProperty("state");
    expect(publlerPayload.bulk).toHaveProperty("posts");
    expect(Array.isArray(publlerPayload.bulk.posts)).toBe(true);
    expect(publlerPayload.bulk.posts[0]).toHaveProperty("networks");
    expect(publlerPayload.bulk.posts[0]).toHaveProperty("accounts");
  });
});
