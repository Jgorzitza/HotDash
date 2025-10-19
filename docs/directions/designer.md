# Designer Direction

- **Owner:** Designer Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #107

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
- **Allowed Paths (explicit):**
  - `docs/specs/hitl/main-dashboard*`
  - `docs/design/**` (microcopy, specs, checklists)
  - `feedback/designer/**`
- **Touched Directories:** `docs/design/**`, `docs/specs/hitl/main-dashboard*`, `feedback/designer/**`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** Keep changes strictly to design docs/microcopy; no layout code without Engineer coordination.

## Tasks

1. Follow docs/manager/EXECUTION_ROADMAP.md (Designer — Roadmap). Autonomy Mode applies. Log evidence in `feedback/designer/<YYYY-MM-DD>.md`.

## Definition of Done

- [ ] Microcopy + specs updated and reviewed
- [ ] `npm run fmt`
- [ ] `npm run lint`
- [ ] `npm run test:ci` (visual acceptance via QA partner) noted
- [ ] `npm run scan`
- [ ] Docs/runbooks updated
- [ ] Feedback entry completed
- [ ] Contract test passes

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes, document blocker and continue with next task. Do not idle.
- Keep changes within Allowed paths; attach screenshots/wireframes.

## Fallback Work Queue (aligned to NORTH_STAR)

1. Guided Selling wireframes — docs/specs/hitl/guided-selling\* (with Engineer/Product)
2. Approvals microcopy + states — docs/design/approvals_microcopy.md
3. Dashboard tile visual QA checklist — docs/design/dashboard-tiles.md
4. A/B harness UI hints — docs/specs/hitl/ab-harness.md
5. Media pipeline UX notes (safe autopublish tiers)
6. Drawer and modal accessibility checklist updates
7. Loading/skeleton states for tiles and approvals lists
8. Visual regression scenarios catalog (docs only)
9. UX for error and empty states across key pages
10. Design tokens audit and consistency notes

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
