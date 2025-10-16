-- Rollback for KB Schema Migration
-- Created: 2025-10-15

-- Drop triggers
drop trigger if exists kb_articles_updated_at on kb_articles;
drop trigger if exists kb_recurring_issues_updated_at on kb_recurring_issues;
drop trigger if exists kb_topics_updated_at on kb_topics;

-- Drop functions
drop function if exists update_kb_article_updated_at();
drop function if exists calculate_kb_confidence(int, int, decimal, decimal, decimal);

-- Drop tables (in reverse order of dependencies)
drop table if exists kb_usage_log;
drop table if exists kb_article_links;
drop table if exists kb_article_topics;
drop table if exists kb_topics;
drop table if exists kb_recurring_issues;
drop table if exists kb_learning_edits;
drop table if exists kb_articles;

