---
epoch: 2025.10.E1
doc: docs/data/feature_store_design.md
owner: data
last_reviewed: 2025-10-11
---

# Feature Store for ML Models

## Overview

Centralized feature store for ML model training and serving with real-time and batch feature computation.

## Architecture

- **Online Store (Postgres):** Real-time features for model serving (<10ms)
- **Offline Store (Parquet):** Historical features for training
- **Feature Registry:** Metadata, versioning, lineage

## Schema

```sql
CREATE TABLE ml_features_online (
  entity_id TEXT NOT NULL, -- customer_id, agent_name, conversation_id
  entity_type TEXT NOT NULL, -- 'customer', 'agent', 'conversation'
  feature_name TEXT NOT NULL,
  feature_value NUMERIC,
  feature_timestamp TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (entity_id, entity_type, feature_name)
);

CREATE TABLE ml_feature_registry (
  feature_id SERIAL PRIMARY KEY,
  feature_name TEXT NOT NULL UNIQUE,
  description TEXT,
  data_type TEXT,
  computation_logic TEXT,
  refresh_frequency TEXT, -- 'real-time', 'hourly', 'daily'
  owner_team TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Feature Examples

- `agent_approval_rate_7d`: Rolling 7-day approval rate
- `customer_ticket_count_30d`: Tickets in last 30 days
- `conversation_sentiment_score`: NLP-based sentiment

**Status:** Feature store designed for ML workflow
