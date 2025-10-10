import { expect, test } from "@playwright/test";

const DASHBOARD_PATH = "/app";

test.describe("dashboard modals", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);
  });

  test("opens CX escalation modal from tile", async ({ page }) => {
    const reviewButton = page.getByTestId("cx-escalations-open").first();
    await expect(reviewButton).toBeVisible();

    await reviewButton.click();

    const dialog = page.getByTestId("cx-escalation-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /Conversation history/i })).toBeVisible();

    await dialog.getByRole("button", { name: /Close escalation modal/i }).click();
    await expect(dialog).not.toBeVisible();
  });

  test("opens Sales Pulse modal from tile", async ({ page }) => {
    const detailsButton = page.getByTestId("sales-pulse-open");
    await expect(detailsButton).toBeVisible();

    await detailsButton.click();

    const dialog = page.getByTestId("sales-pulse-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /Top SKUs/i })).toBeVisible();

    await dialog.getByRole("button", { name: /Cancel/i }).click();
    await expect(dialog).not.toBeVisible();
  });
});
