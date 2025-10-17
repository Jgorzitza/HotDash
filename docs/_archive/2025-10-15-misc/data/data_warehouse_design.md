---
epoch: 2025.10.E1
doc: docs/data/data_warehouse_design.md
owner: data
last_reviewed: 2025-10-11
expires: 2025-11-11
---

# Data Warehouse Design - Agent Analytics

## Overview

Dimensional model for Agent SDK analytics using star schema for efficient historical analysis, reporting, and business intelligence.

## Dimensional Model (Star Schema)

```
                         ┌──────────────────┐
                         │   dim_agent      │
                         ├──────────────────┤
                         │ agent_key (PK)   │
                         │ agent_name       │
                         │ agent_type       │
                         │ capabilities     │
                         └──────────────────┘
                                 │
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼──────────┐    ┌───────▼──────────┐    ┌───────▼──────────┐
│ fact_agent_query │    │ fact_approval    │    │ fact_training    │
├──────────────────┤    ├──────────────────┤    ├──────────────────┤
│ query_key (PK)   │    │ approval_key(PK) │    │ training_key(PK) │
│ agent_key (FK)   │    │ agent_key (FK)   │    │ agent_key (FK)   │
│ time_key (FK)    │    │ time_key (FK)    │    │ time_key (FK)    │
│ conv_key (FK)    │    │ conv_key (FK)    │    │ conv_key (FK)    │
│ latency_ms       │    │ status           │    │ safe_to_send     │
│ approved         │    │ resolution_time  │    │ clarity_score    │
│ human_edited     │    │ approved_by_key  │    │ accuracy_score   │
└──────────────────┘    └──────────────────┘    └──────────────────┘
        │                        │                        │
        └────────────┬───────────┴────────────┬───────────┘
                     │                        │
              ┌──────▼──────────┐      ┌──────▼──────────┐
              │   dim_time      │      │ dim_conversation│
              ├─────────────────┤      ├─────────────────┤
              │ time_key (PK)   │      │ conv_key (PK)   │
              │ date            │      │ conversation_id │
              │ hour            │      │ first_seen_at   │
              │ day_of_week     │      │ event_count     │
              │ week            │      │ metadata        │
              │ month           │      └─────────────────┘
              │ quarter         │
              │ year            │
              └─────────────────┘
```

## Dimension Tables

### dim_agent (Agent Dimension)

**Purpose:** Agent metadata and attributes

**Schema:**

```sql
CREATE TABLE dim_agent (
  agent_key SERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL UNIQUE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('data', 'engineer', 'support', 'marketing', 'ai', 'qa', 'ops')),
  capabilities JSONB DEFAULT '[]'::JSONB,
  sla_target_seconds INTEGER DEFAULT 300,
  cost_per_query_usd NUMERIC(10, 6) DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  is_current BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX dim_agent_name_idx ON dim_agent (agent_name);
CREATE INDEX dim_agent_type_idx ON dim_agent (agent_type);
CREATE INDEX dim_agent_current_idx ON dim_agent (is_current) WHERE is_current = true;
```

**Sample Data:**

```sql
INSERT INTO dim_agent (agent_name, agent_type, capabilities, sla_target_seconds) VALUES
  ('data', 'data', '["query", "analytics", "schema"]'::jsonb, 300),
  ('engineer', 'engineer', '["code", "debug", "deploy"]'::jsonb, 600),
  ('support', 'support', '["ticket", "escalation", "knowledge"]'::jsonb, 180),
  ('marketing', 'marketing', '["content", "seo", "social"]'::jsonb, 900);
```

### dim_time (Time Dimension)

**Purpose:** Comprehensive time attributes for temporal analysis

**Schema:**

```sql
CREATE TABLE dim_time (
  time_key INTEGER PRIMARY KEY,
  full_date DATE NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL,
  month INTEGER NOT NULL,
  week INTEGER NOT NULL,
  day_of_month INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL,
  day_of_year INTEGER NOT NULL,
  day_name TEXT NOT NULL,
  month_name TEXT NOT NULL,
  is_weekend BOOLEAN NOT NULL,
  is_holiday BOOLEAN NOT NULL DEFAULT false,
  fiscal_year INTEGER,
  fiscal_quarter INTEGER,
  hour INTEGER,
  minute INTEGER
);

CREATE INDEX dim_time_date_idx ON dim_time (full_date);
CREATE INDEX dim_time_year_month_idx ON dim_time (year, month);
CREATE INDEX dim_time_week_idx ON dim_time (year, week);
```

