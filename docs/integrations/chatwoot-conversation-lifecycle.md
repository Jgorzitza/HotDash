---
epoch: 2025.10.E1
doc: docs/integrations/chatwoot-conversation-lifecycle.md
owner: chatwoot
created: 2025-10-12
purpose: Document Chatwoot conversation lifecycle and agent integration flow
category: integration
tags: [chatwoot, conversation-flow, agent-sdk, workflow, lifecycle]
---

# Chatwoot Conversation Lifecycle & Agent Integration

**Purpose**: Map complete conversation flow from customer message to resolution  
**Owner**: Chatwoot Agent  
**Created**: 2025-10-12T21:00:00Z  
**For**: Engineer, QA, Support operators

---

## 📋 Conversation Lifecycle Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                    CHATWOOT CONVERSATION LIFECYCLE                   │
└──────────────────────────────────────────────────────────────────────┘

1. CONVERSATION CREATED
   │
   ├─> New customer sends first message
   ├─> Chatwoot creates conversation
   ├─> Status: "open"
   ├─> Fires webhook: "conversation_created"
   │
2. MESSAGE RECEIVED
   │
   ├─> Customer sends message
   ├─> Fires webhook: "message_created"
   ├─> Agent SDK processes (if enabled)
   │   ├─> Query LlamaIndex knowledge base
   │   ├─> Generate draft response
   │   ├─> Post private note to conversation
   │   └─> Add to approval queue
   │
3. AGENT ASSIGNMENT
   │
   ├─> Manual assignment OR auto-assignment
   ├─> Agent receives notification
   ├─> Conversation appears in agent's inbox
   ├─> Fires webhook: "conversation_updated"
   │
4. OPERATOR REVIEW (New with Agent SDK!)
   │
   ├─> Operator sees AI draft in private note
   ├─> Operator reviews draft in approval queue
   ├─> Decision made:
   │   ├─> Approve → Send draft to customer
   │   ├─> Edit → Modify and send
   │   ├─> Reject → Write manual response
   │   └─> Escalate → Assign to specialist
   │
5. RESPONSE SENT
   │
   ├─> Public message sent to customer
   ├─> Fires webhook: "message_created"
   ├─> Customer receives email/notification
   ├─> Conversation remains "open"
   │
6. CONVERSATION RESOLVED
   │
   ├─> Agent marks conversation as "resolved"
   ├─> Status: "resolved"
   ├─> Fires webhook: "conversation_status_changed"
   ├─> Optional: CSAT survey sent
   │
7. CONVERSATION REOPENED (if customer replies)
   │
   ├─> Customer sends new message
   ├─> Status: "open"
   ├─> Fires webhook: "conversation_status_changed"
   ├─> Cycle repeats from step 2
   │
8. CONVERSATION CLOSED (final)
   │
   └─> Auto-closed after resolution timeout (default: 7 days)
       Status: "closed"
       Archived for analytics
```

---

## 🔄 Conversation States

### State Transitions

```
        ┌─────────┐
        │  NEW    │ (conversation_created)
        └────┬────┘
             │
             ▼
        ┌─────────┐     ┌──────────────┐
        │  OPEN   │ <── │ CUSTOMER     │
        └────┬────┘     │ REPLY        │
             │          └──────────────┘
             ├──> Agent assigned
             ├──> Messages exchanged
             ├──> AI drafts generated
             │
             ▼
        ┌─────────┐
        │RESOLVED │
        └────┬────┘
             │
             ├──> Customer satisfied
             ├──> No reply in 7 days
             │
             ▼
        ┌─────────┐
        │ CLOSED  │
        └─────────┘
```

---

## 🤖 Agent SDK Integration Flow

### With AI-Assisted Approval Queue

```
┌────────────────────────────────────────────────────────────────────────┐
│                    AGENT SDK INTEGRATION FLOW                          │
└────────────────────────────────────────────────────────────────────────┘

[1] CUSTOMER MESSAGE
    ↓
    Customer sends: "What size AN fitting for my 350 Chevy?"
    
[2] CHATWOOT WEBHOOK
    ↓
    POST /webhooks/chatwoot
    Event: "message_created"
    Payload: { conversation: {...}, message: {...} }
    Signature: X-Chatwoot-Signature header
    
[3] WEBHOOK VERIFICATION (Security!)
    ↓
    Verify HMAC signature
    If invalid → Reject (401)
    If valid → Continue
    
