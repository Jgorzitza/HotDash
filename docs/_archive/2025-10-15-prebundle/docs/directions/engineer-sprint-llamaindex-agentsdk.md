---
epoch: 2025.10.E1
doc: docs/directions/engineer-sprint-llamaindex-agentsdk.md
owner: manager
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Engineer — Sprint Direction: LlamaIndex MCP + Agent SDK Implementation

**Sprint Duration**: 2-3 weeks  
**Priority**: High  
**Coordination**: AI agent (LlamaIndex), Product (approval queue UI)

---

## Executive Summary

Implement the approved MCP-first agent architecture combining:

1. **Google Analytics Direct API** integration (2-4 hours)
2. **LlamaIndex RAG MCP Server** on Fly.io (Week 1)
3. **OpenAI Agent SDK Service** with approval workflows (Week 2-3)

This sprint transforms HotDash from manual support to AI-assisted customer service while maintaining human-in-the-loop safety controls.

---

## Canon References

- North Star: `docs/NORTH_STAR.md` (updated with MCP architecture)
- Git Protocol: `docs/git_protocol.md`
- Direction Governance: `docs/directions/README.md`
- MCP Tools: `docs/directions/mcp-tools-reference.md` (now includes 7 servers)
- Credential Map: `docs/ops/credential_index.md`
- Agent SDK Doc: `docs/AgentSDKopenAI.md`

---

## Phase 1: Google Analytics Direct API Integration (Priority 1)

### Goal

Replace mock GA client with direct Google Analytics Data API to enable real-time analytics tiles.

### Background

- Design doc exists: `docs/design/ga_ingest.md`
- Current state: Mock mode (`GA_USE_MOCK=1`)
- Service account ready: `vault/occ/google/analytics-service-account.json`
- **CEO Note**: Check with CEO if credentials need enabling for live data

### Implementation Tasks

#### 1.1 Add GA Client Library

```bash
npm install @google-analytics/data@^4.0.0
```

#### 1.2 Implement Direct API Client

**File**: `app/services/ga/directClient.ts`

```typescript
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { GaClient, GaSession, DateRange } from "./types";

export class GoogleAnalyticsDirectClient implements GaClient {
  private client: BetaAnalyticsDataClient;
  private propertyId: string;

  constructor() {
    // Uses GOOGLE_APPLICATION_CREDENTIALS env var automatically
    this.client = new BetaAnalyticsDataClient();
    this.propertyId = process.env.GA_PROPERTY_ID!;

    if (!this.propertyId) {
      throw new Error("GA_PROPERTY_ID environment variable required");
    }
  }

  async fetchLandingPageSessions(range: DateRange): Promise<GaSession[]> {
    const request = {
      property: `properties/${this.propertyId}`,
      dateRanges: [
        {
          startDate: range.startDate,
          endDate: range.endDate,
        },
      ],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "sessions" }],
      limit: 100,
    };

    const [response] = await this.client.runReport(request);

    // Transform to GaSession format
    return (response.rows || []).map((row) => ({
      landingPage: row.dimensionValues?.[0]?.value || "",
      sessions: parseInt(row.metricValues?.[0]?.value || "0", 10),
      wowDelta: 0, // Calculated separately
    }));
  }
}
```

#### 1.3 Update Environment Configuration

**File**: `.env.local.example`

```bash
# Google Analytics (Direct API - not MCP)
GOOGLE_APPLICATION_CREDENTIALS=/home/justin/HotDash/hot-dash/vault/occ/google/analytics-service-account.json
GA_PROPERTY_ID=your-property-id-here
GA_USE_MOCK=0  # Set to 1 for local dev without GA access
```

#### 1.4 Update Service Factory

**File**: `app/services/ga/client.ts`

