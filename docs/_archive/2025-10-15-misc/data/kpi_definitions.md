---
epoch: 2025.10.E1
doc: docs/data/kpi_definitions.md
owner: data
last_reviewed: 2025-10-11
expires: 2025-11-11
---

# KPI Definitions - Operator Control Center Tiles

## Overview

dbt-style specifications for Key Performance Indicators displayed in operator dashboard tiles within Shopify Admin.

**North Star Alignment:** These KPIs support "operator-first control center embedded inside Shopify Admin that unifies CX, sales, SEO/content, social, and inventory into actionable tiles."

---

## CX WATCH TILE

### KPI: SLA Breach Rate

**Definition:** Percentage of support conversations exceeding response time SLA (5 minutes)

**Business Logic:**
```sql
-- SLA Breach Rate (%)
SELECT 
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE first_response_minutes > 5) / 
    NULLIF(COUNT(*), 0),
    2
  ) as sla_breach_rate_pct,
  COUNT(*) as total_conversations,
  COUNT(*) FILTER (WHERE first_response_minutes > 5) as sla_breaches
FROM (
  SELECT 
    conversation_id,
    EXTRACT(EPOCH FROM (first_response_at - created_at)) / 60 as first_response_minutes
  FROM chatwoot_conversations
  WHERE created_at > NOW() - INTERVAL '24 hours'
) t;
```

**Thresholds:**
- 🟢 Excellent: <5%
- 🟡 Warning: 5-10%
- 🔴 Critical: >10%

**Data Source:** Chatwoot conversations (via Supabase sync)  
**Refresh:** Every 5 minutes  
**Factbase Table:** `facts` (topic: 'cx.sla', key: 'breach_rate')

---

## SALES WATCH TILE

### KPI: Sales Delta (Week-over-Week)

**Definition:** Percentage change in total revenue compared to previous 7 days

**Business Logic:**
```sql
-- Sales Delta (WoW %)
WITH current_week AS (
  SELECT SUM((value->>'total_revenue')::NUMERIC) as revenue
  FROM facts
  WHERE topic = 'shopify.sales' 
    AND key = 'daily_summary'
    AND created_at > CURRENT_DATE - 7
),
previous_week AS (
  SELECT SUM((value->>'total_revenue')::NUMERIC) as revenue
  FROM facts
  WHERE topic = 'shopify.sales' 
    AND key = 'daily_summary'
    AND created_at BETWEEN CURRENT_DATE - 14 AND CURRENT_DATE - 7
)
SELECT 
  c.revenue as current_week_revenue,
  p.revenue as previous_week_revenue,
  ROUND(
    100.0 * (c.revenue - p.revenue) / NULLIF(p.revenue, 0),
    2
  ) as sales_delta_pct
FROM current_week c, previous_week p;
```

**Thresholds:**
- 🟢 Growth: >+5%
- 🟡 Stable: -5% to +5%
- 🔴 Declining: <-5%

**Data Source:** Shopify Admin API (orders, products)  
**Refresh:** Every 15 minutes  
**Factbase Table:** `facts` (topic: 'shopify.sales', key: 'daily_summary')

---

## SEO & CONTENT WATCH TILE

### KPI: Traffic Anomalies (Landing Page Sessions)

**Definition:** Landing pages with >20% week-over-week session drop

**Business Logic:**
```sql
-- Traffic Anomalies (WoW drops >20%)
WITH current_week AS (
  SELECT 
    value->>'landing_page' as landing_page,
    SUM((value->>'sessions')::INTEGER) as sessions
  FROM facts
  WHERE topic = 'ga.sessions'
    AND created_at > CURRENT_DATE - 7
  GROUP BY value->>'landing_page'
),
previous_week AS (
  SELECT 
    value->>'landing_page' as landing_page,
    SUM((value->>'sessions')::INTEGER) as sessions
  FROM facts
  WHERE topic = 'ga.sessions'
    AND created_at BETWEEN CURRENT_DATE - 14 AND CURRENT_DATE - 7
  GROUP BY value->>'landing_page'
)
SELECT 
  c.landing_page,
  c.sessions as current_sessions,
  p.sessions as previous_sessions,
  ROUND(100.0 * (c.sessions - p.sessions) / NULLIF(p.sessions, 0), 2) as wow_delta_pct,
  CASE 
    WHEN (c.sessions - p.sessions)::NUMERIC / NULLIF(p.sessions, 0) < -0.20 THEN 'anomaly'
    ELSE 'normal'
  END as status
FROM current_week c
JOIN previous_week p ON c.landing_page = p.landing_page
WHERE (c.sessions - p.sessions)::NUMERIC / NULLIF(p.sessions, 0) < -0.20
ORDER BY wow_delta_pct ASC;
```

**Thresholds:**
- 🟢 Normal: >-20% change
- 🟡 Warning: -20% to -30% drop
- 🔴 Anomaly: <-30% drop

**Data Source:** Google Analytics (via GA MCP or mock)  
**Refresh:** Every 30 minutes  
**Factbase Table:** `facts` (topic: 'ga.sessions', key: 'landing_page')

---

## INVENTORY WATCH TILE

