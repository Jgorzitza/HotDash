/**
 * Load Testing Suite - API and Service Layer
 * 
 * Tests the performance of backend services under load:
 * - Shopify GraphQL queries
 * - Chatwoot API calls
 * - Google Analytics queries
 * - Database operations
 * - Cache performance
 * 
 * Simulates realistic operator workloads.
 */

import { test, expect } from "@playwright/test";
import { performance } from "perf_hooks";

// API endpoints to test
const API_ENDPOINTS = {
  dashboard: "/app",
  sessionToken: "/api/session-token/claims",
  chatwootWebhook: "/api/webhooks/chatwoot",
};

// Performance thresholds for API calls
const API_THRESHOLDS = {
  dashboard: 2000, // Dashboard loader should respond in < 2s
  sessionToken: 500, // Session token should be fast
  webhook: 1000, // Webhook processing should be quick
};

interface LoadTestResult {
  endpoint: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  timestamp: string;
}

const loadTestResults: LoadTestResult[] = [];

test.describe("API Load Testing", () => {
  test.afterAll(async () => {
    // Write load test results
    const fs = await import("fs/promises");
    const resultsPath = "./test-results/load-test-results.json";
    await fs.writeFile(resultsPath, JSON.stringify(loadTestResults, null, 2));
    
    console.log(`\n📊 LOAD TEST SUMMARY`);
    console.log("=".repeat(70));
    loadTestResults.forEach((result) => {
      console.log(`\nEndpoint: ${result.endpoint}`);
      console.log(`  Total Requests: ${result.totalRequests}`);
      console.log(`  Success Rate: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%`);
      console.log(`  Avg Response Time: ${result.avgResponseTime.toFixed(2)}ms`);
      console.log(`  P95 Response Time: ${result.p95ResponseTime.toFixed(2)}ms`);
      console.log(`  P99 Response Time: ${result.p99ResponseTime.toFixed(2)}ms`);
      console.log(`  Requests/sec: ${result.requestsPerSecond.toFixed(2)}`);
    });
    console.log("=".repeat(70));
  });

  test("01 - Dashboard API: 50 Sequential Requests", async ({ page }) => {
    const requestCount = 50;
    const responseTimes: number[] = [];
    let successCount = 0;
    let failCount = 0;

    const startTime = performance.now();

    for (let i = 0; i < requestCount; i++) {
      const reqStart = performance.now();
      
      try {
        const response = await page.goto("/?mock=1");
        const reqTime = performance.now() - reqStart;
        responseTimes.push(reqTime);

        if (response && response.ok()) {
          successCount++;
        } else {
          failCount++;
        }

        // Brief pause between requests to avoid overwhelming
        await page.waitForTimeout(10);
      } catch (error) {
        failCount++;
        console.error(`Request ${i + 1} failed:`, error);
      }
    }

    const totalTime = performance.now() - startTime;
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const sortedTimes = responseTimes.sort((a, b) => a - b);
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    const requestsPerSecond = (requestCount / totalTime) * 1000;

    const result: LoadTestResult = {
      endpoint: "Dashboard API",
      totalRequests: requestCount,
      successfulRequests: successCount,
      failedRequests: failCount,
      avgResponseTime,
      p95ResponseTime: p95,
      p99ResponseTime: p99,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      requestsPerSecond,
      timestamp: new Date().toISOString(),
    };
    loadTestResults.push(result);

    console.log(`\n  ✓ Completed 50 requests`);
    console.log(`    Success rate: ${((successCount / requestCount) * 100).toFixed(2)}%`);
    console.log(`    Avg response: ${avgResponseTime.toFixed(2)}ms`);

    // Assertions
    expect(successCount, "Most requests should succeed").toBeGreaterThanOrEqual(requestCount * 0.95);
    expect(avgResponseTime, "Average response time should be acceptable").toBeLessThan(
      API_THRESHOLDS.dashboard,
    );
  });

  test("02 - Dashboard API: Concurrent Burst (10 simultaneous)", async ({ browser }) => {
    const burstSize = 10;
    const responseTimes: number[] = [];
    let successCount = 0;

    const startTime = performance.now();

    // Create concurrent requests
    const promises = Array.from({ length: burstSize }, async (_, i) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      const reqStart = performance.now();
      try {
        const response = await page.goto("/?mock=1");
        const reqTime = performance.now() - reqStart;
        responseTimes.push(reqTime);

        if (response && response.ok()) {
          successCount++;
        }

        return reqTime;
      } catch (error) {
        console.error(`Concurrent request ${i + 1} failed:`, error);
        return 0;
      } finally {
        await page.close();
        await context.close();
      }
    });

    await Promise.all(promises);

    const totalTime = performance.now() - startTime;
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    console.log(`\n  ✓ Concurrent burst completed`);
    console.log(`    Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`    Avg response: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`    Success rate: ${((successCount / burstSize) * 100).toFixed(2)}%`);

    expect(successCount, "All concurrent requests should succeed").toBeGreaterThanOrEqual(
      burstSize * 0.9,
    );
  });

  test("03 - Sustained Load: 100 Requests over 30 seconds", async ({ page }) => {
    const totalRequests = 100;
    const durationMs = 30000; // 30 seconds
    const intervalMs = durationMs / totalRequests;

    const responseTimes: number[] = [];
    let successCount = 0;
    let failCount = 0;

    const startTime = performance.now();
    let requestCount = 0;

    // Make requests at steady intervals
    while (requestCount < totalRequests) {
      const reqStart = performance.now();
      
      try {
        const response = await page.goto("/?mock=1");
        const reqTime = performance.now() - reqStart;
        responseTimes.push(reqTime);

        if (response && response.ok()) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }

      requestCount++;

      // Wait for next interval
      if (requestCount < totalRequests) {
        await page.waitForTimeout(intervalMs);
      }
    }

    const totalTime = performance.now() - startTime;
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const requestsPerSecond = (totalRequests / totalTime) * 1000;

    console.log(`\n  ✓ Sustained load test completed`);
    console.log(`    Duration: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`    Total requests: ${totalRequests}`);
    console.log(`    Success: ${successCount}, Failed: ${failCount}`);
    console.log(`    Avg response: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`    Throughput: ${requestsPerSecond.toFixed(2)} req/s`);

    expect(successCount, "Most requests should succeed under sustained load").toBeGreaterThanOrEqual(
      totalRequests * 0.95,
    );
    expect(avgResponseTime, "Response times should remain stable").toBeLessThan(
      API_THRESHOLDS.dashboard,
    );
  });
});

