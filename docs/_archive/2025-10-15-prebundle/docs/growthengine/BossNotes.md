# Boss Notes — Candid Critique & Upgrades

## What’s strong

- Action-first UX with previews/diffs reduces “thinking overhead” for the operator.
- Programmatic pages + guided selling tie discovery to conversion with minimal headcount.
- Learning loop is cheap: no heavyweight ML, just edit diffs and uplift tracking.

## What’s missing (fix now)

1. **Source of truth for copy blocks** — add a small library of reusable product claims with evidence links to avoid drift and re-typed mistakes.
2. **Image pipeline** — automated compression, responsive sizes, and alt-text drafts tied to products.
3. **Data freshness indicators** — label incomplete days (GSC/GA4 both lag); avoid false alarms.
4. **Rollback UX** — one-click revert for every action; show what will change _before_ approving.
5. **Guarded auto-publish** — start with Tier 0 only; expand gates only after measured wins.
6. **On-site search synonyms** — bake `-6AN / AN-6 / AN6` style synonyms into Search & Discovery config as part of the deployment checklist.
7. **Docs for failure modes** — adapter partial writes, webhook bursts, rate limit exhaustion.

## If I were grading my own work

- **Simplicity:** Good, but we can collapse services: Action Service can host recommenders as jobs to reduce orchestration.
- **Observability:** Needs tighter SLIs/SLOs; add “action acceptance %” and “time-to-approve” targets.
- **Risk:** Programmatic pages need strict publish gates (author, date, unique table/photo) to avoid thin content at scale.
- **Scope:** Keep v1 to 3 recommenders (SEO CTR Fixer, Programmatic Factory, Guided Selling). Merch Playbooks and Perf Repair can land in v1.1 if needed.

## Stretch Upgrades (post v1)

- **Edge index** for programmatic pages to ensure sub-100ms TTFB globally.
- **Operator keyboard palette** (Command-K) to approve/rollback without leaving the list.
- **Parts graph** that learns compatibility from returns/exchanges and co-purchases.
- **Basic cohort analytics** for pages shipped in waves to prove incremental SEO lift.
