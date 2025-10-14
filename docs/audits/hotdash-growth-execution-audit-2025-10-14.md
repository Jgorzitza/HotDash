# HotDash Growth Execution Audit — 2025-10-14

## Executive Summary
- Growth spec coverage is effectively **0%** in the live codebase. The dashboard ships read-only tiles fed by Shopify/GA stubs, but none of the actioning, recommender, or storefront automation described in the checklist exists (`app/routes/app._index.tsx:6`, `app/routes/app._index.tsx:34`).
- Data ingestion is incomplete: Google Analytics pulls lack basic filtering and anomaly math, Search Console pipelines are absent, and webhook flows have no persistence or replay protection (`app/services/ga/directClient.ts:65`, `app/services/ga/directClient.ts:102`, `docs/audits/HotDash_Growth_Audit_Checklist.md:10`).
- Secrets management and operational guardrails are failing. Sensitive credentials are committed to the repo and there is no evidence of rotation playbooks (`vault/occ/chatwoot/webhook_secret_staging.env:1`).
- Manager performance remains at **25 % compliance** with CEO guardrails, with repeated misses on stand-ups, MCP validation, and documentation hygiene (`reports/manager/accountability-review-2025-10-14.md:1`).

## Checklist Findings

### Section A — Data Rails & Signals
- **A1 — Fail:** No GSC BigQuery jobs or ingestion code were found; the only reference to `gsc.raw_searchdata_*` is inside the checklist itself (`docs/audits/HotDash_Growth_Audit_Checklist.md:10`).
- **A2 — Fail:** The GA direct client fetches raw sessions without `sessionDefaultChannelGroup=Organic Search`, and `wowDelta` is hard-coded to `0`, so anomaly math and organic-only aggregation are missing (`app/services/ga/directClient.ts:65`, `app/services/ga/directClient.ts:102`).
- **A3 — Fail:** There are no Shopify order or inventory webhook handlers implementing HMAC/idempotency; only uninstall/scope webhooks exist and they mutably update Prisma sessions (`app/routes/webhooks.app.uninstalled.tsx:1`, `app/routes/webhooks.app.scopes_update.tsx:1`).
- **A4 — Fail:** The Chatwoot webhook is a synchronous proxy with no queue, replay protection, or `CW_REPLY_DRAFT` staging; it forwards raw payloads downstream and returns immediately (`app/routes/api.webhooks.chatwoot.tsx:75`, `apps/agent-service/src/server.ts:36`).
- **A5 — Fail:** No Core Web Vitals storage or snapshots exist—only documentation references the requirement (`docs/audits/HotDash_Growth_Audit_Checklist.md:26`).
- **A6 — Fail:** The dashboard exposes no data-freshness labelling; tile rendering simply displays cached/fresh states without incomplete-data gates (`app/routes/app._index.tsx:81`).
- **A7 — Fail:** Credentials for Chatwoot and other vendors are checked into version control, violating “secrets out of repo” and rotation expectations (`vault/occ/chatwoot/webhook_secret_staging.env:1`).

### Section B — Action Service & API
- **B1 — Fail:** Prisma defines only `Session`, `DashboardFact`, and `DecisionLog`; there is no `Action` schema or versioned payload (`prisma/schema.prisma:13`).
- **B2 – B7 — Fail:** The UI surfaces tiles only; there is no action dock, diff viewer, scoring, lifecycle tracking, or SLA metrics anywhere in the Remix routes or components (`app/routes/app._index.tsx:34`, `app/components/tiles/index.ts:1`).

### Section C — Recommenders
- **C1 – C5 — Fail:** No recommender pipelines or generators exist. The codebase lacks SEO CTR logic, metaobject definitions, merch playbooks, guided selling automation, or CWV repair tasks—only a static dashboard (`app/routes/app._index.tsx:146`).

