# Agent SDK Service

OpenAI Agent SDK service for automated customer support with human-in-the-loop approval workflows.

## Overview

This service provides AI-powered customer support automation using OpenAI's Agent SDK, with:
- **5 Specialist Agents**: Triage, Order Support, Shipping Support, Product Q&A, Technical Support
- **Enhanced Intent Classification**: 26 granular intents with confidence scoring
- **RAG Integration**: Queries LlamaIndex MCP for knowledge base
- **Shopify Integration**: Order lookups, tracking, and actions
- **Chatwoot Integration**: Message handling with approval gates
- **Metrics Tracking**: Handoff accuracy, confidence, and performance monitoring
- **Human Fallback**: Intelligent escalation for low-confidence scenarios
- **Training Data Collection**: Captures feedback for model improvement

## Architecture

```
Chatwoot Webhook → Agent Service → [Triage → Specialist Agents] → Approval Queue
                                    ↓
                              LlamaIndex MCP (RAG)
                              Shopify Admin API
                              Chatwoot API
                              Handoff Metrics
                              Fallback Handler
```

## Specialist Agents

### 1. Triage Agent
**Purpose:** First point of contact - classifies intent and routes to specialists

**Capabilities:**
- Intent classification (26 intents with confidence scoring)
- Intelligent routing based on context
- Human fallback for low-confidence scenarios

**Handoffs to:**
- Order Support
- Shipping Support
- Product Q&A
- Technical Support

### 2. Order Support Agent
**Purpose:** Handles order-related requests

**Capabilities:**
- Order status checks
- Order cancellations (requires approval)
- Refunds and exchanges
- Order modifications

**Tools:**
- `shopify_find_orders` - Order lookup
- `shopify_cancel_order` - Order cancellation (HITL)
- `answer_from_docs` - Policy reference

### 3. Shipping Support Agent (NEW)
**Purpose:** Handles all shipping-related inquiries

**Capabilities:**
- Tracking information
- Delivery estimates
- Shipping methods and costs
- Address validation

**Tools:**
- `track_shipment` - Get tracking details
- `estimate_delivery` - Delivery time estimates
- `validate_address` - Address validation
- `get_shipping_methods` - Available shipping options

### 4. Product Q&A Agent
**Purpose:** Answers product questions

**Capabilities:**
- Product information
- Specifications
- Compatibility
- Availability

**Tools:**
- `answer_from_docs` - Knowledge base queries

### 5. Technical Support Agent (NEW)
**Purpose:** Handles product setup, troubleshooting, and warranty

**Capabilities:**
- Product setup guidance
- Troubleshooting assistance
- Warranty status checks
- Repair ticket creation (requires approval)

**Tools:**
- `search_troubleshooting` - Find troubleshooting guides
- `check_warranty` - Warranty status lookup
- `create_repair_ticket` - Create repair tickets (HITL)
- `get_setup_guide` - Setup instructions

## Intent Classification

### Enhanced Intent Taxonomy (26 Intents)

**Order Category:**
- `order_status`, `order_cancel`, `order_refund`, `order_exchange`, `order_modify`

**Shipping Category:**
- `shipping_tracking`, `shipping_delay`, `shipping_methods`, `shipping_cost`, `shipping_address`

**Product Category:**
- `product_info`, `product_specs`, `product_compatibility`, `product_availability`

**Technical Category:**
- `technical_setup`, `technical_troubleshoot`, `technical_warranty`, `technical_repair`

**General Category:**
- `account_management`, `billing_inquiry`, `feedback`, `complaint`, `other`

### Confidence Scoring

- **High confidence (≥ 0.8):** Auto-route to specialist
- **Medium confidence (0.5-0.8):** Route with monitoring
- **Low confidence (< 0.5):** Human fallback

## Human Fallback Logic

### Fallback Conditions

1. **Low Confidence:** Confidence < 0.5
2. **Negative Sentiment + Low Confidence:** Sentiment = negative AND confidence < 0.7
3. **Escalation Keywords:** "speak to manager", "escalate", "supervisor", etc.
4. **Multiple Failed Handoffs:** > 2 handoffs without resolution
5. **High Urgency + Low Confidence:** Urgency = high AND confidence < 0.8
6. **Warranty Claims:** All warranty claims require human approval

### Fallback Actions

1. Create private note for human review
2. Tag conversation (needs-human-review, priority, urgent)
3. Log to metrics
4. Notify via Slack (if configured)

## Metrics Tracking

### Handoff Metrics

- **Accuracy:** % of correct agent routing
- **Confidence:** Average confidence score
- **Fallback Rate:** % of conversations requiring human review
- **Latency:** Handoff decision time (avg, p50, p95, p99)
- **Agent Utilization:** Distribution of work across agents

### Target Metrics

- Handoff accuracy: ≥ 90%
- Average confidence: ≥ 0.80
- Fallback rate: ≤ 10%
- Average latency: ≤ 100ms
- Human review resolution: ≤ 15 minutes

## Local Development

