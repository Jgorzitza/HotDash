import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for Performance Testing
 * 
 * Optimized for:
 * - Accurate performance measurements
 * - Concurrent load testing
 * - Resource monitoring
 * - Baseline comparison
 */

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173";

console.log(`🎭 Performance Testing Configuration:
  Base URL: ${baseURL}
  Mock Mode: Enabled (for consistent measurements)
  Parallel Workers: 1 (for accurate measurements)
`);

export default defineConfig({
  testDir: "./tests/performance",
  timeout: 120_000, // Performance tests may take longer
  fullyParallel: false, // Run sequentially for accurate measurements
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for performance tests
  workers: 1, // Single worker for consistent measurements
  
  reporter: [
    ["list"],
    ["html", { outputFolder: "./coverage/performance" }],
    ["json", { outputFile: "./test-results/performance-results.json" }],
  ],
  
  use: {
    baseURL,
    trace: "off", // Tracing adds overhead
    screenshot: "off", // Screenshots add overhead
    video: "off", // Video adds overhead
    
    // Optimize for performance measurement
    viewport: { width: 1280, height: 720 },
    
    // Add headers for performance context
    extraHTTPHeaders: {
      "X-Performance-Test": "true",
      "X-Playwright-Mock-Mode": "1",
    },
  },

  // Single project optimized for performance testing
  projects: [
    {
      name: "performance-chrome",
      use: {
        ...devices["Desktop Chrome"],
        // Enable performance metrics collection
        launchOptions: {
          args: [
            "--enable-precise-memory-info",
            "--disable-dev-shm-usage",
            "--no-sandbox",
          ],
        },
      },
    },
  ],

  // Start server for performance tests
  webServer: {
    command: `npm run build && NODE_ENV=test PORT=4173 DASHBOARD_USE_MOCK=1 npm run start`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: "4173",
      DASHBOARD_USE_MOCK: "1",
    },
  },
});

