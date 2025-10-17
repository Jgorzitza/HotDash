# Chatwoot Message Template Optimization for Agent SDK

**Purpose:** Optimize Chatwoot templates/macros for Agent SDK compatibility and agent customization  
**Date:** 2025-10-11  
**Status:** Production Ready

---

## Template Strategy for Agent SDK

### Agent SDK Template Variables

Templates should support dynamic variables that Agent SDK can populate:

```handlebars
{{agent.draft_confidence}}
- Confidence score (0-100)
{{agent.knowledge_sources}}
- Knowledge base articles used
{{agent.suggested_action}}
- Recommended operator action
{{customer.sentiment}}
- Detected customer sentiment
{{customer.urgency}}
- Urgency level (low/medium/high/urgent)
{{conversation.priority}}
- Assigned priority
{{order.number}}
- Order number (if detected)
{{order.status}}
- Order status (if available)
{{tracking.number}}
- Tracking number (if available)
```

---

## Optimized Templates by Category

### 1. Order Status Inquiries

**Template Name:** `order_status_with_tracking`

**Agent SDK Compatible Version:**

```
Hi {{contact.name}}!

I've looked up your order {{custom_attribute.order_number}}.

Status: {{custom_attribute.order_status}}
Shipped: {{custom_attribute.ship_date}} via {{custom_attribute.carrier}}
Tracking: {{custom_attribute.tracking_number}}
Expected Delivery: {{custom_attribute.delivery_date}}

Track your order here: {{custom_attribute.tracking_url}}

Let me know if you have any questions!

Best regards,
{{agent.name}}
HotDash Support
```

**Agent SDK Variables to Populate:**

```json
{
  "custom_attribute": {
    "order_number": "12345",
    "order_status": "Shipped",
    "ship_date": "October 8, 2025",
    "carrier": "USPS",
    "tracking_number": "9400111899562539876543",
    "delivery_date": "October 13, 2025",
    "tracking_url": "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899562539876543"
  }
}
```

---

### 2. Return Policy

**Template Name:** `return_policy_standard`

**Agent SDK Compatible Version:**

```
Hi {{contact.name}},

Our return policy allows 30-day returns for unworn items with original tags attached.

To initiate a return:
1. Log in at hotrodan.com
2. Navigate to Orders → Select your order
3. Click "Request Return"
4. Print the prepaid shipping label
5. Ship via USPS

Refunds are processed within 5-7 business days after we receive and inspect the item.

{{#if custom_attribute.order_number}}
Your order #{{custom_attribute.order_number}} is eligible for return until {{custom_attribute.return_deadline}}.
{{/if}}

Questions about the return process? Just ask!

Best,
{{agent.name}}
```

**Agent SDK Enhancement:**

- Detects order number from message
- Calculates return deadline automatically
- Conditionally includes order-specific details

---

### 3. General Inquiry Response

**Template Name:** `general_inquiry_knowledgebase`

**Agent SDK Compatible Version:**

```
Hi {{contact.name}},

{{agent.draft_response}}

{{#if agent.knowledge_sources}}
📚 Helpful Resources:
{{#each agent.knowledge_sources}}
- {{this.title}} ({{this.version}})
{{/each}}
{{/if}}

{{#if agent.draft_confidence < 70}}
⚠️ If this doesn't fully answer your question, I'll escalate to a specialist who can provide more detailed assistance.
{{/if}}

Is there anything else I can help you with?

Best regards,
{{agent.name}}
HotDash Support
```

**Agent SDK Features:**

- Uses AI-generated draft as main content
- Cites knowledge base sources
- Auto-escalates if low confidence
- Maintains consistent tone

---

### 4. Urgent/High-Priority Response

**Template Name:** `urgent_customer_response`

**Agent SDK Compatible Version:**

```
Hi {{contact.name}},

I understand your concern and I'm personally taking ownership of this issue.

{{agent.draft_response}}

I've marked this as HIGH PRIORITY and will:
- Monitor your case closely
- Update you within {{custom_attribute.next_update_time}}
- Escalate to management if needed

Case Reference: #{{conversation.id}}

{{#if custom_attribute.manager_assigned}}
Our manager, {{custom_attribute.manager_name}}, has been notified and is reviewing your case.
{{/if}}

We're committed to resolving this quickly and to your satisfaction.

Best regards,
{{agent.name}}
HotDash Support Team
```

**Agent SDK Triggers:**