```typescript
import { GoogleAnalyticsDirectClient } from "./directClient";
import { MockGAClient } from "./mockClient";
import type { GaClient } from "./types";

export function createGAClient(): GaClient {
  const useMock = process.env.GA_USE_MOCK === "1";

  if (useMock) {
    console.log("[GA] Using mock client");
    return new MockGAClient();
  }

  console.log("[GA] Using direct API client");
  return new GoogleAnalyticsDirectClient();
}
```

#### 1.5 Testing Requirements

- ✅ Unit tests with mocked GA API responses
- ✅ Integration test with real credentials (skip in CI if not available)
- ✅ Verify dashboard tile shows real data when `GA_USE_MOCK=0`
- ✅ Confirm mock mode still works for development

### Evidence Required

- [ ] Working GA tile with real data
- [ ] Test coverage >80% for GA service
- [ ] Screenshot of live analytics data
- [ ] Log in `feedback/engineer.md`

### Timeline

**2-4 hours** (can complete in parallel with LlamaIndex MCP setup)

---

## Phase 2: LlamaIndex RAG MCP Server (Week 1)

### Goal

Deploy LlamaIndex RAG capabilities as an HTTP MCP server on Fly.io, making knowledge base queries available to all agents and the Agent SDK.

### Architecture Decision

**Approach**: Thin HTTP MCP wrapper around existing `scripts/ai/llama-workflow/` CLI

- ✅ Reuses completed LlamaIndex implementation (2025-10-11)
- ✅ Zero regression risk
- ✅ Fast implementation (1-2 days)

### Directory Structure

```
apps/llamaindex-mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts           # MCP protocol handler
│   ├── handlers/
│   │   ├── query.ts        # Wraps llama-workflow query
│   │   ├── refresh.ts      # Wraps llama-workflow refresh
│   │   └── insight.ts      # Wraps llama-workflow insight
│   └── types.ts
├── Dockerfile
└── fly.toml
```

### Implementation Tasks

#### 2.1 Scaffold MCP Server

```bash
cd /home/justin/HotDash/hot-dash
mkdir -p apps/llamaindex-mcp-server/src/handlers
cd apps/llamaindex-mcp-server

npm init -y
npm install @modelcontextprotocol/sdk express zod
npm install -D typescript @types/node @types/express ts-node
```

#### 2.2 Implement MCP Protocol Handler

**File**: `apps/llamaindex-mcp-server/src/server.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { queryHandler } from "./handlers/query";
import { refreshHandler } from "./handlers/refresh";
import { insightHandler } from "./handlers/insight";

const app = express();
app.use(express.json());

// MCP server instance
const server = new Server(
  {
    name: "llamaindex-rag-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {
        list: true,
        call: true,
      },
    },
  },
);

// Tool definitions
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "query_support",
      description: "Query knowledge base for support information",
      inputSchema: {
        type: "object",
        properties: {
          q: { type: "string", description: "Search query" },
          topK: { type: "number", default: 5 },
        },
        required: ["q"],
      },
    },
    {
      name: "refresh_index",
      description: "Rebuild vector index from all sources",
      inputSchema: {
        type: "object",
        properties: {
          sources: { type: "string", default: "all" },
          full: { type: "boolean", default: true },
        },
      },
    },
    {
      name: "insight_report",
      description: "Generate AI insights from telemetry",
      inputSchema: {
        type: "object",
        properties: {
          window: { type: "string", default: "7d" },
          format: {
            type: "string",
            enum: ["md", "json", "txt"],
            default: "md",
          },
        },
      },
    },
  ],
}));

// Tool execution
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "query_support":
      return queryHandler(args);
    case "refresh_index":
      return refreshHandler(args);
    case "insight_report":
      return insightHandler(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// HTTP endpoint for remote access
app.post("/mcp", async (req, res) => {
  // Implement MCP over HTTP (if needed for Fly.io)
  // For now, stdio is sufficient for Agent SDK
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`LlamaIndex MCP server listening on :${port}`);
});

// Start stdio transport for local/dev usage
const transport = new StdioServerTransport();
server.connect(transport);
```

