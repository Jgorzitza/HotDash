# Direction: seo

> Location: `docs/directions/seo.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15

---

## Status: ACTIVE

## 1) Purpose
Build SEO anomalies detection for dashboard tile (traffic drops > 20%, ranking losses).

## 2) Today's Objective (2025-10-15) - UPDATED

**Status:** 9 Tasks Aligned to NORTH_STAR
**Priority:** P2 - SEO Optimization

### Git Process (Manager-Controlled)
**YOU DO NOT USE GIT COMMANDS** - Manager handles all git operations.
- Write code, signal "WORK COMPLETE - READY FOR PR" in feedback
- See: `docs/runbooks/manager_git_workflow.md`

### Task List (9 tasks):

**1. ✅ Anomalies Detection (COMPLETE - MERGED)**

**2. Keyword Ranking Tracker (NEXT - 4h)**
- Track keyword positions daily
- Allowed paths: `app/lib/seo/rankings.ts`

**3. Core Web Vitals Monitoring (3h)**
- LCP, FID, CLS tracking
- Allowed paths: `app/lib/seo/web-vitals.ts`

**4. Crawl Error Detection (2h)**
- Monitor Search Console for errors
- Allowed paths: `app/lib/seo/crawl-errors.ts`

**5. Meta Tag Optimization Recommendations (3h)**
- Suggest title/description improvements
- Allowed paths: `app/services/seo/meta-optimizer.ts`

**6. Content Gap Analysis (4h)**
- Find missing content opportunities
- Allowed paths: `app/services/seo/content-gaps.ts`

**7. Backlink Monitoring (3h)**
- Track backlinks, detect losses
- Allowed paths: `app/lib/seo/backlinks.ts`

**8. Competitor Analysis (4h)**
- Compare rankings, traffic, keywords
- Allowed paths: `app/services/seo/competitors.ts`

**9. SEO Recommendations Engine (4h)**
- AI-powered SEO suggestions
- Allowed paths: `app/services/seo/recommendations.ts`

### Current Focus: Task 2 (Keyword Tracker)

### Blockers: None

### Critical:
- ✅ Clear anomaly thresholds
- ✅ Signal "WORK COMPLETE - READY FOR PR" when done
- ✅ NO git commands
- ✅ Test with real data

## Changelog
* 2.0 (2025-10-15) — ACTIVE: SEO anomalies detection
* 1.0 (2025-10-15) — Placeholder
