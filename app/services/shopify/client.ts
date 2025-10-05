import type { ShopifyServiceContext } from "./types";
import { authenticate } from "../../shopify.server";

export async function getShopifyServiceContext(
  request: Request,
): Promise<ShopifyServiceContext> {
  const { admin, session } = await authenticate.admin(request);

  if (!session?.shop) {
    throw new Error("Unable to resolve shop domain from session.");
  }

  const operatorEmail = (session as { email?: string | null })?.email ?? null;

  return {
    admin,
    shopDomain: session.shop,
    operatorEmail,
  }; // Shopify session shop is domain
}