#### 2.3 Implement Tool Handlers (Thin Wrappers)

**File**: `apps/llamaindex-mcp-server/src/handlers/query.ts`

```typescript
import { execSync } from "child_process";
import path from "path";

export async function queryHandler(args: { q: string; topK?: number }) {
  const { q, topK = 5 } = args;

  // Path to existing llama-workflow CLI
  const cliPath = path.join(
    __dirname,
    "../../../scripts/ai/llama-workflow/dist/cli.js",
  );

  try {
    const result = execSync(`node ${cliPath} query -q "${q}" --topK ${topK}`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
```

**Similar implementation for** `refresh.ts` and `insight.ts`

#### 2.4 Deploy to Fly.io

**File**: `apps/llamaindex-mcp-server/fly.toml`

```toml
app = "hotdash-llamaindex-mcp"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

**Deployment Commands:**

```bash
cd apps/llamaindex-mcp-server
fly launch --no-deploy
fly secrets set OPENAI_API_KEY="$(cat ~/HotDash/hot-dash/vault/occ/openai/api_key_staging.env | cut -d= -f2)"
fly secrets set SUPABASE_URL="..."
fly secrets set SUPABASE_SERVICE_KEY="..."
fly deploy
```

#### 2.5 Update MCP Config

**File**: `.mcp.json`

```json
{
  "mcpServers": {
    "llamaindex-rag": {
      "type": "http",
      "url": "https://hotdash-llamaindex-mcp.fly.dev/mcp"
    }
  }
}
```

### Evidence Required

- [ ] MCP server deployed and healthy on Fly
- [ ] Can query from Cursor: "Using llamaindex-rag, query support KB: shipping policy"
- [ ] API responds with <500ms P95
- [ ] Comprehensive tests covering all 3 tools
- [ ] Documentation in `docs/runbooks/llamaindex-mcp-server.md`

### Timeline

**Week 1** (5-7 days, can overlap with AI agent's LlamaIndex improvements)

---

## Phase 3: OpenAI Agent SDK Service (Week 2-3)

### Goal

Build customer support agent orchestration using OpenAI Agent SDK, calling LlamaIndex MCP for knowledge base access.

### Architecture

```
apps/agent-service/
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts              # Express + Agent SDK orchestration
│   ├── agents/
│   │   └── index.ts           # Triage + specialist agents
│   ├── tools/
│   │   ├── rag.ts             # MCP wrapper for LlamaIndex
│   │   ├── shopify.ts         # Direct Shopify GraphQL
│   │   └── chatwoot.ts        # Direct Chatwoot API
│   ├── feedback/
│   │   └── store.ts           # Training data collection
│   └── types.ts
├── Dockerfile
└── fly.toml
```

### Implementation Tasks

#### 3.1 Scaffold Agent Service

```bash
cd /home/justin/HotDash/hot-dash
mkdir -p apps/agent-service/src/{agents,tools,feedback}
cd apps/agent-service

npm init -y
npm install @openai/agents zod express body-parser
npm install -D typescript @types/node @types/express ts-node
```

#### 3.2 Implement RAG Tool (MCP Wrapper)

**File**: `apps/agent-service/src/tools/rag.ts`

```typescript
import { tool } from "@openai/agents";
import { z } from "zod";

// Agent SDK calls LlamaIndex MCP automatically
export const answerFromDocs = tool({
  name: "answer_from_docs",
  description: "Answer questions using internal docs/FAQs/policies via RAG",
  parameters: z.object({
    question: z.string(),
    topK: z.number().optional(),
  }),
  // This tells Agent SDK to route to MCP server
  mcp: {
    server: "llamaindex-rag",
    operation: "query_support",
  },
});
```

#### 3.3 Implement Shopify + Chatwoot Tools

**Follow patterns from** `docs/AgentSDKopenAI.md` sections 4-5

Key tools:

- `shopifyFindOrders` (read-only, no approval)
- `shopifyCancelOrder` (needsApproval: true)
- `cwCreatePrivateNote` (no approval)
- `cwSendPublicReply` (needsApproval: true)

#### 3.4 Define Agents

**File**: `apps/agent-service/src/agents/index.ts`

```typescript
import { Agent } from "@openai/agents";
import { answerFromDocs } from "../tools/rag";
import { shopifyFindOrders, shopifyCancelOrder } from "../tools/shopify";
import { cwCreatePrivateNote, cwSendPublicReply } from "../tools/chatwoot";

