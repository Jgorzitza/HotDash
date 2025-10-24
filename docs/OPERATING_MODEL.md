# Operating Model — Hot Rod AN (2025 OCT)

**File:** `docs/OPERATING_MODEL.md`  
**Canonical strategy:** `docs/NORTH_STAR.md`  
**Spec link (approvals UI + contracts):** `docs/specs/approvals_drawer_spec.md`

> This doc is the _how_: the day-to-day system for turning the North Star into shipped reality. Growth, CX, and inventory all follow the same pipeline and guardrails.

---

## 1) Pipeline (one way work happens)

**Signals → Suggestions → Approvals → Actions → Audit → Learn**

- **Signals** — Shopify Admin GraphQL (orders, inventory, tags/metafields), Supabase (metrics/evals), Chatwoot (Email/Live Chat/SMS), Social analytics (read‑only first).
- **Suggestions** — Agents propose: Inventory (ROP, PO drafts), CX (draft replies), Growth (SEO/ads/content). Suggestions _must_ include evidence, projected impact, risks, rollback.
- **Approvals** — The **Approvals Drawer** (see spec) validates tool calls and enforces HITL for customer/social.
- **Actions** — Server‑side tools only: Shopify mutations (guarded), Supabase RPC, Chatwoot public reply from approved Private Note, Social post via adapter (Publer).
- **Audit** — Persist receipts, logs, before/after, rollback artifacts.
- **Learn** — Capture human edits + 1–5 grades (tone/accuracy/policy for CX). Feed evals / fine‑tuning.

---

## 2) Task Ledger (single source of truth) [DATABASE-DRIVEN]

**NEW (2025-10-22)**: Tasks assigned via database `TaskAssignment` table (instant, queryable, real-time)

- **Manager assigns** via `assignTask()` with: **TaskId**, **Agent**, **Title**, **Description**, **Acceptance Criteria**, **Allowed Paths**, **Priority**, **Dependencies**
- **Agents query** via `getMyTasks(agent)` - instant visibility, no git pull needed
- **Agents start/complete** via `updateTask()` + `logDecision()` - real-time status updates
- Every PR must:
  - Reference taskId in commit message
  - Stay inside allowed paths (from TaskAssignment record, Danger enforces)
- **Feedback** logged via `logDecision()` to database (instant queries, no markdown files)
- **Direction** (markdown files) archived - all task management now in database for 10+ updates/day efficiency

## 2.1) KB Integration for Context Recovery (OPTIONAL)

**KB tool is available for searching existing solutions and documentation when needed.**

**KB Search Workflow** (Optional - use when context needed):

1. **Manager or Agent**: Search KB when looking for existing solutions
   ```bash
   npx tsx scripts/agent/kb-search.ts <TASK-ID> "<TASK-TITLE>" <AGENT-NAME>
   ```

