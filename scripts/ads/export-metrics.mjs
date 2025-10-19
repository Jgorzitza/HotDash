#!/usr/bin/env node

/**
 * Metrics Export CLI Tool
 *
 * Export campaign metrics to CSV
 *
 * Usage: node scripts/ads/export-metrics.mjs [--start YYYY-MM-DD] [--end YYYY-MM-DD] [--output file.csv]
 */

import { writeFileSync } from "fs";
import { listCampaigns } from "../../app/services/ads/campaign.service.ts";
import { getAggregateMetricsByDateRange } from "../../app/services/ads/metrics.service.ts";

const args = process.argv.slice(2);
const startDate =
  args.find((arg) => arg.startsWith("--start="))?.split("=")[1] ||
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
const endDate =
  args.find((arg) => arg.startsWith("--end="))?.split("=")[1] ||
  new Date().toISOString().split("T")[0];
const outputFile =
  args.find((arg) => arg.startsWith("--output="))?.split("=")[1] ||
  `ads-metrics-${startDate}-to-${endDate}.csv`;

console.log("📊 Exporting campaign metrics...");
console.log(`Date range: ${startDate} to ${endDate}`);
console.log(`Output: ${outputFile}\n`);

try {
  // Fetch campaigns
  const { campaigns } = await listCampaigns();

  // Get daily metrics
  const dailyMetrics = await getAggregateMetricsByDateRange(
    campaigns,
    startDate,
    endDate,
  );

  // Generate CSV
  const headers = [
    "Date",
    "Total Spend",
    "Total Revenue",
    "Average ROAS",
    "Average CPC",
    "Total Clicks",
    "Total Impressions",
    "Total Conversions",
    "Campaign Count",
  ];

  const rows = dailyMetrics.map((day) => [
    day.date,
    day.totalSpend.toFixed(2),
    day.totalRevenue.toFixed(2),
    day.averageROAS.toFixed(2),
    day.averageCPC.toFixed(2),
    day.totalClicks,
    day.totalImpressions,
    day.totalConversions,
    day.campaignCount,
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Write to file
  writeFileSync(outputFile, csv);

  console.log(`✅ Exported ${rows.length} days of metrics`);
  console.log(`📁 Saved to: ${outputFile}`);
  process.exit(0);
} catch (error) {
  console.error("❌ Export failed:", error.message);
  process.exit(1);
}

