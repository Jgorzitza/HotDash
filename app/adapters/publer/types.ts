/**
 * Publer API Type Definitions
 * Based on official Publer API documentation
 * @see https://publer.com/docs/
 */

export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "twitter"
  | "linkedin"
  | "tiktok"
  | "google";

export type PostType =
  | "status"
  | "photo"
  | "video"
  | "link"
  | "gif"
  | "reel"
  | "story";

export type PostState =
  | "draft"
  | "scheduled"
  | "published"
  | "failed"
  | "recycling"
  | "recurring";

/**
 * Publer Post Schedule Request
 */
export interface PublerScheduleRequest {
  bulk: {
    state: PostState;
    posts: PublerPost[];
  };
}

/**
 * Individual Post within Bulk Request
 */
export interface PublerPost {
  networks: Record<
    SocialPlatform,
    {
      type: PostType;
      text?: string;
      media?: PublerMedia[];
      link?: PublerLink;
      details?: Record<string, unknown>;
    }
  >;
  accounts: PublerAccount[];
  recycling?: PublerRecycling;
  recurring?: PublerRecurring;
  share_next?: boolean;
  range?: {
    start_date: string; // ISO 8601
    end_date: string; // ISO 8601
  };
  auto?: boolean;
}

/**
 * Account Targeting with Schedule
 */
export interface PublerAccount {
  id: string;
  scheduled_at?: string; // ISO 8601 (must be ≥1 min in future)
  labels?: string[];
  previewed_media?: boolean;
  watermark?: PublerWatermark;
}

/**
 * Media Object
 */
export interface PublerMedia {
  id: string;
  type: "photo" | "video" | "gif";
  path?: string;
  url?: string;
  thumbnail?: string;
  thumbnails?: {
    real: string;
    small: string;
  };
  title?: string;
  caption?: string;
  alt_text?: string;
  default_thumbnail?: number;
}

/**
 * Link Object (for Link Posts)
 */
export interface PublerLink {
  url: string;
  title?: string;
  description?: string;
  provider_display?: string;
  images?: string[];
  default_image?: number;
  call_to_action?: string;
  phone_number?: string;
}

/**
 * Watermark Settings
 */
export interface PublerWatermark {
  id: string;
  name: string;
  opacity: number; // 0-100
  size: number;
  position: "top_left" | "top_right" | "bottom_left" | "bottom_right";
  default: boolean;
  image: string;
}

/**
 * Recycling Configuration
 */
export interface PublerRecycling {
  solo: boolean;
  gap: number;
  gap_freq: "Day" | "Week" | "Month";
  start_date: string; // YYYY-MM-DD
  expire_count?: string;
  expire_date?: string; // YYYY-MM-DD
}

/**
 * Recurring Configuration
 */
export interface PublerRecurring {
  start_date: string; // ISO 8601
  end_date?: string; // ISO 8601
  repeat: "daily" | "weekly" | "monthly";
  days_of_week?: number[]; // 1=Monday, 7=Sunday
  repeat_rate: number;
  time?: string; // HH:MM
}

/**
 * Publer API Response
 */
export interface PublerScheduleResponse {
  success: boolean;
  data: {
    job_id: string;
  };
}

/**
 * Publer API Error Response
 */
export interface PublerErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

/**
 * Publer OAuth Configuration
 */
export interface PublerOAuthConfig {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scope: string[]; // ["posts", "media", "analytics"]
}

/**
 * Publer Access Token Response
 */
export interface PublerTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number; // seconds
  refresh_token?: string;
  scope: string;
}

/**
 * Publer Workspace
 */
export interface PublerWorkspace {
  id: string;
  name: string;
  accounts: PublerConnectedAccount[];
}

/**
 * Connected Social Account
 */
export interface PublerConnectedAccount {
  id: string;
  platform: SocialPlatform;
  name: string;
  username?: string;
  avatar?: string;
  is_active: boolean;
  requires_reauth: boolean;
}

/**
 * Post Performance Metrics (from Publer Analytics)
 */
export interface PublerPostMetrics {
  post_id: string;
  platform: SocialPlatform;
  published_at: string; // ISO 8601
  impressions: number;
  reach: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
  };
  clicks: number;
  click_through_rate: number;
  engagement_rate: number;
}
