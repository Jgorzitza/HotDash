/**
 * Structured Logger
 * 
 * Provides structured logging with request_id, user_id, and latency tracking.
 * Logs are output in JSON format for easy parsing and aggregation.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  request_id?: string;
  user_id?: string;
  session_id?: string;
  shop_id?: string;
  correlation_id?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  latency_ms?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private context: LogContext = {};
  private startTime?: number;

  constructor(initialContext: LogContext = {}) {
    this.context = initialContext;
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }

  /**
   * Start a timer for latency tracking
   */
  startTimer(): void {
    this.startTime = Date.now();
  }

  /**
   * Get elapsed time since startTimer was called
   */
  private getLatency(): number | undefined {
    if (this.startTime) {
      return Date.now() - this.startTime;
    }
    return undefined;
  }

  /**
   * Log a message at the specified level
   */
  private log(level: LogLevel, message: string, additionalContext: LogContext = {}): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...additionalContext },
    };

    const latency = this.getLatency();
    if (latency !== undefined) {
      entry.latency_ms = latency;
    }

    // In production, write to stdout as JSON
    // In development, pretty print
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(entry));
    } else {
      const color = this.getColor(level);
      const reset = '\x1b[0m';
      console.log(
        `${color}[${entry.timestamp}] ${level.toUpperCase()}${reset}: ${message}`,
        entry.context,
        latency !== undefined ? `(${latency}ms)` : ''
      );
    }
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return '\x1b[36m'; // Cyan
      case 'info':
        return '\x1b[32m'; // Green
      case 'warn':
        return '\x1b[33m'; // Yellow
      case 'error':
        return '\x1b[31m'; // Red
      case 'fatal':
        return '\x1b[35m'; // Magenta
      default:
        return '\x1b[0m'; // Reset
    }
  }

  debug(message: string, context: LogContext = {}): void {
    this.log('debug', message, context);
  }

  info(message: string, context: LogContext = {}): void {
    this.log('info', message, context);
  }

  warn(message: string, context: LogContext = {}): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context: LogContext = {}): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context: { ...this.context, ...context },
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    const latency = this.getLatency();
    if (latency !== undefined) {
      entry.latency_ms = latency;
    }

    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify(entry));
    } else {
      const color = '\x1b[31m';
      const reset = '\x1b[0m';
      console.error(
        `${color}[${entry.timestamp}] ERROR${reset}: ${message}`,
        entry.context,
        error,
        latency !== undefined ? `(${latency}ms)` : ''
      );
    }
  }

  fatal(message: string, error?: Error, context: LogContext = {}): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'fatal',
      message,
      context: { ...this.context, ...context },
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    console.error(JSON.stringify(entry));
    
    // Fatal errors should exit the process
    process.exit(1);
  }
}

// Create a default logger instance
export const logger = new Logger();

// Middleware to add request context to logger
export function loggerMiddleware() {
  return async (req: Request, next: () => Promise<Response>) => {
    const requestId = crypto.randomUUID();
    const url = new URL(req.url);
    
    // Create request-scoped logger
    const requestLogger = logger.child({
      request_id: requestId,
      method: req.method,
      path: url.pathname,
      user_agent: req.headers.get('user-agent') || undefined,
    });

    requestLogger.startTimer();
    requestLogger.info('Request started');

    try {
      const response = await next();
      requestLogger.info('Request completed', {
        status_code: response.status,
      });
      
      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);
      
      return response;
    } catch (error) {
      requestLogger.error('Request failed', error as Error, {
        status_code: 500,
      });
      throw error;
    }
  };
}

// Helper to extract user context from session
export function withUserContext(userId: string, shopId?: string): Logger {
  return logger.child({
    user_id: userId,
    shop_id: shopId,
  });
}

// Helper for database operation logging
export function logDatabaseOperation(operation: string, table: string, duration: number): void {
  logger.info('Database operation', {
    operation,
    table,
    latency_ms: duration,
  });
}

// Helper for API call logging
export function logApiCall(
  service: string,
  operation: string,
  duration: number,
  success: boolean,
  error?: Error
): void {
  if (success) {
    logger.info('API call succeeded', {
      service,
      operation,
      latency_ms: duration,
    });
  } else {
    logger.error('API call failed', error, {
      service,
      operation,
      latency_ms: duration,
    });
  }
}

