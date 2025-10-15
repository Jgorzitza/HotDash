# Integration Health Dashboard - Specification

**Owner:** Integrations + Data  
**Created:** 2025-10-11  
**Purpose:** Real-time monitoring of all external API integrations  
**Target:** Operations team visibility into integration health

---

## Overview

**Dashboard Purpose:**  
Single pane of glass for monitoring health of all 4 external APIs (Shopify, Chatwoot, Google Analytics, OpenAI)

**Location:** New dashboard tile in HotDash operator control center  
**Audience:** Operations team, support team, reliability team  
**Update Frequency:** Real-time (30-second refresh)

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 🔌 Integration Health Dashboard                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  API Status Overview (Last 24h)                             │
│  ┌──────────┬─────────┬──────────┬────────┬───────┐        │
│  │ Service  │ Status  │ Uptime   │ Errors │ Avg   │        │
│  │          │         │          │        │ Resp  │        │
│  ├──────────┼─────────┼──────────┼────────┼───────┤        │
│  │ Shopify  │ 🟢 UP   │  99.8%   │   2    │ 245ms │        │
│  │ Chatwoot │ 🟡 SLOW │  98.1%   │   8    │ 1.2s  │        │
│  │ Analytics│ 🟢 UP   │ 100.0%   │   0    │ 387ms │        │
│  │ OpenAI   │ 🟢 UP   │  99.9%   │   1    │ 890ms │        │
│  └──────────┴─────────┴──────────┴────────┴───────┘        │
│                                                              │
│  Rate Limiting & Quotas                                     │
│  ┌──────────┬─────────────────┬─────────────┐              │
│  │ Service  │ Requests (24h)  │ Quota       │              │
│  ├──────────┼─────────────────┼─────────────┤              │
│  │ Shopify  │  1,248 / ∞      │ No limit    │              │
│  │ Chatwoot │    156 / ∞      │ Unknown     │              │
│  │ Analytics│     89 / 400    │ 22% used 📊 │              │
│  │ OpenAI   │    234 / 3,000  │ 8% used     │              │
│  └──────────┴─────────────────┴─────────────┘              │
│                                                              │
│  Recent Issues (Last 1h)                                    │
│  • 21:30 UTC - Chatwoot slow response (1.8s) - recovered   │
│  • 20:15 UTC - Analytics quota warning (75%) - cleared     │
│                                                              │
│  [View Detailed Logs →]  [Refresh Data]                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Health Status Indicators

### Status Colors & Meanings

**🟢 GREEN (Healthy)**
- Uptime: > 99%
- Error rate: < 1%
- Response time: Within p95 baseline
- No rate limit warnings
- All health checks passing

**🟡 YELLOW (Degraded)**
- Uptime: 95-99%
- Error rate: 1-5%
- Response time: 2x baseline
- Quota usage: > 70%
- Some non-critical errors

**🔴 RED (Down)**
- Uptime: < 95%
- Error rate: > 5%
- Response time: > 5x baseline or timeout
- Quota exhausted
- Health checks failing

**⚫ GRAY (Unknown)**
- No data in last 24 hours
- Service not configured
- Monitoring unavailable

---

## Metrics Specification

### Per-Service Metrics

#### 1. Shopify Admin API

**Status Indicators:**
- Current status: UP/DOWN/DEGRADED
- Last successful request: Timestamp
- Last error: Error message + timestamp

**Performance:**
- Average response time (24h): p50, p95, p99
- Request volume (24h): Total count
- Success rate: Percentage (successes / total)

**Errors:**
- 429 (rate limit) count
- 5xx (server error) count
- GraphQL error count
- Network timeout count

**GraphQL Specific:**
- Query cost usage (if tracked in headers)
- Most expensive queries (top 5)
- Deprecated field warnings

**Data Source:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE metadata->>'status' = '200') as success_count,
  COUNT(*) FILTER (WHERE metadata->>'status' = '429') as rate_limit_count,
  COUNT(*) FILTER (WHERE metadata->>'status' >= '500') as server_error_count,
  AVG((metadata->>'response_time_ms')::numeric) as avg_response_ms,
  MAX(created_at) as last_request
