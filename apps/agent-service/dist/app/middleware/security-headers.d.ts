/**
 * Security Headers Middleware
 *
 * Implements comprehensive security headers for all HTTP responses
 * Follows OWASP security best practices and React Router 7 patterns
 *
 * Task: SECURITY-AUDIT-004
 */
export interface SecurityHeadersConfig {
    enableHSTS: boolean;
    enableCSP: boolean;
    enableFrameProtection: boolean;
    environment: 'development' | 'production';
}
/**
 * Get security headers for HTTP responses
 *
 * @param config - Security headers configuration
 * @returns Headers object with security headers
 */
export declare function getSecurityHeaders(config?: Partial<SecurityHeadersConfig>): Headers;
/**
 * Apply security headers to a Response
 *
 * @param response - Response object to add headers to
 * @param config - Security headers configuration
 * @returns Response with security headers applied
 */
export declare function applySecurityHeaders(response: Response, config?: Partial<SecurityHeadersConfig>): Response;
/**
 * Merge security headers with existing headers
 *
 * @param existingHeaders - Existing headers object
 * @param config - Security headers configuration
 * @returns Merged headers
 */
export declare function mergeSecurityHeaders(existingHeaders: Headers, config?: Partial<SecurityHeadersConfig>): Headers;
/**
 * Get secure cookie options
 *
 * @param environment - Current environment
 * @returns Cookie options object
 */
export declare function getSecureCookieOptions(environment?: 'development' | 'production'): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge: number;
};
/**
 * Validate HTTPS connection
 *
 * @param request - Request object
 * @returns True if HTTPS or localhost
 */
export declare function isSecureConnection(request: Request): boolean;
/**
 * Enforce HTTPS redirect
 *
 * @param request - Request object
 * @returns Redirect response if HTTP, null if HTTPS
 */
export declare function enforceHTTPS(request: Request): Response | null;
//# sourceMappingURL=security-headers.d.ts.map