[4] LLAMAINDEX KNOWLEDGE QUERY (~500ms)
    ↓
    Query: "What size AN fitting for my 350 Chevy?"
    Results: [
      { doc: "AN-Fittings-Product-Knowledge", relevance: 0.94 },
      { doc: "AN-Fittings-FAQ", relevance: 0.88 }
    ]
    
[5] AGENT SDK DRAFT GENERATION (~1-2s)
    ↓
    Input: Customer message + Knowledge context
    Agent: Triage → Product Q&A
    Output: {
      draft_response: "For a 350 Chevy (300-350 HP), recommend AN-6...",
      confidence_score: 92,
      sources: [...],
      recommended_action: "send"
    }
    
[6] CREATE PRIVATE NOTE in Chatwoot
    ↓
    POST /accounts/1/conversations/123/messages
    {
      content: "🤖 AGENT SDK DRAFT ✅ (92% confidence)\n\n[draft]...",
      message_type: 0,
      private: true
    }
    
[7] ADD TO APPROVAL QUEUE
    ↓
    INSERT INTO agent_approvals (
      conversation_id, customer_message, draft_response,
      confidence_score, priority, status
    )
    Priority: normal (based on confidence + sentiment)
    Status: pending
    
[8] NOTIFY OPERATOR
    ↓
    Real-time notification: "New draft ready for review"
    Dashboard: Approval queue count increases
    Chatwoot: Private note visible to operators
    
[9] OPERATOR REVIEWS (You!)
    ↓
    Opens approval queue in Hot Dash app
    Sees: Customer question, AI draft, confidence score, sources
    Reviews using quality checklist
    
[10] OPERATOR DECISION
     ↓
     ┌────────────┬────────────┬────────────┬────────────┐
     │  APPROVE   │    EDIT    │   REJECT   │  ESCALATE  │
     └─────┬──────┴──────┬─────┴──────┬─────┴──────┬─────┘
           │             │            │            │
           ▼             ▼            ▼            ▼
     Send draft   Modify & send   Manual    Assign to
     as-is        edited version  response  specialist
     
[11] SEND TO CUSTOMER
     ↓
     POST /accounts/1/conversations/123/messages
     {
       content: "[approved or edited response]",
       message_type: 1,  // outgoing
       private: false
     }
     
[12] LEARNING DATA CAPTURED
     ↓
     INSERT INTO agent_sdk_learning_data (
       draft_version, final_version, was_sent,
       operator_edits, customer_replied
     )
     
     AI learns from:
     - Edits you make (which words you changed)
     - Rejections (what was wrong with draft)
     - Customer satisfaction (did they reply positively?)

[13] CUSTOMER RECEIVES RESPONSE
     ↓
     Email notification: "Hot Rod AN replied"
     Chatwoot widget: New message appears
     Customer can reply to continue conversation
     
[14] CONVERSATION CONTINUES
     ↓
     If customer replies → Back to step [2]
     If no reply → Auto-resolve after timeout
     If resolved → Conversation closed
```

**Total Time**: <5 seconds from customer message to draft ready for operator review  
**Operator Time Saved**: 3-5 minutes per message (vs writing from scratch)

---

## 🎯 Message Types in Chatwoot

### Message Type Codes

```typescript
enum MessageType {
  INCOMING = 0,   // Customer message (inbound)
  OUTGOING = 1,   // Agent message (outbound, public)
  ACTIVITY = 2,   // System message (assigned, resolved, etc.)
  TEMPLATE = 3,   // Message template
}
```

### Private vs Public Messages

**Private Messages** (`private: true`):
- Visible only to operators (internal notes)
- Used for: AI drafts, operator discussions, internal context
- Not sent to customer
- Example: "🤖 AGENT SDK DRAFT..."

**Public Messages** (`private: false`):
- Visible to customer
- Used for: Actual responses sent to customer
- Triggers customer notification
- Example: Final approved response

---

## 📬 Webhook Events Reference

### Events We Handle

**1. `message_created`** (Most Important!)
- Fires when: Customer sends message OR agent sends reply
- Filter: Only process if `sender.type === "contact"` (customer messages)
- Action: Trigger Agent SDK draft generation
- Frequency: Every customer message

**2. `conversation_created`**
- Fires when: New conversation starts
- Action: Initialize conversation tracking in our database
- Frequency: Once per new conversation

**3. `conversation_updated`**
- Fires when: Conversation assigned, status changed, etc.
- Action: Update conversation metadata in our system
- Frequency: Multiple times per conversation

**4. `conversation_status_changed`**
- Fires when: Status changes (open → resolved → closed)
- Action: Update analytics, trigger CSAT survey
- Frequency: 2-3 times per conversation lifecycle

### Events We Ignore (For Now)

- `contact_created` - Not needed for MVP
- `contact_updated` - Not needed for MVP
- `webwidget_triggered` - Not applicable (using API inbox)

---

## 🔀 Conversation Assignment Logic

### Auto-Assignment Rules

**By Availability**:
```
1. Check agent availability status (online/offline)
2. Check agent workload (open conversations count)
3. Assign to agent with lowest workload
4. If all busy → Round-robin assignment
```

**By Expertise** (Future Enhancement):
```
1. Analyze message intent (order vs product question)
2. Match to specialized agent
   - Order Support Agent → Order questions
   - Product Q&A Agent → Technical questions
