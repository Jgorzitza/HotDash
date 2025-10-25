# North Star — Hot Rod AN Control Center (2025 OCT)

## Vision

Deliver a **trustworthy, operator‑first control center embedded in Shopify Admin** that centralizes live metrics, inventory control, CX, and growth levers. Agents propose actions; **humans approve or correct**; the system learns. No context switching. Production‑safe, auditable, and fast. One app customer Justin CEO of hotrodan.com

## Outcomes

- **Embedded Excellence:** Shopify-embedded admin app (Polaris). Tiles are real-time and open an **Approve/Reject** drawer with diffs, projected impact, logs, and rollback.
- **Tool-First Intelligence:** Dev agents use **MCP** (GitHub Official, Context7, Supabase, Fly.io, Shopify). Full documentation in `mcp/` directory. In-app agents created with **OpenAI Agents SDK (TypeScript)**. Google Analytics uses the direct Data API (service account), not MCP. No freehand API guessing.
- **Human-in-the-Loop by Default:** All customer-facing messages and social posts are **drafted → reviewed → sent**. Approvals capture a 1–5 grade for **tone/accuracy/policy** and store edits for learning.
- **Always-On Idea Pool:** Maintain five live product suggestions (exactly one Wildcard) backed by Supabase `product_suggestions` tables, ensuring the manager can accept/reject with evidence and auto-create Shopify drafts.
- **Operational Resilience:** Data jobs are observable (metrics + logs); any action has a rollback and audit trail. Publer + Chatwoot health artifacts live in `artifacts/ops/` and block launches if they fail.
- **Governed Delivery:** Docs allow-list, Danger, secret scanning, Gitleaks, daily drift sweep on startup/shutdown. Issue-driven work with **Allowed paths** fences.

## Scope (2 DAYS)

1. **Dashboard** — Live tiles: revenue, AOV, returns, stock risk (WOS), SEO anomalies, CX queue, **approvals queue**.
2. **Inventory System** — Centralized view; status buckets (`in_stock`, `low_stock`, `out_of_stock`, `urgent_reorder`); **ROP + safety stock** suggestions; internal PO CSV/email; **kits/bundles** via `BUNDLE:TRUE`; **picker piece counts** via `PACK:X`; picker payout brackets.
3. **Customer Ops (Chatwoot)** — Email + Website Live Chat + Twilio SMS; AI drafts as **Private Note** → human approves → public reply; graded reviews to Supabase. Daily scripted health checks (`scripts/ops/check-chatwoot-health.{mjs,sh}`) confirm `/rails/health` + authenticated API reachability before green-lighting CX work.
4. **Growth (Integrated, not separate)** — Read-only social analytics first; then **HITL posting** via adapter (Publer) behind our UI. Agents recommend content/SEO/ads; CEO approves; system tracks impact. Growth follows the **same approvals loop, success metrics, and guardrails** as the rest of the app, with Publer workflows gated behind `/account_info` + `/social_accounts` health monitors.
5. **Idea Pool & Product Creation** — Always-on ideation pipeline, accept/reject flows, experiment triggers, and Shopify draft automation per manager agent pack (Supabase schema + API contracts).

## Approvals Loop (single way work happens)

**States:** Draft → Pending Review → Approved → Applied → Audited → Learned (feedback incorporated).  
**Rules:**

- Every suggestion or reply includes: **Evidence** (queries, samples, diffs), **Projected impact**, **Risk & rollback**, **Affected paths/entities**.
- **SLA:** business hours review within **15 minutes** for CX, **same day** for inventory/growth.
- **Apply** only via tool actions (Shopify Admin GraphQL, Supabase RPC, Chatwoot API, Social adapter). No manual edits outside the flow.
- **Audit** attaches logs/metrics and optional rollback artifact.
- **Idea Accept → Product Creation:** Approving a suggestion spawns a `product_creation_jobs` row, hydrates Shopify draft payloads (variants, SEO, media, JSON-LD), and notifies Product/Content/SEO agents for HITL review.
- **Learn:** human edits + grades are recorded for supervised fine‑tuning / evals.

