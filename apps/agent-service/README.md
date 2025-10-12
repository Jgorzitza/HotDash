# Agent SDK Service

OpenAI Agent SDK service for automated customer support with human-in-the-loop approval workflows.

## Overview

This service provides AI-powered customer support automation using OpenAI's Agent SDK, with:
- **3 Specialist Agents**: Triage, Order Support, Product Q&A
- **RAG Integration**: Queries LlamaIndex MCP for knowledge base
- **Shopify Integration**: Order lookups and actions
- **Chatwoot Integration**: Message handling with approval gates
- **Training Data Collection**: Captures feedback for model improvement

## Architecture

```
Chatwoot Webhook → Agent Service → [Triage → Specialist Agents] → Approval Queue
                                    ↓
                              LlamaIndex MCP (RAG)
                              Shopify Admin API
                              Chatwoot API
```

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

