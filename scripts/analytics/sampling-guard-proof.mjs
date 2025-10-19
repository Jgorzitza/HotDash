#!/usr/bin/env node
/**
 * Analytics Sampling Guard Proof Script
 *
 * Runs nightly to verify analytics data quality and detect anomalies.
 * Generates proof output for leadership review.
 *
 * Usage:
 *   node scripts/analytics/sampling-guard-proof.mjs
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - Anomalies detected (requires review)
 *   2 - Critical errors (data integrity compromised)
 *
 * Scheduled via cron:
 *   0 2 * * * node /path/to/hot-dash/scripts/analytics/sampling-guard-proof.mjs
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
  // Expected ranges for metrics (based on historical data)
  expectedRanges: {
    revenue: { min: 5000, max: 50000 }, // Last 30 days
    conversionRate: { min: 0.5, max: 10 }, // Percentage
    sessions: { min: 1000, max: 20000 }, // Last 30 days
    returnRate: { min: 0, max: 15 }, // Percentage
  },

  // Anomaly thresholds (percentage change vs previous period)
  anomalyThresholds: {
    revenueChange: 50, // ±50% is anomalous
    conversionRateChange: 100, // ±100% is anomalous
    sessionsChange: 75, // ±75% is anomalous
  },

  // Output directory for proof artifacts
  outputDir: join(__dirname, "../../artifacts/analytics/sampling-proofs"),
};

// ============================================================================
// Proof Output
// ============================================================================

const proofOutput = {
  timestamp: new Date().toISOString(),
  status: "PENDING",
  checks: [],
  anomalies: [],
  summary: {
    totalChecks: 0,
    passed: 0,
    warnings: 0,
    failures: 0,
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Add a check result to proof output
 */
function addCheck(name, status, value, expected, message) {
  const check = {
    name,
    status, // "PASS" | "WARN" | "FAIL"
    value,
    expected,
    message,
    timestamp: new Date().toISOString(),
  };

  proofOutput.checks.push(check);
  proofOutput.summary.totalChecks++;

  if (status === "PASS") proofOutput.summary.passed++;
  else if (status === "WARN") proofOutput.summary.warnings++;
  else if (status === "FAIL") proofOutput.summary.failures++;

  return check;
}

/**
 * Add an anomaly to proof output
 */
function addAnomaly(metric, current, previous, change, threshold) {
  const anomaly = {
    metric,
    currentValue: current,
    previousValue: previous,
    changePercent: change,
    threshold,
    severity:
      Math.abs(change) > threshold * 2
        ? "CRITICAL"
        : Math.abs(change) > threshold
          ? "WARNING"
          : "INFO",
    timestamp: new Date().toISOString(),
  };

  proofOutput.anomalies.push(anomaly);
  return anomaly;
}

/**
 * Check if value is within expected range
 */
function isInRange(value, range) {
  return value >= range.min && value <= range.max;
}

/**
 * Calculate percentage change
 */
function percentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// ============================================================================
// Mock Data Fetching (Replace with real API calls when ready)
// ============================================================================

/**
 * Fetch revenue metrics
 * TODO: Replace with real API call to /api/analytics/revenue
 */
async function fetchRevenueMetrics() {
  // Mock data for now
  return {
    current: {
      totalRevenue: 12500,
      averageOrderValue: 85.5,
      transactions: 146,
    },
    previous: {
      totalRevenue: 11800,
      averageOrderValue: 82.3,
      transactions: 143,
    },
  };
}

/**
 * Fetch conversion metrics
 * TODO: Replace with real API call to /api/analytics/conversion-rate
 */
async function fetchConversionMetrics() {
  // Mock data for now
  return {
    current: {
      conversionRate: 2.8,
      transactions: 146,
      sessions: 5214,
    },
    previous: {
      conversionRate: 2.6,
      transactions: 143,
      sessions: 5500,
    },
  };
}

