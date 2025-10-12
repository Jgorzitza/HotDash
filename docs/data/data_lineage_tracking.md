---
epoch: 2025.10.E1
doc: docs/data/lineage_tracking.md
owner: data
last_reviewed: 2025-10-11
---

# Data Lineage Tracking

## Overview
Track data flow from source to destination across tables, views, ETL processes, and transformations for impact analysis and debugging.

## Lineage Graph
```
agent_queries (source) 
  → v_agent_response_accuracy (view)
  → mv_daily_agent_metrics (materialized view)
  → fact_agent_query (data warehouse)
  → agg_agent_daily_performance (aggregate)
```

## Implementation
```sql
CREATE TABLE data_lineage (
  lineage_id BIGSERIAL PRIMARY KEY,
  source_object TEXT NOT NULL, -- 'public.agent_queries'
  target_object TEXT NOT NULL, -- 'public.v_agent_response_accuracy'
  lineage_type TEXT NOT NULL, -- 'view', 'etl', 'trigger', 'function'
  transformation_sql TEXT,
  dependencies JSONB, -- Array of dependent objects
  impact_score INTEGER, -- 1-10 (how many downstream objects affected)
  last_validated_at TIMESTAMPTZ
);

-- Auto-populate from pg_depend
CREATE OR REPLACE FUNCTION discover_lineage()
RETURNS void AS $$
BEGIN
  INSERT INTO data_lineage (source_object, target_object, lineage_type)
  SELECT 
    source_ns.nspname || '.' || source_class.relname,
    target_ns.nspname || '.' || target_class.relname,
    CASE target_class.relkind 
      WHEN 'v' THEN 'view'
      WHEN 'm' THEN 'materialized_view'
      ELSE 'other'
    END
  FROM pg_depend d
  JOIN pg_class source_class ON d.refobjid = source_class.oid
  JOIN pg_namespace source_ns ON source_class.relnamespace = source_ns.oid
  JOIN pg_class target_class ON d.objid = target_class.oid
  JOIN pg_namespace target_ns ON target_class.relnamespace = target_ns.oid
  WHERE source_ns.nspname = 'public' AND target_ns.nspname = 'public'
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
```

**Status:** Lineage tracking designed with auto-discovery from pg_depend

