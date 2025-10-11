import { test as base, expect } from "@playwright/test";

import { resolvePlaywrightBaseUrl, resolveShopifyHostParam } from "./constants";

export interface ShopifyAdminFixtures {
  shopifyAdmin: {
    login: () => Promise<void>;
    goto: (path?: string, options?: { mock?: "0" | "1"; searchParams?: Record<string, string> }) => Promise<void>;
    hostParam: string;
  };
}

function buildEmbeddedUrl(
  path: string,
  hostParam: string,
  baseUrl: string,
  { mock, searchParams }: { mock?: "0" | "1"; searchParams?: Record<string, string> } = {},
): string {
  const defaultMock = process.env.DASHBOARD_USE_MOCK ?? "1";
  const url = new URL(path, baseUrl);

  url.searchParams.set("embedded", "1");
  url.searchParams.set("host", hostParam);
  url.searchParams.set("mock", mock ?? defaultMock);

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

    async function ensureLoggedIn() {
      const appPath = new URL("/admin/apps/hotdash", baseUrl).toString();
      await page.goto(appPath, { waitUntil: "networkidle" });

      if (page.url().includes("/accounts/login")) {
        const email = process.env.PLAYWRIGHT_SHOPIFY_EMAIL;
        const password = process.env.PLAYWRIGHT_SHOPIFY_PASSWORD;

        if (!email || !password) {
          throw new Error(
            "Playwright requires PLAYWRIGHT_SHOPIFY_EMAIL and PLAYWRIGHT_SHOPIFY_PASSWORD to automate the Admin login. " +
              "Provide credentials for the staging store (test account).",
          );
        }

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
      login: ensureLoggedIn,
      goto: async (path = "/app", options = {}) => {
        await ensureLoggedIn();
        const desiredMock = options.mock ?? process.env.DASHBOARD_USE_MOCK ?? "1";
        const targetUrl = buildEmbeddedUrl(path, hostParam, baseUrl, {
          ...options,
          mock: desiredMock as "0" | "1",
        });
        await page.goto(targetUrl);
      },
    });
  },
});

export { expect };

export function embeddedUrl(path = "/app", options?: { mock?: "0" | "1"; searchParams?: Record<string, string> }) {
  const baseUrl = resolvePlaywrightBaseUrl();
  const hostParam = resolveShopifyHostParam();
  return buildEmbeddedUrl(path, hostParam, baseUrl, options);
}
