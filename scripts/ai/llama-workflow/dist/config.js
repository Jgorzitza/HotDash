let cachedConfig = null;
export function getConfig() {
  if (cachedConfig) return cachedConfig;
  cachedConfig = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    SUPABASE_URL: process.env.SUPABASE_URL || "http://localhost",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    SUPABASE_READONLY_KEY: process.env.SUPABASE_READONLY_KEY || "",
    CHATWOOT_SPACE: process.env.CHATWOOT_SPACE || "hotrodan",
    LOG_DIR: process.env.LOG_DIR || "packages/memory/logs/build",
  };
  return cachedConfig;
}
export function getSupabaseKey() {
  const config = getConfig();
  return config.SUPABASE_READONLY_KEY || config.SUPABASE_ANON_KEY || "";
}
export function validateConfig() {
  const config = getConfig();
  console.log("Config (lenient)");
  console.log(`  - LOG_DIR: ${config.LOG_DIR}`);
}
