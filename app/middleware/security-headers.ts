/**
 * Security Headers Middleware
 *
 * Applies security headers to all responses to protect against common vulnerabilities:
 * - XSS attacks
 * - Clickjacking
 * - MIME sniffing
 * - Information leakage
 */

export function securityHeaders(): Record<string, string> {
  return {
    // HSTS: Force HTTPS for 1 year including subdomains
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",

    // Prevent clickjacking by denying iframe embedding
    "X-Frame-Options": "DENY",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // XSS protection (legacy but still supported)
    "X-XSS-Protection": "1; mode=block",

    // Referrer policy: Send origin only for cross-origin requests
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions policy: Disable unused browser features
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",

    // Prevent caching of sensitive responses (can override per-route)
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}

/**
 * Apply security headers to response
 * Usage in React Router loaders/actions:
 *
 * ```typescript
 * export async function loader() {
 *   return json({ data }, {
 *     headers: securityHeaders()
 *   });
 * }
 * ```
 */
export function withSecurityHeaders<T>(
  data: T,
  additionalHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      ...securityHeaders(),
      ...additionalHeaders,
    },
  });
}
