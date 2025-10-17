---
epoch: 2025.10.E1
doc: docs/data/ab_testing_infrastructure.md
owner: data
last_reviewed: 2025-10-11
---

# A/B Testing Data Infrastructure

## Overview

Data infrastructure for running A/B tests on agent responses, approval workflows, and training interventions.

## Schema

```sql
CREATE TABLE ab_experiments (
  experiment_id SERIAL PRIMARY KEY,
  experiment_name TEXT NOT NULL UNIQUE,
  hypothesis TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  target_metric TEXT, -- 'approval_rate', 'latency', 'customer_satisfaction'
  min_sample_size INTEGER DEFAULT 1000,
  significance_level NUMERIC DEFAULT 0.05
);

CREATE TABLE ab_variants (
  variant_id SERIAL PRIMARY KEY,
  experiment_id INTEGER REFERENCES ab_experiments(experiment_id),
  variant_name TEXT, -- 'control', 'variant_a', 'variant_b'
  description TEXT,
  traffic_allocation NUMERIC CHECK (traffic_allocation BETWEEN 0 AND 1),
  configuration JSONB
);

CREATE TABLE ab_observations (
  observation_id BIGSERIAL PRIMARY KEY,
  experiment_id INTEGER REFERENCES ab_experiments(experiment_id),
  variant_id INTEGER REFERENCES ab_variants(variant_id),
  entity_id TEXT, -- conversation_id or customer_id
  metric_value NUMERIC,
  observed_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Statistical Functions

```sql
CREATE OR REPLACE FUNCTION ab_test_significance(
  p_experiment_id INTEGER
)
RETURNS TABLE(
  variant_name TEXT,
  sample_size INTEGER,
  mean_metric NUMERIC,
  std_dev NUMERIC,
  p_value NUMERIC,
  is_significant BOOLEAN
) AS $$
-- T-test implementation for variant comparison
-- Returns statistical significance of difference from control
BEGIN
  -- Statistical test implementation
  RETURN QUERY SELECT ...;
END;
$$ LANGUAGE plpgsql;
```

**Status:** A/B testing infrastructure designed with statistical analysis
