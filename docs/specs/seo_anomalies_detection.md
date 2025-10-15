# SEO Anomalies Detection Specification

**Version:** 1.0  
**Author:** seo agent  
**Date:** 2025-10-15  
**Status:** Initial Implementation

---

## Overview

Comprehensive SEO anomaly detection system that monitors multiple signals and classifies issues by severity for the HotDash dashboard SEO tile.

## Purpose

Enable operators to quickly identify and respond to SEO issues that could impact organic traffic and revenue within a 48-hour resolution window.

## Scope

### In Scope
- Traffic anomaly detection (GA4)
- Keyword ranking monitoring (Search Console)
- Core Web Vitals tracking (PageSpeed/CrUX)
- Crawl error detection (Search Console)
- Severity classification (critical, warning, info)
- Dashboard tile integration

### Out of Scope (Future)
- Automated SEO fixes
- Content recommendations
- Backlink monitoring
- Competitor analysis

---

## Anomaly Types

### 1. Traffic Anomalies
**Source:** Google Analytics 4  
**Detection:** Week-over-week session comparison per landing page

**Thresholds:**
- **Critical:** ≥ 40% drop in sessions
- **Warning:** 20-40% drop in sessions
- **Info:** < 20% drop (not flagged)

**Data Structure:**
```typescript
interface TrafficAnomalyInput {
  landingPage: string;
  currentSessions: number;
  previousSessions: number;
  wowDelta: number; // -0.40 = -40%
}
```

**Example:**
```json
{
  "id": "traffic-products-hot-rods",
  "type": "traffic",
  "severity": "critical",
  "title": "Traffic drop on /products/hot-rods",
  "description": "Sessions dropped 45% week-over-week",
  "metric": {
    "current": 550,
    "previous": 1000,
    "change": -450,
    "changePercent": -0.45
  },
  "affectedUrl": "/products/hot-rods",
  "detectedAt": "2025-10-15T10:30:00Z"
}
```

### 2. Ranking Anomalies
**Source:** Google Search Console  
**Detection:** Position changes for tracked keywords

**Thresholds:**
- **Critical:** Dropped ≥ 10 positions
- **Warning:** Dropped 5-10 positions
- **Info:** Dropped < 5 positions (not flagged)

**Data Structure:**
```typescript
interface RankingAnomalyInput {
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  url: string;
  searchVolume?: number;
}
```

**Example:**
```json
{
  "id": "ranking-custom-hot-rods",
  "type": "ranking",
  "severity": "critical",
  "title": "Ranking drop for \"custom hot rods\"",
  "description": "Dropped from position 3 to 15",
  "metric": {
    "current": 15,
    "previous": 3,
    "change": 12
  },
  "affectedUrl": "/collections/custom-builds",
  "detectedAt": "2025-10-15T10:30:00Z",
  "evidence": {
    "query": "custom hot rods"
  }
}
```

### 3. Core Web Vitals Anomalies
**Source:** PageSpeed Insights API / Chrome UX Report  
**Detection:** Metrics exceeding Google's thresholds

**Thresholds:**

**LCP (Largest Contentful Paint):**
- **Good:** ≤ 2.5s
- **Needs Improvement:** 2.5s - 4.0s (warning)
- **Poor:** > 4.0s (critical)

**FID (First Input Delay):**
- **Good:** ≤ 100ms
- **Needs Improvement:** 100ms - 300ms (warning)
- **Poor:** > 300ms (critical)

**CLS (Cumulative Layout Shift):**
- **Good:** ≤ 0.1
- **Needs Improvement:** 0.1 - 0.25 (warning)
- **Poor:** > 0.25 (critical)

**Data Structure:**
```typescript
interface VitalsAnomalyInput {
  url: string;
  metric: 'LCP' | 'FID' | 'CLS';
  value: number;
  threshold: number;
  device: 'mobile' | 'desktop';
}
```

**Example:**
```json
{
  "id": "vitals-LCP-products-hot-rods",
  "type": "vitals",
  "severity": "critical",
  "title": "Largest Contentful Paint failure",
  "description": "LCP is 4500ms (threshold: 4000ms)",
  "metric": {
    "current": 4500,
    "previous": 4000
  },
  "affectedUrl": "/products/hot-rods",
  "detectedAt": "2025-10-15T10:30:00Z",
  "evidence": {
    "device": "mobile"
  }
}
```

### 4. Crawl Error Anomalies
**Source:** Google Search Console  
**Detection:** 404s, 5xx errors, robots.txt blocks

**Thresholds:**
- **Critical:** ≥ 10 errors
- **Warning:** 3-10 errors
- **Info:** < 3 errors (not flagged)

**Data Structure:**
```typescript
interface CrawlErrorInput {
  url: string;
  errorType: string; // '404', '500', 'robots_blocked', etc.
  errorCount: number;
  lastDetected: string;
}
```