FROM observability_logs
WHERE scope = 'shopify'
  AND created_at > NOW() - INTERVAL '24 hours';
```

---

#### 2. Chatwoot API

**Status Indicators:**
- Health endpoint: `/hc` status code
- Last successful conversation fetch: Timestamp
- Webhook status: Receiving/Not receiving

**Performance:**
- Average response time (24h)
- Conversation fetch time
- Message send time

**Errors:**
- API auth failures
- Timeout errors
- Network errors

**Webhook Metrics:**
- Webhooks received (24h)
- Invalid signature attempts
- Processing success rate
- Average processing time

**Data Source:**
```sql
-- API calls
SELECT 
  COUNT(*) as total_requests,
  AVG((metadata->>'response_time_ms')::numeric) as avg_response_ms
FROM observability_logs
WHERE scope = 'chatwoot'
  AND log_type != 'WEBHOOK_SECURITY'
  AND created_at > NOW() - INTERVAL '24 hours';

-- Webhooks
SELECT 
  COUNT(*) as total_webhooks,
  COUNT(*) FILTER (WHERE log_type = 'WEBHOOK_SECURITY' AND level = 'WARN') as invalid_signatures,
  AVG((metadata->>'processing_time_ms')::numeric) as avg_processing_ms
FROM observability_logs
WHERE scope = 'chatwoot'
  AND log_type IN ('WEBHOOK_PROCESSED', 'WEBHOOK_SECURITY')
  AND created_at > NOW() - INTERVAL '24 hours';
```

---

#### 3. Google Analytics Data API

**Status Indicators:**
- Last successful report: Timestamp
- API connectivity: UP/DOWN
- Service account status: Valid/Expired

**Performance:**
- Average query time (24h)
- Request volume (24h)

**Quotas:**
- Daily requests: Used / Limit (400)
- Percentage used: Visual indicator
- Tokens consumed: Used / Limit (200k)
- Projected exhaustion time: If trending toward limit

**Errors:**
- RESOURCE_EXHAUSTED count
- RATE_LIMIT_EXCEEDED count
- AUTH_ERROR count

**Data Source:**
```sql
SELECT 
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE metadata->>'error_code' = 'RESOURCE_EXHAUSTED') as quota_errors,
  AVG((metadata->>'response_time_ms')::numeric) as avg_response_ms,
  MAX(created_at) as last_request
FROM observability_logs
WHERE scope = 'ga'
  AND created_at > NOW() - INTERVAL '24 hours';
```

**Quota Calculation:**
```typescript
// Real-time quota from dashboard_facts
const quotaUsage = await supabase
  .from('dashboard_facts')
  .select('value')
  .eq('fact_type', 'ga.quota.daily')
  .eq('generated_at::date', new Date().toISOString().split('T')[0])
  .single();

const { requests_today, tokens_today } = quotaUsage.value;
const requestsPercent = (requests_today / 400) * 100;
const tokensPercent = (tokens_today / 200000) * 100;
```

---

#### 4. OpenAI API

**Status Indicators:**
- Last successful completion: Timestamp
- Model availability: Available models
- Tier status: Current tier

**Performance:**
- Average completion time (24h)
- Token usage rate (tokens/min)

**Quotas (Tier-Dependent):**
- Requests (per minute): Used / Limit
- Tokens (per minute): Used / Limit
- Daily requests: Tracking only (no hard limit in most tiers)

**Errors:**
- Rate limit errors (429)
- Model overload errors (503)
- Invalid request errors (400)

**Data Source:**
```sql
SELECT 
  COUNT(*) as total_requests,
  SUM((metadata->>'tokens_used')::numeric) as total_tokens,
  AVG((metadata->>'response_time_ms')::numeric) as avg_response_ms,
  COUNT(*) FILTER (WHERE metadata->>'status' = '429') as rate_limit_count
FROM observability_logs
WHERE scope = 'openai'
  AND created_at > NOW() - INTERVAL '24 hours';
