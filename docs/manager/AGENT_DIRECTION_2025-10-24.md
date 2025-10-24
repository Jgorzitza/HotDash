# Agent Direction - 2025-10-24

**Manager:** Augment Agent (Manager Role)
**CEO:** Justin
**Effective:** 2025-10-24
**Status:** ACTIVE
**Purpose:** Unified direction for all agents based on current system state

---

## 🚨 IMPORTANT: Regular Dev Team - Keep Building Agents

**NEW (2025-10-24):** specialagent001 is building LLM Gateway infrastructure in parallel.

**✅ CONTINUE BUILDING AGENTS NORMALLY:**
- ai-customer, ceo-insights, ai-knowledge, background agents
- Deploy changes to production as usual
- Use direct OpenAI API (current setup)
- **DO NOT WAIT** for infrastructure

**📖 Full Instructions:** `docs/manager/REGULAR_DEV_TEAM_INSTRUCTIONS_2025-10-24.md`

**Why?** Infrastructure is transparent. Simple env var change later (Phase 2). No code changes needed.

---

## 🎯 Current System State

**Last Updated:** 2025-10-24  
**Status Report:** `docs/manager/SYSTEM_STATUS_2025-10-24.md`

### Operational Systems

✅ **Main App** (hotdash-production.fly.dev)
- Status: OPERATIONAL
- Recent fix: Blank page bug (invalid div in head)
- Fixed by: Auggie (2025-10-24)

✅ **LlamaIndex MCP Server** (hotdash-llamaindex-mcp.fly.dev)
- Status: DEPLOYED but SUSPENDED
- Action needed: `fly apps resume hotdash-llamaindex-mcp`
- Tools: query_support, refresh_index, insight_report

⚠️ **Chatwoot** (hotdash-chatwoot.fly.dev)
- Status: DEPLOYED but NOT ACCESSIBLE
- Machines: Running (web + worker)
- Action needed: Investigate (see status report)

✅ **Supabase** (mmbjiyhsvniqxibzgyvx)
- Status: OPERATIONAL
- Database: Restored after DATA agent incident

---

## 📋 Active Features & Priorities

### P0 - Critical Path

**1. Image Search Feature** (NEW)
- **Decision:** GPT-4 Vision descriptions + OpenAI text embeddings
- **Spec:** `docs/specs/image-search-simplified-implementation.md`
- **Effort:** 8-10 hours
- **Status:** Ready to implement
- **Owner:** TBD (assign to engineer)

**2. LlamaIndex Integration**
- **Decision:** ✅ MCP-first pattern (all agents use MCP server)
- **Status:** Customer agents use MCP (correct), CEO agent needs migration
- **MCP Server:** hotdash-llamaindex-mcp.fly.dev (currently SUSPENDED)
- **Action:** Resume server, migrate CEO agent to MCP pattern
- **Reference:** `docs/manager/LLAMAINDEX_MCP_ALIGNMENT_2025-10-24.md`

**3. Chatwoot Integration**
- **Issue:** Not accessible
- **Impact:** CX automation blocked
- **Action:** Investigate and fix (see status report)

### P1 - Important

**4. Agent SDK Integration**
- **Status:** ✅ Architecture correct (OpenAI Agents SDK with handoffs)
- **CEO Agent:** ⚠️ Needs migration to LlamaIndex MCP (currently uses direct LlamaIndex.TS)
- **Customer Agents:** ✅ Already use LlamaIndex MCP (correct pattern)
- **Action:** Migrate CEO agent to MCP pattern (see task ENG-LLAMAINDEX-MCP-001)
- **Reference:** `docs/manager/LLAMAINDEX_MCP_ALIGNMENT_2025-10-24.md`

**5. Growth Engine**
- **Status:** Design complete
- **Blockers:** Publer integration, social analytics
- **Action:** Implement HITL posting workflow

### P2 - Nice to Have

**6. Dashboard Tiles**
- **Status:** Basic tiles implemented
- **Action:** Add real-time updates, approvals queue

**7. Inventory System**
- **Status:** Design complete
- **Action:** Implement ROP calculations, PO generation

---

## 🔧 MCP Tools (6 Active Servers)

**Status:** All operational (verified 2025-10-24)

### 1. GitHub Official (Docker)
- **Use for:** Issues, PRs, code search, workflows
- **Status:** ✅ Active

### 2. Context7 (HTTP - port 3001)
- **Use for:** Semantic code search, dependencies
- **Status:** ✅ Active

### 3. Supabase (NPX)
- **Use for:** Database operations, schema, RPC
- **Status:** ✅ Active

