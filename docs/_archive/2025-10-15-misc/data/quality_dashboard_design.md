---
epoch: 2025.10.E1
doc: docs/data/quality_dashboard_design.md
owner: data
last_reviewed: 2025-10-11
---

# Data Quality Monitoring Dashboards

## Overview
Real-time dashboards for monitoring data quality across 5 dimensions: completeness, accuracy, consistency, timeliness, uniqueness.

## Dashboard Tiles

### Tile 1: Quality Score Overview
**Metric:** Composite quality score (0-100)
**Data:** v_data_quality_report + scoring logic
**Refresh:** Every 5 minutes
**Alerts:** Score <80 = warning, <60 = critical

### Tile 2: Completeness Metrics
**Metrics:** NULL% per table, required field coverage
**Visualization:** Bar chart by table
**Target:** >99% completeness

### Tile 3: Timeliness Monitor
**Metrics:** Data freshness lag (event to database)
**Visualization:** Line chart over 24 hours
**Target:** <1 minute average lag

### Tile 4: Quality Trends
**Metrics:** 7-day quality score trend
**Visualization:** Sparkline per dimension
**Purpose:** Identify degradation patterns

## SQL Views
```sql
CREATE OR REPLACE VIEW v_quality_dashboard AS
SELECT 
  'completeness' as dimension,
  ROUND(100 - (100.0 * SUM(completeness_violations) / NULLIF(SUM(total_rows), 0)), 2) as score,
  SUM(completeness_violations) as violations
FROM (
  SELECT COUNT(*) as total_rows, 
         COUNT(*) FILTER (WHERE conversation_id IS NULL) as completeness_violations 
  FROM agent_approvals
  UNION ALL
  SELECT COUNT(*), COUNT(*) FILTER (WHERE input_text IS NULL) FROM agent_feedback
) t;
```

**Status:** Quality dashboard framework designed with 4 key tiles