### Section D — Storefront (Shopify)
- **D1 – D5 — Fail:** There is no programmatic page factory or storefront automation. Structured data generation, canonical management, internal-link orchestration, search synonym control, and performance budgeting are absent from both app routes and Shopify utilities (`app/services/shopify/orders.ts:1`, `app/services/shopify/inventory.ts:1`).

### Section E — Front-End (HotDash)
- **E1 – E3 — Fail:** The dashboard lacks the Top‑10 action dock, action detail view, and auto-publish visibility. Existing components only render read-only metrics tiles (`app/routes/app._index.tsx:34`, `app/components/modals/CXEscalationModal.tsx:12`).

### Section F — Learning Loop
- **F1 – F3 — Fail:** There is no persistence for edit diffs, outcome tracking, or confidence tuning—Prisma has no supporting tables and services provide no hooks for these workflows (`prisma/schema.prisma:31`, `app/services/decisions.server.ts:1`).

### Section G — Experiments
- **G1 – G2 — Fail:** No experimentation framework, cookies, or promotion logic exist in the codebase. Neither frontend nor services reference variant assignment or experiment promotion.

### Section H — Security & Ops
- **H1 — Fail:** Chatwoot webhooks lack replay protection, HMAC enforcement in non-production environments, and queue offloading (`app/routes/api.webhooks.chatwoot.tsx:55`, `apps/agent-service/src/server.ts:36`).
- **H2 — Fail:** Secrets are stored directly in `vault/` with no rotation automation; RBAC enforcement beyond Shopify defaults is undocumented (`vault/occ/chatwoot/webhook_secret_staging.env:1`).
- **H3 — Partial:** Supabase edge logging captures `request_id`, but there is no evidence of dashboards or alerting thresholds wired into runtime (`supabase/functions/occ-log/index.ts:38`).
- **H4 — Fail:** No backup or rollback drill automation is present in scripts or documentation beyond placeholders (`docs/audits/HotDash_Growth_Audit_Checklist.md:133`).

### Section I — KPIs & SLOs
- **I1 – I8 — Fail:** There is no instrumentation or reporting for throughput, approval rates, SEO lift, content velocity, guided selling performance, CWV, or safety incidents. Dashboard data remains tile-level aggregates only (`app/routes/app._index.tsx:34`).

## Manager Performance Audit
- Prior accountability review shows **25 % compliance** with CEO guardrails, highlighting missed stand-ups, insufficient MCP verification, and overdue documentation hygiene tasks (`reports/manager/accountability-review-2025-10-14.md:1`).
- Stand-up posts for 10‑12 through 10‑14 are missing, leaving the team without task assignments or risk tracking (`reports/manager/accountability-review-2025-10-14.md:13`).
- MCP usage over the audit window totals one invocation versus the required fifteen, so technical claims are going unverified (`reports/manager/accountability-review-2025-10-14.md:22`).

## Critical Risks & Immediate Recommendations
- **Rebuild data ingress with secure ops**: stand up GA4 organic aggregation, BigQuery GSC feeds, and Shopify/Chatwoot webhooks with durable queues and idempotency before shipping any operator-facing workflows (`app/services/ga/directClient.ts:65`, `app/routes/api.webhooks.chatwoot.tsx:75`).
- **Ship the action system before UI polish**: implement Prisma models, API surfaces, and UI components for Action schema v1, diff previews, gating, and SLA reporting to unblock every downstream checklist item (`prisma/schema.prisma:13`, `app/routes/app._index.tsx:34`).
- **Remove secrets from the repo and institute rotations**: migrate credentials to environment stores or the existing vault service with access controls, document rotation cadence, and demonstrate compliance (`vault/occ/chatwoot/webhook_secret_staging.env:1`).
- **Close manager process gaps**: reinstate daily stand-ups, enforce MCP-first validation, and clear overdue documentation clean-up before additional scope is accepted (`reports/manager/accountability-review-2025-10-14.md:94`).
