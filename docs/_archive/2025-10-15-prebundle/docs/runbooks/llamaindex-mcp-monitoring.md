---
epoch: 2025.10.E1
doc: docs/runbooks/llamaindex-mcp-monitoring.md
owner: ai
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# LlamaIndex MCP Server Monitoring & Alerting Strategy

**Purpose:** Ensure 99% uptime and <500ms P95 latency for LlamaIndex MCP server  
**Audience:** AI agent, Engineer agent, Operations  
**Status:** Implementation ready

---

## Executive Summary

This document defines monitoring, alerting, and incident response procedures for the LlamaIndex MCP server. The strategy ensures early detection of performance degradation, proactive capacity planning, and rapid incident resolution.

**Success Criteria:**

- 99%+ uptime
- <500ms P95 query latency
- > 75% cache hit rate
- <1% error rate
- <5 minute incident detection time
- <15 minute incident resolution time

---

## Monitoring Architecture

### Components

```
┌─────────────────────────────────────────────────┐
│         LlamaIndex MCP Server                   │
│                                                 │
│  ┌──────────────┐     ┌──────────────┐        │
│  │   Metrics    │────>│  Prometheus  │        │
│  │   Endpoint   │     │              │        │
│  └──────────────┘     └──────────────┘        │
│                             │                  │
│  ┌──────────────┐           │                  │
│  │    Health    │           │                  │
│  │    Check     │           │                  │
│  └──────────────┘           │                  │
│                             │                  │
│  ┌──────────────┐           │                  │
│  │  Structured  │───────────┤                  │
│  │   Logging    │           │                  │
│  └──────────────┘           │                  │
└─────────────────────────────┼──────────────────┘
                              │
                              v
                    ┌─────────────────┐
                    │    Grafana      │
                    │   Dashboard     │
                    └─────────────────┘
                              │
                              v
                    ┌─────────────────┐
                    │   AlertManager  │
                    │   (Slack/Email) │
                    └─────────────────┘
```

---

## Metrics Collection

### Core Metrics (Prometheus)

**File:** `apps/llamaindex-mcp-server/src/monitoring/metrics.ts`

```typescript
import { Registry, Counter, Histogram, Gauge } from "prom-client";

export const register = new Registry();

// === Query Performance ===
export const queryLatency = new Histogram({
  name: "llamaindex_query_latency_ms",
  help: "Query latency in milliseconds",
  labelNames: ["cached"],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register],
});

export const queryTotal = new Counter({
  name: "llamaindex_query_total",
  help: "Total number of queries",
  labelNames: ["status"], // 'success' | 'error'
  registers: [register],
});

// === Cache Performance ===
export const cacheHits = new Counter({
  name: "llamaindex_cache_hits_total",
  help: "Total number of cache hits",
  registers: [register],
});

export const cacheMisses = new Counter({
  name: "llamaindex_cache_misses_total",
  help: "Total number of cache misses",
  registers: [register],
});

export const cacheSize = new Gauge({
  name: "llamaindex_cache_size",
  help: "Current number of entries in cache",
  registers: [register],
});

export const cacheHitRate = new Gauge({
  name: "llamaindex_cache_hit_rate",
  help: "Cache hit rate (0-1)",
  registers: [register],
});

// === Tool Execution ===
export const toolCalls = new Counter({
  name: "llamaindex_tool_calls_total",
  help: "Total number of tool calls",
  labelNames: ["tool", "status"], // tool: query_support|refresh_index|insight_report
  registers: [register],
});

export const toolLatency = new Histogram({
  name: "llamaindex_tool_latency_ms",
  help: "Tool execution latency",
  labelNames: ["tool"],
  buckets: [100, 500, 1000, 5000, 10000, 30000, 60000],
  registers: [register],
});

// === Index Health ===
export const indexAge = new Gauge({
  name: "llamaindex_index_age_seconds",
  help: "Age of the current index in seconds",
  registers: [register],
});

export const indexDocumentCount = new Gauge({
  name: "llamaindex_index_document_count",
  help: "Number of documents in the index",
  registers: [register],
});

export const indexLastRefresh = new Gauge({
  name: "llamaindex_index_last_refresh_timestamp",
  help: "Unix timestamp of last index refresh",
  registers: [register],
});

// === System Resources ===
export const heapUsed = new Gauge({
  name: "llamaindex_heap_used_bytes",
  help: "Node.js heap usage in bytes",
  registers: [register],
});

export const eventLoopLag = new Histogram({
  name: "llamaindex_event_loop_lag_ms",
  help: "Event loop lag in milliseconds",
  buckets: [1, 5, 10, 50, 100, 500],
  registers: [register],
});

// === Error Tracking ===
export const errorTotal = new Counter({
  name: "llamaindex_errors_total",
  help: "Total number of errors",
  labelNames: ["type"], // 'cli_timeout' | 'cli_error' | 'validation_error' | 'unknown'
  registers: [register],
});

// Update cache metrics periodically
export function updateCacheMetrics(cache: any) {
  cacheSize.set(cache.size);

  const hits = cacheHits["hashMap"][""]["value"] || 0;
  const misses = cacheMisses["hashMap"][""]["value"] || 0;
  const total = hits + misses;

  if (total > 0) {
    cacheHitRate.set(hits / total);
  }
}

// Update system metrics periodically
export function updateSystemMetrics() {
  const mem = process.memoryUsage();
  heapUsed.set(mem.heapUsed);

  // Measure event loop lag
  const start = Date.now();
  setImmediate(() => {
    const lag = Date.now() - start;
    eventLoopLag.observe(lag);
  });
}

// Metrics endpoint handler
export function metricsHandler(req, res) {
  res.set("Content-Type", register.contentType);
  register.metrics().then((metrics) => {
    res.end(metrics);
  });
}
```

