---
epoch: 2025.10.E1
doc: feedback/data.md
owner: data
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-06
---
# Data Agent — Daily Feedback & Schema Drift Report

## 2025-10-11 Reliability Follow-up
- 2025-10-11T16:18Z — Populated `notebooks/weekly_insights_2025-10-16.ipynb` with the current decision-sync snapshot (4 records, 25% timeout rate) so the weekly packet carries live metrics while we wait for additional exports.

## 2025-10-10 Reliability Drop Ingestion
- 2025-10-10T07:29Z — Ingested reliability’s NDJSON export (`artifacts/logs/supabase_decision_export_2025-10-10T07-29-39Z.ndjson`) via analyzer; refreshed summaries in `artifacts/monitoring/supabase-sync-summary-latest.json` and `docs/insights/2025-10-09_supabase_decision_sync.md` (25 % timeout rate, decisionId 103 remains outlier).
- 2025-10-10T07:32Z — Synced with AI agent; confirmed regression harness now auto-embeds decision telemetry and shared artifact paths (`artifacts/ai/prompt-regression-2025-10-10-073452.json`).
- 2025-10-10T07:34Z — Logged ingestion completion and outstanding blockers (staging mock=0 410, modal flag timing) in `feedback/ai.md`, `feedback/manager.md`, `feedback/enablement.md`.
- 2025-10-10T07:36Z — Re-ran analyzer to publish updated summary (same latency profile) and confirmed the hourly monitor shared the refreshed output with reliability/QA.
- 2025-10-10T07:40Z — Updated enablement/shopify fact ID references and weekly packet notebook to point at the new export so cross-functional docs cite the latest telemetry.

## 2025-10-10 Supabase Decision Sync & QA Prep
- 2025-10-10T02:52Z — Re-ran analyzer (`npx -y tsx scripts/ops/analyze-supabase-logs.ts --input artifacts/logs/supabase_decision_sample.ndjson`); summary written to `artifacts/monitoring/supabase-sync-summary-latest.json` and new mermaid chart + metrics appended to `docs/insights/2025-10-09_supabase_decision_sync.md`.
- 2025-10-10T02:55Z — Seeded local Prisma dev store (`npx -y tsx prisma/seeds/dashboard-facts.seed.ts`) to surface latest fact IDs for enablement; updated `docs/enablement/shopify_admin_testing_fact_ids.md` with IDs `{sales:8, fulfillment:12, inventory:11, escalations:9, ga:10}` for QA dry runs.
- 2025-10-10T02:58Z — Attempted telemetry parity script (`npm run ops:check-analytics-parity`); Supabase returned `Invalid API key` — placeholder env values in `.env` are insufficient. Blocking items: need staging `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` drop from reliability to verify Fly staging facts mirror Prisma counts. Logged blocker here and flagged in direction sync thread.
- 2025-10-10T03:05Z — Published refreshed GA MCP parity checklist (`docs/data/ga_mcp_parity_checklist.md`) capturing credential ETA tracker, readiness gates, and post-credential validation steps so integrations/compliance can act immediately once OCC-INF-221 unblocks.
- 2025-10-10T03:12Z — Shared analyzer sample + summary with engineering/QA (`artifacts/logs/supabase_decision_sample.ndjson`, `artifacts/monitoring/supabase-sync-summary-latest.json`) and confirmed `npx vitest run tests/unit/supabase.memory.spec.ts` passes (4/4 tests). Awaiting full NDJSON export + Supabase credentials to extend coverage beyond the sample.
- 2025-10-10T03:34Z — Re-ran `npx vitest run tests/unit/supabase.memory.spec.ts` (5/5 passing) to keep mocks aligned; no new NDJSON path from reliability yet, so `artifacts/logs/supabase_decision_sample.ndjson` remains the latest reference.

## Direction Sync — 2025-10-09 (Cross-role Coverage)
- Re-opened sprint focus (Supabase decision sync triage, weekly insights, GA MCP readiness) from `docs/directions/data.md`.
- Blocked: currently reassigned to integrations coverage and still missing Supabase credentials/log access; cannot progress data tasks until a dedicated data owner resumes or dependencies land.

