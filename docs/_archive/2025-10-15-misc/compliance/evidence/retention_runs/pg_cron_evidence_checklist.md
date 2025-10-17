---
epoch: 2025.10.E1
doc: docs/compliance/evidence/retention_runs/pg_cron_evidence_checklist.md
owner: compliance
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-12-31
---

# Supabase pg_cron Evidence — Reliability Handoff Checklist

Reliability should use this checklist when delivering first-run logs for the Supabase retention automations.

## Required Artifacts

- `pg_cron` job definition export (`SELECT * FROM cron.job` filtered to retention jobs) saved as CSV or SQL snippet.
- First successful run log with timestamp and affected table counts (e.g., output from `SELECT * FROM cron.job_run_details`).
- Application-side confirmation (`npm run ops:purge-dashboard-data -- --dry-run`) showing zero unexpected deletions post-cron.
- Supabase audit log excerpt confirming job execution and actor (`supabase_admin`).

## Delivery Instructions

1. Place all files in `docs/compliance/evidence/retention_runs/<date>_pg_cron/` (use UTC date).
2. Include a README summarizing:
   - Run timestamp
   - Operator responsible
   - Data retention window validated
3. Notify compliance via # `#occ-ops` and add link to evidence folder.
4. Compliance to hash evidence files and log values in `feedback/compliance.md`.

## Outstanding Questions

- Confirm whether cron job output includes row-level counts per table; if not, attach manual query results.
- Identify rotation schedule for cron job credentials and record in `docs/deployment/env_matrix.md` if any changes occur.