**Population Function:**

```sql
CREATE OR REPLACE FUNCTION populate_dim_time(start_date DATE, end_date DATE)
RETURNS void AS $$
DECLARE
  current_date DATE := start_date;
BEGIN
  WHILE current_date <= end_date LOOP
    INSERT INTO dim_time (
      time_key, full_date, year, quarter, month, week,
      day_of_month, day_of_week, day_of_year, day_name, month_name, is_weekend
    ) VALUES (
      TO_CHAR(current_date, 'YYYYMMDD')::INTEGER,
      current_date,
      EXTRACT(YEAR FROM current_date),
      EXTRACT(QUARTER FROM current_date),
      EXTRACT(MONTH FROM current_date),
      EXTRACT(WEEK FROM current_date),
      EXTRACT(DAY FROM current_date),
      EXTRACT(DOW FROM current_date),
      EXTRACT(DOY FROM current_date),
      TO_CHAR(current_date, 'Day'),
      TO_CHAR(current_date, 'Month'),
      EXTRACT(DOW FROM current_date) IN (0, 6)
    ) ON CONFLICT (full_date) DO NOTHING;

    current_date := current_date + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Populate 2 years (2025-2027)
SELECT populate_dim_time('2025-01-01'::DATE, '2027-12-31'::DATE);
```

### dim_conversation (Conversation Dimension)

**Purpose:** Conversation context and aggregates

**Schema:**

```sql
CREATE TABLE dim_conversation (
  conv_key SERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL UNIQUE,
  first_seen_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  total_queries INTEGER DEFAULT 0,
  total_approvals INTEGER DEFAULT 0,
  total_feedback INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX dim_conversation_id_idx ON dim_conversation (conversation_id);
CREATE INDEX dim_conversation_first_seen_idx ON dim_conversation (first_seen_at);
```

### dim_user (User/Annotator Dimension)

**Purpose:** User and annotator attributes

**Schema:**

```sql
CREATE TABLE dim_user (
  user_key SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('annotator', 'approver', 'qa_team', 'operator')),
  team TEXT,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  is_current BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX dim_user_id_idx ON dim_user (user_id);
CREATE INDEX dim_user_type_idx ON dim_user (user_type);
CREATE INDEX dim_user_current_idx ON dim_user (is_current) WHERE is_current = true;
```

## Fact Tables

### fact_agent_query (Query Performance Facts)

**Purpose:** Grain: One row per agent query

**Schema:**

```sql
CREATE TABLE fact_agent_query (
  query_key BIGSERIAL PRIMARY KEY,
  agent_key INTEGER NOT NULL REFERENCES dim_agent(agent_key),
  time_key INTEGER NOT NULL REFERENCES dim_time(time_key),
  conv_key INTEGER NOT NULL REFERENCES dim_conversation(conv_key),
  -- Degenerate dimensions (high cardinality)
  query_hash TEXT NOT NULL,
  result_size_bytes INTEGER,
  -- Metrics
  latency_ms INTEGER NOT NULL,
  approved BOOLEAN,
  human_edited BOOLEAN NOT NULL DEFAULT false,
  error_occurred BOOLEAN NOT NULL DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX fact_agent_query_agent_idx ON fact_agent_query (agent_key, time_key);
CREATE INDEX fact_agent_query_time_idx ON fact_agent_query (time_key);
CREATE INDEX fact_agent_query_conv_idx ON fact_agent_query (conv_key);
CREATE INDEX fact_agent_query_created_idx ON fact_agent_query (created_at DESC);
CREATE INDEX fact_agent_query_latency_idx ON fact_agent_query (latency_ms DESC) WHERE latency_ms > 100;
```

### fact_approval (Approval Process Facts)

**Purpose:** Grain: One row per approval request

**Schema:**

