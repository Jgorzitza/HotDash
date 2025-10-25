#!/usr/bin/env tsx
/**
 * Nightly Action Attribution Update
 *
 * Cron: 0 2 * * * (2 AM daily)
 *
 * Updates GA4 attribution data for all approved actions and re-ranks
 * the Action Queue based on realized performance.
 *
 * Usage:
 *   npm run script:attribution
 *   OR
 *   tsx scripts/analytics/nightly-action-attribution.ts
 */

import { runNightlyAttributionUpdate } from "~/services/analytics/action-attribution";

async function main() {
  console.log("=".repeat(60));
  console.log("NIGHTLY ACTION ATTRIBUTION UPDATE");
  console.log("=".repeat(60));
  console.log(`Started: ${new Date().toISOString()}`);
  console.log();

  try {
    const result = await runNightlyAttributionUpdate();

    console.log();
    console.log("=".repeat(60));
    console.log("✅ SUCCESS");
    console.log("=".repeat(60));
    console.log(`Actions updated: ${result.actionsUpdated}`);
    console.log(`Duration: ${(result.durationMs / 60000).toFixed(2)} minutes`);
    console.log(`Completed: ${new Date().toISOString()}`);
    console.log();

    process.exit(0);
  } catch (error: any) {
    console.error();
    console.error("=".repeat(60));
    console.error("❌ FAILED");
    console.error("=".repeat(60));
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error();

    process.exit(1);
  }
}

main();
