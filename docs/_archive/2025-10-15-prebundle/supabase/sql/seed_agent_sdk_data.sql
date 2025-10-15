-- Agent SDK Seed Data
-- Purpose: Generate realistic test data for Agent SDK integration testing
-- Owner: data
-- Date: 2025-10-11
-- Retention: 30 days (see retention policy in feedback/data.md)

-- Clear existing test data (if any)
DELETE FROM agent_queries WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';
DELETE FROM agent_feedback WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';
DELETE FROM agent_approvals WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';

-- Seed agent_approvals (Approval Queue)
INSERT INTO agent_approvals (conversation_id, serialized, last_interruptions, status, approved_by) VALUES
  -- Scenario 1: Pending approvals (active queue)
  ('test-conv-001', '{"intent": "cancel_order", "order_id": "ORD-123", "reason": "customer_request", "refund_eligible": true}'::jsonb, '[{"type": "requires_human", "timestamp": "2025-10-11T14:00:00Z", "reason": "high_value_refund"}]'::jsonb, 'pending', NULL),
  ('test-conv-002', '{"intent": "modify_subscription", "subscription_id": "SUB-456", "change": "downgrade", "impact": "immediate"}'::jsonb, '[{"type": "policy_check", "timestamp": "2025-10-11T14:15:00Z"}]'::jsonb, 'pending', NULL),
  ('test-conv-003', '{"intent": "data_export", "scope": "all_orders", "format": "csv", "pii_included": true}'::jsonb, '[{"type": "compliance_review", "timestamp": "2025-10-11T14:30:00Z"}]'::jsonb, 'pending', NULL),
  
  -- Scenario 2: Approved requests (historical)
  ('test-conv-004', '{"intent": "address_update", "customer_id": "CUST-789", "verified": true}'::jsonb, '[]'::jsonb, 'approved', 'qa_team_1'),
  ('test-conv-005', '{"intent": "return_initiation", "order_id": "ORD-234", "within_policy": true}'::jsonb, '[]'::jsonb, 'approved', 'support_lead'),
  ('test-conv-006', '{"intent": "gift_card_issue", "amount": 25.00, "occasion": "service_recovery"}'::jsonb, '[]'::jsonb, 'approved', 'manager'),
  
  -- Scenario 3: Rejected requests
  ('test-conv-007', '{"intent": "bulk_discount", "percentage": 50, "justification": "unclear"}'::jsonb, '[{"type": "policy_violation", "timestamp": "2025-10-11T13:00:00Z"}]'::jsonb, 'rejected', 'compliance_team'),
  ('test-conv-008', '{"intent": "account_merge", "source": "ACCT-A", "target": "ACCT-B", "data_overlap": true}'::jsonb, '[{"type": "technical_limitation"}]'::jsonb, 'rejected', 'engineer'),
  
  -- Scenario 4: Expired requests (timeout)
  ('test-conv-009', '{"intent": "rush_shipping_upgrade", "order_id": "ORD-345", "time_sensitive": true}'::jsonb, '[{"type": "timeout", "timestamp": "2025-10-11T12:00:00Z"}]'::jsonb, 'expired', NULL),
  ('test-conv-010', '{"intent": "pricing_exception", "product": "SKU-999", "requested_price": 49.99}'::jsonb, '[{"type": "timeout"}]'::jsonb, 'expired', NULL),
  
  -- Demo scenarios for UI testing
  ('demo-queue-001', '{"intent": "refund_request", "order_id": "ORD-DEMO-1", "amount": 129.99, "reason": "defective_product"}'::jsonb, '[{"type": "manual_review_required"}]'::jsonb, 'pending', NULL),
  ('demo-queue-002', '{"intent": "account_upgrade", "plan": "enterprise", "seats": 50}'::jsonb, '[{"type": "pricing_approval"}]'::jsonb, 'pending', NULL);