```sql
CREATE TABLE fact_approval (
  approval_key BIGSERIAL PRIMARY KEY,
  agent_key INTEGER REFERENCES dim_agent(agent_key),
  time_key INTEGER NOT NULL REFERENCES dim_time(time_key),
  conv_key INTEGER NOT NULL REFERENCES dim_conversation(conv_key),
  approved_by_key INTEGER REFERENCES dim_user(user_key),
  -- Metrics
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  resolution_time_seconds INTEGER,
  interruption_count INTEGER DEFAULT 0,
  sla_met BOOLEAN,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX fact_approval_agent_idx ON fact_approval (agent_key, time_key);
CREATE INDEX fact_approval_time_idx ON fact_approval (time_key);
CREATE INDEX fact_approval_status_idx ON fact_approval (status);
CREATE INDEX fact_approval_sla_idx ON fact_approval (sla_met) WHERE sla_met = false;
CREATE INDEX fact_approval_created_idx ON fact_approval (created_at DESC);
```

### fact_training (Training Data Facts)

**Purpose:** Grain: One row per training feedback entry

**Schema:**

```sql
CREATE TABLE fact_training (
  training_key BIGSERIAL PRIMARY KEY,
  agent_key INTEGER REFERENCES dim_agent(agent_key),
  time_key INTEGER NOT NULL REFERENCES dim_time(time_key),
  conv_key INTEGER NOT NULL REFERENCES dim_conversation(conv_key),
  annotator_key INTEGER REFERENCES dim_user(user_key),
  -- Metrics
  safe_to_send BOOLEAN,
  clarity_score INTEGER CHECK (clarity_score BETWEEN 1 AND 5),
  accuracy_score INTEGER CHECK (accuracy_score BETWEEN 1 AND 5),
  tone_score INTEGER CHECK (tone_score BETWEEN 1 AND 5),
  overall_score NUMERIC(3, 2) GENERATED ALWAYS AS (
    (COALESCE(clarity_score, 0) + COALESCE(accuracy_score, 0) + COALESCE(tone_score, 0)) / 3.0
  ) STORED,
  labels TEXT[] DEFAULT '{}',
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL,
  annotated_at TIMESTAMPTZ
);

CREATE INDEX fact_training_agent_idx ON fact_training (agent_key, time_key);
CREATE INDEX fact_training_time_idx ON fact_training (time_key);
CREATE INDEX fact_training_annotator_idx ON fact_training (annotator_key);
CREATE INDEX fact_training_safe_idx ON fact_training (safe_to_send) WHERE safe_to_send = false;
CREATE INDEX fact_training_score_idx ON fact_training (overall_score DESC);
CREATE INDEX fact_training_labels_gin ON fact_training USING GIN (labels);
```

## ETL Processes

### ETL 1: Operational to Warehouse (Nightly)

**Source:** Operational tables (agent_queries, agent_approvals, agent_feedback)  
**Target:** Warehouse fact tables  
**Frequency:** Nightly at 03:00 UTC  
**Type:** Incremental load (last 24 hours)

**ETL Script:**

```sql
-- File: supabase/sql/etl_operational_to_warehouse.sql

CREATE OR REPLACE FUNCTION etl_load_agent_queries(p_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS TABLE(rows_inserted INTEGER) AS $$
DECLARE
  v_time_key INTEGER;
BEGIN
  -- Get time_key for the date
  SELECT time_key INTO v_time_key FROM dim_time WHERE full_date = p_date;

  -- Insert into fact table
  WITH new_queries AS (
    INSERT INTO fact_agent_query (agent_key, time_key, conv_key, query_hash, latency_ms, approved, human_edited, created_at)
    SELECT
      a.agent_key,
      v_time_key,
      c.conv_key,
      MD5(q.query) as query_hash,
      q.latency_ms,
      q.approved,
      q.human_edited,
      q.created_at
    FROM agent_queries q
    JOIN dim_agent a ON a.agent_name = q.agent AND a.is_current = true
    LEFT JOIN dim_conversation c ON c.conversation_id = q.conversation_id
    WHERE DATE(q.created_at) = p_date
      AND NOT EXISTS (
        SELECT 1 FROM fact_agent_query f
        WHERE f.created_at = q.created_at
          AND f.agent_key = a.agent_key
      )
    RETURNING *
  )
  SELECT COUNT(*)::INTEGER FROM new_queries INTO rows_inserted;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Similar ETL functions for approvals and training data
```

