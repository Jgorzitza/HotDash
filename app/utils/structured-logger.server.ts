/**
 * Structured Logging Utility
 *
 * Provides structured logging with consistent format, levels, and metadata.
 * Logs are output as JSON in production for easier parsing by log aggregators.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service?: string;
  module?: string;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface LoggerOptions {
  service: string;
  module?: string;
  minLevel?: LogLevel;
  pretty?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Structured Logger class
 */
export class StructuredLogger {
  private service: string;
  private module?: string;
  private minLevel: LogLevel;
  private pretty: boolean;

  constructor(options: LoggerOptions) {
    this.service = options.service;
    this.module = options.module;
    this.minLevel = options.minLevel || "info";
    this.pretty = options.pretty ?? process.env.NODE_ENV !== "production";
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log("debug", message, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log("info", message, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log("warn", message, metadata);
  }

  /**
   * Log error message
   */
  error(
    message: string,
    error?: Error | unknown,
    metadata?: Record<string, any>,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      service: this.service,
      module: this.module,
      metadata,
    };

    if (error instanceof Error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }

    this.write(entry);
  }

  /**
   * Generic log method
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
  ): void {
    // Check if log level is enabled
    if (LOG_LEVELS[level] < LOG_LEVELS[this.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      module: this.module,
      metadata,
    };

    this.write(entry);
  }

  /**
   * Write log entry to console
   */
  private write(entry: LogEntry): void {
    if (this.pretty) {
      // Pretty print for development
      const color = this.getColor(entry.level);
      const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.service}${entry.module ? `:${entry.module}` : ""}]`;
      console.log(`${color}${prefix}\x1b[0m ${entry.message}`);

      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        console.log("  Metadata:", entry.metadata);
      }

      if (entry.error) {
        console.log("  Error:", entry.error.message);
        if (entry.error.stack) {
          console.log(entry.error.stack);
        }
      }
    } else {
      // JSON output for production
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Get ANSI color code for log level
   */
  private getColor(level: LogLevel): string {
    const colors: Record<LogLevel, string> = {
      debug: "\x1b[36m", // Cyan
      info: "\x1b[32m", // Green
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
    };
    return colors[level] || "";
  }

  /**
   * Create child logger with additional context
   */
  child(module: string): StructuredLogger {
    return new StructuredLogger({
      service: this.service,
      module: this.module ? `${this.module}.${module}` : module,
      minLevel: this.minLevel,
      pretty: this.pretty,
    });
  }

  /**
   * Time an operation
   */
  async time<T>(operationName: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    this.debug(`Starting: ${operationName}`);

    try {
      const result = await fn();
      const duration = Math.round(performance.now() - start);
      this.info(`Completed: ${operationName}`, { durationMs: duration });
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      this.error(`Failed: ${operationName}`, error, { durationMs: duration });
      throw error;
    }
  }
}

/**
 * Create logger instance for a service
 */
export function createLogger(
  service: string,
  options?: Partial<LoggerOptions>,
): StructuredLogger {
  return new StructuredLogger({
    service,
    ...options,
  });
}

/**
 * Default application logger
 */
export const appLogger = createLogger("hotdash-app", {
  minLevel: (process.env.LOG_LEVEL as LogLevel) || "info",
});

/**
 * Service-specific loggers
 */
export const shopifyLogger = appLogger.child("shopify");
export const gaLogger = appLogger.child("ga");
export const chatwootLogger = appLogger.child("chatwoot");
export const agentLogger = appLogger.child("agent");
