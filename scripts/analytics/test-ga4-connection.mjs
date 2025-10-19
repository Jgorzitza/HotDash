#!/usr/bin/env node
/**
 * Test GA4 Data API Connection
 *
 * Verifies GA4 credentials and API access.
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";

async function testConnection() {
  console.log("Testing GA4 Data API Connection");
  console.log("================================");

  // Set credentials
  process.env.GOOGLE_APPLICATION_CREDENTIALS =
    "/home/justin/HotDash/hot-dash/vault/occ/google/analytics-service-account.json";

  const propertyId = "339826228";

  console.log(`Property ID: ${propertyId}`);
  console.log(
    `Credentials: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`,
  );

  try {
    const analyticsDataClient = new BetaAnalyticsDataClient();

    console.log("\nFetching last 7 days of sessions...");

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "7daysAgo",
          endDate: "today",
        },
      ],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
    });

    console.log("\n✅ SUCCESS - GA4 API Connected!");
    console.log(`Sessions: ${response.rows?.[0]?.metricValues?.[0]?.value || 0}`);
    console.log(`Users: ${response.rows?.[0]?.metricValues?.[1]?.value || 0}`);
    console.log(`\nProperty: ${response.propertyQuota?.tokensPerDay?.consumed || "N/A"} tokens consumed today`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ FAILED - GA4 API Connection Error:");
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();

