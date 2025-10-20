/**
 * HTTP Server Utilities
 *
 * Lightweight wrappers for React Router responses
 */

/**
 * JSON response helper
 * Wrapper around React Router's Response for consistency
 */
export function json<T>(data: T, init?: ResponseInit | number): Response {
  const responseInit = typeof init === "number" ? { status: init } : init;

  const headers = new Headers(responseInit?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }

  return new Response(JSON.stringify(data), {
    ...responseInit,
    headers,
  });
}

/**
 * Redirect helper
 */
export function redirect(url: string, init?: ResponseInit | number): Response {
  const responseInit = typeof init === "number" ? { status: init } : init;
  return new Response(null, {
    status: 302,
    ...responseInit,
    headers: {
      Location: url,
      ...responseInit?.headers,
    },
  });
}
