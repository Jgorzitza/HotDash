/**
 * Shopify Admin GraphQL Client (thin wrapper)
 * Owner: integrations agent
 * Date: 2025-10-16
 */

import { getShopifyServiceContext } from "../../services/shopify/client";

export type ShopifyAdminClient = Awaited<ReturnType<typeof getShopifyServiceContext>>["admin"];

/**
 * Create a Shopify admin client with retry-wrapped graphql.
 * Note: Requires a Request to authenticate via shopify.server.
 */
export async function createShopifyClient(request: Request): Promise<ShopifyAdminClient> {
  const context = await getShopifyServiceContext(request);
  return context.admin;
}

export { getShopifyServiceContext } from "../../services/shopify/client";

