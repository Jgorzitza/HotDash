import { test } from "@playwright/test";
import fs from "fs";
import path from "path";

const STORYBOOK_BASE = process.env.STORYBOOK_BASE_URL || "http://localhost:6006";
const OUT_DIR = path.resolve("docs/specs/assets/dashboard-tiles");

const VIEWPORTS = {
  mobile: { width: 360, height: 640 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
} as const;

type StoryRef = { tile: string; state: string; id: string };
const STORIES: StoryRef[] = [
  { tile: "revenue", state: "default", id: "dashboard-revenuetile--default" },
  { tile: "revenue", state: "loading", id: "dashboard-revenuetile--loading" },
  { tile: "revenue", state: "trenddown", id: "dashboard-revenuetile--trenddown" },

  { tile: "aov", state: "default", id: "dashboard-aovtile--default" },
  { tile: "aov", state: "loading", id: "dashboard-aovtile--loading" },

  { tile: "returns", state: "default", id: "dashboard-returnstile--default" },
  { tile: "returns", state: "loading", id: "dashboard-returnstile--loading" },
  { tile: "returns", state: "trenddown", id: "dashboard-returnstile--trenddown" },

  { tile: "stock-risk", state: "default", id: "dashboard-stockrisktile--default" },
  { tile: "stock-risk", state: "loading", id: "dashboard-stockrisktile--loading" },
  { tile: "stock-risk", state: "recovering", id: "dashboard-stockrisktile--recovering" },

  { tile: "seo", state: "default", id: "dashboard-seotile--default" },
  { tile: "seo", state: "loading", id: "dashboard-seotile--loading" },
  { tile: "seo", state: "trendingup", id: "dashboard-seotile--trendingup" },

  { tile: "cx", state: "default", id: "dashboard-cxtile--default" },
  { tile: "cx", state: "loading", id: "dashboard-cxtile--loading" },
  { tile: "cx", state: "breachrisk", id: "dashboard-cxtile--breachrisk" },

  { tile: "approvals", state: "default", id: "dashboard-approvalstile--default" },
  { tile: "approvals", state: "loading", id: "dashboard-approvalstile--loading" },
  { tile: "approvals", state: "nofilters", id: "dashboard-approvalstile--nofilters" },
];

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

test.describe("Storybook tile screenshots", () => {
  ensureOutDir();

  for (const story of STORIES) {
    for (const [bp, size] of Object.entries(VIEWPORTS)) {
      test(`${story.tile} - ${story.state} - ${bp}`, async ({ page }) => {
        await page.setViewportSize(size);
        const url = `${STORYBOOK_BASE}/iframe.html?id=${story.id}`;
        await page.goto(url, { waitUntil: "domcontentloaded" });
        // Small delay to allow layout to settle (no animations recommended)
        await page.waitForTimeout(100);
        const file = path.join(OUT_DIR, `${story.tile}-${story.state}-${bp}.png`);
        await page.screenshot({ path: file, fullPage: false });
      });
    }
  }
});

