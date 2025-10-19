/**
 * Publer Analytics Fetcher
 *
 * Fetches performance metrics from Publer API and stores in Supabase.
 * Runs on schedule (24h, 7d, 14d post-publish).
 *
 * @see app/lib/content/tracking.ts
 * @see app/adapters/publer/client.mock.ts
 */

import { getPublerClient } from "~/adapters/publer/client.mock";
import type { PublerPostMetrics } from "~/adapters/publer/types";

/**
 * Metrics Fetch Schedule
 */
export interface MetricsFetchSchedule {
  post_id: string;
  publer_post_id: string;
  published_at: string; // ISO 8601
  fetch_times: {
    hour_24: string; // ISO 8601
    day_7: string;
    day_14: string;
  };
  fetches_completed: string[]; // Array of completed fetch timestamps
}

/**
 * Fetch Post Metrics from Publer
 *
 * Retrieves analytics for specified post.
 *
 * @param publer_post_id - Publer post ID
 * @returns Performance metrics
 */
export async function fetchPostMetrics(
  publer_post_id: string,
): Promise<PublerPostMetrics> {
  const publer = getPublerClient();
  return await publer.getPostMetrics(publer_post_id);
}

/**
 * Store Metrics in Supabase
 *
 * PLACEHOLDER: Inserts metrics into content_performance table.
 *
 * @param metrics - Publer metrics
 * @param approval_id - Link to approval
 */
export async function storeMetrics(
  metrics: PublerPostMetrics,
  approval_id?: string,
): Promise<void> {
  // TODO: INSERT INTO content_performance

  console.log("[PLACEHOLDER] storeMetrics:", {
    post_id: metrics.post_id,
    platform: metrics.platform,
    engagement_rate: metrics.engagement_rate,
    approval_id,
  });
}

/**
 * Schedule Metrics Fetches for Post
 *
 * Creates fetch schedule: 24h, 7d, 14d post-publish.
 *
 * @param post_id - Internal post ID
 * @param publer_post_id - Publer API post ID
 * @param published_at - Publish timestamp
 * @returns Fetch schedule
 */
export function scheduleMetricsFetches(
  post_id: string,
  publer_post_id: string,
  published_at: string,
): MetricsFetchSchedule {
  const pubDate = new Date(published_at);

  return {
    post_id,
    publer_post_id,
    published_at,
    fetch_times: {
      hour_24: new Date(pubDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      day_7: new Date(
        pubDate.getTime() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      day_14: new Date(
        pubDate.getTime() + 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    fetches_completed: [],
  };
}

/**
 * Process Scheduled Fetch
 *
 * Runs on cron: fetch metrics → store in DB → analyze performance.
 *
 * @param schedule - Fetch schedule
 * @param fetch_type - Which checkpoint (24h/7d/14d)
 */
export async function processScheduledFetch(
  schedule: MetricsFetchSchedule,
  fetch_type: "hour_24" | "day_7" | "day_14",
): Promise<void> {
  try {
    // Fetch from Publer
    const metrics = await fetchPostMetrics(schedule.publer_post_id);

    // Store in Supabase
    await storeMetrics(metrics);

    // Mark fetch as completed
    schedule.fetches_completed.push(new Date().toISOString());

    console.log(
      `[METRICS FETCH] ${fetch_type} complete for ${schedule.post_id}`,
    );
  } catch (error) {
    console.error(`[METRICS FETCH] Failed for ${schedule.post_id}:`, error);
  }
}
