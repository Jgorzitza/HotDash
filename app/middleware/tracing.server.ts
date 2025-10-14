/**
 * Distributed tracing middleware
 * 
 * Implements W3C Trace Context standard for distributed tracing
 * across services and API calls.
 * 
 * Headers:
 * - traceparent: version-trace_id-parent_id-trace_flags
 * - tracestate: vendor-specific trace data
 */

interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sampled: boolean;
}

/**
 * Generate a random trace ID (32 hex characters)
 */
function generateTraceId(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

/**
 * Generate a random span ID (16 hex characters)
 */
function generateSpanId(): string {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

/**
 * Parse traceparent header
 * Format: 00-{trace_id}-{parent_id}-{flags}
 */
function parseTraceparent(header: string): TraceContext | null {
  const parts = header.split("-");

  if (parts.length !== 4) {
    return null;
  }

  const [version, traceId, parentId, flags] = parts;

  if (version !== "00") {
    return null; // Only support version 00
  }

  return {
    traceId,
    spanId: generateSpanId(),
    parentSpanId: parentId,
    sampled: flags === "01",
  };
}

/**
 * Format traceparent header
 */
function formatTraceparent(context: TraceContext): string {
  const flags = context.sampled ? "01" : "00";
  return `00-${context.traceId}-${context.spanId}-${flags}`;
}

/**
 * Extract or create trace context from request
 */
export function getTraceContext(request: Request): TraceContext {
  const traceparent = request.headers.get("traceparent");

  if (traceparent) {
    const parsed = parseTraceparent(traceparent);
    if (parsed) {
      return parsed;
    }
  }

  // Create new trace context
  return {
    traceId: generateTraceId(),
    spanId: generateSpanId(),
    sampled: true, // Sample all requests by default
  };
}

/**
 * Add trace headers to outgoing requests
 */
export function addTraceHeaders(
  headers: Headers | Record<string, string>,
  context: TraceContext,
): void {
  const traceparent = formatTraceparent(context);

  if (headers instanceof Headers) {
    headers.set("traceparent", traceparent);
    headers.set("x-trace-id", context.traceId);
    headers.set("x-span-id", context.spanId);
  } else {
    headers["traceparent"] = traceparent;
    headers["x-trace-id"] = context.traceId;
    headers["x-span-id"] = context.spanId;
  }
}

/**
 * Middleware wrapper for distributed tracing
 * 
 * @example
 * ```typescript
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   return withTracing(request, async (traceContext) => {
 *     // Your loader logic with trace context
 *     console.log('Trace ID:', traceContext.traceId);
 *     return Response.json({ data: 'example' });
 *   });
 * }
 * ```
 */
export async function withTracing(
  request: Request,
  handler: (context: TraceContext) => Promise<Response>,
): Promise<Response> {
  const traceContext = getTraceContext(request);

  // Add trace context to console logs
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args: unknown[]) => {
    originalLog(`[trace:${traceContext.traceId}]`, ...args);
  };

  console.error = (...args: unknown[]) => {
    originalError(`[trace:${traceContext.traceId}]`, ...args);
  };

  try {
    const response = await handler(traceContext);

    // Add trace headers to response
    response.headers.set("x-trace-id", traceContext.traceId);
    response.headers.set("x-span-id", traceContext.spanId);

    return response;
  } finally {
    // Restore original console methods
    console.log = originalLog;
    console.error = originalError;
  }
}

/**
 * Create a child span for nested operations
 */
export function createChildSpan(parentContext: TraceContext): TraceContext {
  return {
    traceId: parentContext.traceId,
    spanId: generateSpanId(),
    parentSpanId: parentContext.spanId,
    sampled: parentContext.sampled,
  };
}