3. Assign to best-match agent
```

**By Priority**:
```
1. VIP customers → Priority agents
2. Urgent messages → Available agents immediately
3. Standard messages → Normal assignment queue
```

---

## 💬 Message Flow Examples

### Example 1: Simple Product Question

**Customer Message**:
```
"What does AN-6 mean in inches?"
```

**Agent SDK Processing**:
1. LlamaIndex query → Finds FAQ answer (relevance: 95%)
2. Draft generated: "AN-6 equals 3/8 inch. Formula: AN ÷ 16 = inches."
3. Confidence: 95% (high)
4. Recommended action: SEND
5. Priority: normal

**Operator Review**:
- Sees 95% confidence
- Verifies answer is correct (per FAQ)
- Approves without edits
- Total time: 30 seconds

**Result**: Customer receives accurate answer in <2 minutes

---

### Example 2: Troubleshooting with Follow-Up

**Customer Message**:
```
"My AN fittings are leaking at the carburetor."
```

**Agent SDK Processing**:
1. LlamaIndex query → Finds troubleshooting guide (relevance: 88%)
2. Draft generated: "Turn off fuel first. Check for over-tightening..."
3. Confidence: 82% (good)
4. Recommended action: REVIEW
5. Priority: high (safety keyword detected)

**Operator Review**:
- Sees "high" priority (safety concern)
- Verifies safety steps are correct
- Adds: "Can you tell me what carburetor you have?"
- Sends edited version
- Total time: 2 minutes

**Customer Follow-Up**:
```
"Holley 750, and I used an adapter."
```

**Agent SDK Processing** (2nd message):
1. Context: Previous conversation included
2. Draft: "Perfect. The adapter is correct. Check if..."
3. Confidence: 88%
4. Recommended action: SEND

**Result**: Problem diagnosed and solved in 2 exchanges, <5 minutes total

---

### Example 3: Escalation to Specialist

**Customer Message**:
```
"Need fuel system design for 1500 HP twin turbo on E85."
```

**Agent SDK Processing**:
1. LlamaIndex query → Limited high-HP documentation (relevance: 62%)
2. Draft generated: "Impressive build! This needs technical specialist..."
3. Confidence: 58% (medium-low)
4. Recommended action: ESCALATE
5. Priority: high (complex application)

**Operator Review**:
- Sees 58% confidence + ESCALATE recommendation
- Agrees this needs specialist
- Clicks "Escalate to Technical"
- Adds note: "Twin turbo, E85, 1500 HP - needs fuel system design"
- Total time: 1 minute

**Technical Specialist**:
- Receives escalation notification
- Reviews customer message + operator notes
- Calls customer directly for detailed consultation
- Provides custom fuel system recommendation

**Result**: Right expertise applied, customer receives specialist attention

---

## 🎯 Agent Assignment Workflows

### Workflow 1: Manual Assignment

```
Conversation Created
  ↓
Unassigned (inbox)
  ↓
Operator clicks "Assign to me"
  ↓
Conversation assigned to operator
  ↓
Operator handles conversation
  ↓
Marks as resolved when done
```

---

### Workflow 2: Auto-Assignment

```
Conversation Created
  ↓
Auto-assignment rule triggered
  ↓
System finds available agent (lowest workload)
  ↓
Conversation auto-assigned
  ↓
Agent receives notification
  ↓
Agent handles conversation
```

---

### Workflow 3: Round-Robin Assignment

```
Conversation Created
  ↓
Check last assigned agent
  ↓
Find next agent in rotation
  ↓
Assign to next agent
  ↓
