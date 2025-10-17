# task_direction_designer — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Rewrite `docs/directions/designer.md` with the template so design delivers dark mode tokens, diagnostics panel assets, Publer UI polish, and feedback hygiene for launch.

## Current Tasks
1. Apply the template from `docs/directions/agenttemplate.md`.
2. Use this task list (1–16):
   1. Finalise dark mode token updates for dashboard/approvals surfaces; attach Figma snapshot link.
   2. Deliver diagnostics panel design for health tile (Chatwoot/Publer) with annotations.
   3. Produce Publer workflow UI specs (tabs, first-comment area) in `docs/design/dashboard-tiles.md`.
   4. Update responsive layouts for idea pool tile and approvals drawer; confirm breakpoints.
   5. Provide motion guidelines for tile skeletons/loading states; attach reference.
   6. Collaborate with Engineer on AppProvider harness visual checks; log findings.
   7. Refresh iconography set for inventory alerts and supply to assets folder.
   8. Create empty/error state illustrations for idea pool + Publer screens; include assets path.
   9. Audit accessibility (color contrast) for dark mode tokens; attach report.
   10. Update copy deck with tone guidance aligned to CEO feedback.
   11. Prepare handoff checklist in `docs/specs/stakeholder_comms.md` for designers → engineers.
   12. Coordinate with Product to validate user journeys map to design specs.
   13. Document design QA procedure in `docs/runbooks/qa_review_checklist.md` design section.
   14. Produce asset bundle for launch (logos, badges) and place in `artifacts/design/`.
   15. Review Publer adapter UI after integration to ensure alignment; note adjustments.
   16. Write feedback to `feedback/designer/2025-10-17.md` and clean stray md files.
3. Populate Objective/Constraints/DoD/Risk/Links referencing design tooling, Figma, accessibility requirements.
4. Add changelog entry for 2025-10-17.
5. Run `npx prettier --write docs/directions/designer.md`.
6. Stage only `docs/directions/designer.md`.
7. Log blockers in `feedback/manager/2025-10-17.md` if needed.

## Constraints
- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `rg`.
- **Touched Directories:** `docs/directions/designer.md`.
- **Budget:** ≤ 30 minutes, ≤ 4,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Limit edits to designer direction file.

## Definition of Done
- [ ] Template applied with provided tasks.
- [ ] Prettier executed.
- [ ] Only `docs/directions/designer.md` staged.
- [ ] Blockers logged if any.

## Risk & Rollback
- **Risk Level:** Low — design misalignment delays UI polish but not core functionality.
- **Rollback Plan:** `git checkout -- docs/directions/designer.md` before staging.
- **Monitoring:** Ensure tasks align with dark mode, diagnostics panel, and Publer workflow design deliverables.

## Links & References
- Template: `docs/directions/agenttemplate.md`
- Design specs: `docs/design/dashboard-tiles.md`, `docs/specs/frontend_overview.md`
- Feedback: `feedback/designer/`

## Change Log
- 2025-10-17: Version 1.0 — Template rewrite with launch design tasks.
