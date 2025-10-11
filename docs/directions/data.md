---
epoch: 2025.10.E1
doc: docs/directions/data.md
owner: manager
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# Data — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Data team must not create or edit direction files; route change proposals to manager with evidence.

- Model KPI definitions (sales delta, SLA breach rate, traffic anomalies) and publish dbt-style specs in docs/data/
- Validate Shopify/Chatwoot/GA data contracts; raise schema drift within 24h via feedback/data.md.
- Implement anomaly thresholds + forecasting in Memory service; surface assumptions alongside facts.
- Partner with engineer to add Prisma seeds/backfills; own migration QA for dashboards on the Supabase Postgres stack (local via `supabase start`, staging via vault secrets).
- Maintain GA MCP mock dataset and swap to live host once credentials land; ensure caching + rate limits measured.
- Supply curated document feeds (Supabase decision/telemetry extracts, Chatwoot gold replies, website snapshots) for LlamaIndex ingestion and record refresh cadence with compliance sign-off.
- Tail Supabase logs (`scripts/ops/tail-supabase-logs.sh`) when running parity scripts to capture evidence alongside analyzer outputs.
- Stack guardrails: follow `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex); no Fly Postgres provisioning.
- Reference docs/dev/admin-graphql.md for admin data contracts and docs/dev/storefront-mcp.md for customer-facing datasets.
- Provide weekly insight packet (charts + narrative) attached in manager status with reproducible notebooks.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/data.md` without waiting for additional manager confirmation.

## Current Sprint Focus — 2025-10-10
Execute these tasks in order and log progress in `feedback/data.md`. For every command or outreach, capture the timestamp and outcome; retry twice before escalating with evidence.

1. **Supabase access hardening** — Run through `docs/runbooks/supabase_local.md` to verify `supabase start`, `npm run setup`, and pgvector availability. Provision (or confirm) a least-privilege read-only role for AI ingestion, record credentials in vault per `docs/ops/credential_index.md`, and log evidence.
2. **Decision/telemetry readiness** — Validate the `decision_sync_events` and telemetry tables contain current data, add missing indexes if queries lag, and export schema snapshots to `artifacts/data/supabase-schema-<timestamp>.sql`. Update `docs/runbooks/incident_response_supabase.md` with the latest state.
3. **Gold reply schema** — Design and apply a Supabase migration (e.g., `supabase/migrations/*_chatwoot_gold_replies.sql`) that captures curated Chatwoot replies (message body, tags, approver, timestamps). Coordinate with Support to document the approval workflow and ensure RLS is enforced; include evidence.
4. **Chatwoot ingest bridge** — Build a storage procedure or REST endpoint (document scope) so Support’s webhook can insert curated replies. Deliver a test payload, validate inserts, and log parity results under `artifacts/monitoring/chatwoot-gold-<timestamp>.json`.
5. **LlamaIndex data feeds** — Generate a hotrodan.com sitemap snapshot (timestamp + size) and deliver to AI via Supabase storage or artifacts; confirm the Supabase view powering `SupabaseReader` exposes the required columns/filters.
6. **Evaluation dataset** — Maintain a labeled Q/A set derived from decision logs + support replies for AI regression (store under `artifacts/ai/eval/`). Update instructions in `docs/runbooks/llamaindex_workflow.md` once AI lands it.
7. **Stack compliance audit** — Participate in the Monday/Thursday review with QA/manager, focusing on data pipeline access and retention; document findings in `feedback/data.md`.
8. **Insight preparation** — Keep weekly insight notebooks prepped (metrics + narrative) so they can ship immediately after latency and embed-token blockers clear.
