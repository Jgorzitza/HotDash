#!/usr/bin/env node
/**
 * Snapshot Comparison Tool
 *
 * Compares daily analytics snapshots to detect anomalies and trends.
 * Useful for automated monitoring and CEO alerts.
 *
 * Usage:
 *   node scripts/analytics/compare-snapshots.mjs [options]
 *
 * Options:
 *   --date1=YYYY-MM-DD  First snapshot date (default: yesterday)
 *   --date2=YYYY-MM-DD  Second snapshot date (default: today)
 *   --threshold=N       Anomaly threshold % (default: 25)
 *   --output=PATH       Output comparison report path
 *
 * Examples:
 *   node scripts/analytics/compare-snapshots.mjs
 *   node scripts/analytics/compare-snapshots.mjs --date1=2025-10-18 --date2=2025-10-19
 *   node scripts/analytics/compare-snapshots.mjs --threshold=50
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

function getDateArg(arg, defaultDate) {
  const value = args.find((a) => a.startsWith(`--${arg}=`))?.split("=")[1];
  return value || defaultDate;
}

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const date1 = getDateArg("date1", yesterday.toISOString().split("T")[0]);
const date2 = getDateArg("date2", today.toISOString().split("T")[0]);
const threshold = parseInt(
  args.find((a) => a.startsWith("--threshold="))?.split("=")[1] || "25",
  10,
);
const outputArg = args.find((a) => a.startsWith("--output="))?.split("=")[1];

const snapshotsDir = join(__dirname, "../../artifacts/analytics/snapshots");
const defaultOutput = join(
  __dirname,
  "../../artifacts/analytics/comparisons",
  `comparison-${date1}-to-${date2}.json`,
);
const outputPath = outputArg || defaultOutput;

// ============================================================================
// Comparison Logic
// ============================================================================

/**
 * Calculate percentage change between two values
 */
function percentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Determine if change exceeds threshold
 */
function isAnomaly(change, threshold) {
  return Math.abs(change) > threshold;
}

/**
 * Compare two snapshots and generate report
 */
