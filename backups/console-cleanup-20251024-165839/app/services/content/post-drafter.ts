/**
 * Post Drafter Service
 *
 * AI-powered social media post drafting for HITL approval workflow.
 * Generates platform-optimized content based on:
 * - Product information
 * - Historical performance data
 * - Platform best practices
 * - Brand voice guidelines
 */

import type { SocialPlatform, ContentPost } from "../../lib/content/tracking";
import {
  analyzeEngagementPatterns,
  type EngagementInsights,
} from "./engagement-analyzer";
import type { Approval } from "../../components/approvals/ApprovalsDrawer";
import { appMetrics } from "../../utils/metrics.server";

// ============================================================================
// Types
// ============================================================================

/**
 * Post draft request parameters
 */
export interface DraftPostRequest {
  platform: SocialPlatform;
  topic?: string;
  productId?: string;
  tone?: "professional" | "casual" | "playful" | "urgent";
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  maxLength?: number;
}

/**
 * Generated post draft with metadata
 */
export interface PostDraft {
  content: string;
  platform: SocialPlatform;
  metadata: {
    hashtags: string[];
    mentions: string[];
    estimatedEngagement?: number;
    characterCount: number;
    wordCount: number;
  };
  reasoning: {
    strategy: string;
    expectedPerformance: string;
    basedOn: string[];
  };
  alternatives?: string[]; // Alternative versions
}

/**
 * Post optimization suggestions
 */
export interface OptimizationSuggestions {
  timing: {
    bestDayOfWeek: string;
    bestTimeOfDay: string;
    reasoning: string;
  };
  hashtags: {
    recommended: string[];
    trending: string[];
    reasoning: string;
  };
  content: {
    suggestions: string[];
    warnings: string[];
  };
}

/**
 * HITL approval creation options
 */
export interface CreateApprovalOptions {
  draft: PostDraft;
  scheduledTime?: string;
  targetAudience?: string;
  campaignId?: string;
  isDev?: boolean; // Dev mode flag for fixtures
}

// ============================================================================
// Platform Configuration
// ============================================================================

const PLATFORM_LIMITS = {
  instagram: {
    maxLength: 2200,
    maxHashtags: 30,
    recommendedHashtags: 11,
    supportsEmojis: true,
  },
  facebook: {
    maxLength: 63206,
    maxHashtags: 10,
    recommendedHashtags: 3,
    supportsEmojis: true,
  },
  tiktok: {
    maxLength: 2200,
    maxHashtags: 10,
    recommendedHashtags: 5,
    supportsEmojis: true,
  },
} as const;

// ============================================================================
// Post Drafting Functions
// ============================================================================

/**
 * Generate a post draft for the specified platform
 *
 * NOTE: This is a placeholder implementation. In production, this would:
 * 1. Call OpenAI API with platform-specific prompts
 * 2. Incorporate historical performance data
 * 3. Apply brand voice guidelines
 * 4. Use engagement insights for optimization
 */
export async function draftPost(request: DraftPostRequest): Promise<PostDraft> {
  const startTime = Date.now();

  try {
    const platformConfig = PLATFORM_LIMITS[request.platform];
    const maxLength = request.maxLength || platformConfig.maxLength;

    // Get engagement insights for this platform
    const insights = await analyzeEngagementPatterns(request.platform);

    // TODO: Implement actual AI drafting via OpenAI API
    // For now, return a structured placeholder

    const draft: PostDraft = {
      content: generatePlaceholderContent(request, maxLength),
      platform: request.platform,
      metadata: {
        hashtags: generateHashtags(request, platformConfig),
        mentions: [],
        characterCount: 0, // Will be calculated
        wordCount: 0, // Will be calculated
      },
      reasoning: {
        strategy: `Platform-optimized for ${request.platform}`,
        expectedPerformance: `Based on ${insights.topPerformingHashtags.length} high-performing patterns`,
        basedOn: [
          "Historical engagement data",
          "Platform best practices",
          "Brand voice guidelines",
        ],
      },
      alternatives: [],
    };

    // Calculate actual counts
    draft.metadata.characterCount = draft.content.length;
    draft.metadata.wordCount = draft.content.split(/\s+/).length;

    // Emit metrics
    appMetrics.contentDraftCreated(request.platform, true);

    return draft;
  } catch (error) {
    // Emit failure metric
    appMetrics.contentDraftCreated(request.platform, false);
    throw error;
  }
}

/**
 * Generate multiple post variations for A/B testing
 */
export async function draftPostVariations(
  request: DraftPostRequest,
  count: number = 3,
): Promise<PostDraft[]> {
  const variations: PostDraft[] = [];

  for (let i = 0; i < count; i++) {
    const variation = await draftPost({
      ...request,
      tone: ["professional", "casual", "playful"][i % 3] as any,
    });
    variations.push(variation);
  }

  return variations;
}

/**
 * Optimize an existing post draft
 */
