---
epoch: 2025.10.E1
doc: docs/runbooks/support_gold_replies.md
owner: support
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Support Gold Replies — Approval & Storage Runbook

## Purpose

Define the approval workflow and storage schema for curating high-quality support reply templates based on successful operator responses in Chatwoot. Gold replies serve as training data for AI suggestions and template library expansion.

**Support Inbox:** customer.support@hotrodan.com — route approval requests and quality reviews through this address.

## Canonical References

- `docs/directions/support.md` — current sprint focus and gold reply workflow requirements
- `docs/data/data_contracts.md` — Supabase schema definitions and JSON structures
- `app/routes/actions/chatwoot.escalate.ts` — current approval workflow implementation
- `app/services/chatwoot/escalations.ts` — template selection and rendering logic
- `docs/runbooks/cx_escalations.md` — operator workflow for reply approval

---

## Gold Reply Schema Definition

### Supabase Table: `gold_replies`

**Proposed Schema** (to be coordinated with Data team):

```sql
CREATE TABLE gold_replies (
  id SERIAL PRIMARY KEY,
  shop_domain VARCHAR(255) NOT NULL,
  conversation_id INTEGER NOT NULL,
  original_reply TEXT NOT NULL,
  sanitized_reply TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  customer_issue_summary TEXT,
  approval_status VARCHAR(20) DEFAULT 'pending',
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  usage_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  evidence_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  INDEX idx_gold_replies_shop_domain (shop_domain),
  INDEX idx_gold_replies_category (category),
  INDEX idx_gold_replies_status (approval_status),
  INDEX idx_gold_replies_created_at (created_at)
);
```

### JSON Metadata Structure

**Standard metadata payload**:

```json
{
  "sourceTemplate": "ack_delay",
  "customerContext": {
    "issueType": "shipping_delay",
    "orderValue": 125.5,
    "customerTier": "regular"
  },
  "replyMetrics": {
    "responseTimeMinutes": 12,
    "customerSatisfactionScore": 5,
    "followUpRequired": false
  },
  "sanitizationChanges": [
    {
      "field": "customerName",
      "original": "John Doe",
      "sanitized": "{{customerName}}"
    },
    {
      "field": "orderNumber",
      "original": "PWA-4092",
      "sanitized": "{{orderNumber}}"
    }
  ],
  "reviewedAt": "2025-10-11T12:00:00Z",
  "reviewedBy": "support@hotrodan.com"
}
```

---

## Approval Workflow Process

### 1. Identification Phase

**Trigger Events:**

- Operator approves reply via CX Escalations modal (`chatwoot.approve_send` action)
- Customer responds positively within 24 hours of reply
- Quality metrics exceed threshold (response time < 30 min, no follow-up escalation)

**Auto-flagging Criteria:**

```typescript
interface GoldReplyCandidate {
  conversationId: number;
  replyBody: string;
  customerResponseTime: number; // minutes until customer reply
  customerSentiment: "positive" | "neutral" | "negative";
  noEscalationWithin24h: boolean;
  operatorNote?: string;
}
```

### 2. Content Sanitization

**Required Sanitization Steps:**

1. **PII Removal**: Replace customer names, emails, phone numbers with template variables
2. **Order Data**: Replace order numbers, SKUs, amounts with generic placeholders
3. **Company Data**: Replace internal references, agent names, system IDs
4. **Standardization**: Normalize greeting/closing patterns, fix typos

**Sanitization Examples:**

```markdown
**Original**: "Hi John, I see your order PWA-4092 for $125.50 is delayed. Let me check with our UPS contact immediately."

**Sanitized**: "Hi {{customerName}}, I see your order {{orderNumber}} for {{orderAmount}} is delayed. Let me check with our carrier contact immediately."
```

### 3. Quality Review Checklist

**Approval Criteria** (all must be met):

- [ ] **Tone**: Professional, empathetic, solution-oriented
- [ ] **Clarity**: Easy to understand, no jargon or ambiguous language
- [ ] **Actionability**: Clear next steps or timeline provided to customer
- [ ] **Completeness**: Addresses customer's specific concern fully
- [ ] **Template-ready**: Variables properly substituted, reusable structure

**Quality Scoring** (1-5 scale):

- **5 (Excellent)**: Perfect template, immediate reuse recommended
- **4 (Good)**: Minor tweaks needed, approved with notes
- **3 (Fair)**: Moderate revision required before approval
- **2 (Poor)**: Significant issues, reject with feedback
- **1 (Unacceptable)**: Does not meet quality standards

### 4. Category Classification

**Standard Categories:**

- `shipping_delay` — Delivery timeline issues, tracking problems
- `product_inquiry` — Size, specifications, availability questions
- `return_refund` — Return process, refund requests, exchanges
- `order_modification` — Address changes, order updates, cancellations
- `technical_support` — Website issues, account problems, app troubleshooting
- `general_inquiry` — Miscellaneous questions, company policies

**Tagging System:**

- Primary tag: Category (required)
- Secondary tags: `urgent`, `high_value_customer`, `complex_issue`, `ai_ready`, `requires_followup`

---

## Webhook Integration

### Submission Endpoint

**Webhook URL**: `POST /api/webhooks/gold-replies`
**Authentication**: Bearer token (shared with Integrations-Chatwoot team)

**Request Payload**:

```json
{
  "conversationId": 12345,
  "shopDomain": "example.myshopify.com",
  "originalReply": "Hi John, I see your order PWA-4092...",
  "category": "shipping_delay",
  "customerContext": {
    "issueType": "shipping_delay",
    "orderValue": 125.5
  },
  "qualityMetrics": {
    "responseTimeMinutes": 12,
    "customerSatisfactionScore": 5
  },
  "submittedBy": "operator@hotrodan.com",
  "evidenceUrl": "https://chatwoot.com/conversations/12345"
}
```

