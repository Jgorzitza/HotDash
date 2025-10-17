# Chatwoot Conversation Flow Testing for Agent SDK

## Purpose

Document conversation flow patterns, API capabilities, and testing scenarios for Agent SDK integration.

## Test Environment

- **Chatwoot Instance:** https://hotdash-chatwoot.fly.dev
- **API Version:** v1
- **Account ID:** 1
- **Test Inbox:** customer.support@hotrodan.com

## API Client Capabilities

### Core Methods (Implemented)

```typescript
const client = chatwootClient({
  baseUrl: "https://hotdash-chatwoot.fly.dev",
  token: "YOUR_CHATWOOT_API_TOKEN_HERE",
  accountId: 1,
});

// ✅ List open conversations
const conversations = await client.listOpenConversations(page);

// ✅ Get messages in conversation
const messages = await client.listMessages(conversationId);

// ✅ Send public reply (visible to customer)
await client.sendReply(conversationId, "Response text");

// ✅ Add label/tag to conversation
await client.addLabel(conversationId, "agent_sdk");

// ✅ Resolve (close) conversation
await client.resolveConversation(conversationId);

// ✅ Create private note (internal comment)
await client.createPrivateNote(conversationId, "Internal note");

// ✅ Assign agent to conversation
await client.assignAgent(conversationId, agentId);

// ✅ Get full conversation details
const details = await client.getConversationDetails(conversationId);
```

## Message Types

| Type         | Value                    | Visibility    | Use Case                            |
| ------------ | ------------------------ | ------------- | ----------------------------------- |
| Incoming     | 0                        | Public        | Customer messages                   |
| Outgoing     | 1                        | Public        | Agent replies to customer           |
| Private Note | 0 (with `private: true`) | Internal only | Agent SDK drafts, internal comments |

## Conversation Lifecycle States

```
┌─────────────┐
│    open     │ ← New customer message
└──────┬──────┘
       │
       ├─→ Assign agent
       ├─→ Add labels/tags
       ├─→ Create private notes
       ├─→ Send replies
       │
       ┌──────────────────┐
       │  Agent SDK Flow  │
       ├──────────────────┤
       │ 1. Draft created │
       │ 2. Private note  │
       │ 3. Queue entry   │
       │ 4. Operator ok   │
       │ 5. Send reply    │
       └──────┬───────────┘
              │
       ┌──────▼──────┐
       │   pending   │ ← Waiting for customer
       └──────┬──────┘
              │
       ┌──────▼──────┐
       │  resolved   │ ← Issue closed
       └─────────────┘
```

## Test Scenario 1: Customer Message → Draft Response

### Setup

1. Create test conversation in Chatwoot UI
2. Send customer message: "Where is my order?"
3. Webhook triggers Agent SDK workflow

### Expected Flow

```typescript
// 1. Webhook receives event
const payload = {
  event: "message_created",
  conversation: { id: 123, status: "open" },
  message: { content: "Where is my order?", sender: { type: "contact" } },
};

// 2. Query LlamaIndex
const knowledge = await llamaIndex.query("Where is my order?");

// 3. Generate draft via OpenAI
const draft = await agentSdk.generateDraft({
  message: "Where is my order?",
  knowledge: knowledge.results,
});

// 4. Create private note with draft
await client.createPrivateNote(
  123,
  `
🤖 DRAFT RESPONSE (Confidence: 85%)

Hi! I can help you track your order. Could you please provide your order number?
In the meantime, here's our general order tracking guide: [link]

📚 Sources:
- Order Tracking Policy (v1.2)

🎯 Suggested Action: approve
`,
);

// 5. Insert into approval queue
await supabase.from("agent_sdk_approval_queue").insert({
  conversation_id: 123,
  customer_message: "Where is my order?",
  draft_response: draft.content,
  confidence_score: 85,
  status: "pending",
});
```

### Verification

- [ ] Private note visible in Chatwoot UI (agents only)
- [ ] Queue entry created in database
- [ ] Notification sent to operators
- [ ] Customer does NOT see private note

## Test Scenario 2: Operator Approves Draft

### Flow

```typescript
// 1. Operator clicks "Approve" in approval queue UI
const queueItem = await supabase
  .from("agent_sdk_approval_queue")
  .select("*")
  .eq("id", queueItemId)
  .single();

// 2. Send draft as public reply
await client.sendReply(queueItem.conversation_id, queueItem.draft_response);

// 3. Add agent SDK tag
await client.addLabel(queueItem.conversation_id, "agent_sdk_approved");

// 4. Update queue status
await supabase
  .from("agent_sdk_approval_queue")
  .update({
    status: "approved",
    operator_action: "approve",
    operator_id: operatorUserId,
    reviewed_at: new Date().toISOString(),
  })
  .eq("id", queueItemId);

// 5. Log for learning loop
await supabase.from("agent_sdk_learning_data").insert({
  customer_message: queueItem.customer_message,
  agent_draft: queueItem.draft_response,
  operator_action: "approve",
  outcome: "pending", // Updated later based on customer response
});
```

