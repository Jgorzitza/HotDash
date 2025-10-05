import { expect, test } from "@playwright/test";

const DASHBOARD_PATH = "/app";

test.describe("operator dashboard", () => {
  test("renders control center tiles", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    await expect(
      page.getByRole("heading", { name: /Operator Control Center/i }),
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: /Sales Pulse/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Fulfillment Health/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Inventory Heatmap/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /CX Escalations/i })).toBeVisible();
  });
});
