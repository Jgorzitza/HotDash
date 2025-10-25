# Performance Optimization Checklist for Launch

**Date:** 2025-10-24  
**Purpose:** Comprehensive performance optimization checklist for Hot Dash launch  
**Target:** Lighthouse Performance Score > 90, Core Web Vitals in "Good" range  

## Core Web Vitals Targets

### LCP (Largest Contentful Paint)
- **Target:** < 2.5 seconds
- **Good:** 0-2.5s
- **Needs Improvement:** 2.5-4.0s
- **Poor:** > 4.0s

### FID (First Input Delay)
- **Target:** < 100 milliseconds
- **Good:** 0-100ms
- **Needs Improvement:** 100-300ms
- **Poor:** > 300ms

### CLS (Cumulative Layout Shift)
- **Target:** < 0.1
- **Good:** 0-0.1
- **Needs Improvement:** 0.1-0.25
- **Poor:** > 0.25

### INP (Interaction to Next Paint)
- **Target:** < 200 milliseconds
- **Good:** 0-200ms
- **Needs Improvement:** 200-500ms
- **Poor:** > 500ms

## Optimization Checklist

### 1. Image Optimization ✅ (Partially Complete)

#### Current Status
- ✅ Preconnect to Shopify CDN
- ⏳ Need to add lazy loading
- ⏳ Need to implement responsive images
- ⏳ Need WebP format with fallbacks

#### Actions Required
```typescript
// Add to image components
<img
  src="/image.jpg"
  srcSet="/image-320w.jpg 320w, /image-640w.jpg 640w, /image-1280w.jpg 1280w"
  sizes="(max-width: 320px) 280px, (max-width: 640px) 600px, 1200px"
  alt="Descriptive alt text"
  loading="lazy"
  width="1200"
  height="630"
/>
```

#### Checklist
- [ ] Convert images to WebP format
- [ ] Create responsive image sizes (320w, 640w, 1280w)
- [ ] Add lazy loading to all images
- [ ] Set explicit width/height to prevent CLS
- [ ] Compress images (< 100KB for most)
- [ ] Use CDN for image delivery

### 2. Font Optimization ✅ (Complete)

#### Current Status
- ✅ Preconnect to Shopify CDN
- ✅ Using Inter font from Shopify
- ✅ Font loading optimized

#### Verification
```html
<link rel="preconnect" href="https://cdn.shopify.com/" />
<link rel="stylesheet" href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css" />
```

### 3. JavaScript Optimization ⏳

#### Actions Required
- [ ] Code splitting by route
- [ ] Lazy load non-critical components
- [ ] Defer non-critical scripts
- [ ] Minimize bundle size
- [ ] Remove unused dependencies
- [ ] Tree shaking enabled

#### React Router 7 Optimizations
```typescript
// Lazy load routes
const GrowthEngine = lazy(() => import('./routes/growth-engine'));
const Analytics = lazy(() => import('./routes/analytics'));

// Code splitting
export const routes = [
  {
    path: '/growth-engine',
    lazy: () => import('./routes/growth-engine'),
  },
];
```

### 4. CSS Optimization ⏳

#### Actions Required
- [ ] Remove unused CSS
- [ ] Inline critical CSS
- [ ] Defer non-critical CSS
- [ ] Minimize CSS files
- [ ] Use CSS modules for scoping

#### Critical CSS Pattern
```html
<head>
  <style>
    /* Inline critical CSS for above-the-fold content */
  </style>
  <link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
</head>
```

### 5. Resource Hints ⏳

#### Preconnect (Already Implemented)
```html
<link rel="preconnect" href="https://cdn.shopify.com/" />
```

#### Additional Hints Needed
```html
<!-- DNS Prefetch for external domains -->
<link rel="dns-prefetch" href="https://analytics.google.com" />

<!-- Preload critical resources -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/critical.css" as="style" />

<!-- Prefetch next-page resources -->
<link rel="prefetch" href="/growth-engine" />
```

### 6. Caching Strategy ✅ (Partially Complete)

#### Current Status
- ✅ Sitemap cached (1 hour)
- ✅ Robots.txt cached (24 hours)
- ⏳ Need static asset caching
- ⏳ Need API response caching

#### Cache Headers Needed
```typescript
// Static assets (1 year)
'Cache-Control': 'public, max-age=31536000, immutable'

// HTML pages (5 minutes)
'Cache-Control': 'public, max-age=300, must-revalidate'

// API responses (varies)
'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
```

### 7. Compression ⏳

#### Actions Required
- [ ] Enable gzip compression
- [ ] Enable Brotli compression (preferred)
- [ ] Compress text assets (HTML, CSS, JS, JSON)
- [ ] Verify compression in production

#### Fly.io Configuration
```toml
# fly.toml
[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1
  
  [http_service.concurrency]
    type = "requests"
    hard_limit = 250
    soft_limit = 200

  # Compression handled by Fly.io proxy
```

### 8. Server-Side Rendering ✅ (Complete)

