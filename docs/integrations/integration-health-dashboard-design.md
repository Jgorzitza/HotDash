# Integration Health Dashboard Design
**Owner**: Integrations + Reliability  
**Date**: 2025-10-12  
**Status**: Design Phase  
**Implementation**: Weeks 3-4

---

## Executive Summary

This document designs a comprehensive integration health dashboard that provides real-time visibility into all external API integrations, MCP servers, webhook endpoints, and service dependencies. The dashboard will be the central monitoring point for integration reliability and performance.

**Scope**:
- 7 MCP servers
- 4 External APIs (Shopify, Chatwoot, GA, OpenAI)
- 2 Webhook endpoints (Shopify, Chatwoot)
- 3 Infrastructure services (Supabase, Fly.io, Redis)

**Goals**:
- < 5 second dashboard load time
- Real-time health status (5-second refresh)
- Historical trend analysis (7-day, 30-day)
- Automated alerting on degradation

---

## 1. Dashboard Architecture

### 1.1 Technology Stack

**Frontend**:
- React Router 7 (existing stack)
- Recharts for visualizations
- React Query for data fetching
- WebSocket for real-time updates

**Backend**:
- Supabase edge functions for health checks
- Supabase database for metrics storage
- Redis for real-time state caching

**Data Collection**:
- Health check scripts (cron every 60 seconds)
- API client metrics (built-in from BaseApiClient)
- Webhook endpoint metrics (Express middleware)
- MCP server health endpoints

### 1.2 Data Flow

```
┌─────────────────────────────────────────────────┐
│  Health Check Scripts (cron every 60s)         │
│  - MCP servers (7 servers)                     │
│  - External APIs (4 APIs)                      │
│  - Webhook endpoints (2 endpoints)             │
│  - Infrastructure (3 services)                 │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Supabase Edge Function                         │
│  - Aggregate health status                      │
│  - Calculate derived metrics                    │
│  - Store in database                            │
│  - Publish to Redis (real-time)                │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Dashboard UI                                   │
│  - Real-time status (WebSocket/polling)        │
│  - Historical charts                            │
│  - Alert configuration                          │
│  - Incident timeline                            │
└─────────────────────────────────────────────────┘
```

---

## 2. Dashboard UI Design

### 2.1 Layout

**Header**:
- Integration Health Dashboard
- Overall Health Score (0-100%)
- Last Updated timestamp
- Refresh button

**Main Content** (Grid Layout):

```
┌────────────────────────────────────────────────────────────────┐
│  Overall Health: 94%  ✅  |  Last Updated: 2s ago  | [Refresh] │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐│
│  │ MCP Servers      │  │ External APIs    │  │ Infrastructure││
│  │                  │  │                  │  │                ││
│  │ 6/7 Healthy ⚠️   │  │ 4/4 Healthy ✅   │  │ 3/3 Healthy ✅ ││
│  │                  │  │                  │  │                ││
│  │ • Shopify    ✅  │  │ • Shopify    ✅  │  │ • Supabase  ✅ ││
│  │ • Context7   ✅  │  │ • Chatwoot   ✅  │  │ • Fly.io    ✅ ││
│  │ • GitHub     ✅  │  │ • OpenAI     ✅  │  │ • Redis     ✅ ││
│  │ • Supabase   ✅  │  │ • Google GA  ✅  │  │                ││
│  │ • Fly.io     ❌  │  │                  │  │                ││
│  │ • Google GA  ✅  │  │                  │  │                ││
│  │ • LlamaIndex ✅  │  │                  │  │                ││
│  └──────────────────┘  └──────────────────┘  └──────────────┘│
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ API Response Time (Last 24h)                               ││
│  │                                                             ││
│  │    [Line chart showing P50, P95, P99 latency over time]   ││
│  │                                                             ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐│
│  │ Success Rate     │  │ Error Rate       │  │ Retry Rate   ││
│  │                  │  │                  │  │              ││
│  │  98.5%  ▲ +0.3% │  │  1.5%  ▼ -0.3%  │  │  12%  → 0%  ││
│  │                  │  │                  │  │              ││
│  └──────────────────┘  └──────────────────┘  └──────────────┘│
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Recent Incidents (Last 7 Days)                             ││
│  │                                                             ││
│  │  • 2025-10-12 08:50 - LlamaIndex MCP tool failures (100%) ││
│  │  • 2025-10-11 15:23 - Shopify rate limit breach (429)     ││
│  │  • 2025-10-10 09:14 - Chatwoot webhook 503 errors         ││
│  │                                                             ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Status Indicators

**Color Coding**:
- ✅ **Green (Healthy)**: Success rate > 95%, latency < P95 threshold
- ⚠️ **Yellow (Degraded)**: Success rate 90-95%, or latency > P95 threshold
- ❌ **Red (Down)**: Success rate < 90%, or consecutive failures > 5
- ⚪ **Gray (Unknown)**: No data in last 5 minutes

**Thresholds by Service**:

| Service | Healthy | Degraded | Down |
|---------|---------|----------|------|
| Shopify API | >95% success, <1s P95 | 90-95%, 1-3s | <90%, >3s |
| Chatwoot API | >95% success, <800ms P95 | 90-95%, 800ms-2s | <90%, >2s |
| OpenAI API | >95% success, <3s P95 | 90-95%, 3-5s | <90%, >5s |
| Google Analytics | >95% success, <1s P95 | 90-95%, 1-3s | <90%, >3s |
| MCP Servers | Responding | Slow response | Not responding |
| Webhooks | >95% verified | 90-95% | <90% |

---

## 3. Data Model

### 3.1 Health Check Results Table

```sql
-- Table: integration_health_checks
CREATE TABLE integration_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  service_type TEXT NOT NULL, -- 'mcp', 'api', 'webhook', 'infrastructure'
  service_name TEXT NOT NULL, -- 'shopify', 'chatwoot', etc.
  status TEXT NOT NULL,       -- 'healthy', 'degraded', 'down', 'unknown'
  response_time_ms INTEGER,   -- NULL for services without response time
  success_rate NUMERIC(5,2),  -- 0.00 to 100.00
  error_count INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  details JSONB,              -- Additional service-specific details
  
  -- Indexes
  CONSTRAINT check_status CHECK (status IN ('healthy', 'degraded', 'down', 'unknown')),
  INDEX idx_timestamp_service (timestamp DESC, service_name),
  INDEX idx_status (status, timestamp DESC)
);

