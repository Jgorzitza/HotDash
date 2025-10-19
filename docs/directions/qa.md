# QA Direction

- **Owner:** QA Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #114

Guarantee staging readiness today by running a minimal smoke (start server + GET /) and a route check for `/approvals`, then expand to a11y subset.

## Tasks

1. Follow docs/manager/EXECUTION_ROADMAP.md (QA — Roadmap). Autonomy Mode applies. Log evidence in `feedback/qa/<YYYY-MM-DD>.md`.

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes (env, CI, flaky test), post a brief blocker in the Issue and continue with the next task in the fallback queue below. Do not idle.
- Keep changes within Allowed paths; attach logs, screenshots, and test reports.

## Fallback Work Queue (aligned to NORTH_STAR)

1. Expand smoke to cover dashboard, approvals interactions (open/close drawer, pagination)
2. Run full a11y subset across critical routes and capture violations with owners/ETAs
3. Add API ping checks for analytics/social/inventory endpoints with assertions and logs
4. Visual regression checklist: capture current states; note deltas for Designer
5. Error boundary coverage tests (simulate loader/action failures)
6. Keyboard navigation and focus trap checks for drawer/modals
7. Performance smoke: record server P95s for key routes; set thresholds
8. Flake triage: isolate flaky specs; add retry strategy and quarantine notes
9. Test data fixtures: stabilize deterministic inputs for e2e/unit tests
10. Evidence bundling: standardize artifact locations and SHA manifests

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `scripts/qa/**`, `tests/playwright/**`, `tests/e2e/**`, `docs/tests/**`, `feedback/qa/2025-10-18.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No disabling tests without documented blocker; escalate failures immediately.

## Definition of Done

- [ ] QA scope packet published
- [ ] Playwright + accessibility suites executed with logs
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Feedback entry updated with outcomes
- [ ] Contract test passes

## Contract Test

- **Command:** `npm run test:a11y`; and smoke script `scripts/qa/smoke.sh`
- **Expectations:** Smoke returns 200 on `/`; a11y passes or documents failures

## Risk & Rollback

- **Risk Level:** High — Undetected regressions ship to production.
- **Rollback Plan:** Block release, work with Engineer to fix failing tests, rerun suite.
- **Monitoring:** Playwright reports, QA packet updates, approvals backlog.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/qa/2025-10-18.md`
- Specs / Runbooks: `docs/tests/qa_scope_packet.md`

## Change Log

- 2025-10-18: Version 2.1 – Launch-day smoke focus
- 2025-10-17: Version 2.0 – Production QA scope + reporting
- 2025-10-16: Version 1.0 – Smoke/axe checklists
