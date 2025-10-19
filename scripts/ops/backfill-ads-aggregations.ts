/**
 * Ads Aggregations Backfill
 *
 * This script coordinates refreshing the Supabase materialized views / RPCs
 * that power the Ads dashboard slices. When Supabase credentials are not
 * present (common in local CI sandboxes), the script exits gracefully so that
 * downstream automation can continue to run in mock mode.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../../app/config/supabase.server";

type BackfillResult = {
  name: string;
  success: boolean;
  message: string;
};

const DEFAULT_OPERATIONS = [
  // Slice A is already hydrated via daily ingestion; include for completeness.
  "ads_slice_a_refresh",
  // Slice B pacing rollup (see docs/specs for Supabase view ownership).
  "ads_slice_b_rollup_refresh",
  // Slice C attribution helpers.
  "ads_slice_c_refresh",
];

async function run(): Promise<number> {
  const config = getSupabaseConfig();
  if (!config) {
    console.info(
      "[ads-backfill] Supabase credentials missing; skipping remote backfill and leaving mock data in place.",
    );
    return 0;
  }

  const operations = process.env.ADS_BACKFILL_OPERATIONS
    ? process.env.ADS_BACKFILL_OPERATIONS.split(",").map((op) => op.trim())
    : DEFAULT_OPERATIONS;

  if (operations.length === 0) {
    console.info(
      "[ads-backfill] No operations configured; nothing to do. Set ADS_BACKFILL_OPERATIONS to run specific RPCs.",
    );
    return 0;
  }

  const client = createClient(config.url, config.serviceKey, {
    auth: { persistSession: false },
  });

  const results: BackfillResult[] = [];

  for (const name of operations) {
    if (!name) continue;
    console.info(`[ads-backfill] Running Supabase RPC "${name}"...`);
    try {
      const { error } = await client.rpc(name);
      if (error) {
        const message = error.message ?? "Unknown Supabase error";
        console.error(
          `[ads-backfill] RPC "${name}" failed: ${message}.` +
            " See docs/specs/ads_pipeline.md for required migrations.",
        );
        results.push({ name, success: false, message });
        continue;
      }

      results.push({
        name,
        success: true,
        message: "Completed successfully",
      });
      console.info(`[ads-backfill] RPC "${name}" completed successfully.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "unknown");
      console.error(
        `[ads-backfill] RPC "${name}" threw an unexpected error: ${message}`,
      );
      results.push({ name, success: false, message });
    }
  }

  const failed = results.filter((result) => !result.success);
  if (failed.length > 0) {
    console.error(
      `[ads-backfill] ${failed.length} operation(s) failed: ${failed
        .map((result) => `${result.name} (${result.message})`)
        .join(", ")}`,
    );
    return 1;
  }

  console.info("[ads-backfill] All configured operations completed.");
  return 0;
}

run()
  .then((code) => {
    if (code !== 0) {
      process.exitCode = code;
    }
  })
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ads-backfill] Fatal error: ${message}`);
    process.exitCode = 1;
  });
