# Agent SDK Integration Plan for Chatwoot

## Executive Summary

This document provides a comprehensive implementation plan for integrating the Agent SDK approval queue with Chatwoot customer support automation. The integration enables AI-powered draft response generation with human-in-the-loop approval workflow.

**Target:** Week 2-3 Agent SDK Integration Sprint  
**Dependencies:** LlamaIndex (port 8005), Agent SDK (port 8006), Chatwoot (Fly.io)  
**Status:** Planning Complete, Ready for Implementation

---

## Architecture Overview

```
┌─────────────────┐
│    Customer     │
│   (via Email)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Chatwoot     │ ← Receives message
│   (Fly.io App)  │    Creates conversation
└────────┬────────┘
         │ Webhook
         ▼
┌─────────────────┐
│ Chatwoot Webhook│ ← Validates signature
│  Edge Function  │    Filters events
└────────┬────────┘
         │
         ├─→ Query LlamaIndex (port 8005)
         │   ↓ Returns knowledge articles
         │
         ├─→ Generate Draft (Agent SDK port 8006)
         │   ↓ Returns draft + confidence
         │
         ├─→ Create Private Note (Chatwoot API)
         │   ↓ Draft visible to agents only
         │
         └─→ Insert Approval Queue (Supabase)
             ↓
    ┌────────────────────┐
    │  Approval Queue UI │
    │  (Operator View)   │
    └────────┬───────────┘
             │
     ┌───────┼────────┐
     │       │        │
   Approve  Edit  Escalate
     │       │        │
     ▼       ▼        ▼
  Send    Send     Assign
  Reply   Edited   Manager
     │       │        │
     └───────┼────────┘
             │
             ▼
    ┌────────────────┐
    │ Learning Loop  │ ← Track outcomes
    │  (Training)    │    Improve prompts
    └────────────────┘
```

---

## Component 1: Webhook Handler

### Implementation: `supabase/functions/chatwoot-webhook/index.ts`

**Status:** ✅ Scaffolded (TODOs marked for integration)

**Responsibilities:**

1. Validate HMAC-SHA256 webhook signature
2. Filter for customer messages in open conversations
3. Query LlamaIndex for knowledge context
4. Call Agent SDK for draft generation
5. Create private note in Chatwoot
6. Insert approval queue entry
7. Trigger real-time notification

**Key Functions:**

```typescript
// 1. Signature Verification
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const hmac = createHmac("sha256", secret);
  hmac.update(payload);
  return hmac.digest("hex") === signature;
}

// 2. Event Filtering
function shouldProcessMessage(payload: ChatwootWebhookPayload): boolean {
  return (
    payload.event === "message_created" &&
    payload.message?.sender.type === "contact" &&
    payload.conversation.status === "open"
  );
}

// 3. Knowledge Retrieval
async function queryKnowledgeBase(message: string) {
  const response = await fetch(`${LLAMAINDEX_URL}/api/llamaindex/query`, {
    method: "POST",
    body: JSON.stringify({
      query: message,
      top_k: 5,
      min_relevance: 0.7,
    }),
  });
  return await response.json();
}

// 4. Draft Generation
async function generateDraft(context: DraftContext) {
  const response = await fetch(`${AGENTSDK_URL}/api/agentsdk/draft`, {
    method: "POST",
    body: JSON.stringify({
      customer_message: context.message,
      customer_context: context.customer,
      knowledge_context: context.knowledge,
    }),
  });
  return await response.json();
}
```

**Environment Variables Required:**

```bash
CHATWOOT_WEBHOOK_SECRET=<generated_secret>
CHATWOOT_API_TOKEN=hCzzpYtFgiiy2aX4ybcV2ts2
CHATWOOT_BASE_URL=https://hotdash-chatwoot.fly.dev
LLAMAINDEX_SERVICE_URL=http://localhost:8005
AGENTSDK_SERVICE_URL=http://localhost:8006
```

---

## Component 2: Chatwoot API Client Extensions

### Implementation: `packages/integrations/chatwoot.ts`

**Status:** ✅ Complete - Added 3 new methods

**New Methods:**

```typescript
// ✅ Create private note (for draft responses)
async createPrivateNote(conversationId: number, content: string) {
  const r = await fetch(`${base}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ content, message_type: 0, private: true })
  });
  if (!r.ok) throw new Error(`Chatwoot ${r.status}`);
  return await r.json();
}

