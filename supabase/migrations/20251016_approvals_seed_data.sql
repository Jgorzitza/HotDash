-- Seed Data for Approvals (UI Demos)
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-16
-- Task: 6 - Seed data for approvals to enable UI demos (5 approvals, mixed states)

-- ============================================================================
-- Seed Approvals (5 approvals with mixed states)
-- ============================================================================

INSERT INTO approvals (kind, state, summary, created_by, reviewer, evidence, impact, risk, rollback, actions)
VALUES
  -- 1. Pending CX Reply
  (
    'cx_reply',
    'pending_review',
    'Shipping delay apology for order #1234',
    'ai-customer',
    NULL,
    '{"conversation_id": "123", "customer_message": "Where is my order?", "template": "shipping_delay_apology", "samples": ["We apologize for the delay..."]}'::jsonb,
    '{"customer_satisfaction": "+10%", "response_time": "< 15 min", "sla_met": true}'::jsonb,
    '{"risk_level": "low", "concerns": []}'::jsonb,
    '{"action": "send_followup", "template": "discount_apology", "discount_code": "SORRY10"}'::jsonb,
    '[{"tool": "chatwoot.reply.fromNote", "args": {"conversationId": "123", "noteId": "456"}}]'::jsonb
  ),
  
  -- 2. Approved Inventory Action
  (
    'inventory',
    'approved',
    'Update ROP for SKU ABC-123 to 50 units',
    'ai-inventory',
    'justin@hotrodan.com',
    '{"sku": "ABC-123", "current_rop": 30, "proposed_rop": 50, "sales_velocity": "10 units/day", "lead_time": "5 days", "current_stock": "20 units", "wos": 2}'::jsonb,
    '{"stockout_risk": "-40%", "overstock_risk": "+5%", "revenue_protected": "$5000"}'::jsonb,
    '{"risk_level": "medium", "concerns": ["seasonal demand spike possible"]}'::jsonb,
    '{"action": "revert_rop", "previous_value": 30, "sql": "UPDATE inventory SET reorder_point = 30 WHERE sku = \'ABC-123\'"}'::jsonb,
    '[{"tool": "supabase.rpc.updateReorderPoint", "args": {"variantId": "123", "rop": 50}}]'::jsonb
  ),
  
  -- 3. Draft Growth Action
  (
    'growth',
    'draft',
    'Publish blog post: "10 Hot Sauce Recipes for Summer"',
    'ai-growth',
    NULL,
    '{"keyword": "hot sauce recipes", "search_volume": 5000, "competition": "medium", "current_rank": null, "content_length": "1500 words", "images": 10}'::jsonb,
    '{"organic_traffic": "+15%", "backlinks": "+5", "social_shares": "+50", "estimated_visitors": "750/month"}'::jsonb,
    '{"risk_level": "low", "concerns": []}'::jsonb,
    '{"action": "unpublish", "draft_id": "789", "url": "/blog/hot-sauce-recipes-summer"}'::jsonb,
    '[{"tool": "cms.publish", "args": {"postId": "789", "publishDate": "2025-10-20"}}]'::jsonb
  ),
  
  -- 4. Applied CX Reply
  (
    'cx_reply',
    'applied',
    'Product recommendation for customer inquiry',
    'ai-customer',
    'justin@hotrodan.com',
    '{"conversation_id": "456", "customer_message": "Looking for mild hot sauce", "recommended_products": ["Mild Jalapeño Sauce", "Sweet Chili Sauce"]}'::jsonb,
    '{"conversion_probability": "65%", "avg_order_value": "$45", "customer_satisfaction": "+15%"}'::jsonb,
    '{"risk_level": "low", "concerns": []}'::jsonb,
    '{"action": "send_correction", "template": "product_recommendation_v2"}'::jsonb,
    '[{"tool": "chatwoot.reply.fromNote", "args": {"conversationId": "456", "noteId": "789"}}]'::jsonb
  ),
  
  -- 5. Pending Inventory Action
  (
    'inventory',
    'pending_review',
    'Generate PO for 3 low-stock SKUs',
    'ai-inventory',
    NULL,
    '{"skus": ["XYZ-001", "XYZ-002", "XYZ-003"], "total_units": 500, "total_cost": "$12,500", "supplier": "Acme Wholesale", "lead_time": "14 days"}'::jsonb,
    '{"stockout_prevention": "3 SKUs", "revenue_protected": "$25,000", "inventory_turnover": "+10%"}'::jsonb,
    '{"risk_level": "medium", "concerns": ["cash flow impact", "storage capacity"]}'::jsonb,
    '{"action": "cancel_po", "po_number": "PO-2025-001", "supplier_contact": "orders@acme.com"}'::jsonb,
    '[{"tool": "email.send", "args": {"to": "orders@acme.com", "subject": "Purchase Order PO-2025-001", "attachment": "po.csv"}}]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Seed Approval Items (for inventory approvals)
-- ============================================================================

INSERT INTO approval_items (approval_id, path, diff)
SELECT 
  id,
  'product/' || (evidence->>'sku'),
  jsonb_build_object(
    'before', jsonb_build_object('reorder_point', (evidence->>'current_rop')::INTEGER),
    'after', jsonb_build_object('reorder_point', (evidence->>'proposed_rop')::INTEGER)
  )
FROM approvals
WHERE kind = 'inventory' AND evidence->>'sku' IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Seed Approval Grades (for approved items)
-- ============================================================================

INSERT INTO approval_grades (approval_id, reviewer, tone, accuracy, policy, notes)
SELECT 
  id,
  'justin@hotrodan.com',
  5,
  5,
  5,
  'Excellent analysis and recommendation'
FROM approvals
WHERE state = 'approved'
ON CONFLICT (approval_id) DO NOTHING;

-- ============================================================================
-- Seed Approval Edits (for applied items)
-- ============================================================================

INSERT INTO approval_edits (approval_id, field, original_value, edited_value, edit_distance, editor)
SELECT 
  id,
  'summary',
  summary,
  summary || ' (reviewed)',
  10,
  'justin@hotrodan.com'
FROM approvals
WHERE state = 'applied'
ON CONFLICT DO NOTHING;

COMMENT ON TABLE approvals IS 'Seed data loaded: 5 approvals with mixed states for UI demos';

