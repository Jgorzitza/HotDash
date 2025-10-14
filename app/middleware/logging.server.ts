/**
 * Logging middleware for API routes
 * 
 * Provides structured logging for requests and responses
 * with performance tracking and error capture.
 */

interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  error?: string;
}

class RequestLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 requests

  /**
   * Log a request/response
   */
  log(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console log for development
    const statusColor = entry.status >= 500 ? "🔴" : entry.status >= 400 ? "🟡" : "🟢";
    console.log(
      `${statusColor} [${entry.method}] ${entry.path} - ${entry.status} (${entry.duration}ms)`,
    );

    // Log errors
    if (entry.error) {
      console.error(`  Error: ${entry.error}`);
    }
  }

  /**
   * Get recent logs
   */
  getLogs(limit = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get error logs only
   */
  getErrors(limit = 50): LogEntry[] {
    return this.logs.filter((log) => log.status >= 400).slice(-limit);
  }

  /**
   * Get slow requests (>1s)
   */
  getSlowRequests(limit = 50): LogEntry[] {
    return this.logs.filter((log) => log.duration > 1000).slice(-limit);
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }
}

// Singleton instance
export const requestLogger = new RequestLogger();

/**
 * Middleware wrapper for logging requests
 * 
 * @example
 * ```typescript
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   return withLogging(request, async () => {
 *     // Your loader logic here
 *     return Response.json({ data: 'example' });
 *   });
 * }
 * ```
 */
export async function withLogging(
  request: Request,
  handler: () => Promise<Response>,
): Promise<Response> {
  const start = Date.now();
  const url = new URL(request.url);

  try {
    const response = await handler();
    const duration = Date.now() - start;

    requestLogger.log({
      timestamp: new Date().toISOString(),
      method: request.method,
      path: url.pathname,
      status: response.status,
      duration,
      userAgent: request.headers.get("user-agent") || undefined,
      ip: request.headers.get("x-forwarded-for") || undefined,
    });

    return response;
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : String(error);

    requestLogger.log({
      timestamp: new Date().toISOString(),
      method: request.method,
      path: url.pathname,
      status: 500,
      duration,
      userAgent: request.headers.get("user-agent") || undefined,
      ip: request.headers.get("x-forwarded-for") || undefined,
      error: errorMessage,
    });

    throw error;
  }
}

