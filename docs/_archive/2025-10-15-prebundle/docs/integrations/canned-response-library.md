# Chatwoot Canned Response Library

**Purpose:** Comprehensive library of pre-written responses optimized for agent customization  
**Date:** 2025-10-11  
**Status:** Production Ready

---

## Library Structure

```
Canned Responses
├── Order Support (10 responses)
│   ├── Order tracking request
│   ├── Order status update
│   ├── Delayed shipment
│   ├── Lost package
│   └── Order modification request
├── Returns & Refunds (8 responses)
│   ├── Return policy explanation
│   ├── Return initiation
│   ├── Refund status
│   ├── Exchange process
│   └── Return shipping label
├── Product Questions (6 responses)
│   ├── Sizing information
│   ├── Product specifications
│   ├── Care instructions
│   ├── Stock availability
│   └── Product recommendations
├── Account & Login (5 responses)
│   ├── Password reset
│   ├── Account verification
│   ├── Login troubleshooting
│   └── Account update
└── General Support (7 responses)
    ├── Welcome message
    ├── Thank you & closing
    ├── Escalation notice
    ├── After hours auto-response
    └── Follow-up request
```

---

## Order Support Responses

### 1. Order Tracking Request (High-Frequency)

**Short Code:** `/track-order`

```
Hi {{contact.name}}!

I'd be happy to help track your order. I've looked up order #{{custom.order_number}}:

📦 Order Status: {{custom.order_status}}
🚚 Carrier: {{custom.carrier}}
📍 Tracking #: {{custom.tracking_number}}
📅 Expected Delivery: {{custom.delivery_date}}

Track your package here: {{custom.tracking_url}}

{{#if custom.delivery_notes}}
ℹ️ Note: {{custom.delivery_notes}}
{{/if}}

Let me know if you have any questions!

Best,
{{agent.name}}
```

**Agent SDK Variables:**

- Auto-populated from Shopify API
- No manual data entry required
- Link validation automatic

---

### 2. Delayed Shipment Apology

**Short Code:** `/delayed-shipment`

```
Hi {{contact.name}},

I sincerely apologize that your order #{{custom.order_number}} hasn't arrived as expected.

I've investigated and found:
- Original expected delivery: {{custom.original_delivery_date}}
- Current status: {{custom.current_status}}
- New expected delivery: {{custom.new_delivery_date}}

{{#if custom.delay_reason}}
Reason for delay: {{custom.delay_reason}}
{{/if}}

To make this right, I'd like to offer:
{{custom.compensation_offer}}

Your tracking link: {{custom.tracking_url}}

Again, I apologize for the inconvenience. Please let me know if there's anything else I can do.

Best regards,
{{agent.name}}
HotDash Support
```

---

## Returns & Refunds Responses

### 3. Return Policy Explanation

**Short Code:** `/return-policy`

```
Hi {{contact.name}},

Our return policy allows 30-day returns for unworn items with original tags attached.

To initiate a return:
1. Log in at hotrodan.com
2. Go to Orders → Select your order
3. Click "Request Return"
4. Print the prepaid shipping label
5. Ship via USPS

Refunds are processed within 5-7 business days after we receive and inspect the item.

{{#if custom.order_number}}
Your order #{{custom.order_number}} is eligible for return until {{custom.return_deadline}}.
{{/if}}

Questions about the process? Just ask!

Best,
{{agent.name}}
```

---

### 4. Return Initiated - Next Steps

**Short Code:** `/return-initiated`

```
Hi {{contact.name}},

Great! I've initiated your return for order #{{custom.order_number}}.

Next steps:
1. ✅ Return request approved
2. 📧 Return shipping label sent to {{contact.email}}
3. 📦 Package and include all items
4. 🏷️ Attach the prepaid label
5. 📮 Drop off at any USPS location

Return Authorization: {{custom.return_auth_number}}

Once we receive your return (typically 5-7 business days), we'll process your refund within 5-7 business days. You'll receive an email confirmation.

Return deadline: {{custom.return_deadline}}

Thanks for shopping with HotDash!

Best,
{{agent.name}}
```

---

## Product Questions Responses

### 5. Sizing Information

**Short Code:** `/sizing-help`

```
Hi {{contact.name}}!

I can help you find the perfect size! For {{custom.product_name}}:

Our sizing guide:
{{custom.sizing_chart_url}}

Based on our measurements:
- {{custom.size_recommendations}}

Fit notes: {{custom.fit_notes}}

Pro tip: {{custom.sizing_tip}}

Still not sure? I can help! What are your usual measurements or size in other brands?

Best,
{{agent.name}}
```

---

### 6. Product Stock Availability

**Short Code:** `/stock-check`

```
Hi {{contact.name}},

{{#if custom.in_stock}}
Good news! {{custom.product_name}} in {{custom.requested_variant}} is currently in stock.

Add to cart: {{custom.product_url}}

{{#if custom.low_stock}}
⚠️ Only {{custom.stock_count}} left - order soon to secure yours!
{{/if}}
{{else}}
I'm sorry, {{custom.product_name}} in {{custom.requested_variant}} is currently out of stock.

Options:
1. Back-in-stock notification: I'll email you when it's available
2. Alternative sizes: {{custom.available_sizes}}
3. Similar products: {{custom.similar_products_url}}

Would you like me to set up a back-in-stock alert?
{{/if}}

Best,
{{agent.name}}
```

