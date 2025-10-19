import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_FLAG = process.env.FEATURE_SUPABASE_IDEA_POOL;

afterEach(() => {
  process.env.FEATURE_SUPABASE_IDEA_POOL = ORIGINAL_FLAG;
  vi.resetModules();
});

beforeEach(() => {
  vi.resetModules();
});

describe("api.analytics.idea-pool loader", () => {
  it("returns fixture payload when feature flag disabled", async () => {
    delete process.env.FEATURE_SUPABASE_IDEA_POOL;

    const { loader } = await import("~/routes/api.analytics.idea-pool");

    const response = await loader({
      request: new Request("http://example.com/api/analytics/idea-pool"),
      params: {},
      context: {},
    } as unknown as Parameters<typeof loader>[0]);

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.source).toBe("fixture");
    expect(payload.data.featureFlagEnabled).toBe(false);
    expect(payload.data.ideas.length).toBeGreaterThan(0);
    expect(payload.data.ideas[0].mocked).toBe(true);
  });

  it("returns Supabase payload when feature flag enabled and data available", async () => {
    process.env.FEATURE_SUPABASE_IDEA_POOL = "1";

    const { loader, __setIdeaPoolSupabaseFetcher } = await import(
      "~/routes/api.analytics.idea-pool"
    );

    __setIdeaPoolSupabaseFetcher(async () => ({
      ideas: [
        {
          id: "idea-supa-1",
          title: "Supabase idea",
          category: "ops",
          status: "active",
          confidence: 0.9,
          impactScore: 8,
          effortScore: 3,
          owner: "integrations",
          channels: ["email"],
          summary: "Supabase backed",
          nextAction: "Ship",
          metrics: {
            target: "ack_time < 1h",
            winRate: 0.5,
          },
          mocked: false,
          createdAt: "2025-10-18T00:00:00.000Z",
          updatedAt: "2025-10-18T00:00:00.000Z",
        },
      ],
    }));

    const response = await loader({
      request: new Request("http://example.com/api/analytics/idea-pool"),
      params: {},
      context: {},
    } as unknown as Parameters<typeof loader>[0]);

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.source).toBe("supabase");
    expect(payload.data.featureFlagEnabled).toBe(true);
    expect(payload.data.ideas).toHaveLength(1);
    expect(payload.data.ideas[0].mocked).toBe(false);

    __setIdeaPoolSupabaseFetcher(null);
  });

  it("falls back to fixture when Supabase fetch reports error", async () => {
    process.env.FEATURE_SUPABASE_IDEA_POOL = "true";

    const { loader, __setIdeaPoolSupabaseFetcher } = await import(
      "~/routes/api.analytics.idea-pool"
    );

    __setIdeaPoolSupabaseFetcher(async () => ({
      ideas: [],
      error: { message: "Supabase offline" },
    }));

    const response = await loader({
      request: new Request("http://example.com/api/analytics/idea-pool"),
      params: {},
      context: {},
    } as unknown as Parameters<typeof loader>[0]);

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.source).toBe("fixture");
    expect(payload.data.fallbackReason).toContain("Supabase offline");
    expect(payload.data.featureFlagEnabled).toBe(true);
    expect(payload.data.ideas.length).toBeGreaterThan(0);

    __setIdeaPoolSupabaseFetcher(null);
  });
});