### KPI: Stockout Risk

**Definition:** Products with <7 days of inventory coverage

**Business Logic:**
```sql
-- Inventory Coverage (Days)
SELECT 
  value->>'sku' as sku,
  value->>'product_title' as product_title,
  (value->>'available_quantity')::INTEGER as available,
  (value->>'daily_sales_avg')::NUMERIC as daily_sales,
  ROUND(
    (value->>'available_quantity')::INTEGER / 
    NULLIF((value->>'daily_sales_avg')::NUMERIC, 0),
    1
  ) as days_of_coverage,
  CASE 
    WHEN (value->>'available_quantity')::INTEGER / NULLIF((value->>'daily_sales_avg')::NUMERIC, 0) < 3 THEN 'critical'
    WHEN (value->>'available_quantity')::INTEGER / NULLIF((value->>'daily_sales_avg')::NUMERIC, 0) < 7 THEN 'warning'
    ELSE 'healthy'
  END as risk_level
FROM facts
WHERE topic = 'shopify.inventory'
  AND key = 'coverage'
  AND created_at > NOW() - INTERVAL '1 hour'
  AND (value->>'available_quantity')::INTEGER / NULLIF((value->>'daily_sales_avg')::NUMERIC, 0) < 7
ORDER BY days_of_coverage ASC;
```

**Thresholds:**
- 🟢 Healthy: >7 days coverage
- 🟡 Warning: 3-7 days
- 🔴 Critical: <3 days

**Data Source:** Shopify Admin API (inventory levels, product sales)  
**Refresh:** Every 15 minutes  
**Factbase Table:** `facts` (topic: 'shopify.inventory', key: 'coverage')

---

## SOCIAL WATCH TILE

### KPI: Sentiment Drop

**Definition:** Social mentions with negative sentiment spike

**Business Logic:**
```sql
-- Sentiment Score (24h average)
SELECT 
  ROUND(AVG((value->>'sentiment_score')::NUMERIC), 2) as avg_sentiment_24h,
  COUNT(*) FILTER (WHERE (value->>'sentiment_score')::NUMERIC < -0.5) as negative_mentions,
  COUNT(*) as total_mentions,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE (value->>'sentiment_score')::NUMERIC < -0.5) / 
    NULLIF(COUNT(*), 0),
    2
  ) as negative_pct
FROM facts
WHERE topic = 'social.sentiment'
  AND created_at > NOW() - INTERVAL '24 hours';
```

**Thresholds:**
- 🟢 Positive: avg >0.3
- 🟡 Neutral: -0.3 to 0.3
- 🔴 Negative: <-0.3

**Data Source:** Social monitoring API (Hootsuite/Buffer)  
**Refresh:** Every 30 minutes  
**Factbase Table:** `facts` (topic: 'social.sentiment', key: 'daily_summary')

---

## Factbase Schema Specification

### facts Table

**Purpose:** Universal fact storage for all operator KPIs

**Schema:**
```sql
CREATE TABLE facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project TEXT NOT NULL,           -- 'occ' for Operator Control Center
  topic TEXT NOT NULL,              -- KPI category (e.g., 'shopify.sales')
  key TEXT NOT NULL,                -- KPI subcategory (e.g., 'daily_summary')
  value JSONB NOT NULL,             -- KPI values and metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX facts_topic_key_idx ON facts (topic, key);
CREATE INDEX facts_created_at_idx ON facts (created_at DESC);
CREATE INDEX facts_project_topic_idx ON facts (project, topic, created_at DESC);
```

**Example Fact Records:**

```sql
-- CX SLA Breach Rate
INSERT INTO facts (project, topic, key, value) VALUES (
  'occ',
  'cx.sla',
  'breach_rate',
  '{"rate_pct": 8.5, "total": 120, "breaches": 10, "period": "24h"}'::jsonb
);

-- Sales Delta
INSERT INTO facts (project, topic, key, value) VALUES (
  'occ',
  'shopify.sales',
  'daily_summary',
  '{"total_revenue": 15847.32, "order_count": 42, "avg_order_value": 377.32}'::jsonb
);

-- GA Traffic Anomaly
INSERT INTO facts (project, topic, key, value) VALUES (
  'occ',
  'ga.sessions',
  'landing_page',
  '{"landing_page": "/products/widget", "sessions": 156, "wow_delta_pct": -25.4}'::jsonb
);
```

---

## Implementation Checklist

### For Each KPI:

- [ ] Define calculation logic (SQL)
- [ ] Specify data sources (Shopify/Chatwoot/GA)
- [ ] Set refresh frequency (align with data availability)
- [ ] Define thresholds (green/yellow/red)
- [ ] Create fact ingestion service
- [ ] Test with mock data
- [ ] Validate with real data
- [ ] Document in this file

### Evidence Requirements:

- SQL query that generates KPI
- Sample fact records (JSONB)
- Threshold rationale
- Data contract validation
- Test results

---

**Status:** KPI specs defined for 5 operator tiles  
**Next:** Implement fact ingestion services for each KPI  
**North Star Alignment:** ✅ DIRECT - All KPIs serve operator decision-making

