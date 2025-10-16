/**
 * Retry Logic with Exponential Backoff
 * 
 * Implements retry logic for API calls with exponential backoff.
 * Backlog task #17: Retry + backoff on Chatwoot API
 */

import { Logger } from './observability';

/**
 * Retry options
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'],
  onRetry: () => {},
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  // Check error code
  if ('code' in error && typeof error.code === 'string') {
    if (retryableErrors.includes(error.code)) {
      return true;
    }
  }

  // Check HTTP status codes (5xx server errors)
  if ('status' in error && typeof error.status === 'number') {
    const status = error.status;
    if (status >= 500 && status < 600) {
      return true;
    }
    // Also retry on 429 (rate limit)
    if (status === 429) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Retry function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param options - Retry options
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const logger = new Logger('retry');

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if this is the last attempt
      if (attempt > opts.maxRetries) {
        logger.error('Max retries exceeded', lastError, {
          attempts: attempt,
          maxRetries: opts.maxRetries,
        });
        throw lastError;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(lastError, opts.retryableErrors)) {
        logger.warn('Non-retryable error encountered', {
          error: lastError.message,
          attempt,
        });
        throw lastError;
      }

      // Calculate delay
      const delay = calculateDelay(
        attempt,
        opts.initialDelayMs,
        opts.maxDelayMs,
        opts.backoffMultiplier
      );

      logger.warn('Retrying after error', {
        error: lastError.message,
        attempt,
        maxRetries: opts.maxRetries,
        delayMs: delay,
      });

      // Call onRetry callback
      opts.onRetry(lastError, attempt);

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed');
}

/**
 * Retry wrapper for Chatwoot API calls
 */
export async function chatwootApiCall<T>(
  fn: () => Promise<T>,
  operationName: string
): Promise<T> {
  const logger = new Logger('chatwoot-api');

  return withRetry(fn, {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    onRetry: (error, attempt) => {
      logger.warn(`Chatwoot API retry: ${operationName}`, {
        error: error.message,
        attempt,
      });
    },
  });
}

/**
 * Circuit breaker state
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }
}

/**
 * Global circuit breaker for Chatwoot API
 */
export const chatwootCircuitBreaker = new CircuitBreaker(5, 60000);

