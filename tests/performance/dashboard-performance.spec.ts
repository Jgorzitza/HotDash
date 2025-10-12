/**
 * Performance Testing Suite - Dashboard Tiles
 * 
 * Tests performance metrics for all 6 dashboard tiles:
 * 1. Ops Pulse
 * 2. Sales Pulse
 * 3. Fulfillment Health
 * 4. Inventory Heatmap
 * 5. CX Escalations
 * 6. SEO & Content Watch
 * 
 * Metrics tracked:
 * - Page load time
 * - Time to first tile render
 * - Individual tile render times
 * - API response times
 * - Total dashboard load time
 */

import { test, expect, type Page } from "@playwright/test";
import { performance } from "perf_hooks";

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  pageLoad: 3000, // Maximum acceptable page load time
  tileRender: 500, // Maximum acceptable individual tile render time
  totalDashboard: 5000, // Maximum acceptable total dashboard load time
  apiResponse: 1000, // Maximum acceptable API response time
};

// Test data and results collection
interface PerformanceMetrics {
  testName: string;
  pageLoadTime: number;
  timeToFirstTile: number;
  tileMetrics: Record<string, number>;
  totalDashboardTime: number;
  apiResponseTime: number;
  timestamp: string;
}

const performanceResults: PerformanceMetrics[] = [];