```

---

## Aggregated Health Score

### Overall Integration Health

**Calculation:**
```typescript
function calculateHealthScore(services: ServiceMetrics[]): number {
  let totalScore = 0;
  
  for (const service of services) {
    let serviceScore = 100;
    
    // Deduct for uptime
    if (service.uptime < 99) serviceScore -= 20;
    else if (service.uptime < 99.5) serviceScore -= 10;
    
    // Deduct for errors
    if (service.errorRate > 5) serviceScore -= 30;
    else if (service.errorRate > 1) serviceScore -= 10;
    
    // Deduct for slow responses
    if (service.avgResponseMs > 2000) serviceScore -= 20;
    else if (service.avgResponseMs > 1000) serviceScore -= 10;
    
    // Deduct for quota warnings
    if (service.quotaPercent > 90) serviceScore -= 20;
    else if (service.quotaPercent > 70) serviceScore -= 10;
    
    totalScore += Math.max(0, serviceScore);
  }
  
  return totalScore / services.length;
}

// Health badge
const overallHealth = calculateHealthScore(allServices);
if (overallHealth >= 90) return { color: 'green', label: 'Healthy' };
if (overallHealth >= 70) return { color: 'yellow', label: 'Degraded' };
return { color: 'red', label: 'Critical' };
```

---

## Visualization Components

### 1. Status Grid (Primary View)

**Component:** `<IntegrationStatusGrid>`

**Props:**
```typescript
interface IntegrationStatusGridProps {
  services: Array<{
    name: string;
    status: 'up' | 'degraded' | 'down' | 'unknown';
    uptime: number;
    errorCount: number;
    avgResponseMs: number;
    lastCheck: string;
  }>;
  refreshInterval?: number;
}
```

**Visual Design:**
- Grid layout (4 services × 5 columns)
- Color-coded status (green/yellow/red/gray)
- Tooltips on hover with details
- Click to expand for service-specific view
- Auto-refresh every 30 seconds

---

### 2. Quota Usage Meters

**Component:** `<QuotaUsageMeter>`

**Props:**
```typescript
interface QuotaUsageMeterProps {
  service: string;
  current: number;
  limit: number;
  unit: 'requests' | 'tokens';
  warningThreshold?: number;  // Default: 70%
  criticalThreshold?: number;  // Default: 90%
}
```

**Visual Design:**
- Progress bar (horizontal)
- Color changes at thresholds:
  - < 70%: Green
  - 70-90%: Yellow
  - > 90%: Red
- Percentage label
- Projected exhaustion time (if trending up)

---

### 3. Response Time Chart

**Component:** `<ResponseTimeChart>`

**Data:**
```typescript
interface ResponseTimeData {
  timestamp: string;
  shopify: number;
  chatwoot: number;
  analytics: number;
  openai: number;
}
```

**Visual Design:**
- Line chart (time series)
- X-axis: Last 24 hours (hourly buckets)
- Y-axis: Response time (ms)
- Multiple lines (one per service)
- Baseline marker (p95 threshold)
- Hover shows exact values

---

### 4. Recent Issues List

**Component:** `<RecentIssuesList>`

**Data:**
```typescript
interface IntegrationIssue {
  timestamp: string;
  service: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  resolved: boolean;
  resolvedAt?: string;
}
```

**Visual Design:**
- Chronological list (newest first)
- Color-coded by type
- Auto-dismiss after resolution
- Click to view full error details
- Link to observability logs

---

## Data Model

### Dashboard Facts Table

**New Fact Types:**
```typescript
// Record API health metrics
const healthFact = {
  fact_type: 'integration.health.shopify',
  scope: 'ops',
  value: {
    status: 'up',
    uptime_percent: 99.8,
    error_count: 2,
    avg_response_ms: 245,
    last_success: '2025-10-11T21:30:00Z',
    last_error: '2025-10-11T18:45:00Z'
  },
  metadata: {
    check_interval_seconds: 300,
    data_window_hours: 24
  }
};

