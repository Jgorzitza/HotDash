# Issue Seed — QA — Turn reds green (Start 2025-10-16)

Agent: qa

Definition of Done:
- Convert failing unblocker tests to passing as corresponding PRs land
- /validate gating verified: Approve disabled until OK; errors surfaced
- Dashboard tiles wired to loaders; fallback states and P95 < 500ms checks implemented
- Data migration apply/rollback harness added; RLS verified
- Evidence bundle: Playwright traces, coverage reports, CI outputs

Acceptance Checks:
- Approvals UI tests pass and reflect validation behavior
- Integration/API contract tests aligned with current clients/middleware
- Coverage reports captured and meet thresholds (>80% new code)

Allowed paths: tests/**, docs/specs/testing/**

Evidence:
- Test run logs, traces/screenshots, coverage summary

Rollback Plan:
- Revert test changes if upstream PRs change scope; keep skip annotations documented

