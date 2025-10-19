/**
 * Publer Error Handler
 *
 * Centralized error handling and retry logic for Publer API.
 * Implements exponential backoff for rate limits and transient failures.
 *
 * @see app/adapters/publer/client.mock.ts
 */

/**
 * Publer API Error
 */
export class PublerAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public retryable?: boolean,
  ) {
    super(message);
    this.name = "PublerAPIError";
  }
}

/**
 * Retry with Exponential Backoff
 *
 * Retries failed operations with increasing delays.
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum retry attempts
 * @param baseDelay - Base delay in ms (doubled each retry)
 * @returns Function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry non-retryable errors
      if (error instanceof PublerAPIError && !error.retryable) {
        throw error;
      }

      // Last attempt - throw error
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate delay with exponential backoff + jitter
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));

      console.log(
        `[RETRY] Attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
      );
    }
  }

  throw lastError!;
}

/**
 * Handle Publer API Error
 *
 * Categorizes errors and determines retry strategy.
 *
 * @param error - Error from Publer API
 * @returns Processed error
 */
export function handlePublerError(error: any): PublerAPIError {
  // Rate limit errors (429)
  if (error.status === 429 || error.message?.includes("rate limit")) {
    return new PublerAPIError(
      "Publer API rate limit exceeded - retry after reset",
      429,
      "RATE_LIMIT",
      true, // Retryable
    );
  }

  // Authentication errors (401, 403)
  if (error.status === 401 || error.status === 403) {
    return new PublerAPIError(
      "Publer authentication failed - check token",
      error.status,
      "AUTH_ERROR",
      false, // Not retryable - needs manual fix
    );
  }

  // Server errors (500, 502, 503)
  if (error.status >= 500) {
    return new PublerAPIError(
      "Publer server error - retry may succeed",
      error.status,
      "SERVER_ERROR",
      true, // Retryable
    );
  }

  // Client errors (400, 404)
  if (error.status >= 400 && error.status < 500) {
    return new PublerAPIError(
      "Publer request error - check parameters",
      error.status,
      "CLIENT_ERROR",
      false, // Not retryable - bad request
    );
  }

  // Network errors
  if (
    error.message?.includes("fetch failed") ||
    error.message?.includes("ECONNREFUSED")
  ) {
    return new PublerAPIError(
      "Network error - check connection",
      undefined,
      "NETWORK_ERROR",
      true, // Retryable
    );
  }

  // Unknown error
  return new PublerAPIError(
    error.message || "Unknown Publer API error",
    error.status,
    "UNKNOWN_ERROR",
    false,
  );
}
