/**
 * Shared testing utilities and helpers
 *
 * Provides reusable functions for test setup, mocking, and assertions
 */

import { vi } from "vitest";

/**
 * Create mock fetch response
 */
export function createMockResponse(
  data: any,
  status: number = 200,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * Mock Shopify Admin GraphQL response
 */
export function mockShopifyResponse(data: any, errors: any[] = []) {
  return createMockResponse({
    data,
    errors: errors.length > 0 ? errors : undefined,
  });
}

/**
 * Create mock ServiceError
 */
export function createMockServiceError(
  message: string,
  scope: string,
  code: string = "TEST_ERROR",
) {
  return {
    message,
    scope,
    code,
    retryable: false,
    cause: undefined,
  };
}

/**
 * Wait for async operations to complete
 */
export function waitForAsync(ms: number = 10): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock environment variables for testing
 */
export function withEnv<T>(
  envVars: Record<string, string | undefined>,
  fn: () => T,
): T {
  const originalEnv = { ...process.env };

  Object.assign(process.env, envVars);

  try {
    return fn();
  } finally {
    process.env = originalEnv;
  }
}

/**
 * Mock console methods for testing
 */
export function mockConsole() {
  const consoleSpy = {
    log: vi.spyOn(console, "log").mockImplementation(() => {}),
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
    warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
    info: vi.spyOn(console, "info").mockImplementation(() => {}),
  };

  return {
    ...consoleSpy,
    restore: () => {
      consoleSpy.log.mockRestore();
      consoleSpy.error.mockRestore();
      consoleSpy.warn.mockRestore();
      consoleSpy.info.mockRestore();
    },
  };
}

/**
 * Create mock Request object for testing
 */
export function createMockRequest(
  url: string = "https://example.com/test",
  options: RequestInit = {},
): Request {
  return new Request(url, options);
}

/**
 * Assert that function throws specific error
 */
export async function assertThrows(
  fn: () => Promise<any>,
  expectedMessage?: string,
): Promise<Error> {
  try {
    await fn();
    throw new Error("Expected function to throw but it did not");
  } catch (error: any) {
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(
        `Expected error message to include "${expectedMessage}" but got "${error.message}"`,
      );
    }
    return error;
  }
}

/**
 * Create mock date range
 */
export function createMockDateRange(daysAgo: number = 7) {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - daysAgo);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}
