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
   - Log incident start in `feedback/compliance.md` with timestamp and short description.
   - Open evidence folder `docs/compliance/evidence/INCIDENT_SUPABASE_<date>/` and capture:
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
   - Export affected tables (`decision_logs`, `analytics_snapshots`, cron audit tables) using `supabase db export` or `pg_dump` for offline review.
4. **Preserve Logs**
   - Archive Supabase audit trails and application logs to `docs/compliance/evidence/INCIDENT_supabase_<date>/logs/`.

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
