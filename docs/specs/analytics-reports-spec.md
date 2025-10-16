# Analytics Reports Specification

**Version:** 1.0
**Last Updated:** 2025-10-15
**Owner:** Analytics Agent

---

## Overview

Comprehensive analytics reporting system built on GA4 API with custom reports, exports, and dashboards.

---

## Core Reports

### 1. Revenue Report
**Endpoint:** `/api/analytics/revenue`
**Metrics:** Total revenue, AOV, transactions, trends
**Period:** Last 30 days with previous period comparison
**Export:** CSV available via `/api/analytics/export?type=revenue`

### 2. Traffic Report
**Endpoint:** `/api/analytics/traffic`
**Metrics:** Sessions, users, organic %, trends by source
**Breakdown:** Organic, paid, direct, referral, social
**Export:** CSV available via `/api/analytics/export?type=traffic`

### 3. Conversion Funnel Report
**Endpoint:** `/analytics/funnels`
**Metrics:** Funnel steps, drop-off rates, completion rate
**Funnels:** E-commerce (5 steps), Signup (5 steps)
**Features:** Visual funnel, optimization recommendations

### 4. Product Performance Report
**Endpoint:** Products API
**Metrics:** Views, add-to-cart rate, purchase rate, revenue
**Limit:** Top 50 products by revenue
**Export:** CSV available via `/api/analytics/export?type=products`

### 5. Landing Page Report
**Endpoint:** `/analytics/landing-pages`
**Metrics:** Sessions, bounce rate, conversions, revenue
**Limit:** Top 50 landing pages
**Features:** Revenue per session, conversion rate

### 6. UTM Campaign Report
**Endpoint:** UTM API
**Metrics:** Sessions, users, conversions, revenue by UTM
**Dimensions:** Source, medium, campaign
**Export:** CSV available via `/api/analytics/export?type=utm`

### 7. SEO Performance Report
**Endpoint:** SEO API
**Metrics:** Organic sessions, users, revenue, conversions
**Features:** Top organic landing pages, conversion rate

### 8. Device & Geo Report
**Endpoint:** Demographics API
**Metrics:** Sessions, users, conversions by device/location
**Dimensions:** Device category, OS, browser, country, city

### 9. Exit Page Report
**Endpoint:** Exit Pages API
**Metrics:** Exits, exit rate, page views
**Limit:** Top 20 exit pages

### 10. Engagement Report
**Endpoint:** Engagement API
**Metrics:** Time on page, engagement rate, engaged sessions

---

## Custom Reports

### Report Builder
**File:** `app/lib/analytics/reports.ts`
**Features:** Flexible dimensions and metrics
**Templates:** 4 predefined templates

**Available Dimensions:**
- pagePath, pageTitle
- sessionSource, sessionMedium, sessionCampaignName
- deviceCategory, operatingSystem, browser
- country, city
- date, cohort

**Available Metrics:**
- sessions, totalUsers, conversions, totalRevenue
- bounceRate, averageSessionDuration
- screenPageViews, exits
- engagementRate, engagedSessions

---

## Export Formats

### CSV Export
**Endpoint:** `/api/analytics/export?type={reportType}`
**Types:** revenue, traffic, products, utm
**Format:** Standard CSV with headers
**Filename:** `analytics-{type}-{date}.csv`

---

## Caching Strategy

**TTL:** 5 minutes for core metrics
**Cache Keys:** `analytics:{metric}:30d`
**Metrics Tracked:** Cache hit/miss rates via Prometheus

---

## Performance Targets

- **API Latency:** <500ms P95
- **Cache Hit Rate:** >80%
- **Success Rate:** >99%
- **Quota Usage:** <50% of daily limit

---

## Error Handling

**Quota Exceeded:** Exponential backoff with 3 retries
**Sampling Detected:** Warning logged, metric tracked
**API Errors:** HTTP 500 with error message

---

## Testing

**Test Suite:** `scripts/test-all-analytics.mjs`
**Coverage:** 7 core report types
**Real Data:** Verified with property 339826228

---

## Future Enhancements

1. Real-time reports (live user count)
2. Scheduled report delivery (email)
3. Custom date range selection
4. Report scheduling and automation
5. Advanced filtering and segmentation

