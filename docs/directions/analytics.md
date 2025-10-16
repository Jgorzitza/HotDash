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

[Archived] 2025-10-16 objectives moved to docs/_archive/directions/analytics-2025-10-16.md


## Tomorrow’s Objective (2025-10-17) — Tighten contracts and wire tiles

Status: ACTIVE
Priority: P1 — Solidify tile loader contracts, GA health, and route typing

Tasks (initial 8)
1) Finalize TileData contract; export types for useLoaderData
2) Route typing pass: explicit loader return types; remove `any`
3) Wire /api/dashboard/tiles to dashboard tiles; add fallback mocks guard
4) GA health: ensure /api/health/ga emits clear status + sampling/quota flags
5) Caching TTL tests: add/adjust unit tests for cache boundaries
6) Phase 2: trend smoothing hooks + tests (SMA/EMA)
7) Evidence bundle: timings, sample responses, screenshots
8) WORK COMPLETE block with links

Allowed paths: app/lib/analytics/**, app/routes/**, tests/**, docs/specs/**

* 1.0 (2025-10-15) — Placeholder

### Feedback Process (Canonical)
- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified


## Backlog (Sprint-Ready — 25 tasks)
1) Traffic dashboard route + API
2) Funnels (session → view → add → checkout)
3) Cohort analysis (weekly)
4) Anomaly detection (Z-score on sessions)
5) UTM source/medium breakdown
6) Device/geo breakdown
7) Landing pages top 20
8) Exit pages top 20
9) Time-on-page analysis
10) Conversion rate tiles
11) GA4 quota/backoff handling
12) Sampling detection + warnings
13) Cache for heavy reports
14) Export CSV endpoints
15) Unit tests for metrics math
16) Integration tests GA4 client
17) Snapshot tests of responses
18) Docs/specs for reports
19) Permission checks on analytics routes
20) Perf tuning (batching queries)
21) Index visualizations
22) Alert hooks to Slack (read-only)
23) Scheduled weekly rollup
24) Dashboard drill-down links
25) SLO dashboard for analytics APIs