**Response Format**:

```json
{
  "success": true,
  "goldReplyId": 789,
  "status": "pending_review",
  "message": "Gold reply submitted for review",
  "reviewUrl": "https://hotdash-staging.fly.dev/admin/gold-replies/789"
}
```

### Error Handling

**Common Error Responses:**

- `400 Bad Request`: Missing required fields or invalid payload
- `401 Unauthorized`: Invalid or missing bearer token
- `409 Conflict`: Gold reply already exists for this conversation
- `500 Internal Server Error`: Database or processing error

**Retry Logic**:

- 3 retry attempts with exponential backoff
- Log failures to `feedback/integrations.md`
- Escalate persistent failures to manager within 2 hours

---

## Sample Approved Gold Reply

### Example Entry

**Category**: `shipping_delay`
**Quality Score**: 5
**Original Reply**: "Hi Sarah, thanks for reaching out about your order PWA-4098. I can see it's been sitting with our carrier for 2 days. I've just escalated this with UPS and they've promised an update within 3 hours. I'll email you directly once I hear back with a concrete delivery timeline. Thanks for your patience!"

**Sanitized Reply**: "Hi {{customerName}}, thanks for reaching out about your order {{orderNumber}}. I can see it's been sitting with our carrier for {{delayDays}} days. I've just escalated this with {{carrierName}} and they've promised an update within {{followUpHours}} hours. I'll email you directly once I hear back with a concrete delivery timeline. Thanks for your patience!"

**Template Variables**:

- `{{customerName}}` — Customer's first name or "there"
- `{{orderNumber}}` — Order reference number
- `{{delayDays}}` — Number of days delayed
- `{{carrierName}}` — Shipping carrier name
- `{{followUpHours}}` — Response timeline commitment

**Usage Notes**:

- Best for shipping delays > 48 hours
- Use when carrier relationship allows direct escalation
- Follow up required within promised timeframe
- Customer satisfaction: 95% positive response rate

---

## Administration & Maintenance

### Weekly Review Process

**Every Monday at 10:00 AM ET:**

1. Review pending gold replies in Supabase admin dashboard
2. Process quality scores and approval decisions
3. Update template library with newly approved replies
4. Archive low-usage gold replies (< 5 uses in 90 days)
5. Log review statistics in `feedback/support.md`

### Quality Metrics Tracking

**Monthly KPIs:**

- Gold reply submission rate (target: 5-10 per week)
- Approval rate (target: 70-80% approved)
- Template adoption rate (target: 80% of gold replies used in production)
- Customer satisfaction correlation (track before/after metrics)

### Feedback Loop Integration

**Data Sources:**

- Chatwoot conversation analytics (response times, customer ratings)
- DecisionLog analysis (`chatwoot.approve_send` patterns)
- Operator feedback surveys and training session Q&A
- Customer satisfaction scores from follow-up emails

**Continuous Improvement:**

- Monthly template effectiveness review with AI team
- Quarterly sanitization process audit
- Semi-annual category taxonomy refresh based on support trends

---

## Integration Dependencies

**Data Team Coordination:**

- [ ] Create `gold_replies` table in Supabase staging
- [ ] Implement webhook endpoint with authentication
- [ ] Set up admin dashboard for review workflow
- [ ] Create analytics queries for quality tracking

**Integrations-Chatwoot Team:**

- [ ] Expose webhook endpoint for submission
- [ ] Configure bearer token authentication
- [ ] Implement retry logic for failed submissions
- [ ] Test end-to-end gold reply submission flow

**AI Team Integration:**

- [ ] Connect gold replies to LlamaIndex training pipeline
- [ ] Update suggestion algorithm to incorporate approved templates
- [ ] Create feedback loop for AI suggestion quality scoring

---

## Troubleshooting

### Common Issues

**Gold reply not appearing in webhook:**

1. Check DecisionLog for corresponding `chatwoot.approve_send` entry
2. Verify conversation meets auto-flagging criteria
3. Confirm webhook endpoint is reachable and authenticated
4. Review Chatwoot integration logs for submission errors

**Quality review bottleneck:**

1. Check pending queue in Supabase admin dashboard
2. Ensure weekly review process is being followed
3. Consider expanding reviewer pool if volume exceeds capacity
4. Escalate resource needs to manager if SLA breached

**Template adoption issues:**

1. Review gold reply category distribution vs actual support volume
2. Validate template variables are properly substituting
3. Survey operators on template usability and clarity
4. Update sanitization process if templates lack flexibility

---

## Related Documentation

- Template library: `app/services/chatwoot/templates.ts`
- Decision logging: `app/services/decisions.server.ts`
- Webhook implementation: `app/routes/api/webhooks/gold-replies.ts` (to be created)
- Admin dashboard: `app/routes/admin/gold-replies.tsx` (to be created)
- Analytics queries: `docs/data/gold_reply_analytics.sql` (to be created)

---

## Change Log

| Date       | Author  | Change                                               |
| ---------- | ------- | ---------------------------------------------------- |
| 2025-10-11 | support | Initial runbook created per sprint task requirements |

---

## Next Steps

- [ ] Coordinate with Data team on Supabase schema implementation
- [ ] Partner with Integrations-Chatwoot on webhook endpoint development
- [ ] Create sample webhook payload for testing
- [ ] Draft operator training materials for gold reply submission workflow
- [ ] Set up weekly review process and assign reviewers

## Validation Dependencies

- [ ] Schema approved by Data team and deployed to staging
- [ ] Webhook endpoint tested with sample payloads
- [ ] Admin dashboard available for review workflow
- [ ] Integration testing completed with Chatwoot submission flow
- [ ] Operator training completed and feedback incorporated
