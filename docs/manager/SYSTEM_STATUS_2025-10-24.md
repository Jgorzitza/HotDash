# System Status Report - 2025-10-24

**Manager:** Augment Agent (Manager Role)
**CEO:** Justin
**Date:** 2025-10-24
**Purpose:** Pre-direction update system audit

---

## Executive Summary

**Status:** ⚠️ **MIXED** - Some systems operational, critical gaps identified

### Key Findings

1. ✅ **LlamaIndex MCP Server** - Deployed but SUSPENDED (needs resume)
2. ⚠️ **Chatwoot** - Deployed but NOT ACCESSIBLE (critical issue)
3. ✅ **Main App** - Operational (blank page bug fixed by Auggie)
4. ✅ **Image Search Decision** - Simplified approach approved (GPT-4 Vision + text embeddings)

### Critical Actions Required

1. **Resume LlamaIndex MCP Server** (hotdash-llamaindex-mcp.fly.dev)
2. **Investigate Chatwoot Accessibility** (hotdash-chatwoot.fly.dev)
3. **Update All Agent Directions** (remove stale, add image search)

---

## 1. LlamaIndex MCP Tool Status

### Current State

**Deployment:** ✅ DEPLOYED (hotdash-llamaindex-mcp.fly.dev)  
**Status:** ⚠️ **SUSPENDED** (needs `fly apps resume`)  
**Health Check:** ✅ Working when resumed  
**Production Usage:** ❌ NOT CURRENTLY USED

### Evidence

```bash
# Fly apps list
hotdash-llamaindex-mcp	personal	suspended

# Health check (when resumed)
curl https://hotdash-llamaindex-mcp.fly.dev/health
{
  "status":"ok",
  "service":"llamaindex-rag-mcp",
  "version":"1.0.0",
  "tools":["query_support","refresh_index","insight_report"],
  "metrics":{
    "query_support":{"calls":0,"errors":0},
    "refresh_index":{"calls":0,"errors":0},
    "insight_report":{"calls":0,"errors":0}
  }
}
```

### Integration Points

**1. CEO Agent (packages/agents/src/ai-ceo.ts)**
- ✅ Tool defined: `llamaIndexQuery`
- ✅ API route exists: `/api/ceo-agent/llamaindex/query`
- ✅ Service exists: `app/services/rag/ceo-knowledge-base.ts`
- ❌ **NOT USED** - Server suspended, 0 calls in metrics

**2. Customer Agent (apps/agent-service/src/tools/rag.ts)**
- ✅ Tool defined: `answerFromDocs`
- ✅ Calls MCP server: `https://hotdash-llamaindex-mcp.fly.dev/mcp`
- ❌ **NOT USED** - Server suspended

**3. MCP Configuration (mcp/mcp-config.json)**
- ✅ Configured: `llamaindex` server
- ✅ URL: `http://localhost:4000/mcp` (local dev)
- ⚠️ Production URL different: `https://hotdash-llamaindex-mcp.fly.dev/mcp`

### Architecture

```
┌─────────────────────────────────────────────┐
│ CEO Agent (packages/agents/src/ai-ceo.ts)  │
│ - llamaIndexQuery tool                      │
└─────────────────┬───────────────────────────┘
                  │ HTTP POST
                  ▼
┌─────────────────────────────────────────────┐
│ API Route                                   │
│ /api/ceo-agent/llamaindex/query             │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Service (app/services/rag/ceo-knowledge-    │
│ base.ts)                                    │
│ - queryKnowledgeBase()                      │
│ - Uses LlamaIndex.TS directly               │
│ - Loads from packages/memory/indexes/       │
│   operator_knowledge/                       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Customer Agent (apps/agent-service)         │
│ - answerFromDocs tool                       │
└─────────────────┬───────────────────────────┘
                  │ HTTP POST
                  ▼
┌─────────────────────────────────────────────┐
│ LlamaIndex MCP Server (SUSPENDED)           │
│ https://hotdash-llamaindex-mcp.fly.dev/mcp  │
│ - query_support                             │
│ - refresh_index                             │
│ - insight_report                            │
└─────────────────────────────────────────────┘
```

### Findings

**✅ GOOD:**
- MCP server is built and deployed
- Health endpoint works
- Tools are properly defined
- Integration code exists

**⚠️ ISSUES:**
- Server is SUSPENDED (not running)
- 0 calls in metrics (not being used)
- CEO agent uses direct LlamaIndex.TS (not MCP)
- Customer agent would fail (MCP server down)

**🤔 CONFUSION:**
- **Two different implementations:**
  1. CEO agent: Direct LlamaIndex.TS via `app/services/rag/ceo-knowledge-base.ts`
  2. Customer agent: MCP server via HTTP
- **Why the duplication?**
  - CEO agent was implemented first (direct approach)
  - MCP server was added later (preferred pattern)
  - CEO agent never migrated to MCP

### Recommendation

**Option 1: Resume MCP Server + Migrate CEO Agent** (Preferred)
- Resume `hotdash-llamaindex-mcp` app
- Update CEO agent to use MCP server (same as customer agent)
- Remove direct LlamaIndex.TS usage
- **Benefit:** Single source of truth, consistent pattern

**Option 2: Keep Direct LlamaIndex.TS**
- Remove MCP server (not being used)
- Update customer agent to use direct approach
- **Benefit:** Simpler, no extra deployment

**Option 3: Hybrid (Current State)**
- Keep both implementations
- **Downside:** Confusing, duplicated logic

**DECISION NEEDED:** Which option to pursue?

---

## 2. Chatwoot Status

### Current State

**Deployment:** ✅ DEPLOYED (hotdash-chatwoot.fly.dev)  
**Status:** ❌ **NOT ACCESSIBLE** (critical issue)  
**Machines:** ✅ Running (web + worker)  
**Health Check:** ❌ **FAILS** (no response)

