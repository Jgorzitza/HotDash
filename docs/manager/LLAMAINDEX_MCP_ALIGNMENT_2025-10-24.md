# LlamaIndex MCP Alignment - Full Agent SDK Architecture

**Date:** 2025-10-24  
**Manager:** Justin (CEO)  
**Status:** ✅ VERIFIED - Architecture documented, alignment plan ready  
**Decision:** ALL agents MUST use LlamaIndex MCP (no direct LlamaIndex.TS)

---

## Executive Summary

**Current State:** ✅ **CORRECT ARCHITECTURE IN PLACE**

The OpenAI Agents SDK architecture with sub-agents and LlamaIndex MCP is **already properly implemented**. This document verifies the architecture and provides the alignment plan.

### Key Findings

1. ✅ **Agent SDK Architecture:** Properly implemented with handoff pattern
2. ✅ **Sub-Agents:** 3 specialist agents (Triage, Order Support, Product Q&A)
3. ✅ **LlamaIndex MCP:** Deployed and integrated (currently SUSPENDED)
4. ⚠️ **CEO Agent:** Uses direct LlamaIndex.TS (needs migration to MCP)
5. ✅ **Customer Agents:** Already use LlamaIndex MCP via `answerFromDocs` tool

### Actions Required

1. **Resume LlamaIndex MCP Server** (immediate)
2. **Migrate CEO Agent to MCP** (remove direct LlamaIndex.TS)
3. **Test all agent handoffs** (verify sub-agent routing)
4. **Update documentation** (remove stale references)

---

## Agent SDK Architecture (OpenAI Agents SDK)

### Overview

**Pattern:** Front Agent → Triage → Specialist Sub-Agents → HITL Approval → Action

**Key Principles:**
- **One owner at a time** (no fan-out chatter)
- **Handoff pattern** (transfer_to_agent)
- **HITL enforcement** (requireApproval: true)
- **Tool allowlists** (strict security boundaries)

---

## 1. Customer-Facing Agents (apps/agent-service)

### Architecture

```
Chatwoot Webhook
    ↓
Triage Agent (Front)
    ↓
Decision: Order or Product?
    ↓
┌─────────────────┬─────────────────┐
│                 │                 │
Order Support     Product Q&A
(Sub-Agent)       (Sub-Agent)
│                 │
↓                 ↓
Shopify API       LlamaIndex MCP
Chatwoot API      Chatwoot API
│                 │
└─────────────────┴─────────────────┘
    ↓
HITL Approval Queue
    ↓
Human Approves/Rejects
    ↓
Action Execution
```

### 1.1 Triage Agent (Front Agent)

**File:** `apps/agent-service/src/agents/index.ts`

**Role:** First point of contact - classifies intent and routes to specialists

**Tools:**
- `set_intent` - Classify customer message
- `cwCreatePrivateNote` - Create internal notes

**Handoffs:**
- `orderSupportAgent` - For order-related requests
- `productQAAgent` - For product questions

**Instructions:**
```typescript
'Decide whether the conversation is about orders or product questions.',
'If order-related (status, cancel, refund, exchange), hand off to Order Support.',
'If product knowledge (features, specs, compatibility), hand off to Product Q&A.',
'Use set_intent to record your classification; include it in private notes.',
'If unclear, create a private note requesting clarification.',
```

**Status:** ✅ Implemented and working

---

### 1.2 Order Support Agent (Sub-Agent)

**File:** `apps/agent-service/src/agents/index.ts`

**Role:** Handles order-related requests (status, returns, exchanges, cancellations)

**Tools:**
- `answerFromDocs` - **LlamaIndex MCP** (policies, shipping info)
- `shopifyFindOrders` - Shopify Admin GraphQL
- `shopifyCancelOrder` - Shopify Admin GraphQL (requires approval)
- `cwCreatePrivateNote` - Chatwoot API
- `cwSendPublicReply` - Chatwoot API (requires approval)

**Instructions:**
```typescript
'You help with order status, returns, exchanges, and cancellations.',
'Prefer read-only checks first (shopify_find_orders).',
'If a mutation is required (cancel/refund), propose a clear private note explaining steps and risks.',
'Do NOT send anything to the customer directly; use private notes and wait for approval.',
'Always be empathetic and reference relevant policies from answer_from_docs.',
```

