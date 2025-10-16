# Service Level Objectives (SLOs)

## Overview

This document defines the Service Level Objectives (SLOs) for the HotDash application. SLOs are target values or ranges for service level indicators (SLIs) that we aim to achieve.

## SLO Framework

**SLI (Service Level Indicator):** A quantitative measure of service level
**SLO (Service Level Objective):** Target value for an SLI
**SLA (Service Level Agreement):** Contractual commitment (not applicable for internal tool)

## Core SLOs

### 1. Availability

**Definition:** Percentage of time the application is available and responding to requests

**SLI Measurement:**
```
Availability = (Successful Health Checks / Total Health Checks) × 100
```

**SLO Targets:**
- **Production:** ≥ 99.9% (30-day rolling window)
- **Staging:** ≥ 99.0% (30-day rolling window)

**Measurement Method:**
- Health check endpoint: `/health`
- Frequency: Every 5 minutes
- Success criteria: HTTP 200 response within 5 seconds

**Error Budget:**
- Production: 43.2 minutes downtime per month
- Staging: 7.2 hours downtime per month

**Prometheus Query:**
```promql
# Availability percentage
(sum(rate(http_requests_total{status_code=~"2.."}[30d])) / 
 sum(rate(http_requests_total[30d]))) * 100
```

### 2. Latency (Response Time)

**Definition:** Time taken to respond to user requests

**SLI Measurement:**
```
P95 Latency = 95th percentile of request duration
P99 Latency = 99th percentile of request duration
```

**SLO Targets:**
- **P95 Latency:** < 3 seconds
- **P99 Latency:** < 5 seconds
- **Median Latency:** < 1 second

**Measurement Method:**
- Metric: `http_request_duration_seconds`
- Excludes: Static assets, health checks
- Includes: All API and page requests

**Prometheus Query:**
```promql
# P95 latency
histogram_quantile(0.95, 
  rate(http_request_duration_seconds_bucket[5m]))

# P99 latency
histogram_quantile(0.99, 
  rate(http_request_duration_seconds_bucket[5m]))
```

### 3. Error Rate

**Definition:** Percentage of requests that result in errors

**SLI Measurement:**
```
Error Rate = (Failed Requests / Total Requests) × 100
```

**SLO Targets:**
- **Overall Error Rate:** < 0.5%
- **5xx Errors:** < 0.1%
- **4xx Errors:** < 1.0%

**Measurement Method:**
- Failed requests: HTTP status codes 5xx
- Client errors: HTTP status codes 4xx
- Excludes: 404 on static assets

**Prometheus Query:**
```promql
# Overall error rate
(sum(rate(http_requests_total{status_code=~"5.."}[5m])) / 
 sum(rate(http_requests_total[5m]))) * 100

# 5xx error rate
(sum(rate(http_requests_total{status_code=~"5.."}[5m])) / 
 sum(rate(http_requests_total[5m]))) * 100
```

### 4. Tile Load Performance

**Definition:** Time taken to load dashboard tiles

**SLI Measurement:**
```
P95 Tile Load Time = 95th percentile of tile load duration
```

**SLO Targets:**
- **P95 Tile Load:** < 3 seconds
- **P99 Tile Load:** < 5 seconds
- **Success Rate:** > 99%

**Measurement Method:**
- Metric: `tile_load_duration_seconds`
- Per tile type tracking
- Includes data fetch + render time

**Prometheus Query:**
```promql
# P95 tile load time
histogram_quantile(0.95, 
  rate(tile_load_duration_seconds_bucket[5m]))

# Tile load success rate
(sum(rate(tiles_loaded_total[5m])) / 
 sum(rate(tiles_loaded_total[5m]) + rate(tile_load_errors_total[5m]))) * 100
```

### 5. Database Query Performance

**Definition:** Time taken for database queries

**SLI Measurement:**
```
P95 Query Duration = 95th percentile of query duration
```

**SLO Targets:**
- **P95 Query Duration:** < 500ms
- **P99 Query Duration:** < 1 second
- **Slow Query Rate:** < 1%

**Measurement Method:**
- Metric: `database_query_duration_seconds`
- Per operation type tracking
- Slow query threshold: > 1 second

**Prometheus Query:**
```promql
# P95 query duration
histogram_quantile(0.95, 
  rate(database_query_duration_seconds_bucket[5m]))

# Slow query rate
(sum(rate(database_query_duration_seconds_count{duration_seconds>1}[5m])) / 
 sum(rate(database_query_duration_seconds_count[5m]))) * 100
```

### 6. Shopify API Performance

**Definition:** Success rate and latency of Shopify API calls

**SLI Measurement:**
```
API Success Rate = (Successful Calls / Total Calls) × 100
P95 API Latency = 95th percentile of API call duration
```

**SLO Targets:**
- **Success Rate:** > 99.5%
- **P95 Latency:** < 2 seconds
- **Rate Limit Errors:** < 0.1%

**Measurement Method:**
- Metric: `shopify_api_calls_total`, `shopify_api_duration_seconds`
- Success: HTTP 200-299 responses
- Failure: HTTP 4xx, 5xx, timeouts

