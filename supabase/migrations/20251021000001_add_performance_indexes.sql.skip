-- Performance Indexes Migration
-- Created: 2025-10-21
-- Purpose: Optimize tile query performance for dashboard
-- Context: DATA-006 - Index Optimization
-- MCP Docs: Prisma performance patterns, Supabase RLS optimization

-- ============================================================================
-- DECISION LOG INDEXES
-- ============================================================================

-- Index for approvals tile: Filter by actor (user) and sort by created_at
-- Supports queries like: SELECT * FROM decision_log WHERE actor = $1 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_decision_log_actor_created 
ON decision_log(actor, created_at DESC);

-- Index for shop-specific decision history
-- Supports queries like: SELECT * FROM decision_log WHERE shop_domain = $1 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_decision_log_shop_created 
ON decision_log(shop_domain, created_at DESC);

-- ============================================================================
-- NOTIFICATIONS INDEXES
-- ============================================================================

-- Composite index for unread notifications query
-- Supports queries like: SELECT * FROM notifications WHERE user_id = $1 AND read_at IS NULL ORDER BY created_at DESC
-- This is the most common query pattern for notification center
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_created 
ON notifications(user_id, read_at, created_at DESC) 
WHERE read_at IS NULL;

-- Alternative index for all user notifications (read + unread)
-- Supports queries like: SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_full 
ON notifications(user_id, created_at DESC);

-- ============================================================================
-- INVENTORY ACTIONS INDEXES
-- ============================================================================

-- Index for variant-specific inventory action history
-- Supports queries like: SELECT * FROM inventory_actions WHERE variant_id = $1 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_inventory_actions_variant_created 
ON inventory_actions(variant_id, created_at DESC) 
WHERE variant_id IS NOT NULL;

-- Index for SKU-based inventory lookup (alternative to variant_id)
-- Supports queries like: SELECT * FROM inventory_actions WHERE sku = $1 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_inventory_actions_sku_created 
ON inventory_actions(sku, created_at DESC) 
WHERE sku IS NOT NULL;

-- ============================================================================
-- DASHBOARD FACTS INDEXES
-- ============================================================================

-- Composite index for shop-specific fact queries with type filter
-- Supports queries like: SELECT * FROM dashboard_fact WHERE shop_domain = $1 AND fact_type = $2 ORDER BY created_at DESC
-- Note: (shopDomain, factType) index already exists, this adds created_at for sorting
CREATE INDEX IF NOT EXISTS idx_dashboard_fact_shop_type_created 
ON dashboard_fact(shop_domain, fact_type, created_at DESC);

-- ============================================================================
-- SOCIAL POSTS INDEXES (for Growth phases)
-- ============================================================================

-- Index for user-specific social post history
-- Supports queries like: SELECT * FROM social_posts WHERE created_by = $1 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_social_posts_creator_created 
ON social_posts(created_by, created_at DESC);

-- ============================================================================
-- ANALYZE TABLES FOR STATISTICS UPDATE
-- ============================================================================

-- Update table statistics after creating indexes
-- This helps PostgreSQL query planner make better decisions
ANALYZE decision_log;
ANALYZE notifications;
ANALYZE inventory_actions;
ANALYZE dashboard_fact;
ANALYZE social_posts;

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================

-- Expected improvements:
-- 1. decision_log queries: ~10x faster (Seq Scan → Index Scan)
-- 2. notifications unread query: ~15x faster (partial index on common case)
-- 3. inventory_actions by variant: ~8x faster (composite index)
-- 4. dashboard_fact with sorting: ~5x faster (avoids separate sort step)
-- 5. social_posts by creator: ~7x faster (Index Scan on created_by)

-- Verification commands (run manually):
-- EXPLAIN ANALYZE SELECT * FROM decision_log WHERE actor = 'test-user' ORDER BY created_at DESC LIMIT 20;
-- EXPLAIN ANALYZE SELECT * FROM notifications WHERE user_id = 'uuid' AND read_at IS NULL ORDER BY created_at DESC LIMIT 20;
-- EXPLAIN ANALYZE SELECT * FROM inventory_actions WHERE variant_id = 'id' ORDER BY created_at DESC LIMIT 50;

