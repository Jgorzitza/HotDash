/**
 * Engagement Analyzer Integration Tests
 *
 * @see app/services/content/engagement-analyzer.ts
 */

import { describe, it, expect } from "vitest";
import {
  analyzePostPerformance,
  analyzeContentStrategy,
} from "~/services/content/engagement-analyzer";

describe("Engagement Analyzer Integration", () => {
  it("analyzes single post performance", async () => {
    const analysis = await analyzePostPerformance("test-post-001", "instagram");

    expect(analysis).toBeDefined();
    expect(analysis.post_id).toBe("test-post-001");
    expect(analysis.platform).toBe("instagram");
    expect(analysis.analysis.tier).toMatch(
      /exceptional|above_target|at_target|below_target/,
    );
    expect(analysis.analysis.key_insights.length).toBeGreaterThan(0);
    expect(analysis.analysis.recommendations.length).toBeGreaterThan(0);
  });

  it("provides engagement vs target comparison", async () => {
    const analysis = await analyzePostPerformance("test-post-001", "instagram");

    expect(analysis.analysis.engagement_analysis.actual).toBeGreaterThan(0);
    expect(analysis.analysis.engagement_analysis.target).toBe(4.0); // Instagram target
    expect(analysis.analysis.engagement_analysis.vs_target).toBeTruthy();
  });

  it("analyzes content strategy over period", async () => {
    const insights = await analyzeContentStrategy(
      "2025-10-01T00:00:00Z",
      "2025-10-15T00:00:00Z",
    );

    expect(insights).toBeDefined();
    expect(insights.overall_performance.totalPosts).toBeGreaterThan(0);
    expect(insights.top_performers.posts.length).toBeGreaterThan(0);
    expect(insights.recommendations.length).toBeGreaterThan(0);
  });
});
