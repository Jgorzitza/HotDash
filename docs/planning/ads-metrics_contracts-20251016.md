# Issue Seed — Ads — Metrics + Contracts (Start 2025-10-16)

Agent: ads

Definition of Done:
- Implement roas.ts core + unit tests (blended vs channel)
- Draft budget-optimizer.ts I/O schema; add tests
- Define dashboard tile contract for ads; sync with Engineer
- Adapters skeleton (Meta/Google/TikTok) behind feature flags
- CSV export helper + sample; QA validated
- Telemetry fields for costs/latency; structured logs recorded
- Evidence bundle: sample calcs, tests, curl examples (if any)

Acceptance Checks:
- roas.ts math correct across edge cases; unit tests pass
- Tile contract types exported; integration with dashboard compiles
- CSV export includes expected columns; example file committed

Allowed paths: app/lib/ads/**, app/services/ads/**, tests/**, docs/specs/**

Evidence:
- Test logs, sample CSV, examples

Rollback Plan:
- Revert new files; keep adapters behind flags