Update rotation counter
```

---

## 📝 Private Note vs Public Reply

### When to Use Private Notes

**Internal Communication**:
```
"@manager This customer is VIP - priority handling"
"Checked inventory - we have 50 units of AN-6 in stock"
"Customer mentioned car show deadline - expedite shipping"
```

**AI Drafts**:
```
"🤖 AGENT SDK DRAFT ✅ (92% confidence)

[Draft response text here]

---
📚 Knowledge Sources:
- AN Fittings Product Knowledge (94% relevance)
```

**Troubleshooting Notes**:
```
"Tried troubleshooting steps 1-3 from playbook
Still leaking - escalating to technical support
Photos requested from customer"
```

---

### When to Use Public Replies

**Customer Responses**:
```
"Thanks for reaching out! For a 350 Chevy with a Holley 650 carb,
I recommend AN-6 fittings for your fuel feed line..."
```

**Follow-Up Questions**:
```
"To help you better, can you tell me:
1. What's your engine's horsepower?
2. Are you using a mechanical or electric fuel pump?"
```

**Resolution Confirmations**:
```
"Great to hear the leak is fixed! Feel free to reach out if you
have any other questions. Happy building! 🏎️"
```

---

## ⏱️ Conversation Timing & SLA

### Response Time Targets

**First Response** (from customer message to first reply):
- 🚨 Urgent: <5 minutes
- ⚡ High: <15 minutes  
- 📝 Normal: <30 minutes
- 🔽 Low: <1 hour

**Resolution Time** (from first message to resolution):
- Simple questions: <15 minutes
- Troubleshooting: <30 minutes
- Complex issues: <45 minutes
- Escalations: <24 hours (specialist follow-up)

### SLA Monitoring

**Tracked Metrics**:
- First response time (FRT)
- Time to resolution (TTR)
- SLA breach rate
- Customer satisfaction (CSAT)

**Stored in**: `cx_conversations` table

---

## 🏷️ Conversation Metadata

### Standard Attributes

```typescript
interface Conversation {
  id: number;
  account_id: number;
  inbox_id: number;
  status: 'open' | 'resolved' | 'closed';
  assignee_id: number | null;
  contact_id: number;
  display_id: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  contact_last_seen_at: string;
  agent_last_seen_at: string;
  first_reply_created_at: string;
  
  // Custom attributes
  custom_attributes: {
    shopify_order_id?: string;
    customer_segment?: string;
    product_interest?: string;
    vip_customer?: boolean;
  };
  
  // Additional
  priority: number | null;
  snoozed_until: string | null;
  cached_label_list: string | null;
}
```

---

## 🔔 Notification Flow

### Operator Notifications

**Real-Time Notifications** (when logged in):
- New message received
- Conversation assigned to you
- Customer replied
- Urgent conversation needs attention
- AI draft ready for review (new!)

**Email Notifications** (configurable):
- New conversation assigned
- Conversation mentions you (@operator)
- Customer CSAT feedback received

**Push Notifications** (mobile app):
- Urgent conversations
- @mentions
- Customer replied to your message

---

## 📊 Analytics & Reporting

### Conversation Metrics Captured

**Per Conversation**:
- First response time (minutes)
- Resolution time (hours)
- Number of messages exchanged
- Agent who handled it
- Customer satisfaction rating
- AI draft confidence score (new!)
- Whether AI draft was approved/edited/rejected (new!)

**Aggregated Daily**:
- Total conversations
- Average response time
- SLA compliance rate
- Customer satisfaction score
- AI draft approval rate (new!)
- Operator time saved (new!)

**Stored in**: `cx_conversations`, `reporting_events` tables

---

## 🎯 Conversation Routing Decision Tree

```
New Customer Message Received
  │
  ├─> Is this safety-critical?
  │   (fuel leak, brakes, fire hazard)
  │   ├─> YES → Priority: URGENT, Assign: Available agent immediately
  │   └─> NO → Continue
  │
  ├─> Is customer VIP?
  │   (high lifetime value, repeat buyer)
  │   ├─> YES → Priority: HIGH, Assign: Senior operator
  │   └─> NO → Continue
  │
  ├─> What's the intent?
  │   ├─> Order status/tracking → Assign: Order Support team
  │   ├─> Product question → Assign: Product Q&A team
  │   ├─> Complaint → Assign: Manager
  │   └─> General inquiry → Auto-assign
  │
  ├─> Is agent available?
  │   ├─> YES → Assign immediately
  │   └─> NO → Queue for next available
  │
  └─> Assign using configured method
      (manual, auto-assign, round-robin)
