# SEO Anomaly Triage & Response Runbook

**Version:** 1.0  
**Author:** SEO Agent  
**Date:** 2025-10-20  
**Status:** Production  
**Parent Spec:** `docs/specs/seo_anomalies_detection.md`

---

## Purpose

This runbook provides step-by-step triage procedures for SEO anomalies detected by the HotDash SEO monitoring system. It integrates with Supabase views, alerts, and the HITL approvals workflow.

---

## Quick Reference

| Severity | Response Time | Owner         | Escalation Path |
| -------- | ------------- | ------------- | --------------- |
| Critical | 2 hours       | SEO + Product | Manager → CEO   |
| Warning  | 24 hours      | SEO           | SEO → Manager   |
| Info     | 7 days        | SEO           | (none)          |

---

## Detection Sources

### Supabase Views

```sql
-- Traffic anomalies (GA4)
SELECT * FROM seo_traffic_anomalies
WHERE severity IN ('critical', 'warning')
  AND detected_at > NOW() - INTERVAL '7 days'
ORDER BY severity DESC, metric_change_percent ASC;

-- Ranking anomalies (Search Console)
SELECT * FROM seo_ranking_anomalies
WHERE position_drop >= 5
  AND detected_at > NOW() - INTERVAL '7 days'
ORDER BY position_drop DESC;

-- Core Web Vitals failures
SELECT * FROM seo_vitals_anomalies
WHERE metric_value > threshold
  AND device = 'mobile'
ORDER BY severity DESC;

-- Crawl errors
SELECT * FROM seo_crawl_errors
WHERE error_count >= 3
  AND last_detected > NOW() - INTERVAL '3 days'
ORDER BY error_count DESC;
```

### Dashboard Tile

Navigate to: **Dashboard → SEO Tile → Anomalies**

API Endpoint: `GET /api/seo/anomalies?shop={shopDomain}`

### Alerts

Supabase alerts trigger when:

- Critical anomalies detected (traffic drop ≥40%, ranking drop ≥10 positions)
- Web Vitals failures (LCP >4s, CLS >0.25)
- Crawl errors ≥10 on high-traffic pages

---

## Triage Workflows

### 1. Traffic Anomalies (Critical: ≥40% drop)

**Detection:**

```sql
SELECT landing_page, current_sessions, previous_sessions, wow_delta
FROM seo_traffic_anomalies
WHERE wow_delta <= -0.40
  AND detected_at > NOW() - INTERVAL '24 hours';
```

**Triage Steps:**

1. **Verify Data Accuracy** (5 min)
   - [ ] Check GA4 directly for the affected landing page
   - [ ] Confirm week-over-week comparison is valid (not holiday, campaign spike)
   - [ ] Rule out tracking issues (GA4 tag firing, ad blockers)

2. **Identify Root Cause** (15 min)
   - [ ] **Technical Issues:** Server errors (5xx), page load failures, CDN issues
   - [ ] **SEO Changes:** Google algorithm update, ranking losses, de-indexing
   - [ ] **Competitive:** New competitor ranking, SERP feature change
   - [ ] **Content:** Page removed/redirected, content quality drop
   - [ ] **Seasonal:** Expected traffic pattern (verify historical data)

3. **Gather Evidence** (10 min)
   - [ ] Screenshot GA4 traffic graph (7-day, 30-day views)
   - [ ] Export Search Console data (queries, impressions, clicks, position)
   - [ ] Check PageSpeed Insights for performance regressions
   - [ ] Verify Shopify product/collection still active and published

4. **Prepare HITL Recommendation** (15 min)

   **Template:**

   ```json
   {
     "type": "seo_traffic_recovery",
     "severity": "critical",
     "affectedUrl": "/products/hot-rods",
     "issue": "Traffic dropped 45% WoW (1000 → 550 sessions)",
     "rootCause": "Ranking dropped from position 3 to 15 for 'custom hot rods'",
     "evidence": {
       "ga4ScreenshotUrl": "https://...",
       "searchConsoleExportUrl": "https://...",
       "keywordRankingChange": "3 → 15 (-12 positions)"
     },
     "recommendation": {
       "action": "Optimize on-page content for 'custom hot rods' keyword",
       "changes": [
         "Update H1 to include 'custom hot rods'",
         "Add keyword to first paragraph",
         "Optimize meta description (current: 140 chars, target: 155-160)"
       ],
       "estimatedImpact": "Recover 30-50% traffic within 2-4 weeks",
       "rollbackPlan": "Revert content changes if CTR drops >10% within 7 days"
     },
     "approval": {
       "requiredReviewers": ["product", "content"],
       "urgency": "high",
       "deadline": "2025-10-22T00:00:00Z"
     }
   }
   ```

