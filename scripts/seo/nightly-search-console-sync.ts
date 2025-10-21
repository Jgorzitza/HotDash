#!/usr/bin/env tsx
/**
 * Nightly Search Console Data Sync
 * 
 * Cron: 0 3 * * * (3 AM daily)
 * 
 * Fetches Search Console data and stores to Supabase for historical tracking:
 * - Site-wide metrics (clicks, impressions, CTR, position)
 * - Top 25 queries
 * - Top 25 landing pages
 * 
 * Usage:
 *   npm run script:search-console-sync
 *   OR
 *   tsx scripts/seo/nightly-search-console-sync.ts
 */

import { storeSearchConsoleSummary } from "~/services/seo/search-console-storage";

async function main() {
  console.log("=".repeat(60));
  console.log("NIGHTLY SEARCH CONSOLE DATA SYNC");
  console.log("=".repeat(60));
  console.log(`Started: ${new Date().toISOString()}`);
  console.log();
  
  try {
    const result = await storeSearchConsoleSummary();
    
    console.log();
    console.log("=".repeat(60));
    console.log("✅ SUCCESS");
    console.log("=".repeat(60));
    console.log(`Metrics: ${result.metrics.clicks} clicks, ${result.metrics.impressions} impressions`);
    console.log(`Queries stored: ${result.queriesCount}`);
    console.log(`Pages stored: ${result.pagesCount}`);
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

