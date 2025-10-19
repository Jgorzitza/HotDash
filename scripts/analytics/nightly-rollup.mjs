#!/usr/bin/env node
/**
 * Nightly Analytics Rollup
 *
 * Aggregates daily analytics data from GA4 and Shopify and stores in Supabase.
 * Table: analytics_metrics_daily
 *
 * Usage:
 *   node scripts/analytics/nightly-rollup.mjs [--date=YYYY-MM-DD]
 *
 * Scheduled via cron:
 *   0 4 * * * node /path/to/hot-dash/scripts/analytics/nightly-rollup.mjs
 */

import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import pg from "pg";
const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const args = process.argv.slice(2);
const targetDate =
  args.find((a) => a.startsWith("--date="))?.split("=")[1] ||
  new Date(Date.now() - 86400000).toISOString().split("T")[0]; // Yesterday

// Set credentials from vault
process.env.GOOGLE_APPLICATION_CREDENTIALS =
  "/home/justin/HotDash/hot-dash/vault/occ/google/analytics-service-account.json";

const GA_PROPERTY_ID = "339826228";

// Database connection (will be loaded from vault)
let DATABASE_URL = process.env.DATABASE_URL;

// ============================================================================
// GA4 Data Fetching
// ============================================================================

async function fetchGA4DailyMetrics(date) {
  console.log(`Fetching GA4 metrics for ${date}...`);

  const analyticsDataClient = new BetaAnalyticsDataClient();

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${GA_PROPERTY_ID}`,
    dateRanges: [
      {
        startDate: date,
        endDate: date,
      },
    ],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "screenPageViews" },
      { name: "transactions" },
      { name: "totalRevenue" },
      { name: "engagementRate" },
      { name: "bounceRate" },
    ],
  });

  const row = response.rows?.[0];

  return {
    sessions: parseInt(row?.metricValues?.[0]?.value || "0", 10),
    users: parseInt(row?.metricValues?.[1]?.value || "0", 10),
    pageviews: parseInt(row?.metricValues?.[2]?.value || "0", 10),
    transactions: parseInt(row?.metricValues?.[3]?.value || "0", 10),
    revenue: parseFloat(row?.metricValues?.[4]?.value || "0"),
    engagementRate: parseFloat(row?.metricValues?.[5]?.value || "0"),
    bounceRate: parseFloat(row?.metricValues?.[6]?.value || "0"),
  };
}

// ============================================================================
// Database Operations
// ============================================================================

async function connectToDatabase() {
  // Load database URL from vault if not in env
  if (!DATABASE_URL) {
    const vaultPath =
      "/home/justin/HotDash/hot-dash/vault/occ/supabase/database_url_staging.env";
    const content = await fs.readFile(vaultPath, "utf-8");
    const match = content.match(/DATABASE_URL=(.+)/);
    if (match) {
      DATABASE_URL = match[1].trim();
    } else {
      throw new Error("DATABASE_URL not found in vault");
    }
  }

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  await client.connect();
  return client;
}

async function storeMetrics(client, date, metrics) {
  console.log(`Storing metrics for ${date}...`);

  const query = `
    INSERT INTO analytics_metrics_daily (
      date,
      sessions,
      users,
      pageviews,
      transactions,
      revenue,
      engagement_rate,
      bounce_rate,
      conversion_rate,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
    )
    ON CONFLICT (date) 
    DO UPDATE SET
      sessions = EXCLUDED.sessions,
      users = EXCLUDED.users,
      pageviews = EXCLUDED.pageviews,
      transactions = EXCLUDED.transactions,
      revenue = EXCLUDED.revenue,
      engagement_rate = EXCLUDED.engagement_rate,
      bounce_rate = EXCLUDED.bounce_rate,
      conversion_rate = EXCLUDED.conversion_rate,
      updated_at = NOW()
  `;

  const conversionRate =
    metrics.sessions > 0 ? (metrics.transactions / metrics.sessions) * 100 : 0;

  const values = [
    date,
    metrics.sessions,
    metrics.users,
    metrics.pageviews,
    metrics.transactions,
    metrics.revenue,
    metrics.engagementRate,
    metrics.bounceRate,
    conversionRate,
  ];

  try {
    await client.query(query, values);
    console.log("✓ Metrics stored successfully");
  } catch (error) {
    // Table might not exist yet
    console.warn("⚠ Failed to store metrics (table might not exist yet):", error.message);
    console.log("Note: Run migrations first to create analytics_metrics_daily table");
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("Analytics Nightly Rollup");
  console.log("=".repeat(60));
  console.log(`Date: ${targetDate}`);
  console.log("");

  let dbClient;

  try {
    // Fetch GA4 metrics
    const metrics = await fetchGA4DailyMetrics(targetDate);

    console.log("\nMetrics fetched:");
    console.log(`  Sessions: ${metrics.sessions}`);
    console.log(`  Users: ${metrics.users}`);
    console.log(`  Pageviews: ${metrics.pageviews}`);
    console.log(`  Transactions: ${metrics.transactions}`);
    console.log(`  Revenue: $${metrics.revenue.toFixed(2)}`);
    console.log(`  Engagement Rate: ${metrics.engagementRate.toFixed(2)}%`);
    console.log(`  Bounce Rate: ${metrics.bounceRate.toFixed(2)}%`);

    // Connect to database
    console.log("\nConnecting to Supabase...");
    dbClient = await connectToDatabase();

    // Store in database
    await storeMetrics(dbClient, targetDate, metrics);

    console.log("");
    console.log("=".repeat(60));
    console.log("ROLLUP COMPLETE");
    console.log("=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("\nRollup failed:", error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}

main();

