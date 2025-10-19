#!/usr/bin/env node
/**
 * Data Reconciliation Report
 *
 * Compares GA4 revenue data with Shopify order data to detect discrepancies.
 * Helps ensure data accuracy and identify integration issues.
 *
 * Usage:
 *   node scripts/analytics/data-reconciliation.mjs [--date=YYYY-MM-DD]
 */

import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse arguments
const args = process.argv.slice(2);
const dateArg = args.find((a) => a.startsWith("--date="))?.split("=")[1];
const targetDate = dateArg || new Date().toISOString().split("T")[0];

// ============================================================================
// Mock Data (Replace with real API calls)
// ============================================================================

async function fetchGA4Revenue() {
  // TODO: Fetch from GA4 API
  return {
    source: "GA4",
    totalRevenue: 12500,
    transactions: 146,
    period: targetDate,
  };
}

async function fetchShopifyRevenue() {
  // TODO: Fetch from Shopify Admin GraphQL
  return {
    source: "Shopify",
    totalRevenue: 12480, // Slight discrepancy for demo
    transactions: 146,
    period: targetDate,
  };
}

// ============================================================================
// Reconciliation
// ============================================================================

function reconcile(ga4Data, shopifyData) {
  const discrepancy = ga4Data.totalRevenue - shopifyData.totalRevenue;
  const discrepancyPercent = (discrepancy / shopifyData.totalRevenue) * 100;

  const report = {
    date: targetDate,
    timestamp: new Date().toISOString(),
    ga4: ga4Data,
    shopify: shopifyData,
    reconciliation: {
      revenueDifference: discrepancy,
      revenueDifferencePercent: discrepancyPercent,
      transactionsDifference: ga4Data.transactions - shopifyData.transactions,
      status:
        Math.abs(discrepancyPercent) < 1
          ? "MATCHED"
          : Math.abs(discrepancyPercent) < 5
            ? "ACCEPTABLE"
            : "DISCREPANCY",
      notes: [],
    },
  };

  // Add notes based on analysis
  if (Math.abs(discrepancy) > 100) {
    report.reconciliation.notes.push(
      `Revenue difference of $${Math.abs(discrepancy).toFixed(2)} exceeds $100 threshold`,
    );
  }

  if (report.reconciliation.transactionsDifference !== 0) {
    report.reconciliation.notes.push(
      `Transaction count mismatch: ${report.reconciliation.transactionsDifference} difference`,
    );
  }

  return report;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("Analytics Data Reconciliation Report");
  console.log("=".repeat(60));
  console.log(`Date: ${targetDate}`);
  console.log("");

  try {
    const [ga4Data, shopifyData] = await Promise.all([
      fetchGA4Revenue(),
      fetchShopifyRevenue(),
    ]);

    const report = reconcile(ga4Data, shopifyData);

    // Save report
    const outputDir = join(
      __dirname,
      "../../artifacts/analytics/reconciliation",
    );
    await fs.mkdir(outputDir, { recursive: true });
    const outputPath = join(outputDir, `reconciliation-${targetDate}.json`);
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));

    // Print summary
    console.log("GA4 Revenue:", `$${ga4Data.totalRevenue.toFixed(2)}`);
    console.log("Shopify Revenue:", `$${shopifyData.totalRevenue.toFixed(2)}`);
    console.log(
      "Difference:",
      `$${Math.abs(report.reconciliation.revenueDifference).toFixed(2)} (${report.reconciliation.revenueDifferencePercent.toFixed(2)}%)`,
    );
    console.log("Status:", report.reconciliation.status);

    if (report.reconciliation.notes.length > 0) {
      console.log("\nNotes:");
      report.reconciliation.notes.forEach((note) => console.log(`  - ${note}`));
    }

    console.log(`\nReport saved to: ${outputPath}`);

    // Exit code based on status
    if (report.reconciliation.status === "DISCREPANCY") {
      process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    console.error("Reconciliation failed:", error);
    process.exit(2);
  }
}

main();

