/**
 * Centralized Error Handling and Retries
 * Owner: integrations agent
 * Date: 2025-10-16
 */

import { logger } from "../utils/logger.server";

export class APIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly retryable: boolean = false,
    public readonly context?: Record<string, any>,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class NetworkError extends APIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "NETWORK_ERROR", 503, true, context);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends APIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "TIMEOUT_ERROR", 504, true, context);
    this.name = "TimeoutError";
  }
}

export class RateLimitError extends APIError {
  constructor(message: string, public readonly retryAfterMs?: number, context?: Record<string, any>) {
    super(message, "RATE_LIMIT_ERROR", 429, true, context);
    this.name = "RateLimitError";
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "AUTHENTICATION_ERROR", 401, false, context);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public readonly errors?: any[], context?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", 400, false, context);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends APIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "NOT_FOUND_ERROR", 404, false, context);
    this.name = "NotFoundError";
  }
}

export class ServerError extends APIError {
  constructor(message: string, statusCode = 500, context?: Record<string, any>) {
    super(message, "SERVER_ERROR", statusCode, true, context);
    this.name = "ServerError";
  }
}

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
  retryableErrors: Array<new (...args: any[]) => Error>;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
  retryableErrors: [NetworkError, TimeoutError, RateLimitError, ServerError],
};

function isRetryable(error: Error, config: RetryConfig): boolean {
  if (error instanceof APIError) return error.retryable;
  return config.retryableErrors.some(ErrorClass => error instanceof ErrorClass);
}

function calculateDelay(attempt: number, config: RetryConfig, error?: Error): number {
  let baseDelay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
  if (error instanceof RateLimitError && error.retryAfterMs) {
    baseDelay = error.retryAfterMs;
  }
  const jitter = Math.random() * config.jitterFactor * baseDelay;
  return Math.min(baseDelay + jitter, config.maxDelayMs);
}

export async function withRetry<T>(fn: () => Promise<T>, config: Partial<RetryConfig> = {}): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (!isRetryable(lastError, finalConfig) || attempt === finalConfig.maxRetries) {
        throw lastError;
      }
      
      const delay = calculateDelay(attempt, finalConfig, lastError);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

export function httpStatusToError(status: number, message: string, context?: Record<string, any>): APIError {
  if (status === 401 || status === 403) return new AuthenticationError(message, context);
  if (status === 404) return new NotFoundError(message, context);
  if (status === 400 || status === 422) return new ValidationError(message, undefined, context);
  if (status === 429) return new RateLimitError(message, undefined, context);
  if (status === 504) return new TimeoutError(message, context);
  if (status >= 500) return new ServerError(message, status, context);
  return new APIError(message, "UNKNOWN_ERROR", status, false, context);
}

export function serializeError(error: unknown): Record<string, any> {
  if (error instanceof APIError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      retryable: error.retryable,
      context: error.context,
    };
  }
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  return { message: String(error) };
}
