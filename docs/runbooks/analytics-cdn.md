# Analytics CDN Integration

## Overview

Configure CDN caching for static analytics exports to reduce server load.

**Recommended CDN**: Cloudflare or Fly.io Edge

## Cacheable Endpoints

1. **Static Exports**: `/api/analytics/export` (CSV/JSON files)
2. **Daily Snapshots**: Files in `artifacts/analytics/snapshots/`
3. **Historical Reports**: Files in `artifacts/analytics/reports/`

## Cache Headers

```typescript
// For static exports
{
  "Cache-Control": "public, max-age=3600, s-maxage=7200",
  "CDN-Cache-Control": "max-age=7200",
  "Vary": "Accept-Encoding"
}

// For dynamic metrics (short cache)
{
  "Cache-Control": "public, max-age=300, must-revalidate",
  "CDN-Cache-Control": "max-age=300"
}
```

## Configuration

See deployment documentation for CDN setup instructions.