```

---

## 🔧 Integration Points for Engineer

### Required API Calls

**1. Create Private Note (AI Draft)**:
```bash
POST /api/v1/accounts/{account_id}/conversations/{conversation_id}/messages

Headers:
  api_access_token: {token}
  Content-Type: application/json

Body:
{
  "content": "🤖 AGENT SDK DRAFT...",
  "message_type": 0,
  "private": true
}

Response: 200 OK
{ "id": 789, "content": "...", "created_at": "..." }
```

**2. Send Public Reply (After Approval)**:
```bash
POST /api/v1/accounts/{account_id}/conversations/{conversation_id}/messages

Headers:
  api_access_token: {token}
  Content-Type: application/json

Body:
{
  "content": "Thanks for reaching out! For a 350...",
  "message_type": 1,
  "private": false
}

Response: 200 OK
{ "id": 790, "content": "...", "message_sent": true }
```

**3. Update Conversation Status**:
```bash
PUT /api/v1/accounts/{account_id}/conversations/{conversation_id}

Headers:
  api_access_token: {token}
  Content-Type: application/json

Body:
{
  "status": "resolved"  // or "open", "closed"
}

Response: 200 OK
```

**4. Assign Conversation**:
```bash
POST /api/v1/accounts/{account_id}/conversations/{conversation_id}/assignments

Headers:
  api_access_token: {token}
  Content-Type: application/json

Body:
{
  "assignee_id": 5  // Agent user ID
}

Response: 200 OK
```

---

## 🚨 Error Handling

### Webhook Processing Errors

**Scenario 1: LlamaIndex Service Down**
```
Customer message → Webhook fires → LlamaIndex query fails
Action: Create approval with generic draft: "Let me look into that for you..."
Result: Operator handles manually (no AI assistance)
Priority: Normal (no degradation, just no AI help)
```

**Scenario 2: Agent SDK Service Down**
```
Customer message → Webhook fires → Agent SDK unavailable
Action: Create approval with placeholder: "Reviewing your message..."
Result: Operator writes response from scratch
Priority: Normal (fallback to manual workflow)
```

**Scenario 3: Chatwoot API Error (Creating Private Note)**
```
Draft generated → Attempt to post private note → 500 error
Action: Log error, store draft in approval queue anyway
Result: Operator sees draft in Hot Dash, manually posts if needed
Priority: Low (draft still available, just not in Chatwoot)
```

**Scenario 4: Database Error (Approval Queue)**
```
Draft generated → Attempt to insert into agent_approvals → fails
Action: Log error, send webhook to dead letter queue
Result: Retry after 1 minute (3 attempts)
Priority: High (need to capture this message)
```

**Principle**: **Graceful degradation** - system continues working even if AI components fail

---

## 📋 Conversation Lifecycle Checklist

### For Every Conversation

**Creation** ✓
- [ ] Conversation record created in Chatwoot
- [ ] Contact linked or created
- [ ] Inbox assigned
- [ ] Initial status: "open"

**First Message Processing** ✓
- [ ] Webhook received and verified
- [ ] LlamaIndex queried for knowledge
- [ ] Agent SDK draft generated
- [ ] Private note created in Chatwoot
- [ ] Approval queue item created
- [ ] Operator notified

**Operator Review** ✓
- [ ] Operator sees draft in approval queue
- [ ] Quality checklist completed
- [ ] Decision made (approve/edit/reject/escalate)
- [ ] Learning data captured

**Response Sent** ✓
- [ ] Public message created in Chatwoot
- [ ] Customer notified
- [ ] Response time tracked
- [ ] Conversation updated

**Resolution** ✓
- [ ] Conversation marked as "resolved"
- [ ] CSAT survey sent (optional)
- [ ] Metrics recorded (FRT, TTR, satisfaction)
- [ ] Analytics updated

---

## 🎯 Success Metrics

**Conversation Quality**:
- First contact resolution: >70%
- Customer satisfaction: >85%
- SLA compliance: >95%

**AI Assistance**:
- Draft approval rate: >70%
- Average confidence score: >78%
- Operator time saved: 3-5 min per message

**Operator Productivity**:
- Messages handled per hour: 2X improvement
- Time to resolution: 40% reduction
- Escalation rate: 15-20% (appropriate safety escalations)

---

**Created**: 2025-10-12T21:00:00Z  
**Owner**: Chatwoot Agent  
**Next Review**: Monthly  
**Integration Status**: Ready for Engineer implementation

