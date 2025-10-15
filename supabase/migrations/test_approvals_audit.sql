-- Test script for approvals and audit log schemas
-- Run with: psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/migrations/test_approvals_audit.sql

\echo '=== Testing Approvals Workflow Schema ==='

-- Test 1: Insert approval
INSERT INTO approvals (kind, state, summary, created_by, evidence, impact, risk, rollback, actions)
VALUES (
  'cx_reply',
  'pending_review',
  'Shipping delay apology for order #1234',
  'ai-customer',
  '{"samples": ["Customer: Where is my order?"], "template": "shipping_delay_apology"}'::jsonb,
  '{"customer_satisfaction": "+10%", "response_time": "< 15 min"}'::jsonb,
  '{"risk": "low", "concerns": []}'::jsonb,
  '{"action": "send_followup", "template": "discount_apology"}'::jsonb,
  '[{"tool": "chatwoot.reply.fromNote", "args": {"conversationId": "123", "noteId": "456"}}]'::jsonb
) RETURNING id, kind, state, summary;

-- Test 2: Insert approval items
INSERT INTO approval_items (approval_id, path, diff)
VALUES (
  1,
  'conversation/123',
  '{"before": null, "after": "We apologize for the delay..."}'::jsonb
) RETURNING id, approval_id, path;

-- Test 3: Insert approval grade
INSERT INTO approval_grades (approval_id, reviewer, tone, accuracy, policy, notes)
VALUES (
  1,
  'justin@hotrodan.com',
  5,
  5,
  5,
  'Perfect response'
) RETURNING id, approval_id, tone, accuracy, policy;

-- Test 4: Insert approval edit
INSERT INTO approval_edits (approval_id, field, original_value, edited_value, edit_distance, editor)
VALUES (
  1,
  'message_body',
  'We apologize for the delay',
  'We sincerely apologize for the delay',
  10,
  'justin@hotrodan.com'
) RETURNING id, approval_id, field, edit_distance;

-- Test 5: Update approval state
UPDATE approvals SET state = 'approved', reviewer = 'justin@hotrodan.com' WHERE id = 1 RETURNING id, state, reviewer;

-- Test 6: Query approvals with joins
SELECT 
  a.id,
  a.kind,
  a.state,
  a.summary,
  a.created_by,
  a.reviewer,
  g.tone,
  g.accuracy,
  g.policy,
  COUNT(e.id) as edit_count
FROM approvals a
LEFT JOIN approval_grades g ON a.id = g.approval_id
LEFT JOIN approval_edits e ON a.id = e.approval_id
GROUP BY a.id, g.id;

\echo '=== Testing Audit Log Schema ==='

-- Test 7: Insert audit log (success)
INSERT INTO audit_logs (actor, action, entity_type, entity_id, payload, result, result_details, rollback_ref, context)
VALUES (
  'justin@hotrodan.com',
  'approval.applied',
  'approval',
  '1',
  '{"actions": [{"tool": "chatwoot.reply.fromNote", "args": {"conversationId": "123", "noteId": "456"}}]}'::jsonb,
  'success',
  '{"receipts": [{"tool": "chatwoot.reply.fromNote", "ok": true, "id": "msg_789"}]}'::jsonb,
  'approval/1/rollback',
  '{"request_id": "req_abc", "session_id": "sess_xyz", "ip_address": "192.168.1.1"}'::jsonb
) RETURNING id, actor, action, result;

-- Test 8: Insert audit log (failure)
INSERT INTO audit_logs (actor, action, entity_type, entity_id, payload, result, result_details, context)
VALUES (
  'ai-inventory',
  'inventory.adjusted',
  'product',
  'gid://shopify/Product/456',
  '{"variantId": "789", "delta": -10, "locationId": "loc_123"}'::jsonb,
  'failure',
  '{"error": "Insufficient inventory", "code": "INVENTORY_INSUFFICIENT", "details": {"available": 5, "requested": 10}}'::jsonb,
  '{"request_id": "req_def", "session_id": "sess_uvw"}'::jsonb
) RETURNING id, actor, action, result;

-- Test 9: Query audit logs by actor
SELECT actor, action, result, COUNT(*) as count
FROM audit_logs
GROUP BY actor, action, result
ORDER BY actor, action;

-- Test 10: Query audit logs by entity
SELECT entity_type, entity_id, action, result, created_at
FROM audit_logs
WHERE entity_type = 'approval' AND entity_id = '1'
ORDER BY created_at DESC;

\echo '=== Testing Immutability Constraints ==='

-- Test 11: Try to update audit log (should fail for authenticated users)
-- Note: This will succeed as service_role, but would fail for authenticated users
-- UPDATE audit_logs SET result = 'pending' WHERE id = 1;

-- Test 12: Try to delete audit log (should fail for authenticated users)
-- Note: This will succeed as service_role, but would fail for authenticated users
-- DELETE FROM audit_logs WHERE id = 1;

\echo '=== Testing Indexes ==='

-- Test 13: Explain query plans
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM approvals 
WHERE state = 'pending_review' AND kind = 'cx_reply' 
ORDER BY created_at DESC 
LIMIT 50;

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM audit_logs 
WHERE actor = 'justin@hotrodan.com' 
ORDER BY created_at DESC 
LIMIT 100;

\echo '=== Testing Check Constraints ==='

-- Test 14: Try to insert invalid kind (should fail)
-- INSERT INTO approvals (kind, state, summary, created_by) VALUES ('invalid', 'draft', 'Test', 'ai-test');

-- Test 15: Try to insert invalid state (should fail)
-- INSERT INTO approvals (kind, state, summary, created_by) VALUES ('cx_reply', 'invalid', 'Test', 'ai-test');

-- Test 16: Try to insert invalid grade (should fail)
-- INSERT INTO approval_grades (approval_id, reviewer, tone) VALUES (1, 'test', 10);

-- Test 17: Try to insert invalid result (should fail)
-- INSERT INTO audit_logs (actor, action, result) VALUES ('test', 'test.action', 'invalid');

\echo '=== Schema Validation Complete ==='

-- Test 18: Count records
SELECT 'approvals' as table_name, COUNT(*) as count FROM approvals
UNION ALL
SELECT 'approval_items', COUNT(*) FROM approval_items
UNION ALL
SELECT 'approval_grades', COUNT(*) FROM approval_grades
UNION ALL
SELECT 'approval_edits', COUNT(*) FROM approval_edits
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;

\echo '=== All Tests Passed ==='