// ✅ Assign agent (for escalations)
async assignAgent(conversationId: number, assigneeId: number) {
  const r = await fetch(`${base}/conversations/${conversationId}/assignments`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ assignee_id: assigneeId })
  });
  if (!r.ok) throw new Error(`Chatwoot ${r.status}`);
  return await r.json();
}

// ✅ Get full conversation details (for context)
async getConversationDetails(conversationId: number) {
  const r = await fetch(`${base}/conversations/${conversationId}`, { headers: h });
  if (!r.ok) throw new Error(`Chatwoot ${r.status}`);
  return await r.json();
}
```

**Usage Pattern:**

```typescript
import { chatwootClient } from "./packages/integrations/chatwoot";

const client = chatwootClient({
  baseUrl: "https://hotdash-chatwoot.fly.dev",
  token: process.env.CHATWOOT_API_TOKEN,
  accountId: 1,
});

// Create draft as private note
const draftNote = await client.createPrivateNote(
  conversationId,
  formatDraftNote(draft),
);

// Escalate conversation
await client.assignAgent(conversationId, managerId);
await client.addLabel(conversationId, "escalated");
```

---

## Component 3: Approval Queue Database

### Database Schema

**Table: `agent_sdk_approval_queue`**

```sql
CREATE TABLE agent_sdk_approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Chatwoot references
  conversation_id BIGINT NOT NULL,
  chatwoot_message_id BIGINT, -- Private note ID
  inbox_id INTEGER,

  -- Customer context
  customer_name TEXT,
  customer_email TEXT,
  customer_message TEXT NOT NULL,

  -- Agent SDK output
  draft_response TEXT NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  knowledge_sources JSONB DEFAULT '[]'::jsonb,
  suggested_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  sentiment_analysis JSONB DEFAULT '{}'::jsonb,
  recommended_action TEXT CHECK (recommended_action IN ('approve', 'edit', 'escalate', 'reject')),

  -- Queue management
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),

  -- Operator interaction
  operator_id UUID REFERENCES auth.users(id),
  operator_action TEXT CHECK (operator_action IN ('approve', 'edit', 'escalate', 'reject')),
  operator_notes TEXT,
  edited_response TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,

  -- Indexes
  CONSTRAINT idx_conversation_id_created UNIQUE (conversation_id, created_at)
);

-- Indexes for performance
CREATE INDEX idx_status ON agent_sdk_approval_queue(status) WHERE status = 'pending';
CREATE INDEX idx_created_at ON agent_sdk_approval_queue(created_at DESC);
CREATE INDEX idx_priority ON agent_sdk_approval_queue(priority, created_at DESC);
CREATE INDEX idx_operator_id ON agent_sdk_approval_queue(operator_id) WHERE operator_id IS NOT NULL;
```

**Table: `agent_sdk_learning_data`**

```sql
CREATE TABLE agent_sdk_learning_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Queue reference
  queue_item_id UUID REFERENCES agent_sdk_approval_queue(id),

  -- Training data
  customer_message TEXT NOT NULL,
  agent_draft TEXT NOT NULL,
  operator_version TEXT, -- Only if edited
  operator_action TEXT NOT NULL,

  -- Outcome tracking
  outcome TEXT CHECK (outcome IN ('pending', 'customer_satisfied', 'customer_followup', 'escalated', 'rejected')),
  customer_response_time_seconds INTEGER,
  resolution_time_seconds INTEGER,

  -- Metadata
  knowledge_gaps JSONB,
  edit_diff JSONB,
  feedback_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Table: `agent_sdk_notifications`**

```sql
CREATE TABLE agent_sdk_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  type TEXT NOT NULL CHECK (type IN ('new_draft', 'urgent_review_needed', 'escalation')),
  queue_item_id UUID REFERENCES agent_sdk_approval_queue(id),
  conversation_id BIGINT NOT NULL,

  recipient_user_id UUID REFERENCES auth.users(id), -- NULL = broadcast to all
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),

  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Row Level Security (RLS):**

```sql
-- Operators can view all pending queue items
CREATE POLICY "Operators can view pending queue"
ON agent_sdk_approval_queue
FOR SELECT
TO authenticated
USING (status = 'pending' OR operator_id = auth.uid());

-- Operators can update items they're reviewing
CREATE POLICY "Operators can update their items"
ON agent_sdk_approval_queue
FOR UPDATE
TO authenticated
USING (status = 'pending')
WITH CHECK (operator_id = auth.uid());

