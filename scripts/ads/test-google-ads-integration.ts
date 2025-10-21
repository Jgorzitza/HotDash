/**
 * Google Ads Integration Test Script
 *
 * Tests all Google Ads API client functions:
 * 1. OAuth authentication
 * 2. Campaign fetching
 * 3. Performance metrics
 * 4. Ad group performance
 * 5. Keyword performance
 * 6. Rate limiting
 *
 * Run: npx tsx scripts/ads/test-google-ads-integration.ts
 *
 * @module scripts/ads/test-google-ads-integration
 */

import { createGoogleAdsClient } from "../../app/services/ads/google-ads-client";

/**
 * Test results tracking
 */
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

/**
 * Run a test with timing and error handling
 */
async function runTest(
  name: string,
  testFn: () => Promise<any>
): Promise<void> {
  const start = Date.now();
  try {
    console.log(`\n🧪 Testing: ${name}...`);
    const data = await testFn();
    const duration = Date.now() - start;
    results.push({ name, passed: true, duration, data });
    console.log(`✅ PASS (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, duration, error: errorMsg });
    console.log(`❌ FAIL (${duration}ms): ${errorMsg}`);
  }
}

/**
 * Main test suite
 */
async function runTests() {
  console.log("🚀 Google Ads Integration Test Suite");
  console.log("=" .repeat(50));

  // Check environment variables
  console.log("\n📋 Checking credentials...");
  const requiredVars = [
    "GOOGLE_ADS_CLIENT_ID",
    "GOOGLE_ADS_CLIENT_SECRET",
    "GOOGLE_ADS_REFRESH_TOKEN",
    "GOOGLE_ADS_DEVELOPER_TOKEN",
    "GOOGLE_ADS_CUSTOMER_IDS",
  ];

  const missingVars = requiredVars.filter((v) => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing environment variables: ${missingVars.join(", ")}`);
    console.log("\nPlease set the following in your .env file:");
    missingVars.forEach((v) => console.log(`  ${v}=your_value_here`));
    process.exit(1);
  }

  console.log("✅ All required environment variables found");

  // Create client
  let client;
  try {
    client = createGoogleAdsClient();
    console.log("✅ Client created successfully");
  } catch (error) {
    console.log(`❌ Failed to create client: ${error}`);
    process.exit(1);
  }

  const customerIds = process.env.GOOGLE_ADS_CUSTOMER_IDS!.split(",").filter(Boolean);
  console.log(`📊 Testing with ${customerIds.length} customer ID(s)`);

  // Test 1: Authentication
  await runTest("OAuth Authentication", async () => {
    const result = await client.authenticate();
    if (!result) throw new Error("Authentication failed");
    if (!client.isAuthenticated()) throw new Error("Client not authenticated");
    return { authenticated: true };
  });

  // Test 2: Fetch campaigns
  await runTest("Fetch Campaigns", async () => {
    const campaigns = await client.getCampaigns(customerIds);
    console.log(`  Found ${campaigns.length} campaigns`);
    if (campaigns.length > 0) {
      console.log(`  Sample: ${campaigns[0].name} (${campaigns[0].status})`);
    }
    return { count: campaigns.length, campaigns: campaigns.slice(0, 3) };
  });

  // Test 3: Campaign performance (last 7 days)
  await runTest("Campaign Performance (LAST_7_DAYS)", async () => {
    const performances = await client.getCampaignPerformance(customerIds, "LAST_7_DAYS");
    console.log(`  Found performance data for ${performances.length} campaigns`);
    
    if (performances.length > 0) {
      const sample = performances[0];
      console.log(`  Sample: ${sample.campaignName}`);
      console.log(`    Impressions: ${sample.impressions}`);
      console.log(`    Clicks: ${sample.clicks}`);
      console.log(`    Cost: $${(sample.costCents / 100).toFixed(2)}`);
      console.log(`    Conversions: ${sample.conversions}`);
    }
    
    return { count: performances.length, performances: performances.slice(0, 3) };
  });

  // Test 4: Ad group performance
  await runTest("Ad Group Performance", async () => {
    const performances = await client.getAdGroupPerformance(customerIds, undefined, "LAST_7_DAYS");
    console.log(`  Found ${performances.length} ad groups`);
    
    if (performances.length > 0) {
      const sample = performances[0];
      console.log(`  Sample: ${sample.adGroupName} (${sample.status})`);
      console.log(`    Impressions: ${sample.impressions}`);
      console.log(`    Clicks: ${sample.clicks}`);
    }
    
    return { count: performances.length };
  });

  // Test 5: Keyword performance
  await runTest("Keyword Performance", async () => {
    const performances = await client.getKeywordPerformance(customerIds, undefined, "LAST_7_DAYS");
    console.log(`  Found ${performances.length} keywords`);
    
    if (performances.length > 0) {
      const sample = performances[0];
      console.log(`  Sample: "${sample.keyword}" (${sample.matchType})`);
      console.log(`    Clicks: ${sample.clicks}`);
      console.log(`    Cost: $${(sample.costCents / 100).toFixed(2)}`);
    }
    
    return { count: performances.length };
  });

  // Test 6: Rate limiting (multiple rapid requests)
  await runTest("Rate Limiting Test", async () => {
    const start = Date.now();
    const requests = [];
    
    for (let i = 0; i < 5; i++) {
      requests.push(client.getCampaigns(customerIds));
    }
    
    await Promise.all(requests);
    const duration = Date.now() - start;
    
    console.log(`  Completed 5 parallel requests in ${duration}ms`);
    console.log(`  Average: ${(duration / 5).toFixed(0)}ms per request`);
    
    return { requests: 5, totalDuration: duration, avgDuration: duration / 5 };
  });

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Summary");
  console.log("=".repeat(50));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);

  if (failed > 0) {
    console.log("\n❌ Failed Tests:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
  }

  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error("❌ Test suite failed:", error);
  process.exit(1);
});


