# Product Agent Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 3.0

## Objective

Deliver cross-functional launch readiness for HotDash by aligning checklists, communications, and roadmap updates to the North Star metrics ahead of the upcoming release.

## Current Tasks

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
11. Track analytics KPIs vs success metrics and update roadmap status board (`plans/roadmap.md`) each day.
12. Confirm idea pool prioritisation meets North Star (5 items + 1 wildcard) and document acceptance rules.
13. Review Ops runbooks (backups, rollback, health) for completeness and log gaps.
14. Audit docs for outdated Ayrshare references and ensure Publer replacements complete.
15. Prepare post-launch retrospective template in `docs/specs/iteration_plan.md`.
16. Write feedback to `feedback/product/2025-10-17.md` and clean stray md files.

## Constraints

- **Allowed Tools:** bash, node, npm, npx prettier, rg
- **Touched Directories:** docs/directions/product.md
- **Budget:** ≤ 30 minutes, ≤ 4,000 tokens, ≤ 3 files modified or staged
- **Guardrails:** Restrict edits to the product direction file and reference canonical launch docs while aligning with North Star outcomes.

## Definition of Done

- [ ] Objective deliverables outlined above are completed within scope.
- [ ] `npx prettier --write docs/directions/product.md` executed.
- [ ] Only `docs/directions/product.md` staged for review.
- [ ] Supporting docs referenced in tasks are updated or linked with proof of work.
- [ ] Feedback entry logged to `feedback/product/2025-10-17.md` with WORK COMPLETE signal.
- [ ] Blockers captured in `feedback/manager/2025-10-17.md` if encountered.

## Risk & Rollback

- **Risk Level:** Low — misalignment causes launch confusion but no production outages.
- **Rollback Plan:** Restore prior version via git history (`git checkout -- docs/directions/product.md` before staging).
- **Monitoring:** Track North Star metrics, roadmap status updates, and launch checklist completion daily.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`, `plans/roadmap.md`
- Launch checklist: `docs/runbooks/production_deployment.md`, `docs/runbooks/partner_dry_run_readiness.md`
- Comms & specs: `docs/specs/stakeholder_comms.md`, `docs/specs/user_acceptance_criteria.md`, `docs/specs/user_training.md`, `docs/specs/iteration_plan.md`
- Feedback: `feedback/product/2025-10-17.md`, `feedback/manager/2025-10-17.md`

## Change Log

- 2025-10-17: Version 3.0 – Template rewrite with launch alignment tasks.
- 2025-10-16: Version 2.1 – Launch readiness, success metrics, iteration roadmap.
- 2025-10-15: Version 2.0 – Foundation PRD and feature prioritization.
- 2025-10-15: Version 1.0 – Placeholder while foundation completed.
