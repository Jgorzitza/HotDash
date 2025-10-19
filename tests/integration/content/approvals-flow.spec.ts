/**
 * Content Approvals Flow Integration Tests
 */

import { describe, it, expect } from "vitest";
import {
  createContentApproval,
  recordApproval,
} from "~/services/content/approvals-integration";

describe("Content Approvals Flow", () => {
  it("creates approval from draft", () => {
    const mockDraft: any = {
      id: "draft-001",
      fixture_id: "launch-001",
      platform: "instagram",
      type: "launch",
      content: { text: "Test post", hashtags: ["#test"] },
      target_metrics: { engagement_rate: 4.5, click_through_rate: 1.3 },
      tone_check: { brand_voice: "pass", cta_present: true, length_ok: true },
      evidence: {},
      provenance: {
        mode: "dev:test",
        created_at: new Date().toISOString(),
        created_by: "content-agent",
        feedback_ref: "",
      },
      approval_status: "draft",
    };

    const approval = createContentApproval(mockDraft);

    expect(approval.id).toBeTruthy();
    expect(approval.kind).toBe("content");
    expect(approval.state).toBe("pending_review");
  });

  it("records CEO approval with grades", () => {
    const mockApproval: any = {
      id: "approval-001",
      kind: "content",
      state: "pending_review",
      post_draft: { content: { text: "Original text" } },
    };

    const result = recordApproval(
      mockApproval,
      { original_text: "Original text", edited_text: "Edited text" },
      { tone: 5, accuracy: 5, policy: 5 },
      "CEO",
    );

    expect(result.state).toBe("approved");
    expect(result.grades?.tone).toBe(5);
    expect(result.edits).toBeDefined();
  });
});
