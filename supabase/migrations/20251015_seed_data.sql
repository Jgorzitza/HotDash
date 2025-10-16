-- Seed Data / Fixtures for Development
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: 15 - Seeds/fixtures for dev

-- ============================================================================
-- Seed Data for Approvals Workflow
-- ============================================================================

-- Insert sample approvals
INSERT INTO approvals (kind, state, summary, created_by, evidence, impact, risk, rollback, actions)
VALUES
  (
    'cx_reply',
    'pending_review',
    'Shipping delay apology for order #1234',
    'ai-customer',
    '{"samples": ["Customer: Where is my order?"], "template": "shipping_delay_apology"}'::jsonb,
    '{"customer_satisfaction": "+10%", "response_time": "< 15 min"}'::jsonb,
    '{"risk": "low", "concerns": []}'::jsonb,
    '{"action": "send_followup", "template": "discount_apology"}'::jsonb,
    '[{"tool": "chatwoot.reply.fromNote", "args": {"conversationId": "123", "noteId": "456"}}]'::jsonb
  ),
  (
    'inventory',
    'draft',
    'Update ROP for SKU ABC-123 to 50 units',
    'ai-inventory',
    '{"sales_velocity": "10 units/day", "lead_time": "5 days", "current_stock": "20 units"}'::jsonb,
    '{"stockout_risk": "-40%", "overstock_risk": "+5%"}'::jsonb,
    '{"risk": "medium", "concerns": ["seasonal demand spike"]}'::jsonb,
    '{"action": "revert_rop", "previous_value": 30}'::jsonb,
    '[{"tool": "supabase.rpc.updateReorderPoint", "args": {"variantId": "123", "rop": 50}}]'::jsonb
  ),
  (
    'growth',
    'approved',
    'Publish blog post: "10 Hot Sauce Recipes"',
    'ai-growth',
    '{"keyword_research": "hot sauce recipes", "search_volume": 5000, "competition": "medium"}'::jsonb,
    '{"organic_traffic": "+15%", "backlinks": "+5"}'::jsonb,
    '{"risk": "low", "concerns": []}'::jsonb,
    '{"action": "unpublish", "draft_id": "789"}'::jsonb,
    '[{"tool": "cms.publish", "args": {"postId": "789"}}]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Insert sample approval grades
INSERT INTO approval_grades (approval_id, reviewer, tone, accuracy, policy, notes)
SELECT 
  id,
  'justin@hotrodan.com',
  5,
  5,
  5,
  'Perfect response'
FROM approvals
WHERE kind = 'growth' AND state = 'approved'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Seed Data for Picker Payouts
-- ============================================================================

INSERT INTO picker_payouts (
  picker_name,
  picker_email,
  pay_period_start,
  pay_period_end,
  orders_picked,
  units_picked,
  pick_accuracy_pct,
  avg_pick_time_seconds,
  base_rate_per_order,
  bonus_rate_per_unit,
  accuracy_bonus,
  speed_bonus,
  total_payout,
  status
)
VALUES
  (
    'John Doe',
    'john@example.com',
    '2025-10-01',
    '2025-10-07',
    150,
    450,
    98.5,
    120,
    2.50,
    0.10,
    25.00,
    15.00,
    455.00,
    'approved'
  ),
  (
    'Jane Smith',
    'jane@example.com',
    '2025-10-01',
    '2025-10-07',
    200,
    600,
    99.2,
    110,
    2.50,
    0.10,
    30.00,
    20.00,
    610.00,
    'paid'
  )
ON CONFLICT (picker_email, pay_period_start, pay_period_end) DO NOTHING;

-- ============================================================================
-- Seed Data for CX Metrics
-- ============================================================================

INSERT INTO cx_metrics_daily (
  metric_date,
  conversations_total,
  conversations_new,
  conversations_resolved,
  conversations_pending,
  avg_first_response_minutes,
  median_first_response_minutes,
  p95_first_response_minutes,
  sla_compliance_pct,
  ai_drafted_count,
  ai_approval_rate_pct,
  avg_tone_grade,
  avg_accuracy_grade,
  avg_policy_grade
)
VALUES
  (
    CURRENT_DATE - 1,
    45,
    20,
    38,
    7,
    12.5,
    10.0,
    25.0,
    92.5,
    35,
    88.5,
    4.7,
    4.8,
    4.9
  ),
  (
    CURRENT_DATE - 2,
    52,
    25,
    45,
    7,
    15.2,
    12.0,
    30.0,
    89.0,
    40,
    85.0,
    4.6,
    4.7,
    4.8
  )
ON CONFLICT (metric_date, shop_domain) DO NOTHING;

-- ============================================================================
-- Seed Data for Growth Metrics
-- ============================================================================

INSERT INTO growth_metrics_daily (
  metric_date,
  organic_sessions,
  organic_pageviews,
  organic_bounce_rate_pct,
  traffic_anomalies_count,
  ad_spend,
  ad_impressions,
  ad_clicks,
  ad_ctr_pct,
  ad_conversions,
  ad_roas,
  blog_posts_published,
  blog_pageviews,
  social_posts_count,
  social_engagement_count
)
VALUES
  (
    CURRENT_DATE - 1,
    1250,
    3500,
    45.2,
    2,
    150.00,
    25000,
    750,
    3.0,
    15,
    4.5,
    1,
    450,
    3,
    125
  ),
  (
    CURRENT_DATE - 2,
    1180,
    3200,
    47.5,
    3,
    145.00,
    23000,
    690,
    3.0,
    12,
    3.8,
    0,
    380,
    2,
    98
  )
ON CONFLICT (metric_date, shop_domain) DO NOTHING;

-- ============================================================================
-- Seed Data for Audit Logs
-- ============================================================================

INSERT INTO audit_logs (
  actor,
  action,
  entity_type,
  entity_id,
  payload,
  result,
  result_details,
  rollback_ref
)
VALUES
  (
    'justin@hotrodan.com',
    'approval.approved',
    'approval',
    '1',
    '{"kind": "growth", "summary": "Publish blog post"}'::jsonb,
    'success',
    '{"operation": "UPDATE", "table": "approvals"}'::jsonb,
    'approval/1/rollback'
  ),
  (
    'system',
    'picker_payouts.insert',
    'picker_payouts',
    '1',
    '{"picker_email": "john@example.com", "total_payout": 455.00}'::jsonb,
    'success',
    '{"operation": "INSERT", "table": "picker_payouts"}'::jsonb,
    null
  )
ON CONFLICT DO NOTHING;

