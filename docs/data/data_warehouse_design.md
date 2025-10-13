---
title: Agent Analytics Data Warehouse Design
created: 2025-10-12
owner: data
status: design
schema_type: star
---

# Agent Analytics Data Warehouse (Star Schema)

## Overview

**Purpose**: Dimensional model for historical agent analytics, optimized for OLAP queries and business intelligence.

**Architecture**: Star Schema with fact tables surrounded by dimension tables.

**Benefits**:
- Fast aggregation queries
- Simple JOIN patterns
- Easy for BI tools to understand
- Optimized for historical analysis

## Star Schema Diagram

```
                    ┌─────────────────┐
                    │   dim_date      │
                    └────────┬────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     │                       │                       │
┌────┴──────┐         ┌──────┴──────┐         ┌────┴──────┐
│ dim_agent │─────────│ fact_agent  │─────────│ dim_shop  │
│           │         │  _activity  │         │           │
└───────────┘         └──────┬──────┘         └───────────┘
                             │
                      ┌──────┴──────┐
                      │ dim_customer│
                      │             │
                      └─────────────┘
```

## Fact Tables

### fact_agent_approval

**Grain**: One row per agent approval decision

**Purpose**: Track all agent drafts, approvals, rejections, and edits for performance analysis.

```sql
CREATE TABLE fact_agent_approval (
  -- Surrogate key
  approval_sk BIGSERIAL PRIMARY KEY,
  
  -- Foreign keys to dimensions
  date_sk INTEGER NOT NULL,
  agent_type_sk INTEGER NOT NULL,
  shop_sk INTEGER NOT NULL,
  customer_sk INTEGER,
  
  -- Degenerate dimensions (no separate dimension table)
  conversation_id TEXT NOT NULL,
  chatwoot_conversation_id BIGINT,
  chatwoot_message_id BIGINT,
  
  -- Metrics (additive)
  confidence_score NUMERIC(5,2),
  review_time_seconds INTEGER,
  character_count INTEGER,
  suggested_tags_count INTEGER,
  knowledge_sources_count INTEGER,
  
  -- Status flags (semi-additive)
  is_approved BOOLEAN,
  is_rejected BOOLEAN,
  is_edited BOOLEAN,
  is_pending BOOLEAN,
  is_urgent BOOLEAN,
  is_escalated BOOLEAN,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL,
  reviewed_at TIMESTAMP,
  
  -- ETL metadata
  loaded_at TIMESTAMP DEFAULT NOW(),
  source_id TEXT -- Original agent_approvals.id
);

-- Indexes for common queries
CREATE INDEX idx_fact_approval_date ON fact_agent_approval(date_sk);
CREATE INDEX idx_fact_approval_agent ON fact_agent_approval(agent_type_sk);
CREATE INDEX idx_fact_approval_shop ON fact_agent_approval(shop_sk);
CREATE INDEX idx_fact_approval_created ON fact_agent_approval(created_at);
```

**Key Metrics**:
- Count of approvals (COUNT)
- Average confidence (AVG confidence_score)
- Approval rate (SUM is_approved / COUNT(*))
- Average review time (AVG review_time_seconds)
- Total drafts generated (COUNT)

### fact_agent_query

**Grain**: One row per agent API query

**Purpose**: Track agent query performance, latency, and approval rates.

```sql
CREATE TABLE fact_agent_query (
  -- Surrogate key
  query_sk BIGSERIAL PRIMARY KEY,
  
  -- Foreign keys
  date_sk INTEGER NOT NULL,
  agent_type_sk INTEGER NOT NULL,
  shop_sk INTEGER NOT NULL,
  
  -- Degenerate dimensions
  conversation_id BIGINT,
  query_text TEXT, -- Truncated to 500 chars
  
  -- Metrics
  latency_ms INTEGER,
  result_size_bytes INTEGER,
  
  -- Status flags
  is_approved BOOLEAN,
  is_human_edited BOOLEAN,
  is_error BOOLEAN,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL,
  
  -- ETL metadata
  loaded_at TIMESTAMP DEFAULT NOW(),
  source_id TEXT -- Original AgentQuery.id
);

-- Indexes
CREATE INDEX idx_fact_query_date ON fact_agent_query(date_sk);
CREATE INDEX idx_fact_query_agent ON fact_agent_query(agent_type_sk);
CREATE INDEX idx_fact_query_shop ON fact_agent_query(shop_sk);
```

