# Chatwoot Conversation Lifecycle - Complete Flow Documentation

**Purpose:** Map complete conversation lifecycle for Agent SDK integration  
**Date:** 2025-10-11  
**Status:** Production Ready

---

## Conversation States & Transitions

### State Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONVERSATION LIFECYCLE                      │
└─────────────────────────────────────────────────────────────────┘

    [Customer Sends Message]
            ↓
    ┌───────────────┐
    │  CONVERSATION │
    │    CREATED    │
    │  status: open │
    └───────┬───────┘
            │
            ├──→ [Webhook Fired: message_created]
            │         ↓
            │    Agent SDK Receives Event
            │         ↓
            │    Query LlamaIndex
            │         ↓
            │    Generate Draft Response
            │         ↓
            │    Create PRIVATE NOTE in Chatwoot
            │         ↓
            │    Insert into approval_queue
            │         ↓
            │    Notify Operators (Real-time)
            │
            ↓
    ┌───────────────┐
    │   AWAITING    │
    │   OPERATOR    │
    │   REVIEW      │
    └───────┬───────┘
            │
            ├──────────────────────────────────────┐
            │                                       │
    [Operator Approves]                   [Operator Edits]
            │                                       │
            ↓                                       ↓
    ┌───────────────┐                     ┌───────────────┐
    │ Send Draft as │                     │  Send Edited  │
    │ Public Reply  │                     │    Version    │
    └───────┬───────┘                     └───────┬───────┘
            │                                       │
            ├───────────────────────────────────────┤
            │
            ↓
    ┌───────────────┐
    │  REPLY SENT   │
    │ status: open  │
    └───────┬───────┘
            │
            ├──→ [Add Label: agent_sdk_approved/edited]
            │
            ├──→ [Update Queue Status: approved]
            │
            ├──→ [Log to Learning Data]
            │
            ↓
    ┌───────────────────────────────────────────┐
    │  Wait for Customer Response               │
    │  - Auto-set to 'pending' after 24h        │
    │  - Agent can manually set to 'pending'    │
    └───────┬───────────────────────────────────┘
            │
            ├──→ [Customer Replies] → Loop back to "CONVERSATION CREATED"
            │
            ├──→ [No Reply + Issue Resolved] → Set to 'resolved'
            │
            ↓
    ┌───────────────┐
    │   RESOLVED    │
    │ (Closed)      │
    └───────────────┘


    ┌────────────────────────────────────────┐
    │        ESCALATION PATH                 │
    └────────────────────────────────────────┘

    [Operator Clicks Escalate]
            ↓
    ┌───────────────┐
    │ Assign Senior │
    │     Agent     │
    └───────┬───────┘
            │
            ├──→ [Add Label: escalated]
            │
            ├──→ [Create Handoff Private Note]
            │
            ├──→ [Update Queue: status=escalated]
            │
            ├──→ [Notify Senior Agent]
            │
            ↓
    [Senior Agent Reviews]
            ↓
    [Manual Response or Further Escalation]


    ┌────────────────────────────────────────┐
    │         REJECTION PATH                 │
    └────────────────────────────────────────┘

    [Operator Clicks Reject]
            ↓
    ┌───────────────┐
    │  Discard Draft│
    └───────┬───────┘
            │
            ├──→ [Update Queue: status=rejected]
            │
            ├──→ [Log Rejection Reason]
            │
            ├──→ [Store for Model Improvement]
            │
            ↓
    [Operator Writes Custom Response Manually]
```

---

## State Definitions

### Open State
- **Definition:** Conversation is active and awaiting response
- **Entry Conditions:**
  - New customer message received
  - Customer replied after agent response
- **Actions Allowed:**
  - Send messages
  - Create private notes
  - Assign agents
  - Add labels
  - Set to pending
  - Resolve conversation

### Pending State
- **Definition:** Waiting for customer response
- **Entry Conditions:**
  - Agent sent reply, awaiting customer
  - Auto-set after 24h of no activity (optional)
- **Actions Allowed:**
  - Same as Open state
  - Set back to Open if urgency increases

### Resolved State
- **Definition:** Conversation is closed/completed
- **Entry Conditions:**
  - Agent manually resolved
  - Issue confirmed solved
  - Customer satisfied
- **Actions Allowed:**
  - Reopen if customer replies
  - View history (read-only)
  - Archive after retention period

---

## Message Types

### Private Notes (message_type: 0, private: true)
- **Visibility:** Agents only (not visible to customer)
- **Use Cases:**
  - Agent SDK draft responses
  - Internal comments
  - Handoff notes during escalation
  - Investigation notes
- **API Endpoint:** `POST /conversations/{id}/messages`
- **Payload:**
  ```json
  {
    "content": "Draft response or internal note",
    "message_type": 0,
    "private": true
  }
  ```

### Incoming Messages (message_type: 0, private: false)
- **Visibility:** Public (visible to customer and agents)
- **Source:** Customer
- **Triggers:** Webhook event (message_created)
- **Agent SDK Action:** Generate draft response

### Outgoing Messages (message_type: 1)
- **Visibility:** Public (visible to customer and agents)
- **Source:** Agent
- **Use Cases:**
  - Approved draft responses
  - Edited responses
  - Manual agent responses
- **API Endpoint:** `POST /conversations/{id}/messages`
- **Payload:**
  ```json
  {
    "content": "Response to customer",
    "message_type": 1
  }
  ```

---

## Agent Assignment Logic

### Auto-Assignment Rules

```
Customer Message Received
        ↓
