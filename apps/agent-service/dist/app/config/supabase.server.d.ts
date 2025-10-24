import type { Memory } from "../../packages/memory";
export interface SupabaseConfig {
    url: string;
    serviceKey: string;
}
export declare function getSupabaseConfig(): SupabaseConfig | null;
export declare function getMemory(): Memory;
//# sourceMappingURL=supabase.server.d.ts.map