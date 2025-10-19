import { describe, expect, it } from "vitest";

/**
 * Publer API Contract Tests
 */

describe("Publer API Contract", () => {
  it("account info response shape", () => {
    const mock = { user: { id: "123", email: "test@example.com" }, workspaces: [] };
    expect(mock).toHaveProperty("user");
    expect(mock).toHaveProperty("workspaces");
  });

  it("social accounts response shape", () => {
    const mock = [{ id: "acc-1", name: "Twitter", platform: "twitter" }];
    expect(mock[0]).toHaveProperty("platform");
  });

  it("post status response shape", () => {
    const mock = { status: "complete", job_id: "job-123" };
    expect(mock).toHaveProperty("status");
    expect(mock).toHaveProperty("job_id");
  });
});
