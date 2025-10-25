import { useMemo } from "react";
import { authenticatedFetch } from "@shopify/app-bridge/utilities";
import { useAppBridge } from "@shopify/app-bridge-react";
/**
 * Returns a wrapper around window.fetch that injects Shopify session tokens by
 * leveraging App Bridge's authenticatedFetch helper. This keeps client ➜ server
 * communication aligned with https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens.
 *
 * The hook also supports appending custom headers or RequestInit defaults so callers
 * can consistently opt-in to JSON semantics or bespoke caching.
 */
export function useAuthenticatedFetch(options = {}) {
    const appBridge = useAppBridge();
    return useMemo(() => {
        return authenticatedFetch(appBridge, async (uri, init) => {
            const mergedInit = {
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
        });
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
//# sourceMappingURL=useAuthenticatedFetch.js.map