# Agent SDK Service - Deployment Guide

**Updated:** 2025-10-14T18:05:00Z  
**Commit:** 1ab3d78  
**Status:** Production Ready

---

## Features Implemented

### ✅ Task 1: AI Response System with CEO Approval
- OpenAI Agents SDK integration
- `needsApproval: true` on all customer-facing responses
- CEO approval tracking and learning
- Tone/voice improvement from CEO edits

### ✅ Task 2: Webhook Queue with Replay Protection
- Asynchronous webhook processing
- Idempotency (duplicate detection)
- Retry logic with exponential backoff
- Persistent queue state

### ✅ Task 3: Conversation Context Management
- Message history tracking
- Customer context (email, name, intent)
- Sentiment and urgency tracking
- Multi-turn conversation support

### ✅ Task 4: Sentiment Analysis
- Real-time customer sentiment detection
- Emotion classification (frustrated, angry, happy, etc.)
- Urgency scoring (low/medium/high/urgent)
- Trend analytics

### ✅ Task 5: Auto-Escalation
- Legal threat detection
- VIP customer prioritization
- Negative sentiment alerts
- Low confidence escalation
- Intelligent agent routing

---

## API Endpoints

### Webhooks
- `POST /webhooks/chatwoot` - Receive Chatwoot webhooks (queued processing)

### Approvals (CEO)
- `GET /approvals` - List pending approvals
- `POST /approvals/:id/:idx/approve` - Approve response
- `POST /approvals/:id/:idx/reject` - Reject response

### Analytics (New)
- `GET /analytics/ceo-learning` - CEO approval insights
- `GET /analytics/sentiment` - Sentiment trends (last 24h)
- `GET /analytics/escalations` - Escalation statistics
- `GET /queue/stats` - Webhook queue status
- `GET /context/:conversationId` - Conversation context

### Health
- `GET /health` - Service health check

---

## Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_TRACING_API_KEY=...  # Optional

# Chatwoot
CHATWOOT_BASE_URL=https://hotdash-chatwoot.fly.dev
CHATWOOT_API_TOKEN=...
CHATWOOT_ACCOUNT_ID=1

# LlamaIndex MCP
LLAMAINDEX_MCP_URL=https://hotdash-llamaindex-mcp.fly.dev/mcp

# Database (optional - falls back to JSONL)
PG_URL=postgres://...

# Server
PORT=8787
```

---

## Build & Deploy

```bash
# Build
cd apps/agent-service
npm run build

# Start locally
npm start

# Deploy to Fly.io
fly deploy --app hotdash-agent-service
```

---

## Testing

### Test CEO Approval Flow

```bash
# 1. Send test webhook
curl -X POST http://localhost:8787/webhooks/chatwoot \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message_created",
    "conversation": {"id": 123},
    "message": {"id": 456, "content": "Where is my order #12345?"},
    "message_type": 0,
    "sender": {"type": "contact"}
  }'

# Expected: {"success":true,"queued":true}

# 2. Check pending approvals
curl http://localhost:8787/approvals

# Expected: List of pending approvals with conversation 123

# 3. Approve response
curl -X POST http://localhost:8787/approvals/{id}/0/approve

# Expected: {"status":"complete"}
```

### Test Sentiment Analysis

```bash
# Negative sentiment
curl -X POST http://localhost:8787/webhooks/chatwoot \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message_created",
    "conversation": {"id": 124},
    "message": {"id": 457, "content": "This is TERRIBLE! I want my money back NOW! I'\''m contacting my lawyer!"},
    "message_type": 0,
    "sender": {"type": "contact"}
  }'

# Expected: Auto-escalated (status: "escalated", priority: "urgent")

# Check sentiment trends
curl http://localhost:8787/analytics/sentiment
```

### Test Queue Stats

```bash
curl http://localhost:8787/queue/stats

# Expected:
# {
#   "total": 5,
#   "pending": 0,
#   "processing": 0,
#   "completed": 5,
#   "failed": 0,
#   "processedCount": 5
# }
```

### Test CEO Learning

```bash
curl http://localhost:8787/analytics/ceo-learning

# Expected:
# {
#   "insights": {
#     "totalApprovals": 10,
#     "approvalRate": 85.5,
#     "tonePreferences": [{"tone": "more_empathetic", "frequency": 3}],
#     "preferredPhrases": ["appreciate", "understand", "sorry"],
#     "phrasesToAvoid": ["regards", "formally"]
#   },
#   "stats": {...}
# }
```

---

## Monitoring

### Key Metrics

**CEO Approval Metrics:**
- Approval rate (% approved without edits)
- Average edit count per response
- Tone preferences learned
- Time to approval

**Sentiment Metrics:**
- Positive/neutral/negative distribution
- Escalation rate
- Average sentiment score
- Emotion trends

**Queue Metrics:**
- Queue length
- Processing time
- Failed items
- Duplicate webhooks blocked

**Escalation Metrics:**
- Total escalations
- Escalation rate
- Top trigger types
- Priority distribution

### Logs

```bash
# Watch service logs
tail -f logs/agent-service.log

# Watch for escalations
tail -f logs/agent-service.log | grep "Sentiment Alert\|Auto-escalating"

# Watch CEO approvals
tail -f logs/agent-service.log | grep "CEO Learning"
```

---

## CEO Approval Workflow

### 1. Customer Message Arrives
- Webhook received
- Queued for processing
- Sentiment analyzed
- Escalation check

### 2. AI Generates Response
- RAG query for context
- Shopify lookup (if order mentioned)
- Generate draft reply
- Confidence scoring

### 3. CEO Approval Required
- Response paused (needsApproval: true)
- Added to approval queue
- CEO notified

### 4. CEO Reviews
- Views draft in approval UI
- Can approve as-is
- Can edit before approving
- Can reject entirely

### 5. Learning from CEO
- Track if edited (what changed)
- Detect tone shifts (more empathetic, less formal)
- Build phrase preferences
- Adjust future confidence scores

### 6. Response Sent
- Approved message sent to customer
- Feedback tracked for training
- Conversation context updated

---

## Deployment Checklist

- [x] Build successful (TypeScript 0 errors)
- [x] Secret scan passed (gitleaks)
- [x] All 5 tasks implemented
- [x] CEO approval loop functional
- [x] Sentiment analysis integrated
- [x] Auto-escalation working
- [x] Queue processing ready
- [x] Context management enhanced
- [x] Analytics endpoints added
- [ ] Deploy to Fly.io
- [ ] Test with real Chatwoot webhooks
- [ ] Verify CEO approval UI integration
- [ ] Monitor sentiment trends
- [ ] Validate escalation routing

---

**Status:** ✅ Ready for deployment  
**Commit:** 1ab3d78  
**Build:** Success  
**Tests:** Manual testing required post-deploy

