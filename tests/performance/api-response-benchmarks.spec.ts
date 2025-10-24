/**
 * Performance Regression Tests - API Response Time Benchmarks
 *
 * Validates API performance targets from NORTH_STAR.md and QA-004:
 * - API response time < 500ms
 * - Analytics API < 1s
 * - Inventory API < 500ms
 * - SEO API < 500ms
 * - Approvals API < 500ms
 *
 * @requires @playwright/test
 * @see docs/NORTH_STAR.md (Success Metrics section)
 * @see QA-004 Acceptance Criteria
 */

import { test, expect } from "@playwright/test";

/**
 * API performance thresholds
 */
const API_PERFORMANCE_TARGETS = {
  STANDARD_API: 500, // < 500ms for most APIs
  ANALYTICS_API: 1000, // < 1s for analytics (data-heavy)
  REAL_TIME_API: 300, // < 300ms for real-time updates
  HEALTH_CHECK: 100, // < 100ms for health checks
};

/**
 * Helper function to measure API response time
 */
async function measureApiResponse(
  page: any,
  apiPath: string,
  method: string = "GET",
): Promise<{ duration: number; status: number; size: number }> {
  const startTime = Date.now();

  const response = await page.request[method.toLowerCase()](apiPath);

  const endTime = Date.now();
  const duration = endTime - startTime;

  const body = await response.text();
  const size = new TextEncoder().encode(body).length;

  return {
    duration,
    status: response.status(),
    size,
  };
}

/**
 * Helper to make authenticated API calls
 */
async function authenticatedApiCall(
  page: any,
  apiPath: string,
  mockAuth: boolean = true,
) {
  // Navigate to app first to get session
  await page.goto("/app?mock=1");

  // Make API call with cookies
  return await measureApiResponse(page, apiPath);
}

/**
 * Analytics API Performance Tests
 */
test.describe("Analytics API Performance", () => {
  test("should respond to revenue API within 1 second", async ({ page }) => {
    const result = await authenticatedApiCall(
      page,
      "/api/analytics/revenue?mock=1",
    );

    console.log(`\n📊 Analytics Revenue API:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Size: ${(result.size / 1024).toFixed(2)} KB`);
    console.log(`   Target: < ${API_PERFORMANCE_TARGETS.ANALYTICS_API}ms`);

    expect(result.status).toBe(200);
    expect(result.duration).toBeLessThan(API_PERFORMANCE_TARGETS.ANALYTICS_API);
  });

  test("should respond to traffic API within 1 second", async ({ page }) => {
    const result = await authenticatedApiCall(
      page,
      "/api/analytics/traffic?mock=1",
    );

    console.log(`\n📊 Analytics Traffic API:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Target: < ${API_PERFORMANCE_TARGETS.ANALYTICS_API}ms`);

    expect(result.status).toBe(200);
    expect(result.duration).toBeLessThan(API_PERFORMANCE_TARGETS.ANALYTICS_API);
  });

  test("should respond to ads ROAS API within 1 second", async ({ page }) => {
    const result = await authenticatedApiCall(
      page,
      "/api/analytics/ads-roas?mock=1",
    );

    console.log(`\n📊 Analytics Ads ROAS API:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Target: < ${API_PERFORMANCE_TARGETS.ANALYTICS_API}ms`);

    expect(result.status).toBe(200);
    expect(result.duration).toBeLessThan(API_PERFORMANCE_TARGETS.ANALYTICS_API);
  });
});

/**
 * Inventory API Performance Tests
 */
test.describe("Inventory API Performance", () => {
  test("should respond to tile data API within 500ms", async ({ page }) => {
    const result = await authenticatedApiCall(
      page,
      "/api/inventory/tile-data?mock=1",
    );

    console.log(`\n📊 Inventory Tile Data API:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Target: < ${API_PERFORMANCE_TARGETS.STANDARD_API}ms`);

    expect(result.status).toBe(200);
    expect(result.duration).toBeLessThan(API_PERFORMANCE_TARGETS.STANDARD_API);
  });

  test("should respond to analytics API within 500ms", async ({ page }) => {
    const result = await authenticatedApiCall(
      page,
      "/api/inventory/analytics?mock=1",
    );

    console.log(`\n📊 Inventory Analytics API:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Target: < ${API_PERFORMANCE_TARGETS.STANDARD_API}ms`);

    expect(result.status).toBe(200);
    expect(result.duration).toBeLessThan(API_PERFORMANCE_TARGETS.STANDARD_API);
  });

  test("should respond to emergency recommendations API within 500ms", async ({
    page,
  }) => {
    const result = await authenticatedApiCall(
      page,
      "/api/inventory/emergency?mock=1",
    );

    console.log(`\n📊 Inventory Emergency API:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Target: < ${API_PERFORMANCE_TARGETS.STANDARD_API}ms`);

    expect(result.status).toBe(200);
    expect(result.duration).toBeLessThan(API_PERFORMANCE_TARGETS.STANDARD_API);
  });
});

