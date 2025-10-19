/**
 * Content Approvals Integration
 *
 * Wires content posts into the HITL approvals drawer.
 * All social media posts must be approved before scheduling/publishing.
 *
 * @see app/components/approvals/ApprovalsDrawer.tsx
 * @see app/services/content/post-drafter.ts
 * @see docs/specs/approvals_drawer_spec.md
 */

import type { PostDraft } from "./post-drafter";

/**
 * Content Approval Entry
 *
 * Extends base Approval interface with content-specific fields.
 */
export interface ContentApproval {
  id: string;
  kind: "content"; // NEW: Add to ApprovalsDrawer.Approval.kind union
  state:
    | "draft"
    | "pending_review"
    | "approved"
    | "declined"
    | "applied"
    | "audited";
  summary: string; // e.g., "Instagram post: New Shift Knobs Launch"
  created_by: "content-agent";
  reviewer?: string; // CEO username

  // Content-specific data
  post_draft: PostDraft;

  // Evidence section
  evidence: {
    what_changes: string; // "Publish social media post to Instagram"
    why_now: string; // "Product launch scheduled for Oct 25"
    impact_forecast: string; // "Expected 4.8% ER, 1.5% CTR, ~$4,750 revenue"

    // Post preview
    samples: Array<{
      label: string; // "Post Copy"
      content: string; // Actual post text
    }>;

    // Market data
    queries: Array<{
      label: string; // "Market Demand"
      query: string; // "GA4 search trends"
      result: string; // "37% increase over 90 days"
    }>;

    // Media preview
    screenshots?: Array<{
      label: string; // "Product Image"
      url: string;
    }>;
  };

  // Projected impact
  projected_impact: {
    engagement_rate: number;
    click_through_rate: number;
    estimated_reach: number;
    estimated_conversions: number;
    estimated_revenue: number;
  };

  // Risk assessment
  risks: {
    risk_level: "low" | "medium" | "high";
    affected_entities: string[]; // ["Instagram @hotrodan", "Product: Shift Knobs"]
    mitigation: string; // "Post can be deleted within 15 min if needed"
  };

  // Rollback plan
  rollback: {
    plan: string; // "Delete post via Publer API, issue correction post if necessary"
    complexity: "trivial" | "moderate" | "complex";
    owner: string;
  };

  // Tone validation
  tone_check: {
    brand_voice: "pass" | "review";
    cta_present: boolean;
    length_ok: boolean;
    flags: string[]; // Any warnings/notes
  };

  // Grading (post-approval)
  grades?: {
    tone: 1 | 2 | 3 | 4 | 5; // How well it matches brand voice
    accuracy: 1 | 2 | 3 | 4 | 5; // Claims/specs correct
    policy: 1 | 2 | 3 | 4 | 5; // Follows guidelines
    notes?: string;
  };

  // Edits made by CEO
  edits?: {
    original_text: string;
    edited_text: string;
    edit_distance: number; // Levenshtein distance
    timestamp: string;
  };

  // Apply result (after publishing)
  apply_result?: {
    publer_job_id: string;
    publer_post_id?: string;
    published_at?: string;
    status: "scheduled" | "published" | "failed";
    error?: string;
  };

  created_at: string; // ISO 8601
  reviewed_at?: string; // ISO 8601
  applied_at?: string; // ISO 8601
}

/**
 * Create Content Approval from Post Draft
 *
 * Prepares draft for HITL review in approvals drawer.
 *
 * @param draft - Post draft from post-drafter
 * @returns Content approval entry
 */
export function createContentApproval(draft: PostDraft): ContentApproval {
  const platformName =
    draft.platform.charAt(0).toUpperCase() + draft.platform.slice(1);

  return {
    id: `approval-${draft.id}`,
    kind: "content",
    state: "pending_review",
    summary: `${platformName} post: ${draft.fixture_id} (${draft.type})`,
    created_by: "content-agent",

    post_draft: draft,

    evidence: {
      what_changes: `Publish social media post to ${platformName} (@hotrodan account)`,
      why_now: draft.evidence.market_data || "Evergreen content strategy",
      impact_forecast: formatImpactForecast(draft),

      samples: [
        {
          label: "Post Copy",
          content: formatPostPreview(draft),
        },
      ],

      queries: draft.evidence.market_data
        ? [
            {
              label: "Market Evidence",
              query: "Market analysis",
              result: draft.evidence.market_data,
            },
          ]
        : [],

      screenshots: draft.content.media_ids?.map((id, i) => ({
        label: `Media ${i + 1}`,
        url: `https://cdn.publer.com/placeholder/${id}`, // Placeholder
      })),
    },

    projected_impact: {
      engagement_rate: draft.target_metrics.engagement_rate,
      click_through_rate: draft.target_metrics.click_through_rate,
      estimated_reach: estimateReach(draft.platform),
      estimated_conversions: estimateConversions(draft.platform),
      estimated_revenue: estimateRevenue(draft.platform),
    },

    risks: {
      risk_level: "low", // Social posts are low-risk (can delete if needed)
      affected_entities: [
        `${platformName} @hotrodan`,
        `Fixture: ${draft.fixture_id}`,
      ],
      mitigation:
        "Post can be deleted within 15 minutes if issues arise. No customer data involved.",
    },

    rollback: {
      plan: "Delete post via Publer API. If already widely distributed, issue correction post.",
      complexity: "trivial",
      owner: "content-agent",
    },

    tone_check: draft.tone_check,

    created_at: new Date().toISOString(),
  };
}