**Key Metrics**:
- Query count (COUNT)
- Average latency (AVG latency_ms)
- P95 latency (PERCENTILE_CONT(0.95))
- Approval rate (SUM is_approved / COUNT(*))
- Error rate (SUM is_error / COUNT(*))

### fact_training_feedback

**Grain**: One row per training feedback annotation

**Purpose**: Track training data quality and annotator activity.

```sql
CREATE TABLE fact_training_feedback (
  -- Surrogate key
  feedback_sk BIGSERIAL PRIMARY KEY,
  
  -- Foreign keys
  date_sk INTEGER NOT NULL,
  annotator_sk INTEGER NOT NULL,
  shop_sk INTEGER NOT NULL,
  
  -- Degenerate dimensions
  conversation_id BIGINT,
  
  -- Metrics (quality scores 1-5)
  clarity_score INTEGER,
  accuracy_score INTEGER,
  helpfulness_score INTEGER,
  tone_score INTEGER,
  overall_score NUMERIC(3,2), -- Average of above
  
  -- Status flags
  is_safe_to_send BOOLEAN,
  has_labels BOOLEAN,
  has_rubric BOOLEAN,
  has_notes BOOLEAN,
  
  -- Text lengths
  input_length INTEGER,
  draft_length INTEGER,
  notes_length INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL,
  
  -- ETL metadata
  loaded_at TIMESTAMP DEFAULT NOW(),
  source_id TEXT -- Original AgentFeedback.id
);

-- Indexes
CREATE INDEX idx_fact_feedback_date ON fact_training_feedback(date_sk);
CREATE INDEX idx_fact_feedback_annotator ON fact_training_feedback(annotator_sk);
CREATE INDEX idx_fact_feedback_shop ON fact_training_feedback(shop_sk);
```

**Key Metrics**:
- Annotation count (COUNT)
- Average quality scores (AVG clarity_score, etc.)
- Safety rate (SUM is_safe_to_send / COUNT(*))
- Annotator productivity (COUNT per annotator per day)

## Dimension Tables

### dim_date

**Type**: Conformed dimension (shared across all facts)

**Purpose**: Time-based analysis with rich calendar attributes.

