# Issue Seed — SEO — Tile wiring & thresholds (Start 2025-10-16)

Agent: seo

Definition of Done:
- Finalize rankings/anomalies → tile props mapping; export types
- Implement loaders with sampling/fallback when GA down; add unit tests
- Add Search Console facade (mocked) with contract tests
- Document trend thresholds and KPIs; align with Product
- Wire CSV export for keywords; provide sample
- Evidence bundle: sample responses, screenshots, tests

Acceptance Checks:
- Tile props mapping types compile; tiles render mock data in dev
- Loaders handle GA down with sampling/fallback; tests pass
- CSV export returns expected columns with example file

Allowed paths: app/lib/seo/**, app/routes/api/seo/**, tests/**, docs/specs/**

Evidence:
- Sample JSON, screenshots, unit test logs

Rollback Plan:
- Revert loaders; keep facade mocked behind a flag
