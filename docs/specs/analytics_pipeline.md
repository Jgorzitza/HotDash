# Analytics Migration Apply Plan

Date: 2025-10-18
Owner: analytics agent
Status: Scheduled — dependent on DevOps confirmation (see timeline)

## Scope

Pending Supabase migrations tied to Issue #104:

- `supabase/migrations/20251017_analytics_facts.sql`
- `supabase/migrations/20251017_analytics_facts.rollback.sql`
- `supabase/migrations/20251017_dashboard_views.sql`
- `supabase/migrations/20251017_dashboard_views.rollback.sql`

Feature flags: keep `analytics.pipeline.enabled=false` in production until production window completes.

## Coordination Summary

| Environment | Window (PT)    | Date       | Participants            | Confirmation                              |
| ----------- | -------------- | ---------- | ----------------------- | ----------------------------------------- |
| Staging     | 02:00–02:30 PT | 2025-10-19 | DevOps (@devops-agent)  | ✅ verbal ack 2025-10-18 22:45 PT         |
| Production  | 02:00–02:45 PT | 2025-10-20 | DevOps, Analytics, Data | ✅ penciled; go/no-go 2025-10-19 16:00 PT |

Notes:

- DevOps will post apply logs to `artifacts/devops/2025-10-19/migrations/` (staging) and `artifacts/devops/2025-10-20/migrations/` (production).
- Data team validates Supabase views immediately after staging window; their signoff gates production run.

## Preconditions

1. Latest dashboard tile tests green (`npm run test:ci`).
2. Sampling guard proof refreshed within 24h (`node scripts/sampling-guard-proof.mjs`).
3. Supabase backups verified (automated daily 01:30 PT). DevOps to capture snapshot ID before each window.
4. Feature flag `analytics.pipeline.enabled` remains `false` until post-production verification.
5. Heartbeat logging active during apply (`scripts/policy/with-heartbeat.sh analytics -- <command>`).

## Execution Steps

### 1. Staging Apply (2025-10-19 02:00 PT)

1. Run heartbeat: `scripts/policy/with-heartbeat.sh analytics -- ./scripts/deploy/run-supabase-migrations.sh staging analytics`.
2. Capture pre-apply state via `supabase db dump --schema analytics --file artifacts/analytics/2025-10-19/staging-pre.sql`.
3. Apply migrations in chronological order; tee output to `artifacts/analytics/2025-10-19/staging-apply.log`.
4. Execute `node scripts/sampling-guard-proof.mjs --env staging` → store JSON in same directory.
5. Data team runs validation query bundle (`supabase/sql/verify_analytics_views.sql`) and posts results to feedback.
6. If failures occur, restore from snapshot and log incident per runbook.

### 2. Production Apply (2025-10-20 02:00 PT)

Prereq: staging validation ✅ and manager go/no-go at 2025-10-19 16:00 PT.

1. Heartbeat: `scripts/policy/with-heartbeat.sh analytics -- ./scripts/deploy/run-supabase-migrations.sh production analytics`.
2. Backup: DevOps triggers point-in-time restore marker; record ID in `artifacts/analytics/2025-10-20/production-backup.txt`.
3. Apply migrations; tee output to `artifacts/analytics/2025-10-20/production-apply.log`.
4. Run `npm run test:ci` with production flag to ensure dashboards unaffected; save log under same directory.
5. Sampling guard proof against production; append to `artifacts/analytics/2025-10-20/sampling_guard_proof.json`.
6. Flip `analytics.pipeline.enabled=true` post-verification via feature flag config.

## Verification Checklist

- [ ] Staging apply logs archived, no errors.
- [ ] Validation queries match expected row counts (`dashboard_views_validation.csv`).
- [ ] Production apply logs archived.
- [ ] Sampling guard proof files attached to feedback for staging & production.
- [ ] Feature flag flipped with manager approval recorded.

## Rollback Plan

- Immediate: run rollback scripts matching migration ordering (stored under `supabase/migrations/*rollback.sql`).
- If rollback fails, restore from snapshot IDs noted in preconditions.
- Record incident in `feedback/analytics/<DATE>.md` and notify manager via Issue #104 comment.

## Evidence Links

- Staging timeline & confirmations: feedback/analytics/2025-10-17.md (timeline section).
- Production timeline & confirmations: same feedback file after go/no-go.
- Heartbeat logs: `artifacts/analytics/2025-10-20/heartbeat.ndjson` (to be generated during apply).
- MCP entries: `artifacts/analytics/2025-10-18/mcp/*.jsonl` (startup + doc updates).

## Idea Pool Supabase Activation

To shift the idea pool API from mocked data to live Supabase reads:

1. Confirm Supabase migrations for `idea_pool` tables are applied and data is populated.
2. Set environment variables (server scope only):
   - `IDEA_POOL_SUPABASE_ENABLED=true`
   - `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` with production credentials.
3. Redeploy the server or restart workers so feature flags are re-read.
4. Monitor `artifacts/integration/<DATE>/heartbeat/` from `tests/integration/idea-pool.api.spec.ts` run to confirm Supabase path.
5. Roll back by removing `IDEA_POOL_SUPABASE_ENABLED` or setting to `false` — the API falls back to the mock dataset automatically.