export const orderSupportAgent = new Agent({
  name: "Order Support",
  instructions: [
    "You help with order status, returns, exchanges, cancellations.",
    "Always check order status first (shopify_find_orders).",
    "For policy questions, use answer_from_docs.",
    "Never send public replies without approval.",
    "Create private notes with your recommendations.",
  ].join("\n"),
  tools: [
    answerFromDocs,
    shopifyFindOrders,
    shopifyCancelOrder,
    cwCreatePrivateNote,
    cwSendPublicReply,
  ],
});

export const productQAAgent = new Agent({
  name: "Product Q&A",
  instructions: [
    "Answer product questions using answer_from_docs.",
    "Be factual and cite sources when possible.",
    "If unsure, create a private note requesting human input.",
  ].join("\n"),
  tools: [answerFromDocs, cwCreatePrivateNote, cwSendPublicReply],
});

export const triageAgent = new Agent({
  name: "Triage",
  instructions: [
    "Classify conversation intent: order_status, product_question, return, etc.",
    "Hand off to appropriate specialist agent.",
    "If unclear, create a private note requesting clarification.",
  ].join("\n"),
  tools: [],
  handoffs: [orderSupportAgent, productQAAgent],
});
```

#### 3.5 Implement Webhook + Approval Endpoints

**Follow pattern from** `docs/AgentSDKopenAI.md` section 7

Key endpoints:

- `POST /webhooks/chatwoot` - Incoming messages
- `GET /approvals` - List pending approvals
- `POST /approvals/:id/:idx/approve` - Approve action
- `POST /approvals/:id/:idx/reject` - Reject action

#### 3.6 Deploy to Fly.io

```bash
cd apps/agent-service
fly launch --no-deploy
fly secrets set OPENAI_API_KEY="..."
fly secrets set CHATWOOT_API_TOKEN="..."
fly secrets set SHOPIFY_ADMIN_TOKEN="..."
fly deploy
```

#### 3.7 Dashboard Integration (Approval Queue UI)

**Coordinate with Product agent** for UI design

Required UI components:

- `/approvals` route - List pending approvals
- `ApprovalCard` component - Shows tool call details
- Approve/Reject buttons
- Real-time updates (polling or websockets)

**File**: `app/routes/approvals.tsx`

```typescript
import { json } from '@react-router/node';
import { useLoaderData } from '@react-router/react';

export async function loader() {
  const response = await fetch('https://hotdash-agent-service.fly.dev/approvals');
  const approvals = await response.json();
  return json({ approvals });
}