5. **Submit for Approval** (5 min)
   - [ ] Log recommendation in `feedback/seo/<YYYY-MM-DD>.md`
   - [ ] Tag Product + Content agents for review
   - [ ] Set 2-hour response SLA

6. **Monitor Recovery** (ongoing)
   - [ ] Check GA4 daily for 7 days post-implementation
   - [ ] Track ranking position daily (Search Console API)
   - [ ] Log recovery metrics in feedback file

**Escalation:**

- No response from Product/Content within 2 hours → Escalate to Manager
- Traffic drop continues for 48 hours → Escalate to CEO

---

### 2. Ranking Anomalies (Critical: ≥10 position drop)

**Detection:**

```sql
SELECT keyword, current_position, previous_position, url
FROM seo_ranking_anomalies
WHERE (current_position - previous_position) >= 10
  AND detected_at > NOW() - INTERVAL '24 hours';
```

**Triage Steps:**

1. **Verify Ranking Change** (5 min)
   - [ ] Confirm in Search Console (Performance → Queries)
   - [ ] Check multiple date ranges (7d, 28d, 90d)
   - [ ] Rule out data lag or API sync issues

2. **Identify Cause** (15 min)
   - [ ] **Algorithm Update:** Check Google Search Central, SEO news (Moz, Search Engine Land)
   - [ ] **Technical:** Check for accidental noindex, canonical issues, robots.txt blocks
   - [ ] **Content:** Page removed, content changed dramatically, duplicate content
   - [ ] **Backlinks:** Lost high-authority backlinks, link spam penalty
   - [ ] **Competition:** Competitor optimized for same keyword

3. **Gather Evidence** (10 min)
   - [ ] Search Console screenshot (keyword query performance)
   - [ ] Manual Google search (incognito) for keyword
   - [ ] Wayback Machine check (content changes)
   - [ ] Backlink profile check (Ahrefs/Moz if available)

4. **Prepare HITL Recommendation** (15 min)

   **Template:**

   ```json
   {
     "type": "seo_ranking_recovery",
     "severity": "critical",
     "keyword": "custom hot rods",
     "affectedUrl": "/collections/custom-builds",
     "issue": "Ranking dropped from position 3 to 15 (-12 positions)",
     "rootCause": "Competitor optimized page + Google algorithm update (Oct 10 Core Update)",
     "evidence": {
       "searchConsoleScreenshotUrl": "https://...",
       "manualSearchResultUrl": "https://...",
       "competitorUrl": "https://competitor.com/custom-hot-rods"
     },
     "recommendation": {
       "action": "Content optimization + technical SEO fixes",
       "changes": [
         "Expand content from 400 to 800+ words",
         "Add schema markup (Product, Breadcrumbs)",
         "Optimize images (alt text, file names)",
         "Internal linking from blog posts"
       ],
       "estimatedImpact": "Recover 5-7 positions within 3-6 weeks",
       "rollbackPlan": "Monitor CTR; if drops >15%, revert to previous content"
     },
     "approval": {
       "requiredReviewers": ["product", "content"],
       "urgency": "high",
       "deadline": "2025-10-22T00:00:00Z"
     }
   }
   ```

5. **Keyword Cannibalization Check** (10 min)
   - [ ] Query Supabase: Check if multiple pages rank for same keyword
   - [ ] Coordinate with Ads agent: Avoid bidding on organic-ranking keywords
   - [ ] Coordinate with Content agent: Consolidate duplicate content

   ```sql
   SELECT url, keyword, position
   FROM seo_rankings
   WHERE keyword = 'custom hot rods'
     AND position <= 20
   ORDER BY position ASC;
   ```

6. **Submit for Approval & Monitor**
   - [ ] Log in feedback file
   - [ ] Tag Product + Content + Ads for coordination
   - [ ] Monitor daily for 14 days

---

### 3. Core Web Vitals Anomalies (Critical: LCP >4s, CLS >0.25)

**Detection:**

```sql
SELECT url, metric, value, threshold, device
FROM seo_vitals_anomalies
WHERE severity = 'critical'
  AND detected_at > NOW() - INTERVAL '24 hours';
```

