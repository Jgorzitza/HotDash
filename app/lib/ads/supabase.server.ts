import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "~/config/supabase.server";

type AdsDatabase = Record<string, never>;
type AdsSchemaName = "public";
type AdsTables = Record<string, never>;

type AdsSupabaseClient = SupabaseClient<AdsDatabase, AdsSchemaName, AdsTables>;

let clientOverride: AdsSupabaseClient | null = null;

export function getSupabaseAdsClient(): AdsSupabaseClient | null {
  if (clientOverride) {
    return clientOverride;
  }

  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  return createClient(config.url, config.serviceKey, {
    auth: { persistSession: false },
  });
}

export function parseNumeric(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseInteger(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Testing hook to inject a mocked Supabase client.
 * Not exported outside test builds.
 */
export function __setSupabaseAdsClientOverride(
  client: AdsSupabaseClient | null,
) {
  clientOverride = client;
}