-- Seed agent_feedback (Training Data)
INSERT INTO agent_feedback (conversation_id, input_text, model_draft, safe_to_send, labels, rubric, annotator, notes, meta) VALUES
  -- Scenario 1: Safe, high-quality responses
  ('test-conv-101', 'How do I track my order?', 'You can track your order by visiting our Order Status page at shop.com/orders and entering your order number. You should have received a tracking number via email within 24 hours of shipment.', true, ARRAY['helpful', 'accurate', 'complete'], '{"clarity": 5, "accuracy": 5, "tone": 5}'::jsonb, 'qa_annotator_1', 'Perfect response - clear and actionable', '{"confidence": 0.95, "model_version": "gpt-4"}'::jsonb),
  ('test-conv-102', 'What is your return policy?', 'We offer free returns within 30 days of purchase. Items must be unworn and in original packaging. You can initiate a return from your account dashboard or contact support.', true, ARRAY['policy_accurate', 'customer_friendly'], '{"clarity": 5, "accuracy": 5, "tone": 5}'::jsonb, 'qa_annotator_1', 'Excellent - covers all key points', '{"confidence": 0.92}'::jsonb),
  ('test-conv-103', 'Can I change my shipping address?', 'If your order hasn''t shipped yet, you can update the address in your account. For orders already in transit, please contact our support team immediately for assistance.', true, ARRAY['helpful', 'conditional_advice'], '{"clarity": 4, "accuracy": 5, "tone": 5}'::jsonb, 'qa_annotator_2', 'Good - explains both scenarios', '{"confidence": 0.88}'::jsonb),
  
  -- Scenario 2: Needs improvement (safe but not optimal)
  ('test-conv-104', 'Is this product available?', 'Let me check for you.', true, ARRAY['vague', 'incomplete'], '{"clarity": 2, "accuracy": 3, "tone": 4}'::jsonb, 'qa_annotator_1', 'Too brief - needs specific product info', '{"confidence": 0.65}'::jsonb),
  ('test-conv-105', 'How long does shipping take?', 'It depends on your location.', true, ARRAY['incomplete', 'unhelpful'], '{"clarity": 3, "accuracy": 3, "tone": 4}'::jsonb, 'qa_annotator_2', 'Should provide estimated ranges', '{"confidence": 0.70}'::jsonb),
  ('test-conv-106', 'Can I get a discount?', 'We have sales sometimes. Check our website.', true, ARRAY['generic', 'missed_opportunity'], '{"clarity": 3, "accuracy": 3, "tone": 3}'::jsonb, 'qa_annotator_1', 'Could mention sign-up offer or current promotions', '{"confidence": 0.72}'::jsonb),
  
  -- Scenario 3: Risky/unsafe (requires review)
  ('test-conv-107', 'I hate your company!', 'I understand you''re upset. Can you tell me what went wrong?', false, ARRAY['defensive', 'escalation_risk'], '{"clarity": 3, "accuracy": 4, "tone": 2}'::jsonb, 'qa_annotator_2', 'Tone might escalate - suggest empathy + immediate help offer', '{"confidence": 0.55, "flagged": true}'::jsonb),
  ('test-conv-108', 'Give me a full refund now!', 'Sure, I''ll process that right away.', false, ARRAY['policy_violation', 'unauthorized_action'], '{"clarity": 4, "accuracy": 1, "tone": 4}'::jsonb, 'qa_annotator_1', 'CRITICAL: Must verify policy first - cannot auto-refund', '{"confidence": 0.42, "flagged": true}'::jsonb),
  ('test-conv-109', 'What''s your personal phone number?', 'I can''t share personal information, but I''m here to help with your order.', NULL, ARRAY['boundary_setting', 'needs_review'], '{"clarity": 4, "accuracy": 5, "tone": 4}'::jsonb, 'qa_annotator_2', 'Good boundary - verify standard response', '{"confidence": 0.80}'::jsonb),
  
  -- Demo scenarios for training visualization
  ('demo-training-001', 'What payment methods do you accept?', 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, and Google Pay. Gift cards can also be used at checkout.', true, ARRAY['comprehensive', 'well_structured'], '{"clarity": 5, "accuracy": 5, "tone": 5}'::jsonb, 'demo_annotator', 'Excellent example of comprehensive answer', '{"demo": true}'::jsonb),
  ('demo-training-002', 'My order arrived damaged', 'I apologize for the inconvenience. I''ll immediately arrange a replacement and send you a prepaid return label for the damaged item. You should receive the new item within 3-5 business days.', true, ARRAY['empathetic', 'solution_focused', 'excellent'], '{"clarity": 5, "accuracy": 5, "tone": 5}'::jsonb, 'demo_annotator', 'Perfect example of empathy + action', '{"demo": true}'::jsonb);

-- Seed agent_queries (Query Tracking)
INSERT INTO agent_queries (query, result, conversation_id, agent, approved, human_edited, latency_ms, created_at) VALUES
  -- Data agent queries (various scenarios)
  ('SELECT order_status, tracking_number FROM orders WHERE order_id = ?', '{"status": "shipped", "tracking": "1Z999AA10123456784", "carrier": "UPS", "estimated_delivery": "2025-10-14"}'::jsonb, 'test-conv-201', 'data', true, false, 45, NOW() - INTERVAL '2 hours'),
  ('SELECT inventory_count FROM products WHERE sku = ?', '{"sku": "PROD-123", "available": 47, "reserved": 3, "warehouse": "US-EAST"}'::jsonb, 'test-conv-202', 'data', true, false, 32, NOW() - INTERVAL '1 hour'),
  ('SELECT return_policy_days, restocking_fee FROM store_policies WHERE category = ?', '{"days": 30, "restocking_fee": 0, "conditions": ["unworn", "original_packaging"]}'::jsonb, 'test-conv-203', 'data', true, false, 28, NOW() - INTERVAL '30 minutes'),
  
  -- Support agent queries
  ('SELECT ticket_history FROM support_tickets WHERE customer_email = ?', '{"tickets": [{"id": 789, "status": "resolved", "subject": "Shipping delay"}], "satisfaction_score": 4.5}'::jsonb, 'test-conv-204', 'support', true, false, 56, NOW() - INTERVAL '45 minutes'),
  ('SELECT available_agents, avg_wait_time FROM support_queue', '{"available": 3, "queue_depth": 7, "avg_wait_minutes": 4}'::jsonb, 'test-conv-205', 'support', true, false, 18, NOW() - INTERVAL '15 minutes'),
  
  -- Engineer agent queries (some requiring approval)
  ('SELECT system_health, error_rate FROM monitoring WHERE service = ?', '{"status": "healthy", "error_rate": 0.02, "latency_p95": 145}'::jsonb, 'test-conv-206', 'engineer', true, false, 89, NOW() - INTERVAL '3 hours'),
  ('SELECT user_permissions FROM auth WHERE user_id = ?', '{"roles": ["customer"], "can_place_orders": true, "account_status": "active"}'::jsonb, 'test-conv-207', 'engineer', NULL, false, 67, NOW() - INTERVAL '10 minutes'),
  
  -- Queries requiring human editing (complex cases)
  ('SELECT sensitive_customer_data WHERE ...', '{"pii_redacted": true, "summary": "Customer has 3 active orders"}'::jsonb, 'test-conv-208', 'data', true, true, 123, NOW() - INTERVAL '1 hour'),
  ('SELECT financial_transactions WHERE amount > 1000', '{"count": 15, "total_value": 47829.50}'::jsonb, 'test-conv-209', 'data', NULL, true, 201, NOW() - INTERVAL '2 hours'),
  
  -- Performance testing scenarios (various latencies)
  ('SELECT product_recommendations WHERE category = ?', '{"recommendations": [{"sku": "REC-1", "score": 0.85}, {"sku": "REC-2", "score": 0.78}]}'::jsonb, 'test-conv-210', 'data', true, false, 340, NOW() - INTERVAL '5 hours'),
  ('SELECT shipping_options WHERE zip_code = ?', '{"options": [{"carrier": "USPS", "days": 5, "cost": 5.99}, {"carrier": "FedEx", "days": 2, "cost": 15.99}]}'::jsonb, 'test-conv-211', 'data', true, false, 78, NOW() - INTERVAL '4 hours'),
  
  -- Demo queries for UI testing
  ('demo-query: Get customer order summary', '{"total_orders": 12, "lifetime_value": 1847.32, "avg_order_value": 153.94}'::jsonb, 'demo-query-001', 'data', true, false, 52, NOW()),
  ('demo-query: Check promo code validity', '{"code": "WELCOME10", "valid": true, "discount": "10%", "expires": "2025-12-31"}'::jsonb, 'demo-query-002', 'marketing', true, false, 41, NOW());

-- Verify seed data counts
SELECT 
  'agent_approvals' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected
FROM agent_approvals
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%'
UNION ALL
SELECT 
  'agent_feedback',
  COUNT(*),
  COUNT(*) FILTER (WHERE safe_to_send = true) as safe,
  COUNT(*) FILTER (WHERE safe_to_send = false) as unsafe,
  COUNT(*) FILTER (WHERE safe_to_send IS NULL) as not_reviewed
FROM agent_feedback
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%'
UNION ALL
SELECT 
  'agent_queries',
  COUNT(*),
  COUNT(*) FILTER (WHERE approved = true) as approved,
  COUNT(*) FILTER (WHERE human_edited = true) as edited,
  COUNT(*) FILTER (WHERE latency_ms > 100) as slow_queries
FROM agent_queries
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';

