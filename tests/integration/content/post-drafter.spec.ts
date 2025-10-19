/**
 * Post Drafter Integration Tests
 *
 * @see app/services/content/post-drafter.ts
 */

import { describe, it, expect } from "vitest";
import {
  generatePostFromFixture,
  batchGeneratePostsFromFixture,
} from "~/services/content/post-drafter";

describe("Post Drafter Integration", () => {
  it("generates post from launch fixture", async () => {
    const draft = await generatePostFromFixture("launch-001", "instagram");

    expect(draft).toBeDefined();
    expect(draft.fixture_id).toBe("launch-001");
    expect(draft.platform).toBe("instagram");
    expect(draft.type).toBe("launch");
    expect(draft.content.text).toBeTruthy();
    expect(draft.target_metrics.engagement_rate).toBeGreaterThan(0);
  });

  it("generates platform-specific copy", async () => {
    const igDraft = await generatePostFromFixture("launch-001", "instagram");
    const fbDraft = await generatePostFromFixture("launch-001", "facebook");

    expect(igDraft.content.text).not.toBe(fbDraft.content.text);
  });

  it("includes tone check results", async () => {
    const draft = await generatePostFromFixture("launch-001", "instagram");

    expect(draft.tone_check).toBeDefined();
    expect(draft.tone_check.brand_voice).toMatch(/pass|review/);
    expect(draft.tone_check.cta_present).toBe(true);
  });

  it("batch generates for multiple platforms", async () => {
    const drafts = await batchGeneratePostsFromFixture("launch-001");

    expect(drafts.length).toBeGreaterThanOrEqual(1);
    expect(drafts.map((d) => d.platform)).toContain("instagram");
  });
});
