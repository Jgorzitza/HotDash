# Error Handling and Logging Standards

**Last Updated**: 2025-10-13  
**Owner**: Engineer  
**Status**: Production Standard

## Overview

This document defines the error handling and logging standards for the Hot Dash platform. Consistent error handling ensures reliability, debuggability, and excellent user experience.

## Error Handling Principles

### 1. Fail Gracefully

- ✅ **Never crash the app** - Catch and handle all errors
- ✅ **Show user-friendly messages** - No stack traces to users
- ✅ **Provide recovery options** - "Return to Dashboard" button
- ✅ **Log technical details** - For debugging by developers

### 2. Error Boundaries

Use React error boundaries for UI errors:

```typescript
// app/components/ErrorBoundary.tsx
import { ErrorBoundary } from '../components/ErrorBoundary';

// Wrap routes or components
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### 3. Try-Catch for Async Operations

Always wrap async operations:

```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const data = await fetchData();
    return Response.json({ data });
  } catch (error) {
    console.error('[Route] Error:', error);
    
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

## Error Types

### 1. ServiceError

For business logic errors with context:

```typescript
import { ServiceError } from '../services/types';

throw new ServiceError('Failed to fetch sales data', {
  scope: 'shopify.sales',
  code: 'SALES_FETCH_FAILED',
  retryable: true,
  cause: originalError,
});
```

**Properties**:
- `message`: User-facing error message
- `scope`: Service or module scope
- `code`: Unique error code
- `retryable`: Whether retry might succeed
- `cause`: Original error for debugging

### 2. HTTP Errors

For API routes:

```typescript
// 400 - Bad Request (client error)
return Response.json(
  { error: 'Missing required field: email' },
  { status: 400 }
);

// 401 - Unauthorized
return Response.json(
  { error: 'Authentication required' },
  { status: 401 }
);

// 403 - Forbidden
return Response.json(
  { error: 'Insufficient permissions' },
  { status: 403 }
);

// 404 - Not Found
return Response.json(
  { error: 'Resource not found' },
  { status: 404 }
);

// 429 - Too Many Requests
return Response.json(
  { error: 'Rate limit exceeded', retryAfter: 60 },
  { status: 429 }
);

// 500 - Internal Server Error
return Response.json(
  { error: 'Internal server error' },
  { status: 500 }
);

// 503 - Service Unavailable
return Response.json(
  { error: 'Service temporarily unavailable' },
  { status: 503 }
);
```

### 3. Validation Errors

Use validation middleware:

```typescript
import { withValidation, schemas } from '../middleware/validation.server';

export async function action({ request }: ActionFunctionArgs) {
  return withValidation(request, schemas.assignPicker, async (body) => {
    // body is now validated and typed
    return Response.json({ success: true });
  });
}
```

## Logging Standards

### Log Levels

```typescript
// Information (development only)
console.log('[Info] User logged in:', { shopDomain });

// Warning (potential issues)
console.warn('[Warning] Slow query detected:', { duration, query });

// Error (actual errors)
console.error('[Error] Failed to process order:', {
  error: error.message,
  orderId,
  shopDomain,
});
```

### Log Format

**Pattern**: `[Level] Context: Message`, `{ structured data }`

**Examples**:

```typescript
// ✅ Good
console.log('[Loader] Dashboard loaded:', {
  shopDomain: 'shop123',
  duration: '450ms',
  tilesLoaded: 6,
});

// ❌ Bad
console.log('loaded dashboard for shop123 in 450ms with 6 tiles');
```

### Structured Logging

Always include context:

```typescript
console.error('[Service] Shopify API error:', {
  service: 'shopify',
  operation: 'fetchOrders',
  shopDomain: 'shop123',
  error: error.message,
  statusCode: 429,
  retryable: true,
});
```

### Request Logging

Use logging middleware:

```typescript
import { withLogging } from '../middleware/logging.server';

export async function loader({ request }: LoaderFunctionArgs) {
  return withLogging(request, async () => {
    // Your loader logic
    return Response.json({ data });
  });
}
```

**Automatic logging includes**:
- Timestamp
- HTTP method
- Path
- Status code
- Duration
- User agent
- IP address
- Errors (if any)

## Error Response Format

### API Routes

Consistent response format for errors:

```typescript
{
  "success": false,
  "error": "User-friendly error message",
  "code": "ERROR_CODE",  // Optional
  "details": {           // Optional
    "field": "validation error"
  },
  "timestamp": "2025-10-13T00:00:00.000Z"
}
```

### Success Responses

```typescript
{
  "success": true,
  "data": { /* response data */ },
  "metadata": {  // Optional
    "source": "cache",
    "timestamp": "2025-10-13T00:00:00.000Z"
  }
}
```

## Monitoring Integration

### APM Tracking

```typescript
import { withAPM, apm } from '../utils/apm.server';

export async function loader({ request }: LoaderFunctionArgs) {
  return withAPM(request, 'dashboard.load', async (txnId) => {
    const spanId = apm.startSpan(txnId, 'fetch-tiles', 'db');
    const tiles = await fetchTiles();
    apm.endSpan(txnId, spanId);
    
    return Response.json({ tiles });
  });
}
```

### Performance Tracking

```typescript
import { withPerformanceTracking } from '../utils/performance.server';

const data = await withPerformanceTracking(
  'expensive-operation',
  () => expensiveCalculation(),
  { userId: '123', source: 'dashboard' }
);
```

### Profiling

```typescript
import { withProfiling } from '../utils/profiler.server';

const result = await withProfiling('data-processing', async () => {
  return await processLargeDataset();
});
```

## Error Recovery Patterns

### Retry Logic

```typescript
import { ApiClient } from '../utils/api-client.server';

const client = new ApiClient({
  retries: 3,
  retryDelay: 1000,
});

// Automatically retries on failure
const data = await client.get<MyData>('/api/endpoint');
```

### Fallback Data

```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const liveData = await fetchLiveData();
    return Response.json({ data: liveData, source: 'live' });
  } catch (error) {
    console.error('[Loader] Live data failed, using cache:', error);
    
    const cachedData = await fetchCachedData();
    return Response.json({ data: cachedData, source: 'cache' });
  }
}
```

### Graceful Degradation

```typescript
// Tile-specific error handling
<TileCard
  title="Sales Pulse"
  tile={sales}
  render={(data) => <SalesPulseTile data={data} />}
  errorFallback={(error) => (
    <TileErrorFallback error={error} tileName="Sales Pulse" />
  )}
/>
```

## Security Considerations

### Never Expose Sensitive Data

```typescript
// ❌ Bad - exposes internal details
throw new Error(`Database connection failed: ${DATABASE_URL}`);

// ✅ Good - generic user message, log details
console.error('[DB] Connection failed:', { host, port, database });
throw new Error('Database temporarily unavailable');
```

### Sanitize Error Messages

```typescript
function sanitizeError(error: Error): string {
  // Remove stack traces, file paths, credentials
  return error.message
    .replace(/\/home\/[^\/]+\//g, '')
    .replace(/postgresql:\/\/.*@/g, 'postgresql://***@')
    .replace(/Bearer [A-Za-z0-9_-]+/g, 'Bearer ***');
}
```

## Debugging Checklist

When investigating issues:

1. **Check health**: `GET /api/health`
2. **Check APM metrics**: `GET /api/apm/metrics`
3. **Check recent logs**: `GET /api/logs/recent?type=errors`
4. **Check query performance**: `GET /api/queries/analyze`
5. **Get debug snapshot**: `GET /api/debug/snapshot`
6. **Generate debug report**: `GET /api/debug/report`

## Production Guidelines

### Error Logging

- ✅ **Log all errors** - Even if handled
- ✅ **Include context** - Shop domain, user, operation
- ✅ **Use structured logging** - JSON format for parsing
- ✅ **Sanitize sensitive data** - No credentials in logs

### Monitoring

- ✅ **Set up alerts** - On health check failures
- ✅ **Track error rates** - via APM metrics
- ✅ **Monitor slow queries** - via query analyzer
- ✅ **Review logs daily** - Look for patterns

### Incident Response

1. Check `/api/health` for system status
2. Review `/api/debug/report` for quick diagnosis
3. Check `/api/logs/recent?type=errors` for recent errors
4. Analyze `/api/queries/analyze` for database issues
5. Review APM metrics for performance degradation

## Examples

### Complete Loader with All Patterns

```typescript
import type { LoaderFunctionArgs } from "react-router";
import { withLogging } from '../middleware/logging.server';
import { withRateLimit, apiRateLimiter } from '../middleware/rate-limit.server';
import { withAPM, apm } from '../utils/apm.server';
import { withCache } from '../utils/cache.server';

export async function loader({ request }: LoaderFunctionArgs) {
  return withLogging(request, async () => {
    return withRateLimit(request, apiRateLimiter, async () => {
      return withAPM(request, 'my-route.load', async (txnId) => {
        try {
          const data = await withCache(
            'my-route:data',
            async () => {
              const spanId = apm.startSpan(txnId, 'fetch-data', 'db');
              const result = await fetchData();
              apm.endSpan(txnId, spanId);
              return result;
            }
          );
          
          return Response.json({ success: true, data });
        } catch (error) {
          console.error('[My Route] Error:', {
            error: error instanceof Error ? error.message : 'Unknown',
            trace: txnId,
          });
          
          return Response.json(
            { error: 'Failed to load data' },
            { status: 500 }
          );
        }
      });
    });
  });
}
```

---

**Follow these standards for consistent, reliable error handling across the platform.**