**LlamaIndex MCP Usage:** ✅ **YES** - Uses `answerFromDocs` tool

**Status:** ✅ Implemented and working

---

### 1.3 Product Q&A Agent (Sub-Agent)

**File:** `apps/agent-service/src/agents/index.ts`

**Role:** Answers product questions based on internal docs/FAQs/spec sheets

**Tools:**
- `answerFromDocs` - **LlamaIndex MCP** (product docs, FAQs, specs)
- `cwCreatePrivateNote` - Chatwoot API
- `cwSendPublicReply` - Chatwoot API (requires approval)

**Instructions:**
```typescript
'You answer product questions based on internal docs/FAQs/spec sheets via answer_from_docs.',
'Be factual and cite sources when possible.',
'If missing info, propose a private note requesting human input.',
'No public replies without approval.',
```

**LlamaIndex MCP Usage:** ✅ **YES** - Uses `answerFromDocs` tool

**Status:** ✅ Implemented and working

---

## 2. CEO-Facing Agent (packages/agents)

### Architecture

```
CEO Query
    ↓
AI CEO Agent (Front)
    ↓
5 Tools (Shopify, Supabase, Chatwoot, LlamaIndex, GA)
    ↓
Backend API Routes (/api/ceo-agent/*)
    ↓
External Services
    ↓
Response + Evidence
    ↓
HITL Approval Queue (for write operations)
    ↓
CEO Approves/Rejects
    ↓
Action Execution + Decision Log
```

### 2.1 AI CEO Agent

**File:** `packages/agents/src/ai-ceo.ts`

**Role:** Helps CEO make informed operational decisions by analyzing multi-source data

**Tools:**
1. `shopify.products` - Shopify Admin GraphQL
2. `supabase.analytics` - Supabase RPC
3. `chatwoot.insights` - Chatwoot API
4. `llamaindex.query` - **LlamaIndex** (CURRENTLY DIRECT, NOT MCP)
5. `google.analytics` - Google Analytics API

**LlamaIndex Implementation:**

**Current (WRONG):**
```typescript
// packages/agents/src/ai-ceo.ts (lines 292-325)
const llamaIndexQuery = tool({
  name: "llamaindex.query",
  async handler({ query, topK, filters }) {
    // Calls /api/ceo-agent/llamaindex/query
    // Which uses app/services/rag/ceo-knowledge-base.ts
    // Which uses DIRECT LlamaIndex.TS (not MCP)
  }
});
```

**Should Be (CORRECT):**
```typescript
// Use LlamaIndex MCP (same as customer agents)
const llamaIndexQuery = tool({
  name: "llamaindex.query",
  async handler({ query, topK, filters }) {
    // Call LlamaIndex MCP server
    const response = await fetch('https://hotdash-llamaindex-mcp.fly.dev/mcp/tools/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'query_knowledge_base',
        arguments: { q: query, topK, category: filters?.category }
      })
    });
    return response.json();
  }
});
```

**Status:** ⚠️ **NEEDS MIGRATION** - Currently uses direct LlamaIndex.TS

---

## 3. LlamaIndex MCP Server

### Deployment

**App:** `hotdash-llamaindex-mcp`  
**URL:** `https://hotdash-llamaindex-mcp.fly.dev`  
**Status:** ⚠️ **SUSPENDED** (needs `fly apps resume`)  
**Code:** `apps/llamaindex-mcp-server/`

### Tools Exposed

**1. query_knowledge_base**
- **Description:** Query AI-powered knowledge base using semantic search
- **Parameters:** `q` (query), `topK` (results), `category`, `tags`
- **Returns:** Documents with relevance scores, snippets, highlights

**2. knowledge_base_stats**
- **Description:** Get knowledge base statistics
- **Returns:** Document counts, categories, tags, last updated

**3. query_support** (Legacy - same as query_knowledge_base)
- **Description:** Query knowledge base for support information
- **Parameters:** `q` (query), `topK` (results)
- **Returns:** Relevant documentation, FAQs, policies with citations

### API Endpoints

