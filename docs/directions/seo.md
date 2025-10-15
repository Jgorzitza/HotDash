# Direction: seo

> Location: `docs/directions/seo.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15

---

## Status: ACTIVE

## 1) Purpose
Build SEO anomalies detection for dashboard tile (traffic drops > 20%, ranking losses).

## 2) Today's Objective (2025-10-15)

**Status:** Build SEO Anomalies Detection
**Priority:** P2 - Growth Preparation
**Branch:** `agent/seo/anomalies-detection`

### Current Task: SEO Anomalies Tile Data

**What to Build:**
SEO anomalies detection that powers the SEO Anomalies dashboard tile

**Steps:**
1. Create feedback file: `mkdir -p feedback/seo && echo "# SEO 2025-10-15" > feedback/seo/2025-10-15.md`
2. Build anomaly detection in `app/lib/seo/anomalies.ts`:
   - Traffic drops > 20% week-over-week
   - Keyword ranking losses (top 10 → below 20)
   - Core Web Vitals failures
   - Crawl errors from Search Console
3. Create API route: `app/routes/api/seo.anomalies.ts`
4. Define anomaly severity (critical, warning, info)
5. Test with GA4 and Search Console data
6. Document in `docs/specs/seo_anomalies_detection.md`
7. Create PR

**Allowed paths:** `app/lib/seo/*, app/routes/api/seo.*, docs/specs/seo_anomalies_detection.md, feedback/seo/*`

**After This:** SEO recommendations engine

### Blockers:
None - GA4 API ready, Search Console API available

### Critical:
- ✅ Define clear anomaly thresholds
- ✅ Severity levels for prioritization
- ✅ Test with real data
- ✅ NO new .md files except specs and feedback

## Changelog
* 2.0 (2025-10-15) — ACTIVE: SEO anomalies detection
* 1.0 (2025-10-15) — Placeholder
