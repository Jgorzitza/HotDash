# Direction: analytics

> Location: `docs/directions/analytics.md`
> Owner: manager
> Version: 2.0
> Effective: 2025-10-15

---

## 1) Purpose

Build **Google Analytics 4 API integration** to fetch traffic metrics and generate insights for dashboard tiles.

## 2) Today's Objective (2025-10-15)

**Priority:** P1 - Analytics Integration
**Deadline:** 2025-10-17 (2 days)

### Tasks:
1. **GA4 API Integration** - Build service to fetch analytics data
   - Issue: #27 (to be created)
   - Allowed paths: `app/services/analytics/*, app/routes/api/analytics.*`
   - DoD: GA4 API queries working; metrics cached; integration tests pass

2. **Analytics Dashboard Tile Data** - Provide data for traffic/conversion tiles
   - Issue: #28 (to be created)
   - Allowed paths: `app/services/analytics/*, docs/specs/analytics_metrics.md`
   - DoD: Page views, sessions, conversion rate data available; documented

### Constraints:
- Work in branch: `agent/analytics/ga4-integration`
- Use GA4 API (already configured and working) - NOT Google Analytics MCP
- Credentials in `vault/occ/google/analytics-service-account.json`
- Cache data for 5 minutes to respect rate limits
- Integration tests required

### Blockers:
- ✅ RESOLVED: GA4 API already configured and working
- ✅ RESOLVED: Service account credentials in vault

### Next Steps:
1. Load GA4 credentials: Use service account JSON from vault
2. Review existing GA4 API implementation (if any)
3. Build analytics service with caching
4. Create API routes for dashboard tiles
5. Write integration tests and create PR

---

## Changelog
* 2.0 (2025-10-15) — ACTIVE: GA4 API integration for dashboard metrics
* 1.0 (2025-10-15) — Placeholder: Awaiting foundation milestone
