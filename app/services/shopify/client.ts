import type { ShopifyServiceContext } from "./types";
import { authenticate } from "../../shopify.server";

type GraphqlInvoker = (
  query: string,
  options?: RequestInit,
) => Promise<Response>;

// Test utilities for dependency injection
let waitFn = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
let randomFn = Math.random;

export const __internal = {
  setWaitImplementation: (fn: (ms: number) => Promise<void>) => {
    waitFn = fn;
  },
  resetWaitImplementation: () => {
    waitFn = async (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
  },
  setRandomImplementation: (fn: () => number) => {
    randomFn = fn;
  },
  resetRandomImplementation: () => {
    randomFn = Math.random;
  },
};

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

async function graphqlWithRetry(
  originalGraphql: GraphqlInvoker,
  query: string,
  options?: RequestInit,
): Promise<Response> {
  let lastResponse: Response | null = null;

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
  return lastResponse!;
}

export async function getShopifyServiceContext(
  request: Request,
): Promise<ShopifyServiceContext> {
  const { admin, session } = await authenticate.admin(request);

  if (!session?.shop) {
    throw new Error("Unable to resolve shop domain from session.");
  }

  const operatorEmail = (session as { email?: string | null })?.email ?? null;

  // Wrap admin.graphql with retry logic
  const originalGraphql = admin.graphql.bind(admin);
  const wrappedAdmin = {
    ...admin,
    graphql: (query: string, options?: RequestInit) =>
      graphqlWithRetry(originalGraphql, query, options),
  };

  return {
    admin: wrappedAdmin,
    shopDomain: session.shop,
    operatorEmail,
  }; // Shopify session shop is domain
}
