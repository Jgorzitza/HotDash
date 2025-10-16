/**
 * Environment Configuration Switchers
 * Owner: integrations agent
 * Date: 2025-10-15
 */

export type Environment = "development" | "staging" | "production";

export function getEnvironment(): Environment {
  const env = process.env.NODE_ENV || "development";
  if (env === "production") {
    return process.env.STAGING === "true" ? "staging" : "production";
  }
  return "development";
}

export function isDevelopment(): boolean {
  return getEnvironment() === "development";
}

export function isStaging(): boolean {
  return getEnvironment() === "staging";
}

export function isProduction(): boolean {
  return getEnvironment() === "production";
}

export interface EnvironmentConfig {
  shopify: { apiUrl: string; apiVersion: string };
  supabase: { url: string; anonKey: string; serviceKey: string };
  chatwoot: { apiUrl: string; apiKey: string; accountId: string };
  ga4: { propertyId: string; serviceAccountPath: string };
}

export function getConfig(): EnvironmentConfig {
  const env = getEnvironment();
  const configs: Record<Environment, EnvironmentConfig> = {
    development: {
      shopify: { apiUrl: process.env.SHOPIFY_API_URL || "", apiVersion: "2024-10" },
      supabase: { url: process.env.SUPABASE_URL || "", anonKey: process.env.SUPABASE_ANON_KEY || "", serviceKey: process.env.SUPABASE_SERVICE_KEY || "" },
      chatwoot: { apiUrl: process.env.CHATWOOT_API_URL || "", apiKey: process.env.CHATWOOT_API_KEY || "", accountId: process.env.CHATWOOT_ACCOUNT_ID || "" },
      ga4: { propertyId: process.env.GA4_PROPERTY_ID || "", serviceAccountPath: process.env.GA4_SERVICE_ACCOUNT_PATH || "" },
    },
    staging: {
      shopify: { apiUrl: process.env.SHOPIFY_API_URL_STAGING || process.env.SHOPIFY_API_URL || "", apiVersion: "2024-10" },
      supabase: { url: process.env.SUPABASE_URL_STAGING || process.env.SUPABASE_URL || "", anonKey: process.env.SUPABASE_ANON_KEY_STAGING || process.env.SUPABASE_ANON_KEY || "", serviceKey: process.env.SUPABASE_SERVICE_KEY_STAGING || process.env.SUPABASE_SERVICE_KEY || "" },
      chatwoot: { apiUrl: process.env.CHATWOOT_API_URL_STAGING || process.env.CHATWOOT_API_URL || "", apiKey: process.env.CHATWOOT_API_KEY_STAGING || process.env.CHATWOOT_API_KEY || "", accountId: process.env.CHATWOOT_ACCOUNT_ID_STAGING || process.env.CHATWOOT_ACCOUNT_ID || "" },
      ga4: { propertyId: process.env.GA4_PROPERTY_ID_STAGING || process.env.GA4_PROPERTY_ID || "", serviceAccountPath: process.env.GA4_SERVICE_ACCOUNT_PATH_STAGING || process.env.GA4_SERVICE_ACCOUNT_PATH || "" },
    },
    production: {
      shopify: { apiUrl: process.env.SHOPIFY_API_URL || "", apiVersion: "2024-10" },
      supabase: { url: process.env.SUPABASE_URL || "", anonKey: process.env.SUPABASE_ANON_KEY || "", serviceKey: process.env.SUPABASE_SERVICE_KEY || "" },
      chatwoot: { apiUrl: process.env.CHATWOOT_API_URL || "", apiKey: process.env.CHATWOOT_API_KEY || "", accountId: process.env.CHATWOOT_ACCOUNT_ID || "" },
      ga4: { propertyId: process.env.GA4_PROPERTY_ID || "", serviceAccountPath: process.env.GA4_SERVICE_ACCOUNT_PATH || "" },
    },
  };
  return configs[env];
}

export function validateConfig(): { valid: boolean; errors: string[] } {
  const config = getConfig();
  const errors: string[] = [];
  if (!config.supabase.url) errors.push("SUPABASE_URL is required");
  if (!config.supabase.anonKey) errors.push("SUPABASE_ANON_KEY is required");
  if (!config.supabase.serviceKey) errors.push("SUPABASE_SERVICE_KEY is required");
  return { valid: errors.length === 0, errors };
}
