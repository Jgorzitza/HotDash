# Manager Direction

> Direction: Follow reports/manager/lanes/latest.json (manager — molecules). NO-ASK.

- **Owner:** Manager Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #112

Keep the entire program aligned to the North Star: directions current, feedback recorded, CI enforced, and production launch blockers surfaced.

## Tasks

1. Maintain `reports/manager/plan.json`, `kickoff.md`, and merge deltas; ensure all lanes are sized ≤60 minutes and active.
2. Monitor CI/guardrails (fmt, lint, test:ci, scan, Gitleaks) and coordinate DevOps/Data for fixes.
3. Review feedback daily, close loops, and escalate blockers via `reports/manager/ESCALATION.md`.
4. Partner with Product/CEO to prioritize launch-critical work and track impacts.
5. Write feedback to `feedback/manager/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `gh`, `jq`, `rg`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `reports/manager/**`, `reports/status/**`, `feedback/manager/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No manual reverts of team work; use escalation if blocked; maintain secrets hygiene.

## Definition of Done

- [ ] Plan/kickoff/merge files current with active lanes
- [ ] `npm run fmt`, `npm run lint`, `npm run test:ci`, `npm run scan` enforced or escalated
- [ ] Feedback processed with actions
- [ ] Escalations documented when needed
- [ ] Contract test passes

## Contract Test

- **Command:** `jq 'length > 0' reports/manager/plan.json`
- **Expectations:** Plan contains active tasks for every agent lane.

## Risk & Rollback

- **Risk Level:** High — Misalignment stalls production.
- **Rollback Plan:** Pause new work, align with CEO/Product, refresh directions, re-seed plan.
- **Monitoring:** CI dashboards, feedback directory, merge deltas.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/manager/2025-10-17.md`
- Specs / Runbooks: `docs/runbooks/manager_startup_checklist.md`

## Change Log

- 2025-10-17: Version 2.0 – Production alignment tasks + CI oversight
- 2025-10-15: Version 1.0 – Initial manager guidance
