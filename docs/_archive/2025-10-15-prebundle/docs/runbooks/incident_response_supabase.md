---
epoch: 2025.10.E1
doc: docs/runbooks/incident_response_supabase.md
owner: compliance
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-15
---

# Incident Response Runbook — Supabase Decision Logging

## Purpose

Provide a dedicated playbook for outages, integrity failures, or breaches affecting the Supabase-backed decision logging service. Align response with HotDash privacy commitments, GDPR/CCPA timelines, and operator control center audit requirements.

## Scope

- Supabase database storing decision logs and analytics mirrors for Operator Control Center.
- Service key leakage, RLS misconfiguration, or unauthorized access to decision log tables.
- Data loss or replication failures that compromise audit completeness or retention obligations.
- Backup/cron purge automation failures impacting regulatory retention timelines.

---

## Current Exposure Summary — 2025-10-15

- 2025-10-15T19:45Z — Re-verified pg_cron evidence bundle (`docs/compliance/evidence/retention_runs/2025-10-13_pg_cron/`) with SHA256 hashes logged in `pg_cron_hash_register_2025-10-13.md`.
- 2025-10-15T19:00Z — Completed incident tabletop; summary + action items stored under `docs/compliance/evidence/supabase/tabletop_20251015/`.
- 2025-10-10T19:26Z — Analyzer rerun on restored DecisionLog export (`artifacts/logs/supabase_decision_log_export_2025-10-10T14-50-23Z.ndjson`); summary archived at `artifacts/monitoring/supabase-sync-summary-2025-10-10T19-26-50-307Z.json` (0 records, failure rate 0, awaiting Supabase repopulation).
- 2025-10-10T19:27Z — `npx -y tsx scripts/ops/check-dashboard-analytics-parity.ts` succeeded (0% deltas) with staging credentials; parity evidence stored at `artifacts/monitoring/supabase-parity-2025-10-10T19-27-30Z.json`.
- 2025-10-12T09:42Z — Repository scan (`git grep postgresql://`) surfaced only canonical placeholders in direction, runbook, and feedback docs plus `prisma/seeds/README.md`; no live Supabase DSN remains post-sanitization.
- 2025-10-12T10:03Z — Resumed analyzer pipeline; `scripts/ops/analyze-supabase-logs.ts` processed `artifacts/logs/supabase_decision_export_2025-10-10T07-29-39Z.ndjson` (4 records, 25 % timeout rate, decisionId 103 still outlier) confirming exports remain reproducible.
- 2025-10-12T10:05Z — `npm run ops:check-analytics-parity` failed (`Invalid API key`); Supabase parity remains blocked until a valid `SUPABASE_SERVICE_KEY`/`SUPABASE_URL` bundle is loaded locally.
- 2025-10-12T10:12Z — Loaded existing Supabase credentials from vault (`vault/occ/supabase/service_key_staging.env`) and reran `npm run ops:check-analytics-parity`; parity succeeded (0% diff, 0 deltas).
- 2025-10-12T14:49Z — REST export against `decision_sync_events` still returns `PGRST205` (table missing); failure output stored at `artifacts/logs/supabase_decision_sync_events_2025-10-10T14-49-42Z.ndjson`.
- 2025-10-12T14:50Z — `DecisionLog` mirror reachable; export saved to `artifacts/logs/supabase_decision_log_export_2025-10-10T14-50-23Z.ndjson`, analyzer summary `artifacts/monitoring/supabase-sync-summary-2025-10-10T14-50-40Z.json` confirms 0 records (latest probe `artifacts/logs/supabase_decision_log_raw_2025-10-10T15-34-48Z.json` still empty).
- 2025-10-12T15:59Z — Analyzer rerun (legacy export `supabase_decision_export_2025-10-10T07-29-39Z.ndjson`) captured at `artifacts/monitoring/supabase-sync-summary-2025-10-10T15-59-25Z.json`; parity artifact `artifacts/monitoring/supabase-parity-2025-10-10T16-00-12Z.json` holds 0/0 counts pending restored exports.
- 2025-10-12T18:20Z — Latest `/rest/v1/decision_sync_events` attempt still returns `PGRST205`; failure recorded at `artifacts/logs/supabase_decision_sync_events_2025-10-10T18-20-11Z.ndjson`.
- Analyzer/parity refreshed for continuity (`artifacts/monitoring/supabase-sync-summary-2025-10-10T18-20-26Z.json`, `artifacts/monitoring/supabase-parity-2025-10-10T18-20-37Z.json`).
- Follow-ups: Maintain current Supabase credential bundle; rerun analyzer/parity after each NDJSON export and archive evidence in `artifacts/monitoring/` + incident folder. No rotation required.

---

## Response Team & Contacts

- **Compliance Lead (Incident Manager)** — Owns regulatory assessment, evidence capture, and stakeholder comms (`docs/directions/compliance.md`).
- **Reliability On-Call** — Executes key rotation, access lockdown, and restoration tasks (`docs/directions/reliability.md`).
- **Support Liaison** — Coordinates operator/merchant messaging and tracks inbound reports (`docs/directions/support.md`).
- **Deployment Owner** — Confirms secret propagation across environments and rollback strategy (`docs/directions/deployment.md`).

Store contact rotation and escalation order in the shared on-call sheet; update links here when assignments change.

---

## Prerequisites & Reference Docs

