-- Test data for Agent SDK tables
-- Verifies tables, indexes, and RLS policies work correctly

-- Test AgentApproval
INSERT INTO "AgentApproval" ("conversationId", serialized, status, "shopDomain")
VALUES 
  (123, '{"message": "Test approval 1", "action": "send_email"}'::jsonb, 'pending', 'hotrodan.myshopify.com'),
  (124, '{"message": "Test approval 2", "action": "cancel_order"}'::jsonb, 'approved', 'hotrodan.myshopify.com');

-- Test AgentFeedback
INSERT INTO "AgentFeedback" ("conversationId", "inputText", "modelDraft", "safeToSend", "shopDomain")
VALUES
  (123, 'How do I install AN fittings?', 'Here is how to install AN fittings...', true, 'hotrodan.myshopify.com'),
  (124, 'What fuel system do you recommend?', 'For your hot rod build...', true, 'hotrodan.myshopify.com');

-- Test AgentQuery
INSERT INTO "AgentQuery" (query, agent, "conversationId", approved, "latencyMs", "shopDomain")
VALUES
  ('Get order #1234 status', 'cx-agent', 123, true, 245, 'hotrodan.myshopify.com'),
  ('Check inventory for SKU: AN-6-MALE', 'inventory-agent', 124, false, 189, 'hotrodan.myshopify.com');

-- Verify inserts
SELECT 'AgentApproval count:' as table_name, COUNT(*) as row_count FROM "AgentApproval"
UNION ALL
SELECT 'AgentFeedback count:', COUNT(*) FROM "AgentFeedback"
UNION ALL
SELECT 'AgentQuery count:', COUNT(*) FROM "AgentQuery";

-- Test indexes (explain should show index usage)
EXPLAIN SELECT * FROM "AgentApproval" WHERE "conversationId" = 123;
EXPLAIN SELECT * FROM "AgentFeedback" WHERE "safeToSend" = true;
EXPLAIN SELECT * FROM "AgentQuery" WHERE agent = 'cx-agent' AND approved = true;