- Angry sentiment detection
- Multiple contact attempts
- Legal threat keywords
- VIP customer status

---

### 5. Escalation Handoff

**Template Name:** `escalation_to_specialist`

**Agent SDK Compatible Version:**

```
Hi {{contact.name}},

I'm connecting you with {{custom_attribute.specialist_name}}, who specializes in {{custom_attribute.specialty_area}}.

They'll reach out within {{custom_attribute.response_time_hours}} hours with a detailed solution.

Case Details Shared:
- Original inquiry: {{custom_attribute.inquiry_summary}}
- Case number: #{{conversation.id}}
- Priority: {{conversation.priority}}

{{custom_attribute.specialist_name}} will have full context and can provide expert assistance.

Thank you for your patience!

Best,
{{agent.name}}
```

**Agent SDK Escalation Logic:**

- Detects when confidence < 70%
- Identifies specialist based on category
- Creates handoff note with context
- Sets appropriate priority

---

### 6. Follow-Up After Resolution

**Template Name:** `post_resolution_followup`

**Agent SDK Compatible Version:**

```
Hi {{contact.name}},

I'm following up on your recent inquiry about {{custom_attribute.inquiry_topic}}.

I hope our solution worked for you! If you're still experiencing any issues or have additional questions, please don't hesitate to reach out.

{{#if custom_attribute.csat_requested}}
We'd love your feedback! Please rate your experience:
{{custom_attribute.csat_survey_link}}
{{/if}}

Case Reference: #{{conversation.id}}
Resolved on: {{conversation.resolved_at}}

Thank you for choosing HotDash!

Best regards,
{{agent.name}}
```

---

## Template Variable Mapping

### Standard Chatwoot Variables

| Variable                  | Example                | Use Case              |
| ------------------------- | ---------------------- | --------------------- |
| `{{contact.name}}`        | "John Doe"             | Customer name         |
| `{{contact.email}}`       | "john@example.com"     | Customer email        |
| `{{contact.phone}}`       | "+1234567890"          | Customer phone        |
| `{{agent.name}}`          | "Support Agent"        | Current agent name    |
| `{{agent.email}}`         | "support@hotrodan.com" | Agent email           |
| `{{conversation.id}}`     | "123"                  | Case reference number |
| `{{conversation.status}}` | "open"                 | Conversation state    |

### Agent SDK Custom Variables

| Variable                               | Example              | Population Method        |
| -------------------------------------- | -------------------- | ------------------------ |
| `{{agent.draft_response}}`             | "Hi! I've looked..." | OpenAI generation        |
| `{{agent.draft_confidence}}`           | "85"                 | Confidence scoring       |
| `{{agent.knowledge_sources}}`          | "[{title: ...}]"     | LlamaIndex results       |
| `{{agent.suggested_action}}`           | "approve"            | Agent SDK recommendation |
| `{{customer.sentiment}}`               | "neutral"            | Sentiment analysis       |
| `{{customer.urgency}}`                 | "medium"             | Urgency detection        |
| `{{custom_attribute.order_number}}`    | "12345"              | Extracted from message   |
| `{{custom_attribute.order_status}}`    | "Shipped"            | API lookup               |
| `{{custom_attribute.tracking_number}}` | "940011..."          | API lookup               |

---

## Template Optimization Guidelines

### 1. Use Conditional Blocks

```handlebars
{{#if custom_attribute.order_number}}
  Your order #{{custom_attribute.order_number}}
  status:
  {{custom_attribute.order_status}}
{{else}}
  To look up your order, I'll need your order number or email used at checkout.
{{/if}}
```

### 2. Fallback Values

```handlebars
{{contact.name OR "there"}}
{{custom_attribute.delivery_date OR "soon"}}
{{custom_attribute.response_time_hours OR "24"}}
```

### 3. Tone Customization by Sentiment

```handlebars
{{#if customer.sentiment == "angry"}}
I sincerely apologize for the frustration. Let me personally ensure this is resolved immediately.
{{else if customer.sentiment == "confused"}}
I'm happy to help clarify! Let me explain step-by-step.
{{else}}
I'm here to help!
{{/if}}
```

### 4. Knowledge Source Citations

```handlebars
{{#if agent.knowledge_sources.length > 0}}

📚 For more details, see:
{{#each agent.knowledge_sources}}
- {{this.title}} ({{this.version}}): {{this.url}}
{{/each}}
{{/if}}
```

