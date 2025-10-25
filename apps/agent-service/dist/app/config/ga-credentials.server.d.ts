/**
 * Google Analytics Credentials Initialization
 *
 * Handles loading GA4 service account credentials from environment variables.
 * Supports both file-based credentials (local) and base64-encoded credentials (Fly.io).
 */
/**
 * Initialize Google Analytics credentials
 *
 * This function should be called early in the application lifecycle.
 * It handles two scenarios:
 *
 * 1. Local development: GOOGLE_APPLICATION_CREDENTIALS points to a file
 * 2. Production (Fly.io): GOOGLE_APPLICATION_CREDENTIALS_BASE64 contains base64-encoded JSON
 */
export declare function initializeGACredentials(): void;
//# sourceMappingURL=ga-credentials.server.d.ts.map