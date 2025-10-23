# Production Monitoring System

Comprehensive production monitoring for HotDash application.

## Overview

The monitoring system provides:

1. **Error Tracking** - Capture and categorize application errors
2. **Performance Monitoring** - Track response times and resource usage
3. **Uptime Monitoring** - Monitor service availability
4. **Automated Alerting** - Alert on threshold violations
5. **Monitoring Dashboard** - Centralized metrics view

## Components

### Error Tracker (`error-tracker.ts`)

Tracks application errors with deduplication and categorization.

```typescript
import { trackError } from '~/lib/monitoring/error-tracker';

try {
  // Your code
} catch (error) {
  trackError(error, {
    userId: user.id,
    route: '/dashboard',
    action: 'load_data'
  }, 'error');
}
```

**Features:**
- Error deduplication by fingerprint
- Error counting and statistics
- Severity levels: error, warning, critical
- Context tracking (user, route, action)

### Performance Monitor (`performance-monitor.ts`)

Tracks performance metrics for routes, APIs, database queries, and external calls.

```typescript
import { startPerformanceTimer } from '~/lib/monitoring/performance-monitor';

// Start timer
const endTimer = startPerformanceTimer('route', '/dashboard');

// Your code...

// End timer
endTimer({ userId: user.id });
```

**Metrics:**
- Average duration
- P50, P95, P99 percentiles
- Maximum duration
- Count of operations

### Uptime Monitor (`uptime-monitor.ts`)

Monitors service availability and health.

```typescript
import { checkServiceHealth } from '~/lib/monitoring/uptime-monitor';

await checkServiceHealth('database', async () => {
  const start = Date.now();
  try {
    await db.query('SELECT 1');
    return { ok: true, responseTime: Date.now() - start };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});
```

**Features:**
- Service status tracking (up, down, degraded)
- Uptime percentage calculation
- Incident tracking
- Response time monitoring

### Alert Manager (`alert-manager.ts`)

Manages automated alerting based on monitoring data.

```typescript
import { createAlert } from '~/lib/monitoring/alert-manager';

createAlert(
  'critical',
  'error_rate',
  'Error rate exceeded threshold',
  { errorRate: 10, threshold: 5 }
);
```

**Alert Types:**
- error_rate - High error rates
- performance - Performance degradation
- uptime - Service downtime
- custom - Custom alerts

**Severity Levels:**
- info - Informational
- warning - Warning condition
- critical - Critical issue

### Monitoring Dashboard (`dashboard.ts`)

Aggregates all monitoring data for dashboard display.

```typescript
import { getDashboardMetrics } from '~/lib/monitoring/dashboard';

const metrics = getDashboardMetrics(3600000); // Last hour
```

**Provides:**
- Error statistics
- Performance metrics
- Uptime reports
- Active alerts
- Overall health status

## API Endpoints

### GET /api/monitoring/health

Returns current system health status.

**Response:**
```json
{
  "status": "healthy",
  "message": "All systems operational",
  "timestamp": "2025-10-23T...",
  "metrics": {
    "errors": { "total": 0, "critical": 0 },
    "performance": { "routeP95": 250, "apiP95": 150 },
    "uptime": { "overall": 99.9 },
    "alerts": { "unacknowledged": 0, "critical": 0 }
  }
}
```

### GET /api/monitoring/dashboard?period=1h

Returns comprehensive monitoring metrics.

**Query Parameters:**
- `period`: '1h' | '24h' | '7d' (default: '1h')

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-10-23T...",
    "errors": { ... },
    "performance": { ... },
    "uptime": { ... },
    "alerts": { ... },
    "health": { ... }
  }
}
```

### GET /api/monitoring/alerts

Returns all alerts.

**Query Parameters:**
- `unacknowledged`: 'true' | 'false' (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [...],
    "stats": { ... }
  }
}
```

### POST /api/monitoring/alerts/:id/acknowledge

Acknowledges an alert.

**Request Body:**
```json
{
  "acknowledgedBy": "user@example.com"
}
```

## Operational Scripts

### scripts/ops/check-production-health.sh

Comprehensive production health check script.

**Usage:**
```bash
./scripts/ops/check-production-health.sh
```

**Checks:**
- Health endpoint status
- Error metrics
- Performance metrics
- Uptime metrics
- Alert status
- Response time
- Machine status

## GitHub Actions Workflow

### .github/workflows/production-monitoring.yml

Automated monitoring workflow that runs every 15 minutes.

**Jobs:**
1. **health-check** - Runs comprehensive health checks
2. **uptime-check** - Verifies application availability

**Features:**
- Automatic issue creation on failures
- Alert aggregation (updates existing issues)
- Downtime detection and alerting

## Fly.io Health Checks

Configured in `fly.toml`:

```toml
[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/health"

[[http_service.checks]]
  grace_period = "10s"
  interval = "60s"
  method = "GET"
  timeout = "10s"
  path = "/api/monitoring/health"
```

## Alert Thresholds

Default thresholds (configurable):

- **Error Rate:** 5% (triggers warning)
- **Performance:** 3000ms P95 (triggers warning)
- **Uptime:** 99% (triggers alert)
- **Check Interval:** 60 seconds

## Usage Examples

### Track an Error

```typescript
import { trackError } from '~/lib/monitoring/error-tracker';

try {
  await riskyOperation();
} catch (error) {
  trackError(error, {
    userId: user.id,
    route: request.url,
    action: 'risky_operation'
  }, 'critical');
}
```

### Monitor Performance

```typescript
import { startPerformanceTimer } from '~/lib/monitoring/performance-monitor';

export async function loader({ request }: LoaderFunctionArgs) {
  const endTimer = startPerformanceTimer('route', '/dashboard');
  
  try {
    const data = await fetchData();
    return json(data);
  } finally {
    endTimer();
  }
}
```

### Check Service Health

```typescript
import { checkServiceHealth } from '~/lib/monitoring/uptime-monitor';

// In a cron job or scheduled task
await checkServiceHealth('shopify', async () => {
  const start = Date.now();
  try {
    const response = await shopify.graphql('{ shop { id } }');
    return { 
      ok: response.ok, 
      responseTime: Date.now() - start 
    };
  } catch (error) {
    return { 
      ok: false, 
      error: error.message 
    };
  }
});
```

## Maintenance

### Clear Old Data

```typescript
import { ErrorTracker } from '~/lib/monitoring/error-tracker';
import { AlertManager } from '~/lib/monitoring/alert-manager';

// Clear all errors
ErrorTracker.getInstance().clear();

// Clear old acknowledged alerts (older than 7 days)
AlertManager.getInstance().clearOldAlerts(7 * 24 * 60 * 60 * 1000);
```

## Integration with Existing Systems

The monitoring system integrates with:

- **Structured Logging** (`app/utils/logger.server.ts`)
- **Health Check Manager** (`app/utils/health-check.server.ts`)
- **Integration Health** (`app/services/integrations/health.ts`)
- **AI Customer Monitoring** (`app/services/ai-customer/monitoring.ts`)

## Future Enhancements

Potential improvements:

1. **External Error Tracking** - Integrate with Sentry or similar
2. **Metrics Export** - Export to Prometheus/Grafana
3. **Advanced Alerting** - Email, Slack, PagerDuty integration
4. **Custom Dashboards** - UI for monitoring dashboard
5. **Historical Trends** - Long-term metrics storage and analysis

## See Also

- [DEVOPS-017](../../docs/directions/devops.md) - Task specification
- [Health Check Utilities](../../app/utils/health-check.server.ts)
- [Integration Health](../../app/services/integrations/health.ts)

