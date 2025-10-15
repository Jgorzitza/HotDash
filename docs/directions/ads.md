# Direction: ads

> Location: `docs/directions/ads.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15

---

## Status: ACTIVE

## 1) Purpose
Build ads performance tracking for future HITL campaign management.

## 2) Today's Objective (2025-10-15)

**Status:** Build Ads Performance Tracking
**Priority:** P2 - Growth Preparation
**Branch:** `agent/ads/performance-tracking`

### Current Task: Ads Performance Data Structure

**Steps:**
1. Create feedback file: `mkdir -p feedback/ads && echo "# Ads 2025-10-15" > feedback/ads/2025-10-15.md`
2. Build ads tracking in `app/lib/ads/tracking.ts`:
   - ROAS calculation (revenue / ad_spend)
   - CPC, CPM, CPA tracking
   - Campaign performance aggregation
3. Create data structure for ads campaigns
4. Create API route: `app/routes/api/ads.performance.ts`
5. Document in `docs/specs/ads_tracking.md`
6. Create PR

**Allowed paths:** `app/lib/ads/*, app/routes/api/ads.*, docs/specs/*, feedback/ads/*`

### Blockers:
None

### Critical:
- ✅ ROAS calculation must be accurate
- ✅ Support multiple platforms (Meta, Google, TikTok)
- ✅ NO new .md files except specs and feedback

## Changelog
* 2.0 (2025-10-15) — ACTIVE: Ads performance tracking
* 1.0 (2025-10-15) — Placeholder
