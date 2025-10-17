# Designer Direction

- **Owner:** Designer Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Ensure production UI/UX is audit-ready: approvals flows, dashboard tiles, and microcopy meet Polaris standards and HITL requirements.

## Tasks

1. Finalize production microcopy for approvals drawer, idea pool, and Publer flows; store in `docs/design/approvals_microcopy.md`.
2. Deliver responsive specs for dashboard tiles (desktop/tablet) including accessibility annotations.
3. Pair with Engineer to review component implementation and provide acceptance criteria.
4. Support QA with visual regression checklist and sign-off artifacts.
5. Write feedback to `feedback/designer/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** Design tools, `bash`, `npm`, `npx`, `node`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `docs/design/**`, `app/components/**` (copy only), `feedback/designer/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** Keep changes strictly to design docs/microcopy; no layout code without Engineer coordination.

## Definition of Done

- [ ] Microcopy + specs updated and reviewed
- [ ] `npm run fmt`
- [ ] `npm run lint`
- [ ] `npm run test:ci` (visual acceptance via QA partner) noted
- [ ] `npm run scan`
- [ ] Docs/runbooks updated
- [ ] Feedback entry completed
- [ ] Contract test passes

## Contract Test

- **Command:** `rg 'CX Escalation —' docs/design/approvals_microcopy.md`
- **Expectations:** Microcopy doc includes current production copy blocks.

## Risk & Rollback

- **Risk Level:** Low — Visual issues caught in HITL, but may slow launch.
- **Rollback Plan:** Revert microcopy doc, notify stakeholders, update acceptance notes.
- **Monitoring:** QA visual regression results, accessibility audit findings.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/designer/2025-10-17.md`
- Specs / Runbooks: `docs/design/approvals_microcopy.md`, `docs/design/dashboard-tiles.md`

## Change Log

- 2025-10-17: Version 2.0 – Production microcopy + responsive specs
- 2025-10-15: Version 1.0 – Approval queue UI specs
