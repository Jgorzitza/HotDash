# Chatwoot Webhook Handler for Agent SDK Integration

## Purpose

This Edge Function receives webhook events from Chatwoot and triggers the Agent SDK approval queue workflow for customer support automation.

## Endpoint

```
POST https://<project-ref>.supabase.co/functions/v1/chatwoot-webhook
```

## Authentication

Webhooks are verified using HMAC-SHA256 signature validation:

```typescript
const signature = request.headers.get("X-Chatwoot-Signature");
const webhookSecret = Deno.env.get("CHATWOOT_WEBHOOK_SECRET");

// Verify signature matches HMAC-SHA256 of request body
```

## Webhook Events

### Supported Events

| Event                         | Description          | Agent SDK Action                         |
| ----------------------------- | -------------------- | ---------------------------------------- |
| `message_created`             | New customer message | Generate draft response → approval queue |
| `conversation_created`        | New conversation     | Initialize workflow tracking             |
| `conversation_status_changed` | Status updated       | Update queue state                       |
| `conversation_resolved`       | Closed by agent      | Archive from queue                       |

### Event Filtering

Only process messages where:

- `message.sender.type === 'contact'` (from customer, not agent)
- `conversation.status === 'open'` (active conversations only)
- `message.message_type === 0` (incoming messages)

## Payload Structure

```json
{
  "event": "message_created",
  "account": {
    "id": 1,
    "name": "HotDash"
  },
  "inbox": {
    "id": 1,
    "name": "customer.support@hotrodan.com"
  },
  "conversation": {
    "id": 123,
    "inbox_id": 1,
    "status": "open",
    "created_at": 1728676800,
    "meta": {},
    "contact": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "messages": [
      {
        "id": 456,
        "content": "Where is my order?",
        "message_type": 0,
        "created_at": 1728676800,
        "sender": {
          "type": "contact"
        }
      }
    ]
  },
  "message": {
    "id": 456,
    "content": "Where is my order?",
    "message_type": 0,
    "created_at": 1728676800,
    "sender": {
      "type": "contact"
    }
  }
}
```

## Agent SDK Workflow

```
1. Receive webhook event
   ↓
2. Validate signature
   ↓
3. Filter for customer messages
   ↓
4. Query LlamaIndex (port 8005) for knowledge context
   ↓
5. Generate draft via Agent SDK (port 8006)
   ↓
6. Create private note in Chatwoot with draft
   ↓
7. Insert into agent_sdk_approval_queue table
   ↓
8. Trigger real-time notification to operators
   ↓
9. Return 200 OK to Chatwoot
```

## Integration Points

### LlamaIndex Query Service (Port 8005)

```typescript
const response = await fetch("http://localhost:8005/api/llamaindex/query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: message.content,
    top_k: 5,
    min_relevance: 0.7,
  }),
});

const { results } = await response.json();
```

### Agent SDK Draft Service (Port 8006)

```typescript
const response = await fetch("http://localhost:8006/api/agentsdk/draft", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    customer_message: message.content,
    customer_context: {
      name: contact.name,
      email: contact.email,
      conversation_id: conversation.id,
    },
    knowledge_context: llamaIndexResults,
    conversation_history: previousMessages,
  }),
});

const draft = await response.json();
```

### Chatwoot Private Note Creation

```typescript
const chatwootClient = createChatwootClient({
  baseUrl: "https://hotdash-chatwoot.fly.dev",
  token: Deno.env.get("CHATWOOT_API_TOKEN"),
  accountId: 1,
});

const draftContent = `
🤖 DRAFT RESPONSE (Confidence: ${draft.confidence_score}%)

${draft.draft_response}

📚 Sources:
${draft.sources.map((s) => `- ${s.title} (v${s.version})`).join("\n")}

🎯 Suggested Action: ${draft.recommended_action}
`;

await chatwootClient.createPrivateNote(conversation.id, draftContent);
```

### Approval Queue Table Insert

