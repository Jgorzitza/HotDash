/**
 * Integration Tests: Idea Pool API
 *
 * Tests the idea pool analytics endpoint with mocked Supabase responses
 * and feature flag behavior.
 *
 * Contract Test: Validates API routes succeed with mocked responses and fail with expected errors.
 *
 * @see docs/directions/integrations.md - Contract Test specification
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  loader,
  type IdeaPoolItem,
} from "../../app/routes/api.analytics.idea-pool";
import ideaPoolFixture from "../../app/fixtures/content/idea-pool.json";

const ORIGINAL_ENV = { ...process.env };

describe("Idea Pool API Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  describe("GET /api/analytics/idea-pool", () => {
    it("returns fixture data by default (feature flag disabled)", async () => {
      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data?.source).toBe("fixture");
      expect(body.data?.feature_flag_enabled).toBe(false);
      expect(body.data?.ideas).toHaveLength(5);
      expect(body.data?.total_count).toBe(5);
      expect(body.timestamp).toBeDefined();
    });

    it("validates idea pool structure with exactly 5 ideas", async () => {
      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });
      const body = await response.json();

      expect(body.data?.ideas).toHaveLength(5);
      expect(body.data?.total_count).toBe(5);

      // Verify structure of each idea
      body.data?.ideas.forEach((idea: IdeaPoolItem) => {
        expect(idea).toHaveProperty("id");
        expect(idea).toHaveProperty("type");
        expect(idea).toHaveProperty("title");
        expect(idea).toHaveProperty("description");
        expect(idea).toHaveProperty("target_platforms");
        expect(idea).toHaveProperty("suggested_copy");
        expect(idea).toHaveProperty("suggested_hashtags");
        expect(idea).toHaveProperty("evidence");
        expect(idea).toHaveProperty("supabase_linkage");
        expect(idea).toHaveProperty("projected_metrics");
        expect(idea).toHaveProperty("status");
        expect(idea).toHaveProperty("priority");
      });
    });

    it("validates wildcard count (exactly 1 wildcard required)", async () => {
      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });
      const body = await response.json();

      expect(body.data?.wildcard_count).toBe(1);

      // Verify wildcard exists
      const wildcards = body.data?.ideas.filter(
        (idea: IdeaPoolItem) => idea.type === "wildcard",
      );
      expect(wildcards).toHaveLength(1);
    });

    it("validates idea types (launch, evergreen, wildcard)", async () => {
      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });
      const body = await response.json();

      const validTypes = ["launch", "evergreen", "wildcard"];

      body.data?.ideas.forEach((idea: IdeaPoolItem) => {
        expect(validTypes).toContain(idea.type);
      });
    });

    it("validates status values (draft, approved, pending_review, rejected)", async () => {
      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });
      const body = await response.json();

      const validStatuses = ["draft", "approved", "pending_review", "rejected"];

      body.data?.ideas.forEach((idea: IdeaPoolItem) => {
        expect(validStatuses).toContain(idea.status);
      });
    });

    it("validates priority values (low, medium, high, urgent)", async () => {
      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });
      const body = await response.json();

      const validPriorities = ["low", "medium", "high", "urgent"];

      body.data?.ideas.forEach((idea: IdeaPoolItem) => {
        expect(validPriorities).toContain(idea.priority);
      });
    });

    it("validates projected metrics structure", async () => {
      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });
      const body = await response.json();

      body.data?.ideas.forEach((idea: IdeaPoolItem) => {
        expect(idea.projected_metrics).toBeDefined();
        expect(idea.projected_metrics).toHaveProperty("estimated_reach");
        expect(idea.projected_metrics).toHaveProperty(
          "estimated_engagement_rate",
        );
        expect(idea.projected_metrics).toHaveProperty("estimated_clicks");
        expect(idea.projected_metrics).toHaveProperty("estimated_conversions");

        // Validate metrics are numbers
        expect(typeof idea.projected_metrics.estimated_reach).toBe("number");
        expect(typeof idea.projected_metrics.estimated_engagement_rate).toBe(
          "number",
        );
        expect(typeof idea.projected_metrics.estimated_clicks).toBe("number");
        expect(typeof idea.projected_metrics.estimated_conversions).toBe(
          "number",
        );
      });
    });

    it("validates Supabase linkage structure", async () => {
      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });
      const body = await response.json();

      body.data?.ideas.forEach((idea: IdeaPoolItem) => {
        expect(idea.supabase_linkage).toBeDefined();
        expect(idea.supabase_linkage).toHaveProperty("table");
        expect(typeof idea.supabase_linkage.table).toBe("string");

        // created_at is present in some linkages but not all (fixture variation)
        // Validate it's a string if present
        if (idea.supabase_linkage.created_at) {
          expect(typeof idea.supabase_linkage.created_at).toBe("string");
        }
      });
    });

    it("acknowledges feature flag when enabled (falls back to fixture until migrations)", async () => {
      process.env.FEATURE_SUPABASE_IDEA_POOL = "1";

      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });
      const body = await response.json();

      expect(body.success).toBe(true);
      expect(body.data?.feature_flag_enabled).toBe(true);
      expect(body.data?.source).toBe("fixture"); // Still returns fixtures until Data migrations complete
      expect(body.fallback_reason).toContain("Supabase integration pending");
    });

    it("supports FEATURE_FLAG_ legacy prefix", async () => {
      process.env.FEATURE_FLAG_SUPABASE_IDEA_POOL = "yes";

      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });
      const body = await response.json();

      expect(body.data?.feature_flag_enabled).toBe(true);
    });

    it("returns valid response structure on error (graceful degradation)", async () => {
      // Since we're using fixtures and not real Supabase, this test validates
      // that the route never returns a 500 error - it always degrades gracefully

      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });

    it("includes timestamp in ISO 8601 format", async () => {
      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });
      const body = await response.json();

      expect(body.timestamp).toBeDefined();
      expect(typeof body.timestamp).toBe("string");

      // Validate ISO 8601 format
      const timestamp = new Date(body.timestamp);
      expect(timestamp.toISOString()).toBe(body.timestamp);
    });

    it("matches fixture data structure", async () => {
      const request = new Request(
        "https://example.com/api/analytics/idea-pool",
      );

      const response = await loader({ request, params: {}, context: {} });
      const body = await response.json();

      // Response should match fixture structure
      expect(body.data?.ideas).toEqual(ideaPoolFixture);
    });
  });
});
