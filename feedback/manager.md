---
epoch: 2025.10.E1
doc: feedback/$(basename "$file")
owner: $(basename "$file" .md)
last_reviewed: 2025-10-14
doc_hash: TBD
expires: 2025-10-21
---

<!-- Log new updates below. Include timestamp, command/output, and evidence path. -->

## 2025-10-14T21:30Z — Local Supabase Cutover Logged
- Documented the Postgres-only workflow (README, direction updates, `docs/runbooks/supabase_local.md`).
- All agents paused pending rate-limit lift; direction files now reference the new Supabase/App Bridge posture and fresh feedback logs.
- Next action after limits clear: rerun `supabase start` + `npm run setup`, relaunch agents in the order Reliability → Deployment → Engineer → Data → QA → Localization → Designer/Enablement/Marketing/Support → Product/AI → Integrations/Chatwoot.

## 2025-10-10T23:11Z — LlamaIndex & Chatwoot Planning Snapshot
- Reviewed LlamaIndex workflow/framework docs plus LlamaHub catalog; shortlisted local TypeScript workflow engine, Supabase vector-store persistence, and MCP-integrated retriever/agent stack.
- Compared high-value loaders (Sitemap/WebPage, Git repo/directory, Supabase SQL) with benefits/drawbacks to guide ingestion of hotrodan.com, runbooks, and structured decision logs.
- Mapped support automation path: keep frontline automation inside Chatwoot via webhook → LlamaIndex service, capture human-approved replies into Supabase for nightly retrain, and surface analytics/override tools in Shopify Admin.
- Next actions once limits lift: inventory content sources vs selected loaders, scaffold `scripts/ai/llama-workflow` via `npx create-llama`, draft MCP tool specs (“refresh_index”, “query_support”), and align Chatwoot webhook runbook with the plan.

## 2025-10-10T23:17Z — LlamaHub Shortlist & Email Strategy Locked
- Finalized ingestion scope: use LlamaHub `SitemapLoader` + `WebPageReader` for hotrodan.com, `SupabaseReader` for decision/telemetry tables, and Chatwoot API/webhook loop for curated replies; defer git/CSV loaders until needed.
- Confirmed MCP toolbox tooling will be built alongside ingestion so AI/Data/Support agents share “refresh_index”, “query_support”, and “insight_report” paths with auditable output.
- Direction updates pending to reflect Chatwoot-only email handling, nightly Supabase-backed RAG refresh, and knowledge capture from human-approved responses.
- Once docs are written, relaunch order stays Reliability → Deployment → Engineer → Data → QA → Localization → Designer/Enablement/Marketing/Support → Product/AI → Integrations/Chatwoot.

## 2025-10-10T23:24Z — CEO Feedback Logged
- CEO confirmed satisfaction with the updated direction set and coordination plan; noted verbally to preserve context for next session.
- No additional actions requested at this time; maintain readiness to relaunch agents per standing order.