**Triage Steps:**

1. **Verify Performance Issue** (5 min)
   - [ ] Run PageSpeed Insights manually for affected URL
   - [ ] Test on mobile device (if mobile anomaly)
   - [ ] Check CDN health, Shopify status page

2. **Identify Cause** (15 min)
   - [ ] **LCP Issues:** Large images, slow server response, render-blocking JS/CSS
   - [ ] **FID Issues:** JavaScript execution time, third-party scripts
   - [ ] **CLS Issues:** Images without dimensions, dynamic content injection, web fonts

3. **Gather Evidence** (10 min)
   - [ ] PageSpeed Insights screenshot (mobile + desktop)
   - [ ] Chrome DevTools performance trace
   - [ ] Network waterfall (identify slow resources)

4. **Prepare HITL Recommendation** (15 min)

   **Template:**

   ```json
   {
     "type": "seo_web_vitals_fix",
     "severity": "critical",
     "metric": "LCP",
     "affectedUrl": "/products/hot-rods",
     "issue": "LCP is 4.5s (threshold: 4.0s) on mobile",
     "rootCause": "Hero image (2.5MB) not optimized, render-blocking CSS",
     "evidence": {
       "pageSpeedInsightsUrl": "https://pagespeed.web.dev/...",
       "performanceTraceUrl": "https://..."
     },
     "recommendation": {
       "action": "Image optimization + CSS optimization",
       "changes": [
         "Compress hero image to WebP format (<200KB)",
         "Add width/height attributes to images",
         "Defer non-critical CSS",
         "Preload LCP image"
       ],
       "estimatedImpact": "LCP reduction to 2.5s (-2.0s)",
       "rollbackPlan": "Monitor CWV daily; if LCP regresses, revert image changes"
     },
     "approval": {
       "requiredReviewers": ["engineer", "designer"],
       "urgency": "high",
       "deadline": "2025-10-23T00:00:00Z"
     }
   }
   ```

5. **Coordinate with Engineer + Designer**
   - [ ] Tag Engineer for technical implementation
   - [ ] Tag Designer if image/layout changes needed
   - [ ] Request web vitals adapter test run

6. **Post-Fix Verification** (ongoing)
   - [ ] Run contract test: `npx vitest run tests/unit/seo.web-vitals.spec.ts`
   - [ ] Monitor CrUX data (field data, 28-day average)
   - [ ] Log results in feedback file

---

### 4. Crawl Error Anomalies (Critical: ≥10 errors)

**Detection:**

```sql
SELECT url, error_type, error_count, last_detected
FROM seo_crawl_errors
WHERE error_count >= 10
  AND last_detected > NOW() - INTERVAL '7 days';
```

**Triage Steps:**

1. **Verify Crawl Errors** (5 min)
   - [ ] Check Search Console (Index → Pages → Not Found / Server Error)
   - [ ] Test URLs manually (404, 500, 503 status codes)
   - [ ] Check robots.txt, sitemaps

2. **Identify Cause** (10 min)
   - [ ] **404 Errors:** Deleted products/pages, broken internal links, old backlinks
   - [ ] **500 Errors:** Server issues, database errors, app crashes
   - [ ] **Robots Blocked:** Accidental disallow in robots.txt, meta noindex

3. **Gather Evidence** (5 min)
   - [ ] Search Console screenshot (crawl errors report)
   - [ ] List of affected URLs (export CSV)
   - [ ] HTTP status code verification

4. **Prepare HITL Recommendation** (10 min)

   **Template:**

   ```json
   {
     "type": "seo_crawl_error_fix",
     "severity": "critical",
     "errorType": "404",
     "affectedUrls": [
       "/products/discontinued-model-1",
       "/products/discontinued-model-2"
     ],
     "issue": "15 404 errors on discontinued product pages",
     "rootCause": "Products deleted without 301 redirects to similar products",
     "evidence": {
       "searchConsoleExportUrl": "https://...",
       "affectedUrlsCsv": "https://..."
     },
     "recommendation": {
       "action": "Implement 301 redirects to active products",
       "changes": [
         "Redirect /products/discontinued-model-1 → /collections/hot-rods",
         "Redirect /products/discontinued-model-2 → /products/similar-model",
         "Update internal links to removed pages",
         "Update sitemap to exclude deleted pages"
       ],
       "estimatedImpact": "Eliminate 404 errors, preserve link equity",
       "rollbackPlan": "Monitor 404 rate for 7 days; if increases, review redirects"
     },
     "approval": {
       "requiredReviewers": ["engineer", "product"],
       "urgency": "high",
       "deadline": "2025-10-23T00:00:00Z"
     }
   }
   ```

