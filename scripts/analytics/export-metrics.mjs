#!/usr/bin/env node
/**
 * Analytics Metrics Export Utility
 *
 * Exports analytics metrics to CSV or JSON for CEO review and manual analysis.
 *
 * Usage:
 *   node scripts/analytics/export-metrics.mjs [options]
 *
 * Options:
 *   --format=csv|json  Output format (default: json)
 *   --output=PATH      Output file path (default: artifacts/analytics/exports/metrics-YYYYMMDD.{csv|json})
 *   --metrics=LIST     Comma-separated metrics to export (default: all)
 *                      Options: revenue,conversion,traffic,ideas
 *
 * Examples:
 *   node scripts/analytics/export-metrics.mjs --format=csv
 *   node scripts/analytics/export-metrics.mjs --format=json --metrics=revenue,conversion
 */

import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const args = process.argv.slice(2);
const format = args.find((a) => a.startsWith("--format="))?.split("=")[1] || "json";
const outputArg = args.find((a) => a.startsWith("--output="))?.split("=")[1];
const metricsArg = args.find((a) => a.startsWith("--metrics="))?.split("=")[1];

const requestedMetrics = metricsArg
  ? metricsArg.split(",").map((m) => m.trim())
  : ["revenue", "conversion", "traffic", "ideas"];

const defaultOutputDir = join(__dirname, "../../artifacts/analytics/exports");
const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
const defaultOutputFile = join(
  defaultOutputDir,
  `metrics-${date}.${format === "csv" ? "csv" : "json"}`,
);
const outputFile = outputArg || defaultOutputFile;

// ============================================================================
// Mock Data Fetching (replace with real API calls when available)
// ============================================================================

async function fetchRevenue() {
  return {
    metric: "revenue",
    revenue: 12500,
    period: "2024-09-19 to 2024-10-19",
    change: 5.9,
    currency: "USD",
    previousRevenue: 11800,
    timestamp: new Date().toISOString(),
  };
}

async function fetchConversion() {
  return {
    metric: "conversion",
    conversionRate: 2.8,
    period: "2024-09-19 to 2024-10-19",
    change: 7.7,
    previousConversionRate: 2.6,
    timestamp: new Date().toISOString(),
  };
}

async function fetchTraffic() {
  return {
    metric: "traffic",
    sessions: 5214,
    users: 3911,
    pageviews: 13035,
    period: "2024-09-19 to 2024-10-19",
    bounceRate: 45.2,
    avgSessionDuration: 145,
    previousSessions: 5500,
    previousUsers: 4125,
    previousPageviews: 13750,
    timestamp: new Date().toISOString(),
  };
}

async function fetchIdeas() {
  return {
    metric: "ideas",
    pending: 1,
    approved: 1,
    rejected: 0,
    total: 2,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Convert metrics to CSV format
 */
function toCSV(metrics) {
  const rows = [];

  // Header
  const headers = [
    "metric",
    "timestamp",
    "period",
    "value",
    "previousValue",
    "change",
    "unit",
  ];
  rows.push(headers.join(","));

  // Data rows
  for (const metric of metrics) {
    if (metric.metric === "revenue") {
      rows.push(
        [
          "revenue",
          metric.timestamp,
          metric.period,
          metric.revenue,
          metric.previousRevenue,
          metric.change,
          metric.currency,
        ].join(","),
      );
    } else if (metric.metric === "conversion") {
      rows.push(
        [
          "conversion_rate",
          metric.timestamp,
          metric.period,
          metric.conversionRate,
          metric.previousConversionRate,
          metric.change,
          "%",
        ].join(","),
      );
    } else if (metric.metric === "traffic") {
      rows.push(
        [
          "sessions",
          metric.timestamp,
          metric.period,
          metric.sessions,
          metric.previousSessions,
          ((metric.sessions - metric.previousSessions) / metric.previousSessions * 100).toFixed(2),
          "count",
        ].join(","),
      );
      rows.push(
        [
          "users",
          metric.timestamp,
          metric.period,
          metric.users,
          metric.previousUsers,
          ((metric.users - metric.previousUsers) / metric.previousUsers * 100).toFixed(2),
          "count",
        ].join(","),
      );
      rows.push(
        [
          "pageviews",
          metric.timestamp,
          metric.period,
          metric.pageviews,
          metric.previousPageviews,
          ((metric.pageviews - metric.previousPageviews) / metric.previousPageviews * 100).toFixed(2),
          "count",
        ].join(","),
      );
      rows.push(
        [
          "bounce_rate",
          metric.timestamp,
          metric.period,
          metric.bounceRate,
          "",
          "",
          "%",
        ].join(","),
      );
      rows.push(
        [
          "avg_session_duration",
          metric.timestamp,
          metric.period,
          metric.avgSessionDuration,
          "",
          "",
          "seconds",
        ].join(","),
      );
    } else if (metric.metric === "ideas") {
      rows.push(
        [
          "ideas_pending",
          metric.timestamp,
          "",
          metric.pending,
          "",
          "",
          "count",
        ].join(","),
      );
      rows.push(
        [
          "ideas_approved",
          metric.timestamp,
          "",
          metric.approved,
          "",
          "",
          "count",
        ].join(","),
      );
      rows.push(
        [
          "ideas_rejected",
          metric.timestamp,
          "",
          metric.rejected,
          "",
          "",
          "count",
        ].join(","),
      );
    }
  }

  return rows.join("\n");
}

/**
 * Convert metrics to JSON format
 */
function toJSON(metrics) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      format: "json",
      metrics,
    },
    null,
    2,
  );
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("Analytics Metrics Export");
  console.log("=".repeat(60));
  console.log(`Format: ${format.toUpperCase()}`);
  console.log(`Metrics: ${requestedMetrics.join(", ")}`);
  console.log(`Output: ${outputFile}`);
  console.log("");

  try {
    // Fetch requested metrics
    const metrics = [];

    if (requestedMetrics.includes("revenue")) {
      console.log("Fetching revenue metrics...");
      metrics.push(await fetchRevenue());
    }

    if (requestedMetrics.includes("conversion")) {
      console.log("Fetching conversion metrics...");
      metrics.push(await fetchConversion());
    }

    if (requestedMetrics.includes("traffic")) {
      console.log("Fetching traffic metrics...");
      metrics.push(await fetchTraffic());
    }

    if (requestedMetrics.includes("ideas")) {
      console.log("Fetching idea pool metrics...");
      metrics.push(await fetchIdeas());
    }

    // Convert to requested format
    let output;
    if (format === "csv") {
      output = toCSV(metrics);
    } else {
      output = toJSON(metrics);
    }

    // Ensure output directory exists
    await fs.mkdir(dirname(outputFile), { recursive: true });

    // Write to file
    await fs.writeFile(outputFile, output);

    console.log("");
    console.log("=".repeat(60));
    console.log("EXPORT COMPLETE");
    console.log("=".repeat(60));
    console.log(`File: ${outputFile}`);
    console.log(`Size: ${output.length} bytes`);
    console.log(`Metrics: ${metrics.length} categories exported`);
    console.log("=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("Export failed:", error);
    process.exit(1);
  }
}

main();