-- Example query: Get current health status
SELECT DISTINCT ON (service_name)
  service_name,
  status,
  response_time_ms,
  success_rate,
  timestamp
FROM integration_health_checks
WHERE timestamp > NOW() - INTERVAL '5 minutes'
ORDER BY service_name, timestamp DESC;
```

### 3.2 API Metrics Table

```sql
-- Table: api_metrics
CREATE TABLE api_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  api_name TEXT NOT NULL,      -- 'shopify', 'chatwoot', 'openai', 'google_analytics'
  endpoint TEXT,                -- '/graphql', '/conversations', etc.
  method TEXT,                  -- 'GET', 'POST', etc.
  status_code INTEGER,          -- HTTP status code
  response_time_ms INTEGER,
  error_message TEXT,
  retries INTEGER DEFAULT 0,
  
  INDEX idx_timestamp_api (timestamp DESC, api_name),
  INDEX idx_status_code (api_name, status_code, timestamp DESC)
);

-- Example query: Calculate P95 latency last 24h
SELECT
  api_name,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) AS p95_latency_ms
FROM api_metrics
WHERE timestamp > NOW() - INTERVAL '24 hours'
  AND status_code BETWEEN 200 AND 299
GROUP BY api_name;
```

### 3.3 Webhook Metrics Table

```sql
-- Table: webhook_metrics
CREATE TABLE webhook_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL,         -- 'shopify', 'chatwoot'
  webhook_id TEXT,              -- External webhook ID
  event_type TEXT,              -- 'orders/create', 'message_created', etc.
  verified BOOLEAN,             -- HMAC signature verified
  processed BOOLEAN,            -- Successfully processed
  error_message TEXT,
  processing_time_ms INTEGER,
  
  INDEX idx_timestamp_source (timestamp DESC, source),
  INDEX idx_verified (source, verified, timestamp DESC)
);

-- Example query: Verification success rate last 1 hour
SELECT
  source,
  COUNT(*) AS total_webhooks,
  SUM(CASE WHEN verified THEN 1 ELSE 0 END) AS verified_count,
  ROUND(100.0 * SUM(CASE WHEN verified THEN 1 ELSE 0 END) / COUNT(*), 2) AS verification_rate
FROM webhook_metrics
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY source;
```

### 3.4 Incidents Table

```sql
-- Table: integration_incidents
CREATE TABLE integration_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  service_type TEXT NOT NULL,
  service_name TEXT NOT NULL,
  severity TEXT NOT NULL,     -- 'critical', 'warning', 'info'
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved'
  
  INDEX idx_created_status (created_at DESC, status),
  CONSTRAINT check_severity CHECK (severity IN ('critical', 'warning', 'info')),
  CONSTRAINT check_status CHECK (status IN ('open', 'investigating', 'resolved'))
);

