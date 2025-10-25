import "@shopify/shopify-app-react-router/adapters/node";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
// Shopify headers are optional in test/mock; load dynamically to avoid SSR failures
export const streamTimeout = 5000;
export default async function handleRequest(request, responseStatusCode, responseHeaders, reactRouterContext) {
    try {
        if (process.env.DASHBOARD_USE_MOCK !== "1") {
            const mod = await import("./shopify.server");
            mod.addDocumentResponseHeaders(request, responseHeaders);
        }
    }
    catch (err) {
        // In test/mock environments, skip Shopify header augmentation
        console.warn("Shopify header augmentation skipped:", err?.message);
    }
    const userAgent = request.headers.get("user-agent");
    const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
    return new Promise((resolve, reject) => {
        const { pipe, abort } = renderToPipeableStream(<ServerRouter context={reactRouterContext} url={request.url}/>, {
            [callbackName]: () => {
                const body = new PassThrough();
                const stream = createReadableStreamFromReadable(body);
                responseHeaders.set("Content-Type", "text/html");
                resolve(new Response(stream, {
                    headers: responseHeaders,
                    status: responseStatusCode,
                }));
                pipe(body);
            },
            onShellError(error) {
                reject(error);
            },
            onError(error) {
                responseStatusCode = 500;
                console.error(error);
            },
        });
        // Automatically timeout the React renderer after 6 seconds, which ensures
        // React has enough time to flush down the rejected boundary contents
        setTimeout(abort, streamTimeout + 1000);
    });
}
//# sourceMappingURL=entry.server.js.map