### ETL 2: Dimension Maintenance (Daily)

**Purpose:** Update slowly changing dimensions (SCD Type 2)

**Example:**

```sql
-- Update agent dimension when capabilities change
CREATE OR REPLACE FUNCTION update_dim_agent(
  p_agent_name TEXT,
  p_new_capabilities JSONB
)
RETURNS void AS $$
BEGIN
  -- Expire current record
  UPDATE dim_agent
  SET valid_to = NOW(), is_current = false
  WHERE agent_name = p_agent_name AND is_current = true;

  -- Insert new version
  INSERT INTO dim_agent (agent_name, agent_type, capabilities, valid_from)
  VALUES (p_agent_name, 'unknown', p_new_capabilities, NOW());
END;
$$ LANGUAGE plpgsql;
```

## Analytical Queries

### Query 1: Agent Performance Trends (7-day)

```sql
SELECT
  d.full_date,
  a.agent_name,
  COUNT(*) as total_queries,
  ROUND(AVG(f.latency_ms), 2) as avg_latency_ms,
  ROUND(100.0 * COUNT(*) FILTER (WHERE f.approved = true) / COUNT(*), 2) as approval_rate_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE f.human_edited = true) / COUNT(*), 2) as edit_rate_pct
FROM fact_agent_query f
JOIN dim_agent a ON f.agent_key = a.agent_key
JOIN dim_time d ON f.time_key = d.time_key
WHERE d.full_date >= CURRENT_DATE - 7
GROUP BY d.full_date, a.agent_name
ORDER BY d.full_date DESC, a.agent_name;
```

### Query 2: Approval Queue Analysis (Monthly)

```sql
SELECT
  d.month_name,
  COUNT(*) as total_approvals,
  ROUND(AVG(f.resolution_time_seconds) / 60, 2) as avg_resolution_minutes,
  ROUND(100.0 * COUNT(*) FILTER (WHERE f.status = 'approved') / COUNT(*), 2) as approval_rate_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE f.sla_met = true) / COUNT(*), 2) as sla_compliance_pct
FROM fact_approval f
JOIN dim_time d ON f.time_key = d.time_key
WHERE d.year = 2025
GROUP BY d.month, d.month_name
ORDER BY d.month;
```

### Query 3: Training Data Quality (By Annotator)

```sql
SELECT
  u.user_id as annotator,
  COUNT(*) as total_annotations,
  ROUND(AVG(f.overall_score), 2) as avg_overall_score,
  ROUND(AVG(f.clarity_score), 2) as avg_clarity,
  ROUND(AVG(f.accuracy_score), 2) as avg_accuracy,
  ROUND(AVG(f.tone_score), 2) as avg_tone,
  ROUND(100.0 * COUNT(*) FILTER (WHERE f.safe_to_send = false) / COUNT(*), 2) as unsafe_rate_pct
FROM fact_training f
JOIN dim_user u ON f.annotator_key = u.user_key
JOIN dim_time d ON f.time_key = d.time_key
WHERE d.full_date >= CURRENT_DATE - 30
GROUP BY u.user_id
ORDER BY total_annotations DESC;
```

## Aggregation Tables (For Performance)

### agg_agent_daily_performance

**Purpose:** Pre-aggregated daily metrics per agent

**Schema:**

```sql
CREATE TABLE agg_agent_daily_performance (
  agent_key INTEGER NOT NULL REFERENCES dim_agent(agent_key),
  time_key INTEGER NOT NULL REFERENCES dim_time(time_key),
  total_queries INTEGER NOT NULL,
  avg_latency_ms NUMERIC(10, 2),
  p95_latency_ms NUMERIC(10, 2),
  approval_rate_pct NUMERIC(5, 2),
  edit_rate_pct NUMERIC(5, 2),
  error_rate_pct NUMERIC(5, 2),
  total_approvals INTEGER,
  total_feedback INTEGER,
  unsafe_feedback_count INTEGER,
  sla_compliance_pct NUMERIC(5, 2),
  PRIMARY KEY (agent_key, time_key)
);

CREATE INDEX agg_agent_daily_time_idx ON agg_agent_daily_performance (time_key);
```