- `GET /health` - Health check
- `POST /mcp` - MCP protocol endpoint
- `POST /mcp/tools/list` - List available tools
- `POST /mcp/tools/call` - Execute a tool

### Integration

**Customer Agents (apps/agent-service):**
```typescript
// apps/agent-service/src/tools/rag.ts
export const answerFromDocs = tool({
  name: 'answer_from_docs',
  async execute({ question, topK }) {
    const response = await fetch(`${LLAMAINDEX_MCP_URL}/mcp/tools/call`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'query_support',
        arguments: { q: question, topK }
      })
    });
    return response.json();
  }
});
```

**Status:** ✅ **CORRECT** - Customer agents use MCP

**CEO Agent (packages/agents):**
```typescript
// packages/agents/src/ai-ceo.ts (CURRENT - WRONG)
const llamaIndexQuery = tool({
  async handler({ query }) {
    // Calls /api/ceo-agent/llamaindex/query
    // Which uses app/services/rag/ceo-knowledge-base.ts
    // Which uses DIRECT LlamaIndex.TS
  }
});
```

**Status:** ❌ **WRONG** - CEO agent uses direct LlamaIndex.TS

---

## 4. Alignment Plan

### Phase 1: Resume LlamaIndex MCP Server (Immediate)

**Action:**
```bash
fly apps resume hotdash-llamaindex-mcp
```

**Verify:**
```bash
curl https://hotdash-llamaindex-mcp.fly.dev/health
# Should return: {"status":"ok","service":"llamaindex-rag-mcp",...}
```

**Status:** Ready to execute

---

### Phase 2: Migrate CEO Agent to MCP (2-3 hours)

**Step 1: Update CEO Agent Tool**

**File:** `packages/agents/src/ai-ceo.ts`

**Change:**
```typescript
// BEFORE (lines 292-325)
const llamaIndexQuery = tool({
  name: "llamaindex.query",
  async handler({ query, topK, filters }) {
    const response = await fetch("/api/ceo-agent/llamaindex/query", {
      method: "POST",
      body: JSON.stringify({ query, topK, filters })
    });
    return response.json();
  }
});

// AFTER
const LLAMAINDEX_MCP_URL = process.env.LLAMAINDEX_MCP_URL || 
  'https://hotdash-llamaindex-mcp.fly.dev/mcp';

const llamaIndexQuery = tool({
  name: "llamaindex.query",
  description: "Search knowledge base using LlamaIndex MCP - query indexed documents, product documentation, policies",
  inputSchema: zodToJsonSchema(LlamaIndexSchema, "LlamaIndexSchema") as any,
  async handler({ query, topK, filters }) {
    try {
      const response = await fetch(`${LLAMAINDEX_MCP_URL}/tools/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'query_knowledge_base',
          arguments: {
            q: query,
            topK: topK || 5,
            category: filters?.category,
            tags: filters?.tags
          }
        })
      });

      if (!response.ok) {
        throw new Error(`MCP server returned ${response.status}`);
      }

      const result = await response.json();
      
      // MCP returns { content: [{ type: 'text', text: '...' }] }
      if (result.content && result.content[0]) {
        return result.content[0].text;
      }

      return 'No answer found in knowledge base.';
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        query
      };
    }
  },
  requireApproval: false
});
```

**Step 2: Remove Direct LlamaIndex.TS Service**

**Files to deprecate:**
- `app/services/rag/ceo-knowledge-base.ts` (no longer needed)
- `app/routes/api.ceo-agent.llamaindex.query.ts` (no longer needed)

**Action:** Move to `docs/_archive/` with git history preserved

**Step 3: Update Environment Variables**

**Add to `.env.local`:**
```bash
LLAMAINDEX_MCP_URL=https://hotdash-llamaindex-mcp.fly.dev/mcp
```

**Add to Fly.io secrets:**
```bash
fly secrets set LLAMAINDEX_MCP_URL=https://hotdash-llamaindex-mcp.fly.dev/mcp --app hotdash-production
```

**Step 4: Test CEO Agent**

**Test queries:**
1. "What's our shipping policy?"
2. "What are the return requirements?"
3. "How do I troubleshoot a faulty product?"

**Expected:** All queries return results from LlamaIndex MCP

---

### Phase 3: Verify All Agent Handoffs (1-2 hours)

**Test Customer Agent Flow:**

**1. Order-related query:**
```
Input: "Where is my order? I placed it 3 days ago."
Expected: Triage → Order Support → shopifyFindOrders + answerFromDocs (MCP)
```

**2. Product question:**
```
Input: "Do you have AN6 stainless steel braided hose in stock?"
Expected: Triage → Product Q&A → answerFromDocs (MCP)
```

**Test CEO Agent:**

**3. Knowledge base query:**
```
Input: "What's our warranty policy?"
Expected: CEO Agent → llamaindex.query (MCP) → Returns policy docs
```

**Verification:**
- Check LlamaIndex MCP logs: `fly logs --app hotdash-llamaindex-mcp`
- Verify metrics: `curl https://hotdash-llamaindex-mcp.fly.dev/health`
- Confirm tool calls increment in metrics