## Principles

- **Speed with brakes** (rulesets/CI/HITL).
- **Show receipts** (evidence with every action).
- **One ledger** (Issues with DoD + Allowed paths).
- **No secrets in code** (GitHub Environments only).
- **MCP‑first; Agents SDK in‑app**.
- **Agent Direction template followed** (All agent direction files follow 'docs/directions/agenttemplate.md')

## Architecture

- **Frontend:** React Router 7 template; Polaris; Vite.
- **Backend:** Node/TS app; Supabase (Postgres + RLS); workers/cron for jobs; SSE/webhooks.
- **Agents:**
  - **Dev:** Cursor/Codex/Claude with **MCP** (5 servers: GitHub, Context7, Supabase, Fly.io, Shopify). Full setup in `mcp/` directory. Google Analytics uses the direct Data API. Constrained by runbooks/directions + CI.
  - **In‑app:** OpenAI **Agents SDK** (TS) with **HITL**; call server tools (Shopify Admin GraphQL, Supabase RPC, Chatwoot API, Social adapter).
- **Observability:** Prometheus/metrics endpoints; structured logs; approvals/audit tables.
- **MCP Infrastructure:** Critical documentation in `mcp/` directory (protected by CI allow-list). See `mcp/README.md` for setup and `mcp/ALL_SYSTEMS_GO.md` for usage.

## Growth Engine — Agent Orchestration & Security

**Agent Model** (Interactive-Only):

- **Customer-Front Agent**: First-line CX triage → `transfer_to_accounts` or `transfer_to_storefront` sub-agents
- **CEO-Front Agent**: Business intelligence queries → read-only Storefront MCP + Action Queue (no writes, no Customer Accounts MCP)
- **Sub-Agents**: Accounts (order lookups, refunds) + Storefront (inventory, products, collections) — **own** the request, return structured result
- **Specialist Agents** (scheduled & event-driven): Analytics, Inventory, Content/SEO/Perf, Risk — invoked by Front agents or operator
- **NO autonomous loops**: All dev agents are interactive (invoked by operator), no background polling

**Handoff Pattern** (Tool-based, One Owner):

```
Customer → Customer-Front (triage) → transfer_to_accounts OR transfer_to_storefront
         → Sub-agent executes (Shopify Admin GraphQL, queries only)
         → Returns structured JSON (order details, inventory status)
         → Front agent composes redacted reply (PII Broker enforces masking)
         → HITL approval (operator reviews & sends)
```

**Security Model**:

- **PII Broker** (redaction layer): Public reply = NO full email/phone/address; PII Card = operator-only (full details)
- **ABAC** (Attribute-Based Access Control): Roles (operator, ceo_agent, customer_agent, system) with scoped permissions
- **Store Switch Safety**: `fm8vte-ex.myshopify.com` (canonical) parameterized via env (no literals)
- **Dev MCP Ban**: Dev MCP servers (Shopify Dev, Context7, etc.) ONLY in development/staging — **production builds MUST FAIL** if Dev MCP imports detected in runtime bundles

**Evidence & Heartbeat** (Merge Blockers):

- **MCP Evidence JSONL** (mandatory for code changes): `artifacts/<agent>/<YYYY-MM-DD>/mcp/<topic_or_tool>.jsonl`
  - Format: `{"tool":"storefront|context7|…","doc_ref":"<url>","request_id":"<id>","timestamp":"ISO","purpose":"<why>"}`
- **PR Template**: Must include "MCP Evidence:" section listing JSONL paths
- **Heartbeat** (tasks >2h): Append JSON lines to `artifacts/<agent>/<date>/heartbeat.ndjson` (15min max staleness)
- **CI Guards**: `guard-mcp` (evidence present) + `idle-guard` (heartbeat fresh) + `dev-mcp-ban` (no Dev MCP in prod) — **REQUIRED on main**

