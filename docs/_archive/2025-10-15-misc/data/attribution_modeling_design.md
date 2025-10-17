---
epoch: 2025.10.E1
doc: docs/data/attribution_modeling_design.md
owner: data
last_reviewed: 2025-10-11
---

# Attribution Modeling for Agent-Assisted Conversions

## Overview

Multi-touch attribution model to measure agent contribution to customer conversions and revenue.

## Attribution Models

1. **Last-touch:** Credit to final agent interaction before conversion
2. **First-touch:** Credit to first agent interaction in journey
3. **Linear:** Equal credit across all touchpoints
4. **Time-decay:** More credit to recent interactions
5. **Position-based:** 40% first, 40% last, 20% middle

## SQL Implementation

```sql
CREATE TABLE agent_attribution (
  conversion_id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  conversion_value NUMERIC(10,2),
  conversion_at TIMESTAMPTZ,
  -- Attribution credits (sum to 100%)
  data_agent_credit NUMERIC(5,2) DEFAULT 0,
  support_agent_credit NUMERIC(5,2) DEFAULT 0,
  marketing_agent_credit NUMERIC(5,2) DEFAULT 0,
  attribution_model TEXT DEFAULT 'time_decay'
);

CREATE OR REPLACE FUNCTION calculate_attribution(p_customer_id TEXT, p_conversion_id TEXT)
RETURNS void AS $$
-- Time-decay attribution: More recent interactions get more credit
-- Implementation uses exponential decay with 7-day half-life
BEGIN
  -- Calculate and store attribution credits
  INSERT INTO agent_attribution (conversion_id, customer_id, ...)
  SELECT ... FROM agent_queries WHERE ...;
END;
$$ LANGUAGE plpgsql;
```

**Status:** Attribution framework designed
