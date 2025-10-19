/**
 * Social Post Drafter
 *
 * Generate platform-optimized social media posts from campaign data
 *
 * @module app/lib/ads/post-drafter
 */

import type { Campaign } from "./types";

export interface PostDraft {
  content: string;
  platform: string;
  characterCount: number;
  hashtags: string[];
  callToAction?: string;
  mediaUrls?: string[];
  tone: "professional" | "casual" | "promotional" | "educational";
}

export interface DraftRequest {
  campaign: Campaign;
  targetPlatforms: string[];
  tone?: "professional" | "casual" | "promotional" | "educational";
  includeMetrics?: boolean;
}

/**
 * Draft social post from campaign data
 *
 * @param request - Draft request with campaign and platform targets
 * @returns Platform-optimized post drafts
 */
export function draftCampaignPost(request: DraftRequest): PostDraft[] {
  const drafts: PostDraft[] = [];
  const tone = request.tone || "promotional";

  for (const platform of request.targetPlatforms) {
    const draft = generatePlatformPost(
      request.campaign,
      platform,
      tone,
      request.includeMetrics,
    );
    drafts.push(draft);
  }

  return drafts;
}

/**
 * Generate platform-specific post
 */
function generatePlatformPost(
  campaign: Campaign,
  platform: string,
  tone: string,
  includeMetrics?: boolean,
): PostDraft {
  let content = "";
  const hashtags: string[] = [];

  switch (platform.toLowerCase()) {
    case "facebook":
      content = generateFacebookPost(campaign, tone, includeMetrics);
      hashtags.push("#HotRodAN", "#PerformanceParts");
      break;
    case "instagram":
      content = generateInstagramPost(campaign, tone, includeMetrics);
      hashtags.push(
        "#HotRodAN",
        "#PerformanceParts",
        "#CustomCars",
        "#VintageRods",
      );
      break;
    case "twitter":
      content = generateTwitterPost(campaign, tone, includeMetrics);
      hashtags.push("#HotRodAN", "#Performance");
      break;
    default:
      content = generateGenericPost(campaign, tone, includeMetrics);
      hashtags.push("#HotRodAN");
  }

  return {
    content,
    platform,
    characterCount: content.length,
    hashtags,
    tone: tone as PostDraft["tone"],
  };
}

function generateFacebookPost(
  campaign: Campaign,
  tone: string,
  includeMetrics?: boolean,
): string {
  let post = `${campaign.name} is performing well! `;

  if (includeMetrics && campaign.metrics.roas > 3.0) {
    post += `Our ads are delivering ${campaign.metrics.roas.toFixed(1)}x return. `;
  }

  post += "\n\nCheck out our latest hot rod parts and accessories.";

  if (tone === "promotional") {
    post += " Limited time offers available!";
  }

  return post;
}

function generateInstagramPost(
  campaign: Campaign,
  tone: string,
  includeMetrics?: boolean,
): string {
  let post = "🔥 ";

  if (includeMetrics && campaign.metrics.roas > 3.0) {
    post += `${campaign.name} - Crushing it with ${campaign.metrics.roas.toFixed(1)}x ROI! `;
  } else {
    post += `${campaign.name} `;
  }

  post +=
    "\n\n✨ Premium hot rod parts\n🚗 Custom performance upgrades\n⚡ Fast shipping";

  if (tone === "promotional") {
    post += "\n\n🎯 Shop now - link in bio!";
  }

  return post;
}

function generateTwitterPost(
  campaign: Campaign,
  tone: string,
  includeMetrics?: boolean,
): string {
  let post = "";

  if (includeMetrics && campaign.metrics.roas > 3.0) {
    post = `${campaign.name}: ${campaign.metrics.roas.toFixed(1)}x ROAS 📈\n\n`;
  }

  post += "Hot rod performance parts that deliver results.";

  if (tone === "promotional") {
    post += " Shop now 🔥";
  }

  return post.substring(0, 280); // Twitter character limit
}

function generateGenericPost(
  campaign: Campaign,
  tone: string,
  includeMetrics?: boolean,
): string {
  let post = `${campaign.name}`;

  if (includeMetrics) {
    post += ` - Delivering ${campaign.metrics.roas.toFixed(1)}x return on investment`;
  }

  post += "\n\nDiscover premium hot rod parts and accessories.";

  return post;
}

/**
 * Validate post against platform requirements
 */
export function validatePost(draft: PostDraft): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Platform-specific validation
  switch (draft.platform.toLowerCase()) {
    case "twitter":
      if (draft.characterCount > 280) {
        errors.push("Twitter posts must be ≤280 characters");
      }
      break;
    case "instagram":
      if (draft.characterCount > 2200) {
        errors.push("Instagram captions must be ≤2200 characters");
      }
      if (draft.hashtags.length > 30) {
        errors.push("Instagram allows maximum 30 hashtags");
      }
      break;
    case "facebook":
      if (draft.characterCount > 63206) {
        errors.push("Facebook posts must be ≤63,206 characters");
      }
      break;
  }

  // General validation
  if (draft.content.trim().length === 0) {
    errors.push("Post content cannot be empty");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
