---
epoch: 2025.10.E1
doc: docs/data/lakehouse_architecture.md
owner: data
last_reviewed: 2025-10-11
---

# Data Lakehouse Architecture

## Overview
Modern data lakehouse combining data warehouse (structured) and data lake (unstructured) for unified analytics on Supabase Storage + PostgreSQL.

## Architecture
```
Operational DB (Postgres) → Bronze Layer (Raw) → Silver Layer (Cleaned) → Gold Layer (Aggregated)
                              ↓ Supabase Storage              ↓ Parquet/Delta
                              Raw JSON/CSV                    Validated Schema
```

## Storage Tiers
- **Hot (Postgres):** Last 7 days, sub-second queries
- **Warm (Supabase Storage):** 8-90 days, Parquet format
- **Cold (S3 Glacier):** >90 days, archived

## Benefits
- Cost optimization (85% savings on old data)
- Unified query interface (DuckDB + Postgres)
- ACID transactions on recent data
- Petabyte-scale historical analysis

**Status:** Lakehouse architecture designed

