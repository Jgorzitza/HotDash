/**
 * Google Search Console Configuration
 *
 * Provides configuration for Search Console API integration.
 * Uses service account authentication similar to GA integration.
 */
/**
 * Get Search Console configuration from environment variables.
 *
 * Environment variables:
 * - SEARCH_CONSOLE_SITE_URL: The site URL registered in Search Console
 * - SEARCH_CONSOLE_PROPERTY_ID: (Optional) Specific property ID
 * - GOOGLE_APPLICATION_CREDENTIALS: Service account credentials (shared with GA)
 *
 * @returns {SearchConsoleConfig} Configuration object
 */
export function getSearchConsoleConfig() {
    const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL ?? "https://hotrodan.com";
    const propertyId = process.env.SEARCH_CONSOLE_PROPERTY_ID;
    return {
        siteUrl,
        propertyId,
    };
}
//# sourceMappingURL=search-console.server.js.map