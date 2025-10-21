-- ROLLBACK SCRIPT: All Phase 7-13 Tables
-- Created: 2025-10-21
-- Task: DATA-014
-- Purpose: Safely drop all Phase 7-13 tables in correct order

-- ============================================================================
-- IMPORTANT: Run this script carefully!
-- This will DELETE all data in Phase 7-13 tables.
-- Always backup before rollback.
-- ============================================================================

-- Start transaction for atomic rollback
BEGIN;

-- ============================================================================
-- PHASE 10-13: Advanced Tables (Drop in reverse dependency order)
-- ============================================================================

-- Drop CEO Briefings (no dependencies)
DROP TABLE IF EXISTS ceo_briefings CASCADE;
COMMENT ON SCHEMA public IS 'Dropped ceo_briefings';

-- Drop Knowledge Base (self-referencing, CASCADE handles)
DROP TABLE IF NOT EXISTS knowledge_base CASCADE;
COMMENT ON SCHEMA public IS 'Dropped knowledge_base';

-- Drop Experiment Results (depends on experiments)
DROP TABLE IF EXISTS experiment_results CASCADE;
COMMENT ON SCHEMA public IS 'Dropped experiment_results';

-- Drop Experiments (no dependencies after results dropped)
DROP TABLE IF EXISTS experiments CASCADE;
COMMENT ON SCHEMA public IS 'Dropped experiments';

-- ============================================================================
-- PHASE 9: Onboarding Tables
-- ============================================================================

-- Drop Feature Tours (no dependencies)
DROP TABLE IF EXISTS feature_tours CASCADE;
COMMENT ON SCHEMA public IS 'Dropped feature_tours';

-- Drop Onboarding Progress (no dependencies)
DROP TABLE IF EXISTS onboarding_progress CASCADE;
COMMENT ON SCHEMA public IS 'Dropped onboarding_progress';

-- ============================================================================
-- PHASE 7-8: Growth Tables (Drop in reverse dependency order)
-- ============================================================================

-- Drop Social Analytics (depends on social_posts)
DROP TABLE IF EXISTS social_analytics CASCADE;
COMMENT ON SCHEMA public IS 'Dropped social_analytics';

-- Drop Ad Performance (depends on ad_campaigns)
DROP TABLE IF EXISTS ad_performance CASCADE;
COMMENT ON SCHEMA public IS 'Dropped ad_performance';

-- Drop Ad Campaigns (no dependencies after performance dropped)
DROP TABLE IF EXISTS ad_campaigns CASCADE;
COMMENT ON SCHEMA public IS 'Dropped ad_campaigns';

-- Drop SEO Rankings (no dependencies)
DROP TABLE IF EXISTS seo_rankings CASCADE;
COMMENT ON SCHEMA public IS 'Dropped seo_rankings';

-- Drop SEO Audits (no dependencies)
DROP TABLE IF EXISTS seo_audits CASCADE;
COMMENT ON SCHEMA public IS 'Dropped seo_audits';

-- ============================================================================
-- DROP INDEXES (DATA-006 Performance Indexes)
-- ============================================================================

-- Decision log indexes
DROP INDEX IF EXISTS idx_decision_log_actor_created;
DROP INDEX IF EXISTS idx_decision_log_shop_created;

-- Notification indexes
DROP INDEX IF EXISTS idx_notifications_user_unread_created;
DROP INDEX IF EXISTS idx_notifications_user_created_full;

-- Inventory action indexes
DROP INDEX IF EXISTS idx_inventory_actions_variant_created;
DROP INDEX IF EXISTS idx_inventory_actions_sku_created;

-- Dashboard fact indexes
DROP INDEX IF EXISTS idx_dashboard_fact_shop_type_created;

-- Social post indexes
DROP INDEX IF EXISTS idx_social_posts_creator_created;

-- ============================================================================
-- OPTIONAL: Drop pgvector extension (only if not used elsewhere)
-- ============================================================================

-- Uncomment only if you're sure no other tables use pgvector
-- DROP EXTENSION IF EXISTS vector CASCADE;

-- ============================================================================
-- COMMIT OR ROLLBACK
-- ============================================================================

-- If all commands succeeded, commit
COMMIT;

-- If any errors occurred, rollback transaction
-- ROLLBACK;

-- ============================================================================
-- VERIFICATION QUERIES (Run after rollback)
-- ============================================================================

-- Check tables dropped
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
-- AND tablename IN ('seo_audits', 'seo_rankings', 'ad_campaigns', 'ad_performance', 
--                  'social_analytics', 'onboarding_progress', 'feature_tours',
--                  'experiments', 'experiment_results', 'knowledge_base', 'ceo_briefings');

-- Check indexes dropped
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
-- AND indexname LIKE 'idx_%_actor_created' OR indexname LIKE 'idx_%_user_unread%';

-- Update statistics
-- ANALYZE decision_log;
-- ANALYZE notifications;
-- ANALYZE inventory_actions;
-- ANALYZE dashboard_fact;
-- ANALYZE social_posts;


