/**
 * Shopify Configuration for Store Switch Implementation
 *
 * Handles parameterized Shopify store configuration for dev→prod switch
 * Replaces hardcoded domains with environment-based configuration
 */
/**
 * Get Shopify store configuration from environment variables
 * Throws if required environment variables are missing
 */
export function getShopifyStoreConfig() {
    const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
    const appUrl = process.env.SHOPIFY_APP_URL;
    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET;
    const scopes = process.env.SCOPES;
    if (!shopDomain) {
        throw new Error("SHOPIFY_SHOP_DOMAIN environment variable is required");
    }
    if (!appUrl) {
        throw new Error("SHOPIFY_APP_URL environment variable is required");
    }
    if (!apiKey) {
        throw new Error("SHOPIFY_API_KEY environment variable is required");
    }
    if (!apiSecret) {
        throw new Error("SHOPIFY_API_SECRET environment variable is required");
    }
    if (!scopes) {
        throw new Error("SCOPES environment variable is required");
    }
    return {
        shopDomain,
        appUrl,
        apiKey,
        apiSecret,
        scopes: scopes.split(",").map((s) => s.trim()),
        isProduction: process.env.NODE_ENV === "production",
    };
}
/**
 * Get the current shop domain for API calls
 * Uses environment variable instead of hardcoded values
 */
export function getCurrentShopDomain() {
    const config = getShopifyStoreConfig();
    return config.shopDomain;
}
/**
 * Get OAuth redirect URLs for the current app configuration
 * Parameterized based on SHOPIFY_APP_URL environment variable
 */
export function getShopifyAuthRedirectUrls() {
    const config = getShopifyStoreConfig();
    return [
        `${config.appUrl}/auth/callback`,
        `${config.appUrl}/api/auth`, // Legacy support
    ];
}
/**
 * Validate that the current configuration is production-ready
 * Checks for required environment variables and proper domain format
 */
export function validateProductionConfig() {
    const errors = [];
    try {
        const config = getShopifyStoreConfig();
        // Validate domain format
        if (!config.shopDomain.includes('.myshopify.com')) {
            errors.push('SHOPIFY_SHOP_DOMAIN must be a valid Shopify domain (e.g., store.myshopify.com)');
        }
        // Validate app URL format
        if (!config.appUrl.startsWith('https://')) {
            errors.push('SHOPIFY_APP_URL must use HTTPS in production');
        }
        // Validate required scopes
        const requiredScopes = ['read_orders', 'read_products', 'read_inventory', 'read_locations'];
        const missingScopes = requiredScopes.filter(scope => !config.scopes.includes(scope));
        if (missingScopes.length > 0) {
            errors.push(`Missing required scopes: ${missingScopes.join(', ')}`);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            errors.push(error.message);
        }
        else {
            errors.push('Unknown configuration error');
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
//# sourceMappingURL=shopify.server.js.map