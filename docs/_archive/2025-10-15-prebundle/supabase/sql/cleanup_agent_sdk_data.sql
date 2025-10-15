-- Agent SDK Data Cleanup
-- Purpose: Remove test/demo data from Agent SDK tables
-- Owner: data
-- Date: 2025-10-11
-- Usage: Run after testing or for retention cleanup

-- Display data to be removed
\echo 'Data to be removed:'
\echo ''

SELECT 'agent_approvals' as table_name, COUNT(*) as rows_to_delete
FROM agent_approvals
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%'
UNION ALL
SELECT 'agent_feedback', COUNT(*) 
FROM agent_feedback
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%'
UNION ALL
SELECT 'agent_queries', COUNT(*)
FROM agent_queries
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';

\echo ''
\prompt 'Press Enter to continue with deletion (Ctrl+C to cancel)...' confirm

-- Delete test data (cascades due to FK relationships if any)
DELETE FROM agent_queries 
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';

DELETE FROM agent_feedback 
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';

DELETE FROM agent_approvals 
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';

\echo ''
\echo 'Cleanup complete!'
\echo ''

-- Verify deletion
SELECT 'agent_approvals' as table_name, COUNT(*) as remaining_test_rows
FROM agent_approvals
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%'
UNION ALL
SELECT 'agent_feedback', COUNT(*) 
FROM agent_feedback
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%'
UNION ALL
SELECT 'agent_queries', COUNT(*)
FROM agent_queries
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';

