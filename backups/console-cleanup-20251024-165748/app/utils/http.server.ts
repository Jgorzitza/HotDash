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
export function json<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });
}

/**
 * Create a redirect response
 *
 * @param url - URL to redirect to
 * @param status - HTTP status code (default: 302)
 * @returns Redirect response
 */
export function redirect(url: string, status: number = 302): Response {
  return new Response(null, {
    status,
    headers: {
      Location: url,
    },
  });
}
