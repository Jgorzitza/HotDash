/**
 * Structured Logger with Request ID, Latency, Outcome
 * Owner: integrations agent
 * Date: 2025-10-15
 */

import { randomUUID } from "crypto";
import { logger as baseLogger } from "../utils/logger.server";

export interface LogContext {
  requestId?: string;
  userId?: string;
  shopDomain?: string;
  operation?: string;
  latencyMs?: number;
  outcome?: 'success' | 'error' | 'timeout' | 'rate_limited';
  [key: string]: any;
}

export class StructuredLogger {
  private context: LogContext;

  constructor(initialContext: LogContext = {}) {
    this.context = {
      requestId: initialContext.requestId || randomUUID(),
      ...initialContext,
    };
  }

  withContext(additionalContext: LogContext): StructuredLogger {
    return new StructuredLogger({
      ...this.context,
      ...additionalContext,
    });
  }

  debug(message: string, context?: LogContext): void {
    baseLogger.debug(message, { ...this.context, ...context });
  }

  info(message: string, context?: LogContext): void {
    baseLogger.info(message, { ...this.context, ...context });
  }

  warn(message: string, context?: LogContext): void {
    baseLogger.warn(message, { ...this.context, ...context });
  }

  error(message: string, context?: LogContext): void {
    baseLogger.error(message, { ...this.context, ...context });
  }

  async trackOperation<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();
    const opLogger = this.withContext({ operation });

    try {
      opLogger.info("Starting operation: " + operation);
      const result = await fn();
      const latencyMs = Date.now() - startTime;

      opLogger.info("Operation completed: " + operation, {
        latencyMs,
        outcome: 'success',
      });

      return result;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const outcome = error instanceof Error && error.message.includes('timeout')
        ? 'timeout'
        : error instanceof Error && error.message.includes('rate limit')
        ? 'rate_limited'
        : 'error';

      opLogger.error("Operation failed: " + operation, {
        latencyMs,
        outcome,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }
}

export function createLogger(context?: LogContext): StructuredLogger {
  return new StructuredLogger(context);
}
