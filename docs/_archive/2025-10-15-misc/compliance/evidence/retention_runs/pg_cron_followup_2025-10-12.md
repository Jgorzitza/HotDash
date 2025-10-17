---
epoch: 2025.10.E1
doc: docs/compliance/evidence/retention_runs/pg_cron_followup_2025-10-12.md
owner: compliance
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-12-31
---

# Supabase pg_cron Evidence Follow-up — Sent 2025-10-12

# message delivered to reliability via `#occ-ops` at 2025-10-12 19:45 UTC, referencing the evidence checklist at `docs/compliance/evidence/retention_runs/pg_cron_evidence_checklist.md`.

```
Hi Reliability,

Thanks for keeping the retention automation rollout moving. We published the evidence handoff checklist (docs/compliance/evidence/retention_runs/pg_cron_evidence_checklist.md) so it’s clear what we need for audit closure.

Could you target delivery by 2025-10-13 22:00 UTC? Artifacts to drop in docs/compliance/evidence/retention_runs/2025-10-13_pg_cron/:
- cron.job export covering the retention tasks
- First run log (cron.job_run_details) showing timestamps + row counts
- Post-run dry-run output from npm run ops:purge-dashboard-data -- --dry-run
- Supabase audit log snippet confirming execution actor

Once ready, please ping #occ-ops with the folder link so we can hash and log same day.

Appreciate the help — let me know if you need anything else.

Casey
```

Status:

- Reminder scheduled for 2025-10-13 18:30 UTC to confirm evidence folder creation.
- Awaiting reliability acknowledgement; log response in `feedback/compliance.md` once received.