/**
 * Format Impact Forecast String
 */
function formatImpactForecast(draft: PostDraft): string {
  const { engagement_rate, click_through_rate, conversion_rate } =
    draft.target_metrics;
  const estRevenue = estimateRevenue(draft.platform);

  return (
    `Expected ${engagement_rate}% engagement rate, ` +
    `${click_through_rate}% CTR` +
    (conversion_rate ? `, ${conversion_rate}% conversion rate` : "") +
    `. Estimated revenue: $${estRevenue.toLocaleString()}`
  );
}

/**
 * Format Post Preview for Evidence
 */
function formatPostPreview(draft: PostDraft): string {
  const { text, hashtags, link } = draft.content;

  let preview = text;

  if (hashtags && hashtags.length > 0) {
    preview += `\n\n${hashtags.join(" ")}`;
  }

  if (link) {
    preview += `\n\n🔗 ${link}`;
  }

  return preview;
}

/**
 * Estimate Reach Based on Platform
 */
function estimateReach(platform: string): number {
  // Simplified - would use historical data in production
  const baseReach: Record<string, number> = {
    instagram: 3000,
    facebook: 2000,
    tiktok: 5000,
  };

  return baseReach[platform] || 2500;
}

/**
 * Estimate Conversions
 */
function estimateConversions(platform: string): number {
  const reach = estimateReach(platform);
  const ctr = 0.012; // 1.2% avg CTR
  const cvr = 0.02; // 2% conversion rate

  return Math.floor(reach * ctr * cvr);
}

/**
 * Estimate Revenue
 */
function estimateRevenue(platform: string): number {
  const conversions = estimateConversions(platform);
  const aov = 95; // Average order value for Hot Rod AN

  return conversions * aov;
}

/**
 * Record CEO Approval
 *
 * Updates approval with CEO edits and grades.
 *
 * @param approval - Content approval
 * @param edits - CEO's edits to post copy (if any)
 * @param grades - CEO's quality grades
 * @param reviewer - CEO username
 * @returns Updated approval
 */
export function recordApproval(
  approval: ContentApproval,
  edits: { original_text: string; edited_text: string } | null,
  grades: {
    tone: 1 | 2 | 3 | 4 | 5;
    accuracy: 1 | 2 | 3 | 4 | 5;
    policy: 1 | 2 | 3 | 4 | 5;
    notes?: string;
  },
  reviewer: string,
): ContentApproval {
  const updated: ContentApproval = {
    ...approval,
    state: "approved",
    reviewer,
    reviewed_at: new Date().toISOString(),
    grades,
  };

  if (edits && edits.original_text !== edits.edited_text) {
    // Calculate edit distance (simplified)
    const editDistance = Math.abs(
      edits.edited_text.length - edits.original_text.length,
    );

    updated.edits = {
      original_text: edits.original_text,
      edited_text: edits.edited_text,
      edit_distance: editDistance,
      timestamp: new Date().toISOString(),
    };

    // Update post draft with edited text
    updated.post_draft.content.text = edits.edited_text;
  }

  return updated;
}

/**
 * Record Application (Post Published)
 *
 * Updates approval after post is scheduled/published via Publer.
 *
 * @param approval - Content approval
 * @param publishResult - Result from Publer API
 * @returns Updated approval
 */
export function recordApplication(
  approval: ContentApproval,
  publishResult: {
    publer_job_id: string;
    publer_post_id?: string;
    published_at?: string;
    status: "scheduled" | "published" | "failed";
    error?: string;
  },
): ContentApproval {
  return {
    ...approval,
    state: publishResult.status === "failed" ? "pending_review" : "applied",
    applied_at: new Date().toISOString(),
    apply_result: publishResult,
  };
}

/**
 * PLACEHOLDER: Submit Approval to Supabase
 *
 * In production, stores approval in database.
 *
 * @param approval - Content approval
 * @returns Approval ID
 */
export async function submitApproval(
  approval: ContentApproval,
): Promise<string> {
  // TODO: INSERT INTO content_approvals

  console.log("[PLACEHOLDER] submitApproval:", {
    id: approval.id,
    kind: approval.kind,
    state: approval.state,
    platform: approval.post_draft.platform,
  });

  return approval.id;
}

/**
 * PLACEHOLDER: Get Pending Approvals
 *
 * Fetches all content approvals awaiting CEO review.
 *
 * @returns Array of pending content approvals
 */
export async function getPendingApprovals(): Promise<ContentApproval[]> {
  // TODO: SELECT FROM content_approvals WHERE state='pending_review'

  console.log("[PLACEHOLDER] getPendingApprovals");

  return []; // Mock empty queue
}
