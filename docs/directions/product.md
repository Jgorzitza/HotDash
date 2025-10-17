# Product Direction

- **Owner:** Product Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective
Current Issue: #113


Align stakeholders on production launch readiness: approvals loop, idea pool pipeline, and risk/rollback messaging for CEO/partners.

## Tasks



1. Maintain launch checklist (`docs/specs/dashboard_launch_checklist.md`) with current blockers/owners.
2. Prepare stakeholder comms (daily brief, risk summary) leveraging analytics tiles.
3. Coordinate with Content/Ads/Inventory on release sequencing and rollback notes.
4. Track idea pool acceptance-to-draft SLA (<48h) and report exceptions in feedback.
5. Write feedback to `feedback/product/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `docs/specs/dashboard_launch_checklist.md`, `docs/specs/stakeholder_comms.md`, `feedback/product/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** Keep checklist factual; align with CI status; no scope drift without CEO sign-off.

## Definition of Done

- [ ] Launch checklist current with blocker statuses
- [ ] Stakeholder comms updated with latest metrics
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Docs/runbooks updated
- [ ] Feedback entry updated
- [ ] Contract test passes

## Contract Test

- **Command:** `rg 'Blocker' docs/specs/dashboard_launch_checklist.md`
- **Expectations:** Checklist enumerates blockers with owners/dates.

## Risk & Rollback

- **Risk Level:** Medium — Poor communication can stall launch.
- **Rollback Plan:** Freeze launches, update checklist, realign with CEO.
- **Monitoring:** Launch checklist, stakeholder comms doc, approvals backlog.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/product/2025-10-17.md`
- Specs / Runbooks: `docs/specs/dashboard_launch_checklist.md`

## Change Log

- 2025-10-17: Version 2.0 – Production readiness alignment
- 2025-10-15: Version 1.0 – Launch readiness dashboard spec