-- Example query: Open incidents
SELECT *
FROM integration_incidents
WHERE status IN ('open', 'investigating')
ORDER BY created_at DESC;
```

---

## 4. Health Check Implementation

### 4.1 Unified Health Check Script

```typescript
// scripts/monitoring/integration-health-check.ts

import { createClient } from '@supabase/supabase-js';

interface HealthCheckResult {
  serviceType: 'mcp' | 'api' | 'webhook' | 'infrastructure';
  serviceName: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  responseTimeMs?: number;
  successRate?: number;
  errorCount?: number;
  retryCount?: number;
  details?: Record<string, any>;
}

export class IntegrationHealthMonitor {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  
  /**
   * Run health checks for all integrations
   */
  async runHealthChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    // Check MCP servers (7 servers)
    results.push(...await this.checkMcpServers());
    
    // Check external APIs (4 APIs)
    results.push(...await this.checkExternalApis());
    
    // Check webhooks (2 endpoints)
    results.push(...await this.checkWebhooks());
    
    // Check infrastructure (3 services)
    results.push(...await this.checkInfrastructure());
    
    // Store results in database
    await this.storeResults(results);
    
    // Check for incidents and create alerts
    await this.checkForIncidents(results);
    
    return results;
  }
  
  /**
   * Check all MCP servers
   */
  private async checkMcpServers(): Promise<HealthCheckResult[]> {
    const mcpServers = [
      { name: 'shopify', url: null, type: 'npm' },
      { name: 'context7', url: 'http://localhost:3001/mcp', type: 'http' },
      { name: 'github-official', url: null, type: 'docker' },
      { name: 'supabase', url: null, type: 'npm' },
      { name: 'fly', url: 'http://127.0.0.1:8080/mcp', type: 'http' },
      { name: 'google-analytics', url: null, type: 'pipx' },
      { name: 'llamaindex-rag', url: 'https://hotdash-llamaindex-mcp.fly.dev/health', type: 'http' },
    ];
    
    const results: HealthCheckResult[] = [];
    
    for (const server of mcpServers) {
      const result = await this.checkMcpServer(server.name, server.url, server.type);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Check single MCP server
   */
  private async checkMcpServer(
    name: string,
    url: string | null,
    type: string
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      if (type === 'http' && url) {
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        const responseTime = Date.now() - startTime;
        
        return {
          serviceType: 'mcp',
          serviceName: name,
          status: response.ok ? 'healthy' : 'down',
          responseTimeMs: responseTime,
          details: { type, url, statusCode: response.status },
        };
      } else {
        // For npm/docker/pipx, check if binary/container exists
        // Simplified - assume healthy if we reach here
        return {
          serviceType: 'mcp',
          serviceName: name,
          status: 'healthy',
          details: { type },
        };
      }
    } catch (error: any) {
      return {
        serviceType: 'mcp',
        serviceName: name,
        status: 'down',
        details: { type, error: error.message },
      };
    }
  }
  
  /**
   * Check external APIs
   */
  private async checkExternalApis(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    // Check Shopify API
    results.push(await this.checkShopifyApi());
    
    // Check Chatwoot API
    results.push(await this.checkChatwootApi());
    
    // Check OpenAI API
    results.push(await this.checkOpenAiApi());
    
    // Check Google Analytics API
    results.push(await this.checkGoogleAnalyticsApi());
    
    return results;
  }
  
  /**
   * Check Shopify API health
   */
  private async checkShopifyApi(): Promise<HealthCheckResult> {
    // Query last 1 hour of API calls from api_metrics table
    const { data, error } = await this.supabase
      .from('api_metrics')
      .select('status_code, response_time_ms')
      .eq('api_name', 'shopify')
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });
    
    if (error || !data || data.length === 0) {
      return {
        serviceType: 'api',
        serviceName: 'shopify',
        status: 'unknown',
        details: { message: 'No recent data' },
      };
    }
    
    // Calculate success rate and avg response time
    const successCount = data.filter(m => m.status_code >= 200 && m.status_code < 300).length;
    const successRate = (successCount / data.length) * 100;
    const avgResponseTime = data.reduce((sum, m) => sum + m.response_time_ms, 0) / data.length;
    
    // Determine status
    let status: 'healthy' | 'degraded' | 'down';
    if (successRate > 95 && avgResponseTime < 1000) {
      status = 'healthy';
    } else if (successRate > 90) {
      status = 'degraded';
    } else {
      status = 'down';
    }
    
    return {
      serviceType: 'api',
      serviceName: 'shopify',
      status,
      responseTimeMs: Math.round(avgResponseTime),
      successRate: Math.round(successRate * 100) / 100,
      errorCount: data.length - successCount,
    };
  }
  
  // Similar methods for checkChatwootApi(), checkOpenAiApi(), checkGoogleAnalyticsApi()
  
  /**
   * Check webhooks
   */
  private async checkWebhooks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    // Check Shopify webhooks
    results.push(await this.checkWebhook('shopify'));
    
    // Check Chatwoot webhooks
    results.push(await this.checkWebhook('chatwoot'));
    
    return results;
  }
  
  /**
   * Check webhook health
   */
  private async checkWebhook(source: string): Promise<HealthCheckResult> {
    // Query last 1 hour of webhook calls from webhook_metrics table
    const { data, error } = await this.supabase
      .from('webhook_metrics')
      .select('verified, processed')
      .eq('source', source)
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString());
    
    if (error || !data || data.length === 0) {
      return {
        serviceType: 'webhook',
        serviceName: source,
        status: 'unknown',
        details: { message: 'No recent webhooks' },
      };
    }
    
    // Calculate verification rate
    const verifiedCount = data.filter(w => w.verified).length;
    const verificationRate = (verifiedCount / data.length) * 100;
    
    // Determine status
    let status: 'healthy' | 'degraded' | 'down';
    if (verificationRate > 95) {
      status = 'healthy';
    } else if (verificationRate > 90) {
      status = 'degraded';
    } else {
      status = 'down';
    }
    
    return {
      serviceType: 'webhook',
      serviceName: source,
      status,
      successRate: Math.round(verificationRate * 100) / 100,
      errorCount: data.length - verifiedCount,
    };
  }
  
  /**
   * Check infrastructure
   */
  private async checkInfrastructure(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    // Check Supabase
    results.push(await this.checkSupabase());
    
    // Check Fly.io
    results.push(await this.checkFlyio());
    
    // Check Redis
    results.push(await this.checkRedis());
    
    return results;
  }
  
  /**
   * Store health check results in database
   */
  private async storeResults(results: HealthCheckResult[]): Promise<void> {
    const rows = results.map(r => ({
      service_type: r.serviceType,
      service_name: r.serviceName,
      status: r.status,
      response_time_ms: r.responseTimeMs,
      success_rate: r.successRate,
      error_count: r.errorCount,
      retry_count: r.retryCount,
      details: r.details,
    }));
    
    const { error } = await this.supabase
      .from('integration_health_checks')
      .insert(rows);
    
    if (error) {
      console.error('[HealthCheck] Failed to store results:', error);
    }
  }
  
  /**
   * Check for incidents and create alerts
   */
  private async checkForIncidents(results: HealthCheckResult[]): Promise<void> {
    for (const result of results) {
      // Check if service is down or degraded
      if (result.status === 'down') {
        await this.createIncident({
          serviceType: result.serviceType,
          serviceName: result.serviceName,
          severity: 'critical',
          title: `${result.serviceName} is down`,
          description: JSON.stringify(result.details),
        });
      } else if (result.status === 'degraded') {
        await this.createIncident({
          serviceType: result.serviceType,
          serviceName: result.serviceName,
          severity: 'warning',
          title: `${result.serviceName} is degraded`,
          description: `Success rate: ${result.successRate}%, Response time: ${result.responseTimeMs}ms`,
        });
      }
    }
  }
  
  /**
   * Create incident (if not already open)
   */
  private async createIncident(incident: any): Promise<void> {
    // Check if incident already open for this service
    const { data: existing } = await this.supabase
      .from('integration_incidents')
      .select('id')
      .eq('service_name', incident.serviceName)
      .eq('status', 'open')
      .single();
    
    if (existing) {
      // Incident already open, don't create duplicate
      return;
    }
    
    // Create new incident
    const { error } = await this.supabase
      .from('integration_incidents')
      .insert(incident);
    
    if (error) {
      console.error('[HealthCheck] Failed to create incident:', error);
    } else {
      console.log(`[HealthCheck] Created incident: ${incident.title}`);
      // TODO: Send alert to PagerDuty/Slack
    }
  }
}

