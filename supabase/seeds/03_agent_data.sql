-- Seed Data: AI Agent Data (Approvals, Feedback, Queries)
-- Purpose: Synthetic data for agent operations and HITL workflows
-- Generated: 2025-10-19
-- Safety: LOCAL DEVELOPMENT ONLY

-- Note: This seed requires the agent tables to exist
-- Dependencies: 20251011150400_agent_approvals.sql, 20251011150430_agent_feedback.sql, 20251011150500_agent_queries.sql

-- Insert agent approvals
INSERT INTO agent_approvals (
  agent, 
  action_type, 
  target, 
  evidence, 
  status, 
  approved_by, 
  approved_at
) VALUES
  ('ai-customer', 'send_reply', 'chatwoot_conversation_123', '{"draft": "Thank you for your order!", "tone": "professional", "policy_check": "passed"}', 'approved', 'operator_user', NOW() - INTERVAL '2 hours'),
  ('ai-customer', 'send_reply', 'chatwoot_conversation_456', '{"draft": "Your part will ship today", "tone": "helpful", "policy_check": "passed"}', 'approved', 'operator_user', NOW() - INTERVAL '1 day'),
  ('ai-knowledge', 'update_faq', 'faq_carburetor_tuning', '{"changes": "Added section on idle mixture", "impact": "low"}', 'pending', NULL, NULL),
  ('inventory', 'reorder_alert', 'product_1001', '{"rop_triggered": true, "current_stock": 3, "safety_stock": 5}', 'approved', 'operator_user', NOW() - INTERVAL '3 hours'),
  ('seo', 'update_meta', 'product_2001', '{"title": "Adjustable Coilovers - Ford Deuce", "keywords": "hot rod suspension"}', 'rejected', 'operator_user', NOW() - INTERVAL '1 day'),
  ('ai-customer', 'send_reply', 'chatwoot_conversation_789', '{"draft": "We have that in stock", "tone": "casual", "policy_check": "passed"}', 'approved', 'admin_user', NOW() - INTERVAL '5 hours')
ON CONFLICT DO NOTHING;

-- Insert agent feedback (grades and learning signals)
INSERT INTO agent_feedback (
  agent, 
  interaction_id, 
  tone_grade, 
  accuracy_grade, 
  policy_grade, 
  human_edit, 
  learning_signal,
  annotator
) VALUES
  ('ai-customer', 'conv_123', 5, 5, 5, NULL, '{"result": "perfect_match", "confidence": 0.95}', 'operator_user'),
  ('ai-customer', 'conv_456', 4, 5, 5, 'Added "thanks for your patience"', '{"result": "minor_edit", "edit_type": "politeness"}', 'operator_user'),
  ('ai-customer', 'conv_789', 3, 4, 5, 'Changed "casual" tone to "professional"', '{"result": "tone_correction", "original_tone": "casual", "corrected_tone": "professional"}', 'admin_user'),
  ('ai-knowledge', 'faq_update_001', 4, 5, 4, 'Clarified technical terminology', '{"result": "accuracy_improvement"}', 'annotator'),
  ('seo', 'meta_update_001', 2, 3, 5, 'Completely rewrote title for SEO', '{"result": "major_edit", "reason": "keyword_optimization"}', 'operator_user')
ON CONFLICT DO NOTHING;

-- Insert agent queries (operator questions and agent responses)
INSERT INTO agent_queries (
  operator, 
  query_text, 
  agent_response, 
  response_confidence, 
  response_sources, 
  feedback_grade,
  resolved
) VALUES
  ('operator_user', 'What is the reorder point for Holley carburetors?', '{"answer": "ROP is 5 units based on 2-week lead time and weekly demand of 2.5 units", "rop": 5, "safety_stock": 2}', 0.92, ARRAY['inventory_calculations', 'supplier_lead_times'], 5, true),
  ('operator_user', 'Best header fitment for 1932 Ford Deuce Coupe?', '{"answer": "Stainless steel headers (product 1003) fit all 1932-1935 Ford models", "products": [1003]}', 0.88, ARRAY['product_catalog', 'customer_reviews'], 4, true),
  ('admin_user', 'How many churned customers do we have?', '{"answer": "2 churned customers with last purchase >180 days ago", "count": 2, "segment": "churned"}', 0.95, ARRAY['customer_segments', 'lifecycle_analysis'], 5, true),
  ('operator_user', 'What are popular items for racing enthusiasts?', '{"answer": "Carburetors, headers, and roll cages are top sellers for racing segment", "segments": ["racing_enthusiast"], "products": [1001, 1003, 5002]}', 0.87, ARRAY['customer_segments', 'order_history'], 4, true),
  ('viewer_user', 'Average order value by customer segment?', '{"answer": "Professional shops: $622, DIY builders: $370-400, Enthusiasts: $432", "data": "customer_segments"}', 0.91, ARRAY['customer_segments', 'revenue_analysis'], NULL, false)
ON CONFLICT DO NOTHING;

-- Log seed application
DO $$
BEGIN
  RAISE NOTICE 'Seed 03_agent_data.sql applied successfully';
  RAISE NOTICE 'Agent approvals inserted: 6 rows';
  RAISE NOTICE 'Agent feedback inserted: 5 rows';
  RAISE NOTICE 'Agent queries inserted: 5 rows';
END$$;

