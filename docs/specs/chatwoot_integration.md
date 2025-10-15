# Chatwoot Integration Specification

**Version:** 1.0  
**Date:** 2025-10-15  
**Owner:** support  
**Status:** Draft

---

## 1. Overview

This specification defines the integration between HotDash and Chatwoot for customer support operations, including triage rules, AI-assisted responses, and HITL (Human-in-the-Loop) workflows.

### Purpose

Enable efficient customer support through:
- Multi-channel support (Email, Live Chat, SMS via Twilio)
- AI-powered draft responses with human approval
- Intelligent triage and escalation
- Quality tracking and learning

### Scope

**In Scope:**
- Chatwoot webhook integration
- Triage rules (AI vs human escalation)
- AI draft generation via Private Notes
- HITL approval workflow
- Grading and learning pipeline
- SLA tracking

**Out of Scope:**
- Chatwoot installation/hosting (assumed operational)
- Custom Chatwoot UI modifications
- Social media channel integration (separate spec)

---

## 2. Architecture

### System Components

```
┌─────────────────┐
│   Chatwoot      │
│  (Multi-channel)│
└────────┬────────┘
         │ Webhooks
         ▼
┌─────────────────┐
│   HotDash       │
│  Agent Service  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│  RAG   │ │ Shopify  │
│  KB    │ │  Admin   │
└────────┘ └──────────┘
```

### Data Flow

1. **Incoming Message** → Chatwoot receives message (email/chat/SMS)
2. **Webhook** → Chatwoot sends webhook to HotDash
3. **Triage** → Support agent categorizes and routes
4. **AI Draft** → ai-customer generates response as Private Note
5. **Human Review** → Operator reviews, edits, grades
6. **Send** → Approved response sent as public reply
7. **Learn** → Edits and grades stored for improvement

---

## 3. Triage Rules

### Priority Classification

| Priority | Criteria | SLA Target | Route To |
|----------|----------|------------|----------|
| **P0 - Critical** | Payment failures, order errors, security issues | 15 min | Human immediately |
| **P1 - High** | Shipping delays, damaged products, urgent returns | 1 hour | AI draft → Human review |
| **P2 - Normal** | General questions, order status, product info | 4 hours | AI draft → Human review |
| **P3 - Low** | Marketing inquiries, feedback, suggestions | 24 hours | AI draft → Human review |

### Auto-Escalation Triggers

**Escalate to Human Immediately if:**
- Message contains keywords: "urgent", "emergency", "lawyer", "lawsuit", "fraud"
- Customer has >2 unresolved conversations
- Previous AI response was graded <3.0
- Order value >$500
- Message mentions refund >$100
- Sentiment analysis shows high anger/frustration

**Route to AI Draft if:**
- Question matches KB topics (shipping, returns, product specs)
- Customer has good history (no disputes)
- Standard inquiry type
- Confidence score >0.7 from RAG

---

## 4. AI-Assisted Response Workflow

### Step 1: Message Analysis

When new message arrives:
1. Extract customer context (order history, previous conversations)
2. Query RAG for relevant KB articles
3. Check Shopify for order/product data
4. Calculate confidence score

### Step 2: Draft Generation

AI generates response including:
- **Answer** - Based on KB and order data
- **Tone** - Empathetic, professional, brand-aligned
- **Evidence** - Citations from KB, order details
- **Confidence** - Score 0-1 indicating certainty
- **Suggested Actions** - If applicable (refund, exchange, etc.)

Draft posted as **Private Note** in Chatwoot with:
```
🤖 AI Draft (Confidence: 0.85)

[Generated response text]

---
📚 Sources:
- KB: shipping-policy.md
- Order: #12345

⚠️ Review before sending
```

### Step 3: Human Review (HITL)

Operator reviews draft in Chatwoot:
- ✅ **Approve** - Send as-is
- ✏️ **Edit & Approve** - Modify then send
- ❌ **Reject** - Write custom response
- 🔼 **Escalate** - Route to senior support

### Step 4: Grading

After sending, operator grades the AI draft (1-5 scale):
- **Tone** - Empathy, professionalism, brand voice
- **Accuracy** - Factual correctness, policy compliance
- **Policy** - Adherence to company policies

Grades stored in Supabase for learning.

---

## 5. Channel-Specific Handling

### Email
- **Response Time:** Within SLA by priority
- **Format:** Full formatted responses with signature
- **Attachments:** Support images, PDFs, return labels

### Live Chat
- **Response Time:** Real-time during business hours
- **Format:** Shorter, conversational responses
- **Typing Indicators:** Show when AI is drafting

### SMS (Twilio)
- **Response Time:** Within 15 minutes
- **Format:** Concise, <160 chars when possible
- **Links:** Use short URLs for tracking/returns

---

## 6. SLA Targets

### Response Time SLA

| Priority | First Response | Resolution Target |
|----------|----------------|-------------------|
| P0 - Critical | 15 minutes | 2 hours |
| P1 - High | 1 hour | 8 hours |
| P2 - Normal | 4 hours | 24 hours |
| P3 - Low | 24 hours | 72 hours |

**Business Hours:** Monday-Friday, 9AM-5PM EST

**After Hours:**
- Auto-reply with expected response time
- P0/P1 alerts sent to on-call operator
- AI drafts prepared for morning review

### Quality SLA

