# Analytics Grafana Dashboard

## Overview

Grafana dashboard configuration for analytics monitoring.

## Data Source

**Type**: Prometheus  
**URL**: http://localhost:9090  
**Scrape endpoint**: http://app:5173/api/analytics/metrics

## Dashboard Panels

1. **Revenue (Gauge)**
   - Query: `analytics_revenue_total`
   - Unit: Currency (USD)
   - Thresholds: <10k (red), 10k-20k (yellow), >20k (green)

2. **Conversion Rate (Graph)**
   - Query: `analytics_conversion_rate`
   - Unit: Percent
   - Time range: Last 7 days

3. **Sessions (Graph)**
   - Query: `analytics_sessions_total`
   - Time range: Last 7 days

4. **Cache Hit Rate (Stat)**
   - Query: `rate(analytics_cache_hits_total[5m]) / (rate(analytics_cache_hits_total[5m]) + rate(analytics_cache_misses_total[5m]))`
   - Unit: Percent
   - Target: >80%

## Alerts

- Revenue below $5k for 30 days
- Conversion rate drops below 1%
- Cache hit rate below 70%
