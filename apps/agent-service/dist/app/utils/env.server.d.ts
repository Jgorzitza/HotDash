/**
 * Environment configuration utilities for HotDash
 * Handles Shopify app configuration, embed token validation, and React Router 7 integration
 */
export interface HotDashEnvironmentConfig {
    shopifyApiKey: string;
    shopifyApiSecret: string;
    shopifyAppUrl: string;
    scopes: string[];
    nodeEnv: string;
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
    customShopDomain?: string;
}
/**
 * Get validated environment configuration
 * Throws if required environment variables are missing
 */
export declare function getEnvironmentConfig(): HotDashEnvironmentConfig;
/**
 * Check if request is in mock mode for testing/development
 * Supports both URL parameter and environment variable
 */
export declare function isMockMode(request: Request): boolean;
/**
 * Get the current app URL with proper protocol and domain
 * Handles local development vs staging/production
 */
export declare function getAppUrl(request?: Request): string;
/**
 * Generate redirect URLs for auth configuration
 * Supports both legacy /api/auth and new /auth/callback patterns
 */
export declare function getAuthRedirectUrls(baseUrl?: string): string[];
//# sourceMappingURL=env.server.d.ts.map