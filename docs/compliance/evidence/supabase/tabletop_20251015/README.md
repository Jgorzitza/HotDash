---
epoch: 2025.10.E1
doc: docs/compliance/evidence/supabase/tabletop_20251015/README.md
owner: compliance
last_reviewed: 2025-10-15
doc_hash: TBD
expires: 2026-01-15
---
# Supabase Incident Tabletop — 2025-10-15 18:00–19:00 UTC

## Summary
- **Scenario:** Supabase decision logging credential leak leading to unauthorized access and stalled retention jobs.
- **Facilitator:** Compliance (incident manager).
- **Note-taker:** Support liaison.
- **Outcome:** All response stages walked end-to-end; two documentation updates and one automation task captured as follow-ups.

## Key Observations
- Detection signals (Grafana alert + audit anomaly) surfaced in under 6 minutes; reliability confirmed alert routing and log access.
- Containment plan validated: credential rotation + RLS lockdown steps matched runbook; engineering highlighted need for faster parity check script.
- Communication drafts prepared for operators and marketing; legal confirmed thresholds for notification remain unmet unless data exfiltration proven.
- Recovery drill confirmed pg_cron evidence placement and parity verification steps; compliance re-validated hash register entries at 19:45 UTC.

## Evidence Links
- Agenda & participant details: `docs/compliance/evidence/supabase/tabletop_20251015/agenda_participants.md`
- Action item register: `docs/compliance/evidence/supabase/tabletop_20251015/action_items.md`
- Mock outputs (audit log excerpt + parity check summary): `docs/compliance/evidence/supabase/tabletop_20251015/mock_outputs.md`
- Incident response runbook updates: `docs/runbooks/incident_response_supabase.md`
- Hash verification log: `docs/compliance/evidence/retention_runs/pg_cron_hash_register_2025-10-13.md`

## Next Steps
1. Reliability to deliver refreshed pg_cron bundle with run logs by 2025-10-16 17:00 UTC.
2. Engineering to script parity check automation enhancements by 2025-10-18.
3. Compliance to share tabletop summary with manager and archive sign-off in `feedback/manager.md`.