| Metric | Target |
|--------|--------|
| AI draft rate | ≥90% of P2/P3 conversations |
| Average tone grade | ≥4.5/5 |
| Average accuracy grade | ≥4.7/5 |
| Average policy grade | ≥4.8/5 |
| Median approval time | ≤15 minutes |
| Customer satisfaction (CSAT) | ≥4.5/5 |

---

## 7. Webhook Integration

### Chatwoot Webhooks

Subscribe to events:
- `conversation_created`
- `message_created`
- `conversation_status_changed`
- `conversation_updated`

### Webhook Payload Example

```json
{
  "event": "message_created",
  "id": "12345",
  "conversation": {
    "id": 789,
    "inbox_id": 1,
    "status": "open",
    "priority": "normal",
    "custom_attributes": {
      "order_number": "12345",
      "customer_email": "customer@example.com"
    }
  },
  "message": {
    "id": 456,
    "content": "Where is my order?",
    "message_type": "incoming",
    "created_at": "2025-10-15T10:00:00Z",
    "sender": {
      "id": 123,
      "name": "John Doe",
      "email": "customer@example.com"
    }
  }
}
```

### HotDash Endpoint

```
POST /api/webhooks/chatwoot
```

**Authentication:** Webhook secret verification

**Response:**
```json
{
  "ok": true,
  "processed": true,
  "draft_created": true,
  "conversation_id": 789
}
```

---

## 8. Data Storage (Supabase)

### Tables

**chatwoot_conversations**
- `id` - UUID
- `chatwoot_conversation_id` - Integer
- `customer_email` - Text
- `priority` - Enum (P0, P1, P2, P3)
- `status` - Enum (open, pending, resolved)
- `assigned_to` - Text (human or ai-customer)
- `created_at` - Timestamp
- `resolved_at` - Timestamp

**chatwoot_messages**
- `id` - UUID
- `conversation_id` - UUID (FK)
- `chatwoot_message_id` - Integer
- `message_type` - Enum (incoming, outgoing, private_note)
- `content` - Text
- `ai_generated` - Boolean
- `confidence_score` - Float
- `created_at` - Timestamp

**support_approvals**
- `id` - UUID
- `message_id` - UUID (FK)
- `draft_content` - Text
- `final_content` - Text
- `edit_distance` - Integer
- `tone_grade` - Integer (1-5)
- `accuracy_grade` - Integer (1-5)
- `policy_grade` - Integer (1-5)
- `approved_by` - Text
- `approved_at` - Timestamp

---

## 9. Failure Modes & Fallbacks

### RAG Service Down
- **Fallback:** Use cached KB articles
- **Action:** Log error, alert DevOps
- **User Impact:** Slightly lower quality drafts

### Chatwoot Webhook Failure
- **Fallback:** Poll Chatwoot API every 5 minutes
- **Action:** Log error, retry webhook registration
- **User Impact:** Delayed response (up to 5 min)

### AI Service Timeout
- **Fallback:** Skip AI draft, route to human
- **Action:** Log timeout, check service health
- **User Impact:** Human writes full response

### Approval Timeout (>30 min)
- **Action:** Send notification to operator
- **Escalation:** Alert manager after 1 hour
- **User Impact:** SLA breach warning

---

## 10. Success Metrics

### Operational Metrics
- Conversations handled per day
- AI draft acceptance rate
- Average approval time
- SLA compliance rate
- Escalation rate

### Quality Metrics
- Average grades (tone/accuracy/policy)
- Customer satisfaction (CSAT)
- First contact resolution rate
- Response time by priority

### Learning Metrics
- Edit distance trends (should decrease)
- Confidence score accuracy
- KB article usage frequency
- Common question patterns

---

## 11. Implementation Phases

### Phase 1: Foundation (M2)
- [ ] Chatwoot webhook endpoint
- [ ] Basic triage rules
- [ ] Manual response workflow
- [ ] Data storage setup

### Phase 2: AI Drafts (M3)
- [ ] RAG integration
- [ ] AI draft generation
- [ ] Private Note posting
- [ ] Confidence scoring

### Phase 3: HITL & Grading (M4)
- [ ] Approval workflow
- [ ] Grading interface
- [ ] Edit tracking
- [ ] Learning pipeline

### Phase 4: Optimization (M5)
- [ ] Auto-escalation refinement
- [ ] SLA monitoring
- [ ] Quality dashboards
- [ ] Continuous learning

---

## 12. Security & Compliance

### Data Protection
- Customer PII encrypted at rest
- Webhook secrets rotated every 90 days
- Access logs for all conversations
- GDPR-compliant data retention (90 days)

### Access Control
- Role-based access (operator, manager, admin)
- Audit trail for all approvals
- No AI access to payment data
- Secure credential storage (GitHub Secrets)

---

## 13. Open Questions

1. **Chatwoot Instance:** Self-hosted or cloud? URL and credentials?
2. **Twilio Integration:** Existing account or new setup?
3. **Business Hours:** Confirm 9AM-5PM EST Monday-Friday?
4. **On-Call Rotation:** Who handles P0/P1 after hours?
5. **CSAT Collection:** Chatwoot built-in or custom?

---

## 14. References

- **North Star:** `docs/NORTH_STAR.md`
- **Operating Model:** `docs/OPERATING_MODEL.md`
- **Approvals Spec:** `docs/specs/approvals_drawer_spec.md`
- **Chatwoot API:** https://www.chatwoot.com/developers/api
- **KB Content:** `data/support/`

---

**Next Steps:**
1. Review and approve this spec
2. Resolve open questions
3. Build RAG index from KB content
4. Implement Phase 1 (Foundation)
5. Test with sample conversations

