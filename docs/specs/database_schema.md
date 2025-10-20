# HotDash Database Schema Documentation

## Purpose

Comprehensive database schema reference for all HotDash tables. Used by Integrations Agent (API contracts), Analytics Agent (dashboard queries), and all agents requiring database access.

**Last Updated**: 2025-10-20  
**Database**: PostgreSQL (Supabase)  
**Total Tables**: 28+ (including ads_tracking and inventory pending migrations)

---

## Schema Overview

### Table Categories

1. **Inventory Management** (8 tables) - **NEW** - Products, variants, snapshots, vendors, POs, audit trail
2. **Ads & Marketing** (2 tables) - Campaign tracking, ROAS analysis
3. **Agent System** (6 tables) - AI agent approvals, feedback, queries, metrics, QC
4. **Knowledge Base** (3+ tables) - RAG embeddings, document store
5. **Analytics** (2 tables) - Dashboard facts, decision logs
6. **Support** (1 table) - Curated replies (Chatwoot integration)
7. **Observability** (1 table) - System logs
8. **Credentials** (1 table) - **CRITICAL** - Encrypted API credentials

---

## 1. Inventory Management Tables

### Overview

**Migrations**:

- `20251020190500_inventory_tables.sql` (tables, indexes, triggers)
- `20251020190600_inventory_rls.sql` (RLS policies, grants)

**Status**: Pending application (local files created 2025-10-19 20:17)

**Purpose**: Complete inventory intelligence system with Shopify product sync, ROP calculations, vendor management, PO generation, and immutable audit trail.

**Multi-Tenant Isolation**: All tables include `project` column with RLS policies for project-based data isolation.

---

### `products`

**Purpose**: Shopify products synced via GraphQL Admin API