```sql
CREATE TABLE dim_date (
  date_sk INTEGER PRIMARY KEY, -- YYYYMMDD format
  
  -- Date components
  date_actual DATE NOT NULL UNIQUE,
  day_of_week INTEGER, -- 1=Monday, 7=Sunday
  day_of_month INTEGER,
  day_of_year INTEGER,
  week_of_year INTEGER,
  month_number INTEGER,
  month_name VARCHAR(20),
  quarter INTEGER,
  year INTEGER,
  
  -- Business calendar
  is_weekend BOOLEAN,
  is_holiday BOOLEAN,
  holiday_name VARCHAR(100),
  
  -- Fiscal calendar (if needed)
  fiscal_year INTEGER,
  fiscal_quarter INTEGER,
  fiscal_period INTEGER,
  
  -- Relative dates
  is_current_day BOOLEAN,
  is_current_week BOOLEAN,
  is_current_month BOOLEAN,
  is_current_quarter BOOLEAN,
  days_from_today INTEGER
);

-- Populate function
CREATE OR REPLACE FUNCTION populate_dim_date(
  start_date DATE,
  end_date DATE
) RETURNS VOID AS $$
DECLARE
  current_date DATE := start_date;
BEGIN
  WHILE current_date <= end_date LOOP
    INSERT INTO dim_date (
      date_sk,
      date_actual,
      day_of_week,
      day_of_month,
      day_of_year,
      week_of_year,
      month_number,
      month_name,
      quarter,
      year,
      is_weekend,
      is_current_day,
      is_current_week,
      is_current_month,
      days_from_today
    ) VALUES (
      TO_CHAR(current_date, 'YYYYMMDD')::INTEGER,
      current_date,
      EXTRACT(ISODOW FROM current_date),
      EXTRACT(DAY FROM current_date),
      EXTRACT(DOY FROM current_date),
      EXTRACT(WEEK FROM current_date),
      EXTRACT(MONTH FROM current_date),
      TO_CHAR(current_date, 'Month'),
      EXTRACT(QUARTER FROM current_date),
      EXTRACT(YEAR FROM current_date),
      EXTRACT(ISODOW FROM current_date) IN (6, 7),
      current_date = CURRENT_DATE,
      DATE_TRUNC('week', current_date) = DATE_TRUNC('week', CURRENT_DATE),
      DATE_TRUNC('month', current_date) = DATE_TRUNC('month', CURRENT_DATE),
      current_date - CURRENT_DATE
    )
    ON CONFLICT (date_actual) DO NOTHING;
    
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Initial population: 3 years (past 2 years + next year)
SELECT populate_dim_date(
  CURRENT_DATE - INTERVAL '2 years',
  CURRENT_DATE + INTERVAL '1 year'
);
```

### dim_agent_type

**Type**: Slowly Changing Dimension (Type 1)

**Purpose**: Classify different agent types and their characteristics.

```sql
CREATE TABLE dim_agent_type (
  agent_type_sk SERIAL PRIMARY KEY,
  
  -- Natural key
  agent_type_code VARCHAR(50) NOT NULL UNIQUE,
  
  -- Attributes
  agent_name VARCHAR(100),
  agent_category VARCHAR(50), -- 'cx-agent', 'inventory-agent', 'product-agent'
  model_version VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Characteristics
  expected_avg_latency_ms INTEGER,
  expected_approval_rate NUMERIC(5,2),
  supports_streaming BOOLEAN,
  
  -- SCD metadata
  effective_date DATE DEFAULT CURRENT_DATE,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Initial population
INSERT INTO dim_agent_type (agent_type_code, agent_name, agent_category) VALUES
  ('cx-agent', 'Customer Experience Agent', 'customer-support'),
  ('inventory-agent', 'Inventory Query Agent', 'operations'),
  ('product-agent', 'Product Information Agent', 'sales'),
  ('analytics-agent', 'Analytics Agent', 'business-intelligence'),
  ('unknown', 'Unknown Agent Type', 'other');
```

### dim_shop

**Type**: Slowly Changing Dimension (Type 2)

**Purpose**: Track shop attributes with full history of changes.

```sql
CREATE TABLE dim_shop (
  shop_sk SERIAL PRIMARY KEY,
  
  -- Natural key
  shop_domain VARCHAR(255) NOT NULL,
  
  -- Attributes
  shop_name VARCHAR(255),
  shop_owner VARCHAR(255),
  plan_type VARCHAR(50), -- 'free', 'pro', 'enterprise'
  is_active BOOLEAN,
  
  -- Geography
  country VARCHAR(100),
  timezone VARCHAR(50),
  
  -- Business metrics
  monthly_orders INTEGER,
  total_products INTEGER,
  
  -- SCD Type 2 fields
  effective_date DATE NOT NULL,
  expiration_date DATE, -- NULL = current
  is_current BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE (shop_domain, effective_date)
);

CREATE INDEX idx_dim_shop_domain_current ON dim_shop(shop_domain) WHERE is_current = TRUE;
```

### dim_customer

**Type**: Slowly Changing Dimension (Type 1)

**Purpose**: Track customer information for agent interactions.

