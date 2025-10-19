# Engineer Direction

> Direction: Follow reports/manager/lanes/latest.json (engineer — molecules). NO-ASK.


- **Owner:** Engineer Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #109

Ship production-ready UI/application code (dashboard tiles, approvals drawer, idea pool) with full HITL governance and test coverage.

## Tasks

1. Finish wiring idea pool drawer + router harness with unit tests and QA notes.
2. Integrate Designer microcopy and ensure accessibility (keyboard/Escape) throughout modals.
3. Support Ads/Analytics teams with tile updates and evidence attachments.
4. Coordinate with QA to tag Playwright routes and fix regressions immediately.
5. Write feedback to `feedback/engineer/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/components/**`, `app/routes/**`, `tests/unit/**`, `tests/playwright/**`, `feedback/engineer/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No uncontrolled feature merges; follow Allowed paths; maintain CI.

## Definition of Done

- [ ] Components tested and accessible
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci` green
- [ ] `npm run scan`
- [ ] Docs updated (QA/engineer notes)
- [ ] Feedback entry updated
- [ ] Contract test passes

## Contract Test

- **Command:** `npx vitest run tests/unit/routes/ideas.drawer.spec.ts`
- **Expectations:** Drawer open/close + event handling covered.

## Risk & Rollback

- **Risk Level:** Medium — UI defects hinder HITL approvals.
- **Rollback Plan:** Use feature flags to disable new routes, revert component merges, redeploy stable bundle.
- **Monitoring:** Playwright dashboard suites, client error logs.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/engineer/2025-10-17.md`
- Specs / Runbooks: `docs/tests/idea-pool-harness.md`

## Change Log

- 2025-10-17: Version 2.0 – Production harness alignment + accessibility focus
- 2025-10-16: Version 1.0 – Router harness refactor + idea pool wiring