**Prometheus Query:**
```promql
# Shopify API success rate
(sum(rate(shopify_api_calls_total{status="success"}[5m])) / 
 sum(rate(shopify_api_calls_total[5m]))) * 100

# P95 API latency
histogram_quantile(0.95, 
  rate(shopify_api_duration_seconds_bucket[5m]))
```

### 7. Cache Hit Rate

**Definition:** Percentage of cache requests that are hits

**SLI Measurement:**
```
Cache Hit Rate = (Cache Hits / (Cache Hits + Cache Misses)) × 100
```

**SLO Targets:**
- **Overall Hit Rate:** > 80%
- **Product Cache:** > 90%
- **Session Cache:** > 95%

**Measurement Method:**
- Metric: `cache_hits_total`, `cache_misses_total`
- Per cache type tracking

**Prometheus Query:**
```promql
# Cache hit rate
(sum(rate(cache_hits_total[5m])) / 
 (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))) * 100
```

## Operational SLOs

### 8. Deployment Success Rate

**SLO Target:** > 95%

**Measurement:**
- Successful deployments / Total deployments
- Success: Health checks pass after deployment
- Failure: Rollback triggered

### 9. Rollback Time

**SLO Target:** < 5 minutes

**Measurement:**
- Time from rollback initiation to healthy state
- Includes: Workflow execution + health check verification

### 10. Backup Success Rate

**SLO Target:** 100%

**Measurement:**
- Successful backups / Scheduled backups
- Daily backup schedule
- Verification: Backup file exists and is valid

### 11. Incident Response Time

**SLO Targets:**
- **P0 (Production Down):** < 15 minutes to respond
- **P1 (Degraded Service):** < 1 hour to respond
- **P2 (Minor Issues):** < 4 hours to respond

**Measurement:**
- Time from alert to first response
- Tracked in incident reports

## Monitoring & Alerting

### Alert Thresholds

**Critical Alerts (P0):**
- Availability < 99.0% (5-minute window)
- Error rate > 5% (5-minute window)
- P95 latency > 10 seconds (5-minute window)

**Warning Alerts (P1):**
- Availability < 99.5% (15-minute window)
- Error rate > 1% (15-minute window)
- P95 latency > 5 seconds (15-minute window)

**Info Alerts (P2):**
- Cache hit rate < 70% (1-hour window)
- Slow query rate > 5% (1-hour window)

### SLO Burn Rate

**Fast Burn (Alert immediately):**
- Consuming error budget at > 10x normal rate
- Example: 99.9% SLO with 1% error rate (should be 0.1%)

**Slow Burn (Alert within hours):**
- Consuming error budget at > 2x normal rate
- Example: 99.9% SLO with 0.3% error rate (should be 0.1%)

## Reporting

### Daily SLO Report

Automated report generated daily:
- Current SLO compliance status
- Error budget remaining
- Trend analysis (7-day, 30-day)
- Top violations

### Monthly SLO Review

Monthly review meeting agenda:
- SLO compliance summary
- Error budget consumption
- Incidents and root causes
- SLO adjustments (if needed)

## SLO Compliance Tracking

### Current Status Dashboard

```
┌─────────────────────────────────────────────────────┐
│ SLO Compliance (30-day rolling)                     │
├─────────────────────────────────────────────────────┤
│ Availability:        99.95% ✅ (Target: 99.9%)      │
│ P95 Latency:         2.1s   ✅ (Target: < 3s)       │
│ Error Rate:          0.3%   ✅ (Target: < 0.5%)     │
│ Tile Load P95:       2.5s   ✅ (Target: < 3s)       │
│ DB Query P95:        350ms  ✅ (Target: < 500ms)    │
│ Shopify API Success: 99.7%  ✅ (Target: > 99.5%)    │
│ Cache Hit Rate:      85%    ✅ (Target: > 80%)      │
└─────────────────────────────────────────────────────┘
```

### Error Budget Tracking

```
Error Budget = (1 - SLO) × Total Time
Example: 99.9% SLO = 0.1% error budget = 43.2 min/month

Current Error Budget Status:
- Availability: 38.5 min remaining (89% remaining) ✅
- Latency: 12% of requests > 3s (88% budget remaining) ✅
- Error Rate: 0.3% (40% budget remaining) ✅
```

## SLO Adjustment Process

### When to Adjust SLOs

1. **Too Strict:** Consistently meeting SLO with > 90% error budget remaining
2. **Too Loose:** Frequently violating SLO or consuming error budget too fast
3. **Business Changes:** New features, user growth, or requirements change

### Adjustment Procedure

1. Collect 30 days of baseline data
2. Analyze current performance vs. SLO
3. Propose new SLO targets
4. Document rationale
5. Update this document
6. Communicate to team
7. Update monitoring/alerting

## References

- Prometheus Metrics: `/metrics` endpoint
- Health Check: `/health` endpoint
- Incident Reports: GitHub Issues with `incident` label
- SLO Dashboard: (To be implemented with Grafana)

