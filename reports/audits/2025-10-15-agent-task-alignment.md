# Agent Task Alignment Audit — North Star Check (2025-10-15)

**Objective:** Assess whether each active agent’s current task list (per `docs/directions/*.md`) pushes directly toward the October 2025 North Star outcomes (`docs/NORTH_STAR.md`). Alignment scored against primary pillars:
1. **Dashboard Embedded Experience & Approvals**
2. **Inventory Control & Picker Ops**
3. **Customer Ops HITL (Chatwoot)**
4. **Integrated Growth (SEO/Ads/Content)**
5. **Governance, Data Resilience & MCP/HITL Guardrails**

> _Context:_ Several high-priority assets were deleted in the recent cleanup without verifying dependency chains. That mistake has left multiple agents executing tasks that reference missing files. The analysis below highlights where direction files remain aligned conceptually but need asset restoration to make progress possible.

---

## Alignment Summary

| Agent | Primary Pillar(s) | Alignment | Notes |
|-------|-------------------|-----------|-------|
| Engineer (`docs/directions/engineer.md:180`) | Dashboard & Approvals | ⚠️ Partial | Tasks target approvals drawer and seven dashboard tiles, but core components/tests were deleted. Restore UI scaffolding before continuing. |
| Designer (`docs/directions/designer.md:20`) | Dashboard UX & Accessibility | ✅ Strong | Design specs for tiles, approvals, accessibility align with embedded excellence. Ensure deliverables land in remaining `docs/design/` paths. |
| Analytics (`docs/directions/analytics.md:30`) | Growth Analytics Support | ✅ Strong | GA4 dashboards, funnels, anomalies feed SEO/ads tiles. Prioritize tight integration with dashboard loaders for real-time metrics. |
| Ads (`docs/directions/ads.md:31`) | Growth HITL Campaigns | ⚠️ Partial | ROAS/budget tasks align with Growth pillar, but deleted ROAS/optimizer files stall progress. Reinstate code targets and add approvals loop integration. |
| Content (`docs/directions/content.md:24`) | Growth HITL Posting | ✅ Strong | Post drafter, engagement analysis, hashtag optimization support HITL content scope. Ensure HITL workflow outputs feed approvals queue. |
| SEO (`docs/directions/seo.md`)* | Growth SEO Monitoring | ✅ Strong | Ranking tracker and anomalies detection map directly to Growth scope; continue feeding results into dashboard tiles. |
| Inventory (`docs/directions/inventory.md:24`) | Inventory Control | ⚠️ Partial | ROP, kits, payouts tasks align, but inventory heatmap component and metafield docs were removed. Restore specs & UI endpoints for completion. |
| Support (`docs/directions/support.md:24`) | Customer Ops HITL | ⚠️ Partial | KB ingestion, triage, SLA fit Customer Ops pillar, but RAG build script currently wipes live index when key missing. Add guardrails and confirm embeddings flow. |
| AI-Customer (`docs/directions/ai-customer.md:29`) | Customer Ops HITL | ⚠️ Partial | Tasks enforce HITL agent workflows. However, SDK entry files were deleted, so agents cannot be instantiated. Recreate `app/agents/sdk/*` and ensure config persists. |
| AI-Knowledge (`docs/directions/ai-knowledge.md`)* | Support Knowledge Base | ✅ Strong | Schema, search, learning pipeline bolster Customer Ops + HITL learning loop. |
| Integrations (`docs/directions/integrations.md:159`) | Tool-First Intelligence | ⚠️ Partial | Shopify/Supabase/Chatwoot clients, audit middleware align with MCP-first pillar, but key client files and tests were removed. Restore stubs before new work. |
| Data (`docs/directions/data.md:155`) | Audit & Resilience | ⚠️ Partial | Approvals/audit schema tasks are essential, yet migrations/docs were deleted. Recreate schema files to unblock. |
| DevOps (`docs/directions/devops.md:159`) | Governance & Resilience | ✅ Strong | Deployment workflows, health checks, observability directly serve resilience pillar. |
| QA (`docs/directions/qa.md:120`) | Governance & DoD | ✅ Strong | Acceptance, E2E, performance, security suites ensure Definition of Done. |
| Product (`docs/directions/product.md:20`) | Governance & Alignment | ⚠️ Partial | Launch checklist + success metrics align, but `dashboard_launch_checklist.md` missing; update plan with actual file path. |
| Designer (already noted) | | | |
| Manager (`docs/directions/manager.md`)* | Governance Coordination | ✅ Strong | (Not detailed here; current tasks emphasize agent packet updates and MCP governance.) |

_\* Files with “*” were sampled for scope confirmation; they follow the same pattern as other direction docs and currently align._

---

## Pillar-by-Pillar Observations

