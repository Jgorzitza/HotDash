# SEO Direction

- **Owner:** SEO Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #77

Kick off Programmatic SEO Factory planning behind flags. Today: draft the spec skeleton and flag design with rollback notes; keep vitals unit test/lint evidence attached.

## Tasks

1. Follow docs/manager/EXECUTION_ROADMAP.md (SEO — Roadmap). Autonomy Mode applies. Log evidence in `feedback/seo/<YYYY-MM-DD>.md`.

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes, open a blocker note and continue with the next queued task below. Do not idle.
- Keep flags OFF; attach evidence bundles for each doc/update.

## Foreground Proof (Required)

- For any step expected to run >15s, run via `scripts/policy/with-heartbeat.sh seo -- <command>`.
- Append ISO timestamps on each step to `artifacts/seo/<YYYY-MM-DD>/logs/heartbeat.log`.
- Include this path under “Foreground Proof” in your PR body and commit the log. PRs without it fail CI.

## Fallback Work Queue (aligned to NORTH_STAR)

1. Programmatic SEO Factory (issue #77) — docs/specs/hitl/programmatic-seo-factory\*
2. Closed‑loop SEO Telemetry — docs/specs/hitl/seo-telemetry\* (coord. with Analytics #79)
3. Media Pipeline Tier‑0 planning — docs/specs/hitl/media-pipeline\*
4. A/B harness contributions (co‑own with Product #80) — docs/specs/hitl/ab-harness\*
5. Site Search synonyms/facets — docs/specs/hitl/site-search\*
6. Schema markup expansions (FAQ, Breadcrumb, Product) — template notes
7. Canonicalization and robots/noindex rules for programmatic pages
8. Sitemap generation planning for programmatic clusters
9. Internal-link policy and thresholds; nightly sweep guardrails
10. Alt‑text heuristics for media pipeline; accessibility checklist
11. Meta description trims policy; safe autopublish Tier‑0 doc
12. Title/H1 alignment guard and linting rules (docs)
13. 404/preview flows for draft pages with flags OFF

## Upcoming (broad lanes — break into molecules)

- Programmatic SEO Factory
  - Allowed paths: `docs/specs/hitl/programmatic-seo-factory*`, `feedback/seo/**`, `artifacts/seo/**`
  - Deliverables: spec review notes, initial metaobject definitions, page template outline
- Closed-loop SEO Telemetry (GSC→BigQuery → GA4 join)
  - Allowed paths: `docs/specs/hitl/seo-telemetry*`, `integrations/**`, `feedback/seo/**`, `artifacts/seo/**`
  - Deliverables: query stubs, priority list algorithm, Action Dock data contract
- A/B Harness (cookie + GA4 dimension)
  - Allowed paths: `docs/specs/hitl/ab-harness*`, `feedback/seo/**`, `artifacts/seo/**`
  - Deliverables: experiment registry plan, GA4 dim mapping (adapter-based)
- Media Pipeline (Tier‑0 tasks staged, toggles OFF)
  - Allowed paths: `docs/specs/hitl/media-pipeline*`, `feedback/seo/**`, `artifacts/seo/**`
  - Deliverables: compression thresholds, alt‑text policy, rollback plan
- Site Search (synonyms & facets)
  - Allowed paths: `docs/specs/hitl/site-search*`, `feedback/seo/**`
  - Deliverables: synonyms list, facet definitions aligning to builder mental models

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline). Shopify via MCP; GA4/GSC via internal adapters (no MCP). Log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/lib/seo/**`, `tests/unit/**`, `artifacts/seo/2025-10-18/**`, `feedback/seo/2025-10-18.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** HITL approvals required for SEO changes; evidence mandatory.

## Definition of Done

- [ ] Anomaly triage doc updated
- [ ] Web vitals adapter tests executed
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Docs updated with recommendations
- [ ] Feedback entry completed
- [ ] Contract test passes
- [ ] Foreground Proof: committed `artifacts/seo/<YYYY-MM-DD>/logs/heartbeat.log`

## Contract Test

- **Command:** `npx vitest run tests/unit/seo.web-vitals.spec.ts`
- **Expectations:** Web vitals adapter returns expected metrics.

## Risk & Rollback

- **Risk Level:** Medium — Poor SEO guidance harms traffic; mitigated by HITL.
- **Rollback Plan:** Revert recommendations, update triage doc, monitor metrics.
- **Monitoring:** SEO anomaly dashboards, web vitals telemetry.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/seo/2025-10-18.md`
- Specs / Runbooks: `docs/specs/seo_pipeline.md`, `docs/specs/seo_anomaly_triage.md`

## Change Log

- 2025-10-18: Version 2.1 – Launch-day unit + lint focus
- 2025-10-17: Version 2.0 – Production triage + recommendation flow
- 2025-10-16: Version 1.0 – Direction refreshed awaiting scope
