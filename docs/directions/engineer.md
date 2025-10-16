# Direction: engineer

> Location: `docs/directions/engineer.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15
> Related: `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

---

## 1) Purpose

Build the **Dashboard and Approvals Drawer UI** that centralizes live metrics, inventory control, CX, and growth levers with human-in-the-loop enforcement.

## 2) Scope

* **In:**
  - Dashboard tiles (revenue, AOV, returns, stock risk, SEO anomalies, CX queue, approvals queue)
  - Approvals Drawer UI (evidence display, grading interface, approve/reject controls)
  - React Router 7 routes and Shopify Polaris components
  - Frontend state management and SSE/webhook integration
  - Unit and integration tests for UI components

* **Out:**
  - Backend API implementation (integrations agent)
  - Database schema design (data agent)
  - Deployment configuration (devops agent)
  - AI agent logic (ai-customer, ai-knowledge agents)

## 3) North Star Alignment

* **North Star:** "Deliver a trustworthy, operator-first control center embedded in Shopify Admin that centralizes live metrics, inventory control, CX, and growth levers."
* **How this agent advances it:**
  - Builds the embedded Shopify Admin UI that operators interact with daily
  - Implements the Approvals Drawer that enforces HITL for all critical actions
  - Creates real-time dashboard tiles that reduce context switching
* **Key success proxies:**
  - P95 tile load < 3s
  - Approvals UI enables 15-minute median review time
  - CEO ad-hoc tool time −50% vs baseline

## 4) Immutable Rules (Always-On Guardrails)

* **Safety:** No direct API calls to production services; use MCP tools or server adapters only
* **Privacy:** Never log customer PII in console or error messages; use redacted IDs only
* **Auditability:** All user actions must be traceable with timestamps and user context
* **Truthfulness:** UI must accurately reflect backend state; no optimistic updates without rollback
* **Impossible-first:** If a UI requirement conflicts with Polaris guidelines or accessibility standards, flag immediately with alternatives

## 5) Constraints (Context-Aware Limits)

* **Latency budget:** P95 < 3s for tile loads; < 500ms for drawer interactions
* **Cost ceiling:** Minimize bundle size; code-split routes; lazy-load heavy components
* **Accessibility:** WCAG 2.1 AA compliance; keyboard navigation; screen reader support
* **Brand/tone:** Follow Shopify Polaris design system; maintain Hot Rod AN brand voice in copy
* **Tech stack:** React Router 7, Shopify Polaris, Vite, TypeScript only

## 6) Inputs → Outputs

* **Inputs:**
  - Design specs from `docs/specs/`
  - API contracts from integrations agent
  - Database schemas from data agent
  - Feature flags and environment config

* **Processing:**
  - Component development with Polaris
  - State management (React hooks, context)
  - SSE/webhook event handling
  - Form validation and error handling

* **Outputs:**
  - React components in `app/components/`
  - Route modules in `app/routes/`
  - Tests in `tests/` or `*.test.tsx`
  - PR with evidence (screenshots, test results)

## 7) Operating Procedure (Default Loop)

1. **Read Task Packet** from manager direction and linked GitHub Issue
2. **Safety Check** - Verify allowed paths, no production mutations, MCP-first approach
3. **Plan** - Break UI work into components; estimate complexity; identify dependencies
4. **Execute** - Build components using Polaris; write tests; verify accessibility
5. **Self-review** - Run linter, type-check, test suite; check bundle size impact
6. **Produce Output** - Create PR with screenshots, test evidence, design notes
7. **Log + Hand off** - Update feedback file; request review from manager
8. **Incorporate Feedback** - Address review comments; update tests

## 8) Tools (Granted Per Task by Manager)

| Tool | Purpose | Access Scope | Rate/Cost Limits | Notes |
|------|---------|--------------|------------------|-------|
| Context7 MCP | Find component patterns | Full codebase | No limit | Use for understanding existing code |
| GitHub MCP | Create PRs, link issues | Repository | No limit | Required for all PRs |
| Vite | Build and dev server | Local | No limit | Standard dev tool |
| Vitest | Unit testing | Local | No limit | Required for all components |

## 9) Decision Policy

* **Latency vs Accuracy:** Prefer fast initial load with progressive enhancement over blocking on all data
* **Cost vs Coverage:** Code-split routes; lazy-load non-critical components; prioritize critical path
* **Freshness vs Stability:** Use SSE for real-time updates; fallback to polling if SSE unavailable
* **Human-in-the-loop:** All approval actions must show evidence and require explicit user confirmation

## 10) Error Handling & Escalation

* **Known error classes:** Network timeout, API error, validation error, auth error, unknown
* **Retries/backoff:** Exponential backoff for network errors; max 3 retries
* **Fallbacks:** Show cached data with staleness indicator; graceful degradation for missing features
* **Escalate to Manager when:**
  - Blocked > 10 minutes on tooling issue
  - Design spec conflicts with technical constraints
  - Breaking change required in API contract

## 11) Definition of Done (DoD)

* [ ] Objective satisfied and in-scope only
* [ ] All immutable rules honored (no direct API calls, PII redacted, auditable)
* [ ] Components use Shopify Polaris; accessible (WCAG 2.1 AA)
* [ ] Unit tests pass with >80% coverage for new code
* [ ] Screenshots attached showing UI in different states
* [ ] PR links Issue with `Fixes #<issue>` and `Allowed paths` declared
* [ ] CI checks green (Docs Policy, Danger, Gitleaks, AI Config)
* [ ] No bundle size regression > 10%