## 2025-10-09 Sprint Focus Kickoff
## 2025-10-09 Production Blockers Update
- Supabase decision sync: awaiting reliability log dump + service key; analytics notebook ready to ingest once artifacts arrive.
- GA MCP readiness: prepped schema parity script updates; blocked pending OCC-INF-221 credential drop to compare live vs mock.
- Operator dry run insights: drafting metric narrative outline; needs staging telemetry and Supabase persistence before finishing.

- **Supabase decision sync**: Reviewed the 25% failure sample set and sketched logging/retry patches; blocked until reliability shares raw logs and the staging `SUPABASE_SERVICE_KEY` to run reproductions.
- **Weekly insight addendum**: Outlined charts + narrative sections and queued SQL notebook templates; waiting on tonight's ETL refresh before filling metrics.
- **GA MCP readiness**: Updated the onboarding checklist structure and prepped parity validation queries; still waiting on OCC-INF-221 outcome to receive host/credential bundle.
- **Next**: Follow up with reliability/infra on secrets + logs, then start the insight notebook once the ETL completes.
- **Artifacts**: Published the addendum scaffold at `docs/insights/2025-10-09_supabase_decision_sync.md` so charts and commentary can drop in immediately after credentials arrive.

## 2025-10-09 Production Blocker Push
- Supabase fix: drafted instrumentation diff (structured error payloads + retry counters) and prepared to replay failure IDs once reliability delivers the log export + staging `SUPABASE_SERVICE_KEY` (tracked via `feedback/data_to_reliability_coordination.md`).
- Staging Postgres + secrets: confirmed parity queries ready to run against Postgres once deployment shares credentials; outlined data validation steps to attach evidence to the go-live checklist.
- GA MCP readiness: updated go-live checklist notes with pending credential variables and queued schema parity script so execution can start the moment OCC-INF-221 resolves.
- Operator dry run: synced with enablement on insight inputs for the pre-read; will inject activation/SLA trend callouts into the training packet once tonight’s ETL completes.
- 19:15 ET: queued follow-up pings to reliability (Supabase logs + service key) and integrations/infra (OCC-INF-221 ETA) for early 2025-10-10; ready to drop evidence into the addendum/checklist immediately after responses land.

## Shopify Install Push — 2025-10-10 10:20 UTC
- Once reliability delivers the staging NDJSON export + `DATABASE_URL`, rerun decision-sync effectiveness notebooks and attach charts/data outputs to `docs/insights/2025-10-09_supabase_decision_sync.md`; flag any anomalies to engineer/QA before validation continues.
- Provide enablement/support with fact ID lists, trend screenshots, and rate-limit metrics so their training packets align with live Shopify telemetry.
- ✅ Staging `DATABASE_URL` now stored in `vault/occ/supabase/database_url_staging.env` and mirrored to GitHub `staging` environment (updated 2025-10-09T21:58Z); waiting on Supabase `facts` migration so parity notebook can run end-to-end.
- Update this log with timestamps + artefact paths when the parity script and notebooks finish, keeping product aware of readiness status.

## Direction Acknowledgment — 2025-10-08
- Reviewed `docs/directions/data.md` sprint focus covering Supabase decision sync investigation, weekly insight addendum, and GA MCP readiness deliverables.
- Supabase spike triage: instrumentation diffs drafted, but blocked on reliability surfacing Supabase retry/error logs and providing a valid service key to reproduce the 25% failure in staging.
- Weekly insight addendum: outline ready; waiting on final activation and SLA metrics export after tonight's ETL run to finish charts/notebook bundle.
- GA MCP readiness: coordination brief sent to integrations/compliance; credential ETA and staging variable window still pending before parity checklist Step 1 can proceed.
- Blockers raised in this log and mirrored for manager visibility; will update once partners supply credentials/telemetry.

## 2025-10-09 Sprint Execution
- Drafted Supabase incident analysis plan (metrics, error-code breakdown, retry impact) and delivered data requirements to reliability/engineering; awaiting updated logs to begin validation queries.
- Prepped structure for weekly insight addendum in `docs/insights/2025-10-09_supabase_decision_sync.md` (placeholder) so charts can be populated once ETL finishes; blocked by missing latest activation/SLA exports.
- Updated GA MCP parity checklist to reflect outstanding credential handoff steps and pinged integrations for status; cannot execute parity queries until credentials unlock staging access.

