# Direction: content

> Location: `docs/directions/content.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15

---

## Status: ACTIVE

## 1) Purpose
Build content performance tracking for future HITL social posting.

## 2) Today's Objective (2025-10-15)

**Status:** Build Content Performance Tracking
**Priority:** P2 - Growth Preparation
**Branch:** `agent/content/performance-tracking`

### Current Task: Content Performance Data Structure

**Steps:**
1. Create feedback file: `mkdir -p feedback/content && echo "# Content 2025-10-15" > feedback/content/2025-10-15.md`
2. Build content tracking in `app/lib/content/tracking.ts`:
   - Engagement rate (likes + comments + shares / impressions)
   - Reach and impressions
   - Click-through rate
   - Conversion tracking
3. Create data structure for content posts
4. Create API route: `app/routes/api/content.performance.ts`
5. Document in `docs/specs/content_tracking.md`
6. Create PR

**Allowed paths:** `app/lib/content/*, app/routes/api/content.*, docs/specs/*, feedback/content/*`

### Blockers:
None

### Critical:
- ✅ Support multiple platforms (Instagram, Facebook, TikTok)
- ✅ Engagement metrics must be accurate
- ✅ NO new .md files except specs and feedback

## Changelog
* 2.0 (2025-10-15) — ACTIVE: Content performance tracking
* 1.0 (2025-10-15) — Placeholder
