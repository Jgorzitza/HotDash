# SEO Direction


---

## 🚨 DATE CORRECTION (2025-10-19)

**IMPORTANT**: Today is **October 19, 2025**

Some agents mistakenly wrote feedback to `2025-10-20.md` files. Manager has corrected this.

**Going forward**: Write ALL feedback to `feedback/AGENT/2025-10-19.md` for the rest of today.

Create tomorrow's file (`2025-10-20.md`) ONLY when it's actually October 20.

---


- **Owner:** SEO Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #115

Deliver production-ready SEO monitoring and HITL recommendations with clear evidence, anomaly triage, and rollback guidance.

## Tasks

1. Draft SEO anomaly triage doc referencing Supabase views and alerts; keep it updated.
2. Provide HITL-ready SEO recommendations with evidence (search console, analytics) and approvals payloads.
3. Work with Ads/Content to avoid keyword cannibalization across campaigns.
4. Run web vitals adapter tests and log results.
5. Write feedback to `feedback/seo/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/lib/seo/**`, `docs/specs/seo_pipeline.md`, `docs/specs/seo_anomaly_triage.md`, `feedback/seo/2025-10-17.md`
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
- Feedback: `feedback/seo/2025-10-17.md`
- Specs / Runbooks: `docs/specs/seo_pipeline.md`, `docs/specs/seo_anomaly_triage.md`

## Change Log

- 2025-10-17: Version 2.0 – Production triage + recommendation flow
- 2025-10-16: Version 1.0 – Direction refreshed awaiting scope

---

## NEW DIRECTION — 2025-10-19T21:00:00Z (Version 3.0)

**Previous Work**: ✅ COMPLETE - SEO anomaly triage doc, 43/43 tests (100%)

**New Objective**: SEO monitoring automation and content/ads coordination

**New Tasks** (16 molecules):

1. **SEO-101**: Create SEO dashboard API route (app/routes/api.seo.dashboard.ts) (30 min)
2. **SEO-102**: Implement automated anomaly detection script (35 min)
3. **SEO-103**: Create Supabase triggers for critical SEO alerts (30 min)
4. **SEO-104**: Build keyword cannibalization detection (40 min)
5. **SEO-105**: Coordinate with Ads on keyword strategy conflicts (25 min)
6. **SEO-106**: Coordinate with Content on SEO optimization (25 min)
7. **SEO-107**: Create SEO recommendation HITL workflow (35 min)
8. **SEO-108**: Implement web vitals monitoring automation (30 min)
9. **SEO-109**: Create crawl error alert system (30 min)
10. **SEO-110**: Build ranking change notification system (30 min)
11. **SEO-111**: Document SEO playbooks for operators (35 min)
12. **SEO-112**: Create SEO performance report generator (30 min)
13. **SEO-113**: Implement competitor ranking tracking (40 min)
14. **SEO-114**: Build SEO A/B test framework (35 min)
15. **SEO-115**: Create SEO metrics export for stakeholders (25 min)
16. **SEO-116**: Feedback summary and test validation (20 min)

**Feedback File**: `feedback/seo/2025-10-19.md` ← USE THIS

**Allowed Paths**: app/lib/seo/**, app/routes/api.seo.**, tests/unit/seo/**, docs/specs/**, feedback/seo/**

