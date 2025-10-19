/**
 * Post Drafter Service
 *
 * Generates HITL-ready social media posts from idea pool fixtures.
 * All posts must go through CEO approval before publishing.
 *
 * @see app/fixtures/content/idea-pool.json
 * @see docs/specs/content_pipeline.md
 * @see docs/design/content-coordination.md
 */

import type { SocialPlatform } from "~/adapters/publer/types";

/**
 * Social Post Draft (HITL-ready)
 */
export interface PostDraft {
  id: string;
  fixture_id: string; // Reference to idea pool entry
  platform: SocialPlatform;
  type: "launch" | "evergreen" | "wildcard";
  content: {
    text: string;
    hashtags: string[];
    mentions?: string[];
    media_ids?: string[];
    link?: string;
  };
  target_metrics: {
    engagement_rate: number; // Expected ER based on platform/type
    click_through_rate: number; // Expected CTR
    conversion_rate?: number; // Expected CR if applicable
  };
  scheduled_for?: string; // ISO 8601 (if pre-scheduled)
  tone_check: {
    brand_voice: "pass" | "review"; // Auto-check against guidelines
    cta_present: boolean;
    length_ok: boolean; // Platform-specific limits
  };
  evidence: {
    market_data?: string; // Why this post matters
    past_performance?: string; // Similar posts' results
  };
  provenance: {
    mode: "dev:test" | "production";
    created_at: string; // ISO 8601
    created_by: "content-agent";
    feedback_ref: string;
  };
  approval_status: "draft" | "pending_review" | "approved" | "declined";
}

/**
 * Generate Post from Idea Pool Fixture
 *
 * Takes an idea pool entry and creates platform-specific post drafts.
 *
 * @param fixtureId - ID from idea-pool.json
 * @param platform - Target social platform
 * @returns HITL-ready post draft
 */