### Metric Collection Intervals

- **System metrics:** Every 10 seconds
- **Cache metrics:** Every 30 seconds
- **Index age:** Every 60 seconds
- **Per-request metrics:** Real-time (on each request)

---

## Health Checks

### Health Check Endpoint

**Endpoint:** `GET /health`

**Response Schema:**

```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2025-10-11T14:00:00Z",
  "uptime_seconds": 3600,
  "version": "1.0.0",

  "checks": {
    "cli_available": true,
    "index_present": true,
    "index_fresh": true,
    "cache_operational": true,
    "memory_healthy": true
  },

  "metrics": {
    "cache_size": 234,
    "cache_hit_rate": 0.78,
    "total_queries_last_hour": 1234,
    "error_rate_last_hour": 0.002,
    "p95_latency_last_hour_ms": 420,
    "index_age_hours": 2.5,
    "heap_used_mb": 512
  },

  "warnings": [
    "Index older than 24 hours"
  ]
}
```

**Implementation:** `src/monitoring/health.ts`

```typescript
export async function healthCheck(req, res) {
  const checks = {
    cli_available: await checkCLIAvailable(),
    index_present: await checkIndexPresent(),
    index_fresh: await checkIndexFresh(), // <24 hours
    cache_operational: checkCacheOperational(),
    memory_healthy: checkMemoryHealthy(), // <80% heap
  };

  const metrics = {
    cache_size: queryCache.size,
    cache_hit_rate: calculateCacheHitRate(),
    total_queries_last_hour: getQueryCount(60 * 60),
    error_rate_last_hour: getErrorRate(60 * 60),
    p95_latency_last_hour_ms: getP95Latency(60 * 60),
    index_age_hours: await getIndexAge(),
    heap_used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  };

  const warnings = [];

  if (metrics.index_age_hours > 24) {
    warnings.push("Index older than 24 hours");
  }

  if (metrics.cache_hit_rate < 0.7) {
    warnings.push("Cache hit rate below 70%");
  }

  if (metrics.p95_latency_last_hour_ms > 500) {
    warnings.push("P95 latency exceeds 500ms");
  }

  const failedChecks = Object.values(checks).filter((v) => v === false).length;

  let status: "healthy" | "degraded" | "unhealthy";
  if (failedChecks === 0 && warnings.length === 0) {
    status = "healthy";
  } else if (failedChecks < 2) {
    status = "degraded";
  } else {
    status = "unhealthy";
  }

  const statusCode =
    status === "healthy" ? 200 : status === "degraded" ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.round(process.uptime()),
    version: process.env.npm_package_version || "1.0.0",
    checks,
    metrics,
    warnings,
  });
}
```

