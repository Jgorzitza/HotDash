import { authenticate } from "../../shopify.server";
// Test utilities for dependency injection
let waitFn = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let randomFn = Math.random;
export const __internal = {
    setWaitImplementation: (fn) => {
        waitFn = fn;
    },
    resetWaitImplementation: () => {
        waitFn = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    },
    setRandomImplementation: (fn) => {
        randomFn = fn;
    },
    resetRandomImplementation: () => {
        randomFn = Math.random;
    },
};
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;
function isRetryableStatus(status) {
    return status === 429 || status >= 500;
}
async function graphqlWithRetry(originalGraphql, query, options) {
    let lastResponse = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        lastResponse = await originalGraphql(query, options);
        if (!isRetryableStatus(lastResponse.status)) {
            return lastResponse;
        }
        // If we've exhausted retries, return the final response
        if (attempt === MAX_RETRIES) {
            return lastResponse;
        }
        // Calculate delay with exponential backoff and jitter
        const baseDelay = BASE_DELAY_MS * Math.pow(2, attempt);
        const jitter = randomFn() * baseDelay * 0.1; // 10% jitter
        const delay = baseDelay + jitter;
        await waitFn(delay);
    }
    // TypeScript guard - should never reach here
    return lastResponse;
}
export async function getShopifyServiceContext(request) {
    const { admin, session } = await authenticate.admin(request);
    if (!session?.shop) {
        throw new Error("Unable to resolve shop domain from session.");
    }
    const operatorEmail = session?.email ?? null;
    // Wrap admin.graphql with retry logic
    const originalGraphql = admin.graphql.bind(admin);
    const wrappedAdmin = {
        ...admin,
        graphql: (query, options) => graphqlWithRetry(originalGraphql, query, options),
    };
    return {
        admin: wrappedAdmin,
        shopDomain: session.shop,
        operatorEmail,
    }; // Shopify session shop is domain
}
//# sourceMappingURL=client.js.map