5. **Coordinate with Engineer + Product**
   - [ ] Tag Engineer for redirect implementation
   - [ ] Tag Product for content mapping decisions
   - [ ] Request post-fix validation

6. **Post-Fix Verification**
   - [ ] Verify redirects work (301 status codes)
   - [ ] Re-submit sitemap to Search Console
   - [ ] Monitor crawl error count for 14 days

---

## Keyword Cannibalization Prevention

**Problem:** Multiple pages competing for the same keyword reduces overall ranking power.

**Coordination with Ads + Content:**

1. **Detection Query:**

   ```sql
   SELECT keyword, COUNT(DISTINCT url) as page_count
   FROM seo_rankings
   WHERE position <= 20
   GROUP BY keyword
   HAVING COUNT(DISTINCT url) > 1
   ORDER BY page_count DESC;
   ```

2. **Triage Steps:**
   - [ ] Identify primary page (best traffic, conversion, authority)
   - [ ] Tag Content agent: Consolidate duplicate content onto primary page
   - [ ] Tag Ads agent: Exclude organic-ranking keywords from paid search campaigns
   - [ ] Implement canonical tags or 301 redirects

3. **Evidence Required:**
   - [ ] List of cannibalized keywords with URLs and positions
   - [ ] Traffic + conversion data for each competing page
   - [ ] Recommendation: Which page to prioritize, which to redirect/noindex

---

## Monitoring & Alerts

### Supabase Alerts Setup

**Critical Traffic Drops:**

```sql
CREATE OR REPLACE FUNCTION alert_critical_traffic_drops()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity = 'critical' AND NEW.type = 'traffic' THEN
    PERFORM pg_notify('seo_critical_alert',
      json_build_object(
        'id', NEW.id,
        'url', NEW.affected_url,
        'metric', NEW.metric,
        'detected_at', NEW.detected_at
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seo_traffic_alert
AFTER INSERT ON seo_traffic_anomalies
FOR EACH ROW EXECUTE FUNCTION alert_critical_traffic_drops();
```

**Web Vitals Failures:**

```sql
CREATE OR REPLACE FUNCTION alert_web_vitals_failures()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity = 'critical' AND NEW.metric IN ('LCP', 'CLS') THEN
    PERFORM pg_notify('seo_vitals_alert',
      json_build_object(
        'url', NEW.url,
        'metric', NEW.metric,
        'value', NEW.value,
        'device', NEW.device
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seo_vitals_alert
AFTER INSERT ON seo_vitals_anomalies
FOR EACH ROW EXECUTE FUNCTION alert_web_vitals_failures();
```

---

## Rollback Procedures

### Content Changes

1. Revert to previous version via Shopify version history
2. Monitor GA4 for 7 days post-revert
3. Log rollback decision + metrics in feedback file

### Technical Changes

1. Git revert commit (Engineer coordinates)
2. Deploy rollback to production
3. Verify metrics return to baseline within 24 hours

### Monitoring Post-Rollback

- Check SEO tile dashboard hourly for 24 hours
- Run contract tests: `npm run test:ci`
- Log all rollback evidence in `feedback/seo/<YYYY-MM-DD>.md`

---

## Success Criteria

- **Critical anomalies:** 100% triaged within 2 hours
- **Warning anomalies:** 100% triaged within 24 hours
- **HITL approvals:** 90%+ approval rate (low rejection rate = quality recommendations)
- **Recovery time:** 80% of critical issues resolved within 48 hours
- **False positive rate:** <5% (high-quality anomaly detection)

---

## Related Documentation

- **Detection Spec:** `docs/specs/seo_anomalies_detection.md`
- **SEO Pipeline:** `docs/specs/seo_pipeline.md` (future)
- **Approvals Workflow:** `docs/specs/approvals_drawer_spec.md`
- **Direction File:** `docs/directions/seo.md`
- **Feedback Log:** `feedback/seo/<YYYY-MM-DD>.md`

---

## Revision History

- **2025-10-20:** v1.0 - Initial production triage runbook with Supabase integration
