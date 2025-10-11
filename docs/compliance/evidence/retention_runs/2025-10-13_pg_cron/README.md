---
epoch: 2025.10.E1
doc: docs/compliance/evidence/retention_runs/2025-10-13_pg_cron/README.md
owner: compliance
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2025-12-31
---
# Supabase pg_cron Evidence Intake — Delivered

- **Status (2025-10-14 16:00 UTC):** Reliability provided pg_cron evidence bundle (job export, first-run logs, audit snippet, purge dry-run output). Compliance hashed artifacts and logged results in `docs/compliance/evidence/retention_runs/pg_cron_hash_register_2025-10-13.md`.
- **Artifacts:**
  - `cron_job_export.sql`
  - `cron_job_run_details.csv`
  - `audit_log_excerpt.json`
  - `purge_dry_run_2025-10-10T14-20-11Z.log`
  - `hash_register_2025-10-10.csv`
- **Notes:** Evidence collected after running the retention job on Supabase staging with existing credentials (rotation cancelled). Hash register now includes SHA256 for each file per compliance request.
- **Next Steps:** Compliance to verify hashes, append confirmation to `feedback/compliance.md`, and archive alongside DPIA addendum.