export default function ApprovalsRoute() {
  const { approvals } = useLoaderData<typeof loader>();

  return (
    <div className="approvals-queue">
      <h1>Pending Agent Approvals</h1>
      {approvals.map(approval => (
        <ApprovalCard key={approval.id} {...approval} />
      ))}
    </div>
  );
}
```

### Evidence Required

- [ ] Agent service deployed on Fly
- [ ] Can process Chatwoot webhooks
- [ ] Approval queue UI functional
- [ ] Test conversation with full approve/reject flow
- [ ] Documentation for operators
- [ ] Monitoring dashboard (latency, approval queue depth)

### Timeline

**Week 2-3** (10-14 days)

---

## Coordination Points

### With AI Agent

- LlamaIndex MCP server implementation (parallel work)
- Index refresh procedures
- Query optimization
- Training data format

### With Product Agent

- Approval queue UI design
- Operator workflows
- Error messaging
- Success metrics

### With Support Agent

- Chatwoot webhook configuration
- Operator training materials
- Escalation procedures
- Feedback collection

### With CEO

- **CRITICAL**: Verify GA service account access before implementing Direct API
- Approval for Agent SDK in production
- Customer communication about AI assistance

---

## Testing Strategy

### Unit Tests

- ✅ GA client (mock API responses)
- ✅ MCP tool handlers
- ✅ Agent tool execution
- ✅ Approval state management

### Integration Tests

- ✅ GA Direct API with real credentials
- ✅ LlamaIndex MCP end-to-end
- ✅ Agent SDK + MCP tool calls
- ✅ Chatwoot webhook → agent → approval

### E2E Tests (Playwright)

- ✅ Operator views approval queue
- ✅ Operator approves/rejects actions
- ✅ GA tile shows real data

---

## Rollout Plan

### Week 1: GA + LlamaIndex MCP

- Day 1-2: GA Direct API implementation
- Day 3-5: LlamaIndex MCP server scaffold and deployment
- Day 5-7: Testing and documentation

### Week 2: Agent SDK Foundation

- Day 8-10: Agent service scaffolding
- Day 11-12: Tool implementations
- Day 13-14: Agent definitions and handoffs

### Week 3: Integration + Approval UI

- Day 15-17: Approval queue UI
- Day 18-19: End-to-end testing
- Day 20-21: Documentation and operator training

---

## Success Criteria

### Phase 1 (GA Direct API)

- ✅ Dashboard shows real analytics data
- ✅ <100ms P95 query latency
- ✅ Zero mock mode usage in production

### Phase 2 (LlamaIndex MCP)

- ✅ MCP server responds to queries
- ✅ <500ms P95 response time
- ✅ Accessible from Cursor and Agent SDK
- ✅ 99% uptime

### Phase 3 (Agent SDK)

- ✅ Agents handle 3+ conversation types
- ✅ Zero unapproved customer-facing actions
- ✅ <30s approval queue latency
- ✅ Operators can approve/reject in <5 clicks

---

## Rollback Plan

### GA Direct API

- Set `GA_USE_MOCK=1` to revert to mock mode
- Zero customer impact

### LlamaIndex MCP

- Remove from `.mcp.json`
- Agent SDK falls back to inline implementations

### Agent SDK Service

- Disable Chatwoot webhook
- Revert to manual support
- Preserve training data

---

## Evidence Logging

All work must be logged in `feedback/engineer.md` with:

- Timestamp
- Commands executed
- Output/log paths
- Screenshots (for UI work)
- Test results
- Deployment confirmations

Example entry:

```
## 2025-10-11T14:30:00Z — GA Direct API Implementation Complete

**Actions**:
- Installed @google-analytics/data@4.0.0
- Implemented DirectGAClient in app/services/ga/directClient.ts
- Updated service factory and env config
- Added unit tests with 85% coverage

**Evidence**:
- Test output: artifacts/engineer/20251011T1430Z/test-ga-direct.log
- Screenshot: artifacts/engineer/20251011T1430Z/ga-tile-live-data.png
- Deployment: Staging updated, verified working

**Status**: ✅ Complete, ready for production
```

---

## Questions/Escalation

### Blockers

- Missing GA credentials? → Escalate to CEO
- LlamaIndex API changes? → Coordinate with AI agent
- Agent SDK questions? → Reference `docs/AgentSDKopenAI.md`, escalate if unclear

### Clarifications Needed

- Log in `feedback/engineer.md` with clear question
- Include context and what you've tried
- Tag relevant agents (@ai, @product, @support)

---

**PRIORITY ORDER**:

1. 🚨 GA Direct API (2-4 hours, unblocks analytics)
2. 🏗️ LlamaIndex MCP (Week 1, enables Agent SDK)
3. 🤖 Agent SDK (Week 2-3, delivers customer value)

Start immediately. Log everything. Ship with confidence.
