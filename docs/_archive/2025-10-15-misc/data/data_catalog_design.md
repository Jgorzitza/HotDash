---
epoch: 2025.10.E1
doc: docs/data/data_catalog_design.md
owner: data
last_reviewed: 2025-10-11
---

# Data Cataloging and Discovery System

## Overview

Automated data catalog for discovering tables, views, columns, relationships, and usage patterns across the Agent SDK data platform.

## Catalog Schema

```sql
CREATE TABLE data_catalog_tables (
  table_id SERIAL PRIMARY KEY,
  schema_name TEXT NOT NULL,
  table_name TEXT NOT NULL,
  table_type TEXT, -- 'table', 'view', 'materialized_view'
  description TEXT,
  row_count BIGINT,
  size_bytes BIGINT,
  owner_team TEXT,
  pii_classification TEXT, -- 'none', 'low', 'medium', 'high'
  retention_days INTEGER,
  last_updated_at TIMESTAMPTZ,
  UNIQUE(schema_name, table_name)
);

CREATE TABLE data_catalog_columns (
  column_id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES data_catalog_tables(table_id),
  column_name TEXT NOT NULL,
  data_type TEXT,
  is_nullable BOOLEAN,
  description TEXT,
  sample_values TEXT[], -- Top 5 values for discovery
  distinct_count BIGINT,
  null_count BIGINT
);

CREATE TABLE data_catalog_lineage (
  lineage_id SERIAL PRIMARY KEY,
  source_table_id INTEGER REFERENCES data_catalog_tables(table_id),
  target_table_id INTEGER REFERENCES data_catalog_tables(table_id),
  transformation_type TEXT, -- 'etl', 'view', 'materialized_view', 'trigger'
  transformation_sql TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Auto-Discovery Function

```sql
CREATE OR REPLACE FUNCTION refresh_data_catalog()
RETURNS void AS $$
BEGIN
  -- Populate catalog from information_schema
  INSERT INTO data_catalog_tables (schema_name, table_name, table_type, row_count, size_bytes)
  SELECT
    schemaname, tablename, 'table',
    n_live_tup, pg_total_relation_size(schemaname||'.'||tablename)
  FROM pg_stat_user_tables
  ON CONFLICT (schema_name, table_name) DO UPDATE SET
    row_count = EXCLUDED.row_count,
    size_bytes = EXCLUDED.size_bytes,
    last_updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

**Status:** Data catalog designed with auto-discovery