**Action Queue Contract**:

- **Input**: Agent populates `action_queue` with: type, evidence_url, expected_revenue, confidence, ease, affected_entities
- **Ranking**: `score = expected_revenue × confidence × ease` (top 10 displayed)
- **Approval**: Operator reviews → approve/reject → action_id stored with grade (1-5) + edits
- **Attribution**: GA4 custom dimension `hd_action_key` tracks ROI (7d/14d/28d windows) → re-ranks future actions based on realized impact

**Telemetry**:

- **GA4 Property**: 339826228 (event tracking, custom dimensions, conversions)
- **Search Console API**: Direct queries (no BigQuery cost) via `app/lib/seo/search-console.ts` — stored in Supabase (`seo_search_console_metrics`, `seo_search_queries`, `seo_landing_pages`) for historical trends
- **Bing Webmaster**: Verified domain
- **Action Attribution**: `hd_action_key` in GA4 (event scope) links actions → revenue

**Agent Metrics**:

- **Customer Agent**: Draft → HITL approval rate, avg grades (tone/accuracy/policy), response time
- **CEO Agent**: Query success rate, Action Queue ranking accuracy (predicted vs realized ROI)
- **Specialist Agents**: Task completion time, evidence quality score, escalation rate

## Success Metrics

**Performance & Reliability**

- P95 tile load **< 3s**; nightly rollup error rate **< 0.5%**; 30‑day uptime **≥ 99.9%**.
- Chatwoot `/rails/health` + authenticated probes and Publer `/account_info` + `/social_accounts` checks pass **100%** during launch week.

**Governance & Safety**

- **0** rogue markdown merges; **DAILY** startup and shutdown drift sweeps completed.
- **0** unresolved secret incidents; push protection & Gitleaks green on `main`.

**HITL Quality & Throughput**

- ≥ **90%** of customer replies drafted by `ai-customer`; average review grades **tone ≥ 4.5**, **accuracy ≥ 4.7**, **policy ≥ 4.8**; median approval time **≤ 15 min**.
- Always-on idea pool holds **5** suggestions at all times (exactly **1** Wildcard), acceptance-to-draft kickoff **< 5 minutes**, idea-to-launch ≤ **48h** once approved.

**Inventory & Ops**

- Stockouts **−40%**, overstocks **−20%** vs baseline; picker payout accuracy **100%**.

**Growth (within the same star)**

- ≥ **10** HITL‑approved posts/week; measurable CTR/ROAS lift on approved changes; resolve **100%** agent‑flagged SEO criticals within **48h**.
- Publer queue stays ≤ **5** pending approvals, and every published post stores the Publer receipt payload in Supabase.

**Human Benefit**

- CEO ad‑hoc tool time **−50%** vs baseline.

## Roadmap Spine

- **M0–M1: Governance + Incident Zero** (CI/Rulesets, Chatwoot Email, inventory read‑only).
- **M2: HITL Customer Agent (Email)**; Shopify Admin reads; grading to Supabase.
- **M3: Inventory Actions** (ROP, PO CSV, picker payouts).
- **M4: Live Chat + SMS**; review SLA dashboards.
- **M5: Idea Pool & Product Creation** — Supabase schema + API endpoints live; edge functions scheduled; Shopify draft automation ship-ready.
- **M6: Growth v1 (read-only analytics + recs)**; evidence-first suggestions.
- **M7: HITL Posting** (approve-to-post) + weekly growth report tile.

## No Ad-Hoc Files Rule (MANDATORY - Effective 2025-10-20)

**All agents and Manager: NEVER create ad-hoc .md files**

### The 3-Question Test (Before ANY New File)

1. **Can this go in KB database?** → YES → Use `logDecision()` via template pattern (see `docs/agents/FEEDBACK_QUICK_START.md`) (STOP)
2. **Is this in DOCS_INDEX.md Tier 1-3?** → NO → Don't create
3. **Did CEO explicitly request this?** → NO → Don't create

