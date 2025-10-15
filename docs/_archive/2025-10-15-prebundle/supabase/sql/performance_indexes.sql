-- Performance Optimization: Additional Indexes
-- Purpose: High-priority indexes for common query patterns
-- Owner: data
-- Date: 2025-10-11
-- Ref: docs/data/query_performance_optimization.md

-- =============================================================================
-- High Priority Indexes
-- =============================================================================

-- Index 1: Agent + Latency + Time (Slow query analysis)
CREATE INDEX IF NOT EXISTS agent_queries_agent_latency_created_idx 
ON agent_queries (agent, latency_ms DESC, created_at DESC) 
WHERE latency_ms > 100;

COMMENT ON INDEX agent_queries_agent_latency_created_idx IS 'Composite index for slow query analysis by agent. Partial index (latency > 100ms only).';

-- Index 2: Approval Status + Resolution Time (SLA reporting)
CREATE INDEX IF NOT EXISTS agent_approvals_status_resolution_time_idx 
ON agent_approvals (status, (EXTRACT(EPOCH FROM (updated_at - created_at)))) 
WHERE status IN ('approved', 'rejected');

COMMENT ON INDEX agent_approvals_status_resolution_time_idx IS 'Composite index for SLA compliance reporting. Includes computed resolution time.';

-- Index 3: Recent Data (Hot data optimization)
CREATE INDEX IF NOT EXISTS agent_queries_recent_hot_idx 
ON agent_queries (created_at DESC, agent, latency_ms) 
WHERE created_at > NOW() - INTERVAL '7 days';

COMMENT ON INDEX agent_queries_recent_hot_idx IS 'Partial index for recent queries (7-day window). Optimizes real-time dashboard queries.';

-- Index 4: Pending Reviews (Annotator workflow)
CREATE INDEX IF NOT EXISTS agent_feedback_pending_review_idx 
ON agent_feedback (created_at DESC) 
WHERE safe_to_send IS NULL;

COMMENT ON INDEX agent_feedback_pending_review_idx IS 'Partial index for unreviewed feedback. Optimizes annotator queue queries.';

-- Index 5: Conversation Activity Lookup
CREATE INDEX IF NOT EXISTS agent_queries_conversation_agent_idx 
ON agent_queries (conversation_id, agent, created_at DESC);

COMMENT ON INDEX agent_queries_conversation_agent_idx IS 'Composite index for conversation timeline queries by agent.';

-- =============================================================================
-- Medium Priority Indexes (Optional - deploy if usage patterns justify)
-- =============================================================================

-- Index 6: JSONB Rubric Scores (Quality analysis)
CREATE INDEX IF NOT EXISTS agent_feedback_rubric_scores_idx 
ON agent_feedback (
  (rubric->>'clarity')::INTEGER, 
  (rubric->>'accuracy')::INTEGER, 
  (rubric->>'tone')::INTEGER
)
WHERE rubric IS NOT NULL;

COMMENT ON INDEX agent_feedback_rubric_scores_idx IS 'Multi-column index for rubric score queries. Deploy if quality analysis queries are frequent.';

-- =============================================================================
-- Index Verification
-- =============================================================================

-- Check index sizes
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public' 
  AND tablename LIKE 'agent_%'
ORDER BY pg_relation_size(indexrelid) DESC;

