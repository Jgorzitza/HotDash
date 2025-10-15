---
epoch: 2025.10.E1
doc: docs/specs/agent_interaction_metrics_design.md
owner: manager
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Agent Interaction Metrics Design (Customer-Facing AI)

This design bakes the performance metrics spec into all customer-facing AI agents (Chatwoot automation, Shopify Admin overlays, support workflows) so we continuously improve long-term customer interactions.

References:
- Canonical metrics spec: /home/justin/HotDash/hot-dash/agentfeedbackprocess.md
- Feedback policy: docs/policies/agentfeedbackprocess.md
- Agent directions: docs/directions/<agent>.md

## Goals
- Every customer-facing AI interaction produces a structured `agent_run` log.
- Human review (when applicable) emits `agent_qc` entries for quality scoring.
- Operational dashboards highlight trends, regressions, and ROI; alerts trigger on SLA or quality breaches.

## Surfaces to instrument
- Chatwoot automation (approve/send path, escalation path, curated replies)
- Shopify Admin overlays (tile actions, approvals)
- Support runbooks (operator checklists, webhooks)

## Event model
- One `agent_run` per interaction execution (e.g., AI-generated reply, decision assist, escalation recommendation):
  - `run_id`, `agent_name`, `input_kind`, `started_at`, `ended_at`, `resolution`, `self_corrected`, `tokens_input`, `tokens_output`, `cost_usd`, `sla_target_seconds`, `metadata`
- Optional `agent_qc` (quality review): `run_id`, `quality_score`, `notes`

## Storage
- Supabase tables (`agent_run`, `agent_qc`) and view (`v_agent_kpis`) per metrics spec.
- Partitioning not required initially; add indexes on `(agent_name, started_at)`.

## Ingestion patterns
- Server-side endpoint: `/api/agent-runs` (POST JSON), validates schema, inserts into Supabase via service role.
- Client wrappers for in-app usage (TS): `logAgentRunStart`, `logAgentRunEnd`, `logAgentQc` functions.
- No secrets in logs. Use correlation IDs and metadata (shop_id, order_id, ticket_id) only.

## Dashboards & Alerts
- Build KPIs off `v_agent_kpis`: ART, SCR, ESC, SLA, CPR, Quality.
- Alert rules (examples): SLA Hit Rate < 90% daily; Escalation% > 20% over last 100 runs; ART > baseline ×1.5.

## QA & Reliability
- QA verifies schema adherence and presence of logs per flow.
- Reliability monitors log volume and ingestion health.

## Compliance & Data retention
- Retain summaries; purge raw `agent_run` after agreed period (e.g., 90 days) per compliance policy.
- Sanitize PII in notes; metadata must not contain secrets.

## Next steps (owned by roles)
- Data: add Supabase migration for tables/view, indexes; maintain data catalog entries.
- Engineer: add server endpoint and TS client wrappers; integrate in Shopify overlays and service layer.
- Integrations/Chatwoot: emit `agent_run` for automation flows; coordinate human QC scoring capture.
- Support: establish QC rubric and logging cadence (weekly sampling).
- QA: add Playwright checks that confirm `agent_run` creation on key flows.
- Product: define thresholds and dashboard configs; publish KPIs.
- Reliability: add ingestion health checks; watch for error rates.