**Refresh Procedure:**

```sql
CREATE OR REPLACE FUNCTION refresh_agg_agent_daily_performance(p_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS void AS $$
BEGIN
  DELETE FROM agg_agent_daily_performance WHERE time_key = TO_CHAR(p_date, 'YYYYMMDD')::INTEGER;

  INSERT INTO agg_agent_daily_performance
  SELECT
    f.agent_key,
    f.time_key,
    COUNT(*) as total_queries,
    ROUND(AVG(f.latency_ms), 2) as avg_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY f.latency_ms) as p95_latency_ms,
    ROUND(100.0 * COUNT(*) FILTER (WHERE f.approved = true) / COUNT(*), 2) as approval_rate_pct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE f.human_edited = true) / COUNT(*), 2) as edit_rate_pct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE f.error_occurred = true) / COUNT(*), 2) as error_rate_pct,
    0 as total_approvals, -- TODO: Join with fact_approval
    0 as total_feedback, -- TODO: Join with fact_training
    0 as unsafe_feedback_count,
    NULL as sla_compliance_pct
  FROM fact_agent_query f
  WHERE f.time_key = TO_CHAR(p_date, 'YYYYMMDD')::INTEGER
  GROUP BY f.agent_key, f.time_key;
END;
$$ LANGUAGE plpgsql;
```

## Benefits of Data Warehouse

### Performance

- **Fast Queries:** Pre-aggregated metrics, optimized indexes
- **Scalability:** Separate from operational database
- **Historical Analysis:** Efficiently query years of data

### Flexibility

- **Ad-hoc Analysis:** Business analysts can query directly
- **Custom Reports:** Easy to create new aggregations
- **Data Science:** Clean dimensional model for ML

### Compliance

- **Audit Trail:** Immutable fact tables
- **Data Lineage:** ETL logs track transformations
- **Retention:** Separate retention policies from operational data

## Storage Estimates

### Dimensions (Relatively Small)

- dim_agent: <1MB (10-20 rows)
- dim_time: <10MB (3 years × 365 days)
- dim_conversation: ~100MB (estimate 100K conversations/year)
- dim_user: <5MB (estimate 100 users)

**Total Dimensions:** ~115MB

### Facts (Growing)

- fact_agent_query: ~10GB/year (estimate 10M queries/year × 1KB/row)
- fact_approval: ~1GB/year (estimate 1M approvals/year × 1KB/row)
- fact_training: ~500MB/year (estimate 500K feedback/year × 1KB/row)

**Total Facts (Year 1):** ~11.5GB  
**Total Facts (Year 3):** ~35GB

### Aggregates

- agg_agent_daily_performance: ~50MB/year

**Total Warehouse (Year 1):** ~12GB  
**Total Warehouse (Year 3):** ~36GB

## Implementation Plan

### Phase 1: Foundation (Week 1-2)

- [x] Design dimensional model
- [ ] Create dimension tables
- [ ] Populate dim_time and dim_agent
- [ ] Create fact table schemas
- [ ] Add indexes and constraints

### Phase 2: ETL (Week 3-4)

- [ ] Build ETL functions for each fact table
- [ ] Schedule nightly ETL jobs
- [ ] Implement dimension updates (SCD Type 2)
- [ ] Create validation and reconciliation queries

### Phase 3: Aggregations (Week 5)

- [ ] Create aggregate tables
- [ ] Build refresh procedures
- [ ] Schedule daily aggregation jobs
- [ ] Test query performance

### Phase 4: BI Integration (Week 6)

- [ ] Connect BI tool (Metabase, Superset, or Tableau)
- [ ] Create standard report templates
- [ ] Train team on warehouse queries
- [ ] Document common patterns

---

**Status:** Design complete, ready for Phase 1 implementation  
**Estimated Total Effort:** 6 weeks  
**Dependencies:** None (can start immediately)