### Health Check Schedule

- **Kubernetes/Fly.io probe:** Every 10 seconds
- **External monitoring (UptimeRobot):** Every 5 minutes
- **Internal watchdog:** Every 30 seconds

---

## Alerting Rules

### Critical Alerts (Page on-call)

| Alert                 | Condition                | Threshold              | Action                      |
| --------------------- | ------------------------ | ---------------------- | --------------------------- |
| **MCP Server Down**   | Health check returns 503 | 2 consecutive failures | Page engineer immediately   |
| **High Error Rate**   | Error rate >10%          | Over 5 minutes         | Page engineer               |
| **Extreme Latency**   | P95 >1000ms              | Over 5 minutes         | Page engineer               |
| **Index Missing**     | index_present = false    | Immediate              | Page engineer               |
| **Memory Exhaustion** | Heap >90%                | Over 2 minutes         | Page engineer, auto-restart |

### Warning Alerts (Slack notification)

| Alert                    | Condition           | Threshold       | Action                |
| ------------------------ | ------------------- | --------------- | --------------------- |
| **Degraded Performance** | P95 >500ms          | Over 10 minutes | Slack #hotdash-alerts |
| **Low Cache Hit Rate**   | <70%                | Over 15 minutes | Slack #hotdash-alerts |
| **Moderate Error Rate**  | Error rate >5%      | Over 5 minutes  | Slack #hotdash-alerts |
| **Stale Index**          | Index age >24 hours | Immediate       | Slack #hotdash-alerts |
| **High Memory Usage**    | Heap >80%           | Over 5 minutes  | Slack #hotdash-alerts |
| **Event Loop Lag**       | Lag >100ms P95      | Over 5 minutes  | Slack #hotdash-alerts |

### Informational Alerts (Dashboard only)

| Metric         | Threshold      | Display          |
| -------------- | -------------- | ---------------- |
| Cache Hit Rate | <75%           | Yellow indicator |
| P95 Latency    | 400-500ms      | Yellow indicator |
| Error Rate     | 1-5%           | Yellow indicator |
| Request Rate   | Unusual spikes | Graph annotation |

---

## Prometheus Alert Configuration

**File:** `prometheus/alerts.yml`

```yaml
groups:
  - name: llamaindex_mcp
    interval: 30s
    rules:
      # === Critical Alerts ===
      - alert: MCPServerDown
        expr: up{job="llamaindex-mcp"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "LlamaIndex MCP server is down"
          description: "MCP server has been unreachable for 1 minute"

      - alert: HighErrorRate
        expr: |
          rate(llamaindex_errors_total[5m]) / rate(llamaindex_query_total[5m]) > 0.10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} over last 5 minutes"

      - alert: ExtremeLatency
        expr: |
          histogram_quantile(0.95, rate(llamaindex_query_latency_ms_bucket[5m])) > 1000
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Extreme query latency detected"
          description: "P95 latency is {{ $value }}ms, exceeding 1000ms threshold"

      - alert: IndexMissing
        expr: llamaindex_index_document_count == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Vector index is missing or empty"
          description: "Index has 0 documents, queries will fail"

      # === Warning Alerts ===
      - alert: DegradedPerformance
        expr: |
          histogram_quantile(0.95, rate(llamaindex_query_latency_ms_bucket[10m])) > 500
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Query performance degraded"
          description: "P95 latency is {{ $value }}ms, exceeding 500ms target"

      - alert: LowCacheHitRate
        expr: llamaindex_cache_hit_rate < 0.70
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Cache hit rate below target"
          description: "Cache hit rate is {{ $value | humanizePercentage }}, target is 75%"

      - alert: StaleIndex
        expr: time() - llamaindex_index_last_refresh_timestamp > 86400
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Vector index is stale"
          description: "Index hasn't been refreshed in 24+ hours"

      - alert: HighMemoryUsage
        expr: llamaindex_heap_used_bytes / process_resident_memory_bytes > 0.80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Heap usage is {{ $value | humanizePercentage }} of total memory"
```

---

## Grafana Dashboard

### Dashboard Layout

