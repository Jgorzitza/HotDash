# Designer Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective

Deliver launch-ready dark mode tokens, diagnostics panel assets, and Publer workflow polish with complete feedback hygiene and accessibility coverage.

## Current Tasks

1. Finalize dark mode token updates for dashboard and approvals surfaces; attach the Figma snapshot link.
2. Deliver the diagnostics panel design for the health tile (Chatwoot/Publer) and include annotations.
3. Produce Publer workflow UI specs for tabs and first-comment area in `docs/design/dashboard-tiles.md`.
4. Update the responsive layouts for the idea pool tile and approvals drawer; confirm breakpoints.
5. Provide motion guidelines for tile skeletons/loading states and attach the reference.
6. Collaborate with the Engineer on AppProvider harness visual checks and log findings.
7. Refresh the iconography set for inventory alerts and supply it to the assets folder.
8. Create empty and error state illustrations for the idea pool and Publer screens; include the assets path.
9. Audit accessibility color contrast for dark mode tokens and attach the report.
10. Update the copy deck with tone guidance aligned to CEO feedback.
11. Prepare the handoff checklist in `docs/specs/stakeholder_comms.md` for designers to engineers.
12. Coordinate with Product to validate user journeys map to the design specs.
13. Document the design QA procedure in the design section of `docs/runbooks/qa_review_checklist.md`.
14. Produce the asset bundle for launch (logos, badges) and place it in `artifacts/design/`.
15. Review the Publer adapter UI after integration to ensure alignment and note adjustments.
16. Write feedback to `feedback/designer/2025-10-17.md` and clean up stray markdown files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `codex exec`, `rg`, `npx prettier`
- **Touched Directories:** `docs/directions/designer.md`
- **Budget:** ≤ 30 minutes runtime, ≤ 4,000 tokens, ≤ 3 files modified/staged
- **Guardrails:** Apply this template, keep edits scoped to the designer direction file, attach logs or screenshots for required checks in the PR description, never commit secrets, follow escalation rules in `docs/RULES.md`

## Definition of Done

- [ ] Objective satisfied with dark mode, diagnostics, and Publer deliverables ready for handoff
- [ ] `npm run fmt` and `npm run lint` executed with proof attached
- [ ] `npm run test:ci` (or task-specific suite) executed with proof attached
- [ ] `npm run scan` (secrets) executed with a clean report attached
- [ ] Related docs and runbooks updated when behavior or specs change
- [ ] Feedback entry written to `feedback/designer/2025-10-17.md` and stray markdown files cleaned

## Risk & Rollback

- **Risk Level:** Low — design misalignment may delay UI polish but not core functionality
- **Rollback Plan:** `git checkout -- docs/directions/designer.md` before staging or revert the direction update prior to merge
- **Monitoring:** Track dark mode token adoption, diagnostics panel readiness, and Publer workflow alignment during design reviews

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/designer/2025-10-17.md`
- Specs / Runbooks: `docs/design/dashboard-tiles.md`, `docs/specs/frontend_overview.md`, `docs/specs/stakeholder_comms.md`, `docs/runbooks/qa_review_checklist.md`, `artifacts/design/`

## Change Log

- 2025-10-17: Version 1.0 – Template rewrite with dark mode, diagnostics, and Publer launch tasks
