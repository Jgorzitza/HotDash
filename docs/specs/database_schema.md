# HotDash Database Schema Documentation

## Purpose

Comprehensive database schema reference for all HotDash tables. Used by Integrations Agent (API contracts), Analytics Agent (dashboard queries), and all agents requiring database access.

**Last Updated**: 2025-10-20  
**Database**: PostgreSQL (Supabase)  
**Total Tables**: 20+ (including ads_tracking pending migration)

---

## Schema Overview

### Table Categories

1. **Ads & Marketing** (2 tables) - Campaign tracking, ROAS analysis
2. **Agent System** (6 tables) - AI agent approvals, feedback, queries, metrics, QC
3. **Knowledge Base** (3+ tables) - RAG embeddings, document store
4. **Inventory** (3 tables) - Snapshots, reorder points, supplier lead times
5. **Analytics** (2 tables) - Dashboard facts, decision logs
6. **Support** (1 table) - Curated replies (Chatwoot integration)
7. **Observability** (1 table) - System logs
8. **Credentials** (1 table) - **CRITICAL** - Encrypted API credentials

---

## 1. Ads & Marketing Tables

### `ads_campaigns`

**Purpose**: Store ad campaign configuration and metadata for ROAS tracking

**Status**: Pending migration `20251020005738_ads_tracking.sql`

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `campaign_id` | TEXT | NO | - | External campaign ID (unique) |
| `platform` | TEXT | NO | - | Platform: meta, google, organic, tiktok, pinterest |
| `campaign_name` | TEXT | NO | - | Campaign display name |
| `status` | TEXT | NO | 'active' | Status: active, paused, draft, archived |
| `budget_cents` | INTEGER | NO | 0 | Budget in cents (avoid float precision) |
| `target_roas` | DECIMAL(10,2) | YES | NULL | Target ROAS (e.g., 3.00 = 3x return) |
| `start_date` | DATE | NO | - | Campaign start date |
| `end_date` | DATE | YES | NULL | Campaign end date (NULL = ongoing) |
| `utm_source` | TEXT | YES | NULL | UTM tracking parameter |
| `utm_medium` | TEXT | YES | NULL | UTM tracking parameter |
| `utm_campaign` | TEXT | YES | NULL | UTM tracking parameter |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update timestamp (auto-updated) |
| `metadata` | JSONB | YES | `'{}'::JSONB` | Platform-specific data |

**Indexes**:

- `idx_ads_campaigns_platform` - Fast platform filtering
- `idx_ads_campaigns_status` - Status-based queries
- `idx_ads_campaigns_dates` - Date range queries
- `idx_ads_campaigns_utm` - UTM tracking queries

**RLS Policies**:

- Authenticated users: SELECT (read-only)
- Service role: ALL (full access)

**Constraints**:

- `campaign_id` UNIQUE
- `platform` CHECK (IN meta, google, organic, tiktok, pinterest)
- `status` CHECK (IN active, paused, draft, archived)

**Triggers**:

- `update_ads_campaigns_updated_at` - Auto-update `updated_at` on modification

---

### `ads_daily_metrics`

**Purpose**: Daily aggregated campaign metrics with auto-calculated ROAS/CPC/CPA

**Status**: Pending migration `20251020005738_ads_tracking.sql`

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `campaign_id` | UUID | NO | - | FK to `ads_campaigns.id` (ON DELETE CASCADE) |
| `metric_date` | DATE | NO | - | Metric date (UTC) |
| `spend_cents` | INTEGER | NO | 0 | Daily spend in cents |
| `impressions` | INTEGER | NO | 0 | Total impressions |
| `clicks` | INTEGER | NO | 0 | Total clicks |
| `conversions` | INTEGER | NO | 0 | Total conversions |
| `revenue_cents` | INTEGER | NO | 0 | Revenue attributed to campaign (cents) |
| `cpc_cents` | INTEGER | YES | NULL | Cost Per Click (auto-calculated) |
| `cpa_cents` | INTEGER | YES | NULL | Cost Per Acquisition (auto-calculated) |
| `roas` | DECIMAL(10,2) | YES | NULL | Return On Ad Spend (auto-calculated) |
| `ctr` | DECIMAL(10,4) | YES | NULL | Click-Through Rate (auto-calculated) |
| `conversion_rate` | DECIMAL(10,4) | YES | NULL | Conversion rate (auto-calculated) |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update timestamp |