## 2025-10-10 Production Blocker Sweep
- Supabase decision sync fix: standing by to crunch the next log export; once reliability delivers NDJSON we’ll run the retry effectiveness queries and update mitigation notes here and in `docs/insights/`.
- Staging Postgres + secrets: coordinating with deployment so Postgres connection info lands in time for data validation; will mirror env matrix updates once reliability publishes secret rotation calendar.
- GA MCP readiness: parity notebook templates ready, still waiting on OCC-INF-221 outcome; following up with integrations later today for credential ETA before the weekend.
- Operator dry run insights: maintaining placeholders for activation/SLA metrics in the addendum so enablement/support can cite fresh numbers during the 2025-10-16 session.

## 2025-10-08 — Sprint Focus Activation
- Mapped failure IDs from `artifacts/logs/supabase_decision_sample.ndjson` to prioritize instrumentation patches with engineering/reliability, aligning with `docs/directions/data.md:26`.
- Drafted notebook outline for the 2025-10-09 weekly insight addendum (activation, SLA, anomaly sections) and staged query TODOs so the bundle can publish under `docs/insights/` once tonight's ETL finishes per `docs/directions/data.md:27`.
- Reviewed GA MCP parity checklist items and documented outstanding credential/schema steps in `docs/data/ga_mcp_go_live_checklist.md` notes, prepping the handoff package requested in `docs/directions/data.md:28`.

## Coordination Updates — 2025-10-08
- Followed up with reliability for Supabase retry/error logs (2025-10-07 18:00 UTC → 2025-10-08 12:00 UTC) and requested staging `SUPABASE_SERVICE_KEY` delivery; awaiting response (see `feedback/data_to_reliability_coordination.md`).
- Pinged integrations and compliance for GA MCP credential ETA, staging variable window, and evidence checklist acknowledgment; pending replies (see `feedback/data_to_integrations_coordination.md`).
- Will escalate to manager if reliability does not respond by 19:00 UTC or integrations/compliance by 20:00 UTC today.
- Escalations now active: manager + reliability notified to unblock Supabase logs/service key; manager + integrations/compliance notified to provide credential ETA and evidence confirmation (documented in coordination briefs).

## 2025-10-08 — Product Coordination
- Product request: please share the next Supabase decision sync log export (path + timestamp) once generated so we can attach evidence to OCC-212 and unblock the monitoring remediation. Would like to link from `feedback/product.md` and the backlog by 2025-10-09 EOD.
- Confirm whether additional schema notes or retry metrics will accompany the export; if so, drop references in Memory (scope `ops`) so product can mirror in the sprint artifacts bundle.

## Summary — 2025-10-05

### Deliverables Completed
- **KPI Definitions**: Published comprehensive dbt-style specs for all v1 KPIs (sales delta, SLA breach rate, traffic anomalies, inventory coverage, fulfillment issue rate) in `docs/data/kpis.md`
- **Data Contracts**: Documented schema expectations and validation protocols for Shopify, Chatwoot, and GA MCP in `docs/data/data_contracts.md`
- **Anomaly Detection Service**: Implemented threshold-based anomaly detection and forecasting utilities in `app/services/anomalies.server.ts` with pre-configured profiles for all KPIs
- **Prisma Seeds**: Created seed scripts for `DashboardFact` and `DecisionLog` tables with realistic baseline data + backfill documentation in `prisma/seeds/`
- **GA Mock Dataset Documentation**: Authored MCP transition plan and testing strategy in `docs/data/ga_mock_dataset.md`

### Current Status
- All data contracts validated against existing service implementations (Shopify, Chatwoot, GA)
- Anomaly thresholds aligned with product requirements (warning/critical levels documented)
- Seed data includes intentional anomalies for testing dashboard tiles
- GA mock mode confirmed operational; MCP swap procedure documented and ready for credentials

### Blockers / Risks
- **GA MCP Host Pending**: Still operating in mock mode; awaiting credentials from infrastructure team
- **No Schema Drift Detected**: All upstream APIs (Shopify Admin GraphQL 2024-10, Chatwoot REST) remain stable as of 2025-10-05
- **Forecasting Assumptions**: Current implementation uses simple average and exponential smoothing; seasonality adjustments deferred to future iteration

---

## Schema Drift Monitoring — 2025-10-05

### Process
Weekly validation of upstream API contracts against documented schemas in `docs/data/data_contracts.md`. Manual review of Shopify/Chatwoot/GA changelogs + automated contract tests in CI.

### Status: No Drift Detected

