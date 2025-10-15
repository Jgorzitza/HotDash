
# Operating Model — Hot Rod AN (2025 OCT)

**File:** `docs/OPERATING_MODEL.md`  
**Canonical strategy:** `docs/NORTH_STAR.md`  
**Spec link (approvals UI + contracts):** `docs/specs/approvals_drawer_spec.md`

> This doc is the *how*: the day-to-day system for turning the North Star into shipped reality. Growth, CX, and inventory all follow the same pipeline and guardrails.

---

## 1) Pipeline (one way work happens)
**Signals → Suggestions → Approvals → Actions → Audit → Learn**

- **Signals** — Shopify Admin GraphQL (orders, inventory, tags/metafields), Supabase (metrics/evals), Chatwoot (Email/Live Chat/SMS), Social analytics (read‑only first).  
- **Suggestions** — Agents propose: Inventory (ROP, PO drafts), CX (draft replies), Growth (SEO/ads/content). Suggestions *must* include evidence, projected impact, risks, rollback.  
- **Approvals** — The **Approvals Drawer** (see spec) validates tool calls and enforces HITL for customer/social.  
- **Actions** — Server‑side tools only: Shopify mutations (guarded), Supabase RPC, Chatwoot public reply from approved Private Note, Social post via adapter (Ayrshare).  
- **Audit** — Persist receipts, logs, before/after, rollback artifacts.  
- **Learn** — Capture human edits + 1–5 grades (tone/accuracy/policy for CX). Feed evals / fine‑tuning.

---

## 2) Task Ledger (single source of truth)
- Use **GitHub Issues (Task form)** with required fields: **Agent**, **Definition of Done**, **Acceptance checks**, **Allowed paths**.  
- Every PR must:  
  - Include `Fixes #<issue>` in the body.  
  - Include a line `Allowed paths: <patterns>` that matches the Issue.  
  - Stay inside those paths (Danger enforces).  
- Direction lives in `docs/directions/<agent>.md` and follows template `docs/directions/agenttemplate.md`. Feedback logs go to `feedback/<agent>/<YYYY-MM-DD>.md`.

---

## 3) Guardrails (non-negotiable)
- **Docs allow‑list** in CI (no stray `.md`), plus weekly (and now **daily startup/shutdown**) drift sweep.  
- **Danger**: Issue linkage, DoD present, Allowed paths enforced, HITL config enforced.  
- **Secret protection**: GitHub Push Protection + **Gitleaks** CI with SARIF upload.  
- **MCP‑first in dev** (Cursor/Codex/Claude) and **Agents SDK in‑app** (TS) with HITL.  
- **No secrets in code**; use GitHub Environments/Secrets + server‑side adapters only.

---

## 4) Roles & Roster (16 agents)
- **Core:** manager, engineer, qa, devops, integrations  
- **AI:** ai‑customer (**HITL**), ai‑knowledge  
- **Biz/Data:** inventory, analytics, product, data  
- **GTM:** seo, ads, content  
- **Ops:** support, designer

> Each has a single direction file and writes only to their own feedback log. Manager owns NORTH_STAR, RULES, directions, and approvals policy.

---

## 5) Cadence (tight rhythm)
**Daily (AM) — Manager Startup**
- Read diffs in `NORTH_STAR.md` and `RULES.md` (if any).  
- Tools health: `shopify version`, `supabase --version`; CI must be green.  
- Review Issues → assign/resize, define DoD & **Allowed paths**.  
- Update `docs/directions/<agent>.md`.  
- Skim previous day `feedback/<agent>/<YYYY-MM-DD>.md` and unblock in directions.  
- Run docs policy locally; sweep planning TTL if needed.

**Daily (PM) — Manager Shutdown**
- Verify all active PRs have Issue linkage, DoD checked, Allowed paths present.  
- Merge or request changes with explicit next steps.  
- Roll learnings into RULES/directions; ensure push protection still on.  
- log `feedback/manager/<YYYY-MM-DD>.md` summary.

**Daily (During shutdown) — Drift & Evidence**
- Run drift checklist, confirm secrets/push protection, archive planning >7d.  
- Review SLA times, approval grades, and growth/SEO criticals cleared.

---

## 6) Approvals Drawer (binding spec)
- The UI/contract lives in **`docs/specs/approvals_drawer_spec.md`**.  
- “Approve” stays disabled until evidence + rollback + `/validate` OK.  
- **HITL**: Customer replies/social posts draft as **Private Notes** or “pending posts”; only **Approved** items are sent. Grading (tone/accuracy/policy) is required on send.

---

## 7) Inventory, CX, Growth — same rules
- Inventory suggestions compute ROP (lead‑time demand + safety stock), generate PO CSVs, and respect kits/bundles (`BUNDLE:TRUE`, `PACK:X`).  
- CX replies **always** HITL; public reply is emitted from approved Private Note via Chatwoot API.  
- Growth uses a social adapter (Ayrshare) behind our UI: analytics first, then approve‑to‑post.

---

## 8) Metrics (tile + governance)
- **Core:** Revenue, AOV, Conversion, Returns; Inventory WOS/stockouts/overstocks/ROP coverage; CX FRT/SLA/grade; Growth impressions/clicks/CTR/ROAS/posts approved/week.  
- **Governance:** CI green rate, rogue `.md` prevented, drift sweeps done; secret scanning; tile P95; rollup error rates; uptime.  
- **Learning:** % replies drafted by AI; approval latency; edit‑distance between draft and human edit; impact of approved changes on CTR/ROAS.

---

## 9) Definition of Done (global)
1) Acceptance criteria satisfied with tests/evidence; rollback documented.  
2) Calls are **MCP/SDK‑backed** only.  
3) HITL reviews/grades captured for customer‑facing work.  
4) Governance: Issue linkage, **Allowed paths**, CI checks green; no disallowed `.md`.  
5) Metrics updated if behavior changed; audit entry present.

---

## 10) File Map (where everything lives)
- Strategy: `docs/NORTH_STAR.md` (single star; growth included).  
- Operating model (this doc): `docs/OPERATING_MODEL.md`.  
- Approvals UI + contracts: `docs/specs/approvals_drawer_spec.md`.  
- Rules: `docs/RULES.md`.  
- Directions: `docs/directions/<agent>.md`.  
- Runbooks: `docs/runbooks/*.md`.  
- Feedback logs: `feedback/<agent>/<YYYY-MM-DD>.md`.

---

## 11) Migration (if you still have growthengine/*)
- Move best content into `NORTH_STAR.md` and this `OPERATING_MODEL.md`.  
- Archive `docs/growthengine/` to `docs/_archive/<DATE>/growthengine/` via `git mv`.  
- Open a PR titled “docs: unify growth into North Star + Operating Model”.

---

## 12) Manager Checklist to activate this model
- Make CI checks required: Docs Policy, Gitleaks, Danger, Validate AI Agent Config.  
- Ensure Push Protection & Secret scanning are ON.  
- Confirm “Allowed paths” appears in every PR body; Danger should block otherwise.  
- Verify `ai-customer` has `human_review: true` and named reviewers.  
- Ensure Approvals Drawer spec is present and referenced in Issues.
