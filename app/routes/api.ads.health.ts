/**
 * Ads Module Health Check API
 *
 * Monitor status of ads module components and platform integrations
 *
 * @route GET /api/ads/health
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  checkMetaHealth,
  checkGoogleAdsHealth,
  publlerAdapter,
} from "~/lib/ads";
import {
  AdsFeatureFlags,
  getAdsModuleHealth,
  validatePublerConfig,
  validateMetaConfig,
  validateGoogleAdsConfig,
} from "~/config/ads.server";
import { trackAPIRequest, createTimer } from "~/lib/ads/monitoring";

export async function loader({ request }: LoaderFunctionArgs) {
  const timer = createTimer();
  try {
    // Check all platform health statuses
    const [publlerHealth, metaHealth, googleHealth] = await Promise.all([
      publlerAdapter.healthCheck(),
      checkMetaHealth(),
      checkGoogleAdsHealth(),
    ]);

    // Get overall module health
    const moduleHealth = getAdsModuleHealth();

    // Get configuration validation
    const publlerConfig = validatePublerConfig();
    const metaConfig = validateMetaConfig();
    const googleConfig = validateGoogleAdsConfig();

    const response = json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        overall: moduleHealth.overall,
        featureFlags: {
          publlerEnabled: AdsFeatureFlags.publlerEnabled,
          metaEnabled: AdsFeatureFlags.metaEnabled,
          googleEnabled: AdsFeatureFlags.googleEnabled,
          dashboardTileEnabled: AdsFeatureFlags.dashboardTileEnabled,
          approvalsEnabled: AdsFeatureFlags.approvalsEnabled,
          metricsStorageEnabled: AdsFeatureFlags.metricsStorageEnabled,
        },
        platforms: {
          publer: {
            status: publlerHealth.status,
            mode: publlerHealth.mode,
            message: publlerHealth.message,
            configured: publlerConfig.valid,
            missingConfig: publlerConfig.missing,
          },
          meta: {
            status: metaHealth.status,
            mode: metaHealth.mode,
            message: metaHealth.message,
            configured: metaConfig.valid,
            missingConfig: metaConfig.missing,
          },
          google: {
            status: googleHealth.status,
            mode: googleHealth.mode,
            message: googleHealth.message,
            configured: googleConfig.valid,
            missingConfig: googleConfig.missing,
          },
        },
        recommendations: generateHealthRecommendations(
          publlerHealth,
          metaHealth,
          googleHealth,
          moduleHealth,
        ),
      },
    });

    trackAPIRequest("/api/ads/health", "GET", timer.stop(), 200);
    return response;
  } catch (error) {
    console.error("Error checking ads health:", error);
    trackAPIRequest("/api/ads/health", "GET", timer.stop(), 500);
    return json(
      {
        success: false,
        error: {
          code: "HEALTH_CHECK_ERROR",
          message:
            error instanceof Error ? error.message : "Health check failed",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Generate health recommendations based on current status
 */
function generateHealthRecommendations(
  publlerHealth: { status: string; mode: string },
  metaHealth: { status: string; mode: string },
  googleHealth: { status: string; mode: string },
  moduleHealth: { overall: string },
): string[] {
  const recommendations: string[] = [];

  if (moduleHealth.overall === "stub_mode") {
    recommendations.push(
      "All platforms running in stub mode. Configure API credentials to enable real data.",
    );
  }

  if (publlerHealth.mode === "stub") {
    recommendations.push(
      "Configure PUBLER_API_KEY and PUBLER_WORKSPACE_ID to enable real social posting.",
    );
  }

  if (metaHealth.mode === "stub") {
    recommendations.push(
      "Configure META_ACCESS_TOKEN to enable real Meta/Facebook ads data.",
    );
  }

  if (googleHealth.mode === "stub") {
    recommendations.push(
      "Complete Google Ads OAuth flow and configure credentials to enable real Google Ads data.",
    );
  }

  if (moduleHealth.overall === "degraded") {
    recommendations.push(
      "Some platforms are enabled but not configured correctly. Check missing configuration above.",
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("All systems healthy and configured.");
  }

  return recommendations;
}