**Dashboard Name:** "LlamaIndex MCP - Production Monitoring"

**Sections:**

#### 1. Executive Summary (Top Row)

- **Status Indicator:** Green/Yellow/Red based on health check
- **Current P95 Latency:** Big number with target line (500ms)
- **Current Cache Hit Rate:** Gauge with target (75%)
- **Error Rate:** Percentage with 1% warning line
- **Request Rate:** Requests per minute

#### 2. Query Performance

- **Latency Distribution:** P50, P95, P99 over time (line chart)
- **Latency Heatmap:** Request latency distribution (heatmap)
- **Cached vs Uncached:** Latency comparison (bar chart)
- **Query Volume:** Requests per minute (area chart)

#### 3. Cache Performance

- **Hit Rate:** Over time (line chart)
- **Cache Size:** Number of entries (line chart)
- **Hit/Miss Breakdown:** Stacked area chart
- **Top Cached Queries:** Table with query hash and hit count

#### 4. Error Tracking

- **Error Rate:** Over time (line chart)
- **Error Types:** Breakdown by error type (pie chart)
- **Recent Errors:** Table with timestamp, type, message
- **Error Trends:** Week-over-week comparison

#### 5. Index Health

- **Document Count:** Current count (stat)
- **Index Age:** Hours since last refresh (stat with warning at 24h)
- **Refresh History:** Last 10 refreshes (table)
- **Source Breakdown:** Documents by source (pie chart)

#### 6. System Resources

- **Memory Usage:** Heap used vs total (area chart)
- **Event Loop Lag:** P95 lag over time (line chart)
- **CPU Usage:** Percentage (gauge)
- **Request Concurrency:** Active requests (line chart)

### Example Grafana Query (PromQL)

**P95 Latency with Target Line:**

```promql
# P95 latency
histogram_quantile(0.95, rate(llamaindex_query_latency_ms_bucket[5m]))

# Target line (constant 500)
vector(500)
```

**Cache Hit Rate:**

```promql
# Hit rate
sum(rate(llamaindex_cache_hits_total[5m])) /
(sum(rate(llamaindex_cache_hits_total[5m])) + sum(rate(llamaindex_cache_misses_total[5m])))
```

---

## Logging Strategy

### Log Levels

- **DEBUG:** Verbose internal state (disabled in production)
- **INFO:** Normal operations (query received, cache hit, etc.)
- **WARN:** Degraded performance, stale cache, retries
- **ERROR:** Failed operations, exceptions, timeouts

### Structured Logging Format

**Library:** `winston` or `pino` (JSON structured logs)

**Log Schema:**

```json
{
  "timestamp": "2025-10-11T14:30:00.123Z",
  "level": "info",
  "service": "llamaindex-mcp",
  "version": "1.0.0",
  "request_id": "req-abc123",
  "event": "query_executed",
  "data": {
    "query_hash": "md5hash",
    "query_length": 45,
    "topK": 5,
    "cached": false,
    "latency_ms": 420,
    "sources_count": 5,
    "avg_source_score": 0.87
  }
}
```

### Key Events to Log

**Query Lifecycle:**

- `query_received` (INFO)
- `cache_hit` or `cache_miss` (INFO)
- `cli_execution_started` (DEBUG)
- `cli_execution_completed` (INFO)
- `query_executed` (INFO)
- `query_error` (ERROR)

**Cache Operations:**

- `cache_entry_added` (DEBUG)
- `cache_entry_evicted` (DEBUG)
- `cache_cleared` (INFO)

**Index Operations:**

- `index_refresh_started` (INFO)
- `index_refresh_completed` (INFO)
- `index_refresh_failed` (ERROR)
- `index_staleness_warning` (WARN)

**System Events:**

- `server_started` (INFO)
- `server_shutdown` (INFO)
- `health_check_failed` (WARN)
- `memory_pressure` (WARN)

### Log Retention

- **Production:** 30 days in centralized logging (e.g., Loki, CloudWatch)
- **Staging:** 7 days
- **Local Dev:** Console only

---

## Incident Response

### Severity Levels

#### SEV-1 (Critical)

- MCP server completely down
- Error rate >10%
- P95 latency >1000ms sustained

**Response:**