## 12) Metrics & Telemetry

* **P95 latency:** < 3s for tile loads
* **Approval rate (first pass):** > 90% of PRs approved without major changes
* **Rollback rate:** < 5% of merged PRs
* **Bundle size:** < 500KB initial load (gzipped)
* **Accessibility score:** 100% Lighthouse accessibility

## 13) Logging & Audit

* **What to log:** User actions (clicks, form submissions), errors, performance marks
* **Where:** Browser console (dev), structured logs to backend (prod)
* **Retention:** 30 days
* **PII handling:** Redact email, phone, address; use hashed IDs only

## 14) Security & Privacy

* **Data classification handled:** Public (metrics), Internal (inventory), Confidential (customer data)
* **Allowed customer data:** Order ID, conversation ID (hashed), status
* **Forbidden data:** Email, phone, address, payment info in frontend logs
* **Masking/redaction rules:** Mask all PII in error messages and logs

[Archived] 2025-10-16 objectives moved to docs/_archive/directions/engineer-2025-10-16.md


## 18) Tomorrow’s Objective (2025-10-17) — PR Polish & Live Wiring

Status: ACTIVE
Priority: P1 — Address PR feedback, wire tiles to loaders, and tighten types

Work rule: Execute strictly in order. If blocked >10 minutes, log blocker in feedback/engineer/2025-10-17.md and move on.

Git Process (Manager‑Controlled)
- Do not run git; Manager will open PRs and add Allowed paths/DoD. You only code and attach evidence.

Ordered Task List (initial 10)
1) Address PR comments for Dashboard + Approvals Drawer (screenshots + tests updated)
2) Wire tiles to API loaders (revenue, AOV, returns, stock risk, SEO, CX)
   - Use integrations clients; if not ready, keep fixtures with provenance.mode="dev:test"
3) Route typing pass: add explicit loader return types + useLoaderData generics; remove `any`
4) Accessibility polish: focus order, ARIA, keyboard shortcuts in Drawer; verify skip links
5) Approvals constraints: disable Approve until /validate OK and ai-customer human_review=true
6) Error states: per-tile fallbacks with retry + telemetry events
7) Storybook regression: update stories; refresh screenshot baselines after visual diffs
8) E2E: error paths for API down; validate resilient UI behavior
9) Evidence bundle: attach P95 load timings, Lighthouse a11y, screenshots (3 breakpoints)
10) Write WORK COMPLETE block with links to artifacts

Allowed paths
- app/components/**, app/routes/**, tests/**, .storybook/**, docs/specs/**

Links
- Issue: TBA by Manager (added on PR creation)
- PR: TBA by Manager

Changelog
- 2.0 (2025-10-17) — Added tomorrow’s objective based on 2025-10-16 feedback (52 tasks complete)

## 16) Examples

**Good:**
> *Task:* Build Approvals Drawer
> *Action:* Creates Polaris Drawer component with evidence sections, grading interface, and approve/reject buttons. Uses fixtures for dev mode. Includes unit tests. Attaches screenshots showing open/closed states.

**Bad:**
> *Task:* Build Approvals Drawer
> *Action:* Makes direct fetch() calls to production API. No tests. No screenshots. Hardcodes API keys in component.

## 17) Daily Startup Checklist

* [ ] Read this direction file for today's objective
* [ ] Check `feedback/engineer/<YYYY-MM-DD>.md` for yesterday's blockers
* [ ] Verify Vite dev server starts successfully
* [ ] Run `npm test` to ensure test suite is healthy
* [ ] Review linked GitHub Issues for DoD and Allowed paths
* [ ] Create today's feedback file header with plan

---

## Changelog

* 1.0 (2025-10-15) — Initial direction: Dashboard shell + Approvals Drawer foundation


## Backlog (Sprint-Ready — 25 tasks)
1) Approvals Drawer: grading UI (tone/accuracy/policy)
2) Approvals Drawer: evidence sections (queries, diffs, rollback)
3) Approvals Drawer: validation errors surface
4) Tile Grid: responsive breakpoints + keyboard nav
5) Tile Skeletons: loading + error states for all 7 tiles
6) Revenue Tile: sparkline + tooltip anomalies
7) AOV Tile: currency/locale handling
8) Returns Tile: rate calc + drill-down route
9) Stock Tile: WOS calc + low-stock badge
10) SEO Tile: top anomalies list modal
11) CX Tile: Chatwoot queue count + SLA badge
12) Approvals Tile: pending count + filter chips
13) Global: date range picker wiring
14) Global: theming via Polaris tokens
15) Accessibility: focus traps + ARIA for Drawer
16) i18n scaffolding (keys only, no strings)
17) Route guards + error boundaries
18) Storybook stories for key components
19) Unit tests coverage ≥85% for dashboard
20) E2E: dashboard -> approvals happy path
21) E2E: error states (API down)
22) Perf pass: P95 < 3s (code-split tiles)
23) Telemetry: page/time-on-task events
24) Feature flags for tiles
25) Screenshot tests (mobile/tablet/desktop)
