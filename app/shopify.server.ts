import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
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
