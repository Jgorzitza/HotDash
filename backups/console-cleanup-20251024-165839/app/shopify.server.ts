import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";

import prisma from "./db.server";
import { getEnvironmentConfig } from "./utils/env.server";

// Load and validate environment configuration
const config = getEnvironmentConfig();

const shopify = shopifyApp({
  apiKey: config.shopifyApiKey,
  apiSecretKey: config.shopifyApiSecret,
  apiVersion: ApiVersion.October25,
  scopes: config.scopes,
  appUrl: config.shopifyAppUrl,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  // Register shop-specific webhooks after install/login
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/uninstalled",
    },
    APP_SCOPES_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/scopes_update",
    },
  },
  hooks: {
    // Ensure webhooks are created for each shop post-auth
    afterAuth: async ({ session }) => {
      try {
        await shopify.registerWebhooks({ session });
        // eslint-disable-next-line no-console
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("❌ Failed to register webhooks:", (err as Error)?.message);
      }
    },
  },
  ...(config.customShopDomain
    ? { customShopDomains: [config.customShopDomain] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;

// Export configuration for use in other modules
export { config as environmentConfig };