### Evidence

```bash
# Fly apps list
hotdash-chatwoot      	personal	deployed 	Oct 21 2025 01:00	
hotdash-chatwoot-db   	personal	deployed

# Fly status
App: hotdash-chatwoot
Machines:
  web    	8d9515fe056ed8	started	1 total, 1 critical
  worker 	683713eb7d9008	started

# Health check
curl https://hotdash-chatwoot.fly.dev
(no response - hangs)
```

### Hypothesis: Supabase DB Removal Impact

**User's Theory:**
> "I believe when the DATA agent removed our entire supabase DB that chatwoot was also removed and that is why it no longer works"

**Analysis:**
- ❌ **UNLIKELY** - Chatwoot has its own Postgres database (`hotdash-chatwoot-db`)
- ✅ Chatwoot DB is separate from Supabase
- ✅ Chatwoot machines are running
- ⚠️ **BUT** - Health check shows "1 critical" status

**More Likely Causes:**
1. **Database connection issue** - Chatwoot can't connect to `hotdash-chatwoot-db`
2. **Missing secrets** - Database credentials not set
3. **Migration not run** - Database schema not initialized
4. **Port/networking issue** - Machines running but not accessible

### Integration Points

**1. Webhook Handler (app/routes/api.webhooks.chatwoot.tsx)**
- ✅ Route exists
- ✅ HMAC signature verification
- ✅ Forwards to Agent SDK

**2. Supabase Edge Function (supabase/functions/chatwoot-webhook/)**
- ✅ Function exists
- ✅ Handles webhook events
- ✅ Queries LlamaIndex MCP
- ✅ Generates drafts via Agent SDK

**3. Configuration (app/config/chatwoot.server.ts)**
- ✅ Config loader exists
- ⚠️ Requires env vars:
  - `CHATWOOT_BASE_URL`
  - `CHATWOOT_TOKEN`
  - `CHATWOOT_ACCOUNT_ID`

**4. Services**
- ✅ `app/services/chatwoot/routing.ts` - Conversation routing
- ✅ `app/services/chatwoot/automation.ts` - Automation rules
- ✅ `app/services/ai-customer/chatbot.service.ts` - AI chatbot

### Recommendation

**Immediate Actions:**

1. **Check Chatwoot logs:**
   ```bash
   fly logs --app hotdash-chatwoot
   ```

2. **Check database connectivity:**
   ```bash
   fly ssh console --app hotdash-chatwoot
   # Inside container:
   bundle exec rails db:migrate:status
   ```

3. **Verify secrets:**
   ```bash
   fly secrets list --app hotdash-chatwoot
   ```

4. **Check health endpoint:**
   ```bash
   fly ssh console --app hotdash-chatwoot
   # Inside container:
   curl http://localhost:3000/rails/health
   ```

**If database is missing:**
- Run migrations: `fly ssh console --app hotdash-chatwoot -C "bundle exec rails db:migrate"`
- Create super admin: Follow `docs/deployment/chatwoot_fly_runbook.md`

**If secrets are missing:**
- Restore from `vault/occ/chatwoot/`
- Set via `fly secrets set`

---

## 3. Main App Status (Auggie Feedback)

### Recent Fix: Blank Page Bug

**Problem:** Shopify app showing blank page (only chrome visible)

**Root Cause:** Invalid `<div>` tags in `<head>` element (app/root.tsx)

**Solution:** Removed invalid div wrappers containing SEO meta tags

**Status:** ✅ **FIXED** (deployed to production)

**Evidence:** `feedback/auggie/2025-10-24.md`

### Lessons Learned

1. Don't use `dangerouslySetInnerHTML` for meta tags in `<head>`
2. Use React Router's `<Meta />` component instead
3. Invalid HTML breaks entire page structure

---

## 4. Image Search Feature (New)

### Decision: Simplified Approach

**Approved:** GPT-4 Vision descriptions + OpenAI text embeddings

**Why:**
- ✅ No external compute needed (all OpenAI APIs)
- ✅ Uses existing infrastructure (pgvector + OpenAI embeddings)
- ✅ Cost-effective ($0.001/image, negligible search cost)
- ✅ Simple implementation (~300 lines of code)

**Documentation:** `docs/specs/image-search-simplified-implementation.md`

**Next Steps:**
1. Create SQL migration
2. Implement image description service
3. Implement upload API
4. Implement worker
5. Implement search API
6. Test and deploy

**Estimated Effort:** 8-10 hours

---

## Summary of Actions Required

### Immediate (Today)

1. ✅ **Resume LlamaIndex MCP Server**
   ```bash
   fly apps resume hotdash-llamaindex-mcp
   ```

2. ⚠️ **Investigate Chatwoot** (follow steps in Section 2)

3. ✅ **Update Agent Directions** (next task)

### Short-term (This Week)

1. **Decide on LlamaIndex architecture** (MCP vs direct)
2. **Fix Chatwoot** (restore database/secrets if needed)
3. **Implement image search** (8-10 hours)

### Medium-term (Next 2 Weeks)

1. **Test LlamaIndex integration** (CEO + Customer agents)
2. **Test Chatwoot integration** (webhook + AI drafts)
3. **Deploy image search** (with feature flag)

---

## Evidence Files

- `feedback/auggie/2025-10-24.md` - Blank page bug fix
- `docs/specs/image-search-simplified-implementation.md` - Image search design
- `docs/specs/image-search-embedding-decision.md` - Image search decision (corrected)
- `apps/llamaindex-mcp-server/README.md` - MCP server docs
- `deploy/chatwoot/README.md` - Chatwoot deployment docs

---

**Next:** Update agent directions based on this status report

