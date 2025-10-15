---
epoch: 2025.10.E1
doc: docs/data/dataset_versioning.md
owner: data
last_reviewed: 2025-10-11
---

# Training Dataset Versioning System

## Overview
Version control for ML training datasets with snapshots, reproducibility, and drift detection.

## Versioning Schema
```sql
CREATE TABLE training_dataset_versions (
  version_id SERIAL PRIMARY KEY,
  dataset_name TEXT NOT NULL,
  version_tag TEXT NOT NULL, -- 'v1.0', 'v1.1', etc.
  snapshot_timestamp TIMESTAMPTZ NOT NULL,
  row_count INTEGER,
  feature_count INTEGER,
  data_hash TEXT, -- SHA256 for immutability verification
  schema_json JSONB,
  storage_path TEXT, -- S3 or Supabase Storage path
  created_by TEXT,
  notes TEXT,
  is_production BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dataset_name, version_tag)
);

CREATE TABLE training_dataset_metrics (
  version_id INTEGER REFERENCES training_dataset_versions(version_id),
  metric_name TEXT,
  metric_value NUMERIC,
  PRIMARY KEY (version_id, metric_name)
);
```

## Snapshot Function
```sql
CREATE OR REPLACE FUNCTION snapshot_training_dataset(
  p_dataset_name TEXT,
  p_version_tag TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_version_id INTEGER;
  v_row_count INTEGER;
  v_storage_path TEXT;
BEGIN
  -- Count rows
  EXECUTE format('SELECT COUNT(*) FROM %I', p_dataset_name) INTO v_row_count;
  
  -- Generate storage path
  v_storage_path := format('training_datasets/%s/%s.parquet', p_dataset_name, p_version_tag);
  
  -- Insert version record
  INSERT INTO training_dataset_versions (dataset_name, version_tag, snapshot_timestamp, row_count, storage_path)
  VALUES (p_dataset_name, p_version_tag, NOW(), v_row_count, v_storage_path)
  RETURNING version_id INTO v_version_id;
  
  -- Export to storage (implementation depends on tooling)
  
  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;
```

**Status:** Dataset versioning system designed with snapshots and immutability

