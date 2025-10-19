#!/usr/bin/env node

/**
 * Campaign Sync CLI Tool
 *
 * Manually sync campaign data from ad platforms
 *
 * Usage: node scripts/ads/sync-campaigns.mjs [--platform meta|google] [--date YYYY-MM-DD]
 */

import { syncAllCampaigns, syncPlatformCampaigns } from "../../app/services/ads/sync.service.ts";

const args = process.argv.slice(2);
const platform = args.find((arg) => arg.startsWith("--platform="))?.split("=")[1];
const date = args.find((arg) => arg.startsWith("--date="))?.split("=")[1];

console.log("🔄 Syncing campaigns...");
console.log(`Platform: ${platform || "all"}`);
console.log(`Date: ${date || "today"}\n`);

try {
  let result;

  if (platform === "meta" || platform === "google") {
    result = await syncPlatformCampaigns(platform, date);
  } else {
    result = await syncAllCampaigns(date);
  }

  console.log("✅ Sync complete!");
  console.log(`Synced: ${result.synced} campaigns`);
  console.log(`Stored: ${result.stored} snapshots`);
  console.log(`Failed: ${result.failed}`);
  console.log(`Duration: ${result.duration}ms`);

  if (result.errors.length > 0) {
    console.log("\n❌ Errors:");
    result.errors.forEach((error) => console.log(`  - ${error}`));
  }

  process.exit(result.success ? 0 : 1);
} catch (error) {
  console.error("❌ Sync failed:", error.message);
  process.exit(1);
}

