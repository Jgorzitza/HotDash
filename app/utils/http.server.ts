/**
 * HTTP Server Utilities
 * Stub implementation for JSON responses
 */

export function json<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, init);
}