-- Learning data is read-only for analytics
CREATE POLICY "Learning data read-only"
ON agent_sdk_learning_data
FOR SELECT
TO authenticated
USING (true);
```

---

## Component 4: Private Note Formatting

### Draft Note Template

```typescript
function formatDraftNote(draft: AgentSdkDraft): string {
  return `
🤖 **AGENT SDK DRAFT** (Confidence: ${draft.confidence_score}%)

${draft.draft_response}

---

📚 **Knowledge Sources:**
${draft.sources.map((s) => `- ${s.title} (${s.version}) - Relevance: ${Math.round(s.relevance * 100)}%`).join("\n")}

${draft.suggested_tags.length > 0 ? `\n🏷️ **Suggested Tags:** ${draft.suggested_tags.join(", ")}` : ""}

${draft.sentiment ? `\n😊 **Sentiment:** ${draft.sentiment.customer_sentiment}, Urgency: ${draft.sentiment.urgency}` : ""}

🎯 **Recommended Action:** ${draft.recommended_action.toUpperCase()}

${draft.confidence_score < 70 ? "\n⚠️ **LOW CONFIDENCE** - Review carefully or escalate" : ""}
${draft.sentiment?.urgency === "high" ? "\n🚨 **URGENT** - Customer requires immediate attention" : ""}

---
*Generated by Agent SDK at ${new Date().toISOString()}*
`;
}
```

**Example Output:**

```markdown
🤖 **AGENT SDK DRAFT** (Confidence: 85%)

Hi John! I've looked up your order #12345. It shipped on October 8th via USPS.
Your tracking number is 9400111899562539876543.

Expected delivery: October 13th (tomorrow). You can track it here: https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899562539876543

Let me know if you need anything else!

---

📚 **Knowledge Sources:**

- Shipping Policy (v2.1) - Relevance: 92%
- Order Tracking Guide (v1.3) - Relevance: 88%
- Standard Response Times (v1.0) - Relevance: 75%

🏷️ **Suggested Tags:** order_status, shipping, tracking

😊 **Sentiment:** neutral, Urgency: medium

🎯 **Recommended Action:** APPROVE

---

_Generated by Agent SDK at 2025-10-11T20:45:00Z_
```

---

## Component 5: Approval Queue UI (Concept)

### Operator Dashboard

```
┌────────────────────────────────────────────────────────────┐
│  AGENT SDK APPROVAL QUEUE                    [15] Pending  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  [Filter: All] [Priority: All] [Confidence: All]          │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 🚨 URGENT • Conversation #103                       │   │
│  │ Customer: Angry Customer (angry@example.com)        │   │
│  │ Confidence: 45% • Recommended: ESCALATE             │   │
│  │ Created: 2 minutes ago                              │   │
│  │                                                      │   │
│  │ Customer: "This is the third time I'm reaching..."  │   │
│  │                                                      │   │
│  │ Draft: "I sincerely apologize for the frustration. │   │
│  │ Let me personally look into this right away..."     │   │
│  │                                                      │   │
│  │ Sources: Escalation Guide, Refund Policy           │   │
│  │                                                      │   │
│  │ [View Full] [Approve] [Edit] [Escalate] [Reject]  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Conversation #104                                   │   │
│  │ Customer: New Customer (newbie@example.com)         │   │
│  │ Confidence: 92% • Recommended: APPROVE              │   │
│  │ Created: 5 minutes ago                              │   │
│  │                                                      │   │
│  │ Customer: "What's your return policy?"              │   │
│  │                                                      │   │
│  │ Draft: "Our return policy allows 30-day returns..." │   │
│  │                                                      │   │
│  │ Sources: Return Policy (v2.1)                       │   │
│  │                                                      │   │
│  │ [View Full] [Approve] [Edit] [Escalate] [Reject]  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Action Buttons

1. **[Approve]** - Send draft as-is
   - One-click send
   - Auto-tag conversation
   - Log to learning data
   - Move to next item

2. **[Edit]** - Modify draft before sending
   - Opens inline editor
   - Preserves original draft
   - Tracks edit diff
   - Sends edited version

3. **[Escalate]** - Assign to senior support
   - Select assignee
   - Add escalation reason
   - Create handoff note
   - Notify recipient

4. **[Reject]** - Discard draft
   - Add rejection reason
   - Log for improvement
   - Return to Chatwoot for manual response

---

## Component 6: Approval Flow Logic

### Approve Action

