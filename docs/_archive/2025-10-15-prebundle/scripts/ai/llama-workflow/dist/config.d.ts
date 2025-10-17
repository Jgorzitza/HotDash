import { z } from "zod";
declare const configSchema: z.ZodObject<
  {
    OPENAI_API_KEY: z.ZodString;
    SUPABASE_URL: z.ZodString;
    SUPABASE_ANON_KEY: z.ZodOptional<z.ZodString>;
    SUPABASE_READONLY_KEY: z.ZodOptional<z.ZodString>;
    CHATWOOT_SPACE: z.ZodDefault<z.ZodString>;
    LOG_DIR: z.ZodDefault<z.ZodString>;
  },
  z.core.$strip
>;
export type Config = z.infer<typeof configSchema>;
export declare function getConfig(): Config;
export declare function getSupabaseKey(): string;
export declare function validateConfig(): void;
export {};
//# sourceMappingURL=config.d.ts.map
