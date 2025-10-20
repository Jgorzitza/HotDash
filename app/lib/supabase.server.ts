/**
 * Supabase Server Client
 *
 * Server-side Supabase client for database operations
 * TODO: Implement full Supabase integration when needed
 */

/**
 * Create Supabase client (stub implementation)
 */
export function createClient() {
  // TODO: Implement actual Supabase client
  // This is a stub to allow build/tests to pass
  return {
    from: (table: string) => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
  };
}