```typescript
async function approveQueueItem(queueItemId: string, operatorId: string) {
  // 1. Fetch queue item
  const item = await supabase
    .from("agent_sdk_approval_queue")
    .select("*")
    .eq("id", queueItemId)
    .single();

  // 2. Send draft as public reply
  const chatwootClient = getChatwootClient();
  await chatwootClient.sendReply(item.conversation_id, item.draft_response);

  // 3. Add agent SDK tag
  await chatwootClient.addLabel(item.conversation_id, "agent_sdk_approved");

  // 4. Update queue status
  await supabase
    .from("agent_sdk_approval_queue")
    .update({
      status: "approved",
      operator_id: operatorId,
      operator_action: "approve",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", queueItemId);

  // 5. Log to learning data
  await supabase.from("agent_sdk_learning_data").insert({
    queue_item_id: queueItemId,
    customer_message: item.customer_message,
    agent_draft: item.draft_response,
    operator_action: "approve",
    outcome: "pending", // Updated later
  });

  // 6. Track metrics
  await logMetric("agent_sdk_approval", {
    queue_item_id: queueItemId,
    confidence_score: item.confidence_score,
    time_to_review_seconds: calculateReviewTime(item.created_at),
  });
}
```

### Edit & Approve Action

```typescript
async function editAndApproveQueueItem(
  queueItemId: string,
  operatorId: string,
  editedResponse: string,
  editNotes?: string,
) {
  const item = await supabase
    .from("agent_sdk_approval_queue")
    .select("*")
    .eq("id", queueItemId)
    .single();

  // Calculate edit diff
  const diff = calculateEditDiff(item.draft_response, editedResponse);

  // Send edited version
  const chatwootClient = getChatwootClient();
  await chatwootClient.sendReply(item.conversation_id, editedResponse);
  await chatwootClient.addLabel(item.conversation_id, "agent_sdk_edited");

  // Update queue with edited version
  await supabase
    .from("agent_sdk_approval_queue")
    .update({
      status: "approved",
      operator_id: operatorId,
      operator_action: "edit",
      edited_response: editedResponse,
      operator_notes: editNotes,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", queueItemId);

  // Store as training example
  await supabase.from("agent_sdk_learning_data").insert({
    queue_item_id: queueItemId,
    customer_message: item.customer_message,
    agent_draft: item.draft_response,
    operator_version: editedResponse,
    operator_action: "edit",
    edit_diff: diff,
    outcome: "pending",
  });
}
```

### Escalate Action

```typescript
async function escalateQueueItem(
  queueItemId: string,
  operatorId: string,
  assigneeId: number,
  escalationReason: string,
) {
  const item = await supabase
    .from("agent_sdk_approval_queue")
    .select("*")
    .eq("id", queueItemId)
    .single();

  const chatwootClient = getChatwootClient();

  // Assign to senior agent
  await chatwootClient.assignAgent(item.conversation_id, assigneeId);

  // Add escalation tags
  await chatwootClient.addLabel(item.conversation_id, "escalated");
  await chatwootClient.addLabel(item.conversation_id, "agent_sdk");

  // Create handoff note
  const handoffNote = formatEscalationNote(item, escalationReason);
  await chatwootClient.createPrivateNote(item.conversation_id, handoffNote);

  // Update queue
  await supabase
    .from("agent_sdk_approval_queue")
    .update({
      status: "escalated",
      operator_id: operatorId,
      operator_action: "escalate",
      operator_notes: escalationReason,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", queueItemId);

  // Notify assignee
  await supabase.from("agent_sdk_notifications").insert({
    type: "escalation",
    queue_item_id: queueItemId,
    conversation_id: item.conversation_id,
    recipient_user_id: assigneeId,
    priority: "high",
  });
}

function formatEscalationNote(item: QueueItem, reason: string): string {
  return `
⚠️ **ESCALATED** from Agent SDK approval queue

**Escalation Reason:** ${reason}

**Customer Message:**
${item.customer_message}

**Agent SDK Draft (Confidence: ${item.confidence_score}%):**
${item.draft_response}

**Knowledge Sources Used:**
${JSON.stringify(item.knowledge_sources, null, 2)}

**Sentiment Analysis:**
${JSON.stringify(item.sentiment_analysis, null, 2)}

**Recommended Next Steps:**
${item.recommended_action === "escalate" ? "Agent SDK recommended escalation due to low confidence or high urgency." : "Operator determined escalation necessary."}
`;
}
```

