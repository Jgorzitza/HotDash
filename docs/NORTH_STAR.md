# North Star — Hot Rod AN Control Center (2025 OCT)

## Vision

Deliver a **trustworthy, operator‑first control center embedded in Shopify Admin** that centralizes live metrics, inventory control, CX, and growth levers. Agents propose actions; **humans approve or correct**; the system learns. No context switching. Production‑safe, auditable, and fast. One app customer Justin CEO of hotrodan.com

## Outcomes

- **Embedded Excellence:** Shopify-embedded admin app (Polaris). Tiles are real-time and open an **Approve/Reject** drawer with diffs, projected impact, logs, and rollback.
- **Tool-First Intelligence:** Dev agents use **MCP** (GitHub Official, Context7, Supabase, Fly.io, Shopify, Google Analytics). Full documentation in `mcp/` directory. In-app agents created with **OpenAI Agents SDK (TypeScript)**. No freehand API guessing.
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
  - **Dev:** Cursor/Codex/Claude with **MCP** (6 servers: GitHub, Context7, Supabase, Fly.io, Shopify, Google Analytics). Full setup in `mcp/` directory. Constrained by runbooks/directions + CI.
  - **In‑app:** OpenAI **Agents SDK** (TS) with **HITL**; call server tools (Shopify Admin GraphQL, Supabase RPC, Chatwoot API, Social adapter).
- **Observability:** Prometheus/metrics endpoints; structured logs; approvals/audit tables.
- **MCP Infrastructure:** Critical documentation in `mcp/` directory (protected by CI allow-list). See `mcp/README.md` for setup and `mcp/ALL_SYSTEMS_GO.md` for usage.

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