#### Current Status
- ✅ React Router 7 with SSR
- ✅ Server-side data loading
- ✅ Streaming HTML responses

### 9. Database Query Optimization ⏳

#### Actions Required
- [ ] Add database indexes
- [ ] Optimize N+1 queries
- [ ] Use connection pooling
- [ ] Cache frequent queries
- [ ] Implement query timeouts

#### Supabase Optimization
```typescript
// Use select() to limit fields
const { data } = await supabase
  .from('orders')
  .select('id, total, created_at')
  .limit(10);

// Use indexes for common queries
// Add in Supabase dashboard or migration
```

### 10. Third-Party Scripts ⏳

#### Current Status
- ⏳ Google Analytics (if added)
- ⏳ Other tracking scripts

#### Optimization Strategy
```html
<!-- Defer third-party scripts -->
<script defer src="https://analytics.google.com/analytics.js"></script>

<!-- Or use async for non-critical -->
<script async src="https://tracking.example.com/script.js"></script>
```

## Lighthouse Audit Checklist

### Performance (Target: > 90)
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 200ms
- [ ] Cumulative Layout Shift < 0.1
- [ ] Speed Index < 3.4s

### SEO (Target: 100)
- [x] Meta description present
- [x] Title tag present
- [x] Crawlable links
- [x] Valid robots.txt
- [x] Valid sitemap.xml
- [ ] Mobile-friendly
- [ ] Structured data valid

### Accessibility (Target: > 95)
- [ ] Color contrast sufficient
- [ ] Alt text on images
- [ ] ARIA labels where needed
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] Semantic HTML

### Best Practices (Target: 100)
- [x] HTTPS enabled
- [x] No console errors
- [ ] Images have correct aspect ratio
- [ ] No deprecated APIs
- [ ] Secure cookies
- [ ] CSP headers

### PWA (Target: > 90)
- [ ] Web app manifest
- [ ] Service worker
- [ ] Offline fallback
- [ ] Installable
- [ ] Themed address bar

## Testing Commands

### Run Lighthouse Locally
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://hotdash.fly.dev --view

# Run specific categories
lighthouse https://hotdash.fly.dev --only-categories=performance,seo --view

# Mobile audit
lighthouse https://hotdash.fly.dev --preset=mobile --view

# Desktop audit
lighthouse https://hotdash.fly.dev --preset=desktop --view
```

### PageSpeed Insights
```
https://pagespeed.web.dev/analysis?url=https://hotdash.fly.dev
```

### WebPageTest
```
https://www.webpagetest.org/
Test URL: https://hotdash.fly.dev
Location: Dulles, VA (or closest to target audience)
Connection: 4G
```

## Monitoring Setup

### Real User Monitoring (RUM)

#### Web Vitals Library
```typescript
// app/entry.client.tsx
import { onCLS, onFID, onLCP, onINP } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics endpoint
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onINP(sendToAnalytics);
```

### Performance Observer
```typescript
// Monitor long tasks
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn('Long task detected:', entry);
    }
  }
});
observer.observe({ entryTypes: ['longtask'] });
```

## Quick Wins (Immediate Impact)

### 1. Add Resource Hints (5 min)
```html
<link rel="preconnect" href="https://cdn.shopify.com/" />
<link rel="dns-prefetch" href="https://analytics.google.com" />
```

### 2. Enable Compression (10 min)
- Verify Fly.io compression enabled
- Test with curl: `curl -H "Accept-Encoding: gzip" https://hotdash.fly.dev`

### 3. Add Image Dimensions (15 min)
- Add width/height to all images
- Prevents layout shift

### 4. Lazy Load Images (20 min)
- Add `loading="lazy"` to images
- Improves initial page load

### 5. Defer Non-Critical Scripts (10 min)
- Add `defer` or `async` to scripts
- Reduces blocking time

## Performance Budget

### Page Weight Targets
- **HTML:** < 50KB
- **CSS:** < 100KB
- **JavaScript:** < 300KB
- **Images:** < 500KB total
- **Fonts:** < 100KB
- **Total:** < 1MB

### Request Count Targets
- **Total Requests:** < 50
- **Third-party Requests:** < 10
- **Image Requests:** < 20

### Timing Targets
- **TTFB:** < 600ms
- **FCP:** < 1.8s
- **LCP:** < 2.5s
- **TTI:** < 3.8s

## Next Steps

### Phase 1: Quick Wins (1-2 hours)
1. Add lazy loading to images
2. Add image dimensions
3. Enable compression verification
4. Add resource hints
5. Run Lighthouse audit

### Phase 2: Optimization (2-4 hours)
1. Implement responsive images
2. Convert images to WebP
3. Code splitting for routes
4. Optimize database queries
5. Add caching headers

### Phase 3: Monitoring (1-2 hours)
1. Set up Web Vitals tracking
2. Configure performance monitoring
3. Create performance dashboard
4. Set up alerts for regressions

### Phase 4: Continuous Improvement
1. Monitor Core Web Vitals
2. A/B test optimizations
3. Regular Lighthouse audits
4. Performance budget enforcement

