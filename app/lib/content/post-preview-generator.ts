/**
 * Post Preview Generator
 *
 * Generates visual previews of posts for different platforms.
 * Shows how post will appear before publishing.
 *
 * @see app/components/approvals/ContentApprovalCard.tsx
 */

import type { PostDraft } from "~/services/content/post-drafter";

export interface PostPreview {
  platform: string;
  html: string; // HTML preview
  metadata: {
    character_count: number;
    hashtag_count: number;
    has_media: boolean;
    has_link: boolean;
  };
}

/**
 * Generate Platform-Specific Preview
 *
 * Creates HTML preview showing how post appears on platform.
 *
 * @param draft - Post draft
 * @returns HTML preview
 */
export function generatePreview(draft: PostDraft): PostPreview {
  const { platform, content } = draft;

  const charCount = content.text.length;
  const hashtagCount = content.hashtags?.length || 0;
  const hasMedia = (content.media_ids?.length || 0) > 0;
  const hasLink = !!content.link;

  let html = "";

  switch (platform) {
    case "instagram":
      html = generateInstagramPreview(content);
      break;
    case "facebook":
      html = generateFacebookPreview(content);
      break;
    case "tiktok":
      html = generateTikTokPreview(content);
      break;
    default:
      html = `<div>${content.text}</div>`;
  }

  return {
    platform,
    html,
    metadata: {
      character_count: charCount,
      hashtag_count: hashtagCount,
      has_media: hasMedia,
      has_link: hasLink,
    },
  };
}

function generateInstagramPreview(content: any): string {
  return `
    <div style="max-width: 400px; border: 1px solid #ddd; border-radius: 8px; padding: 16px; background: white;">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #e1306c; margin-right: 8px;"></div>
        <strong>@hotrodan</strong>
      </div>
      ${content.media_ids?.length ? '<div style="width: 100%; height: 200px; background: #f0f0f0; margin-bottom: 12px; display: flex; align-items: center; justify-content: center;">📷 Image</div>' : ""}
      <div style="margin-bottom: 8px;">${content.text}</div>
      ${content.hashtags?.length ? `<div style="color: #0095f6; font-size: 14px;">${content.hashtags.join(" ")}</div>` : ""}
    </div>
  `;
}

function generateFacebookPreview(content: any): string {
  return `
    <div style="max-width: 500px; border: 1px solid #ddd; border-radius: 8px; padding: 16px; background: white;">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: #1877f2; margin-right: 8px;"></div>
        <strong>Hot Rod AN</strong>
      </div>
      <div style="margin-bottom: 12px;">${content.text}</div>
      ${content.link ? `<div style="border: 1px solid #ddd; padding: 8px; border-radius: 4px; background: #f0f0f0;"><a href="${content.link}" style="color: #1877f2;">${content.link}</a></div>` : ""}
      ${content.hashtags?.length ? `<div style="color: #65676b; font-size: 14px; margin-top: 8px;">${content.hashtags.join(" ")}</div>` : ""}
    </div>
  `;
}

function generateTikTokPreview(content: any): string {
  return `
    <div style="max-width: 350px; border: 1px solid #ddd; border-radius: 12px; padding: 16px; background: black; color: white;">
      <div style="margin-bottom: 8px; font-size: 14px;">@hotrodan</div>
      <div style="margin-bottom: 12px;">${content.text}</div>
      ${content.hashtags?.length ? `<div style="color: #00f2ea; font-size: 14px;">${content.hashtags.join(" ")}</div>` : ""}
    </div>
  `;
}
