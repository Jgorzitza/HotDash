import { useMemo } from "react";
import { authenticatedFetch } from "@shopify/app-bridge/utilities";
import { useAppBridge } from "@shopify/app-bridge-react";

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
export function useAuthenticatedFetch(
  options: UseAuthenticatedFetchOptions = {},
): AuthenticatedFetch {
  const appBridge = useAppBridge();

  return useMemo(() => {
    return authenticatedFetch(appBridge as unknown as Parameters<typeof authenticatedFetch>[0], async (uri: FetchInput, init?: FetchInit) => {
      const mergedInit: RequestInit = {
        ...options.defaultRequestInit,
        ...init,
      };

      const headers = new Headers(options.defaultRequestInit?.headers ?? undefined);

      if (init?.headers) {
        new Headers(init.headers).forEach((value, key) => {
          headers.set(key, value);
        });
      }

      if (options.defaultHeaders) {
        for (const [header, value] of Object.entries(options.defaultHeaders)) {
          if (!headers.has(header)) {
            headers.set(header, value);
          }
        }
      }

      mergedInit.headers = headers;

      return fetch(uri, mergedInit);
    }) as AuthenticatedFetch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    appBridge,
    JSON.stringify(options.defaultHeaders ?? {}),
    JSON.stringify({
      cache: options.defaultRequestInit?.cache,
      credentials: options.defaultRequestInit?.credentials,
      mode: options.defaultRequestInit?.mode,
      redirect: options.defaultRequestInit?.redirect,
      referrer: options.defaultRequestInit?.referrer,
    }),
    JSON.stringify(options.defaultRequestInit?.headers ?? {}),
  ]);
}