---

## Agent SDK Template Selection Logic

### Automatic Template Selection

```typescript
function selectTemplate(context: DraftContext): string {
  // Detect inquiry type
  const inquiryType = detectInquiryType(context.message);

  switch (inquiryType) {
    case "order_status":
      if (context.orderData) {
        return "order_status_with_tracking";
      }
      return "order_status_need_info";

    case "return_request":
      return "return_policy_standard";

    case "complaint":
      if (context.sentiment === "angry") {
        return "urgent_customer_response";
      }
      return "general_inquiry_knowledgebase";

    case "general_question":
      return "general_inquiry_knowledgebase";

    case "escalation_needed":
      return "escalation_to_specialist";

    default:
      return "general_inquiry_knowledgebase";
  }
}
```

### Template Personalization

```typescript
function personalize Template(template: string, context: DraftContext): string {
  return template
    .replace('{{agent.draft_response}}', context.draftResponse)
    .replace('{{agent.draft_confidence}}', String(context.confidence))
    .replace('{{agent.knowledge_sources}}', formatSources(context.sources))
    .replace('{{customer.sentiment}}', context.sentiment)
    .replace('{{customer.urgency}}', context.urgency);
}
```

---

## Template Testing

### Test Cases

**Test 1: Order Status with Complete Data**

```json
{
  "contact": { "name": "John Doe" },
  "custom_attribute": {
    "order_number": "12345",
    "order_status": "Shipped",
    "tracking_number": "9400111899562539876543"
  },
  "agent": {
    "draft_confidence": 92,
    "knowledge_sources": [{ "title": "Shipping Policy", "version": "2.1" }]
  }
}
```

**Expected:** Complete order status with tracking link

**Test 2: Order Status Missing Data**

```json
{
  "contact": { "name": "Jane Smith" },
  "custom_attribute": {},
  "agent": { "draft_confidence": 45 }
}
```

**Expected:** Request for order number, fallback to general help

**Test 3: Angry Customer**

```json
{
  "contact": { "name": "Angry Customer" },
  "customer": { "sentiment": "angry", "urgency": "urgent" },
  "agent": { "suggested_action": "escalate" }
}
```

**Expected:** Empathetic tone, manager escalation mentioned

---

## Template Performance Metrics

### Track Template Effectiveness

```sql
-- Template usage stats
SELECT
  template_name,
  COUNT(*) as usage_count,
  AVG(confidence_score) as avg_confidence,
  SUM(CASE WHEN operator_action = 'approve' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as approval_rate
FROM agent_sdk_approval_queue
WHERE template_name IS NOT NULL
GROUP BY template_name
ORDER BY usage_count DESC;

-- Customer satisfaction by template
SELECT
  a.template_name,
  AVG(l.customer_satisfaction_score) as avg_csat,
  COUNT(*) as total_uses
FROM agent_sdk_approval_queue a
JOIN agent_sdk_learning_data l ON l.queue_item_id = a.id
WHERE a.template_name IS NOT NULL
  AND l.customer_satisfaction_score IS NOT NULL
GROUP BY a.template_name
ORDER BY avg_csat DESC;
```

---

## Template Best Practices

### DO:

- ✅ Use clear, simple language
- ✅ Include specific order/product details when available
- ✅ Cite knowledge base sources
- ✅ Provide next steps
- ✅ Use consistent brand voice
- ✅ Include helpful links
- ✅ Personalize with customer name
- ✅ Offer additional help

### DON'T:

- ❌ Use jargon or technical terms
- ❌ Make promises you can't keep ("immediately", "definitely")
- ❌ Include placeholder text like "INSERT_HERE"
- ❌ Use all caps (except for emphasis)
- ❌ Send templates without customization
- ❌ Ignore detected sentiment
- ❌ Skip conditional logic for edge cases

---

## Template Maintenance

### Review Cadence

- **Weekly:** Check approval/edit rates by template
- **Monthly:** Update based on operator feedback
- **Quarterly:** Audit for brand voice consistency
- **After Major Changes:** Review and update affected templates

### Improvement Process

1. **Collect Metrics:**
   - Approval rate per template
   - Edit frequency per template
   - Customer satisfaction scores
   - Time to resolution

2. **Analyze Edits:**
   - What do operators change most often?
   - Common additions or removals?
   - Tone adjustments needed?

