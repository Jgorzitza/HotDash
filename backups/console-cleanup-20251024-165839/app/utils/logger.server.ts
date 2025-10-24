/**
 * Server-side logging utility that integrates with Supabase edge function
 * for centralized observability logging.
 *
 * This handles ServiceError logging and general application logging
 * with structured metadata for better observability.
 */

import { ServiceError } from "../services/types";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userAgent?: string;
}

class Logger {
  private readonly supabaseUrl: string;
  private readonly serviceKey: string;
  private readonly edgeFunctionUrl: string;

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL!;
    this.serviceKey = process.env.SUPABASE_SERVICE_KEY!;
    this.edgeFunctionUrl = `${this.supabaseUrl}/functions/v1/occ-log`;

    if (!this.supabaseUrl || !this.serviceKey) {
      console.warn(
        "Logger: SUPABASE_URL or SUPABASE_SERVICE_KEY not configured. " +
          "Falling back to console logging only.",
      );
    }
  }

  private async sendToEdgeFunction(entry: LogEntry): Promise<void> {
    if (!this.supabaseUrl || !this.serviceKey) {
      // Fallback to console logging if Supabase not configured
      console.log(`[${entry.level}] ${entry.message}`, entry.metadata);
      return;
    }

    try {
      const response = await fetch(this.edgeFunctionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Logger edge function error: ${response.status} ${errorText}`,
        );
        // Fallback to console
        console.log(`[${entry.level}] ${entry.message}`, entry.metadata);
      }
    } catch (error) {
      console.error("Failed to send log to edge function:", error);
      // Fallback to console
      console.log(`[${entry.level}] ${entry.message}`, entry.metadata);
    }
  }

  private createEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    request?: Request,
  ): LogEntry {
    return {
      level,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      requestId: request?.headers.get("x-request-id") || undefined,
      userAgent: request?.headers.get("user-agent") || undefined,
    };
  }

  debug(
    message: string,
    metadata?: Record<string, any>,
    request?: Request,
  ): void {
    const entry = this.createEntry("DEBUG", message, metadata, request);
    this.sendToEdgeFunction(entry).catch(() => {}); // Fire and forget
  }

  info(
    message: string,
    metadata?: Record<string, any>,
    request?: Request,
  ): void {
    const entry = this.createEntry("INFO", message, metadata, request);
    this.sendToEdgeFunction(entry).catch(() => {}); // Fire and forget
  }

  warn(
    message: string,
    metadata?: Record<string, any>,
    request?: Request,
  ): void {
    const entry = this.createEntry("WARN", message, metadata, request);
    this.sendToEdgeFunction(entry).catch(() => {}); // Fire and forget
  }

  error(
    message: string,
    metadata?: Record<string, any>,
    request?: Request,
  ): void {
    const entry = this.createEntry("ERROR", message, metadata, request);
    this.sendToEdgeFunction(entry).catch(() => {}); // Fire and forget
  }

  fatal(
    message: string,
    metadata?: Record<string, any>,
    request?: Request,
  ): void {
    const entry = this.createEntry("FATAL", message, metadata, request);
    this.sendToEdgeFunction(entry).catch(() => {}); // Fire and forget
  }

  /**
   * Logs ServiceError with structured metadata including scope, code, and cause
   */
  logServiceError(
    error: ServiceError,
    request?: Request,
    additionalMetadata?: Record<string, any>,
  ): void {
    const metadata = {
      scope: error.scope,
      code: error.code,
      retryable: error.retryable,
      cause: error.cause,
      stack: error.stack,
      ...additionalMetadata,
    };

    this.error(
      `ServiceError in ${error.scope}: ${error.message}`,
      metadata,
      request,
    );
  }

  /**
   * Logs general errors with structured metadata
   */
  logError(
    error: Error,
    context: string,
    request?: Request,
    additionalMetadata?: Record<string, any>,
  ): void {
    const metadata = {
      context,
      errorName: error.name,
      stack: error.stack,
      ...additionalMetadata,
    };

    this.error(`Error in ${context}: ${error.message}`, metadata, request);
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Middleware-style helper to add request context to logs
 */
export function withRequestLogger(request: Request) {
  return {
    debug: (message: string, metadata?: Record<string, any>) =>
      logger.debug(message, metadata, request),
    info: (message: string, metadata?: Record<string, any>) =>
      logger.info(message, metadata, request),
    warn: (message: string, metadata?: Record<string, any>) =>
      logger.warn(message, metadata, request),
    error: (message: string, metadata?: Record<string, any>) =>
      logger.error(message, metadata, request),
    fatal: (message: string, metadata?: Record<string, any>) =>
      logger.fatal(message, metadata, request),
    logServiceError: (
      error: ServiceError,
      additionalMetadata?: Record<string, any>,
    ) => logger.logServiceError(error, request, additionalMetadata),
    logError: (
      error: Error,
      context: string,
      additionalMetadata?: Record<string, any>,
    ) => logger.logError(error, context, request, additionalMetadata),
  };
}