```bash
# Install dependencies
npm install

# Copy .env.example to .env and configure
cp .env.example .env

# Build TypeScript
npm run build

# Start server
npm start

# Development mode with auto-reload
npm run dev
```

## Environment Variables

### Required

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Chatwoot
CHATWOOT_BASE_URL=https://your-chatwoot-instance.com
CHATWOOT_API_TOKEN=your-api-token
CHATWOOT_ACCOUNT_ID=123

# Shopify Admin GraphQL
SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_...

# Server
PORT=8787
```

### Optional

```bash
# OpenAI tracing
OPENAI_TRACING_API_KEY=...

# LlamaIndex MCP (defaults to production)
LLAMAINDEX_MCP_URL=https://hotdash-llamaindex-mcp.fly.dev/mcp

# Postgres for approvals/feedback (falls back to JSONL if not set)
PG_URL=postgres://user:pass@host:5432/dbname
```

## Deployment to Fly.io

```bash
# Create app
fly apps create hotdash-agent-service --org personal

# Set secrets
fly secrets set -a hotdash-agent-service \
  OPENAI_API_KEY="..." \
  CHATWOOT_BASE_URL="https://..." \
  CHATWOOT_API_TOKEN="..." \
  CHATWOOT_ACCOUNT_ID="123" \
  SHOPIFY_STORE_DOMAIN="yourstore.myshopify.com" \
  SHOPIFY_ADMIN_TOKEN="shpat_..." \
  LLAMAINDEX_MCP_URL="https://hotdash-llamaindex-mcp.fly.dev/mcp"

# Deploy from project root
cd /home/justin/HotDash/hot-dash
fly deploy -a hotdash-agent-service \
  -c apps/agent-service/fly.toml \
  --dockerfile apps/agent-service/Dockerfile

# Check status
fly status -a hotdash-agent-service
fly logs -a hotdash-agent-service
```

## API Endpoints

### Webhooks
- `POST /webhooks/chatwoot` - Handle incoming Chatwoot messages

### Approvals
- `GET /approvals` - List pending approval requests
- `POST /approvals/:id/:idx/approve` - Approve a specific action
- `POST /approvals/:id/:idx/reject` - Reject a specific action

### Health
- `GET /health` - Health check endpoint

## Agents

### Triage Agent
- First point of contact
- Classifies customer intent
- Routes to specialist agents

### Order Support Agent
- Handles order status, returns, exchanges, cancellations
- Tools: Shopify queries, order cancellation (approval-gated)

### Product Q&A Agent  
- Answers product questions using RAG
- Tools: Knowledge base queries

## Tools

### Read-Only (No Approval)
- `answer_from_docs` - Query knowledge base via LlamaIndex MCP
- `shopify_find_orders` - Search Shopify orders
- `chatwoot_create_private_note` - Internal notes

### Approval-Required
- `shopify_cancel_order` - Cancel an order
- `chatwoot_send_public_reply` - Send customer-facing message

## Database Schema (Postgres)

If using Postgres (PG_URL set), these tables are required:

```sql
-- Approvals with serialized RunState blobs
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  serialized TEXT NOT NULL,
  last_interruptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Graded samples for training/eval
CREATE TABLE IF NOT EXISTS agent_feedback (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  input_text TEXT NOT NULL,
  model_draft TEXT NOT NULL,
  safe_to_send BOOLEAN NOT NULL DEFAULT false,
  labels TEXT[] NOT NULL DEFAULT '{}',
  rubric JSONB NOT NULL DEFAULT '{}'::jsonb,
  annotator TEXT,
  notes TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

If PG_URL is not set, approvals and feedback are stored as JSONL files in `data/`.

## Chatwoot Webhook Configuration

In Chatwoot Settings → Integrations → Webhooks:
1. Add webhook URL: `https://hotdash-agent-service.fly.dev/webhooks/chatwoot`
2. Subscribe to event: `message_created`
3. Save and test

## Testing

```bash
# Test webhook locally
curl -X POST http://localhost:8787/webhooks/chatwoot \
  -H 'Content-Type: application/json' \
  -d '{
    "event":"message_created",
    "conversation":{"id": 999},
    "message_type": 0,
    "sender": {"type":"contact"},
    "content":"Where is my order 12345?"
  }'

# Expected: {"status":"pending_approval",...}

# List approvals
curl http://localhost:8787/approvals

# Approve an action
curl -X POST http://localhost:8787/approvals/:id/:idx/approve
```

## Coordination

- **@ai**: Code review for RAG integration and LlamaIndex MCP usage
- **@data**: Database schema for approvals and feedback tables
- **@chatwoot**: Webhook configuration and testing
- **@designer**: Approval queue UI components
- **@qa**: E2E test scenarios

## Status

**Implementation**: ✅ Complete  
**Deployment**: ⏳ Pending credential configuration  
**Testing**: ⏳ Pending deployment

## Notes

- All customer-facing actions require human approval
- Private notes are used for agent recommendations
- Training data is collected for all interactions
- Agents use LlamaIndex MCP for knowledge base queries

