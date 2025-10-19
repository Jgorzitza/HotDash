-- Seed Data: Facts, Decision Logs, and Observability Logs
-- Purpose: Synthetic audit and analytics data for RLS testing
-- Generated: 2025-10-19
-- Safety: LOCAL DEVELOPMENT ONLY

-- Note: This seed requires audit tables to exist
-- Dependencies: 20251011143933_enable_rls_facts.sql, 20251011144000_enable_rls_decision_logs.sql, 20251011144030_enable_rls_observability_logs.sql

-- Note: Facts table doesn't exist in local migrations (migration drift issue)
-- This seed file is prepared for when the table is created

-- Insert facts (multi-tenant analytics data)
-- Commented out until facts table is created
/*
INSERT INTO facts (project, topic, key, value, created_at) VALUES
  -- OCC project facts
  ('occ', 'dashboard.analytics', 'daily_revenue', '{"amount": 4500.00, "date": "2025-10-18"}', NOW() - INTERVAL '1 day'),
  ('occ', 'dashboard.analytics', 'daily_orders', '{"count": 12, "date": "2025-10-18"}', NOW() - INTERVAL '1 day'),
  ('occ', 'sales.summary', 'monthly_revenue', '{"amount": 125000.00, "month": "2025-10"}', NOW() - INTERVAL '2 days'),
  ('occ', 'inventory.alerts', 'low_stock_count', '{"count": 3, "products": [1001, 2001, 4001]}', NOW() - INTERVAL '3 hours'),
  ('occ', 'customer.metrics', 'active_customers', '{"count": 15, "segment_breakdown": {"diy": 8, "professional": 4, "enthusiast": 3}}', NOW() - INTERVAL '1 day'),
  
  -- Chatwoot project facts
  ('chatwoot', 'support.metrics', 'daily_tickets', '{"count": 8, "avg_response_time_min": 12}', NOW() - INTERVAL '1 day'),
  ('chatwoot', 'support.metrics', 'customer_satisfaction', '{"avg_rating": 4.7, "total_ratings": 24}', NOW() - INTERVAL '2 days'),
  ('chatwoot', 'support.ai', 'ai_draft_rate', '{"rate": 0.85, "total_drafts": 102, "approved": 87}', NOW() - INTERVAL '1 day'),
  ('chatwoot', 'support.queue', 'pending_conversations', '{"count": 3, "oldest_age_hours": 2}', NOW() - INTERVAL '1 hour'),
  
  -- Growth project facts
  ('growth', 'seo.metrics', 'organic_traffic', '{"sessions": 450, "date": "2025-10-18"}', NOW() - INTERVAL '1 day'),
  ('growth', 'seo.metrics', 'keyword_rankings', '{"top_10_count": 12, "improved": 3, "declined": 1}', NOW() - INTERVAL '2 days'),
  ('growth', 'social.metrics', 'post_engagement', '{"likes": 234, "shares": 45, "comments": 18}', NOW() - INTERVAL '6 hours'),
  ('growth', 'ads.metrics', 'roas', '{"value": 4.2, "spend": 500.00, "revenue": 2100.00}', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;
*/

-- Insert decision sync event logs (scope-based decision tracking)
-- Commented out until decision_sync_event_logs table is created
/*
INSERT INTO decision_sync_event_logs (decision_id, status, scope, duration_ms, metadata, created_at) VALUES
  (1, 'success', 'ops', 125.5, '{"action": "inventory_reorder", "trigger": "rop_threshold"}', NOW() - INTERVAL '2 hours'),
  (2, 'success', 'cx', 98.2, '{"action": "send_customer_reply", "channel": "email"}', NOW() - INTERVAL '1 hour'),
  (3, 'failed', 'ops', 502.8, '{"action": "update_product_price", "error": "validation_failed"}', NOW() - INTERVAL '3 hours'),
  (4, 'success', 'analytics', 215.3, '{"action": "calculate_metrics", "timeframe": "daily"}', NOW() - INTERVAL '30 minutes'),
  (5, 'success', 'cx', 76.1, '{"action": "create_ticket", "source": "website_chat"}', NOW() - INTERVAL '15 minutes'),
  (6, 'success', 'ops', 145.7, '{"action": "approve_order", "order_id": "ORD-12345"}', NOW() - INTERVAL '4 hours'),
  (7, 'failed', 'analytics', 1205.4, '{"action": "run_report", "error": "timeout"}', NOW() - INTERVAL '1 day'),
  (8, 'success', 'growth', 189.2, '{"action": "schedule_post", "platform": "instagram"}', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;
*/

-- Insert observability logs (request tracking)
-- Commented out until observability_logs table is created
/*
INSERT INTO observability_logs (level, message, metadata, request_id, created_at) VALUES
  ('INFO', 'Dashboard tile loaded successfully', '{"tile": "revenue", "duration_ms": 245}', 'req-2025-10-19-001', NOW() - INTERVAL '1 hour'),
  ('INFO', 'Customer query processed', '{"query_type": "product_search", "results": 5}', 'req-2025-10-19-002', NOW() - INTERVAL '2 hours'),
  ('WARN', 'Slow query detected', '{"query": "get_customer_segments", "duration_ms": 850}', 'req-2025-10-19-003', NOW() - INTERVAL '3 hours'),
  ('ERROR', 'Failed to fetch external data', '{"service": "shopify_api", "error": "timeout"}', 'req-2025-10-19-004', NOW() - INTERVAL '4 hours'),
  ('INFO', 'RLS policy evaluated', '{"table": "facts", "policy": "read_by_project", "result": "allowed"}', 'req-2025-10-19-005', NOW() - INTERVAL '30 minutes'),
  ('INFO', 'Agent approval processed', '{"agent": "ai-customer", "action": "send_reply", "status": "approved"}', 'req-2025-10-19-006', NOW() - INTERVAL '1 hour'),
  ('WARN', 'Rate limit approaching', '{"endpoint": "/api/analytics", "current_requests": 850, "limit": 1000}', 'req-2025-10-19-007', NOW() - INTERVAL '15 minutes'),
  ('ERROR', 'Database connection pool exhausted', '{"active_connections": 25, "max_connections": 25}', 'req-2025-10-19-008', NOW() - INTERVAL '5 hours'),
  ('INFO', 'Nightly rollup completed', '{"duration_ms": 3250, "rows_processed": 1234}', 'req-2025-10-19-009', NOW() - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;
*/

-- Log seed application
DO $$
BEGIN
  RAISE NOTICE 'Seed 04_facts_and_logs.sql prepared (tables may not exist yet due to migration drift)';
  RAISE NOTICE 'Facts data: 13 rows prepared (commented out)';
  RAISE NOTICE 'Decision logs: 8 rows prepared (commented out)';
  RAISE NOTICE 'Observability logs: 9 rows prepared (commented out)';
  RAISE NOTICE 'Uncomment INSERT statements once tables are created';
END$$;

