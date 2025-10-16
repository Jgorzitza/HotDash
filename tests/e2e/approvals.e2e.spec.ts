import { test, expect } from "@playwright/test";

test.describe("Dashboard to Approvals Happy Path", () => {
  test("should navigate from dashboard to approvals", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Operator Control Center")).toBeVisible();
    await page.getByTestId("tile-approvals").click();
    await expect(page).toHaveURL(/\/approvals/);
  });

  test("should display all tiles on dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByTestId("tile-revenue")).toBeVisible();
    await expect(page.getByTestId("tile-aov")).toBeVisible();
    await expect(page.getByTestId("tile-returns")).toBeVisible();
    await expect(page.getByTestId("tile-stock-risk")).toBeVisible();
    await expect(page.getByTestId("tile-seo")).toBeVisible();
    await expect(page.getByTestId("tile-cx")).toBeVisible();
    await expect(page.getByTestId("tile-approvals")).toBeVisible();
  });
});
