type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];
interface UseAuthenticatedFetchOptions {
    /**
     * Default headers that should be present on every request.
     * These headers are merged with any headers provided when invoking the fetch.
     * Existing headers (including the session token Authorization header) are preserved.
     */
    defaultHeaders?: Record<string, string>;
    /**
     * Static RequestInit values that should be merged into every request.
     * Useful for setting credentials policies, caching, etc.
     */
    defaultRequestInit?: RequestInit;
}
type AuthenticatedFetch = (input: FetchInput, init?: FetchInit) => ReturnType<typeof fetch>;
/**
 * Returns a wrapper around window.fetch that injects Shopify session tokens by
 * leveraging App Bridge's authenticatedFetch helper. This keeps client ➜ server
 * communication aligned with https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens.
 *
 * The hook also supports appending custom headers or RequestInit defaults so callers
 * can consistently opt-in to JSON semantics or bespoke caching.
 */
export declare function useAuthenticatedFetch(options?: UseAuthenticatedFetchOptions): AuthenticatedFetch;
export {};
//# sourceMappingURL=useAuthenticatedFetch.d.ts.map