import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loader } from "../../app/routes/api.analytics.idea-pool";

const OLD_ENV = process.env;

describe("Idea Pool API route", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
    delete process.env.FEATURE_IDEA_POOL_LIVE;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("returns 501 when feature flag is disabled (default)", async () => {
    const response = await loader({
      request: new Request("https://example.com/api/analytics/idea-pool"),
      params: {},
      context: {},
    } as any);

    expect(response.status).toBe(501);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it("returns mocked payload when feature flag enabled", async () => {
    process.env.FEATURE_IDEA_POOL_LIVE = "1";

    const response = await loader({
      request: new Request("https://example.com/api/analytics/idea-pool"),
      params: {},
      context: {},
    } as any);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.ideas)).toBe(true);
  });
});