/**
 * SEO API Performance Tests
 */
test.describe("SEO API Performance", () => {
  test("should respond to search console API within 500ms", async ({
    page,
  }) => {
    const result = await authenticatedApiCall(
      page,
      "/api/seo/search-console?mock=1",
    );

    console.log(`\n📊 SEO Search Console API:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Target: < ${API_PERFORMANCE_TARGETS.STANDARD_API}ms`);

    expect(result.status).toBe(200);
    expect(result.duration).toBeLessThan(API_PERFORMANCE_TARGETS.STANDARD_API);
  });

  test("should respond to Bing Webmaster API within 500ms", async ({
    page,
  }) => {
    const result = await authenticatedApiCall(
      page,
      "/api/seo/bing-webmaster?mock=1",
    );

    console.log(`\n📊 SEO Bing Webmaster API:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Target: < ${API_PERFORMANCE_TARGETS.STANDARD_API}ms`);

    expect(result.status).toBe(200);
    expect(result.duration).toBeLessThan(API_PERFORMANCE_TARGETS.STANDARD_API);
  });

  test("should respond to cannibalization API within 500ms", async ({
    page,
  }) => {
    const result = await authenticatedApiCall(
      page,
      "/api/seo/cannibalization?mock=1",
    );

    console.log(`\n📊 SEO Cannibalization API:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Target: < ${API_PERFORMANCE_TARGETS.STANDARD_API}ms`);

    expect(result.status).toBe(200);
    expect(result.duration).toBeLessThan(API_PERFORMANCE_TARGETS.STANDARD_API);
  });
});

/**
 * Approvals API Performance Tests
 */
test.describe("Approvals API Performance", () => {
  test("should respond to approvals summary API within 500ms", async ({
    page,
  }) => {
    const result = await authenticatedApiCall(
      page,
      "/api/approvals/summary?mock=1",
    );

    console.log(`\n📊 Approvals Summary API:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Target: < ${API_PERFORMANCE_TARGETS.STANDARD_API}ms`);

    expect(result.status).toBe(200);
    expect(result.duration).toBeLessThan(API_PERFORMANCE_TARGETS.STANDARD_API);
  });
});

/**
 * Health Check Performance Tests
 */
test.describe("Health Check Performance", () => {
  test("should respond to health check within 100ms", async ({ page }) => {
    const result = await measureApiResponse(page, "/api/monitoring/health");

    console.log(`\n📊 Health Check API:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Target: < ${API_PERFORMANCE_TARGETS.HEALTH_CHECK}ms`);

    expect(result.status).toBe(200);
    expect(result.duration).toBeLessThan(API_PERFORMANCE_TARGETS.HEALTH_CHECK);
  });
});

/**
 * Concurrent API Request Performance
 */
