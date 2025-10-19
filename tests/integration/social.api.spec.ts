import { describe, expect, it, vi, beforeEach } from "vitest";
import { action as postAction } from "../../app/routes/api/social.post";
import { loader as statusLoader } from "../../app/routes/api/social.status.$postId";

const mockSchedulePost = vi.fn();
const mockGetJobStatus = vi.fn();
const mockAuthenticate = vi.fn(async () => ({ session: { shop: "test" } }));

vi.mock("../../packages/integrations/publer.ts", () => ({
  schedulePost: (...args: unknown[]) => mockSchedulePost(...args),
  getJobStatus: (...args: unknown[]) => mockGetJobStatus(...args),
}));

vi.mock("../../app/shopify.server", () => ({
  authenticate: {
    admin: (...args: unknown[]) => mockAuthenticate(...args),
  },
}));

describe("Social posting routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/social/post", () => {
    it("requires Shopify authentication", async () => {
      const request = new Request("https://example.com/api/social/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: "hi", accountIds: ["acc"] }),
      });

      mockSchedulePost.mockResolvedValue({ job_id: "job_123" });

      const response = await postAction({ request, params: {}, context: {} });
      expect(mockAuthenticate).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
      expect(body.jobId).toBe("job_123");
    });

    it("rejects non-POST methods", async () => {
      const request = new Request("https://example.com/api/social/post", {
        method: "GET",
      });
      const response = await postAction({ request, params: {}, context: {} });
      expect(response.status).toBe(405);
    });

    it("validates payload structure", async () => {
      const request = new Request("https://example.com/api/social/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const response = await postAction({ request, params: {}, context: {} });
      expect(response.status).toBe(400);
    });

    it("handles scheduler failures", async () => {
      const request = new Request("https://example.com/api/social/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: "hi", accountIds: ["acc"] }),
      });
      mockSchedulePost.mockRejectedValue(new Error("failure"));
      const response = await postAction({ request, params: {}, context: {} });
      expect(response.status).toBe(502);
      const body = await response.json();
      expect(body.ok).toBe(false);
    });
  });

  describe("GET /api/social/status/:postId", () => {
    it("requires authentication and returns status", async () => {
      mockGetJobStatus.mockResolvedValue({ status: "complete" });
      const response = await statusLoader({
        request: new Request("https://example.com/api/social/status/post-1"),
        params: { postId: "post-1" },
        context: {},
      });

      expect(mockAuthenticate).toHaveBeenCalled();
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
      expect(body.status.status).toBe("complete");
    });

    it("validates postId param", async () => {
      const response = await statusLoader({
        request: new Request("https://example.com/api/social/status/"),
        params: {},
        context: {},
      });
      expect(response.status).toBe(400);
    });

    it("handles Publer status failures", async () => {
      mockGetJobStatus.mockRejectedValue(new Error("fail"));
      const response = await statusLoader({
        request: new Request("https://example.com/api/social/status/post-1"),
        params: { postId: "post-1" },
        context: {},
      });
      expect(response.status).toBe(502);
    });
  });
});
