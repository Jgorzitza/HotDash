import { defineConfig, devices } from "@playwright/test";

const storybookBase = process.env.STORYBOOK_BASE_URL || "http://localhost:6006";

export default defineConfig({
  testDir: "../screenshot",
  timeout: 60_000,
  reporter: [["list"], ["html", { outputFolder: "./coverage/playwright" }]],
  use: {
    baseURL: storybookBase,
    trace: "on-first-retry",
    viewport: { width: 1024, height: 768 },
  },
  projects: [
    {
      name: "tiles-storybook",
      testMatch: ["**/stories.tiles.screenshot.spec.ts"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // No webServer: assumes Storybook is already running on STORYBOOK_BASE_URL
});