Check Conversation Attributes
        ↓
┌───────────────────────────────────────────┐
│  Rule 1: VIP Customer                    │
│  IF customer.vip_status = true           │
│  THEN assign to senior_agent_id          │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│  Rule 2: High Confidence Draft           │
│  IF draft.confidence >= 85%              │
│  THEN assign to regular_queue            │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│  Rule 3: Low Confidence Draft            │
│  IF draft.confidence < 70%               │
│  THEN assign to senior_agent_id          │
│  AND set priority = high                 │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│  Rule 4: Angry Sentiment                 │
│  IF sentiment.emotion = "angry"          │
│  THEN assign to manager_id               │
│  AND set priority = urgent               │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│  Rule 5: Load Balancing                  │
│  IF no special rules matched             │
│  THEN assign to least_busy_operator      │
└───────────────────────────────────────────┘
```

### Manual Assignment

**API Endpoint:** `POST /conversations/{id}/assignments`

**Payload:**
```json
{
  "assignee_id": 5,  // Agent user ID
  "team_id": 2       // Optional team ID
}
```

**Use Cases:**
- Operator escalates to specialist
- Manager takes over critical issue
- Team handoff (sales → support)

---

## Private Note vs Public Reply Workflows

### Private Note Workflow (Agent SDK Draft)

```
1. Customer Message Received
        ↓
2. Webhook Triggers Agent SDK
        ↓
3. LlamaIndex Query (knowledge base search)
        ↓
4. OpenAI Draft Generation
        ↓
5. Create Private Note in Chatwoot:
   ┌─────────────────────────────────────┐
   │ 🤖 AGENT SDK DRAFT                  │
   │ Confidence: 85%                     │
   │                                     │
   │ [Draft response text]               │
   │                                     │
   │ 📚 Sources: Shipping Policy v2.1   │
   │ 🎯 Action: APPROVE                  │
   └─────────────────────────────────────┘
        ↓
6. Insert into approval_queue Table
        ↓
7. Real-time Notification to Operators
        ↓
8. Operator Reviews in Dashboard
```

**Visibility:** Agents only (customer doesn't see the draft)

---

### Public Reply Workflow (Approved Response)

```
1. Operator Reviews Draft in Approval Queue
        ↓
2. Operator Clicks "Approve" or "Edit & Approve"
        ↓
3. Send Public Reply via Chatwoot API:
   - method: POST
   - endpoint: /conversations/{id}/messages
   - payload: { content, message_type: 1 }
        ↓
4. Add Label: "agent_sdk_approved" or "agent_sdk_edited"
        ↓
5. Update approval_queue Status: "approved"
        ↓
6. Log to Learning Data Table
        ↓
7. Customer Receives Email/Notification
        ↓
8. Message Appears in Conversation Thread (Public)
```

**Visibility:** Customer and agents (public conversation thread)

---

## Workflow Comparison Table

| Aspect | Private Note | Public Reply |
|--------|-------------|--------------|
| **API message_type** | 0 | 1 |
| **API private flag** | true | false (or omitted) |
| **Visible to Customer** | ❌ No | ✅ Yes |
| **Visible to Agents** | ✅ Yes | ✅ Yes |
| **Sends Email** | ❌ No | ✅ Yes |
| **Use Case** | Internal draft, comments | Customer response |
| **Agent SDK Phase** | Draft creation | Approval execution |
| **Queue Status** | Creates entry | Completes entry |

---

## Complete Conversation Lifecycle Example

### Scenario: Customer Inquiry About Order Status

**Timeline:**

```
T+0s: Customer sends email: "Where is my order #12345?"
      ↓
T+2s: Chatwoot receives email, creates conversation (ID: 789)
      ↓ Webhook: message_created
      ↓
T+3s: Agent SDK receives webhook
      ↓ Query LlamaIndex
      ↓
T+3.5s: LlamaIndex returns: "Order Tracking Policy (v1.2)"
      ↓ Generate Draft
      ↓
T+5s: OpenAI returns draft response (confidence: 88%)
      ↓ Create Private Note
      ↓
