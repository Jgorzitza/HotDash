/**
 * Google Ads Type Definitions
 *
 * Type definitions for Google Ads API client and services.
 *
 * @module app/services/ads/types
 */

/**
 * Google Ads API Configuration
 */
export interface GoogleAdsConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  developerToken: string;
  customerIds: string[];
}

/**
 * Campaign Status
 */
export type CampaignStatus = "ENABLED" | "PAUSED" | "REMOVED" | "UNKNOWN";

/**
 * Ad Group Status
 */
export type AdGroupStatus = "ENABLED" | "PAUSED" | "REMOVED" | "UNKNOWN";

/**
 * Keyword Match Type
 */
export type KeywordMatchType = "EXACT" | "PHRASE" | "BROAD" | "UNKNOWN";

/**
 * Campaign Object
 */
export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  channelType: string;
  biddingStrategy: string;
  budgetMicros: number;
  customerId: string;
}

/**
 * Campaign Performance Metrics
 */
export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  costCents: number;
  conversions: number;
  revenueCents: number;
  ctr: number;
  avgCpcCents: number;
  customerId: string;
  dateRange: string;
}

/**
 * Ad Group Performance Metrics
 */
export interface AdGroupPerformance {
  campaignId: string;
  campaignName: string;
  adGroupId: string;
  adGroupName: string;
  status: AdGroupStatus;
  impressions: number;
  clicks: number;
  costCents: number;
  conversions: number;
  customerId: string;
  dateRange: string;
}

/**
 * Keyword Performance Metrics
 */
export interface KeywordPerformance {
  campaignId: string;
  campaignName: string;
  adGroupId: string;
  adGroupName: string;
  keyword: string;
  matchType: KeywordMatchType;
  impressions: number;
  clicks: number;
  costCents: number;
  conversions: number;
  customerId: string;
  dateRange: string;
}

/**
 * Budget Alert Severity
 */
export type AlertSeverity = "high" | "medium" | "low";

/**
 * Budget Alert Type
 */
export type AlertType = 
  | "budget_depleted"
  | "low_ctr"
  | "high_cpc"
  | "conversion_drop"
  | "budget_exceeded";

/**
 * Budget Alert Object
 */
export interface BudgetAlert {
  campaignId: string;
  campaignName: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  currentValue: number;
  thresholdValue: number;
  timestamp: string;
}

/**
 * Campaign Summary for Performance Dashboard
 */
export interface CampaignSummary {
  id: string;
  name: string;
  status: CampaignStatus;
  impressions: number;
  clicks: number;
  ctr: number;
  costCents: number;
  conversions: number;
  roas: number | null;
}

/**
 * Performance Dashboard Summary
 */
export interface PerformanceSummary {
  campaigns: CampaignSummary[];
  summary: {
    totalSpendCents: number;
    totalConversions: number;
    avgCpcCents: number;
    avgRoas: number | null;
  };
  alerts: BudgetAlert[];
  dateRange: string;
}

/**
 * Ad Copy Approval Request
 */
export interface AdCopyApprovalRequest {
  campaignId: string;
  campaignName: string;
  adGroupId: string;
  adGroupName: string;
  currentCopy: AdCopy;
  proposedCopy: AdCopy;
  reason: string;
  requestedBy: string;
  requestedAt: string;
}

/**
 * Ad Copy Object
 */
export interface AdCopy {
  headlines: string[];
  descriptions: string[];
  finalUrl: string;
  displayPath1?: string;
  displayPath2?: string;
}

/**
 * Ad Copy Approval Status
 */
export type ApprovalStatus = "pending" | "approved" | "rejected" | "applied";

/**
 * Ad Copy Approval
 */
export interface AdCopyApproval {
  id: string;
  request: AdCopyApprovalRequest;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  appliedAt?: string;
}