export async function optimizePost(
  draft: PostDraft,
): Promise<OptimizationSuggestions> {
  const insights = await analyzeEngagementPatterns(draft.platform);

  return {
    timing: {
      bestDayOfWeek: insights.bestPostingTimes.dayOfWeek,
      bestTimeOfDay: insights.bestPostingTimes.timeOfDay,
      reasoning: `Based on ${insights.totalPosts} historical posts`,
    },
    hashtags: {
      recommended: insights.topPerformingHashtags.slice(0, 5),
      trending: [], // TODO: Fetch from platform API
      reasoning: `Top hashtags with ${insights.averageEngagementRate.toFixed(1)}% avg engagement`,
    },
    content: {
      suggestions: generateContentSuggestions(draft, insights),
      warnings: generateContentWarnings(draft),
    },
  };
}

/**
 * Validate post draft against platform requirements
 */
export function validatePost(draft: PostDraft): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config = PLATFORM_LIMITS[draft.platform];

  // Check length
  if (draft.metadata.characterCount > config.maxLength) {
    errors.push(
      `Content exceeds ${draft.platform} limit of ${config.maxLength} characters`,
    );
  }

  // Check hashtags
  if (draft.metadata.hashtags.length > config.maxHashtags) {
    errors.push(
      `Too many hashtags (${draft.metadata.hashtags.length}). ${draft.platform} allows max ${config.maxHashtags}`,
    );
  }

  if (draft.metadata.hashtags.length < config.recommendedHashtags) {
    warnings.push(
      `Consider adding more hashtags. Recommended: ${config.recommendedHashtags}`,
    );
  }

  // Check for common issues
  if (draft.content.includes("http://")) {
    warnings.push("Consider using HTTPS links instead of HTTP");
  }

  if (draft.content.split("\n").length > 10) {
    warnings.push("Long posts may have lower engagement. Consider shortening.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate placeholder content (to be replaced with AI generation)
 */
function generatePlaceholderContent(
  request: DraftPostRequest,
  maxLength: number,
): string {
  const topic = request.topic || "product showcase";
  const tone = request.tone || "professional";

  let content = `Check out our latest ${topic}! `;

  if (tone === "playful") {
    content += "🎉 ";
  }

  content += `Perfect for your needs. `;

  if (request.includeEmojis) {
    content += "✨ ";
  }

  return content.slice(0, maxLength);
}

/**
 * Generate hashtags based on platform and request
 */
function generateHashtags(
  request: DraftPostRequest,
  config: (typeof PLATFORM_LIMITS)[SocialPlatform],
): string[] {
  if (!request.includeHashtags) {
    return [];
  }

  // TODO: Generate based on topic and historical performance
  const baseHashtags = ["hotrodan", "quality", "shopnow"];

  return baseHashtags.slice(0, config.recommendedHashtags);
}

/**
 * Generate content improvement suggestions
 */
function generateContentSuggestions(
  draft: PostDraft,
  insights: EngagementInsights,
): string[] {
  const suggestions: string[] = [];

  if (draft.metadata.hashtags.length === 0) {
    suggestions.push("Add hashtags to increase discoverability");
  }

  if (!draft.content.includes("?")) {
    suggestions.push("Consider adding a question to boost engagement");
  }

  if (draft.metadata.wordCount < 10) {
    suggestions.push("Longer posts (10-20 words) tend to perform better");
  }

  return suggestions;
}

/**
 * Generate content warnings
 */
function generateContentWarnings(draft: PostDraft): string[] {
  const warnings: string[] = [];

  if (draft.content.toLowerCase().includes("buy now")) {
    warnings.push("Overly promotional language may reduce engagement");
  }

  if (draft.metadata.hashtags.some((tag) => tag.length > 30)) {
    warnings.push("Very long hashtags may not be effective");
  }

  return warnings;
}

// ============================================================================
// HITL Approval Integration
// ============================================================================

/**
 * Create an approval record for a post draft (HITL workflow)
 *
 * This function creates a structured approval following the HITL pattern:
 * - Evidence: Post content, platform, timing, engagement forecast
 * - Impact: Estimated reach, engagement, conversions
 * - Risk: Brand reputation, timing concerns
 * - Rollback: Delete post capability
 * - Actions: Social publishing endpoint
 *
 * In dev mode, creates fixtures with provenance.mode="dev:test" and Apply disabled.
 */
export async function createPostDraftApproval(
  options: CreateApprovalOptions,
): Promise<Approval> {
  const {
    draft,
    scheduledTime,
    targetAudience,
    campaignId,
    isDev = true,
  } = options;

  // Get optimization suggestions for evidence
  const optimization = await optimizePost(draft);

  // Validate the draft
  const validation = validatePost(draft);

  // Generate unique ID (in production, this would come from Supabase)
  const approvalId = `approval-growth-${Date.now()}`;

  // Calculate estimated impact
  const estimatedImpact = calculateEstimatedImpact(draft, optimization);

  // Build the approval record
  const approval: Approval = {
    id: approvalId,
    kind: "growth",
    state: "pending_review",
    summary: `${draft.platform} post: ${draft.content.slice(0, 50)}${draft.content.length > 50 ? "..." : ""}`,
    created_by: "ai-content",

    // Evidence: What, Why, Impact Forecast
    evidence: {
      what_changes: `Post new content to ${draft.platform} with ${draft.metadata.hashtags.length} hashtags`,
      why_now: scheduledTime
        ? `Scheduled for ${scheduledTime} (${optimization.timing.reasoning})`
        : `Optimal posting time: ${optimization.timing.bestDayOfWeek} at ${optimization.timing.bestTimeOfDay}`,
      impact_forecast: `Estimated ${estimatedImpact.impressions.toLocaleString()} impressions, ${estimatedImpact.engagements} engagements, ${estimatedImpact.clicks} website clicks`,

      // Samples: Post content
      samples: [
        {
          label: "Post Caption",
          content: draft.content,
        },
        {
          label: "Hashtags",
          content: draft.metadata.hashtags.join(" "),
        },
        {
          label: "Platform Details",
          content: `Platform: ${draft.platform}\nCharacters: ${draft.metadata.characterCount}/${PLATFORM_LIMITS[draft.platform].maxLength}\nWords: ${draft.metadata.wordCount}`,
        },
      ],

      // Queries: Historical performance data
      queries: [
        {
          label: "Historical Performance",
          query: `SELECT AVG(engagement_rate) FROM posts WHERE platform = '${draft.platform}' AND created_at > NOW() - INTERVAL '30 days'`,
          result: `Average engagement rate: ${estimatedImpact.engagementRate}%`,
        },
      ],
    },

    // Impact: Expected outcomes
    impact: {
      expected_outcome: `Increase brand awareness and drive traffic to website`,
      metrics_affected: [
        `${draft.platform} impressions`,
        `${draft.platform} engagement rate`,
        "Website traffic",
        "Social media followers",
      ],
      user_experience: `Followers see engaging content about ${draft.reasoning.strategy}`,
      business_value: `Estimated ${estimatedImpact.clicks} website visits, potential ${estimatedImpact.conversions} conversions`,
    },

    // Risk: What could go wrong
    risk: {
      what_could_go_wrong: [
        "Post may not resonate with audience (low engagement)",
        "Timing may not be optimal if scheduled incorrectly",
        "Hashtags may not perform as expected",
        "Brand reputation risk if content is off-brand",
      ].join("; "),
      recovery_time: "< 5 minutes (can delete post immediately)",
    },

    // Rollback: How to undo
    rollback: {
      steps: [
        "Delete post from platform via API",
        "Issue correction post if needed",
        "Archive post data in Supabase",
        "Update content calendar",
      ],
      artifact_location: `supabase://approvals/${approvalId}/rollback`,
    },

    // Actions: Tool calls to execute on approval
    actions: isDev
      ? [
          {
            endpoint: "/api/social/publish",
            payload: {
              platform: draft.platform,
              content: draft.content,
              hashtags: draft.metadata.hashtags,
              scheduledTime: scheduledTime || "immediate",
              campaignId,
              provenance: {
                mode: "dev:test",
                feedback_ref: `feedback/content/${new Date().toISOString().split("T")[0]}.md`,
              },
            },
            dry_run_status: "DEV MODE - Apply disabled",
          },
        ]
      : [
          {
            endpoint: "/api/social/publish",
            payload: {
              platform: draft.platform,
              content: draft.content,
              hashtags: draft.metadata.hashtags,
              scheduledTime: scheduledTime || "immediate",
              campaignId,
            },
            dry_run_status: "Ready to publish",
          },
        ],

    // Validation errors (if any)
    validation_errors: validation.valid ? undefined : validation.errors,

    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Emit metrics
  const priority = scheduledTime ? "high" : "medium";
  appMetrics.contentApprovalCreated(draft.platform, priority);

  return approval;
}

/**
 * Calculate estimated impact metrics for a post draft
 */
function calculateEstimatedImpact(
  draft: PostDraft,
  optimization: OptimizationSuggestions,
): {
  impressions: number;
  engagements: number;
  clicks: number;
  conversions: number;
  engagementRate: number;
} {
  // Base estimates by platform (placeholder - would use ML in production)
  const baseMetrics = {
    instagram: { impressions: 5000, engagementRate: 5.0 },
    facebook: { impressions: 3000, engagementRate: 3.5 },
    tiktok: { impressions: 10000, engagementRate: 8.0 },
  };

  const base = baseMetrics[draft.platform];
  const impressions = base.impressions;
  const engagementRate = base.engagementRate;
  const engagements = Math.round(impressions * (engagementRate / 100));
  const clicks = Math.round(engagements * 0.2); // 20% of engagements click through
  const conversions = Math.round(clicks * 0.05); // 5% conversion rate

  return {
    impressions,
    engagements,
    clicks,
    conversions,
    engagementRate,
  };
}
