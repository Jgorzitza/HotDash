import { defineConfig } from "@playwright/test";

if (!process.env.DASHBOARD_USE_MOCK) {
  process.env.DASHBOARD_USE_MOCK = "1";
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests/playwright",
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { outputFolder: "./coverage/playwright" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "npm run build && NODE_ENV=test PORT=4173 DASHBOARD_USE_MOCK=1 npm run start",
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
