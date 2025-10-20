# AI-Customer Direction v5.0

**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — OpenAI SDK Completion + CEO Agent

---

## Objective

**Complete AI-Customer agent (Phase 2) + Build CEO Agent (Phase 11)**

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Current Status**: 80% complete (backend ready, UI needs grading sliders)

---

## Day 1 Tasks (START NOW - 6h) — BUILD CEO AGENT

**Strategy**: Build CEO agent NOW (don't wait for Phase 11) → Ready when Engineer builds UI

### AI-CUSTOMER-001: Verify Grading UI Integration (15 min) — AFTER ENGINEER

**What Engineer Will Do**:
- Add 3 grading sliders to `app/components/modals/CXEscalationModal.tsx`
- Sliders: tone, accuracy, policy (1-5 scale)
- Submit to backend: `app/routes/actions/chatwoot.escalate.ts`

**Your Task** (15 min):
- **Verify** Engineer's implementation sends grades correctly
- **Test** grading flow end-to-end:
  1. Open CX modal
  2. Move sliders to specific values (e.g., tone=4, accuracy=5, policy=5)
  3. Click approve
  4. **Verify** grades stored in Supabase decision_log.payload.grades
- **Document** in feedback with screenshot/evidence

**Query to Verify**:
```sql
SELECT payload->'grades' FROM decision_log 
WHERE action = 'chatwoot.approve_send' 
ORDER BY created_at DESC LIMIT 5;
```

**Expected**:
```json
{
  "tone": 4,
  "accuracy": 5,
  "policy": 5
}
```

**Evidence Required**:
- Screenshot of Supabase decision_log with grades
- Confirmation: "Grading flow functional, data storing correctly"

---

## Current State (From OpenAI SDK Report)

### ✅ What's Already Built:

**Backend Infrastructure** (80% complete):
- ✅ Chatwoot integration (email, live chat, SMS via Twilio)
- ✅ Health check automation (`scripts/ops/check-chatwoot-health.mjs`)
- ✅ Comprehensive documentation (`docs/integrations/chatwoot.md` - 550+ lines)
- ✅ Backend grading system (tone/accuracy/policy extraction)
- ✅ Decision log storage (Supabase)
- ✅ Playwright test suite (modal flows, accessibility)
- ✅ HITL workflow: Draft → Human approval → Public reply

**Implementation Files**:
- ✅ `app/routes/actions/chatwoot.escalate.ts` - Grading extraction/storage
- ✅ `scripts/ops/check-chatwoot-health.mjs` - Health checks (260 lines)
- ✅ `docs/integrations/chatwoot.md` - Integration guide

**Total Code**: 1,068 lines

### ⚠️ What's Missing:

**UI Component** (20% remaining):
- Add 3 grading sliders to CXEscalationModal
- Engineer will implement (15 min work)
- You verify it works

**After Phase 2**: AI-Customer agent 100% complete

---

### AI-CEO-001: CEO Assistant Agent Backend (4h) — DAY 1 START NOW

**What to Build**:

**CEO Agent** (OpenAI Agents SDK):
- Framework: OpenAI Agents SDK (TypeScript)
- Pattern: HITL (drafts → CEO approves → executes)
- Location: `apps/agent-service/` OR `packages/agents/src/ai-ceo.ts`

**Agent Tools** (Server-side):
1. **Shopify Admin GraphQL**:
   - Orders (list, get details, cancel, refund)
   - Products (list, update inventory)
   - Customers (list, search, get details)

2. **Supabase RPC**:
   - Analytics queries (revenue, top SKUs, trends)
   - Data analysis (custom SQL via RPC)
   - Decision log queries (past approvals, patterns)

3. **Chatwoot API**:
   - CX insights (SLA breaches, conversation summaries)
   - Ticket trends
   - Customer sentiment

4. **LlamaIndex**:
   - Knowledge base queries
   - Product documentation search
   - Policy lookups

5. **Google Analytics API**:
   - Traffic analysis
   - Conversion metrics
   - Landing page performance

**Use Cases**:
- "Should I reorder SKU-XYZ?" → Analyzes inventory, sales velocity, suggests action
- "Show me top customers this month" → Queries Shopify, formats response
- "Generate weekly performance summary" → Aggregates data, drafts report
- "Analyze support ticket trends" → Queries Chatwoot, provides insights

**HITL Workflow**:
```
CEO asks question
    ↓
Agent drafts response/action (using tools)
    ↓
Approval queue: Shows query, agent reasoning, proposed action
    ↓
CEO reviews in modal
    ↓
CEO approves/edits
    ↓
Action executes (or response delivered)
    ↓
Result logged to decision_log
```

**Implementation**:
1. Create CEO agent class (similar to AI-Customer)
2. Register tools (Shopify, Supabase, Chatwoot, LlamaIndex, Analytics)
3. Implement approval workflow
4. Integration with approval queue
5. Decision log storage
6. Testing + documentation

**Files to Create/Modify**:
- `packages/agents/src/ai-ceo.ts` (main agent)
- `apps/agent-service/src/agents/ceo-agent.ts` (service wrapper)
- `apps/agent-service/src/tools/analytics.ts` (GA tool)
- `apps/agent-service/src/tools/llamaindex.ts` (if not exists)
- `tests/unit/agents/ai-ceo.spec.ts` (tests)

**Dependencies**:
- ✅ OpenAI Agents SDK (already using for AI-Customer)
- ✅ Shopify tools exist
- ✅ Chatwoot tools exist
- ⏸️ May need: LlamaIndex tool, Analytics tool

---

### AI-CEO-002: CEO Agent Testing (1h) — DAY 2

**After backend complete**:

**Your Task**:
- Test CEO agent backend with sample queries
- Verify all 5 tools working
- Test approval workflow integration
- Document any issues

---

### AI-CEO-003: Testing & Documentation (1h)

**Testing**:
- Unit tests for CEO agent tools
- Integration tests for HITL workflow
- Test with sample queries:
  - "What are my top 3 products?"
  - "Should I reorder Powder Board XL?"
  - "Summarize support tickets this week"

**Documentation**:
- Update `docs/integrations/` with CEO agent guide
- Document available tools
- Example queries and responses
- HITL approval flow diagram

---

## Work Protocol

### 1. MCP Tools (MANDATORY):

**OpenAI Agents SDK**:
```bash
mcp_context7_get-library-docs("/openai/openai-node", "agents-sdk")
```

**LlamaIndex** (if needed):
```bash
mcp_context7_get-library-docs("/llamaindex/llamaindex", "query-engine")
```

**Log in feedback**:
```md
## HH:MM - Context7: OpenAI Agents SDK
- Topic: tool registration, HITL workflow
- Key Learning: Tools must return JSON-serializable values
- Applied to: packages/agents/src/ai-ceo.ts (tool definitions)
```

### 2. Coordinate with Other Agents:

**Phase 2** (immediate):
- Engineer: They add sliders, you verify grading works

**Phase 11**:
- Engineer: They build UI, you build backend
- DevOps: They deploy agent service
- Integrations: They provide API integration patterns

### 3. Reporting (Every 2 hours):

```md
## YYYY-MM-DDTHH:MM:SSZ — AI-Customer: Phase N Work

**Working On**: AI-CEO-001 (CEO agent backend)
**Progress**: 3/5 tools implemented

**Evidence**:
- Files: packages/agents/src/ai-ceo.ts (345 lines)
- Tools: Shopify ✅, Supabase ✅, Chatwoot ✅, LlamaIndex ⏸️, Analytics ⏸️
- Tests: 12/15 passing (+12 new tests)
- Context7: Pulled OpenAI SDK docs (tool registration)

**Blockers**: Need LlamaIndex MCP server endpoint (coordinate with AI-Knowledge)

**Next**: Implement Analytics tool, complete testing
```

---

## Definition of Done

### Phase 2 (AI-Customer Complete):
- [ ] Grading sliders functional in CX modal
- [ ] Grades storing in decision_log.payload.grades
- [ ] End-to-end test passing (UI → backend → database)
- [ ] Evidence: Screenshot of grades in Supabase

### Phase 11 (CEO Agent):
- [ ] CEO agent backend operational
- [ ] 5 tools registered and functional
- [ ] HITL workflow integrated with approval queue
- [ ] Tests passing (15+ tests)
- [ ] Documentation complete
- [ ] Can handle sample queries successfully
- [ ] Decision log storing CEO agent actions

---

## Critical Reminders

**DO**:
- ✅ Pull Context7 docs for OpenAI SDK before coding
- ✅ Test grading flow end-to-end (Phase 2)
- ✅ Coordinate with Engineer for UI integration
- ✅ Verify all tool outputs JSON-serializable

**DO NOT**:
- ❌ Skip Context7 tool pulls
- ❌ Assume UI working without testing
- ❌ Create agent without HITL approval workflow
- ❌ Skip testing with real queries

---

## Phase Schedule

**Day 1**: AI-CEO-001 (CEO agent backend - 4h) — START NOW (Parallel)
**Day 2**: AI-CEO-002 (Testing - 1h), AI-CEO-003 (Documentation - 1h)
**Phase 2** (After Engineer): AI-CUSTOMER-001 (verify grading - 15 min)

**Result**: CEO agent ready BEFORE Engineer builds UI (Phase 11) → Zero wait time

**Total**: 6 hours across Days 1-2 (parallel work)

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan)
**Current Status**: `reports/manager/OPENAI_SDK_STATUS_2025-10-19.md`
**Chatwoot Docs**: `docs/integrations/chatwoot.md`
**Feedback**: `feedback/ai-customer/2025-10-20.md`
**Startup**: `docs/runbooks/agent_startup_checklist.md`

---

**START WITH**: Standby for Phase 2 completion, prepare for grading verification test
