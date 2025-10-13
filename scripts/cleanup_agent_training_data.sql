-- =====================================================
-- Agent SDK Training Data - Cleanup Script
-- Purpose: Remove test/old training data per 30-day retention policy
-- Usage: Run manually or via cron for automated cleanup
-- =====================================================

-- =====================================================
-- Option 1: Remove ALL Test Data (for dev/testing)
-- =====================================================

-- Remove test data (conversation IDs starting with TEST-)
DELETE FROM "AgentQuery" WHERE "conversationId" IN (
  SELECT chatwoot_conversation_id FROM agent_approvals WHERE conversation_id LIKE 'TEST-%'
);

DELETE FROM "AgentFeedback" WHERE "conversationId" IN (
  SELECT chatwoot_conversation_id FROM agent_approvals WHERE conversation_id LIKE 'TEST-%'
);

DELETE FROM "agent_sdk_learning_data" WHERE approval_id IN (
  SELECT id FROM agent_approvals WHERE conversation_id LIKE 'TEST-%'
);

DELETE FROM "agent_sdk_notifications" WHERE queue_item_id IN (
  SELECT id FROM agent_approvals WHERE conversation_id LIKE 'TEST-%'
);

DELETE FROM agent_approvals WHERE conversation_id LIKE 'TEST-%';

SELECT 'Test data cleanup complete' as status;

-- =====================================================
-- Option 2: 30-Day Retention Policy (for production)
-- =====================================================

-- Archive old data before deletion (backup to archive table if needed)
-- CREATE TABLE IF NOT EXISTS agent_training_archive AS 
-- SELECT * FROM agent_approvals WHERE FALSE;

-- Delete data older than 30 days
DELETE FROM "AgentQuery" WHERE "createdAt" < NOW() - INTERVAL '30 days';
DELETE FROM "AgentFeedback" WHERE "createdAt" < NOW() - INTERVAL '30 days';
DELETE FROM "agent_sdk_learning_data" WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM "agent_sdk_notifications" WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM agent_approvals WHERE created_at < NOW() - INTERVAL '30 days';

SELECT 
  'Retention cleanup complete' as status,
  COUNT(*) as remaining_approvals
FROM agent_approvals;

-- =====================================================
-- Option 3: Selective Cleanup (remove only resolved/rejected)
-- =====================================================

-- Keep pending approvals, remove only completed ones older than 7 days
DELETE FROM agent_approvals 
WHERE status IN ('approved', 'rejected') 
AND created_at < NOW() - INTERVAL '7 days';

SELECT 'Selective cleanup complete' as status;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check remaining data
SELECT 
  'agent_approvals' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30_days
FROM agent_approvals;

SELECT 
  'AgentFeedback' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '30 days') as last_30_days
FROM "AgentFeedback";

SELECT 
  'AgentQuery' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '30 days') as last_30_days
FROM "AgentQuery";