**Indexes**:

- `idx_ads_daily_metrics_campaign` - Campaign aggregations
- `idx_ads_daily_metrics_date` - Time-series queries
- `idx_ads_daily_metrics_campaign_date` - Composite for dashboard tiles

**RLS Policies**:

- Authenticated users: SELECT (read-only)
- Service role: ALL (full access)

**Constraints**:

- UNIQUE(`campaign_id`, `metric_date`) - One row per campaign per day

**Triggers**:

- `calculate_ads_metrics_trigger` - Auto-calculate CPC, CPA, ROAS, CTR, conversion_rate (division by zero safe)
- `update_ads_daily_metrics_updated_at` - Auto-update `updated_at`

**Calculated Metrics Logic**:

```sql
CPC = spend_cents / clicks (NULL if clicks = 0)
CPA = spend_cents / conversions (NULL if conversions = 0)
ROAS = revenue_cents / spend_cents (NULL if spend_cents = 0)
CTR = clicks / impressions (NULL if impressions = 0)
conversion_rate = conversions / clicks (NULL if clicks = 0)
```

---

## 2. Agent System Tables

### `agent_run`

**Purpose**: Track AI agent execution runs with performance metrics

**Status**: ✅ PRODUCTION (RLS enabled 2025-10-19)

**RLS**: Enabled - Service role full access

---

### `agent_qc`

**Purpose**: Quality control audit trail for agent outputs

**Status**: ✅ PRODUCTION (RLS enabled 2025-10-19)

**RLS**: Enabled - Service role full access

---

### `AgentApproval`

**Purpose**: Human-in-the-loop approval queue for AI agent actions

**Status**: ✅ PRODUCTION

**RLS**: Enabled - Authenticated read, Service role manage

---

### `AgentFeedback`

**Purpose**: Store operator feedback on AI agent suggestions (learning loop)

**Status**: ✅ PRODUCTION

**RLS**: Enabled

---

### `AgentQuery`

**Purpose**: Log all AI agent queries for debugging and analytics

**Status**: ✅ PRODUCTION

**RLS**: Enabled

---

### `ads_metrics_daily` (legacy)

**Purpose**: Legacy ads metrics table (superseded by `ads_daily_metrics`)

**Status**: ✅ PRODUCTION (RLS enabled 2025-10-19)

**RLS**: Enabled - Authenticated read, Service role write

**Note**: Being replaced by `ads_campaigns` + `ads_daily_metrics` schema in migration `20251020005738`

---

## 3. Knowledge Base Tables

### `knowledge_*`

**Purpose**: RAG (Retrieval-Augmented Generation) document store with pgvector embeddings

**Status**: Pending migration (ai-knowledge agent work)

**Tables**:

- `knowledge_documents` - Source documents
- `knowledge_chunks` - Chunked content with embeddings
- `knowledge_metadata` - Document metadata for filtering

**RLS**: Pending (will be service_role only for security)

---

## 4. Inventory Tables

### `inventory_snapshots`

**Purpose**: Daily inventory snapshots for WOS (Weeks of Supply) calculations

**Status**: ✅ PRODUCTION

**RLS**: Enabled

---

### `reorder_points`

**Purpose**: Dynamic ROP (Reorder Point) calculations per SKU

**Status**: ✅ PRODUCTION

**RLS**: Enabled

---

### `supplier_lead_times`

**Purpose**: Supplier-specific lead time tracking for ROP engine

