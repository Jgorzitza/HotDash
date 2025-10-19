/**
 * Campaign Sync Service
 *
 * Orchestrates data synchronization from ad platforms
 *
 * @module app/services/ads/sync.service
 */

import type { Campaign } from "~/lib/ads";
import {
  fetchMetaCampaigns,
  fetchGoogleCampaigns,
  calculateCampaignImpact,
  batchStoreCampaignMetrics,
} from "~/lib/ads";
import { AdsFeatureFlags } from "~/config/ads.server";

/**
 * Sync result
 */
interface SyncResult {
  success: boolean;
  synced: number;
  stored: number;
  failed: number;
  duration: number;
  errors: string[];
}

/**
 * Sync all campaigns from platforms
 *
 * @param date - Target date for metrics snapshot
 * @returns Sync result
 */
export async function syncAllCampaigns(date?: string): Promise<SyncResult> {
  const startTime = Date.now();
  const targetDate = date || new Date().toISOString().split("T")[0];

  try {
    // Fetch from all platforms
    const [metaCampaigns, googleCampaigns] = await Promise.all([
      fetchMetaCampaigns(),
      fetchGoogleCampaigns(),
    ]);

    const allCampaigns: Campaign[] = [...metaCampaigns, ...googleCampaigns];

    // Calculate daily snapshots
    const snapshots = allCampaigns.map((campaign) =>
      calculateCampaignImpact(campaign, targetDate),
    );

    // Store if enabled
    let stored = 0;
    let failed = 0;
    const errors: string[] = [];

    if (AdsFeatureFlags.metricsStorageEnabled) {
      const result = await batchStoreCampaignMetrics(snapshots);
      stored = result.stored;
      failed = result.failed;
      errors.push(...result.errors);
    }

    const duration = Date.now() - startTime;

    return {
      success: failed === 0,
      synced: allCampaigns.length,
      stored,
      failed,
      duration,
      errors,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      synced: 0,
      stored: 0,
      failed: 0,
      duration,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * Sync campaigns from specific platform
 *
 * @param platform - Platform to sync (meta or google)
 * @param date - Target date
 * @returns Sync result
 */
export async function syncPlatformCampaigns(
  platform: "meta" | "google",
  date?: string,
): Promise<SyncResult> {
  const startTime = Date.now();
  const targetDate = date || new Date().toISOString().split("T")[0];

  try {
    const campaigns =
      platform === "meta"
        ? await fetchMetaCampaigns()
        : await fetchGoogleCampaigns();

    const snapshots = campaigns.map((campaign) =>
      calculateCampaignImpact(campaign, targetDate),
    );

    let stored = 0;
    let failed = 0;
    const errors: string[] = [];

    if (AdsFeatureFlags.metricsStorageEnabled) {
      const result = await batchStoreCampaignMetrics(snapshots);
      stored = result.stored;
      failed = result.failed;
      errors.push(...result.errors);
    }

    const duration = Date.now() - startTime;

    return {
      success: failed === 0,
      synced: campaigns.length,
      stored,
      failed,
      duration,
      errors,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      synced: 0,
      stored: 0,
      failed: 0,
      duration,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