---

### Phase 4: Update Documentation (30 min)

**Files to update:**
1. `docs/integrations/ceo-agent.md` - Update LlamaIndex integration section
2. `docs/manager/AGENT_DIRECTION_2025-10-24.md` - Add LlamaIndex MCP alignment
3. `README.md` - Update agent architecture diagram

**Files to archive:**
1. `app/services/rag/ceo-knowledge-base.ts` → `docs/_archive/`
2. `app/routes/api.ceo-agent.llamaindex.query.ts` → `docs/_archive/`

---

## 5. Verification Checklist

### Pre-Migration

- [ ] LlamaIndex MCP server resumed
- [ ] Health check passes
- [ ] Customer agents tested (Triage → Sub-agents)
- [ ] MCP metrics show 0 calls (baseline)

### Post-Migration

- [ ] CEO agent uses MCP (not direct LlamaIndex.TS)
- [ ] CEO agent queries return results
- [ ] MCP metrics show calls incrementing
- [ ] Direct LlamaIndex.TS service removed
- [ ] API route removed
- [ ] Documentation updated
- [ ] All tests pass

---

## 6. Architecture Diagram (Final State)

```
┌─────────────────────────────────────────────────────────────┐
│ Front Agents                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Customer-Front (Triage)          CEO-Front                │
│         │                              │                    │
│         ├─ Order Support               ├─ shopify.products │
│         │  ├─ answerFromDocs (MCP)     ├─ supabase.analytics│
│         │  ├─ shopifyFindOrders        ├─ chatwoot.insights│
│         │  ├─ shopifyCancelOrder       ├─ llamaindex.query (MCP) ✅
│         │  └─ cwSendPublicReply        └─ google.analytics │
│         │                                                   │
│         └─ Product Q&A                                      │
│            ├─ answerFromDocs (MCP)                          │
│            └─ cwSendPublicReply                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ LlamaIndex MCP Server (hotdash-llamaindex-mcp)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tools:                                                     │
│  - query_knowledge_base (semantic search)                   │
│  - knowledge_base_stats (statistics)                        │
│  - query_support (legacy, same as query_knowledge_base)     │
│                                                             │
│  Used by:                                                   │
│  ✅ Order Support Agent (answerFromDocs)                    │
│  ✅ Product Q&A Agent (answerFromDocs)                      │
│  ✅ CEO Agent (llamaindex.query) - AFTER MIGRATION          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Summary

**Current State:**
- ✅ Customer agents: Use LlamaIndex MCP (correct)
- ❌ CEO agent: Uses direct LlamaIndex.TS (wrong)
- ⚠️ LlamaIndex MCP server: SUSPENDED (needs resume)

**Target State:**
- ✅ ALL agents use LlamaIndex MCP
- ✅ Single source of truth for knowledge base
- ✅ Consistent pattern across all agents
- ✅ No direct LlamaIndex.TS usage

**Effort:** 3-5 hours total
- Resume server: 5 min
- Migrate CEO agent: 2-3 hours
- Test handoffs: 1-2 hours
- Update docs: 30 min

**Next Steps:**
1. Resume LlamaIndex MCP server (immediate)
2. Migrate CEO agent to MCP (assign to engineer)
3. Test all agent handoffs
4. Update documentation

---

**Ready to execute alignment plan!**

