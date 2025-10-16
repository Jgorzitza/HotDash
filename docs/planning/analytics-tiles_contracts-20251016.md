# Issue Seed — Analytics — Tighten contracts & wire tiles (Start 2025-10-16)

Agent: analytics

Definition of Done:
- Finalize TileData contract; export types for useLoaderData
- Route typing pass; explicit loader return types; remove `any`
- Wire /api/dashboard/tiles to dashboard tiles; add fallback mocks guard
- GA health endpoint exposes status + sampling/quota flags
- Caching TTL tests added/adjusted; trend smoothing hooks noted
- Evidence bundle: timings, sample responses, screenshots

Acceptance Checks:
- Loader types compile; routes import typed contracts only
- Health endpoint returns GA status fields; automated test exists
- P95 tile load < 3s with caching enabled (local acceptable with fixtures)

Allowed paths: app/lib/analytics/**, app/routes/**, tests/**, docs/specs/**

Evidence:
- Route screenshots, sample JSON responses, test logs

Rollback Plan:
- Revert contracts; keep fallback mocks enabled via feature flag