T+6s: Private Note created in Chatwoot:
      "🤖 DRAFT: Hi! Order #12345 shipped on Oct 8..."
      ↓ Insert Queue
      ↓
T+7s: approval_queue entry created (ID: uuid-123)
      ↓ Notify Operators
      ↓
T+8s: Real-time notification sent to all online operators
      ↓
      ⏱️ [Operator reviews queue]
      ↓
T+2m: Operator clicks "Approve"
      ↓ Send Public Reply
      ↓
T+2m+1s: Public message sent via Chatwoot API (message_type: 1)
      ↓ Add Label
      ↓
T+2m+2s: Label "agent_sdk_approved" added
      ↓ Update Queue
      ↓
T+2m+3s: Queue status → "approved", reviewed_at set
      ↓ Log Learning
      ↓
T+2m+4s: Learning data entry created
      ↓ Send Email
      ↓
T+2m+5s: Customer receives email with response
      ↓
      ⏱️ [Customer satisfied, no reply needed]
      ↓
T+1h: Operator marks conversation as "Resolved"
      ↓
T+1h+1s: Conversation status → "resolved"
      ↓
      ✅ COMPLETE
```

---

## State Transition Matrix

| Current State | Trigger | Next State | Actions |
|--------------|---------|------------|---------|
| **Created** | Customer message | Open | Create draft, notify operators |
| **Open** | Operator sends reply | Pending | Send public message, update queue |
| **Open** | Operator escalates | Open | Assign senior agent, create handoff note |
| **Open** | Operator resolves | Resolved | Set status, archive queue entry |
| **Pending** | Customer replies | Open | New draft cycle begins |
| **Pending** | No reply for 7 days | Resolved | Auto-resolve (configurable) |
| **Resolved** | Customer replies | Open | Reopen conversation, new draft |

---

## API Endpoints Summary

### Conversation Management
- `GET /conversations?status=open` - List open conversations
- `GET /conversations/{id}` - Get conversation details
- `POST /conversations/{id}/toggle_status` - Change conversation status

### Message Management
- `GET /conversations/{id}/messages` - List all messages
- `POST /conversations/{id}/messages` - Create message (private or public)

### Agent Assignment
- `POST /conversations/{id}/assignments` - Assign agent
- `GET /conversations/{id}/assignments` - Get current assignment

### Labels/Tags
- `GET /labels` - List all labels
- `POST /conversations/{id}/labels` - Add labels to conversation

---

## Agent SDK Integration Points

### 1. Webhook Reception
- **Trigger:** `message_created` event from Chatwoot
- **Validation:** HMAC signature verification
- **Action:** Parse payload, filter for customer messages

### 2. Draft Generation
- **Input:** Customer message + conversation context
- **Process:** LlamaIndex query → OpenAI draft
- **Output:** Draft response + confidence score

### 3. Private Note Creation
- **Method:** POST to `/conversations/{id}/messages`
- **Payload:** Draft with metadata (private: true)
- **Purpose:** Store draft for operator review

### 4. Queue Management
- **Action:** Insert into `agent_sdk_approval_queue` table
- **Notification:** Real-time alert to operators
- **Tracking:** Monitor operator actions

### 5. Approval Execution
- **Action:** Send public reply (message_type: 1)
- **Metadata:** Add labels, update queue status
- **Learning:** Log outcome for model improvement

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Webhook → Draft Created | < 3s | ~5-7s (estimated) |
| Draft → Operator Notified | < 1s | TBD |
| Operator Review Time | < 2min avg | TBD |
| Total Customer Wait | < 5min | TBD |
| Draft Approval Rate | > 60% | TBD |

---

## Error Handling

### Webhook Delivery Failures
- **Retry:** Chatwoot retries 3 times with exponential backoff
- **Fallback:** Manual operator notification if webhook fails
- **Monitoring:** Log all webhook errors to observability_logs

### Draft Generation Failures
- **Timeout:** 10s timeout for LlamaIndex + OpenAI
- **Fallback:** Skip private note, direct to operator queue
- **Notification:** Alert operator of generation failure

### API Call Failures
- **Retry:** 2 attempts with 1s delay
- **Fallback:** Log error, notify operator manually
- **Escalation:** Page engineering if sustained failures

---

## Future Enhancements

1. **Auto-Resolution:** Automatically resolve conversations after customer satisfaction confirmed
2. **Proactive Outreach:** Agent SDK identifies customers needing help before they ask
3. **Multi-Language:** Detect language, generate draft in customer's language
4. **Sentiment Tracking:** Real-time emotion detection throughout conversation
5. **A/B Testing:** Test different draft strategies for optimization

---

**Document Status:** Production Ready  
**Last Updated:** 2025-10-11  
**Maintained By:** Chatwoot Agent  
**Review Cadence:** Monthly or after significant workflow changes

