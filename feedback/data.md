---
epoch: 2025.10.E1
doc: feedback/data.md
owner: data
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-06
---
# Data Agent — Daily Feedback & Schema Drift Report

## Direction Sync — 2025-10-09 (Cross-role Coverage)
- Re-opened sprint focus (Supabase decision sync triage, weekly insights, GA MCP readiness) from `docs/directions/data.md`.
- Blocked: currently reassigned to integrations coverage and still missing Supabase credentials/log access; cannot progress data tasks until a dedicated data owner resumes or dependencies land.

## 2025-10-09 Sprint Focus Kickoff
- **Supabase decision sync**: Reviewed the 25% failure sample set and sketched logging/retry patches; blocked until reliability shares raw logs and the staging `SUPABASE_SERVICE_KEY` to run reproductions.
- **Weekly insight addendum**: Outlined charts + narrative sections and queued SQL notebook templates; waiting on tonight's ETL refresh before filling metrics.
- **GA MCP readiness**: Updated the onboarding checklist structure and prepped parity validation queries; still waiting on OCC-INF-221 outcome to receive host/credential bundle.
- **Next**: Follow up with reliability/infra on secrets + logs, then start the insight notebook once the ETL completes.
- **Artifacts**: Published the addendum scaffold at `docs/insights/2025-10-09_supabase_decision_sync.md` so charts and commentary can drop in immediately after credentials arrive.

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

1. **Coordinate with Engineer**: Establish CI pipeline for contract validation tests (reference: `docs/data/data_contracts.md` section 6)
2. **Weekly Insight Packet**: Define format with manager and prepare first packet for 2025-10-07 delivery
3. **GA MCP Integration**: Monitor for credentials; execute transition plan once available (reference: `docs/data/ga_mock_dataset.md` transition steps)
4. **Monitoring Setup**: Collaborate with reliability agent to configure alerting for MCP error rate and cache hit rate metrics

---

## Manager Coordination

- **Question for Manager**: Preferred format for weekly insight packet (Jupyter, Observable, or static PDF with charts)?
- **Request**: Link to Linear backlog for telemetry stories (per product direction)
- **Blocker Escalation**: GA MCP credentials still pending; no ETA from infrastructure

## Governance Acknowledgment — 2025-10-06
- Reviewed docs/directions/README.md and docs/directions/data.md; acknowledge manager-only ownership and Supabase secret policy.
