# Supabase Edge Function Deployment Guide

This runbook covers the deployment and management of the `occ-log` Supabase edge function for centralized application logging.

## Overview

The `occ-log` edge function provides centralized logging for the HotDash application, collecting structured log events from:

- ServiceError instances with scope and retry metadata
- General application errors with context
- Debug, info, warn, error, and fatal level messages
- Request tracing via request IDs and user agents

## Prerequisites

### Local Development

- Supabase CLI installed and configured
- Local Supabase instance running (`supabase start`)
- Environment variables configured in `.env.local`

### Production Deployment

- Supabase project with appropriate permissions
- Production environment secrets configured
- Database table `observability_logs` created

## Database Schema

The edge function requires the `observability_logs` table:

```sql
create table if not exists public.observability_logs (
  id bigserial primary key,
  level text not null default 'INFO',
  message text not null,
  metadata jsonb default '{}'::jsonb,
  request_id text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists observability_logs_created_at_idx on public.observability_logs (created_at desc);
create index if not exists observability_logs_level_idx on public.observability_logs (level);
```

## Local Development Deployment

1. **Start Local Supabase Stack**

   ```bash
   supabase start
   ```

2. **Deploy the Edge Function**

   ```bash
   supabase functions deploy occ-log --no-verify-jwt
   ```

3. **Test the Function**

   ```bash
   curl -X POST 'http://127.0.0.1:54321/functions/v1/occ-log' \
     -H 'Authorization: Bearer [YOUR_ANON_KEY]' \
     -H 'Content-Type: application/json' \
     -d '{
       "level": "INFO",
       "message": "Test log message",
       "metadata": {"test": true}
     }'
   ```

4. **Verify Logs in Database**
   ```sql
   SELECT * FROM observability_logs ORDER BY created_at DESC LIMIT 5;
   ```

## Production Deployment

### 1. Environment Configuration

Ensure the following environment variables are set in your Supabase project:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Deploy to Production

```bash
# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Deploy the edge function
supabase functions deploy occ-log --no-verify-jwt

# Set environment secrets for the function
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Update App Configuration

Update your application's environment variables:

```bash
# .env.production or equivalent
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

## Usage in Application Code

### Basic Logging

```typescript
import { logger } from "~/utils/logger.server";

// Info level logging
logger.info("User performed action", {
  userId: "123",
  action: "create_order",
});

// Error logging
logger.error("Database connection failed", {
  database: "postgres",
  retryAttempt: 3,
});
```

### ServiceError Integration

```typescript
import { ServiceError } from "~/services/types";
import { logger } from "~/utils/logger.server";

try {
  // Some operation that might fail
  await riskyOperation();
} catch (error) {
  const serviceError = new ServiceError("Operation failed", {
    scope: "user.orders",
    code: "ORDER_CREATE_FAILED",
    retryable: true,
    cause: error,
  });

  // This automatically logs with structured metadata
  logger.logServiceError(serviceError);
  throw serviceError;
}
```

### Request-aware Logging

```typescript
import { withRequestLogger } from "~/utils/logger.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const requestLogger = withRequestLogger(request);

  requestLogger.info("Processing dashboard request", {
    path: new URL(request.url).pathname,
  });

  // ... rest of loader logic
}
```

## Monitoring and Observability

### Query Recent Logs

```sql
SELECT
  level,
  message,
  metadata->>'scope' as scope,
  metadata->>'code' as error_code,
  created_at
FROM observability_logs
WHERE level = 'ERROR'
ORDER BY created_at DESC
LIMIT 20;
```

### Error Rate by Service Scope

```sql
SELECT
  metadata->>'scope' as service_scope,
  COUNT(*) as error_count,
  COUNT(*) FILTER (WHERE metadata->>'retryable' = 'true') as retryable_errors
FROM observability_logs
WHERE level = 'ERROR'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY metadata->>'scope'
ORDER BY error_count DESC;
```

### Request Tracing

```sql
SELECT
  request_id,
  level,
  message,
  metadata,
  created_at
FROM observability_logs
WHERE request_id = 'specific-request-id'
ORDER BY created_at ASC;
```

## Troubleshooting

### Edge Function Not Receiving Logs

1. Check environment variables are set correctly
2. Verify the function is deployed and accessible
3. Check application's SUPABASE_URL and SUPABASE_SERVICE_KEY configuration

### Logs Not Persisting

1. Verify the `observability_logs` table exists with correct schema
2. Check service role key has INSERT permissions on the table
3. Review edge function logs for database errors

### Performance Issues

1. Monitor the edge function execution time and memory usage
2. Consider adding indexes on frequently queried metadata fields
3. Implement log retention policies to manage table size

## Log Retention and Cleanup

Consider implementing a cleanup policy for old logs:

```sql
-- Delete logs older than 30 days
DELETE FROM observability_logs
WHERE created_at < NOW() - INTERVAL '30 days';
```

You can automate this with a Supabase cron job or scheduled function.

## Integration Examples

The logging system is integrated in:

- `app/services/chatwoot/escalations.ts` - Chatwoot API error handling and operation tracking
- All services that use `ServiceError` for structured error reporting
- Request handlers for distributed tracing support

## Security Considerations

- The edge function uses service role key for database access
- Never log sensitive information (passwords, tokens, PII)
- Consider log sanitization for customer data
- Implement appropriate access controls for log querying
