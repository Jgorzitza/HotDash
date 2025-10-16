-- KB Seed Data - Initial Articles
-- Created: 2025-10-15
-- Purpose: Seed knowledge base with common customer support articles

-- Insert initial KB articles
insert into kb_articles (question, answer, category, tags, source, created_by, confidence_score) values

-- Orders category
('Where is my order?', 
'I understand you''re eager to receive your order! Let me help you track it. Your order should have a tracking number in your confirmation email. You can also check your order status in your account dashboard. If you don''t see tracking information, please provide your order number and I''ll look it up for you right away.',
'orders',
array['order_tracking', 'order_status'],
'template',
'system',
0.75),

('How do I cancel my order?',
'I can help you with that! If your order hasn''t shipped yet, we can cancel it for you. Please provide your order number and I''ll check the status. If it''s already shipped, you can refuse delivery or initiate a return once you receive it. Our return policy allows returns within 30 days of delivery.',
'orders',
array['order_cancellation', 'order_modification'],
'template',
'system',
0.70),

('Can I change my shipping address?',
'I''d be happy to help update your shipping address! If your order hasn''t shipped yet, we can change it. Please provide your order number and the new address. If it''s already shipped, I can contact the carrier to request an address change, though this isn''t always possible. Let me check the status for you.',
'orders',
array['order_modification', 'shipping_address'],
'template',
'system',
0.72),

-- Shipping category
('When will my order arrive?',
'Great question! Delivery times depend on your shipping method and location. Standard shipping typically takes 5-7 business days, while expedited shipping is 2-3 business days. You can find your estimated delivery date in your order confirmation email or by tracking your package. Would you like me to look up the specific delivery estimate for your order?',
'shipping',
array['shipping_eta', 'delivery_time'],
'template',
'system',
0.78),

('Do you ship internationally?',
'Yes, we do ship internationally to many countries! International shipping typically takes 10-15 business days depending on the destination. Shipping costs and customs fees vary by location. You can see available shipping options and costs at checkout. Is there a specific country you''d like to ship to?',
'shipping',
array['shipping_international', 'shipping_cost'],
'template',
'system',
0.73),

('My package says delivered but I didn''t receive it',
'I''m sorry to hear your package shows delivered but you haven''t received it. This can be frustrating! Let''s troubleshoot: 1) Check around your property - sometimes carriers leave packages in safe spots. 2) Ask neighbors or household members. 3) Check the tracking for delivery location details. If you still can''t locate it, we''ll file a claim with the carrier and send a replacement or refund. Your satisfaction is our priority!',
'shipping',
array['shipping_delay', 'lost_package', 'delivery_issue'],
'template',
'system',
0.80),

-- Returns category
('What is your return policy?',
'We want you to love your purchase! Our return policy allows returns within 30 days of delivery for a full refund. Items must be unused and in original packaging. To start a return, you can initiate it through your account dashboard or I can help you right now. Return shipping is free for defective items; otherwise, a small return shipping fee applies. Would you like to start a return?',
'returns',
array['return_policy', 'refund_policy'],
'template',
'system',
0.82),

('How do I return an item?',
'Returning an item is easy! Here''s how: 1) Log into your account and go to Order History. 2) Select the order and click "Return Items". 3) Choose the items and reason for return. 4) Print the prepaid return label. 5) Pack the items securely and drop off at any carrier location. You''ll receive your refund within 5-7 business days after we receive the return. Need help with any of these steps?',
'returns',
array['return_process', 'return_instructions'],
'template',
'system',
0.79),

('When will I get my refund?',
'I understand you''re waiting for your refund! Once we receive your return, we process refunds within 2-3 business days. The refund will go back to your original payment method. Depending on your bank, it may take an additional 5-7 business days to appear in your account. If you''d like, I can check the status of your return to give you a more specific timeline.',
'returns',
array['refund_timeline', 'refund_status'],
'template',
'system',
0.76),

-- Products category
('Is this product in stock?',
'Let me check that for you! I can see current stock availability. Which product are you interested in? If it''s currently out of stock, I can notify you when it''s back in stock or suggest similar alternatives that are available now.',
'products',
array['product_availability', 'stock_status'],
'template',
'system',
0.74),

('What are the product dimensions?',
'Good question! Product dimensions and specifications can be found on the product page under the "Specifications" or "Details" tab. If you''re looking at a specific product and don''t see this information, please share the product name or link and I''ll get you the exact dimensions right away.',
'products',
array['product_specs', 'product_details'],
'template',
'system',
0.71),

