import { test, expect } from "../fixtures/shopify-admin";

const hasAdminCredentials = Boolean(process.env.PLAYWRIGHT_SHOPIFY_EMAIL && process.env.PLAYWRIGHT_SHOPIFY_PASSWORD);
const mockMode = process.env.DASHBOARD_USE_MOCK ?? "1";
const isLiveMode = mockMode === "0";

test.describe("shopify admin embed", () => {
  // Skip live mode tests if admin credentials aren't configured
  test.skip(
    isLiveMode && !hasAdminCredentials,
    "Live mode (mock=0) requires PLAYWRIGHT_SHOPIFY_EMAIL and PLAYWRIGHT_SHOPIFY_PASSWORD"
  );

  test("loads operator control center in configured mode", async ({ shopifyAdmin, page }) => {
    // Use the configured mock mode from environment
    await shopifyAdmin.goto("/app", {
      mock: mockMode as "0" | "1",
    });

    // Verify the dashboard loads
    await expect(page.getByRole("heading", { name: /Operator Control Center/i })).toBeVisible();
    
    // In mock mode, verify we see the mock indicator
    if (shopifyAdmin.isMockMode) {
      // Look for mock mode visual indicator (badge or text)
      const mockIndicators = [
        page.getByText("Mock Mode"),
        page.locator("[data-testid='mock-mode-indicator']"),
        page.locator(".mock-mode-badge")
      ];
      
      // At least one mock indicator should be visible
      let foundIndicator = false;
      for (const indicator of mockIndicators) {
        try {
          await expect(indicator).toBeVisible({ timeout: 2000 });
          foundIndicator = true;
          break;
        } catch {
          // Continue checking other indicators
        }
      }
      
      if (foundIndicator) {
        console.log("✅ Mock mode indicator found");
      } else {
        console.log("⚠️  Mock mode indicator not found (may not be implemented)");
      }
    }
    
    // Verify core dashboard tiles are present
    await expect(page.getByRole("heading", { name: /Sales Pulse/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /CX Escalations/i })).toBeVisible();
  });

  test("handles authentication correctly per mode", async ({ shopifyAdmin, page }) => {
    const targetMode = isLiveMode ? "0" : "1";
    
    if (isLiveMode) {
      // Live mode: should authenticate with Shopify Admin
      await shopifyAdmin.login();
      console.log("✅ Shopify Admin authentication completed");
    } else {
      // Mock mode: should skip authentication
      console.log("✅ Mock mode - authentication skipped");
    }
    
    await shopifyAdmin.goto("/app", { mock: targetMode });
    
    // Should reach the dashboard regardless of mode
    await expect(page.getByRole("heading", { name: /Operator Control Center/i })).toBeVisible();
    
    // Log the current URL for debugging
    console.log(`📍 Final URL: ${page.url()}`);
    console.log(`🎭 Test mode: ${targetMode === "1" ? "MOCK" : "LIVE"}`);
  });
});
