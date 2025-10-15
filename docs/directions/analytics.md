# Direction: analytics

> Location: `docs/directions/analytics.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15

---

## Status: ACTIVE

## 1) Purpose
Build GA4 integration to provide real data for dashboard tiles (Revenue, AOV, SEO Anomalies).

## 2) Today's Objective (2025-10-15)

**Status:** Provide Real Data for Dashboard Tiles
**Priority:** P2 - Growth Preparation
**Branch:** `agent/analytics/ga4-dashboard`

### Current Task: GA4 Integration for Dashboard

**Completed Work (from feedback):**
- ✅ GA4 integration work complete
- ✅ Property ID: 339826228 (in vault)

**What to Do Now:**
Build GA4 API integration to provide real data for dashboard tiles

**Steps:**
1. Update feedback file: `echo "# Analytics 2025-10-15 Continued" >> feedback/analytics/2025-10-15-deployment-status.md`
2. Load GA4 credentials: `cat vault/occ/google/analytics-property-id.env`
3. Build GA4 API integration in `app/lib/analytics/ga4.ts`:
   - Revenue (last 30 days, trend)
   - Sessions (organic traffic for SEO tile)
   - Conversion rate
4. Create API routes:
   - `app/routes/api/analytics.revenue.ts`
   - `app/routes/api/analytics.traffic.ts`
5. Test with real GA4 data
6. Document in `docs/specs/ga4_integration.md`
7. Create PR

**Allowed paths:** `app/lib/analytics/*, app/routes/api/analytics.*, docs/specs/ga4_integration.md, feedback/analytics/*`

**After This:** SEO anomalies detection

### Blockers:
None - GA4 API configured, property ID in vault

### Critical:
- ✅ Use GA4 API (not Google Analytics MCP)
- ✅ Property ID: 339826228
- ✅ Test with real data
- ✅ NO new .md files except specs and feedback

## Changelog
* 2.0 (2025-10-15) — ACTIVE: GA4 dashboard integration
* 1.0 (2025-10-15) — Placeholder
