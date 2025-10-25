# Telemetry Implementation Documentation

**Task**: ANALYTICS-020  
**Status**: Complete  
**Created**: 2025-10-22  
**Purpose**: Help Integrations team with telemetry implementation

## Overview

This document provides comprehensive guidance for implementing telemetry across the HotDash platform, covering data collection, processing, and analytics integration.

## Telemetry Architecture

### Data Flow

```
Client Events → Telemetry Service → Data Processing → Analytics Storage → Dashboard
```

### Components

1. **Event Collection**: Client-side event tracking
2. **Telemetry Service**: Server-side data processing
3. **Data Storage**: Analytics database
4. **Dashboard Integration**: Real-time metrics display

## Implementation Guide

### 1. Event Collection

#### Client-Side Tracking

```typescript
// Basic event tracking
import { trackEvent } from '~/utils/analytics';

// Track user interactions
trackEvent('button_click', {
  button_id: 'signup_cta',
  page: '/landing',
  user_type: 'anonymous'
});

// Track custom events
trackEvent('feature_usage', {
  feature: 'advanced_search',
  usage_count: 1,
  session_id: 'sess_123'
});
```

#### Server-Side Tracking

```typescript
// Server-side event tracking
import { logTelemetry } from '~/services/telemetry.server';

// Track API usage
await logTelemetry({
  event: 'api_call',
  endpoint: '/api/products',
  method: 'GET',
  response_time: 150,
  status_code: 200
});

// Track system events
await logTelemetry({
  event: 'system_health',
  component: 'database',
  status: 'healthy',
  metrics: {
    connection_pool: 0.8,
    query_time: 45
  }
});
```

### 2. Telemetry Service

#### Core Service Implementation

```typescript
// app/services/telemetry.server.ts
export interface TelemetryEvent {
  event: string;
  timestamp: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
  source: 'client' | 'server';
}

export async function logTelemetry(event: TelemetryEvent): Promise<void> {
  // Validate event data
  validateTelemetryEvent(event);
  
  // Process and enrich data
  const enrichedEvent = await enrichTelemetryEvent(event);
  
  // Store in database
  await storeTelemetryEvent(enrichedEvent);
  
  // Send to analytics (if real-time)
  if (shouldSendToAnalytics(event)) {
    await sendToAnalytics(enrichedEvent);
  }
}

function validateTelemetryEvent(event: TelemetryEvent): void {
  if (!event.event || !event.timestamp) {
    throw new Error('Invalid telemetry event: missing required fields');
  }
  
  // Validate event name format
  if (!/^[a-z_]+$/.test(event.event)) {
    throw new Error('Invalid event name: must be lowercase with underscores');
  }
}

async function enrichTelemetryEvent(event: TelemetryEvent): Promise<TelemetryEvent> {
  return {
    ...event,
    properties: {
      ...event.properties,
      // Add system context
      user_agent: event.source === 'client' ? getClientUserAgent() : undefined,
      ip_address: getClientIP(),
      timestamp: new Date().toISOString(),
    }
  };
}
```

### 3. Data Storage

#### Database Schema

```sql
-- Telemetry events table
CREATE TABLE telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  properties JSONB NOT NULL,
  user_id UUID,
  session_id VARCHAR(100),
  source VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_telemetry_events_event ON telemetry_events(event);
CREATE INDEX idx_telemetry_events_timestamp ON telemetry_events(timestamp);
CREATE INDEX idx_telemetry_events_user_id ON telemetry_events(user_id);
CREATE INDEX idx_telemetry_events_session_id ON telemetry_events(session_id);
```

#### Data Processing

```typescript
// Process telemetry data for analytics
export async function processTelemetryData(
  startDate: string,
  endDate: string
): Promise<TelemetryAnalytics> {
  const events = await db.telemetry_events.findMany({
    where: {
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
  });

  // Aggregate by event type
  const eventCounts = events.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate metrics
  const totalEvents = events.length;
  const uniqueUsers = new Set(events.map(e => e.user_id)).size;
  const uniqueSessions = new Set(events.map(e => e.session_id)).size;

  return {
    totalEvents,
    uniqueUsers,
    uniqueSessions,
    eventCounts,
    period: { start: startDate, end: endDate }
  };
}
```

### 4. Analytics Integration

#### GA4 Integration