/**
 * Fetch traffic metrics
 * TODO: Replace with real API call to /api/analytics/traffic
 */
async function fetchTrafficMetrics() {
  // Mock data for now
  return {
    current: {
      totalSessions: 5214,
      organicSessions: 3240,
      organicPercentage: 62.1,
    },
    previous: {
      totalSessions: 5500,
      organicSessions: 3410,
      organicPercentage: 62.0,
    },
  };
}

// ============================================================================
// Sampling Checks
// ============================================================================

/**
 * Check revenue metrics for anomalies and sampling issues
 */
async function checkRevenue() {
  console.log("Checking revenue metrics...");

  const data = await fetchRevenueMetrics();
  const { totalRevenue } = data.current;
  const range = CONFIG.expectedRanges.revenue;

  // Range check
  if (isInRange(totalRevenue, range)) {
    addCheck(
      "Revenue Range",
      "PASS",
      totalRevenue,
      `${range.min}-${range.max}`,
      "Revenue within expected range",
    );
  } else {
    addCheck(
      "Revenue Range",
      totalRevenue < range.min ? "WARN" : "FAIL",
      totalRevenue,
      `${range.min}-${range.max}`,
      `Revenue outside expected range (${totalRevenue < range.min ? "too low" : "too high"})`,
    );
  }

  // Trend check
  const change = percentageChange(
    data.current.totalRevenue,
    data.previous.totalRevenue,
  );
  const threshold = CONFIG.anomalyThresholds.revenueChange;

  if (Math.abs(change) > threshold) {
    addAnomaly(
      "Revenue",
      data.current.totalRevenue,
      data.previous.totalRevenue,
      change,
      threshold,
    );
    addCheck(
      "Revenue Trend",
      Math.abs(change) > threshold * 2 ? "FAIL" : "WARN",
      `${change.toFixed(1)}%`,
      `±${threshold}%`,
      `Revenue change (${change.toFixed(1)}%) exceeds threshold`,
    );
  } else {
    addCheck(
      "Revenue Trend",
      "PASS",
      `${change.toFixed(1)}%`,
      `±${threshold}%`,
      "Revenue trend within normal range",
    );
  }
}

/**
 * Check conversion rate for anomalies
 */
async function checkConversion() {
  console.log("Checking conversion metrics...");

  const data = await fetchConversionMetrics();
  const { conversionRate } = data.current;
  const range = CONFIG.expectedRanges.conversionRate;

  // Range check
  if (isInRange(conversionRate, range)) {
    addCheck(
      "Conversion Rate Range",
      "PASS",
      `${conversionRate}%`,
      `${range.min}-${range.max}%`,
      "Conversion rate within expected range",
    );
  } else {
    addCheck(
      "Conversion Rate Range",
      "WARN",
      `${conversionRate}%`,
      `${range.min}-${range.max}%`,
      "Conversion rate outside expected range",
    );
  }

  // Trend check
  const change = percentageChange(
    data.current.conversionRate,
    data.previous.conversionRate,
  );
  const threshold = CONFIG.anomalyThresholds.conversionRateChange;

  if (Math.abs(change) > threshold) {
    addAnomaly(
      "Conversion Rate",
      data.current.conversionRate,
      data.previous.conversionRate,
      change,
      threshold,
    );
    addCheck(
      "Conversion Rate Trend",
      "WARN",
      `${change.toFixed(1)}%`,
      `±${threshold}%`,
      `Conversion rate change (${change.toFixed(1)}%) exceeds threshold`,
    );
  } else {
    addCheck(
      "Conversion Rate Trend",
      "PASS",
      `${change.toFixed(1)}%`,
      `±${threshold}%`,
      "Conversion rate trend within normal range",
    );
  }
}

/**
 * Check traffic metrics for sampling
 */
