-- =====================================================
-- Agent SDK Training Data - Seed Script
-- Purpose: Populate Agent SDK tables with realistic Hot Rod AN scenarios
-- Created: 2025-10-12
-- =====================================================

-- Clean existing test data first
DELETE FROM "AgentQuery" WHERE "shopDomain" = 'hotrodan.myshopify.com';
DELETE FROM "AgentFeedback" WHERE "shopDomain" = 'hotrodan.myshopify.com';
DELETE FROM "agent_sdk_learning_data" WHERE approval_id IN (
  SELECT id FROM agent_approvals WHERE conversation_id LIKE 'TEST-%'
);
DELETE FROM "agent_sdk_notifications" WHERE queue_item_id IN (
  SELECT id FROM agent_approvals WHERE conversation_id LIKE 'TEST-%'
);
DELETE FROM agent_approvals WHERE conversation_id LIKE 'TEST-%';

-- =====================================================
-- 1. Agent Approvals - Pending Customer Support Drafts
-- =====================================================

INSERT INTO agent_approvals (
  conversation_id, chatwoot_conversation_id, chatwoot_message_id, inbox_id,
  customer_name, customer_email, customer_message, draft_response,
  confidence_score, knowledge_sources, suggested_tags, sentiment_analysis,
  recommended_action, status, priority, "shopDomain"
) VALUES
-- Scenario 1: AN Fitting Installation Question (High Confidence)
('TEST-001', 12345, 67890, 1,
 'Mike Johnson', 'mike@customhotrods.com',
 'I''m installing -6 AN fittings on my fuel line for the first time. Do I need thread sealant or are they designed to seal without it?',
 'Great question! AN (Army-Navy) fittings are designed to seal metal-to-metal without thread sealant. The 37° flare creates the seal. Using thread sealant can actually cause problems:

1. **Don''t use**: Teflon tape or liquid sealant on the threads
2. **Do use**: A thin coat of assembly lube or light oil on threads (prevents galling)
3. **Torque properly**: Hand-tighten, then 1/6 to 1/4 turn with wrench

The flare and sleeve create the seal, not the threads. Let me know if you need torque specs for your specific fitting size!',
 95,
 '[{"source": "AN Fitting Installation Guide", "url": "/guides/an-fittings"}, {"source": "Product Specs: -6 AN Male", "sku": "AN-6-MALE"}]'::jsonb,
 ARRAY['an-fittings', 'installation', 'fuel-system'],
 '{"sentiment": "neutral", "urgency": "medium", "technical_level": "beginner"}'::jsonb,
 'send', 'approved', 'normal', 'hotrodan.myshopify.com'),

-- Scenario 2: Fuel Pump Compatibility (Medium Confidence)
('TEST-002', 12346, 67891, 1,
 'Sarah Martinez', 'sarah@streetrodders.com',
 'Will the Holley 12-802-1 fuel pump work with E85 fuel? I''m converting my ''32 Ford to ethanol.',
 'Good question about E85 compatibility. The Holley 12-802-1 (Red pump, 140 GPH) has internal components that can handle E85, but there are important considerations:

**E85 Compatible**: Yes, with caveats
- Seals and diaphragm are E85-rated
- Flow rate may decrease 5-10% with E85 (thicker fuel)
- Expect higher amp draw

**Recommendations**:
1. Verify all fuel line components are E85-rated
2. Consider upgrading to 12-815-1 (specifically designed for E85)
3. Use -8 AN lines minimum for E85 (higher volume needed)

For your ''32 Ford, I''d recommend the 12-815-1 for peace of mind. Want me to check if we have it in stock?',
 75,
 '[{"source": "Holley Fuel Pump Guide", "sku": "12-802-1"}]'::jsonb,
 ARRAY['fuel-pump', 'e85', 'holley'],
 '{"sentiment": "positive", "urgency": "high", "technical_level": "intermediate"}'::jsonb,
 'review', 'pending', 'high', 'hotrodan.myshopify.com'),

