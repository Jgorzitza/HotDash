import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "~/config/supabase.server";

type ProgrammaticDatabase = Record<string, never>;
type ProgrammaticSchemaName = "public";
type ProgrammaticTables = Record<string, never>;

type ProgrammaticSupabaseClient = SupabaseClient<
  ProgrammaticDatabase,
  ProgrammaticSchemaName,
  ProgrammaticTables
>;

let clientOverride: ProgrammaticSupabaseClient | null = null;

export function getSupabaseProgrammaticClient(): ProgrammaticSupabaseClient | null {
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

export function __setSupabaseProgrammaticClientOverride(
  client: ProgrammaticSupabaseClient | null,
) {
  clientOverride = client;
}

export function resetSupabaseProgrammaticClientOverride() {
  clientOverride = null;
}
