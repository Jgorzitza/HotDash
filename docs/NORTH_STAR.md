
# North Star — Hot Rod AN Control Center (2025 OCT)

## Vision
Deliver a **trustworthy, operator‑first control center embedded in Shopify Admin** that centralizes live metrics, inventory control, CX, and growth levers. Agents propose actions; **humans approve or correct**; the system learns. No context switching. Production‑safe, auditable, and fast. One app customer Justin CEO of hotrodan.com

## Outcomes
- **Embedded Excellence:** Shopify‑embedded admin app (Polaris). Tiles are real‑time and open an **Approve/Reject** drawer with diffs, projected impact, logs, and rollback.
- **Tool‑First Intelligence:** Dev agents use **MCP** (Shopify DEV, Supabase, Context7, Fly.io, Chatwoot, LlamaIndex). In‑app agents created with **OpenAI Agents SDK (TypeScript)**. No freehand API guessing.
- **Human‑in‑the‑Loop by Default:** All customer‑facing messages and social posts are **drafted → reviewed → sent**. Approvals capture a 1–5 grade for **tone/accuracy/policy** and store edits for learning.
- **Operational Resilience:** Data jobs are observable (metrics + logs); any action has a rollback and audit trail.
- **Governed Delivery:** Docs allow‑list, Danger, secret scanning, Gitleaks, daily drift sweep on startup/shutdown. Issue‑driven work with **Allowed paths** fences.

## Scope (2 DAYS)
1. **Dashboard** — Live tiles: revenue, AOV, returns, stock risk (WOS), SEO anomalies, CX queue, **approvals queue**.
2. **Inventory System** — Centralized view; status buckets (`in_stock`, `low_stock`, `out_of_stock`, `urgent_reorder`); **ROP + safety stock** suggestions; internal PO CSV/email; **kits/bundles** via `BUNDLE:TRUE`; **picker piece counts** via `PACK:X`; picker payout brackets.
3. **Customer Ops (Chatwoot)** — Email + Website Live Chat + Twilio SMS; AI drafts as **Private Note** → human approves → public reply; graded reviews to Supabase.
4. **Growth (Integrated, not separate)** — Read‑only social analytics first; then **HITL posting** via adapter (Ayrshare) behind our UI. Agents recommend content/SEO/ads; CEO approves; system tracks impact. Growth follows the **same approvals loop, success metrics, and guardrails** as the rest of the app.

## Approvals Loop (single way work happens)
**States:** Draft → Pending Review → Approved → Applied → Audited → Learned (feedback incorporated).  
**Rules:**
- Every suggestion or reply includes: **Evidence** (queries, samples, diffs), **Projected impact**, **Risk & rollback**, **Affected paths/entities**.
- **SLA:** business hours review within **15 minutes** for CX, **same day** for inventory/growth.
- **Apply** only via tool actions (Shopify Admin GraphQL, Supabase RPC, Chatwoot API, Social adapter). No manual edits outside the flow.
- **Audit** attaches logs/metrics and optional rollback artifact.
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
  - **Dev:** Cursor/Codex/Claude with **MCP**, constrained by runbooks/directions + CI.
  - **In‑app:** OpenAI **Agents SDK** (TS) with **HITL**; call server tools (Shopify Admin GraphQL, Supabase RPC, Chatwoot API, Social adapter).
- **Observability:** Prometheus/metrics endpoints; structured logs; approvals/audit tables.

## Success Metrics 
**Performance & Reliability**
- P95 tile load **< 3s**; nightly rollup error rate **< 0.5%**; 30‑day uptime **≥ 99.9%**.

**Governance & Safety**
- **0** rogue markdown merges; **DAILY** startup and shutdown drift sweeps completed.
- **0** unresolved secret incidents; push protection & Gitleaks green on `main`.

**HITL Quality & Throughput**
- ≥ **90%** of customer replies drafted by `ai-customer`; average review grades **tone ≥ 4.5**, **accuracy ≥ 4.7**, **policy ≥ 4.8**; median approval time **≤ 15 min**.

**Inventory & Ops**
- Stockouts **−40%**, overstocks **−20%** vs baseline; picker payout accuracy **100%**.

**Growth (within the same star)**
- ≥ **10** HITL‑approved posts/week; measurable CTR/ROAS lift on approved changes; resolve **100%** agent‑flagged SEO criticals within **48h**.

**Human Benefit**
- CEO ad‑hoc tool time **−50%** vs baseline.

## Roadmap Spine
- **M0–M1: Governance + Incident Zero** (CI/Rulesets, Chatwoot Email, inventory read‑only).
- **M2: HITL Customer Agent (Email)**; Shopify Admin reads; grading to Supabase.
- **M3: Inventory Actions** (ROP, PO CSV, picker payouts).
- **M4: Live Chat + SMS**; review SLA dashboards.
- **M5: Growth v1 (read‑only analytics + recs)**; evidence-first suggestions.
- **M6: HITL Posting** (approve‑to‑post) + weekly growth report tile.

## Definition of Done (global)
1. Acceptance criteria satisfied with tests/evidence; rollback documented.
2. Calls are **MCP/SDK‑backed**; no speculative endpoints.
3. HITL reviews/grades captured for customer‑facing work.
4. Governance: Issue linkage, **Allowed paths**, CI checks green; no disallowed `.md`.
5. Metrics updated if behavior changed; audit entry present.