**Status**: ✅ PRODUCTION

**RLS**: Enabled

---

## 5. Analytics Tables

### `DashboardFact`

**Purpose**: Generic fact table for dashboard tiles (OLAP-style)

**Status**: ✅ PRODUCTION

**RLS**: Enabled

---

### `DecisionLog`

**Purpose**: Audit trail for all system decisions (inventory, CX, growth)

**Status**: ✅ PRODUCTION

**RLS**: Enabled

---

## 6. Support Tables

### `support_curated_replies`

**Purpose**: Pre-approved reply templates for Chatwoot integration

**Status**: ✅ PRODUCTION

**RLS**: Enabled

---

## 7. Observability Tables

### `observability_logs`

**Purpose**: Centralized system logs for debugging and monitoring

**Status**: ✅ PRODUCTION

**RLS**: Enabled - Authenticated users can read INFO/WARN, service_role sees all

---

## 8. Credentials Table (CRITICAL)

### `creds_meta`

**Purpose**: **CRITICAL** - Encrypted API credentials for external services

**Status**: ✅ PRODUCTION (RLS enabled 2025-10-19 - P0 security fix)

**RLS**: **Service role ONLY** - NO authenticated access (security requirement)

**Security**:

- All credentials AES-256 encrypted at rest
- RLS policy: Service role only (no authenticated user access)
- Audit log: All reads/writes logged to `DecisionLog`

---

## RLS Policy Summary

**Total Tables with RLS**: 18+

**Policy Types**:

1. **Authenticated Read + Service Write** - Most tables (dashboards, analytics)
2. **Service Role Only** - Credentials, agent internals
3. **Custom Policies** - Multi-tenant isolation (if applicable)

**Verification Query**:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true
ORDER BY tablename;
```

**Expected Output**: All production tables show `rowsecurity = t`

---

## Migration Status

| Migration                                        | Date       | Status     | Tables Affected                                    |
| ------------------------------------------------ | ---------- | ---------- | -------------------------------------------------- |
| `20251020005738_ads_tracking.sql`                | 2025-10-20 | Pending    | ads_campaigns, ads_daily_metrics (new)             |
| P0 RLS Fix (direct SQL)                          | 2025-10-19 | ✅ Applied | ads_metrics_daily, agent_run, agent_qc, creds_meta |
| `20251014191157_approval_tracking_analytics.sql` | 2025-10-14 | ✅ Applied | Multiple                                           |

**Latest Remote Migration**: `20251014191157`  
**Pending Local Migrations**: 1 (ads_tracking)

---

## Dashboard Tile Queries

**Revenue Tile**: `SELECT * FROM DashboardFact WHERE metric = 'revenue'`  
**Inventory Tile**: `SELECT * FROM inventory_snapshots`  
**Ads ROAS Tile**: `SELECT * FROM ads_daily_metrics WHERE metric_date >= NOW() - INTERVAL '30 days'` (pending migration)  
**Support Queue**: `SELECT * FROM AgentApproval WHERE status = 'pending'`

---

## Performance Considerations

**Indexed Columns**:

- All timestamp columns (`created_at`, `updated_at`)
- All FK relationships
- All UTM parameters (for attribution queries)
- Campaign + Date composites (for time-series aggregations)

**Query Optimization**:

- Use materialized views for complex aggregations (future work)
- Partition large tables by date (if >10M rows)
- Use pgvector indexes for knowledge base similarity search

---

## API Integration Points

**Shopify Admin API**: Inventory tables updated via mutations  
**Chatwoot API**: Support tables synced via webhooks  
**GA4 API**: Analytics tables populated via ETL  
**Publer API**: Social metrics tracked in separate schema (future)  
**OpenAI API**: AgentQuery table logs all LLM calls

---

**Maintained By**: Data Agent  
**Reviewers**: Integrations Agent (API contracts), Analytics Agent (dashboard queries)  
**Status**: Living Document