---

## Component 7: Real-Time Notifications

### Supabase Realtime Channel

```typescript
// Subscribe to new queue items
const queueChannel = supabase
  .channel("approval_queue")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "agent_sdk_approval_queue",
      filter: "status=eq.pending",
    },
    (payload) => {
      showNotification({
        title: "New Draft Ready",
        message: `Conversation #${payload.new.conversation_id}`,
        priority: payload.new.priority,
        confidence: payload.new.confidence_score,
      });

      refreshQueue();
    },
  )
  .subscribe();

// Subscribe to urgent items
const urgentChannel = supabase
  .channel("urgent_notifications")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "agent_sdk_notifications",
      filter: "priority=eq.urgent",
    },
    (payload) => {
      showAlertModal({
        title: "🚨 URGENT REVIEW NEEDED",
        conversation_id: payload.new.conversation_id,
      });
    },
  )
  .subscribe();
```

---

## Implementation Timeline

### Week 2: Core Integration (5 days)

**Day 1-2: Infrastructure**

- ✅ Chatwoot client extensions (COMPLETE)
- ✅ Webhook endpoint skeleton (COMPLETE)
- [ ] Database migrations (approval queue tables)
- [ ] Environment variable configuration

**Day 3-4: Webhook Integration**

- [ ] Complete LlamaIndex query integration
- [ ] Complete Agent SDK draft generation
- [ ] Implement private note creation
- [ ] Test end-to-end webhook flow

**Day 5: Testing & Polish**

- [ ] Signature verification testing
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] Documentation updates

### Week 3: Approval Queue UI (5 days)

**Day 6-7: Frontend Development**

- [ ] Build approval queue dashboard
- [ ] Implement action buttons
- [ ] Add inline editor for edits
- [ ] Real-time updates via Supabase

**Day 8-9: Action Processing**

- [ ] Implement approve action
- [ ] Implement edit & approve action
- [ ] Implement escalate action
- [ ] Implement reject action

**Day 10: Learning Loop**

- [ ] Track operator actions
- [ ] Store training examples
- [ ] Build analytics dashboard
- [ ] Document improvement process

---

## Success Metrics

### Technical Metrics

- Webhook processing: < 3 seconds end-to-end
- LlamaIndex query: < 500ms
- OpenAI draft generation: < 1.5 seconds
- System uptime: > 99.5%

### Product Metrics

- Agent approval rate: > 60%
- Edit rate: < 30%
- Escalation rate: < 10%
- Rejection rate: < 5%

### Operator Metrics

- Drafts reviewed per hour: > 15
- Time to review: < 2 minutes average
- Operator satisfaction: > 8/10

---

## Risk Mitigation

| Risk                    | Mitigation                                                             |
| ----------------------- | ---------------------------------------------------------------------- |
| LlamaIndex service down | Queue draft with "knowledge unavailable" flag, allow manual processing |
| Agent SDK service down  | Fall back to manual queue, log for retry                               |
| OpenAI API rate limit   | Implement exponential backoff, queue for batch processing              |
| Low confidence drafts   | Auto-escalate if confidence < 70%, flag for review                     |
| Chatwoot API errors     | Retry with exponential backoff, log for investigation                  |

---

## Next Steps

1. **Deploy Database Migrations**

   ```bash
   supabase db push
   ```

2. **Configure Webhook in Chatwoot**
   - Navigate to Settings → Integrations → Webhooks
   - Add webhook URL: `https://<project>.supabase.co/functions/v1/chatwoot-webhook`
   - Select events: `message_created`
   - Generate and store webhook secret

3. **Deploy Webhook Function**

   ```bash
   supabase functions deploy chatwoot-webhook
   supabase secrets set CHATWOOT_WEBHOOK_SECRET=<secret>
   ```

4. **Integration Testing**
   - Send test message via Chatwoot UI
   - Verify webhook receives event
   - Check draft created as private note
   - Confirm queue entry created

5. **Operator Training**
   - Document approval queue usage
   - Train on action workflows
   - Establish escalation criteria

---

## References

- [Chatwoot Configuration Audit](../feedback/chatwoot.md)
- [Webhook Payload Examples](./webhook_payload_examples.md)
- [Conversation Flow Testing](./conversation_flow_testing.md)
- [Agent SDK OpenAI Integration](../AgentSDKopenAI.md)
- [North Star: Operator-First Principles](../NORTH_STAR.md)