test.describe("Dashboard Performance Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Add performance observer
    await page.addInitScript(() => {
      (window as any).performanceMarks = {};
      (window as any).measurePerformance = (name: string) => {
        (window as any).performanceMarks[name] = performance.now();
      };
    });
  });

  test.afterAll(async () => {
    // Write performance results to file for analysis
    const fs = await import("fs/promises");
    const resultsPath = "./test-results/performance-baseline.json";
    await fs.writeFile(resultsPath, JSON.stringify(performanceResults, null, 2));
    console.log(`\n📊 Performance results written to ${resultsPath}`);
    
    // Print summary
    console.log("\n📈 PERFORMANCE SUMMARY");
    console.log("=".repeat(60));
    performanceResults.forEach((result) => {
      console.log(`\nTest: ${result.testName}`);
      console.log(`  Page Load: ${result.pageLoadTime.toFixed(2)}ms`);
      console.log(`  Time to First Tile: ${result.timeToFirstTile.toFixed(2)}ms`);
      console.log(`  Total Dashboard: ${result.totalDashboardTime.toFixed(2)}ms`);
      console.log(`  API Response: ${result.apiResponseTime.toFixed(2)}ms`);
      Object.entries(result.tileMetrics).forEach(([tile, time]) => {
        console.log(`    ${tile}: ${time.toFixed(2)}ms`);
      });
    });
    console.log("=".repeat(60));
  });

  test("01 - Full Dashboard Load Performance (Mock Mode)", async ({ page }) => {
    const startTime = performance.now();
    let apiResponseTime = 0;
    let pageLoadTime = 0;

    // Capture API response time
    page.on("response", async (response) => {
      if (response.url().includes("/app") && response.request().method() === "GET") {
        // Playwright doesn't expose timing() - use request timing instead
        const request = response.request();
        const requestTime = (request as any)._startTime || performance.now();
        apiResponseTime = performance.now() - requestTime;
      }
    });

    // Navigate to dashboard in mock mode
    const navigationStart = performance.now();
    await page.goto("/?mock=1");
    await page.waitForLoadState("networkidle");
    pageLoadTime = performance.now() - navigationStart;

    // Wait for all tiles to be visible
    const tileSelectors = [
      '[data-testid="tile-ops-metrics"]',
      '[data-testid="tile-sales-pulse"]',
      '[data-testid="tile-fulfillment-health"]',
      '[data-testid="tile-inventory-heatmap"]',
      '[data-testid="tile-cx-escalations"]',
      '[data-testid="tile-seo-content"]',
    ];

    // Measure time to first tile
    const firstTileStart = performance.now();
    await page.waitForSelector(tileSelectors[0], { timeout: THRESHOLDS.tileRender });
    const timeToFirstTile = performance.now() - firstTileStart;

    // Measure individual tile render times
    const tileMetrics: Record<string, number> = {};
    for (const selector of tileSelectors) {
      const tileStart = performance.now();
      await page.waitForSelector(selector, { state: "visible", timeout: THRESHOLDS.tileRender });
      const tileTime = performance.now() - tileStart;
      const tileName = selector.replace('[data-testid="tile-', "").replace('"]', "");
      tileMetrics[tileName] = tileTime;
    }

    const totalDashboardTime = performance.now() - startTime;

    // Collect metrics
    const metrics: PerformanceMetrics = {
      testName: "Full Dashboard Load (Mock)",
      pageLoadTime,
      timeToFirstTile,
      tileMetrics,
      totalDashboardTime,
      apiResponseTime,
      timestamp: new Date().toISOString(),
    };
    performanceResults.push(metrics);

    // Assertions
    expect(pageLoadTime, "Page load time should be under threshold").toBeLessThan(
      THRESHOLDS.pageLoad,
    );
    expect(
      timeToFirstTile,
      "Time to first tile should be under threshold",
    ).toBeLessThan(THRESHOLDS.tileRender);
    expect(
      totalDashboardTime,
      "Total dashboard load time should be under threshold",
    ).toBeLessThan(THRESHOLDS.totalDashboard);

    // Verify all tiles loaded
    expect(Object.keys(tileMetrics).length, "All 6 tiles should be measured").toBe(6);
    
    // Each tile should render within threshold
    Object.entries(tileMetrics).forEach(([tile, time]) => {
      expect(time, `Tile ${tile} should render within threshold`).toBeLessThan(
        THRESHOLDS.tileRender,
      );
    });

    console.log(`\n✅ Mock Dashboard Performance: ${totalDashboardTime.toFixed(2)}ms`);
  });

  test("02 - Individual Tile Performance - Ops Pulse", async ({ page }) => {
    await page.goto("/?mock=1");
    
    const tileStart = performance.now();
    const tile = page.locator('[data-testid="tile-ops-metrics"]');
    await tile.waitFor({ state: "visible" });
    const renderTime = performance.now() - tileStart;

    // Verify tile contains expected data
    await expect(tile).toContainText("Activation Rate");
    await expect(tile).toContainText("SLA Performance");

    expect(renderTime, "Ops Pulse tile should render quickly").toBeLessThan(
      THRESHOLDS.tileRender,
    );
    console.log(`  ✓ Ops Pulse: ${renderTime.toFixed(2)}ms`);
  });

  test("03 - Individual Tile Performance - Sales Pulse", async ({ page }) => {
    await page.goto("/?mock=1");
    
    const tileStart = performance.now();
    const tile = page.locator('[data-testid="tile-sales-pulse"]');
    await tile.waitFor({ state: "visible" });
    const renderTime = performance.now() - tileStart;

    // Verify tile contains expected data
    await expect(tile).toContainText("Total Revenue");
    await expect(tile).toContainText("Orders");

    expect(renderTime, "Sales Pulse tile should render quickly").toBeLessThan(
      THRESHOLDS.tileRender,
    );
    console.log(`  ✓ Sales Pulse: ${renderTime.toFixed(2)}ms`);
  });

  test("04 - Individual Tile Performance - Fulfillment Health", async ({ page }) => {
    await page.goto("/?mock=1");
    
    const tileStart = performance.now();
    const tile = page.locator('[data-testid="tile-fulfillment-health"]');
    await tile.waitFor({ state: "visible" });
    const renderTime = performance.now() - tileStart;

    // Verify tile renders (may have no issues in mock)
    await expect(tile).toBeVisible();

    expect(renderTime, "Fulfillment Health tile should render quickly").toBeLessThan(
      THRESHOLDS.tileRender,
    );
    console.log(`  ✓ Fulfillment Health: ${renderTime.toFixed(2)}ms`);
  });

  test("05 - Individual Tile Performance - Inventory Heatmap", async ({ page }) => {
    await page.goto("/?mock=1");
    
    const tileStart = performance.now();
    const tile = page.locator('[data-testid="tile-inventory-heatmap"]');
    await tile.waitFor({ state: "visible" });
    const renderTime = performance.now() - tileStart;

    // Verify tile contains inventory data
    await expect(tile).toBeVisible();

    expect(renderTime, "Inventory Heatmap tile should render quickly").toBeLessThan(
      THRESHOLDS.tileRender,
    );
    console.log(`  ✓ Inventory Heatmap: ${renderTime.toFixed(2)}ms`);
  });

  test("06 - Individual Tile Performance - CX Escalations", async ({ page }) => {
    await page.goto("/?mock=1");
    
    const tileStart = performance.now();
    const tile = page.locator('[data-testid="tile-cx-escalations"]');
    await tile.waitFor({ state: "visible" });
    const renderTime = performance.now() - tileStart;

    // Verify tile renders
    await expect(tile).toBeVisible();

    expect(renderTime, "CX Escalations tile should render quickly").toBeLessThan(
      THRESHOLDS.tileRender,
    );
    console.log(`  ✓ CX Escalations: ${renderTime.toFixed(2)}ms`);
  });

  test("07 - Individual Tile Performance - SEO & Content Watch", async ({ page }) => {
    await page.goto("/?mock=1");
    
    const tileStart = performance.now();
    const tile = page.locator('[data-testid="tile-seo-content"]');
    await tile.waitFor({ state: "visible" });
    const renderTime = performance.now() - tileStart;

    // Verify tile renders
    await expect(tile).toBeVisible();

    expect(renderTime, "SEO Content tile should render quickly").toBeLessThan(
      THRESHOLDS.tileRender,
    );
    console.log(`  ✓ SEO Content: ${renderTime.toFixed(2)}ms`);
  });

  test("08 - Dashboard Refresh Performance", async ({ page }) => {
    await page.goto("/?mock=1");
    await page.waitForLoadState("networkidle");

    // Measure refresh performance
    const refreshStart = performance.now();
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('[data-testid="tile-ops-metrics"]');
    const refreshTime = performance.now() - refreshStart;

    expect(refreshTime, "Dashboard refresh should be fast").toBeLessThan(
      THRESHOLDS.totalDashboard,
    );
    console.log(`  ✓ Refresh: ${refreshTime.toFixed(2)}ms`);
  });

  test("09 - Memory Usage Baseline", async ({ page }) => {
    await page.goto("/?mock=1");
    await page.waitForLoadState("networkidle");

    // Get memory metrics if available
    const metrics = await page.evaluate(() => {
      if ("memory" in performance) {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        };
      }
      return null;
    });

    if (metrics) {
      const usedMB = (metrics.usedJSHeapSize / 1024 / 1024).toFixed(2);
      const totalMB = (metrics.totalJSHeapSize / 1024 / 1024).toFixed(2);
      console.log(`  ✓ Memory Used: ${usedMB}MB / ${totalMB}MB`);
      
      // Memory should be reasonable (< 100MB for dashboard)
      expect(
        metrics.usedJSHeapSize,
        "Memory usage should be reasonable",
      ).toBeLessThan(100 * 1024 * 1024);
    } else {
      console.log("  ⓘ Memory metrics not available in this browser");
    }
  });

  test("10 - API Response Time Measurement", async ({ page }) => {
    const apiTimes: number[] = [];

    // Capture all API response times
    const requestTimes = new Map<string, number>();
    
    page.on("request", (request) => {
      if (request.url().includes("/app") && request.method() === "GET") {
        requestTimes.set(request.url(), performance.now());
      }
    });
    
    page.on("response", (response) => {
      if (response.url().includes("/app") && response.request().method() === "GET") {
        const startTime = requestTimes.get(response.url());
        if (startTime) {
          const responseTime = performance.now() - startTime;
          apiTimes.push(responseTime);
          requestTimes.delete(response.url());
        }
      }
    });

    await page.goto("/?mock=1");
    await page.waitForLoadState("networkidle");

    if (apiTimes.length > 0) {
      const avgApiTime = apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length;
      const maxApiTime = Math.max(...apiTimes);

      console.log(`  ✓ Avg API Response: ${avgApiTime.toFixed(2)}ms`);
      console.log(`  ✓ Max API Response: ${maxApiTime.toFixed(2)}ms`);

      expect(avgApiTime, "Average API response should be fast").toBeLessThan(
        THRESHOLDS.apiResponse,
      );
      expect(maxApiTime, "Max API response should be acceptable").toBeLessThan(
        THRESHOLDS.apiResponse * 2,
      );
    }
  });
});

