---
epoch: 2025.10.E1
doc: docs/strategy/initial_delivery_plan.md
owner: manager
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-18
---
# Operator Control Center — Initial Delivery Plan

## Vision
Deliver an operator-first control center embedded in Shopify Admin that surfaces the daily truth across CX, sales, content, social, and inventory. Every tile should present trusted context, recommended actions, and an approval workflow so operators can execute confidently without tab fatigue.

## Primary Persona
- **Store Operator (Ops Lead or GM)** — accountable for same-day revenue, fulfillment health, and customer trust.
- **CX Team Lead** — monitors escalations and needs fast context on conversations.
- **Marketing/Content Owner** — cares about traffic, SEO drifts, and campaigns.

## Guiding Principles
- **Evidence or no merge** — every change ships with automated tests and metrics screenshots or logs.
- **Action-ready tiles** — no vanity charts; each tile owns a workflow that ends in a decision or logged follow-up.
- **Single source of truth** — rely on authenticated APIs (Shopify, Chatwoot, GA) and log derived facts in the Memory package.
- **Approvals everywhere** — risky changes (pricing, messaging, inventory adjustments) require explicit human confirmation tracked in the decision log.

## Key Tiles (v1 scope)
1. **CX Escalations (Chatwoot)**
   - Surface open/pending conversations older than SLA.
   - Provide quick reply suggestions + ability to escalate to Ops.
   - Approval: sending templated reply or tagging conversation.

2. **Sales Pulse (Shopify Orders)**
   - Track today vs. rolling 7-day revenue, top skus.
   - Flag orders stuck in payment pending or fulfillment issues.
   - Approval: trigger manual capture or mark as high priority for fulfillment.

3. **Inventory Heatmap (Shopify Inventory)**
   - List low-stock SKUs (below threshold) and show days of cover.
   - Recommend reorder quantities based on last 14 days velocity.
   - Approval: create draft PO or mark as intentionally low.

4. **SEO & Content Watch (GA / content system)**
   - Detect landing pages with >20% session drop WoW.
   - Suggest content refresh tasks; link to CMS entry.
   - Approval: log assignment to content owner, push to task queue.

5. **Social Sentiment (Phase 2)**
   - Hook into future integration (e.g., X/Meta or Shopify social apps) to track campaign anomalies.
   - Not required for Day 1 launch but plan data contracts now.

## Data & Integrations
- **Shopify Admin GraphQL** — orders, inventory, products; existing snippets in `packages/integrations/shopify.ts`.
- **Chatwoot REST** — already scaffolded client; will need env config + secure storage.
- **Google Analytics MCP** — follow `packages/integrations/ga-mcp.md`; results cached in Postgres for dashboards.
- **Memory Service** — unify derived facts and decision logs. Start with Supabase implementation; consider MCP fallback.

## Architecture Outline
1. **Data Layer**
   - Create server-side services in `app/services/` wrapping integrations with caching + retry.
   - Nightly/cron ingestion: TBD; initial version uses on-demand fetch with 5-minute cache (KV or in-memory per session).
   - Store derived metrics in Prisma (new tables: `dashboard_facts`, `decisions`).

2. **UI Composition**
   - New route `app/routes/app.dashboard.tsx` as home, using Polaris layout with tiles.
   - Each tile: summary card + detail modal (component library under `app/components/tiles/`).
   - Approvals implemented via Remix actions hitting `app/routes/actions/*.ts`.

3. **Decision Logging**
   - On every approval action, write to `packages/memory` adapter (Supabase or fallback) and local Prisma log for audit.

4. **Testing & Observability**
   - Unit tests via Vitest for services/utilities.
   - Component tests via Playwright (dashboard smoke) + mock APIs.
   - Add logging w/ pino for API errors, expose health endpoint.

## Milestones & Workstreams
1. **M0 — Foundation (Week 0)**
   - Set up project structure: `app/components/`, `app/services/`, `prisma` migrations for dashboard tables.
   - Configure environment secrets handling, typed config.
   - Establish CI (Vitest + Playwright) and baseline lighthouse run.

2. **M1 — Data Plumbing (Week 1)**
   - Implement Shopify services: orders + inventory queries w/ caching & tests.
   - Implement Chatwoot service + SLA calculation helper.
   - Integrate GA MCP client, define caching strategy.
   - Seed Memory adapter (Supabase env) + Prisma migrations.

3. **M2 — Dashboard UI (Week 2)**
   - Build tile components with Polaris design tokens.
   - Render summary metrics; hook loader to services.
   - Implement approval modals + actions writing to Memory + Prisma.

4. **M3 — Ops Automation (Week 3)**
   - Add recommended actions per tile + templated responses.
   - Implement notifications (in-app toasts + optional email/slack via webhook).
   - Add audit trail view (list of decisions) with filters.

5. **M4 — Hardening & Launch (Week 4)**
   - Performance tuning, caching, fallback states.
   - Accessibility audit + localization scaffolding.
   - Final E2E tests, run Lighthouse & soak tests.
   - Prepare launch docs: runbooks, FAQ, evidence links.

## Risks & Mitigations
- **API rate limits (Shopify/Chatwoot)** — implement batching, caching, and degrade gracefully.
- **Credentials management** — use Shopify app config for secure secrets; never log secrets.
- **Data latency** — display last refreshed timestamp per tile; allow manual refresh.
- **Team capacity** — ensure branch policy enforced; break work into molecules per tile/service.

## Immediate Next Actions
1. Author technical design docs per workstream (Shopify service, Chatwoot tile, GA ingest).
2. Create Prisma migration for decision/facts tables.
3. Stand up CI config and template tests to maintain Evidence requirement.
4. Draft UI wireframes (Figma link placeholder) and attach once ready.
