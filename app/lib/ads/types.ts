/**
 * Ads Tracking TypeScript Types
 *
 * Type definitions for Meta/Google ad data structures and metrics
 *
 * @module app/lib/ads/types
 */

/**
 * Ad Platform enumeration
 */
export enum AdPlatform {
  META = "meta",
  GOOGLE = "google",
  UNKNOWN = "unknown",
}

/**
 * Campaign Status enumeration
 */
export enum CampaignStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  ENDED = "ended",
  DRAFT = "draft",
}

/**
 * Base campaign metrics common to all platforms
 */
export interface CampaignMetrics {
  /** Total advertising spend in currency */
  spend: number;

  /** Total revenue generated in currency */
  revenue: number;

  /** Total number of impressions/views */
  impressions: number;

  /** Total number of clicks */
  clicks: number;

  /** Total number of conversions/acquisitions */
  conversions: number;

  /** Return on Ad Spend (calculated) */
  roas: number;

  /** Cost Per Click (calculated) */
  cpc: number;

  /** Cost Per Acquisition (calculated) */
  cpa: number;

  /** Click-Through Rate as percentage (calculated) */
  ctr: number;

  /** Conversion Rate as percentage (calculated) */
  conversionRate: number;
}

/**
 * Campaign base properties
 */
export interface Campaign {
  /** Unique campaign identifier */
  id: string;

  /** Campaign name */
  name: string;

  /** Ad platform (Meta, Google, etc.) */
  platform: AdPlatform;

  /** Campaign status */
  status: CampaignStatus;

  /** Campaign start date (ISO 8601) */
  startDate: string;

  /** Campaign end date (ISO 8601, optional for ongoing campaigns) */
  endDate?: string;

  /** Daily budget in currency */
  dailyBudget: number;

  /** Total campaign budget in currency */
  totalBudget: number;

  /** Campaign metrics */
  metrics: CampaignMetrics;

  /** Campaign created timestamp */
  createdAt: string;

  /** Campaign last updated timestamp */
  updatedAt: string;
}

/**
 * Meta (Facebook/Instagram) specific campaign data
 */
export interface MetaCampaign extends Campaign {
  platform: AdPlatform.META;

  /** Meta campaign ID */
  metaCampaignId: string;

  /** Meta ad account ID */
  adAccountId: string;

  /** Objective (CONVERSIONS, TRAFFIC, etc.) */
  objective: string;

  /** Target audience IDs */
  audienceIds: string[];

  /** Placement types (Facebook, Instagram, Messenger, etc.) */
  placements: string[];
}

/**
 * Google Ads specific campaign data
 */
export interface GoogleCampaign extends Campaign {
  platform: AdPlatform.GOOGLE;

  /** Google campaign ID */
  googleCampaignId: string;

  /** Google Ads customer ID */
  customerId: string;

  /** Campaign type (SEARCH, DISPLAY, VIDEO, etc.) */
  campaignType: string;

  /** Bidding strategy */
  biddingStrategy: string;

  /** Target keywords */
  keywords: string[];
}

/**
 * Campaign daily snapshot for time-series data
 */
export interface CampaignDailySnapshot {
  /** Campaign ID */
  campaignId: string;

  /** Date of snapshot (YYYY-MM-DD) */
  date: string;

  /** Platform */
  platform: AdPlatform;

  /** Daily metrics */
  metrics: CampaignMetrics;

  /** Snapshot created timestamp */
  createdAt: string;
}

/**
 * Ads approval request payload
 */
export interface AdsApprovalRequest {
  /** Approval type (campaign_create, campaign_update, etc.) */
  type:
    | "campaign_create"
    | "campaign_update"
    | "campaign_pause"
    | "budget_change";

  /** Campaign data for approval */
  campaign: Partial<Campaign>;

  /** Evidence data */
  evidence: {
    /** Historical campaign data */
    historicalData?: CampaignMetrics;

    /** Projected ROAS */
    projectedROAS?: number;

    /** Comparison campaigns */
    similarCampaigns?: Campaign[];

    /** Supporting notes */
    notes?: string;
  };

  /** Rollback plan */
  rollback: {
    /** Rollback description */
    description: string;

    /** Rollback actions */
    actions: string[];
  };

  /** Risk assessment */
  risk: {
    /** Risk level (low, medium, high) */
    level: "low" | "medium" | "high";

    /** Risk factors */
    factors: string[];
  };
}

/**
 * Campaign filter options
 */
export interface CampaignFilters {
  /** Filter by platform */
  platform?: AdPlatform;

  /** Filter by status */
  status?: CampaignStatus;

  /** Filter by date range start */
  startDate?: string;

  /** Filter by date range end */
  endDate?: string;

  /** Filter by minimum ROAS */
  minROAS?: number;

  /** Filter by maximum CPA */
  maxCPA?: number;

  /** Search by name (partial match) */
  search?: string;
}

/**
 * Campaign sort options
 */
export interface CampaignSort {
  /** Field to sort by */
  field: "name" | "spend" | "roas" | "cpc" | "cpa" | "startDate" | "updatedAt";

  /** Sort direction */
  direction: "asc" | "desc";
}

/**
 * Paginated campaign list response
 */
export interface CampaignListResponse {
  /** Array of campaigns */
  campaigns: Campaign[];

  /** Total count of campaigns matching filters */
  totalCount: number;

  /** Current page number (1-indexed) */
  page: number;

  /** Page size */
  pageSize: number;

  /** Whether there are more pages */
  hasMore: boolean;
}

/**
 * Supabase ads_metrics_daily table row
 */
export interface AdsMetricsDailyRow {
  /** Primary key ID */
  id: string;

  /** Campaign ID */
  campaign_id: string;

  /** Platform */
  platform: AdPlatform;

  /** Metric date (YYYY-MM-DD) */
  date: string;

  /** Spend amount */
  spend: number;

  /** Revenue amount */
  revenue: number;

  /** Impressions count */
  impressions: number;

  /** Clicks count */
  clicks: number;

  /** Conversions count */
  conversions: number;

  /** Calculated ROAS */
  roas: number;

  /** Calculated CPC */
  cpc: number;

  /** Calculated CPA */
  cpa: number;

  /** Calculated CTR */
  ctr: number;

  /** Calculated conversion rate */
  conversion_rate: number;

  /** Row created timestamp */
  created_at: string;

  /** Row updated timestamp */
  updated_at: string;
}

/**
 * Publer campaign post data
 */
export interface PublerCampaignPost {
  /** Publer post ID */
  id: string;

  /** Associated campaign ID */
  campaignId: string;

  /** Post status */
  status: "draft" | "scheduled" | "published" | "failed";

  /** Post content */
  content: string;

  /** Media URLs */
  media?: string[];

  /** Scheduled publish time (ISO 8601) */
  scheduledTime?: string;

  /** Actual publish time (ISO 8601) */
  publishedTime?: string;

  /** Social platform (facebook, instagram, twitter, etc.) */
  socialPlatform: string;

  /** Publer receipt payload */
  receipt?: Record<string, unknown>;
}

/**
 * Ads error response
 */
export interface AdsError {
  /** Error code */
  code: string;

  /** Error message */
  message: string;

  /** Error details */
  details?: Record<string, unknown>;

  /** Timestamp */
  timestamp: string;
}
