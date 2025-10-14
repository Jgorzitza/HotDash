export interface JsonResponseInit extends Omit<ResponseInit, "headers"> {
  headers?: HeadersInit;
}

/**
 * Create a JSON response with consistent headers.
 */
export function jsonResponse<T>(
  body: T,
  init: JsonResponseInit = {},
): Response {
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}