### 4. Fly.io (HTTP - port 8080)
- **Use for:** Deployments, logs, scaling
- **Status:** ✅ Active

### 5. Shopify (NPX)
- **Use for:** Shopify API, Liquid templates
- **Status:** ✅ Active

### 6. Google Analytics (Pipx)
- **Use for:** Analytics data, reporting
- **Status:** ✅ Active

**Documentation:** `mcp/` directory (PROTECTED - do not remove)

---

## 🚨 Critical Rules (Enforced by CI)

### 1. Documentation Policy

**Allowed Markdown Paths ONLY:**
```
README.md
APPLY.md
docs/NORTH_STAR.md
docs/RULES.md
docs/OPERATING_MODEL.md
docs/ARCHIVE_INDEX.md
docs/runbooks/{manager_*,agent_*,*.md}
docs/directions/<agent|role>.md
docs/manager/{PROJECT_PLAN.md,IMPLEMENTATION_PLAYBOOK.md,*.md}
docs/planning/<agent>-<task>-<YYYYMMDD>.md  # TTL 2 days
docs/specs/**
docs/integrations/**
feedback/<agent>/<YYYY-MM-DD>.md
docs/_archive/**
mcp/**  # PROTECTED - DO NOT REMOVE
```

**Enforcement:** `scripts/policy/check-docs.mjs` + `Dangerfile.js`

### 2. Security & Secrets

**NO SECRETS IN CODE - EVER**

**Allowed storage:**
- GitHub Environments/Secrets
- Local Vault (`vault/` - gitignored)
- Fly.io Secrets (`fly secrets set`)
- `.env.local` (gitignored)

**Enforcement:**
- Push protection (enabled)
- Secret scanning (enabled)
- Gitleaks (CI check)

### 3. MCP-First Development

**All dev agents MUST use MCP tools**

❌ **WRONG:** "Query the Shopify API directly"  
✅ **CORRECT:** "Use Shopify MCP to query products"

❌ **WRONG:** "Search the codebase manually"  
✅ **CORRECT:** "Use Context7 to find all usages"

### 4. Task Workflow

**GitHub Issues = Single Source of Truth**

**Every Issue MUST have:**
1. Agent (who owns it)
2. Definition of Done (clear criteria)
3. Acceptance checks (how to verify)
4. Allowed paths (file patterns, fnmatch format)

**Every PR MUST have:**
1. Issue linkage (`Fixes #123`)
2. Allowed paths declaration
3. DoD checklist (from Issue)
4. Evidence (tests, screenshots, rollback plan)

**Enforcement:** Danger (blocks merge if missing)

### 5. HITL (Human-in-the-Loop)

**All customer-facing actions require approval**

**Workflow:** Draft → Review → Approve → Apply → Audit → Learn

**Required:**
- Evidence (queries, samples, diffs)
- Projected impact
- Risk & rollback plan
- Affected paths/entities

**Grading:** Tone/Accuracy/Policy (1-5 scale)

---

## 🎨 Architecture Constraints

### Frontend
- React Router 7 template
- Shopify Polaris components
- Vite build system
- ❌ NO `@remix-run` imports

### Backend
- Node/TypeScript application
- Supabase (Postgres + RLS)
- Workers/cron for jobs
- SSE/webhooks for real-time

### Agents

**Dev Agents (Cursor/Codex/Claude):**
- Use MCP tools (6 servers)
- Constrained by runbooks/directions + CI
- Interactive only (no autonomous loops)

**In-App Agents (OpenAI Agents SDK):**
- TypeScript implementation
- HITL enforced
- Call server tools only:
  - Shopify Admin GraphQL
  - Supabase RPC
  - Chatwoot API
  - Social adapter (Publer)

---

## 📊 Success Metrics

### Performance & Reliability
- P95 tile load < 3s
- Nightly rollup error rate < 0.5%
- 30-day uptime ≥ 99.9%

### Governance & Safety
- **0** rogue markdown merges
- **DAILY** startup/shutdown drift sweeps
- **0** unresolved secret incidents
- Push protection & Gitleaks green on `main`

### HITL Quality
- ≥ 90% of customer replies drafted by AI
- Average grades: tone ≥ 4.5, accuracy ≥ 4.7, policy ≥ 4.8
- Median approval time ≤ 15 min

---

## 🔄 Daily Workflow

### Startup Checklist

1. **Pull latest code**
   ```bash
   git fetch origin
   git pull origin main  # or your branch
   ```

2. **Check system status**
   - Read `docs/manager/SYSTEM_STATUS_2025-10-24.md`
   - Check for blockers

