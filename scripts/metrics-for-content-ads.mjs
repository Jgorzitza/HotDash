#!/usr/bin/env node
/**
 * Analytics Metrics Export for Ads/Content Agents
 *
 * Exports key metrics that Ads and Content agents need for campaign
 * performance analysis, content effectiveness, and ROI calculations.
 *
 * This script provides:
 * 1. Traffic metrics (sessions, pageviews, organic %)
 * 2. Revenue metrics (total revenue, AOV, transactions)
 * 3. Conversion metrics (rate, conversions, goal completions)
 * 4. Return metrics (return rate, refund amounts)
 * 5. Time series data for trend analysis
 *
 * Usage: node scripts/metrics-for-content-ads.mjs [--days=30]
 * Output: artifacts/analytics/for-agents/metrics-for-ads-content-YYYY-MM-DD.json
 */

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Parse command line args
const args = process.argv.slice(2);
const daysArg = args.find((arg) => arg.startsWith("--days="));
const days = daysArg ? parseInt(daysArg.split("=")[1], 10) : 30;

console.log("=" + "=".repeat(60));
console.log("Analytics Metrics Export for Ads/Content Agents");
console.log("=" + "=".repeat(60));
console.log(`Time Period: Last ${days} days`);
console.log("");

/**
 * Generate stub metrics
 * In production, these would come from GA4 API, Shopify API, and Supabase
 */
function generateMetrics() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  // Traffic Metrics (would come from GA4)
  const trafficMetrics = {
    sessions: 8420,
    pageviews: 24680,
    organicSessions: 4210,
    organicPercentage: 50.0,
    averageSessionDuration: 245, // seconds
    bounceRate: 42.3, // percentage
    newUsers: 3680,
    returningUsers: 4740,
  };

  // Revenue Metrics (would come from Shopify/GA4)
  const revenueMetrics = {
    revenue: 28450.75, // $28,450.75
    transactions: 375,
    averageOrderValue: 75.87, // $75.87
    revenuePerSession: 3.38, // $3.38
    transactionsPerSession: 0.045, // 4.5%
  };

  // Conversion Metrics (would come from GA4)
  const conversionMetrics = {
    conversionRate: 4.45, // 4.45% of sessions → transactions
    conversions: 375,
    goalCompletions: 892, // newsletter signups, account creations, etc.
    addToCartRate: 12.8, // 12.8% of sessions add to cart
    checkoutInitiationRate: 7.2, // 7.2% start checkout
  };

  // Return Metrics (would come from Shopify Returns API)
  const returnMetrics = {
    totalReturns: 12,
    returnRate: 3.2, // 3.2% of orders
    totalRefundAmount: 842.5, // $842.50
    averageRefundAmount: 70.21, // $70.21
    topReasons: [
      { reason: "NOT_AS_DESCRIBED", count: 4, percentage: 33.3 },
      { reason: "DEFECTIVE", count: 3, percentage: 25.0 },
      { reason: "DAMAGED", count: 2, percentage: 16.7 },
    ],
  };

  // Content Performance (would come from GA4 + Shopify)
  const contentMetrics = {
    topLandingPages: [
      { page: "/products/hot-rod-accessories", sessions: 1250, conversionRate: 6.2 },
      { page: "/collections/performance-parts", sessions: 980, conversionRate: 5.4 },
      { page: "/", sessions: 3200, conversionRate: 3.1 },
    ],
    topExitPages: [
      { page: "/cart", sessions: 420, exitRate: 48.2 },
      { page: "/products/headers", sessions: 280, exitRate: 52.1 },
    ],
  };

  // Social/Ads Attribution (would come from UTM tracking + GA4)
  const attributionMetrics = {
    utmSources: [
      { source: "facebook", sessions: 840, conversions: 38, revenue: 2890.0 },
      { source: "google", sessions: 1680, conversions: 92, revenue: 6980.0 },
      { source: "instagram", sessions: 520, conversions: 18, revenue: 1360.0 },
      { source: "email", sessions: 1120, conversions: 67, revenue: 5080.0 },
    ],
    totalAdSpend: 4200.0, // $4,200 (would come from ads platforms)
    roas: 3.86, // Return on Ad Spend: $16,310 revenue / $4,200 spend
  };

  // Time Series (daily rollup for last 30 days)
  const timeSeries = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Stub data with some variation
    const variance = 0.8 + Math.random() * 0.4; // 80-120% of average
    timeSeries.push({
      date: dateStr,
      sessions: Math.round((trafficMetrics.sessions / days) * variance),
      revenue: Math.round((revenueMetrics.revenue / days) * variance * 100) / 100,
      transactions: Math.round((revenueMetrics.transactions / days) * variance),
      conversions: Math.round((conversionMetrics.conversions / days) * variance),
    });
  }

  return {
    metadata: {
      generated: today.toISOString(),
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      days,
      mode: "stub", // "stub" until GA4/Shopify APIs are live
      note: "Stub data for development. Set ANALYTICS_REAL_DATA=true for live data.",
    },
    traffic: trafficMetrics,
    revenue: revenueMetrics,
    conversion: conversionMetrics,
    returns: returnMetrics,
    content: contentMetrics,
    attribution: attributionMetrics,
    timeSeries,
  };
}

// Generate metrics
const metrics = generateMetrics();

// Output summary to console
console.log("Summary:");
console.log(`  Sessions: ${metrics.traffic.sessions.toLocaleString()}`);
console.log(`  Revenue: $${metrics.revenue.revenue.toLocaleString()}`);
console.log(`  AOV: $${metrics.revenue.averageOrderValue.toFixed(2)}`);
console.log(`  Conversion Rate: ${metrics.conversion.conversionRate}%`);
console.log(`  Return Rate: ${metrics.returns.returnRate}%`);
console.log(`  ROAS: ${metrics.attribution.roas.toFixed(2)}x`);
console.log("");

// Save to artifact file
const artifactDir = join(rootDir, "artifacts/analytics/for-agents");
if (!mkdirSync(artifactDir, { recursive: true })) {
  // Directory already exists or was created
}

const today = new Date().toISOString().split("T")[0];
const artifactPath = join(artifactDir, `metrics-for-ads-content-${today}.json`);

writeFileSync(artifactPath, JSON.stringify(metrics, null, 2));

console.log(`✅ Metrics exported: ${artifactPath}`);
console.log("");
console.log("=" + "=".repeat(60));
console.log("Agents can use this data for:");
console.log("  - Ads: Campaign ROI, ROAS, attribution analysis");
console.log("  - Content: Landing page optimization, exit page improvements");
console.log("  - Product: Return reasons, defect patterns");
console.log("  - SEO: Organic traffic trends, conversion funnels");
console.log("=" + "=".repeat(60));

