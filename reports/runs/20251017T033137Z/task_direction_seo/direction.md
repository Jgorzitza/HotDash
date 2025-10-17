# task_direction_seo — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Rewrite `docs/directions/seo.md` using the template so SEO covers anomaly response, idea briefs, Publer keyword strategy, and feedback hygiene.

## Current Tasks
1. Replace the file with the template from `docs/directions/agenttemplate.md`.
2. Use this task list (1–16):
   1. Validate SEO anomaly alerts (`app/lib/seo/diagnostics.ts`) against Supabase data; document results.
   2. Produce keyword briefs for each idea pool suggestion (including wildcard) and store in `docs/specs/seo_pipeline.md`.
   3. Align Publer first-comment keywords with analytics KPIs; update `docs/specs/seo_backlog.md`.
   4. Draft meta title/description templates for upcoming campaigns; attach examples.
   5. Refresh structured data/JSON-LD guidance in `docs/specs/frontend_overview.md` for idea pool items.
   6. Collaborate with Content to ensure tone + SEO guidelines aligned; capture notes in feedback.
   7. Create SEO QA checklist for dashboard and idea pool pages and store in `docs/specs/seo_pipeline.md`.
   8. Run lighthouse/SEO audits on staging build; attach report.
   9. Monitor Publer post performance vs SEO KPIs; summarise weekly in feedback.
   10. Build FAQ schema suggestions for support knowledge base updates; log deliverable.
   11. Ensure analytics sampling guards include SEO metrics; coordinate with Analytics.
   12. Update `docs/specs/seo_backlog.md` prioritisation, owner, status.
   13. Document fallback plan for SERP anomaly (escalation path) in `docs/runbooks/logging.md` or dedicated SEO runbook.
   14. Validate canonical URLs + sitemap updates for new pages; log audit results.
   15. Prepare post-launch SEO retrospective template capturing metrics and experiments.
   16. Write feedback to `feedback/seo/2025-10-17.md` and clean stray md files.
3. Populate Objective/Constraints/DoD/Risk/Links with SEO tooling (Lighthouse, GA4, Supabase).
4. Add changelog entry for 2025-10-17.
5. Run `npx prettier --write docs/directions/seo.md`.
6. Stage only `docs/directions/seo.md`.
7. Note blockers in `feedback/manager/2025-10-17.md` if required.

## Constraints
- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `lighthouse`, `rg`.
- **Touched Directories:** `docs/directions/seo.md`.
- **Budget:** ≤ 30 minutes, ≤ 4,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Restrict edits to SEO direction file.

## Definition of Done
- [ ] Template applied with provided tasks.
- [ ] Prettier executed.
- [ ] Only `docs/directions/seo.md` staged.
- [ ] Blockers logged if any.

## Risk & Rollback
- **Risk Level:** Low — misaligned SEO reduces traffic lift.
- **Rollback Plan:** `git checkout -- docs/directions/seo.md` before staging.
- **Monitoring:** Ensure tasks align with anomaly alerts, Publer strategy, and analytics dependencies.

## Links & References
- Template: `docs/directions/agenttemplate.md`
- SEO specs: `docs/specs/seo_pipeline.md`, `docs/specs/seo_backlog.md`
- Analytics alignment: `docs/specs/analytics_pipeline.md`
- Feedback: `feedback/seo/`

## Change Log
- 2025-10-17: Version 1.0 — Template rewrite with SEO launch tasks.
