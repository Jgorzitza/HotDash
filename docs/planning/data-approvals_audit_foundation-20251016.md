# Issue Seed — Data — Approvals/Audit Foundation (Start 2025-10-16)

Agent: data

Definition of Done:
- Reversible migrations for approvals/audit applied with matching rollback scripts
- Seed 5 approvals rows (mixed states) for demo; provenance documented
- RPCs implemented: get_approvals_list, get_approvals_queue_tile
- RLS policies authored and tested (least-privilege); tests included
- EXPLAIN ANALYZE shows P95 <100ms for key queries; timing notes attached
- Evidence bundle: timings, EXPLAIN output, rollback plan

Acceptance Checks:
- `up` and `down` migrations run cleanly
- RPCs return expected shapes with filters/paging
- RLS denies unauthorized access; service_role full access verified
- Index coverage supports query plans; P95 <100ms

Allowed paths: supabase/migrations/**, supabase/functions/**, docs/specs/**, tests/**

Evidence:
- SQL logs, `EXPLAIN ANALYZE` screenshots/text, migration timestamps

Rollback Plan:
- Apply `down` scripts in reverse order; restore seed data from snapshot