-- Scenario 3: Shipping Inquiry (Low Confidence - Needs Review)
('TEST-003', 12347, 67892, 1,
 'Tom Richards', 'tom.richards@gmail.com',
 'My order #HRA-8472 hasn''t arrived yet. It''s been 5 days. What''s going on?',
 'I apologize for the delay on order #HRA-8472. Let me look into this right away.

[AGENT NOTE: Need to check actual shipping status - placeholder response]

I''ll investigate your shipment and get back to you within the hour with tracking details and an ETA. We''ll make this right.',
 45,
 '[]'::jsonb,
 ARRAY['shipping-delay', 'customer-inquiry'],
 '{"sentiment": "negative", "urgency": "urgent", "technical_level": "none", "issue_type": "shipping_delay"}'::jsonb,
 'escalate', 'pending', 'urgent', 'hotrodan.myshopify.com'),

-- Scenario 4: Product Recommendation (High Confidence)
('TEST-004', 12348, 67893, 1,
 'Dave Wilson', 'dave@wilsonracing.com',
 'Building a small block Chevy. What size AN fittings do I need for the fuel system? Running pump gas, not racing.',
 'For a street small block Chevy on pump gas, here''s what I recommend:

**Fuel Lines**:
- **Main feed line**: -6 AN (supports up to 450 HP)
- **Return line**: -6 AN (same as feed for simplicity)
- **Carb inlet**: -6 AN to 5/8" adapter

**Why -6 AN**:
- Flows plenty for street/mild performance (up to 450 HP)
- Easier to work with than -8 or -10
- More forgiving on tight engine bay spaces
- Cost-effective

**If you''re planning forced induction** later, go with -8 AN now to avoid re-doing it.

I can put together a complete AN fitting kit for your build. Interested in a package deal?',
 90,
 '[{"source": "AN Fitting Sizing Guide", "url": "/guides/an-sizing"}, {"source": "SBC Fuel System Build", "article_id": "sbc-fuel-101"}]'::jsonb,
 ARRAY['product-recommendation', 'an-fittings', 'fuel-system', 'small-block-chevy'],
 '{"sentiment": "positive", "urgency": "medium", "technical_level": "intermediate"}'::jsonb,
 'send', 'pending', 'normal', 'hotrodan.myshopify.com'),

-- Scenario 5: Returns Question (Medium Confidence)
('TEST-005', 12349, 67894, 1,
 'Lisa Chen', 'lisa.chen@yahoo.com',
 'I ordered the wrong size AN adapter. Can I return it? It''s still in the package.',
 'Absolutely! We have a hassle-free return policy for Hot Rod AN:

**Return Policy**:
- **30-day window**: Returns accepted within 30 days of purchase
- **Unused items**: Must be in original packaging (✓ yours qualifies)
- **Full refund**: We''ll refund the full product price
- **Return shipping**: You cover return shipping, unless it''s our error

**Next Steps**:
1. Reply with your order number
2. I''ll send you a prepaid return label
3. Ship it back
4. Refund processed within 2-3 business days

What''s your order number? I''ll get that label to you right away!',
 85,
 '[{"source": "Return Policy", "url": "/pages/returns"}]'::jsonb,
 ARRAY['returns', 'exchange'],
 '{"sentiment": "neutral", "urgency": "medium", "technical_level": "none"}'::jsonb,
 'send', 'pending', 'normal', 'hotrodan.myshopify.com');

-- =====================================================
-- 2. Agent Feedback - Training Data with Annotations
-- =====================================================

INSERT INTO "AgentFeedback" (
  "conversationId", "inputText", "modelDraft", "safeToSend", labels,
  rubric, annotator, notes, "shopDomain"
) VALUES
-- Good Response Example
(12345,
 'What''s the difference between -6 AN and 3/8" NPT fittings?',
 'AN (Army-Navy) fittings use a 37° flare seal, while NPT (National Pipe Tapered) uses tapered threads. AN fittings are reusable, seal better, and are preferred for fuel systems.',
 true,
 '{"quality": "excellent", "tone": "helpful", "technical_accuracy": "high"}'::jsonb,
 '{"clarity": 5, "accuracy": 5, "helpfulness": 5, "tone": 5}'::jsonb,
 'justin@hotdash.dev',
 'Perfect technical explanation, concise and accurate',
 'hotrodan.myshopify.com'),

