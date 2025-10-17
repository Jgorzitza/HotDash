# task_direction_product — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Rewrite `docs/directions/product.md` to the new template with the launch checklist, CEO packet, and cross-agent coordination tasks listed below.

## Current Tasks
1. Overwrite the file using `docs/directions/agenttemplate.md`.
2. Use this ordered task list (1–16):
   1. Refresh the launch checklist in `docs/runbooks/production_deployment.md` with Publer/Chatwoot/idea pool gates.
   2. Build the CEO launch packet (summary, KPIs, URLs) in `docs/manager/PROJECT_PLAN.md` appendix; attach diff.
   3. Align agent direction summaries and publish overview in `docs/README.md` launch section.
   4. Coordinate backlog grooming with Analytics/Data/Integrations to ensure dependencies unblocked; log notes.
   5. Draft release comms template (internal + external) in `docs/specs/stakeholder_comms.md`.
   6. Validate user journeys (dashboard → idea pool → Publer) and record acceptance criteria in `docs/specs/user_acceptance_criteria.md`.
   7. Ensure training material draft for support/CEO exists in `docs/specs/user_training.md` with updated screenshots.
   8. Manage open decisions list (tools, configs) in `feedback/product/2025-10-17.md` and resolve or escalate.
   9. Partner with Designer to verify UI assets/dark mode tokens align with roadmap; capture sign-off.
   10. Schedule launch milestone review (include QA/DevOps/Support) and archive agenda in `docs/runbooks/partner_dry_run_readiness.md`.
   11. Track analytics KPIs vs success metrics and update roadmap status board (plans/roadmap.md) each day.
   12. Confirm idea pool prioritisation meets North Star (5 items + 1 wildcard) and document acceptance rules.
   13. Review Ops runbooks (backups, rollback, health) for completeness and log gaps.
   14. Audit docs for outdated Ayrshare references and ensure Publer replacements complete.
   15. Prepare post-launch retrospective template in `docs/specs/iteration_plan.md`.
   16. Write feedback to `feedback/product/2025-10-17.md` and clean stray md files.
3. Populate Objective/Constraints/DoD/Risk/Links accordingly.
4. Add changelog entry dated 2025-10-17.
5. Run `npx prettier --write docs/directions/product.md`.
6. Stage only `docs/directions/product.md`.
7. Log blockers in `feedback/manager/2025-10-17.md` if needed.

## Constraints
- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `rg`.
- **Touched Directories:** `docs/directions/product.md`.
- **Budget:** ≤ 30 minutes, ≤ 4,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Restrict edits to product direction file; reference canonical docs.

## Definition of Done
- [ ] Template applied with tasks above and supporting sections.
- [ ] Prettier executed.
- [ ] Only `docs/directions/product.md` staged.
- [ ] Blockers logged if any.

## Risk & Rollback
- **Risk Level:** Low — product alignment issues create confusion but not system failure.
- **Rollback Plan:** `git checkout -- docs/directions/product.md` before staging.
- **Monitoring:** Ensure direction stays aligned with North Star, roadmap, and feature pack deliverables.

## Links & References
- Template: `docs/directions/agenttemplate.md`
- Launch docs: `docs/runbooks/production_deployment.md`, `docs/specs/stakeholder_comms.md`
- Roadmap: `docs/roadmap.md`, `plans/roadmap.md`
- Feedback: `feedback/product/`

## Change Log
- 2025-10-17: Version 1.0 — Template rewrite with launch alignment tasks.
