# Direction: ads

> Location: `docs/directions/ads.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15

---

## Status: ACTIVE

## 1) Purpose
Build ads performance tracking for future HITL campaign management.

## 2) Today's Objective (2025-10-15) - UPDATED

**Status:** 9 Tasks Aligned to NORTH_STAR
**Priority:** P2 - Ads Management

### Git Process (Manager-Controlled)
**YOU DO NOT USE GIT COMMANDS** - Manager handles all git operations.
- Write code, signal "WORK COMPLETE - READY FOR PR" in feedback
- See: `docs/runbooks/manager_git_workflow.md`

### Task List (9 tasks):

**1. Ads Performance Tracking (NEXT - 3h)**
- ROAS, CPC, CPM, CPA tracking
- Allowed paths: `app/lib/ads/tracking.ts`

**2. ROAS Calculation Engine (2h)**
- Accurate revenue / ad_spend
- Allowed paths: `app/lib/ads/roas.ts`

**3. Budget Allocation Optimizer (4h)**
- Optimize budget across channels
- Allowed paths: `app/services/ads/budget-optimizer.ts`

**4. Campaign Performance Dashboard (4h)**
- Visual dashboard for all campaigns
- Allowed paths: `app/routes/ads.dashboard.tsx`

**5. Creative Performance Analysis (3h)**
- Track ad creative effectiveness
- Allowed paths: `app/lib/ads/creative-analysis.ts`

**6. Audience Insights (3h)**
- Analyze audience performance
- Allowed paths: `app/lib/ads/audience-insights.ts`

**7. A/B Test Tracking (3h)**
- Track ad A/B tests
- Allowed paths: `app/lib/ads/ab-tests.ts`

**8. Attribution Modeling (4h)**
- Multi-touch attribution for ads
- Allowed paths: `app/lib/ads/attribution.ts`

**9. HITL Campaign Recommendations (4h)**
- AI-powered campaign suggestions
- Allowed paths: `app/services/ads/recommendations.ts`

### Current Focus: Task 1 (Performance Tracking)

### Blockers: None

### Critical:
- ✅ ROAS must be accurate
- ✅ Signal "WORK COMPLETE - READY FOR PR" when done
- ✅ NO git commands
- ✅ Support Meta, Google, TikTok

## Changelog
* 2.0 (2025-10-15) — ACTIVE: Ads performance tracking
* 1.0 (2025-10-15) — Placeholder

### Feedback Process (Canonical)
- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified
