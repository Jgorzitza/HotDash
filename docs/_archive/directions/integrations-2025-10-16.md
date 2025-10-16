# Direction Archive — integrations — 2025-10-16

Source: docs/directions/integrations.md (archived daily objective)

## 15) Today's Objective (2025-10-16) — BLOCKER‑FIRST RESET

Status: ACTIVE
Priority: P0 — Restore missing clients/middleware and unblock UI/agents

Work rule: Execute strictly in order; if blocked >10 minutes, log blocker in feedback/integrations/<today>.md and move on.

Git Process (Manager‑Controlled)
- No git operations; Manager will create Issues/PRs with Allowed paths/DoD.

Ordered Task List (30)
1) Recreate app/lib/supabase/client.ts (singleton; env‑driven)
2) Recreate app/lib/errors.ts (normalized error types)
3) Recreate app/middleware/audit.ts (before/after logging)
4) Recreate app/middleware/rate‑limit.ts (token bucket)
5) Recreate tests/integration/api/clients.test.ts (Shopify, Supabase, Chatwoot, GA4)
6) Align app/lib/analytics/client.ts helpers and exports
7) Ensure app/lib/chatwoot/client.ts supports pagination/filters
8) Verify app/routes/api/health/index.ts returns OK + dependencies
9) Add idempotency util app/lib/idempotency.ts for writes
10) Wire circuit breaker app/lib/circuit‑breaker.ts to clients
11) Expose retry budget metrics app/lib/monitoring/retry‑budget.ts
12) Load secrets from env only; no secrets in code
13) Provide TS types and error taxonomy
14) Align API routes with QA integration tests
15) Inject request IDs in logs
16) Backoff policies for 429/5xx
17) Integrate structured logger app/lib/structured‑logger.ts
18) MSW/mock servers in tests/mocks/*
19) README for API contracts docs/api‑contracts/README.md
20) Sample curl scripts for QA
21) Validate Shopify webhook route compiles/responds
22) Validate Chatwoot webhook route compiles/responds
23) Environment config switchers app/lib/config/environment.ts
24) Rate‑limit tests
25) Audit middleware tests
26) Update API contracts doc with evidence
27) Run QA suites; fix gaps
28) Notify Engineer on client readiness
29) Rollback considerations documented
30) Update feedback with evidence

Current Focus: Tasks 1–6, then 7–10
Blockers: None — proceed.
Critical: P95 read <500ms; audit log every tool call; no secrets in code.

### Artifact Source and Phase 2 — NORTH_STAR Delivery (22 tasks)
Note: Manager will restore clients/middleware from docs/_archive/2025-10-15-prebundle/app. Agents must not use git. Validate locally and proceed.

Phase 2 Tasks:
1) Add typed client interfaces and error enums
2) Add circuit breaker metrics and dashboards
3) Add exponential backoff strategies per provider
4) Add idempotency keys enforcement on POST
5) Add request signing where applicable
6) Add health dependency fan‑out checks
7) Add sandbox/staging switches per provider
8) Add retries budget guardrails
9) Add structured logs correlation (trace IDs)
10) Add MSW server scenarios coverage
11) Add API contract snapshots for QA
12) Add SDK usage examples for Engineer/AI‑Customer
13) Add webhook signature verification stubs
14) Add 429 adaptive throttling by resource
15) Add secrets schema doc (no values) for CI
16) Add per‑route rate‑limit configs and tests
17) Add dead‑letter queue handling (notes)
18) Add circuit breaker open/half‑open tests
19) Add curl examples for common operations
20) Add PR checklist (evidence + rollback + contracts)
21) Add observability hooks (latency/error histograms)
22) Handoff summary to Engineer/QA