('Do you have this in a different color/size?',
'I''d be happy to check available options for you! On the product page, you''ll see all available colors and sizes. If a specific option is grayed out, it''s currently out of stock. Which product are you interested in, and what color/size are you looking for? I can check our inventory and let you know when it might be restocked.',
'products',
array['product_availability', 'product_variants'],
'template',
'system',
0.73),

-- Technical category
('I can''t log into my account',
'I''m sorry you''re having trouble logging in! Let''s get you back in: 1) Try resetting your password using the "Forgot Password" link. 2) Make sure you''re using the correct email address. 3) Clear your browser cache and cookies. 4) Try a different browser. If none of these work, I can help you reset your account or create a new one. What error message are you seeing?',
'technical',
array['account_login', 'password_reset'],
'template',
'system',
0.77),

('The website isn''t working',
'I apologize for the technical difficulty! Let''s troubleshoot: 1) Try refreshing the page. 2) Clear your browser cache and cookies. 3) Try a different browser or device. 4) Check if you''re using the latest browser version. What specific issue are you experiencing? I''m here to help get this resolved quickly!',
'technical',
array['website_error', 'technical_issue'],
'template',
'system',
0.72),

('My payment was declined',
'I understand payment issues can be frustrating. Here are common reasons and solutions: 1) Verify your card details are correct. 2) Check with your bank - they may have flagged it as suspicious. 3) Ensure you have sufficient funds. 4) Try a different payment method. 5) Check if your billing address matches your card. Would you like to try again, or would you prefer to use a different payment method?',
'technical',
array['payment_issue', 'checkout_error'],
'template',
'system',
0.75),

-- Policies category
('What is your privacy policy?',
'We take your privacy seriously! Our privacy policy outlines how we collect, use, and protect your personal information. You can read the full policy at [link to privacy policy]. In brief: we only collect necessary information, never sell your data, use secure encryption, and you can request data deletion at any time. Do you have specific privacy concerns I can address?',
'policies',
array['privacy_policy', 'data_protection'],
'template',
'system',
0.78),

('Do you offer a warranty?',
'Yes! All our products come with a manufacturer''s warranty. The warranty period varies by product (typically 1-2 years) and covers defects in materials and workmanship. You can find specific warranty information on each product page. If you experience any issues with a product under warranty, we''ll repair or replace it at no cost. Which product are you asking about?',
'policies',
array['warranty_info', 'product_guarantee'],
'template',
'system',
0.76),

('Can I use multiple discount codes?',
'Great question! Our system allows one discount code per order. If you have multiple codes, I recommend using the one that gives you the biggest savings. Discount codes cannot be combined with other promotional offers unless specifically stated. If you''re having trouble applying a code, let me know and I''ll help troubleshoot!',
'policies',
array['discount_policy', 'promo_codes'],
'template',
'system',
0.74);

-- Insert initial topics
insert into kb_topics (name, description) values
('Order Management', 'Topics related to order tracking, modification, and cancellation'),
('Shipping & Delivery', 'Topics related to shipping methods, tracking, and delivery'),
('Returns & Refunds', 'Topics related to return process and refund policies'),
('Product Information', 'Topics related to product details, availability, and specifications'),
('Account & Technical', 'Topics related to account access and technical issues'),
('Policies & Terms', 'Topics related to company policies, warranties, and terms');

-- Link articles to topics
insert into kb_article_topics (article_id, topic_id, relevance_score)
select a.id, t.id, 1.0
from kb_articles a
cross join kb_topics t
where 
  (a.category = 'orders' and t.name = 'Order Management') or
  (a.category = 'shipping' and t.name = 'Shipping & Delivery') or
  (a.category = 'returns' and t.name = 'Returns & Refunds') or
  (a.category = 'products' and t.name = 'Product Information') or
  (a.category = 'technical' and t.name = 'Account & Technical') or
  (a.category = 'policies' and t.name = 'Policies & Terms');

-- Create some article links (knowledge graph)
insert into kb_article_links (from_article_id, to_article_id, link_type, strength)
select 
  a1.id,
  a2.id,
  'related',
  0.8
from kb_articles a1
cross join kb_articles a2
where 
  a1.question = 'Where is my order?' and a2.question = 'When will my order arrive?' or
  a1.question = 'How do I cancel my order?' and a2.question = 'What is your return policy?' or
  a1.question = 'How do I return an item?' and a2.question = 'When will I get my refund?' or
  a1.question = 'My package says delivered but I didn''t receive it' and a2.question = 'Where is my order?';

-- Add comments
comment on table kb_articles is 'Seeded with 20 common customer support articles across 6 categories';