```typescript
// Send telemetry events to GA4
export async function sendToAnalytics(event: TelemetryEvent): Promise<void> {
  if (event.source === 'client') {
    // Client-side events are already sent via gtag
    return;
  }

  // Server-side events need to be sent via Measurement Protocol
  await sendToGA4MeasurementProtocol({
    client_id: event.sessionId,
    events: [{
      name: event.event,
      parameters: {
        ...event.properties,
        // Add custom dimensions
        hd_action_key: event.properties.hd_action_key,
      }
    }]
  });
}
```

#### Custom Analytics

```typescript
// Custom analytics processing
export async function generateTelemetryReport(
  startDate: string,
  endDate: string
): Promise<TelemetryReport> {
  const data = await processTelemetryData(startDate, endDate);
  
  return {
    summary: {
      totalEvents: data.totalEvents,
      uniqueUsers: data.uniqueUsers,
      uniqueSessions: data.uniqueSessions,
    },
    topEvents: Object.entries(data.eventCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([event, count]) => ({ event, count })),
    trends: await calculateTelemetryTrends(startDate, endDate),
    period: { start: startDate, end: endDate }
  };
}
```

## Dashboard Integration

### Real-Time Metrics

```typescript
// Real-time telemetry dashboard
export async function getTelemetryDashboard(): Promise<TelemetryDashboard> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const recentEvents = await db.telemetry_events.findMany({
    where: {
      timestamp: { gte: oneHourAgo }
    }
  });

  return {
    eventsLastHour: recentEvents.length,
    topEvents: getTopEvents(recentEvents),
    userActivity: getUserActivity(recentEvents),
    systemHealth: getSystemHealth(recentEvents),
  };
}
```

### Metrics Visualization

```typescript
// Telemetry metrics for charts
export async function getTelemetryMetrics(
  period: 'hour' | 'day' | 'week' | 'month'
): Promise<TelemetryMetrics> {
  const intervals = getTimeIntervals(period);
  
  const metrics = await Promise.all(
    intervals.map(async (interval) => {
      const events = await getEventsInInterval(interval.start, interval.end);
      return {
        timestamp: interval.start,
        eventCount: events.length,
        uniqueUsers: new Set(events.map(e => e.user_id)).size,
        topEvents: getTopEvents(events, 5),
      };
    })
  );

  return { metrics, period };
}
```

## Best Practices

### 1. Event Naming

- Use lowercase with underscores: `button_click`, `page_view`
- Be descriptive: `user_signup_completed` not `signup`
- Include context: `product_search_filtered` not `search`

### 2. Data Privacy

```typescript
// Sanitize sensitive data
function sanitizeTelemetryEvent(event: TelemetryEvent): TelemetryEvent {
  const sanitized = { ...event };
  
  // Remove PII
  delete sanitized.properties.email;
  delete sanitized.properties.phone;
  delete sanitized.properties.address;
  
  // Hash user identifiers
  if (sanitized.userId) {
    sanitized.userId = hashUserId(sanitized.userId);
  }
  
  return sanitized;
}
```

### 3. Performance

```typescript
// Batch telemetry events
export class TelemetryBatcher {
  private events: TelemetryEvent[] = [];
  private batchSize = 100;
  private flushInterval = 5000; // 5 seconds

  async addEvent(event: TelemetryEvent): Promise<void> {
    this.events.push(event);
    
    if (this.events.length >= this.batchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.events.length === 0) return;
    
    await batchStoreTelemetryEvents(this.events);
    this.events = [];
  }
}
```

### 4. Error Handling

```typescript
// Robust error handling
export async function logTelemetrySafe(event: TelemetryEvent): Promise<void> {
  try {
    await logTelemetry(event);
  } catch (error) {
    // Log error but don't break application
    console.error('Telemetry logging failed:', error);
    
    // Optionally store in error queue for retry
    await storeFailedTelemetryEvent(event, error);
  }
}
```

## Monitoring and Alerting

### Health Checks

```typescript
// Telemetry system health
export async function checkTelemetryHealth(): Promise<TelemetryHealth> {
  const lastEvent = await db.telemetry_events.findFirst({
    orderBy: { timestamp: 'desc' }
  });

  const isHealthy = lastEvent && 
    new Date().getTime() - lastEvent.timestamp.getTime() < 300000; // 5 minutes

  return {
    isHealthy,
    lastEventTime: lastEvent?.timestamp,
    eventRate: await getEventRate(),
    errorRate: await getErrorRate(),
  };
}
```