### Verification

- [ ] Customer receives reply email
- [ ] Reply visible in conversation as outgoing message
- [ ] Conversation tagged with "agent_sdk_approved"
- [ ] Queue status updated to "approved"
- [ ] Learning data logged

## Test Scenario 3: Operator Edits Draft

### Flow

```typescript
// 1. Operator modifies draft text in approval queue UI
const editedResponse = `
Hi! I can help you track your order. Could you please provide your order number or the email address used during checkout?

In the meantime, you can check your order status here: [tracking link]

Let me know if you need any assistance!
`;

// 2. Send edited response
await client.sendReply(queueItem.conversation_id, editedResponse);

// 3. Add edit tag
await client.addLabel(queueItem.conversation_id, "agent_sdk_edited");

// 4. Update queue with edited version
await supabase
  .from("agent_sdk_approval_queue")
  .update({
    status: "approved",
    operator_action: "edit",
    edited_response: editedResponse,
    operator_notes: "Added specific tracking link",
    reviewed_at: new Date().toISOString(),
  })
  .eq("id", queueItemId);

// 5. Store as training example
await supabase.from("agent_sdk_learning_data").insert({
  customer_message: queueItem.customer_message,
  agent_draft: queueItem.draft_response,
  operator_version: editedResponse,
  edit_diff: calculateDiff(queueItem.draft_response, editedResponse),
  outcome: "pending",
});
```

### Verification

- [ ] Edited version sent to customer (not original draft)
- [ ] Conversation tagged with "agent_sdk_edited"
- [ ] Both draft and edited versions stored
- [ ] Diff calculated for training

## Test Scenario 4: Operator Escalates

### Flow

```typescript
// 1. Operator clicks "Escalate" with reason
const escalationReason = "Customer is VIP, issue requires manager approval";

// 2. Assign to senior agent/manager
const seniorAgentId = 5; // Manager/senior support ID
await client.assignAgent(queueItem.conversation_id, seniorAgentId);

// 3. Add escalation tag
await client.addLabel(queueItem.conversation_id, "escalated");
await client.addLabel(queueItem.conversation_id, "vip_customer");

// 4. Create handoff note
await client.createPrivateNote(
  queueItem.conversation_id,
  `⚠️ ESCALATED by operator

Reason: ${escalationReason}

Original Draft (Confidence: ${queueItem.confidence_score}%):
${queueItem.draft_response}

Agent SDK Sources:
${JSON.stringify(queueItem.knowledge_sources, null, 2)}
`,
);

// 5. Update queue status
await supabase
  .from("agent_sdk_approval_queue")
  .update({
    status: "escalated",
    operator_action: "escalate",
    operator_notes: escalationReason,
    reviewed_at: new Date().toISOString(),
  })
  .eq("id", queueItemId);

// 6. Notify senior agent
await supabase.from("agent_sdk_notifications").insert({
  type: "escalation",
  recipient_user_id: seniorAgentId,
  conversation_id: queueItem.conversation_id,
  priority: "high",
});
```

### Verification

- [ ] Conversation assigned to senior agent
- [ ] Escalation tags added
- [ ] Handoff note created with context
- [ ] Senior agent notified
- [ ] Queue status updated

## Test Scenario 5: Operator Rejects Draft

### Flow

```typescript
// 1. Operator clicks "Reject" (draft not suitable)
const rejectionReason =
  "Draft doesn't address customer's specific concern about missing signature";

// 2. Update queue status
await supabase
  .from("agent_sdk_approval_queue")
  .update({
    status: "rejected",
    operator_action: "reject",
    operator_notes: rejectionReason,
    reviewed_at: new Date().toISOString(),
  })
  .eq("id", queueItemId);

// 3. Log rejection for model improvement
await supabase.from("agent_sdk_learning_data").insert({
  customer_message: queueItem.customer_message,
  agent_draft: queueItem.draft_response,
  operator_action: "reject",
  operator_notes: rejectionReason,
  knowledge_gaps: queueItem.knowledge_sources,
  outcome: "rejected",
});

// 4. Operator writes custom response from scratch
// (This is manual in Chatwoot UI, not via API)
```

### Verification

- [ ] Queue status updated to "rejected"
- [ ] Rejection reason logged
- [ ] Learning data captured
- [ ] Operator can write custom response in UI

## Test Scenario 6: High-Urgency Message Detection

### Flow

```typescript
// Webhook detects angry/urgent customer message
const sentiment = analyzeSentiment(message.content);
// { emotion: "angry", urgency: "high", keywords: ["REFUND", "legal action"] }

// Generate draft with low confidence
const draft = await agentSdk.generateDraft({
  message: message.content,
  sentiment: sentiment,
});

// Create private note with escalation flag
await client.createPrivateNote(
  conversationId,
  `
⚠️ HIGH PRIORITY - ANGRY CUSTOMER

