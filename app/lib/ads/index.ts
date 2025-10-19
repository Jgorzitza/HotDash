/**
 * Ads Module - Barrel Export
 *
 * Centralized exports for the ads intelligence module
 *
 * @module app/lib/ads
 */

// Core metrics calculations
export {
  calculateROAS,
  calculateCPC,
  calculateCPA,
  calculateCTR,
  calculateConversionRate,
  formatCurrency,
  formatPercentage,
  calculateAdMetrics,
} from "./metrics";

// Type definitions
export type {
  Campaign,
  MetaCampaign,
  GoogleCampaign,
  CampaignMetrics,
  CampaignDailySnapshot,
  CampaignFilters,
  CampaignSort,
  CampaignListResponse,
  AdsMetricsDailyRow,
  AdsApprovalRequest,
  PublerCampaignPost,
  AdsError,
} from "./types";

export { AdPlatform, CampaignStatus } from "./types";

// Approvals integration
export {
  createCampaignApprovalRequest,
  createBudgetChangeApprovalRequest,
  createPauseApprovalRequest,
  formatApprovalForDisplay,
} from "./approvals";

// Impact metrics and storage
export {
  calculateCampaignImpact,
  transformToSupabaseRow,
  storeCampaignMetrics,
  batchStoreCampaignMetrics,
  calculateAggregateImpact,
} from "./impact-metrics";

// Platform adapters (stubs)
export {
  fetchMetaCampaigns,
  fetchMetaCampaignMetrics,
  createMetaCampaign,
  checkMetaHealth,
} from "./meta-stub";

export {
  fetchGoogleCampaigns,
  fetchGoogleCampaignMetrics,
  createGoogleCampaign,
  checkGoogleAdsHealth,
} from "./google-ads-stub";

// Publer adapter
export {
  createPublerAdapter,
  publlerAdapter,
  MOCK_CAMPAIGN_DATA,
} from "./publer-adapter.stub";

// Metrics service helpers
export { getPlatformBreakdown } from "../../services/ads/metrics.service";
