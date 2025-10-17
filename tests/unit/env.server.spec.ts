import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock environment variables
const mockEnv = {
  SHOPIFY_API_KEY: "test-api-key",
  SHOPIFY_API_SECRET: "test-api-secret",
  SHOPIFY_APP_URL: "https://test-app.fly.dev",
  SCOPES: "read_products,write_products",
  NODE_ENV: "test",
  SHOP_CUSTOM_DOMAIN: "custom.shopify.com",
};

describe("Environment utilities", () => {
  beforeEach(() => {
    // Reset environment before each test
    Object.keys(process.env).forEach((key) => {
      if (
        key.startsWith("SHOPIFY_") ||
        key === "SCOPES" ||
        key === "NODE_ENV" ||
        key === "SHOP_CUSTOM_DOMAIN"
      ) {
        delete process.env[key];
      }
    });

    // Set mock values
    Object.assign(process.env, mockEnv);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getEnvironmentConfig", () => {
    it("returns valid configuration with all required env vars", async () => {
      const { getEnvironmentConfig } = await import(
        "../../app/utils/env.server"
      );

      const config = getEnvironmentConfig();

      expect(config).toMatchObject({
        shopifyApiKey: "test-api-key",
        shopifyApiSecret: "test-api-secret",
        shopifyAppUrl: "https://test-app.fly.dev",
        scopes: ["read_products", "write_products"],
        nodeEnv: "test",
        isDevelopment: false,
        isProduction: false,
        isTest: true,
        customShopDomain: "custom.shopify.com",
      });
    });

    it("throws error when SHOPIFY_API_KEY is missing", async () => {
      delete process.env.SHOPIFY_API_KEY;

      const { getEnvironmentConfig } = await import(
        "../../app/utils/env.server"
      );

      expect(() => getEnvironmentConfig()).toThrow(
        "SHOPIFY_API_KEY environment variable is required",
      );
    });

    it("throws error when SCOPES is missing", async () => {
      delete process.env.SCOPES;

      const { getEnvironmentConfig } = await import(
        "../../app/utils/env.server"
      );

      expect(() => getEnvironmentConfig()).toThrow(
        "SCOPES environment variable is required",
      );
    });

    it("handles development environment correctly", async () => {
      process.env.NODE_ENV = "development";

      const { getEnvironmentConfig } = await import(
        "../../app/utils/env.server"
      );

      const config = getEnvironmentConfig();

      expect(config.isDevelopment).toBe(true);
      expect(config.isProduction).toBe(false);
      expect(config.isTest).toBe(false);
    });
  });

  describe("isMockMode", () => {
    it("returns true when mock=1 parameter is present", async () => {
      const { isMockMode } = await import("../../app/utils/env.server");

      const request = new Request("https://example.com?mock=1");

      expect(isMockMode(request)).toBe(true);
    });

    it("returns false when mock parameter is not present", async () => {
      process.env.NODE_ENV = "production";

      const { isMockMode } = await import("../../app/utils/env.server");

      const request = new Request("https://example.com");

      expect(isMockMode(request)).toBe(false);
    });

    it("returns true when NODE_ENV is test", async () => {
      process.env.NODE_ENV = "test";

      const { isMockMode } = await import("../../app/utils/env.server");

      const request = new Request("https://example.com");

      expect(isMockMode(request)).toBe(true);
    });
  });

  describe("getAuthRedirectUrls", () => {
    it("generates correct redirect URLs with base URL", async () => {
      const { getAuthRedirectUrls } = await import(
        "../../app/utils/env.server"
      );

      const urls = getAuthRedirectUrls("https://example.fly.dev");

      expect(urls).toEqual([
        "https://example.fly.dev/auth/callback",
        "https://example.fly.dev/api/auth",
      ]);
    });

    it("uses SHOPIFY_APP_URL when no base URL provided", async () => {
      const { getAuthRedirectUrls } = await import(
        "../../app/utils/env.server"
      );

      const urls = getAuthRedirectUrls();

      expect(urls).toEqual([
        "https://test-app.fly.dev/auth/callback",
        "https://test-app.fly.dev/api/auth",
      ]);
    });
  });
});