// Record quota usage
const quotaFact = {
  fact_type: 'integration.quota.ga',
  scope: 'ops',
  value: {
    requests_used: 89,
    requests_limit: 400,
    tokens_used: 45000,
    tokens_limit: 200000,
    percent_used: 22.25
  },
  metadata: {
    reset_time: '2025-10-12T00:00:00Z'
  }
};
```

**Aggregation Queries:**
```sql
-- Latest health status for all services
SELECT DISTINCT ON (fact_type)
  fact_type,
  value,
  generated_at
FROM dashboard_facts
WHERE fact_type LIKE 'integration.health.%'
ORDER BY fact_type, generated_at DESC;

-- Quota usage trends
SELECT 
  generated_at::date as date,
  fact_type,
  (value->>'requests_used')::numeric as requests,
  (value->>'percent_used')::numeric as percent_used
FROM dashboard_facts
WHERE fact_type LIKE 'integration.quota.%'
  AND generated_at > NOW() - INTERVAL '7 days'
ORDER BY generated_at DESC;
```

---

## Health Check Implementation

### Automated Health Monitoring

**Create:** `app/services/integrations/health-monitor.ts`

```typescript
import { recordDashboardFact } from "../facts.server";
import type { ShopifyServiceContext } from "../shopify/types";
import type { ChatwootClient } from "../chatwoot/client";
import type { GaClient } from "../ga/client";

export interface ServiceHealthMetrics {
  status: 'up' | 'degraded' | 'down';
  uptimePercent: number;
  errorCount: number;
  avgResponseMs: number;
  lastSuccess: string | null;
  lastError: string | null;
}

export async function checkShopifyHealth(
  context: ShopifyServiceContext
): Promise<ServiceHealthMetrics> {
  const startTime = Date.now();
  
  try {
    // Simple test query
    const response = await context.admin.graphql(`
      query { shop { name } }
    `);
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      // Query recent errors from observability_logs
      const recentErrors = await getRecentErrors('shopify', 24);
      const uptime = await calculateUptime('shopify', 24);
      
      return {
        status: responseTime > 2000 ? 'degraded' : 'up',
        uptimePercent: uptime,
        errorCount: recentErrors.length,
        avgResponseMs: responseTime,
        lastSuccess: new Date().toISOString(),
        lastError: recentErrors[0]?.created_at || null
      };
    }
  } catch (error) {
    return {
      status: 'down',
      uptimePercent: 0,
      errorCount: 1,
      avgResponseMs: Date.now() - startTime,
      lastSuccess: null,
      lastError: new Date().toISOString()
    };
  }
}

// Similar implementations for Chatwoot, GA, OpenAI
```

**Scheduled Execution:**
```typescript
// Run health checks every 5 minutes
setInterval(async () => {
  const shopifyHealth = await checkShopifyHealth(context);
  const chatwootHealth = await checkChatwootHealth(client);
  const gaHealth = await checkGaHealth(gaClient);
  const openaiHealth = await checkOpenAiHealth();
  
  // Record to dashboard_facts
  await recordDashboardFact({
    shopDomain: 'system',
    factType: 'integration.health.shopify',
    scope: 'ops',
    value: toInputJson(shopifyHealth)
  });
  
  // ... record others
}, 5 * 60 * 1000);  // 5 minutes
```

---

## Alert Configuration

### Alert Rules

**Critical Alerts (Immediate Action):**
1. Any service down for > 5 minutes
2. Error rate > 10% for > 15 minutes
3. GA quota > 95% with 6+ hours until reset
4. Multiple services degraded simultaneously

**Warning Alerts (Monitor):**
1. Service degraded for > 15 minutes
2. Error rate > 5% for > 30 minutes
3. Response time > 2x baseline for > 30 minutes
4. GA quota > 80%

**Info Alerts (Log Only):**
1. Single 429 error (expected occasionally)
2. Temporary slowness (< 5 minutes)
3. Quota > 50%

---

### Alert Channels

**Slack Integration:**
```typescript
async function sendSlackAlert(alert: Alert) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Integration Alert: ${alert.service}`,
      attachments: [{
        color: alert.severity === 'critical' ? 'danger' : 'warning',
        fields: [
          { title: 'Service', value: alert.service, short: true },
          { title: 'Status', value: alert.status, short: true },
          { title: 'Issue', value: alert.message, short: false },
          { title: 'Time', value: alert.timestamp, short: true }
        ],
        actions: [
          {
            type: 'button',
            text: 'View Dashboard',
            url: `${appUrl}/integrations/health`
          }
        ]
      }]
    })
  });
}
```