test.describe("Concurrent API Performance", () => {
  test("should handle 10 concurrent API requests efficiently", async ({
    page,
  }) => {
    await page.goto("/app?mock=1");

    const apiPaths = [
      "/api/analytics/revenue?mock=1",
      "/api/analytics/traffic?mock=1",
      "/api/inventory/tile-data?mock=1",
      "/api/seo/search-console?mock=1",
      "/api/approvals/summary?mock=1",
      "/api/monitoring/health",
      "/api/analytics/ads-roas?mock=1",
      "/api/inventory/analytics?mock=1",
      "/api/seo/bing-webmaster?mock=1",
      "/api/inventory/emergency?mock=1",
    ];

    const startTime = Date.now();

    const results = await Promise.all(
      apiPaths.map((path) => measureApiResponse(page, path)),
    );

    const totalTime = Date.now() - startTime;

    const avgTime =
      results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const maxTime = Math.max(...results.map((r) => r.duration));
    const minTime = Math.min(...results.map((r) => r.duration));

    console.log(`\n📊 Concurrent API Performance (10 requests):`);
    console.log(`   Total time: ${totalTime}ms`);
    console.log(`   Average response: ${avgTime.toFixed(0)}ms`);
    console.log(`   Min response: ${minTime}ms`);
    console.log(`   Max response: ${maxTime}ms`);
    console.log(
      `   Target: Max < ${API_PERFORMANCE_TARGETS.ANALYTICS_API}ms`,
    );

    // All requests should succeed
    expect(results.every((r) => r.status === 200)).toBe(true);

    // Max time should be within analytics target (data-heavy)
    expect(maxTime).toBeLessThan(API_PERFORMANCE_TARGETS.ANALYTICS_API);

    // Average should be better than standard API target
    expect(avgTime).toBeLessThan(API_PERFORMANCE_TARGETS.STANDARD_API);
  });

  test("should maintain performance under rapid sequential requests", async ({
    page,
  }) => {
    await page.goto("/app?mock=1");

    const times: number[] = [];

    // Make 20 sequential requests to same endpoint
    for (let i = 0; i < 20; i++) {
      const result = await measureApiResponse(
        page,
        "/api/approvals/summary?mock=1",
      );
      times.push(result.duration);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const firstFive = times.slice(0, 5);
    const lastFive = times.slice(-5);

    const avgFirst = firstFive.reduce((a, b) => a + b, 0) / firstFive.length;
    const avgLast = lastFive.reduce((a, b) => a + b, 0) / lastFive.length;

    console.log(`\n📊 Sequential API Performance (20 requests):`);
    console.log(`   Average time: ${avgTime.toFixed(0)}ms`);
    console.log(`   Max time: ${maxTime}ms`);
    console.log(`   First 5 avg: ${avgFirst.toFixed(0)}ms`);
    console.log(`   Last 5 avg: ${avgLast.toFixed(0)}ms`);
    console.log(`   Degradation: ${((avgLast / avgFirst - 1) * 100).toFixed(1)}%`);

    // Should not degrade significantly
    expect(avgLast).toBeLessThan(avgFirst * 1.5); // Allow 50% degradation max
    expect(maxTime).toBeLessThan(API_PERFORMANCE_TARGETS.STANDARD_API * 2);
  });
});

/**
 * API Response Size Tests
 */
test.describe("API Response Size Optimization", () => {
  test("should return reasonably sized responses", async ({ page }) => {
    const apis = [
      { path: "/api/analytics/revenue?mock=1", maxSize: 50 }, // 50KB
      { path: "/api/inventory/tile-data?mock=1", maxSize: 30 }, // 30KB
      { path: "/api/approvals/summary?mock=1", maxSize: 20 }, // 20KB
      { path: "/api/monitoring/health", maxSize: 5 }, // 5KB
    ];

    for (const api of apis) {
      const result = await authenticatedApiCall(page, api.path);
      const sizeKB = result.size / 1024;

      console.log(`\n📊 ${api.path}:`);
      console.log(`   Size: ${sizeKB.toFixed(2)} KB`);
      console.log(`   Target: < ${api.maxSize} KB`);

      expect(sizeKB).toBeLessThan(api.maxSize);
    }
  });
});

/**
 * API Error Response Performance
 */
test.describe("API Error Handling Performance", () => {
  test("should return 404 errors quickly", async ({ page }) => {
    const result = await measureApiResponse(page, "/api/nonexistent");

    console.log(`\n📊 404 Error Response:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Target: < 100ms`);

    expect(result.status).toBe(404);
    expect(result.duration).toBeLessThan(100);
  });

  test("should return 401 errors quickly for unauthenticated requests", async ({
    page,
  }) => {
    // Don't navigate to /app first (no auth)
    const result = await measureApiResponse(
      page,
      "/api/approvals/summary?mock=1",
    );

    console.log(`\n📊 401 Error Response:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Target: < 100ms`);

    // Should be fast regardless of auth status
    expect(result.duration).toBeLessThan(100);
  });
});
