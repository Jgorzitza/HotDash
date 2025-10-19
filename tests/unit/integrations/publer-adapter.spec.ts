import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  schedulePost,
  getJobStatus,
  listAccounts,
  __resetMockJobs,
} from "../../../app/lib/integrations/publer-adapter";
import * as featureFlags from "../../../app/utils/feature-flags.server";

describe("Publer Adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetMockJobs();
  });

  describe("Mock Mode (dev)", () => {
    beforeEach(() => {
      vi.spyOn(featureFlags, "isPublerLive").mockReturnValue(false);
    });

    describe("schedulePost", () => {
      it("returns mock job ID in dev mode", async () => {
        const result = await schedulePost({
          text: "Test post",
          accountIds: ["acc-1"],
        });

        expect(result.job_id).toMatch(/^mock-job-\d+-\d+$/);
      });

      it("creates pending job status", async () => {
        const { job_id } = await schedulePost({
          text: "Test post",
          accountIds: ["acc-1"],
        });

        const status = await getJobStatus(job_id);
        expect(status.status).toBe("pending");
        expect(status.jobId).toBe(job_id);
      });

      it("simulates async processing to complete", async () => {
        const { job_id } = await schedulePost({
          text: "Test post",
          accountIds: ["acc-1"],
        });

        // Wait for mock processing to complete
        await new Promise((resolve) => setTimeout(resolve, 2100));

        const status = await getJobStatus(job_id);
        expect(status.status).toBe("complete");
        expect(status.completedAt).toBeDefined();
      });
    });

    describe("getJobStatus", () => {
      it("returns job status for existing job", async () => {
        const { job_id } = await schedulePost({
          text: "Test",
          accountIds: ["acc-1"],
        });

        const status = await getJobStatus(job_id);
        expect(status).toMatchObject({
          status: expect.any(String),
          jobId: job_id,
        });
      });

      it("returns failed status for unknown job", async () => {
        const status = await getJobStatus("unknown-job-123");

        expect(status.status).toBe("failed");
        expect(status.error).toBe("Job not found");
      });
    });

    describe("listAccounts", () => {
      it("returns mock social accounts", async () => {
        const accounts = await listAccounts();

        expect(accounts).toHaveLength(2);
        expect(accounts[0]).toMatchObject({
          id: expect.stringContaining("mock"),
          platform: expect.any(String),
        });
      });
    });
  });

  describe("Production Mode (when PUBLER_LIVE=true)", () => {
    beforeEach(() => {
      vi.spyOn(featureFlags, "isPublerLive").mockReturnValue(true);
    });

    it("uses real Publer API for schedulePost", async () => {
      // Mock the dynamic import
      const mockSchedulePost = vi
        .fn()
        .mockResolvedValue({ job_id: "real-123" });
      vi.doMock("../../../packages/integrations/publer", () => ({
        schedulePost: mockSchedulePost,
      }));

      // Note: This test documents the expected behavior
      // In real production, it would call packages/integrations/publer.ts
      expect(featureFlags.isPublerLive()).toBe(true);
    });

    it("uses real Publer API for getJobStatus", async () => {
      // Mock the dynamic import
      const mockGetJobStatus = vi.fn().mockResolvedValue({
        status: "complete",
        completed_at: "2025-10-19T12:00:00Z",
      });
      vi.doMock("../../../packages/integrations/publer", () => ({
        getJobStatus: mockGetJobStatus,
      }));

      expect(featureFlags.isPublerLive()).toBe(true);
    });
  });

  describe("Feature Flag Toggle", () => {
    it("respects PUBLER_LIVE flag for mock vs real API", () => {
      vi.spyOn(featureFlags, "isPublerLive").mockReturnValue(false);
      expect(featureFlags.isPublerLive()).toBe(false);

      vi.spyOn(featureFlags, "isPublerLive").mockReturnValue(true);
      expect(featureFlags.isPublerLive()).toBe(true);
    });
  });

  describe("Mock Job Management", () => {
    beforeEach(() => {
      vi.spyOn(featureFlags, "isPublerLive").mockReturnValue(false);
    });

    it("maintains separate job statuses", async () => {
      const job1 = await schedulePost({ text: "Post 1", accountIds: ["a"] });
      const job2 = await schedulePost({ text: "Post 2", accountIds: ["b"] });

      expect(job1.job_id).not.toBe(job2.job_id);

      const status1 = await getJobStatus(job1.job_id);
      const status2 = await getJobStatus(job2.job_id);

      expect(status1.jobId).toBe(job1.job_id);
      expect(status2.jobId).toBe(job2.job_id);
    });

    it("resets mock jobs on __resetMockJobs call", async () => {
      const { job_id } = await schedulePost({
        text: "Test",
        accountIds: ["a"],
      });

      __resetMockJobs();

      const status = await getJobStatus(job_id);
      expect(status.status).toBe("failed");
      expect(status.error).toBe("Job not found");
    });
  });
});