1. Page on-call engineer immediately
2. Check Fly.io status
3. Rollback deployment if recent change
4. Scale up instances if load spike
5. Emergency cache clear if corrupted
6. Post-incident review required

#### SEV-2 (Warning)

- Degraded performance (P95 >500ms)
- Cache hit rate <70%
- Stale index (>24 hours)

**Response:**

1. Slack notification to #hotdash-alerts
2. Investigate logs for errors
3. Check cache configuration
4. Trigger index refresh if stale
5. Monitor for escalation to SEV-1

#### SEV-3 (Informational)

- Minor performance variations
- Low request volume
- Single failed health check

**Response:**

1. Dashboard annotation
2. Review during next sprint
3. No immediate action required

### Incident Response Playbook

**Runbook:** `docs/runbooks/llamaindex-mcp-incidents.md` (to be created)

**Quick Actions:**

```bash
# Check server status
fly status -a hotdash-llamaindex-mcp

# View recent logs
fly logs -a hotdash-llamaindex-mcp --limit 100

# Check health
curl https://hotdash-llamaindex-mcp.fly.dev/health

# Restart server
fly restart -a hotdash-llamaindex-mcp

# Scale up instances
fly scale count 3 -a hotdash-llamaindex-mcp

# Rollback deployment
fly deploy -a hotdash-llamaindex-mcp --image <previous-image>

# Clear cache (via internal endpoint)
curl -X POST https://hotdash-llamaindex-mcp.fly.dev/admin/cache/clear \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Performance Baselines

### Expected Performance Targets

| Metric             | Target  | Acceptable | Critical |
| ------------------ | ------- | ---------- | -------- |
| **P50 Latency**    | <250ms  | <350ms     | >500ms   |
| **P95 Latency**    | <500ms  | <750ms     | >1000ms  |
| **P99 Latency**    | <1000ms | <2000ms    | >5000ms  |
| **Cache Hit Rate** | >75%    | >70%       | <60%     |
| **Error Rate**     | <0.5%   | <1%        | >5%      |
| **Availability**   | >99.5%  | >99%       | <95%     |
| **Memory Usage**   | <70%    | <80%       | >90%     |

### Load Capacity

| Scenario        | Expected RPS  | P95 Latency       |
| --------------- | ------------- | ----------------- |
| **Low Load**    | <50 req/s     | <200ms            |
| **Normal Load** | 50-200 req/s  | <400ms            |
| **High Load**   | 200-500 req/s | <500ms            |
| **Peak Load**   | >500 req/s    | Scale up required |

---

## Monitoring Checklist

### Pre-Launch

- [ ] Prometheus metrics endpoint exposed (`/metrics`)
- [ ] Health check endpoint implemented (`/health`)
- [ ] Grafana dashboard created and tested
- [ ] Alert rules configured in Prometheus
- [ ] Slack/PagerDuty integration tested
- [ ] Log aggregation configured
- [ ] Baseline performance established
- [ ] Load testing completed
- [ ] Incident response runbook created
- [ ] On-call rotation established

### Post-Launch (Week 1)

- [ ] Monitor metrics daily
- [ ] Review error logs
- [ ] Validate alert thresholds
- [ ] Adjust cache TTL if needed
- [ ] Document any incidents
- [ ] Update capacity plan

### Ongoing Maintenance

- [ ] Weekly performance review
- [ ] Monthly capacity planning
- [ ] Quarterly alert rule review
- [ ] Bi-annual disaster recovery drill

---

## Contact Information

**On-Call Rotation:**

- Primary: Engineer agent (Slack @engineer)
- Backup: AI agent (Slack @ai)
- Escalation: Manager (Slack @manager)

**Alert Channels:**

- Critical: PagerDuty → On-call phone
- Warning: Slack #hotdash-alerts
- Info: Grafana dashboard

**Monitoring Endpoints:**

- Grafana: `https://grafana.hotdash.internal/d/llamaindex-mcp`
- Prometheus: `https://prometheus.hotdash.internal`
- Health Check: `https://hotdash-llamaindex-mcp.fly.dev/health`

---

**Document Status:** Implementation Ready  
**Next Review:** 2025-10-18  
**Owner:** AI Agent
