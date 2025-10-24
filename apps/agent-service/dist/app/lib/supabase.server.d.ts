/**
 * Supabase Server Client
 *
 * Server-side Supabase client for database operations
 * TODO: Implement full Supabase integration when needed
 */
/**
 * Create Supabase client (stub implementation)
 */
export declare function createClient(): {
    from: (table: string) => {
        select: () => {
            data: any[];
            error: any;
        };
        insert: () => {
            data: any;
            error: any;
        };
        update: () => {
            data: any;
            error: any;
        };
        delete: () => {
            data: any;
            error: any;
        };
    };
};
//# sourceMappingURL=supabase.server.d.ts.map