### 1. Dashboard Embedded Experience & Approvals
- **Engineer** tasks still emphasize approvals drawer, dashboards, and tile resiliency (`docs/directions/engineer.md:180`). However, the key React components/tests were purged. Without restoring `app/components/approvals/ApprovalsDrawer.tsx` and related assets, the agent is blocked despite good alignment.
- **Designer** backlog zeroes in on tile grids, responsive patterns, accessibility, and Polaris usage (`docs/directions/designer.md:24`). Alignment is excellent; just ensure deliverables land where references expect them.
- **QA** maintains coverage with E2E/UX tests across dashboard → approvals (`docs/directions/qa.md:120`). This supports the embed/HITL loop once engineering assets return.

**Action:** Restore deleted approvals/tile files immediately so engineer, QA, and designer efforts converge on a working approvals queue.

### 2. Inventory Control & Picker Operations
- **Inventory** focuses on ROP formulas, PO generation, kits, and payouts (`docs/directions/inventory.md:24`), matching the North Star inventory milestone. Missing supporting docs (`docs/specs/inventory_data_model.md`, `docs/integrations/shopify_inventory_metafields.md`) and heatmap component reduce effectiveness.
- **Data** must supply supporting schema migrations for picker payouts, approvals, and audit logs (`docs/directions/data.md:155`), but those migration files were deleted. Inventory tasks depend on these tables.

**Actions:** Recreate deleted schema/doc assets and coordinate between Inventory/Data to avoid drift.

### 3. Customer Ops HITL (Chatwoot)
- **AI-Customer** tasks enforce SDK-driven HITL flow (`docs/directions/ai-customer.md:29`), but absence of `app/agents/sdk/*` and agent entry modules means the scope cannot progress.
- **Support** agent handles KB ingestion, triage, SLA, and quality (`docs/directions/support.md:24`), aligning with customer ops requirements. Guard the RAG build script so we stop deleting the live index when credentials are missing.
- **AI-Knowledge** builds the knowledge base, feeding AI-Customer and Support with embeddings/search.

**Actions:** Restore AI agent scaffolding, patch RAG builder, and validate that support metrics feed into dashboard/HITL flows.

### 4. Integrated Growth (SEO / Ads / Content)
- **Ads, Analytics, Content, SEO** each own slices of the growth pillar, with tasks reflecting metrics, dashboards, and HITL recommendation pipelines (`docs/directions/ads.md:31`, `docs/directions/analytics.md:30`, `docs/directions/content.md:24`). All align conceptually.
- Missing implementation files (ROAS engine, budget optimizer, etc.) undercut Ads’ ability to produce the promised metrics. Ensure restored code also emits data into dashboard tiles and approvals suggestions.

**Actions:** Restore Ads deliverables, add explicit dependencies so Analytics/Engineer get real data, and confirm Content/SEO outputs surface in the approvals UI once rebuilt.

### 5. Governance, Data Resilience & MCP/HITL Guardrails
- **DevOps** direction is tightly aligned with resilience: production deploy workflows, health checks, backups (`docs/directions/devops.md:159`).
- **QA** enforces Definition of Done via PR reviews, test suites, and evidence requirements.
- **Data** tasks are aligned but stalled due to missing migration scripts. Without approvals/audit tables, we violate the audit trail requirement.
- **Integrations** ensures tools exist for agents to call via MCP (`docs/directions/integrations.md:159`), but missing client/middleware files need restoration to keep the “Tool-First Intelligence” pillar intact.
- **Product** tasks codify success metrics, monitoring, and stakeholder comms (`docs/directions/product.md:24`); ensure deliverables publish to actual files (rename checklist doc to match).

---

## Cross-Team Risks & Recommendations

1. **Restore Deleted Assets Now:** The manager-led purge broke multiple dependencies. Recreate all missing files listed in the previous audit (`reports/audits/2025-10-15-agent-feedback-audit.md`) so direction tasks remain actionable.
2. **Add Dependency Notes to Direction Files:** Annotate sections where tasks rely on specific artifacts (e.g., Data migrations needed before Inventory tasks). This will keep agents from waiting on invisible blockers.
3. **Check Approvals Loop Cohesion:** Engineer, AI-Customer, Support, and QA must converge on a functioning approvals drawer with HITL grades. Add a weekly sync to verify all four perspectives are integrated.
4. **Link Growth Outputs to Dashboard:** Ads/Content/Analytics/SEO workstreams should explicitly note which dashboard tiles or approvals workflows consume their outputs. Add acceptance criteria to ensure data flows end-to-end.
5. **Protect Knowledge Assets:** Fix `scripts/rag/build-index.ts` to skip destructive deletes when embeddings aren’t available, and document fallback steps to use the existing MCP server.
6. **Align Product Documentation Paths:** Rename or recreate missing spec files so Product agent’s tasks resolve to actual paths (e.g., `docs/specs/dashboard_launch_checklist.md`).

---

**Prepared by:** Codex – Task Alignment Audit  
**Date:** 2025-10-15
