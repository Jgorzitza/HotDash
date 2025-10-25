/**
 * Shopify Configuration for Store Switch Implementation
 *
 * Handles parameterized Shopify store configuration for dev→prod switch
 * Replaces hardcoded domains with environment-based configuration
 */
export interface ShopifyStoreConfig {
    shopDomain: string;
    appUrl: string;
    apiKey: string;
    apiSecret: string;
    scopes: string[];
    isProduction: boolean;
}
/**
 * Get Shopify store configuration from environment variables
 * Throws if required environment variables are missing
 */
export declare function getShopifyStoreConfig(): ShopifyStoreConfig;
/**
 * Get the current shop domain for API calls
 * Uses environment variable instead of hardcoded values
 */
export declare function getCurrentShopDomain(): string;
/**
 * Get OAuth redirect URLs for the current app configuration
 * Parameterized based on SHOPIFY_APP_URL environment variable
 */
export declare function getShopifyAuthRedirectUrls(): string[];
/**
 * Validate that the current configuration is production-ready
 * Checks for required environment variables and proper domain format
 */
export declare function validateProductionConfig(): {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=shopify.server.d.ts.map