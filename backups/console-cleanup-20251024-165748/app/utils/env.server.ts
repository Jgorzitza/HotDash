/**
 * Environment configuration utilities for HotDash
 * Handles Shopify app configuration, embed token validation, and React Router 7 integration
 */

export interface HotDashEnvironmentConfig {
  shopifyApiKey: string;
  shopifyApiSecret: string;
  shopifyAppUrl: string;
  scopes: string[];
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  customShopDomain?: string;
}

/**
 * Get validated environment configuration
 * Throws if required environment variables are missing
 */
export function getEnvironmentConfig(): HotDashEnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || "development";

  // Required environment variables
  const shopifyApiKey = process.env.SHOPIFY_API_KEY;
  const shopifyApiSecret = process.env.SHOPIFY_API_SECRET;
  const shopifyAppUrl = process.env.SHOPIFY_APP_URL;
  const scopes = process.env.SCOPES;

  if (!shopifyApiKey) {
    throw new Error("SHOPIFY_API_KEY environment variable is required");
  }

  if (!shopifyApiSecret) {
    throw new Error("SHOPIFY_API_SECRET environment variable is required");
  }

  if (!shopifyAppUrl) {
    throw new Error("SHOPIFY_APP_URL environment variable is required");
  }

  if (!scopes) {
    throw new Error("SCOPES environment variable is required");
  }

  return {
    shopifyApiKey,
    shopifyApiSecret,
    shopifyAppUrl,
    scopes: scopes.split(",").map((s) => s.trim()),
    nodeEnv,
    isDevelopment: nodeEnv === "development",
    isProduction: nodeEnv === "production",
    isTest: nodeEnv === "test",
    customShopDomain: process.env.SHOP_CUSTOM_DOMAIN,
  };
}

/**
 * Check if request is in mock mode for testing/development
 * Supports both URL parameter and environment variable
 */
export function isMockMode(request: Request): boolean {
  const url = new URL(request.url);
  const mockParam = url.searchParams.get("mock");
  const isTestEnv = process.env.NODE_ENV === "test";

  return mockParam === "1" || isTestEnv;
}

/**
 * Get the current app URL with proper protocol and domain
 * Handles local development vs staging/production
 */
export function getAppUrl(request?: Request): string {
  const config = getEnvironmentConfig();

  if (config.isDevelopment && request) {
    // In development, use the request origin
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }

  return config.shopifyAppUrl;
}

/**
 * Generate redirect URLs for auth configuration
 * Supports both legacy /api/auth and new /auth/callback patterns
 */
export function getAuthRedirectUrls(baseUrl?: string): string[] {
  const base = baseUrl || process.env.SHOPIFY_APP_URL || "https://example.com";

  return [
    `${base}/auth/callback`,
    `${base}/api/auth`, // Legacy support
  ];
}