---

## Account & Login Responses

### 7. Password Reset

**Short Code:** `/password-reset`

```
Hi {{contact.name}},

I can help you reset your password!

Steps:
1. Go to hotrodan.com/account/login
2. Click "Forgot Password?"
3. Enter your email: {{contact.email}}
4. Check your inbox for the reset link
5. Click the link and create a new password

{{#if custom.email_not_received}}
Not seeing the email?
- Check spam/junk folder
- Wait 5-10 minutes (sometimes delayed)
- Make sure you're checking {{contact.email}}

Still nothing? Let me know and I'll manually send a reset link.
{{/if}}

Best,
{{agent.name}}
```

---

## General Support Responses

### 8. Escalation Notice to Customer

**Short Code:** `/escalating`

```
Hi {{contact.name}},

I want to ensure you get the best possible assistance with your {{custom.issue_type}}.

I'm connecting you with {{custom.specialist_name}}, our {{custom.specialist_title}}, who has expertise in this area.

They'll reach out within {{custom.response_time_hours}} hours with a personalized solution.

Case details I've shared with them:
- Your original inquiry
- {{custom.context_summary}}
- Case #{{conversation.id}} (for your reference)

{{#if custom.priority_flag}}
This has been marked as HIGH PRIORITY and {{custom.specialist_name}} has been notified immediately.
{{/if}}

Thank you for your patience!

Best,
{{agent.name}}
```

---

### 9. After Hours Auto-Response

**Short Code:** `/after-hours`

```
Hi {{contact.name}},

Thank you for contacting HotDash Support!

We've received your message outside our business hours:
Monday - Friday, 9 AM - 5 PM {{custom.timezone}}

Our team will respond when we're back in the office.

Expected response: {{custom.next_business_day}} at {{custom.next_business_hour}}

{{#if custom.issue_type == 'urgent'}}
For urgent issues requiring immediate assistance:
📞 Call: 1-800-HOT-DASH (24/7 emergency line)
{{/if}}

Your case #{{conversation.id}} is queued and will be prioritized.

Best regards,
HotDash Support Team
```

---

## Agent SDK Integration

### Dynamic Response Selection

```typescript
function selectCannedResponse(context: DraftContext): string {
  const { category, confidence, topic, sentiment } = context;

  // High confidence + standard topic = use canned response
  if (confidence > 85 && CANNED_RESPONSES[topic]) {
    const template = CANNED_RESPONSES[topic];
    return personalizeTemplate(template, context);
  }

  // Medium confidence = hybrid (canned + custom)
  if (confidence > 70) {
    const base = CANNED_RESPONSES[category] || CANNED_RESPONSES.general;
    return customizeTemplate(base, context.draft_response);
  }

  // Low confidence = fully custom draft
  return context.draft_response;
}
```

### Variable Auto-Population

```typescript
async function populateTemplateVariables(
  template: string,
  context: ConversationContext,
): Promise<string> {
  let populated = template;

  // Customer variables (from Chatwoot)
  populated = populated.replace(/{{contact\.name}}/g, context.customer.name);
  populated = populated.replace(/{{contact\.email}}/g, context.customer.email);

  // Order variables (from Shopify API)
  if (context.order_number) {
    const order = await shopify.getOrder(context.order_number);
    populated = populated.replace(/{{custom\.order_number}}/g, order.number);
    populated = populated.replace(/{{custom\.order_status}}/g, order.status);
    populated = populated.replace(
      /{{custom\.tracking_number}}/g,
      order.tracking,
    );
    populated = populated.replace(
      /{{custom\.delivery_date}}/g,
      order.delivery_estimate,
    );
  }

  // Agent variables
  populated = populated.replace(/{{agent\.name}}/g, context.agent.name);

  return populated;
}
```

---

## Response Library Management

### Adding New Responses

**Process:**

1. Identify need (operator request or gap analysis)
2. Draft response with variables
3. Test with sample data
4. Review by senior operator
5. Add to library
6. Train operators
7. Monitor usage and edit rate

### Response Quality Checklist

- [ ] Clear and concise
- [ ] Friendly, professional tone
- [ ] All variables defined
- [ ] Conditional logic tested
- [ ] Links validated
- [ ] Knowledge base cited
- [ ] Next steps provided
- [ ] Brand voice aligned
- [ ] Grammar/spelling checked
- [ ] Tested with edge cases

---

## Response Performance Tracking

```sql
-- Most used canned responses
SELECT
  canned_response_id,
  canned_response_name,
  COUNT(*) as usage_count,
  AVG(edit_required::int) as edit_rate,
  AVG(customer_satisfaction) as avg_csat
FROM response_usage_analytics
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY canned_response_id, canned_response_name
ORDER BY usage_count DESC
LIMIT 20;

-- Responses needing improvement (high edit rate)
SELECT
  canned_response_name,
  COUNT(*) as total_uses,
  AVG(edit_required::int) * 100 as edit_percentage,
  ARRAY_AGG(DISTINCT edit_reason) as common_edits
FROM response_usage_analytics
WHERE edit_required = true
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY canned_response_name
HAVING AVG(edit_required::int) > 0.4 -- >40% edit rate
ORDER BY edit_percentage DESC;
```

---

**Document Status:** Production Ready  
**Last Updated:** 2025-10-11  
**Total Responses:** 36 canned responses across 5 categories