export async function generatePostFromFixture(
  fixtureId: string,
  platform: SocialPlatform,
): Promise<PostDraft> {
  // TODO: Load from app/fixtures/content/idea-pool.json
  // For now, use mock fixture structure

  const fixture = await loadFixture(fixtureId);

  if (!fixture) {
    throw new Error(`Fixture not found: ${fixtureId}`);
  }

  // Extract messaging from fixture
  const messaging = fixture.messaging;

  // Generate platform-specific post
  const post = createPlatformPost(platform, messaging, fixture.type);

  // Calculate target metrics based on platform + post type
  const targetMetrics = calculateTargetMetrics(platform, fixture.type);

  // Auto-check tone against guidelines
  const toneCheck = performToneCheck(post.text, messaging);

  return {
    id: `draft-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    fixture_id: fixtureId,
    platform,
    type: fixture.type,
    content: post,
    target_metrics: targetMetrics,
    scheduled_for: fixture.launch_timeline?.listing_live,
    tone_check: toneCheck,
    evidence: {
      market_data:
        fixture.evidence?.market_demand || fixture.evidence?.seo_opportunity,
      past_performance:
        fixture.evidence?.engagement_benchmark ||
        fixture.evidence?.similar_campaigns,
    },
    provenance: {
      mode: "dev:test",
      created_at: new Date().toISOString(),
      created_by: "content-agent",
      feedback_ref: "feedback/content/2025-10-19.md",
    },
    approval_status: "draft",
  };
}

/**
 * Create Platform-Specific Post Copy
 *
 * Adapts messaging for each platform's best practices.
 *
 * @param platform - Target platform
 * @param messaging - Messaging from fixture
 * @param type - Post type (launch/evergreen/wildcard)
 * @returns Platform-optimized post content
 */
function createPlatformPost(
  platform: SocialPlatform,
  messaging: any,
  _type: string,
): {
  text: string;
  hashtags: string[];
  mentions?: string[];
  link?: string;
} {
  const headline =
    messaging.headline || messaging.hook || messaging.content_pillars?.[0];
  const benefits =
    messaging.key_benefits || messaging.incentive_structure || [];
  const cta = messaging.cta || "Learn more";

  switch (platform) {
    case "instagram":
      // Instagram: Hook in first line, emoji-friendly, hashtags in caption
      return {
        text: `${headline} ✨\n\n${benefits.slice(0, 2).join("\n• ")}\n\n${cta} 👉`,
        hashtags: ["#HotRod", "#ClassicCars", "#Restoration", "#CarLife"],
        link: undefined, // Instagram doesn't support clickable links in captions
      };

    case "facebook":
      // Facebook: Conversational, link-friendly, moderate hashtags
      return {
        text: `🚗 ${headline}\n\n${benefits.slice(0, 3).join("\n✓ ")}\n\n${cta}:`,
        hashtags: ["#HotRod", "#ClassicCars"],
        link: "https://hotrodan.com/products/new", // Placeholder
      };

    case "tiktok":
      // TikTok: Short, punchy, hashtag-heavy, trend-aware
      return {
        text: `${headline} 🔥\n\n${cta} 👇`,
        hashtags: [
          "#HotRod",
          "#ClassicCars",
          "#CarTok",
          "#Restoration",
          "#Vintage",
          "#CarCommunity",
        ],
      };

    default:
      return {
        text: `${headline}\n\n${benefits.join("\n• ")}\n\n${cta}`,
        hashtags: [],
      };
  }
}

/**
 * Calculate Target Metrics for Post
 *
 * Based on platform and post type, set realistic targets.
 *
 * @param platform - Social platform
 * @param type - Post type
 * @returns Expected performance metrics
 */
function calculateTargetMetrics(
  platform: SocialPlatform,
  type: string,
): {
  engagement_rate: number;
  click_through_rate: number;
  conversion_rate?: number;
} {
  // Base platform targets (from content_pipeline.md)
  const baseTargets: Record<
    SocialPlatform,
    { engagement_rate: number; click_through_rate: number }
  > = {
    instagram: { engagement_rate: 4.0, click_through_rate: 1.2 },
    facebook: { engagement_rate: 2.0, click_through_rate: 1.2 },
    tiktok: { engagement_rate: 5.0, click_through_rate: 1.2 },
  };

  const base = baseTargets[platform];

  // Adjust based on post type
  const typeMultiplier: Record<string, number> = {
    launch: 1.2, // Launch posts typically get +20% boost
    evergreen: 1.0, // Evergreen performs at baseline
    wildcard: 0.8, // Wildcards are experimental, lower expectations
  };

  const multiplier = typeMultiplier[type] || 1.0;

  return {
    engagement_rate: parseFloat((base.engagement_rate * multiplier).toFixed(2)),
    click_through_rate: parseFloat(
      (base.click_through_rate * multiplier).toFixed(2),
    ),
    conversion_rate: 2.0, // Constant 2% target across all
  };
}

/**
 * Perform Automated Tone Check
 *
 * Validates post against brand voice guidelines.
 *
 * @param text - Post copy
 * @param messaging - Original messaging from fixture
 * @returns Tone check results
 */
function performToneCheck(
  text: string,
  messaging: any,
): {
  brand_voice: "pass" | "review";
  cta_present: boolean;
  length_ok: boolean;
} {
  // Check for CTA presence
  const ctaKeywords = [
    "shop",
    "learn more",
    "check out",
    "discover",
    "pre-order",
    "get yours",
    "click",
    "link in bio",
  ];
  const cta_present = ctaKeywords.some((keyword) =>
    text.toLowerCase().includes(keyword),
  );

  // Check length (Instagram max 2200 chars, but aim for <300)
  const length_ok = text.length > 20 && text.length < 300;

  // Auto brand voice check (simple heuristic - improve with ML later)
  const spammyWords = [
    "buy now!!!",
    "click here!!!",
    "limited time!!!",
    "act now!!!",
  ];
  const hasSpam = spammyWords.some((word) => text.toLowerCase().includes(word));

  // Check for conversational tone (presence of "you", "your", "we")
  const conversationalWords = ["you", "your", "we", "our"];
  const isConversational = conversationalWords.some((word) =>
    text.toLowerCase().includes(word),
  );

  const brand_voice: "pass" | "review" =
    !hasSpam && isConversational ? "pass" : "review";

  return {
    brand_voice,
    cta_present,
    length_ok,
  };
}

/**
 * Load Fixture from Idea Pool
 *
 * @param fixtureId - Fixture ID (e.g., "launch-001")
 * @returns Fixture data or null
 */
async function loadFixture(fixtureId: string): Promise<any | null> {
  const { loadIdeaPoolFixture } = await import("~/lib/content/fixture-loader");
  return loadIdeaPoolFixture(fixtureId);
}

/**
 * Batch Generate Posts for Multiple Platforms
 *
 * Creates drafts for all specified platforms from one fixture.
 *
 * @param fixtureId - ID from idea-pool.json
 * @param platforms - Target platforms (default: all)
 * @returns Array of post drafts
 */
export async function batchGeneratePostsFromFixture(
  fixtureId: string,
  platforms: SocialPlatform[] = ["instagram", "facebook", "tiktok"],
): Promise<PostDraft[]> {
  const drafts: PostDraft[] = [];

  for (const platform of platforms) {
    try {
      const draft = await generatePostFromFixture(fixtureId, platform);
      drafts.push(draft);
    } catch (error) {
      console.error(`Failed to generate post for ${platform}:`, error);
    }
  }

  return drafts;
}

/**
 * Submit Post for HITL Review
 *
 * Prepares draft for CEO approval in approvals drawer.
 *
 * @param draft - Post draft
 * @returns Updated draft with pending_review status
 */
export async function submitForReview(draft: PostDraft): Promise<PostDraft> {
  // TODO: Create approval entry in Supabase
  // TODO: Trigger notification to CEO

  console.log("[PLACEHOLDER] submitForReview:", {
    draft_id: draft.id,
    platform: draft.platform,
    type: draft.type,
  });

  return {
    ...draft,
    approval_status: "pending_review",
  };
}