${draft.draft_response}

🚨 Recommended Action: ESCALATE to manager
Sentiment: Angry, Urgency: High
Confidence: ${draft.confidence_score}% (LOW)
`,
);

// Insert with high priority
await supabase.from("agent_sdk_approval_queue").insert({
  conversation_id: conversationId,
  customer_message: message.content,
  draft_response: draft.draft_response,
  confidence_score: draft.confidence_score,
  sentiment_analysis: sentiment,
  recommended_action: "escalate",
  priority: "high",
  status: "pending",
});

// Send immediate notification to all operators
await supabase.from("agent_sdk_notifications").insert({
  type: "urgent_review_needed",
  conversation_id: conversationId,
  priority: "urgent",
  alert_all: true,
});
```

### Verification

- [ ] High priority flag set
- [ ] Escalation recommended in draft note
- [ ] All operators notified immediately
- [ ] Queue item appears at top of list

## Conversation Routing Logic

### Auto-Assignment Rules

```typescript
// Rule 1: VIP customers → assign to senior support
if (customer.custom_attributes?.vip_status === true) {
  await client.assignAgent(conversationId, seniorAgentId);
  await client.addLabel(conversationId, "vip");
}

// Rule 2: High confidence drafts → regular queue
if (draft.confidence_score >= 85) {
  priority = "normal";
}

// Rule 3: Low confidence drafts → escalate immediately
if (draft.confidence_score < 70) {
  priority = "high";
  recommended_action = "escalate";
}

// Rule 4: Angry sentiment → manager review
if (sentiment.emotion === "angry") {
  priority = "urgent";
  await client.assignAgent(conversationId, managerId);
}

// Rule 5: Load balancing across operators
const availableOperators = await getOnlineOperators();
const leastBusyOperator = selectByQueueSize(availableOperators);
```

## Performance Metrics to Track

### Response Time Metrics

- Webhook → Draft creation: < 3 seconds
- Draft creation → Operator review: < 5 minutes (target)
- Operator review → Customer response: < 30 seconds

### Quality Metrics

- Draft approval rate: > 60% target
- Edit rate: < 30% target
- Rejection rate: < 5% target
- Escalation rate: < 10% target

### Learning Metrics

- Customer satisfaction after Agent SDK response
- First contact resolution rate
- Time to resolution comparison (manual vs Agent SDK)

## Database Queries for Testing

```sql
-- Check approval queue status
SELECT
  conversation_id,
  status,
  confidence_score,
  recommended_action,
  created_at,
  reviewed_at
FROM agent_sdk_approval_queue
ORDER BY created_at DESC
LIMIT 10;

-- Operator performance
SELECT
  operator_id,
  operator_action,
  COUNT(*) as action_count,
  AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at))) as avg_review_time_seconds
FROM agent_sdk_approval_queue
WHERE reviewed_at IS NOT NULL
GROUP BY operator_id, operator_action;

-- Draft approval rate
SELECT
  operator_action,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM agent_sdk_approval_queue
WHERE status != 'pending'
GROUP BY operator_action;
```

## Testing Checklist

### API Functionality

- [ ] List open conversations returns correct data
- [ ] List messages includes all message types
- [ ] Send reply creates public outgoing message
- [ ] Create private note is visible only to agents
- [ ] Add label tags conversation correctly
- [ ] Assign agent updates conversation owner
- [ ] Resolve conversation changes status
- [ ] Get conversation details returns full context

### Webhook Integration

- [ ] Webhook receives message_created events
- [ ] Customer messages trigger draft generation
- [ ] Agent messages are filtered out
- [ ] Private notes are filtered out
- [ ] Signature verification works
- [ ] Error handling returns proper status codes

### Approval Queue

- [ ] Queue entries created correctly
- [ ] Operators can view pending items
- [ ] Approve action sends reply and updates status
- [ ] Edit action stores both versions
- [ ] Escalate action assigns and notifies
- [ ] Reject action logs reason

### Learning Loop

- [ ] Operator actions logged
- [ ] Training examples created
- [ ] Edits captured with diffs
- [ ] Outcomes tracked
- [ ] Analytics dashboard displays metrics

## Next Steps

1. **Test with Real Conversations**
   - Create 10 test conversations with varied scenarios
   - Process through full Agent SDK workflow
   - Collect operator feedback

2. **Performance Benchmarking**
   - Measure end-to-end latency
   - Identify bottlenecks
   - Optimize slow queries

3. **A/B Testing**
   - Route 20% of conversations to Agent SDK
   - Compare metrics vs manual handling
   - Iterate based on results

4. **Operator Training**
   - Document approval queue usage
   - Train on edit best practices
   - Establish escalation criteria

## References

- [Chatwoot API Documentation](https://www.chatwoot.com/developers/api)
- [Agent SDK Integration Spec](../AgentSDKopenAI.md)
- [Webhook Handler](../../supabase/functions/chatwoot-webhook/)