**Email Alerts:**
- To: ops@hotrodan.com, integrations@hotrodan.com
- Subject: `[${severity}] Integration Health Alert - ${service}`
- Body: Markdown format with metrics and links

---

## Dashboard Implementation

### Route Structure

**Route:** `app/routes/integrations.health.tsx`

```typescript
import type { Route } from "./+types/integrations.health";
import { IntegrationHealthDashboard } from "~/components/integrations/HealthDashboard";

export async function loader({ request }: Route.LoaderArgs) {
  // Fetch latest health metrics
  const shopifyHealth = await getLatestHealthFact('shopify');
  const chatwootHealth = await getLatestHealthFact('chatwoot');
  const gaHealth = await getLatestHealthFact('ga');
  const openaiHealth = await getLatestHealthFact('openai');
  
  // Fetch quota data
  const gaQuota = await getLatestQuotaFact('ga');
  const openaiQuota = await getLatestQuotaFact('openai');
  
  // Fetch recent issues
  const recentIssues = await getRecentIntegrationIssues(1);  // Last 1 hour
  
  return {
    services: [
      { name: 'Shopify', ...shopifyHealth },
      { name: 'Chatwoot', ...chatwootHealth },
      { name: 'Analytics', ...gaHealth },
      { name: 'OpenAI', ...openaiHealth }
    ],
    quotas: [
      { name: 'Analytics', ...gaQuota },
      { name: 'OpenAI', ...openaiQuota }
    ],
    recentIssues,
    lastUpdated: new Date().toISOString()
  };
}

export default function IntegrationHealthRoute({ loaderData }: Route.ComponentProps) {
  return <IntegrationHealthDashboard {...loaderData} />;
}
```

---

### Component Structure

**Main Component:**
```typescript
// app/components/integrations/HealthDashboard.tsx
export function IntegrationHealthDashboard({
  services,
  quotas,
  recentIssues,
  lastUpdated
}: IntegrationHealthDashboardProps) {
  return (
    <Page title="Integration Health">
      <HealthScoreBadge services={services} />
      
      <Layout.Section>
        <Card>
          <Text variant="headingMd">Service Status</Text>
          <IntegrationStatusGrid services={services} />
        </Card>
      </Layout.Section>
      
      <Layout.Section>
        <Card>
          <Text variant="headingMd">API Quotas</Text>
          <QuotaUsageMeters quotas={quotas} />
        </Card>
      </Layout.Section>
      
      <Layout.Section>
        <Card>
          <Text variant="headingMd">Response Times (24h)</Text>
          <ResponseTimeChart services={services} />
        </Card>
      </Layout.Section>
      
      <Layout.Section>
        <Card>
          <Text variant="headingMd">Recent Issues</Text>
          <RecentIssuesList issues={recentIssues} />
        </Card>
      </Layout.Section>
      
      <Text variant="bodySm" tone="subdued">
        Last updated: {formatTimestamp(lastUpdated)}
      </Text>
    </Page>
  );
}
```

---

## Auto-Refresh Strategy

### Client-Side Polling