**Status**: Pending migration `20251020190500_inventory_tables.sql`

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | TEXT | NO | - | Primary key (Shopify GID: gid://shopify/Product/...) |
| `shopify_id` | BIGINT | NO | - | Numeric Shopify product ID (UNIQUE) |
| `title` | TEXT | NO | - | Product title |
| `vendor` | TEXT | YES | NULL | Product vendor |
| `product_type` | TEXT | YES | NULL | Product type/category |
| `tags` | TEXT[] | YES | NULL | Array of tags (BUNDLE:TRUE, PACK:X) |
| `status` | TEXT | NO | 'active' | Status: active, archived, draft |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update (auto-updated) |
| `shopify_created_at` | TIMESTAMPTZ | YES | NULL | Shopify creation timestamp |
| `shopify_updated_at` | TIMESTAMPTZ | YES | NULL | Shopify update timestamp |
| `metadata` | JSONB | YES | `'{}'` | Additional metafields |
| `project` | TEXT | NO | 'occ' | Project namespace |

**Indexes**:

- `idx_products_shopify_id` - Shopify ID lookups
- `idx_products_vendor` - Vendor filtering
- `idx_products_tags` (GIN) - Tag array searches (BUNDLE:TRUE queries)
- `idx_products_status` - Status filtering
- `idx_products_project` - RLS project isolation

**RLS Policies** (4):

- `products_service_role_all` - Service role ALL
- `products_read_by_project` - Authenticated SELECT by project
- `products_read_ai_readonly` - AI readonly SELECT all
- `products_insert_by_project`, `products_update_by_project` - Authenticated INSERT/UPDATE by project

**Triggers**:

- `update_products_updated_at` - Auto-update `updated_at`

---

### `variants`

**Purpose**: Shopify product variants with pricing and SKU

**Status**: Pending migration `20251020190500_inventory_tables.sql`

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | TEXT | NO | - | Primary key (Shopify GID: gid://shopify/ProductVariant/...) |
| `shopify_id` | BIGINT | NO | - | Numeric Shopify variant ID (UNIQUE) |
| `product_id` | TEXT | NO | - | FK to products (ON DELETE CASCADE) |
| `title` | TEXT | NO | - | Variant title |
| `sku` | TEXT | YES | NULL | Stock Keeping Unit |
| `price` | NUMERIC(10,2) | NO | 0 | Variant price |
| `compare_at_price` | NUMERIC(10,2) | YES | NULL | Compare-at price |
| `position` | INTEGER | NO | 1 | Sort position |
| `inventory_policy` | TEXT | YES | 'deny' | deny, continue |
| `fulfillment_service` | TEXT | YES | 'manual' | Fulfillment service |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update (auto-updated) |
| `shopify_created_at` | TIMESTAMPTZ | YES | NULL | Shopify creation |
| `shopify_updated_at` | TIMESTAMPTZ | YES | NULL | Shopify update |
| `metadata` | JSONB | YES | `'{}'` | Additional data |
| `project` | TEXT | NO | 'occ' | Project namespace |

**Indexes**:

- `idx_variants_product_id` - Product lookups
- `idx_variants_sku` - SKU searches
- `idx_variants_shopify_id` - Shopify ID lookups
- `idx_variants_project` - RLS project isolation

**RLS Policies** (4):

- `variants_service_role_all` - Service role ALL
- `variants_read_by_project` - Authenticated SELECT by project
- `variants_read_ai_readonly` - AI readonly SELECT all
- `variants_insert_by_project`, `variants_update_by_project` - Authenticated INSERT/UPDATE by project

**Triggers**:

- `update_variants_updated_at` - Auto-update `updated_at`

---

### `inventory_snapshots`

**Purpose**: Daily inventory snapshots with ROP calculations and status buckets

**Status**: Pending migration `20251020190500_inventory_tables.sql`

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `variant_id` | TEXT | NO | - | FK to variants (ON DELETE CASCADE) |
| `snapshot_date` | DATE | NO | `CURRENT_DATE` | Snapshot date |
| `available_quantity` | INTEGER | NO | 0 | Available stock |
| `on_hand_quantity` | INTEGER | NO | 0 | On-hand stock |
| `committed_quantity` | INTEGER | NO | 0 | Committed stock |
| `incoming_quantity` | INTEGER | NO | 0 | Incoming stock |
| `avg_daily_sales` | NUMERIC(10,2) | YES | NULL | Average daily sales |
| `max_daily_sales` | NUMERIC(10,2) | YES | NULL | Max daily sales |
| `sales_velocity` | TEXT | YES | NULL | high, medium, low, dormant |
| `lead_time_days` | INTEGER | YES | 7 | Supplier lead time |
| `max_lead_days` | INTEGER | YES | 10 | Maximum lead time |
| `safety_stock` | INTEGER | YES | NULL | Calculated safety stock buffer |
| `reorder_point` | INTEGER | YES | NULL | Calculated ROP = avg_sales \* lead_time + safety_stock |
| `status` | TEXT | NO | 'in_stock' | in_stock, low_stock, out_of_stock, urgent_reorder |
| `weeks_of_supply` | NUMERIC(5,2) | YES | NULL | WOS calculation |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update |
| `project` | TEXT | NO | 'occ' | Project namespace |

**Unique Constraint**: `(variant_id, snapshot_date, project)`

**Indexes**:

- `idx_inventory_snapshots_variant` - Variant lookups
- `idx_inventory_snapshots_date` - Time-series queries
- `idx_inventory_snapshots_status` - Status filtering (urgent_reorder queries)
- `idx_inventory_snapshots_project` - RLS project isolation

**RLS Policies** (4):

- `inventory_snapshots_service_role_all` - Service role ALL
- `inventory_snapshots_read_by_project` - Authenticated SELECT by project
- `inventory_snapshots_read_ai_readonly` - AI readonly SELECT all
- `inventory_snapshots_insert_by_project`, `inventory_snapshots_update_by_project`

**Triggers**:

- `update_inventory_snapshots_updated_at` - Auto-update `updated_at`

---

### `vendors`

**Purpose**: Vendor/supplier management with lead times

**Status**: Pending migration `20251020190500_inventory_tables.sql`

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `name` | TEXT | NO | - | Vendor name (UNIQUE) |
| `contact_name` | TEXT | YES | NULL | Contact person |
| `contact_email` | TEXT | YES | NULL | Contact email |
| `contact_phone` | TEXT | YES | NULL | Contact phone |
| `lead_time_days` | INTEGER | NO | 7 | Standard lead time |
| `max_lead_days` | INTEGER | NO | 10 | Maximum lead time |
| `payment_terms` | TEXT | YES | NULL | Net 30, Net 60, etc. |
| `notes` | TEXT | YES | NULL | Vendor notes |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update |
| `project` | TEXT | NO | 'occ' | Project namespace |

**Indexes**:

- `idx_vendors_name` - Name lookups
- `idx_vendors_project` - RLS project isolation

**RLS Policies** (4):

- `vendors_service_role_all` - Service role ALL
- `vendors_read_by_project` - Authenticated SELECT by project
- `vendors_read_ai_readonly` - AI readonly SELECT all
- `vendors_insert_by_project`, `vendors_update_by_project`

**Triggers**:

- `update_vendors_updated_at` - Auto-update `updated_at`

---

### `product_vendors`

**Purpose**: Product-vendor associations with costs (many-to-many)

**Status**: Pending migration `20251020190500_inventory_tables.sql`

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `product_id` | TEXT | NO | - | FK to products (ON DELETE CASCADE) |
| `vendor_id` | UUID | NO | - | FK to vendors (ON DELETE CASCADE) |
| `cost` | NUMERIC(10,2) | NO | - | Unit cost from vendor |
| `is_primary` | BOOLEAN | NO | false | Primary vendor flag |
| `sku` | TEXT | YES | NULL | Vendor's SKU for this product |
| `notes` | TEXT | YES | NULL | Vendor-specific notes |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update |
| `project` | TEXT | NO | 'occ' | Project namespace |

**Unique Constraint**: `(product_id, vendor_id, project)`

**Indexes**:

- `idx_product_vendors_product` - Product lookups
- `idx_product_vendors_vendor` - Vendor lookups
- `idx_product_vendors_primary` - Primary vendor queries
- `idx_product_vendors_project` - RLS project isolation

**RLS Policies** (4):

- `product_vendors_service_role_all` - Service role ALL
- `product_vendors_read_by_project` - Authenticated SELECT by project
- `product_vendors_read_ai_readonly` - AI readonly SELECT all
- `product_vendors_insert_by_project`, `product_vendors_update_by_project`

**Triggers**:

- `update_product_vendors_updated_at` - Auto-update `updated_at`

---

### `purchase_orders`

**Purpose**: Internal purchase orders (CSV export to vendors, email coordination)

**Status**: Pending migration `20251020190500_inventory_tables.sql`

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `po_number` | TEXT | NO | - | Generated PO number (UNIQUE) |
| `vendor_id` | UUID | NO | - | FK to vendors |
| `status` | TEXT | NO | 'draft' | draft, sent, confirmed, received, cancelled |
| `order_date` | DATE | NO | `CURRENT_DATE` | Order date |
| `expected_delivery_date` | DATE | YES | NULL | Expected delivery |
| `actual_delivery_date` | DATE | YES | NULL | Actual delivery |
| `total_cost` | NUMERIC(12,2) | NO | 0 | Total PO cost |
| `notes` | TEXT | YES | NULL | PO notes |
| `created_by` | TEXT | YES | NULL | User who created PO |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update |
| `project` | TEXT | NO | 'occ' | Project namespace |

**Indexes**:

- `idx_purchase_orders_vendor` - Vendor lookups
- `idx_purchase_orders_status` - Status filtering
- `idx_purchase_orders_po_number` - PO number lookups
- `idx_purchase_orders_project` - RLS project isolation

**RLS Policies** (4):

- `purchase_orders_service_role_all` - Service role ALL
- `purchase_orders_read_by_project` - Authenticated SELECT by project
- `purchase_orders_read_ai_readonly` - AI readonly SELECT all
- `purchase_orders_insert_by_project`, `purchase_orders_update_by_project`

**Triggers**:

- `update_purchase_orders_updated_at` - Auto-update `updated_at`

---

### `purchase_order_items`

**Purpose**: PO line items (many-to-many: PO ↔ Variants)

**Status**: Pending migration `20251020190500_inventory_tables.sql`

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `po_id` | UUID | NO | - | FK to purchase_orders (ON DELETE CASCADE) |
| `variant_id` | TEXT | NO | - | FK to variants |
| `quantity` | INTEGER | NO | - | Ordered quantity |
| `unit_cost` | NUMERIC(10,2) | NO | - | Cost per unit |
| `total_cost` | NUMERIC(12,2) | NO | - | Total line cost |
| `received_quantity` | INTEGER | NO | 0 | Quantity received |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update |
| `project` | TEXT | NO | 'occ' | Project namespace |

**Indexes**:

- `idx_po_items_po` - PO lookups
- `idx_po_items_variant` - Variant lookups
- `idx_po_items_project` - RLS project isolation

**RLS Policies** (4):

- `purchase_order_items_service_role_all` - Service role ALL
- `purchase_order_items_read_by_project` - Authenticated SELECT by project
- `purchase_order_items_read_ai_readonly` - AI readonly SELECT all
- `purchase_order_items_insert_by_project`, `purchase_order_items_update_by_project`

**Triggers**:

- `update_purchase_order_items_updated_at` - Auto-update `updated_at`

---

### `inventory_events`

**Purpose**: Immutable audit trail for all inventory operations

**Status**: Pending migration `20251020190500_inventory_tables.sql`

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `event_type` | TEXT | NO | - | sync, reorder, adjustment, po_created, po_received |
| `entity_type` | TEXT | NO | - | product, variant, po, vendor |
| `entity_id` | TEXT | NO | - | Entity identifier |
| `metadata` | JSONB | NO | `'{}'` | Event payload |
| `created_by` | TEXT | YES | NULL | User or system |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Event timestamp |
| `project` | TEXT | NO | 'occ' | Project namespace |

**Indexes**:

- `idx_inventory_events_type` - Event type filtering
- `idx_inventory_events_entity` - Composite (entity_type, entity_id)
- `idx_inventory_events_created` - Time-series DESC
- `idx_inventory_events_project` - RLS project isolation

**RLS Policies** (6 - IMMUTABLE):

- `inventory_events_service_role_all` - Service role ALL
- `inventory_events_read_by_project` - Authenticated SELECT by project
- `inventory_events_read_ai_readonly` - AI readonly SELECT all
- `inventory_events_insert_by_project` - Authenticated INSERT only
- `inventory_events_no_update` - **BLOCKS ALL UPDATES** (immutable audit trail)
- `inventory_events_no_delete` - **BLOCKS ALL DELETES** (immutable audit trail)

**Special Notes**:

- **Immutable**: Once inserted, records cannot be modified or deleted
- Audit trail integrity enforced by RLS policies
- Grows indefinitely - consider archival strategy (partition by date, archive >1 year)

---

## 2. Ads & Marketing Tables

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

---

## 9. Option A Feature Tables (Personalization, Notifications, Modal Actions)

### `sales_pulse_actions`

**Purpose**: Sales Modal action audit trail (variance review, notes, SKU flagging)

**Status**: Pending migration `20251020214500_sales_pulse_actions.sql`

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Action timestamp |
| `action_type` | TEXT | NO | - | variance_review, note_added, sku_flagged, other |
| `revenue_variance` | NUMERIC(12,2) | YES | NULL | WoW variance amount |
| `selected_action` | TEXT | YES | NULL | Dropdown action by operator |
| `notes` | TEXT | YES | NULL | Operator notes |
| `operator_name` | TEXT | NO | - | Operator who took action |
| `metadata` | JSONB | NO | `'{}'` | Additional action data |
| `project` | TEXT | NO | 'occ' | Project namespace |

**Indexes**:
- `idx_sales_pulse_actions_created` - Time-series DESC
- `idx_sales_pulse_actions_type` - Action type filtering
- `idx_sales_pulse_actions_project` - RLS project isolation

**RLS Policies** (3):
- `sales_pulse_actions_service_role_all` - Service role ALL
- `sales_pulse_actions_read_by_project` - Authenticated SELECT by project
- `sales_pulse_actions_insert_by_project` - Authenticated INSERT by project

---

### `inventory_actions`

**Purpose**: Inventory Modal action audit trail (reorder approvals, vendor selection)

**Status**: Pending migration `20251020215000_inventory_actions.sql`

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Action timestamp |
| `action_type` | TEXT | NO | - | reorder_approved, reorder_rejected, vendor_selected, velocity_reviewed, other |
| `variant_id` | TEXT | YES | NULL | Variant reference |
| `sku` | TEXT | YES | NULL | Product SKU |
| `reorder_quantity` | INTEGER | YES | NULL | Approved reorder qty |
| `vendor_id` | UUID | YES | NULL | Selected vendor |
| `velocity_analysis` | TEXT | YES | NULL | 14-day velocity summary |
| `operator_name` | TEXT | NO | - | Operator who took action |
| `notes` | TEXT | YES | NULL | Operator notes |
| `metadata` | JSONB | NO | `'{}'` | Additional action data |
| `project` | TEXT | NO | 'occ' | Project namespace |

**Indexes**:
- `idx_inventory_actions_created` - Time-series DESC
- `idx_inventory_actions_type` - Action type filtering
- `idx_inventory_actions_variant` - Variant lookups
- `idx_inventory_actions_project` - RLS project isolation

**RLS Policies** (3):
- `inventory_actions_service_role_all` - Service role ALL
- `inventory_actions_read_by_project` - Authenticated SELECT by project
- `inventory_actions_insert_by_project` - Authenticated INSERT by project

---

**Last Updated**: 2025-10-20 (Option A tables added)