### Forbidden Patterns

- ❌ `STATUS_*.md`, `URGENT_*.md`, `FIX_*.md`, `P0_*.md`
- ❌ `*_CHECKLIST.md`, `DEPLOY_*.md`, `*_PLAN.md`
- ❌ `*_ANALYSIS.md`, `*_GAP.md`, `*_FINDINGS.md`
- ❌ Any root .md except 6 allowed (README, SECURITY, CONTRIBUTING, DOCS_INDEX, 2 temp)

### Use KB Database for Feedback + Direction (2025-10-24)

**Feedback** (Progress/Status):

- Report → `logDecision()` to KB database using template pattern:
  - Copy: `cp scripts/agent/log-feedback.ts /tmp/my-feedback.ts`
  - Edit temp file with `status`, `progressPct`, `taskId`
  - Run: `npx tsx --env-file=.env /tmp/my-feedback.ts`
  - **No conflicts** - each agent uses own temp file
- IMMEDIATE on status changes (completion, blocked, unblocked)
- Manager queries in < 10 seconds (vs 30-60 min reading markdown)
- See: `docs/agents/FEEDBACK_QUICK_START.md`

**Direction** (Task Assignments):

- Assign → `assignTask()` to KB database with taskId, agent, acceptance criteria, allowed paths, dependencies
- Query → `getMyTasks(agent)` from KB database - instant visibility, no git pull
- Update → 10+ times/day when blockers clear (instant, no commits needed)
- Agents query next available task in real-time, switch when blocked

**Why KB Database for Both**:

- Manager updates direction **hourly** when blockers clear
- Markdown + git = bottleneck (1-4 hours/update = agents idle)
- KB Database = instant (< 1 min/update, agents see immediately)
- **Complete isolation** from production database (no Prisma conflicts)
- **Tested:** 10 agents writing concurrently - all successful

**Database Separation**:
- Production DB: Business data (Shopify, customers, orders)
- KB DB: Development coordination (tasks, decisions, feedback)
- Two separate Prisma clients - zero interference

**Enforcement**: Daily audit, markdown direction files archived to feedback/archive/

### KB Integration for Context Recovery (OPTIONAL)

**KB tool is available for searching existing solutions and documentation when needed.**

**KB Search** (Optional - use when context needed):

```bash
# Search for existing solutions or context
npx tsx scripts/agent/kb-search.ts <TASK-ID> "<TASK-TITLE>" <AGENT-NAME>

# Quick query
npm run dev-kb:query -- "Your question here"
```

**KB Integration Benefits**:

- **Prevents Redoing Work**: Find existing solutions before implementing
- **Context Recovery**: Access documentation and past decisions
- **Issue Prevention**: Identify common problems and their solutions
- **Security Awareness**: Review security considerations
- **Integration Planning**: Understand system connections

**When to use**: When you need additional context, looking for existing solutions, or want to understand past decisions.

---

## MCP-First Development (MANDATORY - Effective 2025-10-19)

**All development agents MUST use MCP tools** - non-negotiable.

### Required MCP Tools

**1. Shopify Dev MCP** (MANDATORY for ALL Shopify code):

- `learn_shopify_api` - Learn API structure FIRST
- `search_docs_chunks` - Find documentation
- `introspect_graphql_schema` - Explore schema
- `validate_graphql_codeblocks` - VALIDATE before committing
- **NO Shopify GraphQL without MCP validation**

**2. Context7 MCP** (MANDATORY for ALL library usage):

- `resolve-library-id` - Find correct library
- `get-library-docs` - Get official patterns
- **Required for**: React Router 7, Prisma, Polaris, all npm packages
- **NO library code without MCP verification**

**3. Chrome DevTools MCP** (for UI testing):

- Required for: Designer, Pilot, QA agents
- Production testing on live app

### React Router 7 ONLY (NOT Remix)