3. **A/B Test:**
   - Test two versions of template
   - Measure approval rate and CSAT
   - Roll out winner

4. **Update Template:**
   - Incorporate learnings
   - Test with sample data
   - Deploy to staging first
   - Monitor metrics

---

## Integration with Agent SDK

### Template Selection in Webhook Handler

```typescript
// In supabase/functions/chatwoot-webhook/index.ts

import { selectTemplate, personalizeTemplate } from './templates';

// After draft generation
const template = selectTemplate({
  inquiryType: draft.category,
  confidence: draft.confidence_score,
  sentiment: draft.sentiment,
  hasOrderData: !!draft.order_context
});

const personalizedResponse = personalizeTemplate(template, {
  draftResponse: draft.draft_response,
  confidence: draft.confidence_score,
  knowledge Sources: draft.sources,
  customAttributes: draft.extracted_data
});

// Create private note with personalized template
await chatwootClient.createPrivateNote(
  conversationId,
  personalizedResponse
);
```

---

## Template Library

### High-Confidence Responses (>85%)

**1. FAQ Responses**

```
Hi {{contact.name}},

Great question! {{agent.draft_response}}

{{#if agent.knowledge_sources}}
For more details, check out: {{agent.knowledge_sources[0].url}}
{{/if}}

Anything else I can help with?

Best,
{{agent.name}}
```

**2. Simple Confirmations**

```
Hi {{contact.name}},

{{agent.draft_response}}

All set! Let me know if you need anything else.

Best,
{{agent.name}}
```

### Medium-Confidence Responses (70-84%)

**3. Requires Verification**

```
Hi {{contact.name}},

{{agent.draft_response}}

To confirm I have the right information, could you verify:
{{custom_attribute.verification_questions}}

Once confirmed, I'll {{custom_attribute.next_action}}.

Best,
{{agent.name}}
```

**4. Partial Information**

```
Hi {{contact.name}},

Based on your message, {{agent.draft_response}}

For a complete answer, I'll need:
{{custom_attribute.missing_info}}

Reply with those details and I'll provide specific guidance!

Best,
{{agent.name}}
```

### Low-Confidence Responses (<70%)

**5. Escalation Needed**

```
Hi {{contact.name}},

Thank you for reaching out. Your situation requires specialized assistance.

I'm connecting you with {{custom_attribute.specialist_name}}, who has expertise in {{custom_attribute.specialty_area}}.

They'll reach out within {{custom_attribute.response_time}} hours with a personalized solution.

Case #{{conversation.id}} has been marked HIGH PRIORITY.

Best,
{{agent.name}}
```

---

## Template Customization Guide for Operators

### When to Edit Templates

**Edit Before Sending If:**

- Customer name is incorrect or missing
- Order details don't match customer's inquiry
- Tone doesn't match customer sentiment
- Missing critical information
- Knowledge base source is outdated
- Link is broken or incorrect

### How to Edit Efficiently

**Minor Edits (approve with edits):**

- Fix typos or grammar
- Update specific dates/numbers
- Add personalized greeting
- Include additional context

**Major Edits (reject and rewrite):**

- Template is completely wrong for situation
- Customer issue not addressed
- Tone is inappropriate
- Information is incorrect

---

## Template Variables Reference

### Contact Variables

```handlebars
{{contact.name}}
- Customer full name
{{contact.email}}
- Customer email
{{contact.phone}}
- Customer phone
{{contact.avatar}}
- Customer avatar URL
{{contact.id}}
- Contact ID
{{contact.identifier}}
- External identifier
```

### Conversation Variables

```handlebars
{{conversation.id}}
- Conversation ID
{{conversation.status}}
- open/pending/resolved
{{conversation.created_at}}
- Creation timestamp
{{conversation.priority}}
- low/normal/high/urgent
{{conversation.inbox}}
- Inbox name
{{conversation.assignee}}
- Assigned agent
```

### Agent Variables

```handlebars
{{agent.name}}
- Agent display name
{{agent.email}}
- Agent email
{{agent.signature}}
- Agent signature block
{{agent.avatar}}
- Agent avatar URL
```

### Agent SDK Variables (Custom)

```handlebars
{{agent.draft_response}}
- AI-generated response text
{{agent.draft_confidence}}
- Confidence score (0-100)
{{agent.knowledge_sources}}
- Array of knowledge articles
{{agent.suggested_action}}
- approve/edit/escalate
{{customer.sentiment}}
- happy/neutral/frustrated/angry
{{customer.urgency}}
- low/medium/high/urgent
```

