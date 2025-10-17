# SEO Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective

Deliver end-to-end SEO operations for anomaly response, idea-pool briefs, Publer keyword alignment, and feedback hygiene with documented evidence across Supabase, Lighthouse, and GA4 touchpoints.

## Current Tasks

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

## Constraints

- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `lighthouse`, `rg`
- **Touched Directories:** `docs/directions/seo.md`
- **Budget:** ≤ 30 minutes runtime, ≤ 4,000 tokens, ≤ 3 files modified or staged
- **Guardrails:** Restrict edits to the SEO direction file; protect analytics and Publer credentials.

## Definition of Done

- [ ] Objective satisfied with documented anomaly validation, keyword briefs, Publer alignment, and feedback hygiene.
- [ ] `npm run fmt` and `npm run lint` executed with attached proof.
- [ ] `npm run test:ci` (or equivalent SEO validation suite) executed with artefacts recorded.
- [ ] `npm run scan` (secrets) produces a clean report.
- [ ] Lighthouse, GA4, and Supabase evidence linked in specs/runbooks as updates land.
- [ ] Feedback entry written to `feedback/seo/2025-10-17.md` with blockers and follow-ups.

## Risk & Rollback

- **Risk Level:** Low — misaligned SEO responses could dampen traffic lift and reporting accuracy.
- **Rollback Plan:** Revert task outputs and restore prior docs via `git checkout -- <file>` before staging.
- **Monitoring:** Track Supabase anomaly flags, GA4 KPI deltas, Lighthouse scores, and Publer keyword performance.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/seo/2025-10-17.md`
- Specs / Runbooks: `docs/specs/seo_pipeline.md`, `docs/specs/seo_backlog.md`, `docs/specs/frontend_overview.md`, `docs/runbooks/logging.md`, `docs/specs/analytics_pipeline.md`

## Change Log

- 2025-10-17: Version 1.0 – Template rewrite with SEO launch tasks.
