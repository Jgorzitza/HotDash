# Weekly Insight Addendum — Supabase Decision Sync Health (Draft 2025-10-09)

## Objectives
- Quantify 25% sync failure spike (volume, error families, affected scopes).
- Track SLA impact (dashboard tile freshness, operator escalations).
- Surface remediation status (instrumentation patches, retry cadence).

## Data Sources
- `DecisionLog` table (Supabase) — requires staging `SUPABASE_SERVICE_KEY`.
- Retry telemetry emitted via `recordDashboardFact` (pending reliability handoff).
- ETL snapshot: `artifacts/logs/decision_sync_failures_2025-10-08.ndjson`.

## Draft Queries (to execute once credentials land)
1. Failure rate by hour (last 72h) with error codes.
2. Average retry attempts per failure vs success baseline.
3. Tile freshness delta vs SLA threshold (minutes over target).
4. Escalation tag co-occurrence to measure operator impact.

## Narrative Outline
- **Headline:** Failure rate normalized <target?> or remains elevated.
- **Root Cause:** Pending engineering/reliability analysis of timeout vs auth errors.
- **Mitigations:** Retries, Supabase support ticket, logging enhancements.
- **Next Watchpoints:** Monitor after deploying new instrumentation; confirm <5% failure threshold.

## Action Items
- [ ] Obtain Supabase credentials from reliability (blocking queries 1-4).
- [ ] Refresh ETL dataset post-fix to compare failure rates.
- [ ] Update addendum with charts + commentary ahead of 2025-10-10 standup.