```typescript
await supabase.from("agent_sdk_approval_queue").insert({
  conversation_id: conversation.id,
  chatwoot_message_id: privateNote.id,
  customer_message: message.content,
  draft_response: draft.draft_response,
  confidence_score: draft.confidence_score,
  knowledge_sources: draft.sources,
  suggested_tags: draft.suggested_tags,
  sentiment_analysis: draft.sentiment,
  recommended_action: draft.recommended_action,
  status: "pending",
});
```

### Real-time Notification

```typescript
await supabase.from("agent_sdk_notifications").insert({
  type: "new_draft",
  queue_item_id: queueItem.id,
  conversation_id: conversation.id,
  priority: draft.sentiment.urgency,
  created_at: new Date().toISOString(),
});
```

## Environment Variables

Required in Supabase Edge Function:

```bash
CHATWOOT_WEBHOOK_SECRET=<webhook_secret>
CHATWOOT_API_TOKEN=<api_token>
CHATWOOT_BASE_URL=https://hotdash-chatwoot.fly.dev
LLAMAINDEX_SERVICE_URL=http://localhost:8005
AGENTSDK_SERVICE_URL=http://localhost:8006
SUPABASE_URL=<project_url>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

## Error Handling

### Invalid Signature

```json
{
  "error": "Invalid webhook signature",
  "status": 401
}
```

### Missing Required Fields

```json
{
  "error": "Missing required fields: conversation.id",
  "status": 400
}
```

### LlamaIndex Service Unavailable

```json
{
  "error": "Knowledge base service unavailable",
  "status": 503,
  "details": "LlamaIndex query failed"
}
```

### Agent SDK Service Unavailable

```json
{
  "error": "Draft generation service unavailable",
  "status": 503,
  "details": "Agent SDK unreachable"
}
```

## Testing

### Test Webhook Locally

```bash
curl -X POST http://localhost:54321/functions/v1/chatwoot-webhook \
  -H "Content-Type: application/json" \
  -H "X-Chatwoot-Signature: <signature>" \
  -d @test-payload.json
```

### Test Payload (`test-payload.json`)

```json
{
  "event": "message_created",
  "account": { "id": 1 },
  "inbox": { "id": 1, "name": "customer.support@hotrodan.com" },
  "conversation": {
    "id": 999,
    "status": "open",
    "contact": {
      "name": "Test Customer",
      "email": "test@example.com"
    }
  },
  "message": {
    "id": 1001,
    "content": "I need help with my order",
    "message_type": 0,
    "sender": { "type": "contact" }
  }
}
```

## Performance Metrics

Target SLAs:

- Webhook processing: < 2 seconds
- LlamaIndex query: < 500ms
- OpenAI draft generation: < 1.5 seconds
- Total end-to-end: < 3 seconds

## Monitoring

Log to `observability_logs` table:

```typescript
await supabase.from("observability_logs").insert({
  level: "INFO",
  message: "Chatwoot webhook processed",
  metadata: {
    event: "message_created",
    conversation_id: conversation.id,
    processing_time_ms: duration,
    draft_confidence: draft.confidence_score,
  },
});
```

## Deployment

```bash
# Deploy to Supabase
supabase functions deploy chatwoot-webhook

# Set environment variables
supabase secrets set CHATWOOT_WEBHOOK_SECRET=<secret>
supabase secrets set CHATWOOT_API_TOKEN=<token>
```

## Chatwoot Configuration

In Chatwoot settings:

1. Navigate to Settings → Integrations → Webhooks
2. Add webhook URL: `https://<project>.supabase.co/functions/v1/chatwoot-webhook`
3. Select events: `message_created`, `conversation_created`
4. Save webhook secret to `vault/occ/chatwoot/webhook_secret.env`

## References

- [Chatwoot Webhook Docs](https://www.chatwoot.com/docs/product/channels/api/webhooks)
- [Agent SDK OpenAI Integration](../../docs/AgentSDKopenAI.md)
- [LlamaIndex Integration Spec](../../docs/directions/engineer-sprint-llamaindex-agentsdk.md)