```typescript
// In component
const [data, setData] = useState(loaderData);
const [isRefreshing, setIsRefreshing] = useState(false);

useEffect(() => {
  const interval = setInterval(async () => {
    setIsRefreshing(true);
    
    const response = await fetch('/integrations/health?_data');
    const newData = await response.json();
    
    setData(newData);
    setIsRefreshing(false);
  }, 30000);  // 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

**Alternative:** Server-Sent Events (SSE) for real-time updates

```typescript
// Server
export function loader({ request }: Route.LoaderArgs) {
  const stream = new ReadableStream({
    async start(controller) {
      const interval = setInterval(async () => {
        const data = await fetchHealthMetrics();
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      }, 30000);
      
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}

// Client
useEffect(() => {
  const eventSource = new EventSource('/integrations/health/stream');
  
  eventSource.onmessage = (event) => {
    setData(JSON.parse(event.data));
  };
  
  return () => eventSource.close();
}, []);
```

---

## Mobile/Responsive Design

### Collapsed View (Mobile)

```
┌──────────────────────┐
│ Integration Health   │
├──────────────────────┤
│ Overall: 🟢 Healthy  │
│                      │
│ ▼ Shopify            │
│   🟢 99.8% uptime    │
│   245ms avg          │
│                      │
│ ▼ Chatwoot           │
│   🟡 98.1% uptime    │
│   1.2s avg (slow)    │
│                      │
│ ▼ Analytics          │
│   🟢 100% uptime     │
│   22% quota used     │
│                      │
│ ▼ OpenAI             │
│   🟢 99.9% uptime    │
│   890ms avg          │
└──────────────────────┘
```

**Features:**
- Accordion-style (expand for details)
- Status icon + key metrics only
- Tap to expand for full metrics
- Swipe to refresh

---

## Implementation Phases

### Phase 1: Basic Dashboard (Week 1)
- [ ] Create route (`integrations.health.tsx`)
- [ ] Implement IntegrationStatusGrid component
- [ ] Query observability_logs for metrics
- [ ] Display 4 services with status/uptime/errors
- [ ] Add auto-refresh (30s)
- **Estimated:** 8 hours

### Phase 2: Quota Tracking (Week 1-2)
- [ ] Create QuotaUsageMeter component
- [ ] Track GA daily requests (dashboard_facts)
- [ ] Track OpenAI usage (observability_logs)
- [ ] Add quota warnings
- **Estimated:** 4 hours

### Phase 3: Visualization (Week 2)
- [ ] Create ResponseTimeChart component
- [ ] Implement time-series data aggregation
- [ ] Add historical trend analysis
- [ ] Create RecentIssuesList component
- **Estimated:** 6 hours

### Phase 4: Alerting (Week 2-3)
- [ ] Implement alert rules
- [ ] Add Slack webhook integration
- [ ] Add email notifications
- [ ] Create alert management UI
- **Estimated:** 8 hours

**Total Effort:** 26 hours (~3-4 days)

---

## Success Metrics

### Dashboard Adoption
- Operations team checks dashboard daily
- Average time on dashboard > 2 minutes
- Used for incident triage (recorded usage)

### Issue Detection
- Issues detected via dashboard (not customer reports)
- Mean time to detection (MTTD) < 5 minutes
- Mean time to resolution (MTTR) improves by 30%

### API Reliability
- Proactive issue resolution (before customer impact)
- Reduced escalations (fewer surprises)
- Better capacity planning (quota trends visible)

---

## Future Enhancements

### 1. Historical Trends
- 7-day, 30-day, 90-day views
- Identify patterns (e.g., degraded every Monday morning)
- Capacity planning insights

### 2. Anomaly Detection
- Machine learning for unusual patterns
- Alert on anomalies (not just thresholds)
- Predictive alerting (issues before they occur)

### 3. SLA Tracking
- Define SLAs per integration (e.g., 99.5% uptime)
- Track against SLA (monthly reports)
- Compliance dashboard for manager review

### 4. Dependency Mapping
- Visualize which dashboard tiles depend on which APIs
- Show impact of API downtime
- Prioritize remediation based on impact

---

**Specification Complete:** 2025-10-11 21:46 UTC  
**Implementation Ready:** Yes (detailed spec for Engineer)  
**Owner:** Data (queries), Engineer (UI), Integrations (coordination)  
**Next:** Coordinate with Data and Engineer for implementation sprint

