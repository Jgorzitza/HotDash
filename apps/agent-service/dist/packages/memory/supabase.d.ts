import type { Memory } from "./index";
type SupabaseError = {
    message?: string;
    code?: string | number;
    status?: number;
};
type SupabaseResponse<T = unknown> = {
    data?: T | null;
    error?: SupabaseError | null;
};
declare function isRetryable(error: unknown): boolean;
declare function wait(ms: number): Promise<void>;
declare function executeWithRetry<T>(operation: () => Promise<T | SupabaseResponse>): Promise<T | SupabaseResponse>;
declare function setWaitImplementation(fn: typeof wait): void;
declare function resetWaitImplementation(): void;
export declare function supabaseMemory(url: string, key: string): Memory;
export declare const __internal: {
    executeWithRetry: typeof executeWithRetry;
    isRetryable: typeof isRetryable;
    setWaitForTests: typeof setWaitImplementation;
    resetWaitForTests: typeof resetWaitImplementation;
};
export {};
//# sourceMappingURL=supabase.d.ts.map