-- Needs Editing Example
(12346,
 'How do I install brake lines?',
 'You need to bend the tubing and flare the ends.',
 false,
 '{"quality": "poor", "tone": "terse", "technical_accuracy": "incomplete"}'::jsonb,
 '{"clarity": 2, "accuracy": 3, "helpfulness": 2, "tone": 2}'::jsonb,
 'justin@hotdash.dev',
 'Too brief, missing safety warnings and specific steps',
 'hotrodan.myshopify.com'),

-- Excellent Upsell Example
(12347,
 'I need a fuel filter for my hot rod.',
 'For a hot rod fuel system, I recommend our -6 AN inline fuel filter (SKU: FF-6-100). It flows great and looks period-correct. Need fittings to go with it?',
 true,
 '{"quality": "excellent", "tone": "sales", "upsell": true}'::jsonb,
 '{"clarity": 5, "accuracy": 5, "helpfulness": 5, "tone": 5, "sales_effectiveness": 5}'::jsonb,
 'justin@hotdash.dev',
 'Natural upsell, helpful product recommendation',
 'hotrodan.myshopify.com');

-- =====================================================
-- 3. Agent Queries - Query Logs with Performance Metrics
-- =====================================================

INSERT INTO "AgentQuery" (
  query, result, "conversationId", agent, approved, "humanEdited",
  "latencyMs", "shopDomain"
) VALUES
-- Inventory Query
('Get inventory level for SKU: AN-6-MALE',
 '{"sku": "AN-6-MALE", "quantity": 247, "status": "in_stock", "reorder_point": 50}'::jsonb,
 12345, 'inventory-agent', true, false, 145, 'hotrodan.myshopify.com'),

-- Order Status Query
('Get order status for #HRA-8472',
 '{"order_number": "HRA-8472", "status": "shipped", "tracking": "1Z999AA10123456784", "carrier": "UPS"}'::jsonb,
 12347, 'cx-agent', true, false, 234, 'hotrodan.myshopify.com'),

-- Product Search Query
('Find all fuel pumps for small block Chevy',
 '{"products": [{"sku": "HOLLY-12-802-1", "name": "Holley Red Fuel Pump"}, {"sku": "HOLLY-12-815-1", "name": "Holley E85 Fuel Pump"}], "count": 2}'::jsonb,
 12348, 'product-agent', true, false, 189, 'hotrodan.myshopify.com'),

-- Customer History Query
('Get purchase history for customer@email.com',
 '{"total_orders": 5, "total_spent": 2847.50, "last_order_date": "2025-10-01", "customer_segment": "professional_shop"}'::jsonb,
 12346, 'cx-agent', true, false, 312, 'hotrodan.myshopify.com'),

-- Slow Query Example (needs optimization)
('Get all orders with AN fittings in last 30 days',
 '{"orders": [], "count": 0, "note": "Query timeout"}'::jsonb,
 12349, 'analytics-agent', false, true, 5420, 'hotrodan.myshopify.com');

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify seed data inserted correctly
SELECT 
  'agent_approvals' as table_name, 
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count
FROM agent_approvals
WHERE conversation_id LIKE 'TEST-%';

SELECT 
  'AgentFeedback' as table_name,
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE "safeToSend" = true) as safe_count
FROM "AgentFeedback"
WHERE "shopDomain" = 'hotrodan.myshopify.com';

SELECT 
  'AgentQuery' as table_name,
  COUNT(*) as row_count,
  AVG("latencyMs") as avg_latency_ms,
  COUNT(*) FILTER (WHERE approved = true) as approved_count
FROM "AgentQuery"
WHERE "shopDomain" = 'hotrodan.myshopify.com';

-- Test RLS protection (should work with proper session variables)
-- SET app.shop_domain = 'hotrodan.myshopify.com';
-- SELECT * FROM agent_approvals LIMIT 5;

