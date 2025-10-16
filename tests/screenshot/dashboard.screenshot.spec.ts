import { test, expect } from "@playwright/test";

test.describe("Dashboard Screenshots", () => {
  test("mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await expect(page).toHaveScreenshot("dashboard-mobile.png");
  });

  test("tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/dashboard");
    await expect(page).toHaveScreenshot("dashboard-tablet.png");
  });

  test("desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/dashboard");
    await expect(page).toHaveScreenshot("dashboard-desktop.png");
  });
});

test.describe("Approvals Screenshots", () => {
  test("mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/approvals");
    await expect(page).toHaveScreenshot("approvals-mobile.png");
  });

  test("tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/approvals");
    await expect(page).toHaveScreenshot("approvals-tablet.png");
  });

  test("desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/approvals");
    await expect(page).toHaveScreenshot("approvals-desktop.png");
  });
});
