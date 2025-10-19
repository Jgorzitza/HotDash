/**
 * Server-side feature flag utilities.
 *
 * Enables toggling integrations (e.g., Supabase) without deploying code.
 * Flags are read from environment variables to keep client defaults intact.
 */

interface ServerFeatureFlags {
  ideaPoolSupabase: boolean;
  ideaPoolLive: boolean;
  analyticsRealData: boolean;
  publerLive: boolean;
}

const TRUE_VALUES = new Set(["1", "true", "on", "yes"]);

function envFlag(name: string, fallback = false): boolean {
  const raw = process.env[name];
  if (!raw) return fallback;
  return TRUE_VALUES.has(raw.toLowerCase());
}

export function getServerFeatureFlags(): ServerFeatureFlags {
  return {
    ideaPoolSupabase: envFlag("IDEA_POOL_SUPABASE_ENABLED", false),
    ideaPoolLive: envFlag("IDEA_POOL_LIVE", false),
    analyticsRealData: envFlag("ANALYTICS_REAL_DATA", false),
    publerLive: envFlag("PUBLER_LIVE", false),
  };
}

export function isIdeaPoolSupabaseEnabled(): boolean {
  return getServerFeatureFlags().ideaPoolSupabase;
}

export function isIdeaPoolLive(): boolean {
  return getServerFeatureFlags().ideaPoolLive;
}

export function isAnalyticsRealData(): boolean {
  return getServerFeatureFlags().analyticsRealData;
}

export function isPublerLive(): boolean {
  return getServerFeatureFlags().publerLive;
}