function compareSnapshots(snapshot1, snapshot2, threshold) {
  const comparison = {
    date1: snapshot1.date,
    date2: snapshot2.date,
    threshold: threshold,
    timestamp: new Date().toISOString(),
    metrics: {},
    anomalies: [],
    summary: {
      totalChanges: 0,
      anomaliesDetected: 0,
      overallStatus: "normal",
    },
  };

  // Compare revenue metrics
  if (snapshot1.metrics.revenue && snapshot2.metrics.revenue) {
    const rev1 = snapshot1.metrics.revenue;
    const rev2 = snapshot2.metrics.revenue;
    const revenueChange = percentageChange(
      rev2.totalRevenue,
      rev1.totalRevenue,
    );
    const aovChange = percentageChange(
      rev2.averageOrderValue,
      rev1.averageOrderValue,
    );
    const transactionsChange = percentageChange(
      rev2.transactions,
      rev1.transactions,
    );

    comparison.metrics.revenue = {
      totalRevenue: {
        previous: rev1.totalRevenue,
        current: rev2.totalRevenue,
        change: revenueChange,
        isAnomaly: isAnomaly(revenueChange, threshold),
      },
      averageOrderValue: {
        previous: rev1.averageOrderValue,
        current: rev2.averageOrderValue,
        change: aovChange,
        isAnomaly: isAnomaly(aovChange, threshold),
      },
      transactions: {
        previous: rev1.transactions,
        current: rev2.transactions,
        change: transactionsChange,
        isAnomaly: isAnomaly(transactionsChange, threshold),
      },
    };

    comparison.summary.totalChanges += 3;
    if (isAnomaly(revenueChange, threshold)) {
      comparison.anomalies.push({
        metric: "Revenue",
        change: revenueChange,
        threshold: threshold,
        severity: Math.abs(revenueChange) > threshold * 2 ? "critical" : "warning",
      });
      comparison.summary.anomaliesDetected++;
    }
    if (isAnomaly(aovChange, threshold)) {
      comparison.anomalies.push({
        metric: "Average Order Value",
        change: aovChange,
        threshold: threshold,
        severity: Math.abs(aovChange) > threshold * 2 ? "critical" : "warning",
      });
      comparison.summary.anomaliesDetected++;
    }
  }

  // Compare conversion metrics
  if (snapshot1.metrics.conversion && snapshot2.metrics.conversion) {
    const conv1 = snapshot1.metrics.conversion;
    const conv2 = snapshot2.metrics.conversion;
    const conversionChange = percentageChange(
      conv2.conversionRate,
      conv1.conversionRate,
    );

    comparison.metrics.conversion = {
      conversionRate: {
        previous: conv1.conversionRate,
        current: conv2.conversionRate,
        change: conversionChange,
        isAnomaly: isAnomaly(conversionChange, threshold),
      },
    };

    comparison.summary.totalChanges += 1;
    if (isAnomaly(conversionChange, threshold)) {
      comparison.anomalies.push({
        metric: "Conversion Rate",
        change: conversionChange,
        threshold: threshold,
        severity: Math.abs(conversionChange) > threshold * 2 ? "critical" : "warning",
      });
      comparison.summary.anomaliesDetected++;
    }
  }

  // Compare traffic metrics
  if (snapshot1.metrics.traffic && snapshot2.metrics.traffic) {
    const traffic1 = snapshot1.metrics.traffic;
    const traffic2 = snapshot2.metrics.traffic;
    const sessionsChange = percentageChange(
      traffic2.totalSessions,
      traffic1.totalSessions,
    );
    const organicChange = percentageChange(
      traffic2.organicSessions,
      traffic1.organicSessions,
    );

    comparison.metrics.traffic = {
      totalSessions: {
        previous: traffic1.totalSessions,
        current: traffic2.totalSessions,
        change: sessionsChange,
        isAnomaly: isAnomaly(sessionsChange, threshold),
      },
      organicSessions: {
        previous: traffic1.organicSessions,
        current: traffic2.organicSessions,
        change: organicChange,
        isAnomaly: isAnomaly(organicChange, threshold),
      },
    };

    comparison.summary.totalChanges += 2;
    if (isAnomaly(sessionsChange, threshold)) {
      comparison.anomalies.push({
        metric: "Total Sessions",
        change: sessionsChange,
        threshold: threshold,
        severity: Math.abs(sessionsChange) > threshold * 2 ? "critical" : "warning",
      });
      comparison.summary.anomaliesDetected++;
    }
  }

  // Compare idea pool metrics
  if (snapshot1.metrics.ideaPool && snapshot2.metrics.ideaPool) {
    const ideas1 = snapshot1.metrics.ideaPool;
    const ideas2 = snapshot2.metrics.ideaPool;

    comparison.metrics.ideaPool = {
      pending: {
        previous: ideas1.totals?.pending || 0,
        current: ideas2.totals?.pending || 0,
        change: (ideas2.totals?.pending || 0) - (ideas1.totals?.pending || 0),
      },
      approved: {
        previous: ideas1.totals?.approved || 0,
        current: ideas2.totals?.approved || 0,
        change: (ideas2.totals?.approved || 0) - (ideas1.totals?.approved || 0),
      },
    };
  }

  // Determine overall status
  if (comparison.summary.anomaliesDetected > 0) {
    const criticalAnomalies = comparison.anomalies.filter(
      (a) => a.severity === "critical",
    );
    comparison.summary.overallStatus =
      criticalAnomalies.length > 0 ? "critical" : "warning";
  }

  return comparison;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("Analytics Snapshot Comparison");
  console.log("=".repeat(60));
  console.log(`Date 1: ${date1}`);
  console.log(`Date 2: ${date2}`);
  console.log(`Threshold: ${threshold}%`);
  console.log("");

  try {
    // Load snapshots
    const snapshot1Path = join(snapshotsDir, `${date1}.json`);
    const snapshot2Path = join(snapshotsDir, `${date2}.json`);

    console.log(`Loading ${snapshot1Path}...`);
    const snapshot1 = JSON.parse(await fs.readFile(snapshot1Path, "utf-8"));

    console.log(`Loading ${snapshot2Path}...`);
    const snapshot2 = JSON.parse(await fs.readFile(snapshot2Path, "utf-8"));

    // Compare
    console.log("Comparing snapshots...");
    const comparison = compareSnapshots(snapshot1, snapshot2, threshold);

    // Save comparison report
    await fs.mkdir(dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(comparison, null, 2));

    // Print summary
    console.log("");
    console.log("=".repeat(60));
    console.log("COMPARISON SUMMARY");
    console.log("=".repeat(60));
    console.log(`Status: ${comparison.summary.overallStatus.toUpperCase()}`);
    console.log(`Total Changes Analyzed: ${comparison.summary.totalChanges}`);
    console.log(`Anomalies Detected: ${comparison.summary.anomaliesDetected}`);

    if (comparison.anomalies.length > 0) {
      console.log("");
      console.log("Anomalies:");
      comparison.anomalies.forEach((anomaly, i) => {
        console.log(
          `  ${i + 1}. ${anomaly.metric}: ${anomaly.change > 0 ? "+" : ""}${anomaly.change.toFixed(1)}% (${anomaly.severity})`,
        );
      });
    }

    console.log("");
    console.log(`Report saved to: ${outputPath}`);
    console.log("=".repeat(60));

    // Exit with appropriate code
    if (comparison.summary.overallStatus === "critical") {
      process.exit(2);
    } else if (comparison.summary.overallStatus === "warning") {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("Comparison failed:", error.message);
    process.exit(3);
  }
}

main();

