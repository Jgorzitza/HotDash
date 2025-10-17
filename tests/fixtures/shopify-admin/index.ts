import { test as base, expect } from "@playwright/test";

import { resolvePlaywrightBaseUrl, resolveShopifyHostParam } from "./constants";

export interface ShopifyAdminFixtures {
  shopifyAdmin: {
    login: () => Promise<void>;
    goto: (
      path?: string,
      options?: { mock?: "0" | "1"; searchParams?: Record<string, string> },
    ) => Promise<void>;
    hostParam: string;
    isMockMode: boolean;
  };
}

function buildEmbeddedUrl(
  path: string,
  hostParam: string,
  baseUrl: string,
  {
    mock,
    searchParams,
  }: { mock?: "0" | "1"; searchParams?: Record<string, string> } = {},
): string {
  const defaultMock = process.env.DASHBOARD_USE_MOCK ?? "1";
  const url = new URL(path, baseUrl);

  const mockMode = mock ?? defaultMock;

  // Only add Shopify embed parameters for live mode (mock=0)
  // In mock mode (mock=1), we bypass Shopify authentication
  if (mockMode === "0") {
    url.searchParams.set("embedded", "1");
    url.searchParams.set("host", hostParam);
  }

  url.searchParams.set("mock", mockMode);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

export const test = base.extend<ShopifyAdminFixtures>({
  shopifyAdmin: async ({ page }, use) => {
    const baseUrl = resolvePlaywrightBaseUrl();
    const hostParam = resolveShopifyHostParam();
    const defaultMock = process.env.DASHBOARD_USE_MOCK ?? "1";
    const isMockMode = defaultMock === "1";

    async function ensureLoggedIn() {
      // Skip Shopify login for mock mode
      if (isMockMode) {
        console.log("🎭 Mock mode detected - skipping Shopify admin login");
        return;
      }

      console.log("🔑 Live mode detected - performing Shopify admin login");

      const email = process.env.PLAYWRIGHT_SHOPIFY_EMAIL;
      const password = process.env.PLAYWRIGHT_SHOPIFY_PASSWORD;

      if (!email || !password) {
        throw new Error(
          "Live mode (mock=0) requires PLAYWRIGHT_SHOPIFY_EMAIL and PLAYWRIGHT_SHOPIFY_PASSWORD. " +
            "For local testing, use mock=1 mode instead.",
        );
      }

      const appPath = new URL("/admin/apps/hotdash", baseUrl).toString();
      await page.goto(appPath, { waitUntil: "networkidle" });

      if (page.url().includes("/accounts/login")) {
        await page.fill("input[type=email]", email);
        await page.click("button[type=submit]");
        await page.waitForTimeout(1000);

        await page.fill("input[type=password]", password);
        await page.click("button[type=submit]");
        await page.waitForNavigation({ waitUntil: "networkidle" });
      }
    }

    await use({
      hostParam,
      isMockMode,
      login: ensureLoggedIn,
      goto: async (path = "/app", options = {}) => {
        const desiredMock = options.mock ?? defaultMock;
        const isThisMockMode = desiredMock === "1";

        if (!isThisMockMode) {
          // Only login for live mode
          await ensureLoggedIn();
        }

        const targetUrl = buildEmbeddedUrl(path, hostParam, baseUrl, {
          ...options,
          mock: desiredMock as "0" | "1",
        });

        console.log(`🎭 Navigating to: ${targetUrl} (mock=${desiredMock})`);
        await page.goto(targetUrl);

        // Wait for app to load
        if (isThisMockMode) {
          // In mock mode, wait for mock indicator or dashboard to be ready
          await page.waitForSelector(
            "[data-testid='mock-mode-indicator'], h1:has-text('Operator Control Center')",
            {
              timeout: 10000,
            },
          );
        }
      },
    });
  },
});

export { expect };

export function embeddedUrl(
  path = "/app",
  options?: { mock?: "0" | "1"; searchParams?: Record<string, string> },
) {
  const baseUrl = resolvePlaywrightBaseUrl();
  const hostParam = resolveShopifyHostParam();
  return buildEmbeddedUrl(path, hostParam, baseUrl, options);
}
