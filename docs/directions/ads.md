# Ads Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.3

## Objective

Deliver an ads execution plan that aligns idea pool launches with Publer scheduling, analytics KPIs, and stakeholder approvals so the CEO can green-light high-ROI campaigns with confidence.

## Current Tasks

1. Build the launch ad brief referencing idea pool products, KPIs, and Publer cadence; store in `docs/specs/ads_pipeline.md`.
2. Coordinate with Analytics on ROAS and CAC targets; capture agreed thresholds in the feedback entry.
3. Produce creative copy variants (top, middle, bottom funnel) aligned with existing content assets; attach representative examples.
4. Map ad campaigns to Publer scheduling windows and record the release timeline.
5. Configure UTM tracking parameters, verify Supabase ingestion, and document the mapping.
6. Draft the budget allocation table, review with the CEO, and persist in `docs/specs/success_metrics.md`.
7. Prepare an A/B test plan for idea pool-driven ads including hypotheses and success metrics.
8. Sync with SEO to avoid keyword cannibalization and record the alignment summary.
9. Validate analytics dashboards reflect ad metrics (revenue, CTR, ROAS) and attach the supporting screenshot.
10. Plan the post-approval workflow from Publer to Meta/Google and document it in `docs/specs/stakeholder_comms.md`.
11. Develop alerting rules for underperforming ads aligned with DevOps health notifications.
12. Update the backlog in `docs/specs/ads_pipeline.md` with status, owner, and next steps.
13. Create an ad review checklist ensuring compliance and brand voice alignment.
14. Prepare a cross-channel weekly performance report template.
15. Contribute to the launch communications document with the ad messaging timeline.
16. Write feedback to `feedback/ads/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `rg`
- **Touched Directories:** `docs/directions/ads.md`, `docs/specs/`, `feedback/ads/`, `feedback/manager/`
- **Budget:** ≤ 30 minutes runtime, ≤ 4,000 tokens, ≤ 3 files modified/staged
- **Guardrails:** Keep edits scoped to the ads direction deliverables; log blockers in `feedback/manager/2025-10-17.md` before pausing work.

## Definition of Done

- [ ] Objective satisfied with deliverables stored in referenced specs and feedback.
- [ ] `npm run fmt`
- [ ] `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Docs and runbooks updated where workflows change.
- [ ] Feedback recorded in `feedback/ads/2025-10-17.md` with evidence and attachments.
- [ ] Blockers, if any, noted in `feedback/manager/2025-10-17.md`.

## Risk & Rollback

- **Risk Level:** Low — misaligned ads reduce growth impact but are reversible.
- **Rollback Plan:** `git checkout -- docs/directions/ads.md` prior to staging if updates need to be reverted.
- **Monitoring:** Track ROAS, CAC, CTR, and Publer cadence adherence via analytics dashboards and ad alerting rules.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/ads/2025-10-17.md`
- Specs / Runbooks: `docs/specs/ads_pipeline.md`, `docs/specs/success_metrics.md`, `docs/specs/stakeholder_comms.md`

## Change Log

- 2025-10-17: Version 1.3 – Template rewrite aligning ads strategy with Publer cadence and analytics tasks.
- 2025-10-16: Version 1.2 – Ads intelligence launch plan (aggregates, approvals, anomalies).
- 2025-10-15: Version 1.1 – Ads performance tracking foundation.
