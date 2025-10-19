/**
 * Ads Configuration
 *
 * Feature flags and configuration for the ads intelligence module
 *
 * @module app/config/ads.server
 */

import { isFeatureEnabled } from "./featureFlags";

/**
 * Ads module feature flags
 */
export const AdsFeatureFlags = {
  /**
   * Enable Publer real API (default: false, stub mode)
   * Set FEATURE_ADS_PUBLER_ENABLED=true to use real Publer API
   */
  publlerEnabled: isFeatureEnabled("ads_publer_enabled", false),

  /**
   * Enable Meta Ads real API (default: false, stub mode)
   * Set FEATURE_ADS_META_ENABLED=true to use real Meta API
   */
  metaEnabled: isFeatureEnabled("ads_meta_enabled", false),

  /**
   * Enable Google Ads real API (default: false, stub mode)
   * Set FEATURE_ADS_GOOGLE_ENABLED=true to use real Google Ads API
   */
  googleEnabled: isFeatureEnabled("ads_google_enabled", false),

  /**
   * Enable campaign metrics tile on dashboard
   * Set FEATURE_ADS_DASHBOARD_TILE=true to show tile
   */
  dashboardTileEnabled: isFeatureEnabled("ads_dashboard_tile", false),

  /**
   * Enable ads approvals workflow
   * Set FEATURE_ADS_APPROVALS=true to require HITL for campaigns
   */
  approvalsEnabled: isFeatureEnabled("ads_approvals", true),

  /**
   * Enable daily metrics storage to Supabase
   * Set FEATURE_ADS_METRICS_STORAGE=true to persist metrics
   */
  metricsStorageEnabled: isFeatureEnabled("ads_metrics_storage", false),
} as const;

/**
 * Ads API configuration
 */
export const AdsConfig = {
  /**
   * Publer API configuration
   */
  publer: {
    apiKey: process.env.PUBLER_API_KEY || "",
    workspaceId: process.env.PUBLER_WORKSPACE_ID || "",
    baseUrl: process.env.PUBLER_BASE_URL || "https://app.publer.com/api/v1",
  },

  /**
   * Meta Ads API configuration
   */
  meta: {
    accessToken: process.env.META_ACCESS_TOKEN || "",
    appId: process.env.META_APP_ID || "",
    appSecret: process.env.META_APP_SECRET || "",
    adAccountId: process.env.META_AD_ACCOUNT_ID || "",
  },

  /**
   * Google Ads API configuration
   */
  google: {
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "",
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || "",
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID || "",
  },

  /**
   * Alert thresholds
   */
  alerts: {
    minROAS: parseFloat(process.env.ADS_MIN_ROAS || "2.0"),
    maxCPA: parseFloat(process.env.ADS_MAX_CPA || "40.0"),
    maxDailySpend: parseFloat(process.env.ADS_MAX_DAILY_SPEND || "1000.0"),
  },
} as const;

/**
 * Validate Publer configuration
 */
export function validatePublerConfig(): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!AdsConfig.publer.apiKey) {
    missing.push("PUBLER_API_KEY");
  }
  if (!AdsConfig.publer.workspaceId) {
    missing.push("PUBLER_WORKSPACE_ID");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Validate Meta configuration
 */
export function validateMetaConfig(): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!AdsConfig.meta.accessToken) {
    missing.push("META_ACCESS_TOKEN");
  }
  if (!AdsConfig.meta.adAccountId) {
    missing.push("META_AD_ACCOUNT_ID");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Validate Google Ads configuration
 */
export function validateGoogleAdsConfig(): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!AdsConfig.google.developerToken) {
    missing.push("GOOGLE_ADS_DEVELOPER_TOKEN");
  }
  if (!AdsConfig.google.refreshToken) {
    missing.push("GOOGLE_ADS_REFRESH_TOKEN");
  }
  if (!AdsConfig.google.customerId) {
    missing.push("GOOGLE_ADS_CUSTOMER_ID");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get ads module health status
 */
export function getAdsModuleHealth(): {
  publer: { enabled: boolean; configured: boolean; missing: string[] };
  meta: { enabled: boolean; configured: boolean; missing: string[] };
  google: { enabled: boolean; configured: boolean; missing: string[] };
  overall: "healthy" | "degraded" | "stub_mode";
} {
  const publlerValidation = validatePublerConfig();
  const metaValidation = validateMetaConfig();
  const googleValidation = validateGoogleAdsConfig();

  const publer = {
    enabled: AdsFeatureFlags.publlerEnabled,
    configured: publlerValidation.valid,
    missing: publlerValidation.missing,
  };

  const meta = {
    enabled: AdsFeatureFlags.metaEnabled,
    configured: metaValidation.valid,
    missing: metaValidation.missing,
  };

  const google = {
    enabled: AdsFeatureFlags.googleEnabled,
    configured: googleValidation.valid,
    missing: googleValidation.missing,
  };

  // Determine overall health
  let overall: "healthy" | "degraded" | "stub_mode";
  if (!publer.enabled && !meta.enabled && !google.enabled) {
    overall = "stub_mode";
  } else if (
    (publer.enabled && !publer.configured) ||
    (meta.enabled && !meta.configured) ||
    (google.enabled && !google.configured)
  ) {
    overall = "degraded";
  } else {
    overall = "healthy";
  }

  return { publer, meta, google, overall };
}
