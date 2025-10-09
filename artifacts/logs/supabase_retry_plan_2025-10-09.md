# Supabase Decision Sync Triage Checklist — 2025-10-09 Draft

## Objectives
- Capture failure signatures (timeout vs auth vs rate limit).
- Verify retry/backoff configuration in `packages/memory/supabase.ts`.
- Validate parity script once `facts` table seeded in staging.

## Immediate Tasks
- [ ] Add structured logging for `status`, `duration_ms`, and `retry_count` (PR #TBD).
- [ ] Pair with data to replay sample payloads via `scripts/ops/check-dashboard-analytics-parity.ts`.
- [ ] Coordinate with reliability on Supabase support escalation if failure rate >10% after patch.

## Blockers
- Awaiting staging `SUPABASE_SERVICE_KEY` (reliability).
- Need `facts` table migration applied in staging.

## Notes
- Log updates staged locally; ready to open PR once credentials available for validation.