test.describe("Concurrent Load Testing", () => {
  test("11 - Simulate 5 Concurrent Operators", async ({ browser }) => {
    const contexts = await Promise.all(
      Array.from({ length: 5 }, () => browser.newContext()),
    );

    const loadTimes: number[] = [];

    try {
      // Simulate 5 operators loading dashboard simultaneously
      const results = await Promise.all(
        contexts.map(async (context, index) => {
          const page = await context.newPage();
          const startTime = performance.now();

          await page.goto("/?mock=1");
          await page.waitForLoadState("networkidle");
          await page.waitForSelector('[data-testid="tile-ops-metrics"]');

          const loadTime = performance.now() - startTime;
          loadTimes.push(loadTime);

          console.log(`  ✓ Operator ${index + 1}: ${loadTime.toFixed(2)}ms`);

          await page.close();
          return loadTime;
        }),
      );

      const avgLoadTime = results.reduce((a, b) => a + b, 0) / results.length;
      const maxLoadTime = Math.max(...results);

      console.log(`\n  📊 Concurrent Load Stats:`);
      console.log(`    Average: ${avgLoadTime.toFixed(2)}ms`);
      console.log(`    Maximum: ${maxLoadTime.toFixed(2)}ms`);

      // Under concurrent load, allow 2x threshold
      expect(avgLoadTime, "Average load time under concurrency should be acceptable").toBeLessThan(
        THRESHOLDS.totalDashboard * 2,
      );
    } finally {
      // Cleanup
      await Promise.all(contexts.map((ctx) => ctx.close()));
    }
  });

  test("12 - Simulate 10 Concurrent Operators (Stress Test)", async ({ browser }) => {
    const contexts = await Promise.all(
      Array.from({ length: 10 }, () => browser.newContext()),
    );

    const loadTimes: number[] = [];

    try {
      // Simulate 10 operators loading dashboard simultaneously
      const results = await Promise.all(
        contexts.map(async (context, index) => {
          const page = await context.newPage();
          const startTime = performance.now();

          await page.goto("/?mock=1");
          await page.waitForLoadState("networkidle");
          await page.waitForSelector('[data-testid="tile-ops-metrics"]');

          const loadTime = performance.now() - startTime;
          loadTimes.push(loadTime);

          console.log(`  ✓ Operator ${index + 1}: ${loadTime.toFixed(2)}ms`);

          await page.close();
          return loadTime;
        }),
      );

      const avgLoadTime = results.reduce((a, b) => a + b, 0) / results.length;
      const maxLoadTime = Math.max(...results);
      const p95LoadTime = results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)];

      console.log(`\n  📊 Stress Test Stats (10 concurrent):`);
      console.log(`    Average: ${avgLoadTime.toFixed(2)}ms`);
      console.log(`    P95: ${p95LoadTime.toFixed(2)}ms`);
      console.log(`    Maximum: ${maxLoadTime.toFixed(2)}ms`);

      // Under stress, allow 3x threshold
      expect(
        avgLoadTime,
        "Average load time under stress should still be reasonable",
      ).toBeLessThan(THRESHOLDS.totalDashboard * 3);
    } finally {
      // Cleanup
      await Promise.all(contexts.map((ctx) => ctx.close()));
    }
  });
});

