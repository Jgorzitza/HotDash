# Database Schema: Phases 7-13

**Date**: 2025-10-21  
**Agent**: Data  
**Task**: DATA-008 - Phase 7-13 Schema Planning  
**Version**: 1.0  
**Status**: DRAFT - Awaiting Manager/CEO Approval

---

## Overview

### Schema Summary

- **New Tables**: 11 across 3 phases
- **Phases**: 7-8 (Growth), 9 (Onboarding), 10-13 (Advanced)
- **Features**: SEO, Ads, Social, Onboarding, A/B Testing, AI Knowledge, CEO Briefings

### Design Principles

1. Multi-tenant (all tables have `project` or `shop_domain`)
2. RLS-first (Row Level Security on every table)
3. Audit trail (`created_by`, `created_at`)
4. Performance (indexes for common queries)
5. Scalability (partitioning for high-volume)

---

## Phase 7-8: Growth Tables (5 tables)

### 1. seo_audits

**Purpose**: Daily SEO crawl results

**Key Columns**:

- `shop_domain`, `crawled_at`
- Core Web Vitals: `avg_lcp`, `avg_fid`, `avg_cls`
- Scores: `technical_score`, `content_score`, `performance_score`
- Issues: `critical_issues`, `high_priority_issues`

**Indexes**:

- `(shop_domain, crawled_at DESC)` - recent audits per shop

**RLS**: Shop-based access

---

### 2. seo_rankings

**Purpose**: Keyword position tracking

**Key Columns**:

- `shop_domain`, `keyword`, `position`, `tracked_at`
- `search_volume`, `search_engine`, `location`
- `featured_snippet` (boolean)

**Indexes**:

- `(shop_domain, keyword, tracked_at DESC)` - keyword history
- `(position)` WHERE position <= 100 - top 100 rankings only

**RLS**: Shop-based access

---

### 3. ad_campaigns

**Purpose**: Google Ads campaign definitions

**Key Columns**:

- `shop_domain`, `platform_campaign_id`, `campaign_name`
- `daily_budget`, `total_budget`, `bid_strategy`
- `campaign_status`, `start_date`, `end_date`

**Indexes**:

- `(shop_domain, campaign_status)` - active campaigns
- `(platform_campaign_id)` - external ID lookup

**RLS**: Shop-based access

---

### 4. ad_performance

**Purpose**: Daily ad metrics

**Key Columns**:

- `campaign_id` (FK), `date`
- Metrics: `impressions`, `clicks`, `conversions`
- Financial: `cost`, `revenue`, `roas`
- Calculated: `ctr`, `cpc`, `cpa`

**Indexes**:

- `(campaign_id, date DESC)` - campaign history
- `(roas DESC)` - top performing campaigns

**RLS**: Via parent campaign's shop_domain

**Relation**: `AdCampaign` → `AdPerformance` (1:many)

---

### 5. social_analytics

**Purpose**: Social post performance

**Key Columns**:

- `social_post_id` (FK), `platform`
- Engagement: `views`, `likes`, `comments`, `shares`
- Reach: `reach`, `impressions`
- Calculated: `engagement_rate`

**Indexes**:

- `(social_post_id, measured_at DESC)` - post metrics over time
- `(engagement_rate DESC)` - top posts

**RLS**: Via parent post's shop_domain

**Relation**: `SocialPost` → `SocialAnalytics` (1:many)

---

## Phase 9: Onboarding Tables (2 tables)

### 6. onboarding_progress

**Purpose**: Track user onboarding steps

**Key Columns**:

- `user_id`, `shop_domain`, `step_key`
- `status`: 'not_started', 'in_progress', 'completed', 'skipped'
- `completed_at`, `attempts`, `time_spent_seconds`

**Indexes**:

- `(user_id, shop_domain, step_order)` - user progress
- `(status)` - completion tracking

**RLS**: User-based access (auth.uid() = user_id)

**Unique**: (user_id, shop_domain, step_key)

---

### 7. feature_tours

**Purpose**: Interactive feature tours

**Key Columns**:

- `user_id`, `tour_key`, `tour_name`
- `steps` (JSONB) - tour step definitions
- `status`, `current_step`
- `times_shown`, `interactions`

**Indexes**:

- `(user_id, status)` - pending/active tours
- `(tour_key)` - tour definitions

**RLS**: User-based access

**Unique**: (user_id, tour_key)

---

## Phase 10-13: Advanced Tables (4 tables)

### 8. experiments

**Purpose**: A/B test definitions

**Key Columns**:

- `shop_domain`, `experiment_key`, `experiment_name`
- `variants` (JSONB) - variant config array
- `status`, `started_at`, `ended_at`
- `primary_metric`, `winning_variant`, `confidence_level`