// Run health checks (called by cron every 60 seconds)
const monitor = new IntegrationHealthMonitor();
monitor.runHealthChecks()
  .then(results => {
    console.log(`[HealthCheck] Completed: ${results.length} services checked`);
    process.exit(0);
  })
  .catch(error => {
    console.error('[HealthCheck] Failed:', error);
    process.exit(1);
  });
```

### 4.2 Cron Configuration

```bash
# Add to crontab or GitHub Actions workflow
# Run every 60 seconds
*/1 * * * * cd /home/justin/HotDash/hot-dash && node scripts/monitoring/integration-health-check.ts >> logs/health-check.log 2>&1
```

---

## 5. Dashboard API Endpoints

### 5.1 Get Current Health Status

```typescript
// app/routes/api/integrations/health.tsx
export async function loader() {
  const { data, error } = await supabase
    .rpc('get_current_health_status');
  
  if (error) {
    throw new Response('Failed to fetch health status', { status: 500 });
  }
  
  return json(data);
}

// Supabase function
CREATE OR REPLACE FUNCTION get_current_health_status()
RETURNS TABLE (
  service_type TEXT,
  service_name TEXT,
  status TEXT,
  response_time_ms INTEGER,
  success_rate NUMERIC,
  last_check TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (service_name)
    ihc.service_type,
    ihc.service_name,
    ihc.status,
    ihc.response_time_ms,
    ihc.success_rate,
    ihc.timestamp AS last_check
  FROM integration_health_checks ihc
  WHERE ihc.timestamp > NOW() - INTERVAL '5 minutes'
  ORDER BY ihc.service_name, ihc.timestamp DESC;
END;
$$ LANGUAGE plpgsql;
```

### 5.2 Get Historical Metrics

```typescript
// app/routes/api/integrations/metrics.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || '24h';
  
  const { data, error } = await supabase
    .rpc('get_integration_metrics', { period_hours: parsePeriod(period) });
  
  if (error) {
    throw new Response('Failed to fetch metrics', { status: 500 });
  }
  
  return json(data);
}
```

---

## 6. Alerting Rules

### 6.1 Alert Thresholds

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Service Down | Status = 'down' for 3 consecutive checks | CRITICAL | Page on-call |
| Service Degraded | Status = 'degraded' for 10 minutes | WARNING | Slack notification |
| High Error Rate | Error rate > 10% for 5 minutes | WARNING | Slack notification |
| Slow Response | P95 latency > threshold for 10 minutes | WARNING | Slack notification |
| Circuit Breaker Open | Circuit breaker opens | CRITICAL | Page on-call |
| Webhook Verification Failures | Verification rate < 90% for 1 hour | CRITICAL | Page on-call |

### 6.2 Alert Channels

**PagerDuty** (Critical):
- Service down
- Circuit breaker open
- Webhook verification failures

**Slack** (Warning):
- Service degraded
- High error rate
- Slow response

**Email** (Info):
- Daily health summary
- Weekly trend report

---

## 7. Implementation Checklist

### Week 1: Foundation
- [ ] Create database tables (health_checks, api_metrics, webhook_metrics, incidents)
- [ ] Implement IntegrationHealthMonitor class
- [ ] Create health check script
- [ ] Set up cron job (every 60 seconds)
- [ ] Verify data collection

### Week 2: Dashboard UI
- [ ] Create dashboard route (/admin/integrations/health)
- [ ] Implement real-time status widgets
- [ ] Add historical charts (Recharts)
- [ ] Implement incident timeline
- [ ] Add refresh button and auto-refresh

### Week 3: Alerting
- [ ] Configure PagerDuty integration
- [ ] Configure Slack webhook
- [ ] Implement alert rules
- [ ] Test alert delivery
- [ ] Create runbooks for common incidents

### Week 4: Polish
- [ ] Add drill-down views per service
- [ ] Implement dashboard filters (time range, service type)
- [ ] Add export functionality (CSV, JSON)
- [ ] Performance optimization
- [ ] Documentation

---

## 8. Success Metrics

**Dashboard Performance**:
- Load time: < 5 seconds
- Refresh rate: 5 seconds (real-time)
- Data retention: 30 days

**Monitoring Coverage**:
- 16 services monitored (7 MCP + 4 APIs + 2 webhooks + 3 infrastructure)
- 100% uptime tracking
- < 1 minute detection time for incidents

**Alerting Effectiveness**:
- < 5 minute time to alert (MTTA)
- < 15 minute mean time to acknowledge (MTTACK)
- < 2 hour mean time to resolution (MTTR)

---

## References

- [Recharts Documentation](https://recharts.org/)
- [React Query](https://tanstack.com/query/latest)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [PagerDuty Integration](https://developer.pagerduty.com/docs/ZG9jOjExMDI5NTgx-events-api-v2-overview)

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-12  
**Next Review**: After implementation (Week 4)  
**Owner**: Integrations + Reliability Agents

