import { test, expect } from "../fixtures/shopify-admin";

const hasEmbedToken = Boolean(process.env.PLAYWRIGHT_SHOPIFY_EMBED_TOKEN);
const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "";
const isStagingBase = baseUrl.includes("hotdash-staging");

test.describe("shopify admin embed", () => {
  test.skip(
    !hasEmbedToken || !isStagingBase,
    "Embed token not configured or PLAYWRIGHT_BASE_URL is not targeting staging.",
  );

  test("loads operator control center in embedded mode", async ({ shopifyAdmin, page }) => {
    await shopifyAdmin.goto("/app", {
      mock: process.env.DASHBOARD_USE_MOCK === "0" ? "0" : "1",
    });

    await expect(page.getByRole("heading", { name: /Operator Control Center/i })).toBeVisible();
  });
});