**Indexes**:

- `(shop_domain, status)` - active experiments
- `(experiment_key)` - unique lookup

**RLS**: Shop-based access

**Unique**: (shop_domain, experiment_key)

**Relation**: `Experiment` → `ExperimentResult` (1:many)

---

### 9. experiment_results

**Purpose**: Variant performance metrics

**Key Columns**:

- `experiment_id` (FK), `variant_key`
- Metrics: `participants`, `conversions`, `conversion_rate`
- Revenue: `avg_order_value`, `revenue_per_user`
- Stats: `p_value`, `confidence_interval_lower/upper`

**Indexes**:

- `(experiment_id, variant_key)` - variant lookup
- `(conversion_rate DESC)` - top variants

**RLS**: Via parent experiment's shop_domain

---

### 10. knowledge_base

**Purpose**: AI knowledge documents with vector embeddings

**Key Columns**:

- `shop_domain`, `document_key`, `title`, `content`
- `embedding` vector(1536) - OpenAI embeddings
- `version`, `is_current` - versioning support
- `tags` (array) - categorization

**Indexes**:

- **Vector**: `USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`
- `(shop_domain, document_type)` - document categories
- `USING GIN(tags)` - tag search

**RLS**: Shop-based access

**Requirements**: pgvector extension

**Relation**: Self-referencing for versioning

---

### 11. ceo_briefings

**Purpose**: Generated executive summaries

**Key Columns**:

- `shop_domain`, `briefing_type`, `period_start/end`
- `executive_summary`, `key_metrics` (JSONB), `insights` (JSONB)
- `generation_model`, `generation_tokens`
- `rating`, `feedback_notes` - human feedback

**Indexes**:

- `(shop_domain, briefing_type, period_end DESC)` - recent briefings
- `(rating DESC)` - quality tracking

**RLS**: Shop-based access (CEO only)

---

## ERD Summary

**Relationships**:

- `AdCampaign` → `AdPerformance` (1:many) via campaign_id
- `Experiment` → `ExperimentResult` (1:many) via experiment_id
- `SocialPost` → `SocialAnalytics` (1:many) via social_post_id
- `KnowledgeBase` → `KnowledgeBase` (self-ref) via previous_version_id

**Independent Tables** (no FK):

- seo_audits, seo_rankings, onboarding_progress, feature_tours, ceo_briefings

---

## Migration Strategy

### Order (11 migrations):

**Phase 7-8** (Growth):

1. `20251022000001_create_seo_audits.sql`
2. `20251022000002_create_seo_rankings.sql`
3. `20251022000003_create_ad_campaigns.sql`
4. `20251022000004_create_ad_performance.sql` (requires ad_campaigns)
5. `20251022000005_create_social_analytics.sql` (requires social_posts)

**Phase 9** (Onboarding): 6. `20251023000001_create_onboarding_progress.sql` 7. `20251023000002_create_feature_tours.sql`

**Phase 10-13** (Advanced): 8. `20251024000001_create_experiments.sql` 9. `20251024000002_create_experiment_results.sql` (requires experiments) 10. `20251024000003_create_knowledge_base.sql` (requires pgvector) 11. `20251024000004_create_ceo_briefings.sql`

### Extension Requirements

**Before knowledge_base**:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## RLS Policy Pattern

**Standard shop-based**:

```sql
CREATE POLICY "policy_name" ON table_name
  TO authenticated
  USING (shop_domain = current_setting('app.current_shop', true));
```

**User-based**:

```sql
CREATE POLICY "policy_name" ON table_name
  TO authenticated
  USING ((SELECT auth.uid())::text = user_id);
```

**Performance optimization**:

- Wrap auth.uid() in SELECT for caching
- Add index on RLS columns (shop_domain, user_id)
- Use TO authenticated to prevent anon evaluation

---

## Performance Notes

### Indexing Strategy

- B-tree for general lookups
- Partial indexes for common filters
- Composite for multi-column queries
- IVFFlat for vector similarity
- GIN for array/JSONB fields

### Data Retention

- seo_rankings: 365 days
- ad_performance: 730 days
- social_analytics: 365 days per post
- experiment_results: Indefinite
- knowledge_base: Indefinite
- ceo_briefings: 365 days

### Storage Estimate

~8GB/year for 1000 shops

---

## Next Steps

1. Manager/CEO review and approve schema
2. Data agent creates 11 migration files
3. Engineer implements API endpoints
4. QA validates implementation

**Implementation Time**: 34 hours across 3 phases

---

**Document Status**: ✅ COMPLETE  
**Created**: 2025-10-21T08:30:00Z  
**Review Required**: Manager + CEO