```sql
CREATE TABLE dim_customer (
  customer_sk SERIAL PRIMARY KEY,
  
  -- Natural keys
  customer_email VARCHAR(255),
  shop_domain VARCHAR(255),
  
  -- Attributes
  customer_name VARCHAR(255),
  customer_type VARCHAR(50), -- 'individual', 'business', 'wholesale'
  
  -- Behavioral segments
  order_count INTEGER DEFAULT 0,
  lifetime_value NUMERIC(12,2) DEFAULT 0,
  customer_segment VARCHAR(50), -- 'new', 'returning', 'vip', 'at-risk'
  
  -- First/last seen
  first_interaction_date DATE,
  last_interaction_date DATE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE (customer_email, shop_domain)
);

CREATE INDEX idx_dim_customer_email ON dim_customer(customer_email);
CREATE INDEX idx_dim_customer_segment ON dim_customer(customer_segment);
```

### dim_annotator

**Type**: Slowly Changing Dimension (Type 1)

**Purpose**: Track human annotators providing training feedback.

```sql
CREATE TABLE dim_annotator (
  annotator_sk SERIAL PRIMARY KEY,
  
  -- Natural key
  annotator_email VARCHAR(255) NOT NULL UNIQUE,
  
  -- Attributes
  annotator_name VARCHAR(255),
  role VARCHAR(50), -- 'operator', 'qa', 'manager', 'data-scientist'
  team VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Statistics
  total_annotations INTEGER DEFAULT 0,
  avg_quality_score NUMERIC(3,2),
  
  -- Metadata
  first_annotation_date DATE,
  last_annotation_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## ETL Processes

### ETL 1: fact_agent_approval (Daily Incremental)

```sql
-- Daily incremental load
INSERT INTO fact_agent_approval (
  date_sk,
  agent_type_sk,
  shop_sk,
  customer_sk,
  conversation_id,
  chatwoot_conversation_id,
  chatwoot_message_id,
  confidence_score,
  review_time_seconds,
  character_count,
  suggested_tags_count,
  knowledge_sources_count,
  is_approved,
  is_rejected,
  is_edited,
  is_pending,
  is_urgent,
  is_escalated,
  created_at,
  reviewed_at,
  source_id
)
SELECT 
  TO_CHAR(a.created_at, 'YYYYMMDD')::INTEGER as date_sk,
  COALESCE(at.agent_type_sk, (SELECT agent_type_sk FROM dim_agent_type WHERE agent_type_code = 'unknown')) as agent_type_sk,
  COALESCE(s.shop_sk, -1) as shop_sk,
  c.customer_sk,
  a.conversation_id,
  a.chatwoot_conversation_id,
  a.chatwoot_message_id,
  a.confidence_score,
  EXTRACT(EPOCH FROM (a.reviewed_at - a.created_at))::INTEGER as review_time_seconds,
  LENGTH(a.draft_response) as character_count,
  ARRAY_LENGTH(a.suggested_tags, 1) as suggested_tags_count,
  JSONB_ARRAY_LENGTH(a.knowledge_sources) as knowledge_sources_count,
  (a.status = 'approved') as is_approved,
  (a.status = 'rejected') as is_rejected,
  (a.status = 'edited') as is_edited,
  (a.status = 'pending') as is_pending,
  (a.priority = 'urgent') as is_urgent,
  (a.recommended_action = 'escalate') as is_escalated,
  a.created_at,
  a.reviewed_at,
  a.id::TEXT as source_id
FROM agent_approvals a
LEFT JOIN dim_agent_type at ON at.agent_type_code = 'cx-agent' -- Default for now
LEFT JOIN dim_shop s ON s.shop_domain = a.shop_domain AND s.is_current = TRUE
LEFT JOIN dim_customer c ON c.customer_email = a.customer_email AND c.shop_domain = a.shop_domain
WHERE a.created_at >= CURRENT_DATE - INTERVAL '1 day'
AND a.created_at < CURRENT_DATE
AND NOT EXISTS (
  SELECT 1 FROM fact_agent_approval f 
  WHERE f.source_id = a.id::TEXT
);
```

### ETL 2: Dimension Updates (Daily)

```sql
-- Update dim_customer with latest stats
INSERT INTO dim_customer (customer_email, shop_domain, customer_name, first_interaction_date, last_interaction_date)
SELECT 
  customer_email,
  shop_domain,
  customer_name,
  MIN(created_at)::DATE,
  MAX(created_at)::DATE