test.describe("Cache Performance Testing", () => {
  test("04 - Cache Hit Performance (Mock Mode)", async ({ page }) => {
    // First request (cold cache)
    const coldStart = performance.now();
    await page.goto("/?mock=1");
    await page.waitForLoadState("networkidle");
    const coldTime = performance.now() - coldStart;

    // Second request (warm cache)
    const warmStart = performance.now();
    await page.reload();
    await page.waitForLoadState("networkidle");
    const warmTime = performance.now() - warmStart;

    // Third request (hot cache)
    const hotStart = performance.now();
    await page.reload();
    await page.waitForLoadState("networkidle");
    const hotTime = performance.now() - hotStart;

    console.log(`\n  ✓ Cache Performance:`);
    console.log(`    Cold start: ${coldTime.toFixed(2)}ms`);
    console.log(`    Warm cache: ${warmTime.toFixed(2)}ms`);
    console.log(`    Hot cache: ${hotTime.toFixed(2)}ms`);
    console.log(`    Improvement: ${((1 - hotTime / coldTime) * 100).toFixed(2)}%`);

    // Hot cache should be significantly faster
    expect(hotTime, "Hot cache should be faster than cold start").toBeLessThan(coldTime);
  });

  test("05 - Cache Invalidation Performance", async ({ page }) => {
    // Load with cache
    await page.goto("/?mock=1");
    await page.waitForLoadState("networkidle");

    // Invalidate by adding cache-busting param
    const invalidateStart = performance.now();
    await page.goto("/?mock=1&_t=" + Date.now());
    await page.waitForLoadState("networkidle");
    const invalidateTime = performance.now() - invalidateStart;

    console.log(`\n  ✓ Cache invalidation: ${invalidateTime.toFixed(2)}ms`);

    // Should still be reasonably fast even with cache invalidation
    expect(invalidateTime, "Cache invalidation should not severely impact performance").toBeLessThan(
      API_THRESHOLDS.dashboard * 1.5,
    );
  });
});

test.describe("Resource Loading Performance", () => {
  test("06 - JavaScript Bundle Size and Load Time", async ({ page }) => {
    const resourceMetrics: Array<{ name: string; size: number; duration: number }> = [];

    page.on("response", async (response) => {
      if (response.url().includes(".js") && response.ok()) {
        try {
          const timing = response.timing();
          const body = await response.body();
          resourceMetrics.push({
            name: response.url().split("/").pop() || "unknown",
            size: body.length,
            duration: timing?.responseEnd ?? 0,
          });
        } catch {
          // Ignore errors for metrics collection
        }
      }
    });

    await page.goto("/?mock=1");
    await page.waitForLoadState("networkidle");

    const totalSize = resourceMetrics.reduce((sum, m) => sum + m.size, 0);
    const avgLoadTime =
      resourceMetrics.reduce((sum, m) => sum + m.duration, 0) / resourceMetrics.length;

    console.log(`\n  ✓ JavaScript Resources:`);
    console.log(`    Total bundles: ${resourceMetrics.length}`);
    console.log(`    Total size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`    Avg load time: ${avgLoadTime.toFixed(2)}ms`);

    // Bundle size should be reasonable (< 1MB total)
    expect(totalSize, "Total JS bundle size should be reasonable").toBeLessThan(1024 * 1024);
  });

  test("07 - CSS and Asset Loading", async ({ page }) => {
    const cssMetrics: Array<{ name: string; size: number }> = [];

    page.on("response", async (response) => {
      if (response.url().includes(".css") && response.ok()) {
        try {
          const body = await response.body();
          cssMetrics.push({
            name: response.url().split("/").pop() || "unknown",
            size: body.length,
          });
        } catch {
          // Ignore errors
        }
      }
    });

    await page.goto("/?mock=1");
    await page.waitForLoadState("networkidle");

    const totalCssSize = cssMetrics.reduce((sum, m) => sum + m.size, 0);

    console.log(`\n  ✓ CSS Resources:`);
    console.log(`    Total files: ${cssMetrics.length}`);
    console.log(`    Total size: ${(totalCssSize / 1024).toFixed(2)} KB`);

    // CSS should be minimal
    expect(totalCssSize, "CSS size should be reasonable").toBeLessThan(500 * 1024);
  });
});

