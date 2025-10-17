# task_direction_qa — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Rewrite `docs/directions/qa.md` using the agent template so QA drives AppProvider harness adoption, Playwright/axe reinstatement, health reporting, and launch sign-off.

## Current Tasks
1. Overwrite the file with `docs/directions/agenttemplate.md` sections.
2. Use the following ordered tasks (1–18) exactly:
   1. Pair with Engineer to finalise the AppProvider harness utilities (`tests/utils/render.tsx`) and document setup steps.
   2. Refactor approvals drawer unit tests to use the harness; attach `npm run test:ci -- ApprovalsDrawer` log.
   3. Re-enable Playwright approvals flow suite with updated fixtures; include results artifact.
   4. Add Playwright coverage for idea pool routes (list/detail) with Supabase-backed data; capture video evidence.
   5. Create Playwright scenarios for Publer scheduling (approve, schedule, cancel) behind feature toggle.
   6. Restore axe accessibility checks across dashboard, approvals, idea pool, and social routes; attach axe report.
   7. Configure daily Playwright smoke run in `.github/workflows/workflow-smoke.yml`; store artifacts.
   8. Implement screenshot diff baseline for dashboard tiles and idea pool cards; ensure false positives <5%.
   9. Build MSW mocks for Chatwoot/Publer during Playwright runs to simulate error paths; document usage.
   10. Integrate Supabase fixture refresh command before each e2e run; record CLI output.
   11. Validate analytics API endpoints with integration tests (`tests/integration/analytics.*`); share summary logs.
   12. Draft QA sign-off checklist for launch in `docs/runbooks/qa_review_checklist.md`.
   13. Set up incident triage template in `feedback/qa/2025-10-17.md` referencing severity/risk.
   14. Produce coverage dashboard (Vitest + Playwright) with thresholds and post in feedback.
   15. Coordinate with DevOps to ingest Playwright/axe artifacts into daily health report.
   16. Verify Chatwoot/Publer health scripts have QA assertions; log results.
   17. Perform regression on Shopify embedded app (desktop/mobile) and document issues found/resolved.
   18. Write feedback to `feedback/qa/2025-10-17.md` and clean stray md files.
3. Populate Objective/Constraints/DoD/Risk/Links with QA-specific requirements (commands: `npm run test:ci`, `npx playwright test`, `npm run test:a11y`).
4. Add changelog entry dated 2025-10-17.
5. Run `npx prettier --write docs/directions/qa.md`.
6. Stage only `docs/directions/qa.md`.
7. Note blockers in `feedback/manager/2025-10-17.md` if encountered.

## Constraints
- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `playwright`, `rg`.
- **Touched Directories:** `docs/directions/qa.md`.
- **Budget:** ≤ 45 minutes, ≤ 5,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Limit edits to QA direction file.

## Definition of Done
- [ ] Template applied with the provided tasks.
- [ ] Constraints/DoD/Risk/Links reference QA tooling.
- [ ] Prettier executed.
- [ ] Only `docs/directions/qa.md` staged.
- [ ] Blockers logged if any.

## Risk & Rollback
- **Risk Level:** Medium — QA misalignment delays launch sign-off.
- **Rollback Plan:** `git checkout -- docs/directions/qa.md` before staging.
- **Monitoring:** Ensure alignment with backlog items (T4, T5) and feature pack UI routes.

## Links & References
- Template: `docs/directions/agenttemplate.md`
- Feature Pack UI routes: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/06-ui/`
- Health workflows: `scripts/ops/`
- QA runbooks: `docs/runbooks/qa_review_checklist.md`
- Feedback: `feedback/qa/`

## Change Log
- 2025-10-17: Version 1.0 — Template rewrite with explicit QA launch tasks.