### Custom Attributes (Order Data)

```handlebars
{{custom_attribute.order_number}}
{{custom_attribute.order_status}}
{{custom_attribute.ship_date}}
{{custom_attribute.delivery_date}}
{{custom_attribute.tracking_number}}
{{custom_attribute.tracking_url}}
{{custom_attribute.carrier}}
{{custom_attribute.return_deadline}}
{{custom_attribute.refund_amount}}
```

---

## Template Testing Checklist

### Before Deployment

- [ ] Test with all variable combinations
- [ ] Verify conditional logic works
- [ ] Check for spelling/grammar errors
- [ ] Validate links are correct
- [ ] Test with missing data (fallbacks)
- [ ] Review brand voice consistency
- [ ] Get operator approval
- [ ] Stage in test environment

### After Deployment

- [ ] Monitor approval rate (target >60%)
- [ ] Track edit frequency
- [ ] Collect operator feedback
- [ ] Measure customer satisfaction
- [ ] Identify common edits
- [ ] Iterate and improve

---

## Migration from Old Templates

### Audit Existing Templates

```bash
# List current canned responses
curl -H "api_access_token: $TOKEN" \
  https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/canned_responses | jq .
```

### Conversion Process

1. **Inventory:**
   - List all existing templates
   - Categorize by type (order, return, general, etc.)
   - Identify usage frequency

2. **Optimize:**
   - Add Agent SDK variables
   - Improve conditional logic
   - Enhance with knowledge base citations
   - Test with sample data

3. **Deploy:**
   - Create optimized versions
   - Run A/B test (old vs new)
   - Monitor metrics
   - Roll out winners

4. **Deprecate:**
   - Archive old templates
   - Update operator training
   - Document changes in runbook

---

## Template Categories

### By Customer Intent

1. **Transactional** (Order, Shipping, Returns)
   - Clear, factual information
   - Include specific details (order #, tracking)
   - Provide next steps

2. **Informational** (FAQs, Policies, How-To)
   - Cite knowledge base articles
   - Include links for more info
   - Offer follow-up help

3. **Problem-Solving** (Issues, Complaints, Bugs)
   - Empathetic tone
   - Acknowledge frustration
   - Provide timeline for resolution

4. **Proactive** (Follow-up, Satisfaction, Upsell)
   - Friendly, conversational
   - Ask for feedback
   - Suggest related products/services

---

## Analytics & Reporting

### Template Performance Dashboard

```sql
-- Top performing templates
SELECT
  template_name,
  COUNT(*) as uses,
  AVG(confidence_score) as avg_confidence,
  AVG(CASE WHEN operator_action = 'approve' THEN 100 ELSE 0 END) as approval_rate,
  AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 60) as avg_review_time_min
FROM agent_sdk_approval_queue
WHERE template_name IS NOT NULL
GROUP BY template_name
HAVING COUNT(*) >= 10
ORDER BY approval_rate DESC;
```

### Template Optimization Opportunities

```sql
-- Templates with low approval rate (need improvement)
SELECT
  template_name,
  COUNT(*) as total_uses,
  AVG(CASE WHEN operator_action = 'approve' THEN 100 ELSE 0 END) as approval_rate,
  ARRAY_AGG(DISTINCT operator_notes) as common_edits
FROM agent_sdk_approval_queue
WHERE template_name IS NOT NULL
  AND operator_action IN ('edit', 'reject')
GROUP BY template_name
HAVING AVG(CASE WHEN operator_action = 'approve' THEN 100 ELSE 0 END) < 60
ORDER BY total_uses DESC;
```

---

## Next Steps

1. **Deploy Templates to Staging:**
   - Create optimized templates in Chatwoot UI
   - Test with Agent SDK integration
   - Collect operator feedback

2. **Monitor Performance:**
   - Track approval rates
   - Identify improvement opportunities
   - Iterate based on data

3. **Operator Training:**
   - Document template usage
   - Train on variable customization
   - Share best practices

4. **Continuous Improvement:**
   - Weekly template reviews
   - A/B testing for optimization
   - Seasonal updates (holidays, sales)

---

**Document Status:** Production Ready  
**Last Updated:** 2025-10-11  
**Maintained By:** Chatwoot Agent  
**Review Cadence:** Monthly or after significant workflow changes
