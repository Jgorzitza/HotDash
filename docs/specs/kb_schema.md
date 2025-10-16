# Knowledge Base Schema (Supabase)

Source: supabase/migrations/20251015_kb_schema.sql

## Tables

- kb_articles
  - id bigint PK
  - question text
  - answer text
  - category text (orders|shipping|returns|products|technical|policies)
  - tags text[]
  - confidence_score decimal(0–1) default 0.50
  - usage_count int
  - success_count int
  - avg_tone_grade decimal(1–5)
  - avg_accuracy_grade decimal(1–5)
  - avg_policy_grade decimal(1–5)
  - source text (human_edit|template|extracted|manual)
  - created_by text
  - last_used_at timestamptz
  - created_at timestamptz
  - updated_at timestamptz
  - embedding vector(1536)
  - archived_at timestamptz (soft delete)

- kb_learning_edits
  - id bigint PK
  - approval_id bigint → approvals.id
  - conversation_id bigint
  - ai_draft text
  - human_final text
  - edit_distance int
  - edit_ratio decimal(0–1)
  - tone_grade/accuracy_grade/policy_grade int (1–5)
  - customer_question text
  - category text (optional, constrained)
  - tags text[]
  - kb_article_id bigint → kb_articles.id
  - learning_type text (tone_improvement|factual_correction|policy_clarification|template_refinement|new_pattern)
  - reviewer text
  - created_at timestamptz

- kb_recurring_issues
  - id bigint PK
  - issue_pattern text
  - category text
  - tags text[]
  - occurrence_count int
  - first_seen_at/last_seen_at timestamptz
  - kb_article_id bigint → kb_articles.id
  - resolution_status text (unresolved|kb_created|escalated|product_issue|policy_update_needed)
  - avg_resolution_time_minutes int
  - customer_satisfaction_score decimal(0–1)
  - created_at/updated_at timestamptz

- kb_topics
  - id bigint PK
  - name text unique
  - description text
  - parent_topic_id bigint → kb_topics.id
  - created_at/updated_at timestamptz

- kb_article_topics (join)
  - article_id bigint → kb_articles.id
  - topic_id bigint → kb_topics.id
  - relevance_score decimal(0–1) default 1.0
  - PK (article_id, topic_id)

- kb_article_links
  - from_article_id bigint → kb_articles.id
  - to_article_id bigint → kb_articles.id
  - link_type text (related|prerequisite|alternative|followup)
  - strength decimal(0–1) default 0.5
  - created_at timestamptz
  - PK (from_article_id, to_article_id, link_type)

- kb_usage_log
  - id bigint PK
  - article_id bigint → kb_articles.id
  - approval_id bigint → approvals.id
  - used_in_draft boolean default true
  - was_helpful boolean
  - created_at timestamptz

## Indexes (selected)
- kb_articles: category, confidence_score desc (partial), tags GIN, embedding ivfflat, last_used_at desc, created_at desc
- kb_learning_edits: approval_id, category, (tone_grade, accuracy_grade, policy_grade), learning_type, created_at desc
- kb_recurring_issues: category, occurrence_count desc, resolution_status, last_seen_at desc
- kb_topics: parent_topic_id
- kb_article_topics: article_id, topic_id
- kb_article_links: from_article_id, to_article_id
- kb_usage_log: article_id, created_at desc

## RLS Policies
- RLS enabled on all tables above
- kb_articles select for authenticated users where archived_at is null
- service_role can manage (all privileges) on all KB tables

## Triggers & Functions
- update_kb_article_updated_at() keeps updated_at fresh on kb_articles, kb_recurring_issues, kb_topics
- calculate_kb_confidence(p_usage_count, p_success_count, p_avg_tone, p_avg_accuracy, p_avg_policy) returns weighted confidence (0–1)

## Access Patterns
- Read-mostly on kb_articles filtered by category, min confidence, archived_at null
- Vector similarity on embedding for semantic search
- Learning pipeline writes to kb_learning_edits and may create kb_articles
- Usage tracking appends kb_usage_log rows for drafts/approvals

## Rollback
- See supabase/migrations/20251015_kb_schema.rollback.sql
- All DDL changes guarded by IF NOT EXISTS where possible

## Notes
- pgvector extension required
- Confidence score intended to be recomputed via calculate_kb_confidence; default 0.50 for new articles
- Ensure idempotent seeds and safe archival policy in scripts/kb/

