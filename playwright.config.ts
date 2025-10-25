import { defineConfig, devices } from "@playwright/test";

// Determine mock mode: local runs default to mock=1, live runs require explicit mock=0
const shouldUseMock = process.env.PLAYWRIGHT_MOCK_MODE !== "0";
const mockValue = shouldUseMock ? "1" : "0";

// Set environment variable for consistency
if (!process.env.DASHBOARD_USE_MOCK) {
  process.env.DASHBOARD_USE_MOCK = mockValue;
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

console.log(`🎭 Playwright Configuration:
  Mock Mode: ${mockValue} (${shouldUseMock ? 'LOCAL/MOCK' : 'LIVE'})
  Base URL: ${baseURL}
  Admin Credentials: ${process.env.PLAYWRIGHT_SHOPIFY_EMAIL ? '✅ Configured' : '❌ Missing'}
`);

export default defineConfig({
  testDir: "./tests/playwright",
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "./coverage/playwright" }],
    ["json", { outputFile: "./test-results/playwright-results.json" }]
  ],
  
  use: {
    baseURL,
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
    // Add context for debugging
    extraHTTPHeaders: {
      'X-Playwright-Mock-Mode': mockValue,
    },
  },

  // Configure projects for different test scenarios
  projects: [
    {
      name: "mock-mode",
      testMatch: ["**/dashboard.spec.ts", "**/modals.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        // Force mock mode for local development tests
        extraHTTPHeaders: {
          'X-Playwright-Mock-Mode': '1',
        },
      },
      // Only run if we're in mock mode or explicitly testing mock
      testIgnore: shouldUseMock ? undefined : ["**/*"],
    },
    
    {
      name: "admin-embed",
      testMatch: ["**/admin-embed.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        // Use configured mock mode (can be 0 or 1)
        extraHTTPHeaders: {
          'X-Playwright-Mock-Mode': mockValue,
        },
      },
      // Skip if no admin credentials in mock=0 mode
      testIgnore: !shouldUseMock && !process.env.PLAYWRIGHT_SHOPIFY_EMAIL 
        ? ["**/*"] 
        : undefined,
    },
  ],

  webServer: {
    command: `npm run dev:vite`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NODE_ENV: "test",
      DASHBOARD_USE_MOCK: mockValue,
    },
  },
});