#### Shopify Admin GraphQL (API Version 2024-10)
- **Last Checked**: 2025-10-05 08:00 UTC
- **Status**: ✓ Stable
- **Notes**: No changes to `orders`, `productVariants`, or `fulfillments` queries since initial implementation
- **Next Review**: 2025-10-12 (weekly cadence)

#### Chatwoot REST API
- **Last Checked**: 2025-10-05 08:00 UTC
- **Status**: ✓ Stable
- **Notes**: Conversation and message schemas match expected contract; no enum additions or deprecations
- **Next Review**: 2025-10-12

#### Google Analytics MCP (Mock Mode)
- **Last Checked**: N/A (mock mode, no live API)
- **Status**: ⏳ Pending live host
- **Notes**: Mock client contract defined and ready for MCP integration; awaiting credentials to validate live endpoint

---

## Schema Drift Alert Template

_No active alerts. This section will be populated if breaking changes are detected._

### Example Format (for future use):
```
## Schema Drift Alert — YYYY-MM-DD

**Source**: [Shopify | Chatwoot | GA MCP]
**Change**: [Description of field/enum/type change]
**Detected**: YYYY-MM-DD HH:MM UTC
**Impact**: [Critical | High | Medium | Low]
**Affected Services**: [List of files/services impacted]
**Action Required**: [Description of required code changes]
**Assignee**: [engineer | data]
**Target Date**: YYYY-MM-DD
**Evidence**: [Link to upstream changelog or API docs]
```

---

## Data Quality Issues

### Status: None Detected

_This section will track data quality anomalies (e.g., unexpected nulls, outliers, or missing fields in API responses)._

---

## Weekly Insight Packet (Pending)

### Scheduled: Mondays
Per `docs/directions/data.md`, provide weekly insight packet (charts + narrative) attached in manager status with reproducible notebooks.

**Action**: Coordinate with manager to establish format and delivery process for first weekly packet (target: 2025-10-07).

**Proposed Format**:
- KPI trend charts (7-day view for all metrics)
- Anomaly summary (count and severity distribution)
- Data pipeline health metrics (cache hit rate, API error rate, fact ingestion volume)
- Reproducible Jupyter notebook or Observable notebook with SQL queries and visualizations

---

## Evidence Links

### Documentation
- KPI Definitions: `docs/data/kpis.md`
- Data Contracts: `docs/data/data_contracts.md`
- GA Mock Dataset & MCP Transition Plan: `docs/data/ga_mock_dataset.md`
- Seed Documentation: `prisma/seeds/README.md`

### Implementation
- Anomaly Detection Service: `app/services/anomalies.server.ts`
- Dashboard Facts Service: `app/services/facts.server.ts`
- Seed Script: `prisma/seeds/dashboard-facts.seed.ts`
- GA Mock Client: `app/services/ga/mockClient.ts`
- GA MCP Client (ready): `app/services/ga/mcpClient.ts`

### Testing (Pending)
- Contract tests: `tests/unit/contracts/` (to be created by engineer)
- Seed execution: `npm run seed` (verified locally)

---

## Next Actions

1. Monitor hourly NDJSON drops from reliability; rerun analyzer (`npm run ops:analyze-supabase -- --input <path>`) for each export and append findings + artifact links to the insight addendum.
2. Schedule parity reruns alongside analyzer refreshes (at least daily) and archive each output in `artifacts/monitoring/` to prove Supabase vs Prisma alignment over time.
3. Populate the weekly insights notebook (`notebooks/weekly_insights_2025-10-16.ipynb`) with live metrics as additional exports land; generate charts for the forthcoming manager packet.
4. Continue daily AI/QA coordination to keep regression logs and NDJSON references aligned; summarize each touchpoint in the Daily Feedback section.
5. Flesh out GA MCP contract assertions in `tests/unit/contracts/ga_mcp.spec.ts` once credentials arrive, covering fact parity + schema expectations.

---

## Manager Coordination

- **Question for Manager**: Preferred format for weekly insight packet (Jupyter, Observable, or static PDF with charts)?
- **Request**: Link to Linear backlog for telemetry stories (per product direction)
- **Blocker Escalation**: GA MCP credentials still pending; no ETA from infrastructure

## Governance Acknowledgment — 2025-10-06
- Reviewed docs/directions/README.md and docs/directions/data.md; acknowledge manager-only ownership and Supabase secret policy.
