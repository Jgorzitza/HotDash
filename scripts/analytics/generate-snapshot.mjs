#!/usr/bin/env node
/**
 * Analytics Dashboard Snapshot Generator
 *
 * Captures all dashboard metrics and saves them for historical tracking
 * and nightly review.
 *
 * Usage:
 *   node scripts/analytics/generate-snapshot.mjs
 *
 * Output:
 *   artifacts/analytics/snapshots/YYYY-MM-DD.json
 *
 * Scheduled via cron:
 *   0 3 * * * node /path/to/hot-dash/scripts/analytics/generate-snapshot.mjs
 */

import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  outputDir: join(__dirname, "../../artifacts/analytics/snapshots"),
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:5173",
};

// ============================================================================
// Snapshot Structure
// ============================================================================

const snapshot = {
  timestamp: new Date().toISOString(),
  date: new Date().toISOString().split("T")[0],
  metrics: {
    revenue: null,
    conversion: null,
    traffic: null,
    ideaPool: null,
  },
  summary: {
    totalRevenue: 0,
    conversionRate: 0,
    totalSessions: 0,
    pendingIdeas: 0,
  },
  errors: [],
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fetch metrics from API endpoint
 */
async function fetchMetrics(endpoint) {
  try {
    // For now, use mock data since we're in development mode
    // TODO: Replace with real HTTP fetch when deployed
    console.log(`Fetching ${endpoint}...`);

    // Return mock data based on endpoint
    if (endpoint.includes("revenue")) {
      return {
        success: true,
        data: {
          totalRevenue: 12500,
          averageOrderValue: 85.5,
          transactions: 146,
          trend: { revenueChange: 5.9, aovChange: 3.9, transactionsChange: 2.1 },
          period: { start: "2024-09-19", end: "2024-10-19" },
        },
        timestamp: new Date().toISOString(),
        sampled: false,
      };
    } else if (endpoint.includes("conversion")) {
      return {
        success: true,
        data: {
          conversionRate: 2.8,
          totalConversions: 146,
          totalSessions: 5214,
          trend: {
            conversionRateChange: 7.7,
            sessionsChange: -5.2,
            conversionsChange: 2.1,
          },
          period: { start: "2024-09-19", end: "2024-10-19" },
        },
        timestamp: new Date().toISOString(),
        sampled: false,
      };
    } else if (endpoint.includes("traffic")) {
      return {
        success: true,
        data: {
          totalSessions: 5214,
          organicSessions: 3240,
          organicPercentage: 62.1,
          trend: { sessionsChange: -5.2, organicChange: -5.0 },
          period: { start: "2024-09-19", end: "2024-10-19" },
        },
        timestamp: new Date().toISOString(),
        sampled: false,
      };
    } else if (endpoint.includes("idea-pool")) {
      return {
        success: true,
        data: {
          items: [
            {
              id: "1",
              title: "Hot Rod Fuel Line Kit",
              status: "pending_review",
              rationale: "High demand in forum discussions",
              projectedImpact: "+$2500/month",
              priority: "high",
              confidence: 0.8,
              createdAt: "2024-10-15T10:00:00Z",
              updatedAt: "2024-10-15T10:00:00Z",
            },
          ],
          totals: { pending: 1, approved: 0, rejected: 0 },
        },
        timestamp: new Date().toISOString(),
        source: "mock",
      };
    }

    return { success: false, error: "Unknown endpoint" };
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// Snapshot Generation
// ============================================================================

/**
 * Capture revenue metrics
 */
async function captureRevenue() {
  const data = await fetchMetrics("/api/analytics/revenue");

  if (data.success) {
    snapshot.metrics.revenue = data.data;
    snapshot.summary.totalRevenue = data.data.totalRevenue;
  } else {
    snapshot.errors.push({
      metric: "revenue",
      error: data.error,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Capture conversion metrics
 */
async function captureConversion() {
  const data = await fetchMetrics("/api/analytics/conversion-rate");

  if (data.success) {
    snapshot.metrics.conversion = data.data;
    snapshot.summary.conversionRate = data.data.conversionRate;
  } else {
    snapshot.errors.push({
      metric: "conversion",
      error: data.error,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Capture traffic metrics
 */
async function captureTraffic() {
  const data = await fetchMetrics("/api/analytics/traffic");

  if (data.success) {
    snapshot.metrics.traffic = data.data;
    snapshot.summary.totalSessions = data.data.totalSessions;
  } else {
    snapshot.errors.push({
      metric: "traffic",
      error: data.error,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Capture idea pool metrics
 */
async function captureIdeaPool() {
  const data = await fetchMetrics("/api/analytics/idea-pool");

  if (data.success) {
    snapshot.metrics.ideaPool = data.data;
    snapshot.summary.pendingIdeas = data.data.totals?.pending || 0;
  } else {
    snapshot.errors.push({
      metric: "ideaPool",
      error: data.error,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Calculate AOV from revenue data
 */
function calculateAOV() {
  if (snapshot.metrics.revenue) {
    const { totalRevenue, transactions } = snapshot.metrics.revenue;
    snapshot.summary.averageOrderValue =
      transactions > 0 ? totalRevenue / transactions : 0;
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("Analytics Dashboard Snapshot Generator");
  console.log("=".repeat(60));
  console.log(`Timestamp: ${snapshot.timestamp}`);
  console.log("");

  try {
    // Capture all metrics
    await captureRevenue();
    await captureConversion();
    await captureTraffic();
    await captureIdeaPool();

    // Calculate derived metrics
    calculateAOV();

    // Save snapshot to file
    await saveSnapshot();

    // Print summary
    printSummary();

    // Exit successfully
    process.exit(0);
  } catch (error) {
    console.error("Critical error during snapshot generation:", error);
    snapshot.errors.push({
      metric: "system",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    await saveSnapshot();
    process.exit(1);
  }
}

/**
 * Save snapshot to file
 */
async function saveSnapshot() {
  try {
    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true });

    // Generate filename with date
    const filename = `${snapshot.date}.json`;
    const filepath = join(CONFIG.outputDir, filename);

    // Write snapshot
    await fs.writeFile(filepath, JSON.stringify(snapshot, null, 2));

    console.log(`Snapshot saved to: ${filepath}`);
  } catch (error) {
    console.error("Failed to save snapshot:", error);
    throw error;
  }
}

/**
 * Print summary to console
 */
function printSummary() {
  console.log("");
  console.log("=".repeat(60));
  console.log("SNAPSHOT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Date: ${snapshot.date}`);
  console.log(`Total Revenue: $${snapshot.summary.totalRevenue.toFixed(2)}`);
  console.log(
    `Conversion Rate: ${snapshot.summary.conversionRate.toFixed(2)}%`,
  );
  console.log(`Total Sessions: ${snapshot.summary.totalSessions}`);
  console.log(`Pending Ideas: ${snapshot.summary.pendingIdeas}`);

  if (snapshot.summary.averageOrderValue) {
    console.log(
      `Average Order Value: $${snapshot.summary.averageOrderValue.toFixed(2)}`,
    );
  }

  if (snapshot.errors.length > 0) {
    console.log("");
    console.log("Errors:");
    snapshot.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error.metric}: ${error.error}`);
    });
  }

  console.log("=".repeat(60));
}

// ============================================================================
// Run
// ============================================================================

main();

