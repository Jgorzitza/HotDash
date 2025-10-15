# SEO Anomalies Detection Specification

**Version:** 1.0  
**Author:** seo agent  
**Date:** 2025-10-15  
**Status:** Initial Implementation

## Overview

Comprehensive SEO anomaly detection system that monitors multiple signals and classifies issues by severity for the HotDash dashboard SEO tile.

## Anomaly Types

### 1. Traffic Anomalies (GA4)
- **Critical:** ≥ 40% drop in sessions
- **Warning:** 20-40% drop in sessions

### 2. Ranking Anomalies (Search Console)
- **Critical:** Dropped ≥ 10 positions
- **Warning:** Dropped 5-10 positions

### 3. Core Web Vitals
- **LCP:** Good ≤ 2.5s, Poor > 4.0s
- **FID:** Good ≤ 100ms, Poor > 300ms
- **CLS:** Good ≤ 0.1, Poor > 0.25

### 4. Crawl Errors (Search Console)
- **Critical:** ≥ 10 errors
- **Warning:** 3-10 errors

## API Endpoint

```
GET /api/seo/anomalies?shop={shopDomain}
```

## Implementation Status

**✅ Implemented:**
- Traffic anomaly detection (GA4)
- Severity classification
- API route with aggregation
- TypeScript types and interfaces
- Unit tests

**🚧 Mock/Placeholder:**
- Keyword ranking detection
- Core Web Vitals detection
- Crawl error detection

## Files

- `app/lib/seo/anomalies.ts` - Core detection logic
- `app/routes/api.seo.anomalies.ts` - API route handler
- `tests/unit/seo.anomalies.spec.ts` - Unit tests

## Future Work

- Google Search Console API integration
- PageSpeed Insights API integration
- Caching strategy (5-minute TTL)
- Dashboard tile component updates
