/**
 * HTTP Server Utilities
 *
 * Server-side HTTP response helpers
 */
/**
 * Create a JSON response (React Router 7 pattern)
 *
 * @param data - Data to serialize as JSON
 * @param init - Response init options
 * @returns Response with JSON content
 */
export declare function json<T>(data: T, init?: ResponseInit): Response;
/**
 * Create a redirect response
 *
 * @param url - URL to redirect to
 * @param status - HTTP status code (default: 302)
 * @returns Redirect response
 */
export declare function redirect(url: string, status?: number): Response;
//# sourceMappingURL=http.server.d.ts.map