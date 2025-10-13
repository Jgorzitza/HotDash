import { z } from 'zod';
import dotenv from 'dotenv';
// Load environment variables from .env.local if Node.js version doesn't support --env-file
if (process.version < 'v20.17.0') {
    dotenv.config({ path: '../../../.env.local' });
}
const configSchema = z.object({
    OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
    SUPABASE_URL: z.string().url("Valid Supabase URL is required"),
    SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required").optional(),
    SUPABASE_READONLY_KEY: z.string().min(1, "Supabase readonly key is required").optional(),
    CHATWOOT_SPACE: z.string().default("hotrodan"),
    LOG_DIR: z.string().default("packages/memory/logs/build"),
}).refine((data) => data.SUPABASE_ANON_KEY || data.SUPABASE_READONLY_KEY, {
    message: "Either SUPABASE_ANON_KEY or SUPABASE_READONLY_KEY must be provided",
    path: ["SUPABASE_ANON_KEY", "SUPABASE_READONLY_KEY"],
});
let cachedConfig = null;
export function getConfig() {
    if (cachedConfig) {
        return cachedConfig;
    }
    const rawConfig = {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        SUPABASE_READONLY_KEY: process.env.SUPABASE_READONLY_KEY,
        CHATWOOT_SPACE: process.env.CHATWOOT_SPACE,
        LOG_DIR: process.env.LOG_DIR,
    };
    try {
        cachedConfig = configSchema.parse(rawConfig);
        return cachedConfig;
    }
    catch (error) {
        console.error('Configuration validation failed:');
        if (error instanceof z.ZodError) {
            console.error(error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n'));
        }
        process.exit(1);
    }
}
export function getSupabaseKey() {
    const config = getConfig();
    return config.SUPABASE_READONLY_KEY || config.SUPABASE_ANON_KEY;
}
export function validateConfig() {
    console.log('Validating configuration...');
    const config = getConfig();
    console.log('✓ Configuration is valid');
    console.log(`  - LOG_DIR: ${config.LOG_DIR}`);
    console.log(`  - SUPABASE_URL: ${config.SUPABASE_URL}`);
    console.log(`  - CHATWOOT_SPACE: ${config.CHATWOOT_SPACE}`);
    console.log(`  - Using ${config.SUPABASE_READONLY_KEY ? 'READONLY' : 'ANON'} Supabase key`);
}