2. **Quick Query**: Use for general questions
   ```bash
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

## 3) Guardrails (non-negotiable)

**No Ad-Hoc Files (NEW - Effective 2025-10-20)**

- Agents report ONLY via: `logDecision()` (database - PRIMARY), `feedback/{agent}.md` (optional backup), `artifacts/{agent}/` (evidence files)
- Manager queries via: `scripts/manager/query-*.ts` (< 10 sec), optionally reads `feedback/manager/*.md`
- Manager writes to: `docs/directions/*.md`, decision_log database
- Root .md files: 6 maximum (README, SECURITY, CONTRIBUTING, DOCS_INDEX, 2 temp)
- Violations: Archive immediately to `docs/archive/YYYY-MM-DD/`
- **3-Question Test**: Can this go in logDecision() or feedback? (YES → use that) | In DOCS_INDEX Tier 1-3? (NO → don't create) | CEO requested? (NO → don't create)
- Daily audit required (Manager)

- **Docs allow‑list** in CI (no stray `.md`), plus weekly (and now **daily startup/shutdown**) drift sweep. **Protected paths include `mcp/**` for MCP tools documentation.\*\*
- **Danger**: Issue linkage, DoD present, Allowed paths enforced, HITL config enforced.
- **Secret protection**: GitHub Push Protection + **Gitleaks** CI with SARIF upload.
- **MCP‑first in dev** (Cursor/Codex/Claude) with 5 active servers (GitHub Official, Context7, Fly.io, Shopify Dev, Chrome DevTools). Use Supabase CLI (NOT MCP) and built-in GA4 API (NOT MCP). Full documentation in `mcp/` directory. **Agents SDK in‑app** (TS) with HITL.
- **MANDATORY MCP Usage** (Updated 2025-10-21):
  - **MCP TOOL PRIORITY**: 1) Shopify Dev MCP (Polaris + Shopify) → 2) Context7 (other libraries) → 3) Web Search (last resort)
  - **Shopify Dev MCP**: ALL Polaris components + Shopify GraphQL MUST be validated - NO EXCEPTIONS
    - Polaris: Use `validate_component_codeblocks` - REQUIRED
    - GraphQL: Use `validate_graphql_codeblocks` - REQUIRED
  - **Context7 MCP**: ALL non-Shopify library patterns MUST be verified (React Router 7, Prisma, TypeScript, etc.) - NO EXCEPTIONS
  - **Evidence**: Log MCP conversation IDs in MCP Evidence JSONL files (artifacts/) and via logDecision()
  - **React Router 7 ONLY**: NO @remix-run imports - verify with `rg "@remix-run" app/` (must return 0 results)
  - **Enforcement**: Manager REJECTS PRs without MCP evidence or with Remix imports - NO WARNINGS, IMMEDIATE REJECTION
- **No secrets in code**; use GitHub Environments/Secrets + server‑side adapters only.

---

## 4) Roles & Roster (16 agents)

- **Core:** manager, engineer, qa, devops, integrations
- **AI:** ai‑customer (**HITL**), ai‑knowledge
- **Biz/Data:** inventory, analytics, product, data
- **GTM:** seo, ads, content
- **Ops:** support, designer

> Each has a single direction file and reports progress via `logDecision()` (database). Manager owns NORTH_STAR, RULES, directions, and queries agent status via database scripts.

---

## 4.1) Growth Engine — Agent Orchestration (NEW - Effective 2025-10-21)

**Agent Architecture** (Interactive-Only):

- **Front-End Agents** (2):
  - **Customer-Front Agent**: First-line CX triage → transfers to sub-agents
  - **CEO-Front Agent**: Business intelligence queries → read-only Storefront MCP + Action Queue

- **Sub-Agents** (2) — Owned Requests:
  - **Accounts Sub-Agent**: Order lookups, refunds, exchanges (Customer Accounts API - write access)
  - **Storefront Sub-Agent**: Inventory queries, product details, collection lookups (Storefront API - read-only)

- **Specialist Agents** (on schedules/events):
  - **Analytics**: Trend detection, anomaly alerts, performance reports
  - **Inventory**: ROP calculations, stock alerts, PO generation
  - **Content/SEO/Perf**: SEO recommendations, content optimization, performance fixes
  - **Risk**: Fraud detection, compliance monitoring, security alerts

- **NO Background Agents**: All agents are interactive (invoked by front-end agents or operator), no autonomous polling loops

**Handoff Pattern** (Tool-Based, One Owner):

```
Customer → Customer-Front (triage using context)
         → Decision: transfer_to_accounts OR transfer_to_storefront
         → Sub-agent OWNS request (executes Shopify GraphQL queries)
         → Returns structured JSON (order details, inventory status, etc.)
         → Front agent composes reply (PII Broker enforces redaction)
         → Operator reviews (PII Card shows full details, public reply redacted)
         → HITL approval → sent via Chatwoot API
```

**CEO Agent Pattern**:

```
CEO → CEO-Front (business question)
    → Queries Action Queue + Storefront MCP (read-only)
    → Returns: Revenue insights, inventory status, top actions
    → NO writes, NO Customer Accounts API (evidence-only policy)
    → Operator reviews answer → approved → displayed
```

**Security Model**:

- **PII Broker** (redaction enforced at composition):
  - **Public Reply**: NO full email/phone/address (masked: `j***@d***.com`, `***-***-1234`)
  - **PII Card** (operator-only): Full details (order ID, tracking, shipping address, payment method)
  - **Enforcement**: Front agents MUST call PII Broker before returning reply to operator
- **ABAC** (Attribute-Based Access Control):
  - **Roles**: operator (full access), ceo_agent (read-only + Action Queue), customer_agent (write via Accounts sub-agent), system (cron jobs)
  - **Scopes**: Accounts sub-agent (orders, refunds) | Storefront sub-agent (products, inventory, collections)
  - **CEO Agent**: ONLY read-only Storefront + Action Queue (NO Customer Accounts, NO writes)

- **No-Ask Execution** (within approved boundaries):
  - Simple queries (order lookup, inventory check) → sub-agent executes → returns result (no approval needed)
  - Write operations (refund, inventory adjustment, post) → HITL approval required
  - Specialist agent recommendations → Action Queue → operator approval → execution

**Agent Evidence** (CI Merge Blockers):

- **MCP Evidence JSONL**: `artifacts/<agent>/<YYYY-MM-DD>/mcp/<topic_or_tool>.jsonl` (required for code changes)
- **Heartbeat**: `artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson` (required for tasks >2h, 15min max staleness)
- **CI Guards**: `guard-mcp` + `idle-guard` + `dev-mcp-ban` (REQUIRED on main)
- **PR Template**: Must include "MCP Evidence:" section + "Heartbeat:" section + "Dev MCP Check"

---

## 5) Cadence (tight rhythm)

**Daily (AM) — Manager Startup**

- Read diffs in `NORTH_STAR.md` and `RULES.md` (if any).
- Tools health: `shopify version`, `supabase --version`; CI must be green.
- Review Issues → assign/resize, define DoD & **Allowed paths**.
- Update `docs/directions/<agent>.md`.
- Query database via `scripts/manager/query-blocked-tasks.ts` (< 1 sec) and unblock in directions.
- Run docs policy locally; sweep planning TTL if needed.

**Daily (PM) — Manager Shutdown**

- Verify all active PRs have Issue linkage, DoD checked, Allowed paths present.
- Merge or request changes with explicit next steps.
- Roll learnings into RULES/directions; ensure push protection still on.
- log summary via `logDecision()` (database) and optionally to `feedback/manager/<YYYY-MM-DD>.md`.

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
- Growth uses a social adapter (Publer) behind our UI: analytics first, then approve‑to‑post.

---

## 8) Metrics (tile + governance)

- **Core:** Revenue, AOV, Conversion, Returns; Inventory WOS/stockouts/overstocks/ROP coverage; CX FRT/SLA/grade; Growth impressions/clicks/CTR/ROAS/posts approved/week.
- **Governance:** CI green rate, rogue `.md` prevented, drift sweeps done; secret scanning; tile P95; rollup error rates; uptime.
- **Learning:** % replies drafted by AI; approval latency; edit‑distance between draft and human edit; impact of approved changes on CTR/ROAS.

---

## 9) Definition of Done (global)

1. Acceptance criteria satisfied with tests/evidence; rollback documented.
2. Calls are **MCP/SDK‑backed** only.
3. HITL reviews/grades captured for customer‑facing work.
4. Governance: Issue linkage, **Allowed paths**, CI checks green; no disallowed `.md`.
5. Metrics updated if behavior changed; audit entry present.

---

## 10) File Map (where everything lives)

- Strategy: `docs/NORTH_STAR.md` (single star; growth included).
- Operating model (this doc): `docs/OPERATING_MODEL.md`.
- Approvals UI + contracts: `docs/specs/approvals_drawer_spec.md`.
- Rules: `docs/RULES.md`.
- Directions: `docs/directions/<agent>.md`.
- Runbooks: `docs/runbooks/*.md`.
- Progress reporting: `logDecision()` database (primary), `feedback/<agent>/<YYYY-MM-DD>.md` (optional backup).

---

## 11) Migration (if you still have growthengine/\*)

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

---

## Design Files & Specifications (Updated 2025-10-20)

### Complete Vision Documentation

**Design Library**: `/docs/design/` (57 files, ~500KB)

- Dashboard specifications (8 tiles + personalization)
- Approval queue system (HITL workflow)
- Notification system (toast, banner, browser)
- Enhanced modals (grading sliders, multiple actions)
- Settings page (4 tabs)
- Onboarding flow (welcome + 4-step tour)
- Design system guide (38KB, 1800+ lines)
- Accessibility requirements (WCAG 2.2 AA)
- Mobile optimization
- Branding (Hot Rodan)

**Complete Vision**: `COMPLETE_VISION_OVERVIEW.md` (38-task feature manifest)

### Protection Policy (MANDATORY)

**NEVER ARCHIVE** without CEO approval:

- `/docs/design/**`
- `/docs/specs/**`
- `/docs/runbooks/**`
- `/docs/directions/**`

**Incident**: Oct 15 - 57 design files archived as "drafts", agents built to wrong spec (30% vs. 100%).

**Recovery**: Oct 20 - All files restored, protection policy enforced.

**Policy**: `docs/DESIGN_PROTECTION_POLICY.md`

**Manager Commitment**: Never again.

### Implementation Standards

**Design Spec Compliance**:

- Features MUST match design specifications EXACTLY
- 70% feature gaps are UNACCEPTABLE
- Designer validates against all 57 design specs
- QA tests against design specs
- Manager rejects minimal implementations

**Evidence Required**:

- Design spec reference for each feature
- Designer sign-off (implementation matches specs)
- Accessibility validation (WCAG 2.2 AA)
- MCP conversation IDs (Context7 for libraries)

---

## 13) Development Workflow

### Getting Started

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and populate with vault-provided secrets
3. Install repo pre-commit hook: `./scripts/policy/install-hooks.sh`

### Branching Model (Manager-Owned Daily Branch)

**Updated 2025-10-20**: All agents work on single daily branch, Manager coordinates.

- **Daily Branch**: `daily/YYYY-MM-DD` (or `manager-reopen-YYYYMMDD`)
- **All 17 agents**: Commit directly to same branch (no per-agent branches)
- **Manager**: Creates daily branch at startup, merges to main at shutdown
- **File Ownership**: Prevents conflicts (see RULES.md table)
- **Never force-push to `main`** - all merges via PR review (or Manager direct merge if not protected)

**Agents do NOT create branches** - Manager owns all git operations.

### Commit Style

- Conventional commits: `feat(agent-name):`, `fix(agent-name):`, `chore(agent-name):`, `docs(agent-name):`, `test(agent-name):`
- **Agent name in scope is MANDATORY** (e.g. `feat(engineer): add modal component`, `fix(data): correct schema`)
- Allows Manager to track which agent made which changes
- DO NOT squash commits - each agent commit preserved for accountability

### Pull Request Checklist

- [ ] Linked task ID with clear objective
- [ ] Updated docs/runbooks/specs when behavior changes
- [ ] Added or updated tests (unit, integration, or Playwright)
- [ ] Ran `npm run fmt && npm run lint && npm run test:ci` locally
- [ ] Ran `npm run scan` for secrets before pushing
- [ ] Described risk level, rollback plan, deployment impact in PR template

### Required Commands

| Command             | Purpose                                                  |
| ------------------- | -------------------------------------------------------- |
| `npm run fmt`       | Apply project formatting rules (Prettier + ESLint fixes) |
| `npm run lint`      | Run linting on the codebase                              |
| `npm run test:unit` | Execute unit tests via Vitest                            |
| `npm run test:e2e`  | Execute Playwright end-to-end tests (headless)           |
| `npm run test:ci`   | CI smoke including unit + integration suites             |
| `npm run scan`      | Run gitleaks secret scan                                 |
| `npm run ci`        | Wrapper: `fmt`, `lint`, `test:ci`, and `scan`            |

### Reviews & Code Owners

See `CODEOWNERS` for required reviewers. Areas touching `/app`, `/supabase`, `/scripts`, `/deploy`, `/fly-apps`, or workflows require explicit approval from listed leads.
