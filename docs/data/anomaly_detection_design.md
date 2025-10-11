---
epoch: 2025.10.E1
doc: docs/data/anomaly_detection_design.md
owner: data
last_reviewed: 2025-10-11
expires: 2025-11-11
---

# Anomaly Detection for Conversation Patterns

## Overview

Statistical and ML-based anomaly detection for identifying unusual conversation patterns, performance issues, and potential security threats.

## Anomaly Types

### 1. Volume Anomalies
- Sudden spike in query volume (>3 standard deviations)
- Unusual conversation length
- Abnormal approval request rate

### 2. Performance Anomalies
- Latency spikes (>2x normal)
- High error rates
- Degraded approval rates

### 3. Pattern Anomalies
- Unusual query patterns (rare queries)
- Suspicious conversation sequences
- Repeated failed attempts

### 4. Security Anomalies
- Multiple unsafe responses in short period
- Unusual access patterns
- PII exposure attempts

## Detection Methods

### Statistical Anomaly Detection

```sql
-- Z-score based anomaly detection
CREATE OR REPLACE VIEW v_query_volume_anomalies AS
WITH stats AS (
  SELECT 
    agent,
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as query_count
  FROM agent_queries
  WHERE created_at > NOW() - INTERVAL '7 days'
  GROUP BY agent, DATE_TRUNC('hour', created_at)
),
baselines AS (
  SELECT 
    agent,
    AVG(query_count) as mean_queries,
    STDDEV(query_count) as stddev_queries
  FROM stats
  GROUP BY agent
)
SELECT 
  s.agent,
  s.hour,
  s.query_count,
  b.mean_queries,
  b.stddev_queries,
  (s.query_count - b.mean_queries) / NULLIF(b.stddev_queries, 0) as z_score,
  CASE 
    WHEN ABS((s.query_count - b.mean_queries) / NULLIF(b.stddev_queries, 0)) > 3 THEN 'critical'
    WHEN ABS((s.query_count - b.mean_queries) / NULLIF(b.stddev_queries, 0)) > 2 THEN 'warning'
    ELSE 'normal'
  END as anomaly_severity
FROM stats s
JOIN baselines b ON s.agent = b.agent
WHERE s.hour > NOW() - INTERVAL '24 hours'
  AND ABS((s.query_count - b.mean_queries) / NULLIF(b.stddev_queries, 0)) > 2
ORDER BY z_score DESC;
```

**Status:** Anomaly detection framework designed with statistical methods

