import { authenticate } from "../shopify.server";

/**
 * Authentication utilities for API routes
 */

/**
 * Requires Shopify admin authentication and returns shop domain
 * @param request - The request object
 * @returns Promise<{ shopDomain: string }>
 */
export async function requireShopifyAuth(request: Request): Promise<{ shopDomain: string }> {
  const { session } = await authenticate.admin(request);

  if (!session?.shop) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return { shopDomain: session.shop };
}