async function checkTraffic() {
  console.log("Checking traffic metrics...");

  const data = await fetchTrafficMetrics();
  const { totalSessions } = data.current;
  const range = CONFIG.expectedRanges.sessions;

  // Range check
  if (isInRange(totalSessions, range)) {
    addCheck(
      "Sessions Range",
      "PASS",
      totalSessions,
      `${range.min}-${range.max}`,
      "Sessions within expected range",
    );
  } else {
    addCheck(
      "Sessions Range",
      "WARN",
      totalSessions,
      `${range.min}-${range.max}`,
      "Sessions outside expected range",
    );
  }

  // Trend check
  const change = percentageChange(
    data.current.totalSessions,
    data.previous.totalSessions,
  );
  const threshold = CONFIG.anomalyThresholds.sessionsChange;

  if (Math.abs(change) > threshold) {
    addAnomaly(
      "Sessions",
      data.current.totalSessions,
      data.previous.totalSessions,
      change,
      threshold,
    );
    addCheck(
      "Sessions Trend",
      "WARN",
      `${change.toFixed(1)}%`,
      `±${threshold}%`,
      `Sessions change (${change.toFixed(1)}%) exceeds threshold`,
    );
  } else {
    addCheck(
      "Sessions Trend",
      "PASS",
      `${change.toFixed(1)}%`,
      `±${threshold}%`,
      "Sessions trend within normal range",
    );
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("Analytics Sampling Guard Proof");
  console.log("=".repeat(60));
  console.log(`Timestamp: ${proofOutput.timestamp}`);
  console.log("");

  try {
    // Run all checks
    await checkRevenue();
    await checkConversion();
    await checkTraffic();

    // Determine overall status
    if (proofOutput.summary.failures > 0) {
      proofOutput.status = "FAILED";
    } else if (proofOutput.summary.warnings > 0) {
      proofOutput.status = "WARNING";
    } else {
      proofOutput.status = "PASSED";
    }

    // Save proof output to file
    await saveProofOutput();

    // Print summary
    printSummary();

    // Exit with appropriate code
    if (proofOutput.status === "FAILED") {
      process.exit(2);
    } else if (proofOutput.status === "WARNING") {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("Critical error during sampling guard proof:", error);
    proofOutput.status = "ERROR";
    proofOutput.error = error.message;
    await saveProofOutput();
    process.exit(2);
  }
}

/**
 * Save proof output to file
 */
async function saveProofOutput() {
  try {
    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true });

    // Generate filename with timestamp
    const date = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
    const filename = `sampling-proof-${date}.json`;
    const filepath = join(CONFIG.outputDir, filename);

    // Write proof output
    await fs.writeFile(filepath, JSON.stringify(proofOutput, null, 2));

    console.log("");
    console.log(`Proof output saved to: ${filepath}`);
  } catch (error) {
    console.error("Failed to save proof output:", error);
  }
}

/**
 * Print summary to console
 */
function printSummary() {
  console.log("");
  console.log("=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log(`Status: ${proofOutput.status}`);
  console.log(`Total Checks: ${proofOutput.summary.totalChecks}`);
  console.log(`  Passed: ${proofOutput.summary.passed}`);
  console.log(`  Warnings: ${proofOutput.summary.warnings}`);
  console.log(`  Failures: ${proofOutput.summary.failures}`);

  if (proofOutput.anomalies.length > 0) {
    console.log("");
    console.log("Anomalies Detected:");
    proofOutput.anomalies.forEach((anomaly, i) => {
      console.log(`  ${i + 1}. ${anomaly.metric}`);
      console.log(`     Current: ${anomaly.currentValue}`);
      console.log(`     Previous: ${anomaly.previousValue}`);
      console.log(
        `     Change: ${anomaly.changePercent.toFixed(1)}% (threshold: ±${anomaly.threshold}%)`,
      );
      console.log(`     Severity: ${anomaly.severity}`);
    });
  }

  console.log("=".repeat(60));
}

// ============================================================================
// Run
// ============================================================================

main();

