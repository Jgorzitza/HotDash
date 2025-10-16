import { test, expect } from "@playwright/test";

test.describe("Error States", () => {
  test("should show error when API is down", async ({ page, context }) => {
    await context.route("**/api/**", (route) => route.abort("failed"));
    await page.goto("/dashboard");
    await expect(page.getByText(/Error loading data/)).toBeVisible();
  });

  test("should show error boundary on component crash", async ({ page }) => {
    await page.goto("/dashboard");
    await page.evaluate(() => { throw new Error("Test error"); });
    await expect(page.getByText(/Something went wrong/)).toBeVisible();
  });

  test("should retry on network error", async ({ page, context }) => {
    let attempts = 0;
    await context.route("**/api/approvals", (route) => {
      attempts++;
      if (attempts < 3) {
        route.abort("failed");
      } else {
        route.fulfill({ status: 200, body: "[]" });
      }
    });
    await page.goto("/approvals");
    await page.waitForTimeout(5000);
    await expect(page.getByText("All clear\!")).toBeVisible();
  });
});
