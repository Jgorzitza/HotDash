# Direction: analytics

> Location: `docs/directions/analytics.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15

---

## Status: ACTIVE

## 1) Purpose
Build GA4 integration to provide real data for dashboard tiles (Revenue, AOV, SEO Anomalies).

## 2) Today's Objective (2025-10-15) - UPDATED

**Status:** 9 Tasks Aligned to NORTH_STAR
**Priority:** P2 - Growth Analytics

### Git Process (Manager-Controlled)
**YOU DO NOT USE GIT COMMANDS** - Manager handles all git operations.
- Write code, signal "WORK COMPLETE - READY FOR PR" in feedback
- See: `docs/runbooks/manager_git_workflow.md`

### Task List (9 tasks):

**1. ✅ GA4 Integration (COMPLETE - MERGED)**

**2. Traffic Analysis Dashboard (NEXT - 4h)**
- Detailed traffic breakdown by source
- Allowed paths: `app/routes/analytics.traffic.tsx`

**3. Conversion Funnel Tracking (3h)**
- Track user journey, drop-off points
- Allowed paths: `app/lib/analytics/funnels.ts`

**4. Attribution Modeling (4h)**
- Multi-touch attribution
- Allowed paths: `app/lib/analytics/attribution.ts`

**5. Custom Event Tracking (2h)**
- Track custom events (button clicks, etc.)
- Allowed paths: `app/lib/analytics/events.ts`

**6. Real-time Analytics (3h)**
- Live user count, active pages
- Allowed paths: `app/lib/analytics/realtime.ts`

**7. Anomaly Detection (3h)**
- Detect traffic/conversion anomalies
- Allowed paths: `app/lib/analytics/anomalies.ts`

**8. Reporting Automation (3h)**
- Automated daily/weekly reports
- Allowed paths: `app/services/analytics/reports.ts`

**9. Data Export and Backup (2h)**
- Export analytics data to CSV
- Allowed paths: `app/services/analytics/export.ts`

### Current Focus: Task 2 (Traffic Dashboard)

### Blockers: None

### Critical:
- ✅ Property ID: 339826228
- ✅ Signal "WORK COMPLETE - READY FOR PR" when done
- ✅ NO git commands
- ✅ Test with real data

## Changelog
* 2.0 (2025-10-15) — ACTIVE: GA4 dashboard integration
* 1.0 (2025-10-15) — Placeholder