test.describe("Performance Regression Detection", () => {
  test("13 - Baseline Performance Snapshot", async ({ page }) => {
    // This test creates a baseline snapshot that can be compared
    // in future test runs to detect performance regressions

    const startTime = performance.now();

    await page.goto("/?mock=1");
    await page.waitForLoadState("networkidle");

    // Measure all tiles
    const tileSelectors = [
      "tile-ops-metrics",
      "tile-sales-pulse",
      "tile-fulfillment-health",
      "tile-inventory-heatmap",
      "tile-cx-escalations",
      "tile-seo-content",
    ];

    const baseline: Record<string, number> = {};
    for (const tile of tileSelectors) {
      const tileStart = performance.now();
      await page.waitForSelector(`[data-testid="${tile}"]`, { state: "visible" });
      baseline[tile] = performance.now() - tileStart;
    }

    const totalTime = performance.now() - startTime;
    baseline.totalDashboardTime = totalTime;

    // Write baseline for comparison
    const fs = await import("fs/promises");
    const baselinePath = "./test-results/performance-baseline-snapshot.json";
    await fs.writeFile(
      baselinePath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          baseline,
        },
        null,
        2,
      ),
    );

    console.log(`\n📸 Baseline snapshot saved to ${baselinePath}`);
    console.log(`  Total Dashboard Time: ${totalTime.toFixed(2)}ms`);

    // Always pass - this is just creating baseline
    expect(totalTime).toBeGreaterThan(0);
  });
});