**Example:**
```json
{
  "id": "crawl-products-discontinued",
  "type": "crawl",
  "severity": "warning",
  "title": "Crawl errors on /products/discontinued",
  "description": "5 404 errors detected",
  "metric": {
    "current": 5
  },
  "affectedUrl": "/products/discontinued",
  "detectedAt": "2025-10-15T10:30:00Z"
}
```

---

## API Specification

### Endpoint
```
GET /api/seo/anomalies
```

### Query Parameters
- `shop` (optional): Shopify domain (default: 'default-shop.myshopify.com')

### Response Format
```typescript
{
  success: boolean;
  data: {
    anomalies: SEOAnomaly[];      // All anomalies
    critical: SEOAnomaly[];       // Critical only
    warning: SEOAnomaly[];        // Warning only
    info: SEOAnomaly[];           // Info only
    summary: {
      total: number;
      criticalCount: number;
      warningCount: number;
      infoCount: number;
    };
  };
  metadata: {
    shopDomain: string;
    timestamp: string;
    sources: {
      traffic: 'fresh' | 'cache' | 'mock';
      ranking: 'fresh' | 'cache' | 'mock';
      vitals: 'fresh' | 'cache' | 'mock';
      crawl: 'fresh' | 'cache' | 'mock';
    };
  };
}
```

### Example Response
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "id": "traffic-products-hot-rods",
        "type": "traffic",
        "severity": "critical",
        "title": "Traffic drop on /products/hot-rods",
        "description": "Sessions dropped 45% week-over-week",
        "metric": {
          "current": 550,
          "previous": 1000,
          "change": -450,
          "changePercent": -0.45
        },
        "affectedUrl": "/products/hot-rods",
        "detectedAt": "2025-10-15T10:30:00Z"
      }
    ],
    "critical": [...],
    "warning": [...],
    "info": [],
    "summary": {
      "total": 3,
      "criticalCount": 1,
      "warningCount": 2,
      "infoCount": 0
    }
  },
  "metadata": {
    "shopDomain": "hotrodan.myshopify.com",
    "timestamp": "2025-10-15T10:30:00Z",
    "sources": {
      "traffic": "fresh",
      "ranking": "mock",
      "vitals": "mock",
      "crawl": "mock"
    }
  }
}
```

---

## Implementation Details

### File Structure
```
app/lib/seo/
  └── anomalies.ts          # Core detection logic

app/routes/
  └── api.seo.anomalies.ts  # API route handler

docs/specs/
  └── seo_anomalies_detection.md  # This file
```

### Dependencies
- `app/services/ga/ingest.ts` - GA4 traffic data
- Google Search Console API (future)
- PageSpeed Insights API (future)

### Current Implementation Status

**✅ Implemented:**
- Traffic anomaly detection (GA4)
- Severity classification
- API route with aggregation
- TypeScript types and interfaces

**🚧 Mock/Placeholder:**
- Keyword ranking detection (returns empty array)
- Core Web Vitals detection (returns empty array)
- Crawl error detection (returns empty array)

**📋 Future Work:**
- Google Search Console API integration
- PageSpeed Insights API integration
- Caching strategy (5-minute TTL)
- Dashboard tile component updates
- Alert notifications for critical anomalies

---

## Testing Strategy

### Unit Tests
- Test each detection function with sample data
- Verify threshold calculations
- Validate severity classification
- Test aggregation logic

### Integration Tests
- Test API route with mock GA data
- Verify response format
- Test error handling

### Manual Testing
```bash
# Test API endpoint
curl http://localhost:3000/api/seo/anomalies?shop=test-shop.myshopify.com

# Expected: JSON response with anomalies array
```

---

## Performance Targets

- **API Response Time:** < 500ms P95
- **Cache TTL:** 5 minutes (configurable)
- **Data Freshness:** Real-time for traffic, hourly for rankings/vitals

---

## Rollback Plan

If issues detected:
1. Revert API route changes
2. Dashboard tile falls back to existing `getLandingPageAnomalies()`
3. No data loss (read-only operations)

---

## Success Metrics

- **Detection Accuracy:** > 95% true positive rate
- **Resolution Time:** 100% of critical anomalies addressed within 48h
- **False Positive Rate:** < 5%

---

## Future Enhancements

1. **Search Console Integration**
   - Real ranking data
   - Crawl error monitoring
   - Index coverage reports

2. **Core Web Vitals Integration**
   - PageSpeed Insights API
   - Chrome UX Report (CrUX) data
   - Field vs lab data comparison

3. **Automated Recommendations**
   - Content optimization suggestions
   - Technical SEO fixes
   - Priority ranking for fixes

4. **Historical Trending**
   - 30-day anomaly history
   - Pattern recognition
   - Seasonal adjustment

---

## References

- Google Analytics 4 API: https://developers.google.com/analytics/devguides/reporting/data/v1
- Google Search Console API: https://developers.google.com/webmaster-tools/search-console-api-original
- Core Web Vitals: https://web.dev/vitals/
- PageSpeed Insights API: https://developers.google.com/speed/docs/insights/v5/get-started

