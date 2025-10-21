/**
 * Bing Webmaster Tools Configuration
 *
 * Provides configuration for Bing Webmaster Tools API integration.
 * Uses API key authentication (simpler than Google's service account).
 */

export interface BingWebmasterConfig {
  apiKey: string;
  siteUrl: string; // e.g., "https://hotrodan.com"
}

/**
 * Get Bing Webmaster Tools configuration from environment variables.
 *
 * Environment variables:
 * - BING_WEBMASTER_API_KEY: API key from Bing Webmaster Tools settings
 * - BING_WEBMASTER_SITE_URL: The site URL registered in Bing Webmaster Tools
 *
 * @returns {BingWebmasterConfig} Configuration object
 */
export function getBingWebmasterConfig(): BingWebmasterConfig {
  const apiKey = process.env.BING_WEBMASTER_API_KEY ?? "";
  const siteUrl = process.env.BING_WEBMASTER_SITE_URL ?? "https://hotrodan.com";

  if (!apiKey) {
    throw new Error(
      "BING_WEBMASTER_API_KEY is required for Bing Webmaster Tools integration",
    );
  }

  return {
    apiKey,
    siteUrl,
  };
}