- Architecture overview: `docs/compliance/data_inventory.md` (Supabase section) and `docs/runbooks/prisma_staging_postgres.md` (connection handling).
- Retention plan + cron design: `docs/compliance/retention_automation_plan.md`.
- Purge tooling: `scripts/ops/purge-dashboard-data.ts`, npm script `ops:purge-dashboard-data`.
- Evidence locations: `docs/compliance/evidence/retention_runs/`, `docs/compliance/evidence/vendor_dpa_status.md`, vendor contact sheets (pending).
- Secret rotation steps: `docs/runbooks/secret_rotation.md` (when published).

---

## Detection & Triage (T+0 – T+30 minutes)

1. **Trigger Sources**
   - Reliability alerts from Supabase (status page, webhook, or Grafana).
   - Application logs surfacing sync failures (`supabase.decisionSync`, `supabase.analyticsSync`).
   - Operator reports of stale or missing decisions in dashboard tiles.
   - Security tooling (Vault audit, GitHub secret scans) indicating credential exposure.
2. **Immediate Actions**
   - Log incident start in `feedback/compliance.md` with timestamp and short description; ping reliability + support on-call channels.
   - Create evidence folder `docs/compliance/evidence/supabase/incidents/<YYYYMMDD>/` and capture:
     - Supabase status screenshot or JSON export.
     - Log snippets, error IDs, and impacted shop/operator identifiers.
   - Classify severity:
     - **P0** – Confirmed unauthorized access or data exfiltration.
     - **P1** – Service degradation causing audit gaps beyond SLA (>1h) or suspected credential leak.
     - **P2** – Transient sync failure within recovery window, no exposure.
   - If severity P0/P1, page manager + reliability immediately.

---

## Containment (T+30 – T+90 minutes)

1. **Secure Credentials**
   - Reliability rotates Supabase service key + anon key; update GitHub `SUPABASE_SERVICE_KEY` secret and workstation `.env` where stored.
   - Regenerate JWT secret if compromised; document rotation evidence in incident folder.
2. **Restrict Access**
   - Enable read-only mode in decision logging microservice (toggle `FEATURE_DECISION_LOG_WRITE=0`) to halt new writes until integrity confirmed.
   - Apply temporary RLS tightening to permit compliance-only access for forensics.
3. **Snapshot State**
   - Export affected tables (`decision_log`, `facts`, retention audit tables) using `supabase db export` or `pg_dump` for offline review.
4. **Preserve Logs**
   - Archive Supabase audit trails and application logs to `docs/compliance/evidence/supabase/incidents/<YYYYMMDD>/logs/`.

---

## Investigation & Impact Analysis (T+90 minutes – T+6 hours)

1. **Data Integrity Review**
   - Run differential queries comparing Prisma primary DB and Supabase mirror to identify missing or altered rows.
   - Validate purge cron job evidence to ensure retention windows were honored.
2. **Access Trace**
   - Review Supabase auth logs, `pg_stat_activity`, and storage access to pinpoint unauthorized actors.
   - Check Vault/GitHub audit logs for credential downloads.
3. **Scope Assessment**
   - Enumerate impacted merchants/operators and data categories (PII, decision metadata).
   - Determine regulatory thresholds for breach notification.
4. **Root Cause Draft**
   - Document hypotheses, affected components, and preliminary remediation plan in `analysis.md` within incident folder.

---

## Communication (T+6 – T+24 hours)

1. **Internal**
   - Hourly updates in incident log; include containment status and outstanding actions.
   - Brief manager + leadership with summary, severity, and ETA to recovery.
2. **External**
   - If data exposure confirmed, prepare merchant/operator notice referencing impacted data, timeline, and recommended actions.
   - Coordinate with marketing/comms for messaging; compliance retains approval authority.
3. **Vendor Coordination**
   - File ticket with Supabase support requesting incident details, recovery ETA, and security assurances.
   - Capture vendor correspondence and attach to evidence folder.
4. **Regulatory**
   - Evaluate GDPR/CCPA reporting obligations; if triggered, file within mandated windows and archive submission receipts.

---

## Recovery (T+24 – T+48 hours)

1. Restore service writes after:
   - Integrity verification queries pass.
   - Rotated credentials deployed across environments.
   - Retention cron jobs validated to run post-incident (trigger manual run and store log in `docs/compliance/evidence/retention_runs/`).
2. Re-run purge script (`npm run ops:purge-dashboard-data`) in dry-run mode first; archive audit output.
3. Execute regression tests (Vitest, Playwright, Supabase integration smoke) with sanitized data to confirm behavior.
4. Remove temporary restrictions and document go-forward monitoring plan.

---

## Post-Incident (Within 5 business days)

1. Produce postmortem in incident evidence folder summarizing timeline, root cause, remediation, and lessons learned.
2. Update relevant artifacts:
   - Data inventory + retention plan for any schema or process changes.
   - Vendor DPA tracker with Supabase commitments or gaps.
   - Purge script documentation/testing if defects found.
3. Schedule tabletop exercise follow-up if response deviated from expectations.
4. Track remediation tasks in `feedback/compliance.md` until closure.

---

## Preparedness Checklist (Weekly)

- [ ] Confirm Supabase cron jobs succeeded; file logs in `docs/compliance/evidence/retention_runs/`.
- [ ] Validate backups (`pg_dump`, object storage) and restore samples quarterly.
- [ ] Review Supabase role/RLS configuration for least privilege.
- [ ] Verify service key rotation cadence (<90 days) with evidence.
- [ ] Ensure purge script dry-run test harness executed and results stored.

Escalate any unchecked item to manager with remediation ETA.

## Verification - 2025-10-11

- Tabletop drill: docs/compliance/evidence/tabletop_supabase_2025-10-11.md
- Retention hash register: docs/compliance/evidence/pg_cron_hash_register_2025-10-11.md