3. **Get your tasks**
   ```bash
   npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <your-agent>
   ```

4. **Log startup**
   ```typescript
   await logDecision({
     scope: "build",
     actor: "<your-agent>",
     action: "startup",
     status: "in_progress",
     rationale: "Starting daily work - reviewing tasks",
   });
   ```

### During Work

**Report progress via `logDecision()` - IMMEDIATE on status changes**

**When to log:**
- ✅ Task started → IMMEDIATE
- ✅ Task completed → IMMEDIATE
- ✅ Task blocked → IMMEDIATE
- ✅ Blocker cleared → IMMEDIATE
- ✅ Every 2 hours if still working

**Example:**
```typescript
await logDecision({
  scope: "build",
  actor: "<your-agent>",
  taskId: "<TASK-ID>",
  status: "in_progress",
  progressPct: 50,
  action: "progress_update",
  rationale: "Completed API implementation, starting tests",
  evidenceUrl: "artifacts/<agent>/2025-10-24/progress.md",
});
```

### Shutdown Checklist

1. **Log shutdown with self-grade**
   ```typescript
   await logDecision({
     scope: "build",
     actor: "<your-agent>",
     action: "shutdown",
     status: "in_progress",
     progressPct: 75,
     rationale: "Daily shutdown - 2 tasks completed, 1 in progress",
     durationActual: 6.5,
     payload: {
       selfGrade: {
         progress: 5,
         evidence: 4,
         alignment: 5,
         toolDiscipline: 5,
         communication: 4,
         average: 4.6
       },
       retrospective: {
         didWell: ["Used MCP tools first", "Comprehensive tests"],
         toChange: ["Ask questions earlier when blocked"],
         toStop: "Assuming library behavior without checking docs"
       }
     }
   });
   ```

2. **Write feedback file** (optional backup)
   ```bash
   feedback/<your-agent>/2025-10-24.md
   ```

3. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: <description>"
   git push origin <branch>
   ```

---

## 🆕 New Feature: Image Search

**Status:** Ready to implement  
**Spec:** `docs/specs/image-search-simplified-implementation.md`  
**Effort:** 8-10 hours

### Approach

**GPT-4 Vision descriptions + OpenAI text embeddings**

1. User uploads image → GPT-4 Vision describes it
2. Generate text embedding from description
3. Store in pgvector (1536-dim)
4. Search: query → embedding → similarity search

### Why This Works

- ✅ No external compute (all OpenAI APIs)
- ✅ Uses existing infrastructure (pgvector)
- ✅ Cost-effective ($0.001/image)
- ✅ Simple (~300 lines of code)

### Implementation Steps

1. Create SQL migration (customer_photos, image_embeddings tables)
2. Implement image description service (GPT-4 Vision)
3. Implement upload API (EXIF stripping, de-duplication)
4. Implement worker (async processing)
5. Implement search API (pgvector similarity)
6. Test with sample images
7. Deploy with feature flag

**Owner:** TBD (assign to engineer)

---

## 📚 Key Documents

### Governance
- `docs/NORTH_STAR.md` - Vision, principles, architecture
- `docs/RULES.md` - Documentation policy, security, process
- `docs/OPERATING_MODEL.md` - Workflow, approvals, task management

### Status & Planning
- `docs/manager/SYSTEM_STATUS_2025-10-24.md` - Current system state
- `docs/manager/PROJECT_PLAN.md` - Project roadmap
- `docs/manager/IMPLEMENTATION_PLAYBOOK.md` - Implementation guide

### Specs & Design
- `docs/specs/` - Feature specifications
- `docs/integrations/` - Integration documentation
- `docs/runbooks/` - Operational runbooks

### MCP Tools
- `mcp/README.md` - MCP setup and overview
- `mcp/ALL_SYSTEMS_GO.md` - Ready-to-use examples
- `mcp/QUICK_REFERENCE.md` - When to use each tool

---

## ⚠️ Stop the Line Triggers

**STOP ALL WORK if:**

- ❌ Secret detected in code (local or CI)
- ❌ Push protection disabled
- ❌ Secret scanning disabled
- ❌ Gitleaks failing on main
- ❌ Open secret incident unresolved
- ❌ PR missing Issue linkage
- ❌ PR missing Allowed paths
- ❌ Files outside Allowed paths modified
- ❌ Disallowed `.md` files created
- ❌ CI checks failing
- ❌ Approvals without evidence/rollback

**Action:** Resolve immediately before any other work

---

**For questions or blockers, contact Manager (Justin) immediately via `logDecision()` with `status: "blocked"`**