FROM agent_approvals
WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
AND customer_email IS NOT NULL
GROUP BY customer_email, shop_domain, customer_name
ON CONFLICT (customer_email, shop_domain) 
DO UPDATE SET 
  last_interaction_date = EXCLUDED.last_interaction_date,
  updated_at = NOW();
```

## Sample Analytical Queries

### Query 1: Daily Approval Rate Trend
```sql
SELECT 
  d.date_actual,
  d.day_of_week,
  COUNT(*) as total_drafts,
  SUM(CASE WHEN f.is_approved THEN 1 ELSE 0 END) as approved,
  ROUND(100.0 * SUM(CASE WHEN f.is_approved THEN 1 ELSE 0 END) / COUNT(*), 2) as approval_rate_pct,
  AVG(f.confidence_score) as avg_confidence
FROM fact_agent_approval f
JOIN dim_date d ON f.date_sk = d.date_sk
WHERE d.date_actual >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY d.date_actual, d.day_of_week
ORDER BY d.date_actual;
```

### Query 2: Shop Performance Comparison
```sql
SELECT 
  s.shop_name,
  s.plan_type,
  COUNT(*) as total_queries,
  AVG(q.latency_ms) as avg_latency,
  ROUND(100.0 * SUM(CASE WHEN q.is_approved THEN 1 ELSE 0 END) / COUNT(*), 2) as approval_rate
FROM fact_agent_query q
JOIN dim_shop s ON q.shop_sk = s.shop_sk
JOIN dim_date d ON q.date_sk = d.date_sk
WHERE d.is_current_month = TRUE
GROUP BY s.shop_name, s.plan_type
ORDER BY total_queries DESC
LIMIT 10;
```

### Query 3: Training Data Quality by Annotator
```sql
SELECT 
  a.annotator_name,
  a.role,
  COUNT(*) as total_annotations,
  AVG(f.overall_score) as avg_overall_quality,
  AVG(f.clarity_score) as avg_clarity,
  AVG(f.accuracy_score) as avg_accuracy
FROM fact_training_feedback f
JOIN dim_annotator a ON f.annotator_sk = a.annotator_sk
JOIN dim_date d ON f.date_sk = d.date_sk
WHERE d.is_current_month = TRUE
GROUP BY a.annotator_name, a.role
ORDER BY avg_overall_quality DESC;
```

## Implementation Plan

### Phase 1: Schema Creation (Day 1-2)
1. Create all dimension tables
2. Populate dim_date
3. Create initial dim_agent_type, dim_shop
4. Create fact table structures

### Phase 2: Initial Load (Day 3-5)
1. Historical backfill (last 90 days)
2. Validate data quality
3. Test analytical queries

### Phase 3: Incremental ETL (Day 6-7)
1. Implement daily incremental jobs
2. Set up pg_cron schedules
3. Monitor ETL performance

### Phase 4: BI Integration (Day 8-10)
1. Connect to BI tool (Metabase/Looker)
2. Create standard reports
3. User training

## Maintenance

**Daily**:
- Run incremental ETL jobs
- Update dimension tables
- Validate data freshness

**Weekly**:
- Review ETL performance
- Optimize slow queries
- Archive old partition data

**Monthly**:
- Full data quality audit
- Update dim_date for next month
- Review dimension SCD history

---

**Status**: Design complete  
**Next Step**: Create dimensional schema migration  
**Estimated Implementation**: 1-2 weeks full data warehouse