### Alerts

```typescript
// Telemetry alerts
export async function checkTelemetryAlerts(): Promise<TelemetryAlert[]> {
  const alerts: TelemetryAlert[] = [];
  
  // Check for event rate drops
  const currentRate = await getEventRate();
  const averageRate = await getAverageEventRate();
  
  if (currentRate < averageRate * 0.5) {
    alerts.push({
      type: 'low_event_rate',
      message: `Event rate dropped to ${currentRate} (50% below average)`,
      severity: 'warning'
    });
  }
  
  return alerts;
}
```

## Testing

### Unit Tests

```typescript
// Test telemetry functions
describe('Telemetry Service', () => {
  test('should validate telemetry events', () => {
    const validEvent: TelemetryEvent = {
      event: 'button_click',
      timestamp: new Date().toISOString(),
      properties: { button_id: 'test' },
      source: 'client'
    };
    
    expect(() => validateTelemetryEvent(validEvent)).not.toThrow();
  });

  test('should reject invalid events', () => {
    const invalidEvent = {
      event: 'Invalid-Event-Name',
      timestamp: new Date().toISOString(),
      properties: {},
      source: 'client'
    };
    
    expect(() => validateTelemetryEvent(invalidEvent)).toThrow();
  });
});
```

### Integration Tests

```typescript
// Test telemetry integration
describe('Telemetry Integration', () => {
  test('should store and retrieve telemetry events', async () => {
    const event: TelemetryEvent = {
      event: 'test_event',
      timestamp: new Date().toISOString(),
      properties: { test: true },
      source: 'server'
    };
    
    await logTelemetry(event);
    
    const stored = await db.telemetry_events.findFirst({
      where: { event: 'test_event' }
    });
    
    expect(stored).toBeDefined();
    expect(stored?.properties.test).toBe(true);
  });
});
```

## Deployment

### Environment Configuration

```typescript
// Telemetry configuration
export const telemetryConfig = {
  enabled: process.env.TELEMETRY_ENABLED === 'true',
  batchSize: parseInt(process.env.TELEMETRY_BATCH_SIZE || '100'),
  flushInterval: parseInt(process.env.TELEMETRY_FLUSH_INTERVAL || '5000'),
  retentionDays: parseInt(process.env.TELEMETRY_RETENTION_DAYS || '90'),
  analyticsEnabled: process.env.TELEMETRY_ANALYTICS_ENABLED === 'true',
};
```

### Database Migrations

```sql
-- Migration: Create telemetry tables
-- File: migrations/001_create_telemetry_tables.sql

CREATE TABLE telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  properties JSONB NOT NULL,
  user_id UUID,
  session_id VARCHAR(100),
  source VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_telemetry_events_event ON telemetry_events(event);
CREATE INDEX idx_telemetry_events_timestamp ON telemetry_events(timestamp);
CREATE INDEX idx_telemetry_events_user_id ON telemetry_events(user_id);
```

## Troubleshooting

### Common Issues

1. **Events not appearing**: Check database connection and event validation
2. **Performance issues**: Implement batching and async processing
3. **Data quality**: Validate event schemas and sanitize data
4. **Storage growth**: Implement data retention policies

### Debug Tools

```typescript
// Telemetry debug utilities
export class TelemetryDebugger {
  static async getEventStats(): Promise<EventStats> {
    const stats = await db.telemetry_events.groupBy({
      by: ['event'],
      _count: { event: true }
    });
    
    return stats.map(s => ({
      event: s.event,
      count: s._count.event
    }));
  }
  
  static async getRecentEvents(limit = 100): Promise<TelemetryEvent[]> {
    return db.telemetry_events.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }
}
```

## Related Documentation

- [Analytics Architecture](../analytics/analytics-architecture.md)
- [GA4 Integration](../analytics/ga4-custom-dimensions.md)
- [Dashboard Metrics](../analytics/growth-metrics.md)
- [Data Privacy Policy](../privacy/data-privacy.md)

## Files

- `app/services/telemetry.server.ts` - Core telemetry service
- `app/utils/telemetry.client.ts` - Client-side telemetry utilities
- `app/components/TelemetryDashboard.tsx` - Telemetry dashboard component
- `scripts/telemetry/process-data.ts` - Data processing scripts