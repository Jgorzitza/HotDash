---
epoch: 2025.10.E1
doc: feedback/compliance.md
owner: compliance
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-08
---
# Compliance Agent — Daily Status Log

## 2025-10-07
- **Direction**: Acknowledged `docs/directions/compliance.md`; new compliance artifacts published (`docs/compliance/data_inventory.md`, `docs/runbooks/incident_response_breach.md`).
- **Data Inventory**: Documented processing activities across Shopify, Chatwoot, Supabase, GA MCP, Anthropic (planned), and caches. Flagged required retention automations and DPIA follow-up.
- **Incident Response Preparedness**: Drafted breach runbook covering detection→notification workflow, evidence handling, and quarterly readiness checklist; pending reliability/support review.
- **Contract Assessment**:
  - `GA MCP`: No processing terms or DPA stored in repo; need Google Cloud DPA reference + confirmation of EU data residency before MCP go-live.
  - `Supabase`: Secret rotation runbook exists, but DPA/SCC evidence absent. Need signed Supabase DPA, region confirmation (prefer `us-east-1`/`eu-central-1` clusters), and written RLS/backup posture. Request docs from manager/vendor.
  - `Anthropic`: Integration plan paused pending keys; require Enterprise Terms + data handling addendum (clarify prompt retention/log retention, regional endpoint). Also need operator consent language aligned with marketing copy.
- **Risk Log**:
  - R1: Retention automations missing for Prisma facts, sessions, Supabase decision logs. Owner: Engineering + Reliability. Target: 2025-10-18.
  - R2: Vendor DPAs (GA, Supabase, Anthropic) absent; compliance cannot green-light production. Owner: Manager to secure agreements. Target: 2025-10-14.
  - R3: Privacy notice lacks operator analytics disclosure. Owner: Marketing/Compliance. Target: 2025-10-12.
- **Next Actions**:
  1. Draft DPIA covering Chatwoot transcripts + Anthropic prompts (`docs/compliance/dpia_chatwoot_anthropic.md`).
  2. Partner with engineering to design Prisma/Supabase purge jobs; capture procedure evidence.
  3. Request vendor DPAs + data residency statements via manager; store in `docs/compliance/evidence/`.
- **Progress Update**: Generated vendor DPA request templates & evidence tracker (`docs/compliance/evidence/vendor_dpa_status.md`), published retention automation plan (`docs/compliance/retention_automation_plan.md`), documented Chatwoot/Anthropic DPIA (`docs/compliance/dpia_chatwoot_anthropic.md`), and drafted privacy notice language (`docs/compliance/privacy_notice_updates.md`). Awaiting manager/vendor responses and engineering implementation.
- **Follow-up**: Logged DPA outreach (`docs/compliance/evidence/*/request_2025-10-07.md`), added purge script (`scripts/ops/purge-dashboard-data.ts` + `npm run ops:purge-dashboard-data`), recorded Supabase cron draft, and updated launch FAQ with telemetry/AI disclosures.
- **Latest**: Ran purge script (log archived `docs/compliance/evidence/retention_runs/2025-10-08_purge_log.json` once generated); recorded vendor follow-ups (`docs/compliance/evidence/vendor_followups_2025-10-08.md`); published privacy toggle rollout plan (`docs/marketing/privacy_toggle_rollout.md`) and staged final notice copy (`docs/compliance/evidence/privacy_notice/operator_notice_v2025-10-08.md`).