**FORBIDDEN** ❌:

- `@remix-run/*` imports (any)
- `json()` helper from Remix
- Remix types/patterns

**REQUIRED** ✅:

- `import from "react-router"` only
- `Response.json()` for all loaders
- `Route.LoaderArgs` types
- Context7 MCP verification

**Enforcement**: `rg "@remix-run" app/` MUST return NO RESULTS

**See**: `docs/REACT_ROUTER_7_ENFORCEMENT.md`

### Evidence Requirements

**Every molecule touching Shopify/libraries MUST log**:

```
MCP Tools Used:
- shopify-dev-mcp: Conversation ID xxx
- context7: Verified React Router 7 pattern
```

**Manager will REJECT**: PRs without MCP evidence or with @remix-run imports

## Definition of Done (global)

1. Acceptance criteria satisfied with tests/evidence; rollback documented.
2. Calls are **MCP/SDK‑backed**; no speculative endpoints.
3. **MCP validation evidence logged** for all Shopify GraphQL and library usage.
4. HITL reviews/grades captured for customer‑facing work.
5. Governance: Issue linkage, **Allowed paths**, CI checks green; no disallowed `.md`.
6. Metrics updated if behavior changed; audit entry present.
7. **NO @remix-run imports** - React Router 7 only.

---

## Design Files Protection (MANDATORY - Effective 2025-10-20)

**INCIDENT**: Oct 15, 2025 - Manager archived 57 design files as "design drafts". Result: Agents built to wrong spec (only 30% of designed features).

**RECOVERY**: Oct 20, 2025 - All 57 files restored. Complete vision now documented.

**POLICY** (`docs/DESIGN_PROTECTION_POLICY.md` - MANDATORY):

**PROTECTED DIRECTORIES** (Never archive or delete without CEO approval):

- `/docs/design/**` - ALL design files
- `/docs/specs/**` - ALL specification files
- `/docs/runbooks/**` - ALL operational runbooks
- `/docs/directions/**` - ALL agent direction files

**RULES**:

1. Design files are **APPROVED** unless marked `DRAFT-`
2. **NEVER archive** without CEO explicit written approval
3. Monthly audit only (with CEO approval)
4. CI/CD blocks PRs that delete design files

**ENFORCEMENT**: Manager accountability, immediate rollback if violated.

**COMPLETE VISION**: See `COMPLETE_VISION_OVERVIEW.md` (root directory) for full 38-task feature manifest.

- 57 design files in `/docs/design/` (500KB total)
- Complete operator experience documented
- **EXECUTION PLAN**: See `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan section) for 13-phase build plan
  - 13 phases, 60 hours work, 11 CEO checkpoints
  - Includes: OpenAI SDK (Customer + CEO agents), Publer integration, all UI features
  - Status: ✅ LOCKED 2025-10-20 (approved by CEO, DO NOT MOVE OR REFACTOR)
- Current implementation: 30% (6/8 tiles, basic modals, Phase 1 approval queue)
- Target: 100% (all designed features + HITL automation built EXACTLY as specified)

---

## Updated Definition of Done (Effective 2025-10-20)

1. Acceptance criteria satisfied with tests/evidence; rollback documented.
2. Calls are **MCP/SDK‑backed**; no speculative endpoints.
3. **MCP validation evidence logged** for all Shopify GraphQL and library usage.
4. **Design specs followed EXACTLY** - implementation matches `docs/design/` (all 57 files).
5. **HITL reviews/grades** captured (tone/accuracy/policy 1-5 sliders in modals).
6. **Complete feature set** - not minimal version (must match design vision, 70% gaps unacceptable).
7. Governance: Issue linkage, **Allowed paths**, CI checks green; no disallowed `.md`.
8. Metrics updated if behavior changed; audit entry present.
9. **NO @remix-run imports** - React Router 7 only.
10. **Accessibility**: WCAG 2.2 AA compliance verified (keyboard nav, screen readers, color contrast).
