# Content/SEO/Perf Agent Implementation

**Task:** ENG-062  
**Status:** Implemented  
**Last Updated:** 2025-01-24

## Overview

The Content/SEO/Perf Agent identifies content optimization opportunities, SEO improvements, and performance issues through programmatic page analysis, internal link optimization, Core Web Vitals monitoring, and A/B testing recommendations.

## Architecture

### Components

1. **Content/SEO/Perf Agent** (`app/lib/growth-engine/specialist-agents.ts`)
   - OpenAI Agent SDK implementation
   - Daily analysis scheduling
   - Event-driven triggers
   - Action card generation

2. **Content Optimizer** (`app/services/seo/content-optimizer.ts`)
   - Readability analysis
   - Keyword optimization
   - Heading structure analysis
   - Link and image analysis

3. **Core Web Vitals** (`app/services/seo/core-web-vitals.ts`, `app/routes/api.seo.web-vitals.ts`)
   - LCP, FID, CLS monitoring
   - PageSpeed Insights integration
   - Performance trace collection

4. **Meta Optimizer** (`app/services/seo/meta-optimizer.ts`)
   - Title tag optimization
   - Meta description optimization
   - Search Console integration

5. **SEO Audit** (`app/services/seo/automated-audit.ts`, `app/routes/api.seo.run-audit.ts`)
   - Daily automated audits
   - Issue categorization
   - Severity scoring

## Programmatic Page Metaobjects Plan

### Metaobject Structure

**Purpose:** Create programmatic pages at scale using Shopify metaobjects

**Schema:**
```typescript
interface ProgrammaticPage {
  handle: string; // URL slug
  template: string; // Template type (category, location, comparison)
  title: string; // Page title
  description: string; // Meta description
  h1: string; // Main heading
  content: string; // Body content
  keywords: string[]; // Target keywords
  internalLinks: InternalLink[]; // Related pages
  jsonLd: object; // Structured data
  status: 'draft' | 'published';
}
```

**Templates:**
1. **Category Pages** - `/category/{keyword}`
2. **Location Pages** - `/location/{city}-{state}`
3. **Comparison Pages** - `/{product-a}-vs-{product-b}`
4. **How-To Pages** - `/how-to/{task}`

**Example:**
```typescript
{
  handle: 'best-widgets-chicago-il',
  template: 'location',
  title: 'Best Widgets in Chicago, IL | Free Shipping',
  description: 'Find the best widgets in Chicago, IL. Premium quality, fast delivery, 5-star reviews. Shop now!',
  h1: 'Best Widgets in Chicago, IL',
  content: '{{location_intro}} {{product_features}} {{customer_reviews}} {{cta}}',
  keywords: ['widgets chicago', 'best widgets illinois', 'chicago widget store'],
  internalLinks: [
    { url: '/widgets', anchor: 'All Widgets' },
    { url: '/location/illinois', anchor: 'Illinois Locations' }
  ],
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Hot Dash Widgets - Chicago',
    'address': { '@type': 'PostalAddress', 'addressLocality': 'Chicago', 'addressRegion': 'IL' }
  },
  status: 'published'
}
```

### Generation Process

1. **Identify Opportunities** - Analyze Search Console for high-volume, low-competition keywords
2. **Create Metaobjects** - Generate programmatic pages using templates
3. **Optimize Content** - Apply SEO best practices (title, description, headings, keywords)
4. **Add Internal Links** - Connect to related pages
5. **Add JSON-LD** - Include structured data
6. **Publish** - Deploy to Shopify

## Internal Link Rules + JSON-LD Plan

### Internal Link Rules

**Rule 1: Hub and Spoke**
- Hub pages (categories) link to spoke pages (products)
- Spoke pages link back to hub
- Maximum 3 clicks from homepage to any page

**Rule 2: Contextual Relevance**
- Link only to related content
- Use descriptive anchor text (not "click here")
- Limit to 3-5 internal links per page

**Rule 3: Authority Flow**
- High-authority pages link to new pages
- Avoid circular linking
- Use breadcrumbs for hierarchy

**Example:**
```typescript
const internalLinkRules = {
  'product-page': [
    { target: 'category-page', anchor: 'View all {category}', max: 1 },
    { target: 'related-products', anchor: 'Similar products', max: 3 },
    { target: 'how-to-guide', anchor: 'How to use {product}', max: 1 }
  ],
  'category-page': [
    { target: 'product-page', anchor: '{product name}', max: 10 },
    { target: 'subcategory-page', anchor: '{subcategory}', max: 5 }
  ]
};
```

### JSON-LD Plan

**Schema Types:**
1. **Product** - Product pages
2. **LocalBusiness** - Location pages
3. **HowTo** - How-to guides
4. **FAQPage** - FAQ pages
5. **BreadcrumbList** - All pages

**Example Product Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Premium Widget Bundle",
  "description": "High-quality widget bundle with free shipping",
  "image": "https://example.com/widget.jpg",
  "sku": "WIDGET-PRO-001",
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
```

## CWV Tasks Tied to 25529 Pages with Perf Traces

### Core Web Vitals Monitoring

**Metrics:**
- **LCP (Largest Contentful Paint)** - Target: < 2.5s
- **FID (First Input Delay)** - Target: < 100ms
- **CLS (Cumulative Layout Shift)** - Target: < 0.1

**Implementation:**
```typescript
// Collect CWV data for all pages
const pages = await getAllPages(); // 25,529 pages

for (const page of pages) {
  const vitals = await analyzeWebVitals(page.url);
  
  if (vitals.lcp > 2500 || vitals.fid > 100 || vitals.cls > 0.1) {
    // Generate performance task
    const task = {
      page: page.url,
      issue: identifyIssue(vitals),
      trace: vitals.trace, // Performance trace
      priority: calculatePriority(vitals),
      recommendation: generateRecommendation(vitals)
    };
    
    await emitAction(task);
  }
}
```

### Performance Trace Evidence

**Trace Structure:**
```typescript
interface PerformanceTrace {
  url: string;
  timestamp: string;
  metrics: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
    fcp: number;
  };
  opportunities: Opportunity[];
  diagnostics: Diagnostic[];
}
```

**Example Trace:**
```json
{
  "url": "https://example.com/products/widget",
  "timestamp": "2025-01-24T10:00:00Z",
  "metrics": {
    "lcp": 3200,
    "fid": 85,
    "cls": 0.15,
    "ttfb": 450,
    "fcp": 1800
  },
  "opportunities": [
    {
      "title": "Eliminate render-blocking resources",
      "description": "Resources are blocking the first paint of your page",
      "savings": 850
    }
  ],
  "diagnostics": [
    {
      "title": "Avoid enormous network payloads",
      "description": "Large network payloads cost users real money",
      "numericValue": 2400000
    }
  ]
}
```

## A/B Harness Specification

### Cookie-Based Variant Assignment

**Cookie Name:** `hd_ab_variant`

**Values:**
- `control` - Original version
- `variant_a` - Test variant A
- `variant_b` - Test variant B

**Assignment Logic:**
```typescript
function assignVariant(userId: string, testId: string): string {
  const hash = hashCode(`${userId}-${testId}`);
  const bucket = hash % 100;
  
  if (bucket < 50) return 'control';
  if (bucket < 75) return 'variant_a';
  return 'variant_b';
}

// Set cookie
document.cookie = `hd_ab_variant=${variant}; path=/; max-age=2592000`; // 30 days
```

### GA4 Custom Dimension

**Dimension Name:** `ab_variant`

**Implementation:**
```typescript
// Send to GA4
gtag('event', 'page_view', {
  'ab_variant': getCookie('hd_ab_variant'),
  'ab_test_id': 'homepage_hero_test_001'
});
```

### A/B Test Configuration

```typescript
interface ABTest {
  id: string;
  name: string;
  hypothesis: string;
  variants: {
    control: { name: string; description: string };
    variant_a: { name: string; description: string; changes: string[] };
    variant_b?: { name: string; description: string; changes: string[] };
  };
  traffic: {
    control: number; // 50%
    variant_a: number; // 25%
    variant_b?: number; // 25%
  };
  metrics: {
    primary: string; // e.g., 'conversion_rate'
    secondary: string[]; // e.g., ['bounce_rate', 'time_on_page']
  };
  duration: number; // days
  minSampleSize: number;
}
```

## Prioritized List Per Page with Trace Evidence

### Priority Calculation

```typescript
function calculatePriority(page: Page, vitals: CoreWebVitals): number {
  const lcpScore = vitals.lcp > 2500 ? (vitals.lcp - 2500) / 1000 : 0;
  const fidScore = vitals.fid > 100 ? (vitals.fid - 100) / 10 : 0;
  const clsScore = vitals.cls > 0.1 ? (vitals.cls - 0.1) * 100 : 0;
  
  const trafficWeight = page.monthlyVisits / 1000;
  const revenueWeight = page.monthlyRevenue / 100;
  
  return (lcpScore + fidScore + clsScore) * (trafficWeight + revenueWeight);
}
```

### Prioritized List Example

```typescript
[
  {
    rank: 1,
    url: '/products/best-seller',
    priority: 450,
    monthlyVisits: 15000,
    monthlyRevenue: 25000,
    issues: [
      {
        type: 'LCP',
        current: 3200,
        target: 2500,
        gap: 700,
        recommendation: 'Optimize hero image (reduce size from 2MB to 200KB)',
        trace: { /* performance trace */ }
      },
      {
        type: 'CLS',
        current: 0.15,
        target: 0.1,
        gap: 0.05,
        recommendation: 'Add width/height to product images',
        trace: { /* performance trace */ }
      }
    ],
    evidence: {
      mcpRequestId: 'pagespeed-insights-20250124-001',
      traceUrl: '/api/performance/traces/best-seller-20250124.json'
    }
  },
  {
    rank: 2,
    url: '/category/widgets',
    priority: 380,
    monthlyVisits: 12000,
    monthlyRevenue: 18000,
    issues: [
      {
        type: 'LCP',
        current: 2800,
        target: 2500,
        gap: 300,
        recommendation: 'Preload critical CSS',
        trace: { /* performance trace */ }
      }
    ],
    evidence: {
      mcpRequestId: 'pagespeed-insights-20250124-002',
      traceUrl: '/api/performance/traces/widgets-category-20250124.json'
    }
  }
]
```

## Daily + Event Triggers

### Daily Analysis

**Schedule:** Every day at 2:00 AM UTC

**Tasks:**
1. Run SEO audit on all pages
2. Analyze Core Web Vitals for top 100 pages
3. Check for keyword cannibalization
4. Identify new programmatic page opportunities
5. Generate action cards

**Implementation:**
```typescript
cron.schedule('0 2 * * *', async () => {
  const agent = new ContentSEOPerfAgent();
  const actions = await agent.runDailyAnalysis();
  
  for (const action of actions) {
    await emitAction(action);
  }
});
```

### Event Triggers

**Events:**
- `page.created` - New page published
- `page.updated` - Page content changed
- `product.created` - New product added
- `collection.created` - New collection created

**Implementation:**
```typescript
app.post('/webhooks/pages/created', async (req, res) => {
  const page = req.body;
  
  const agent = new ContentSEOPerfAgent();
  const actions = await agent.assessNewPage(page);
  
  for (const action of actions) {
    await emitAction(action);
  }
  
  res.status(200).send('OK');
});
```

## MCP Evidence Logging

### Evidence Structure

```typescript
interface SEOEvidence {
  source: 'pagespeed-insights' | 'search-console' | 'shopify';
  mcpRequestId: string;
  query: string;
  timestamp: string;
  data: any;
}
```

### Logging Implementation

```typescript
const evidence: SEOEvidence = {
  source: 'pagespeed-insights',
  mcpRequestId: `pagespeed-insights-${Date.now()}`,
  query: 'runPagespeed',
  timestamp: new Date().toISOString(),
  data: {
    url: page.url,
    lcp: vitals.lcp,
    fid: vitals.fid,
    cls: vitals.cls,
    opportunities: vitals.opportunities
  }
};

await logDecision({
  scope: 'seo-monitoring',
  actor: 'content-seo-perf-agent',
  action: 'cwv_issue_detected',
  rationale: `CWV issue detected on ${page.url}`,
  evidenceUrl: `/api/performance/traces/${page.id}.json`,
  payload: { evidence }
});
```

## References

- Content/SEO/Perf Agent: `app/lib/growth-engine/specialist-agents.ts`
- Content Optimizer: `app/services/seo/content-optimizer.ts`
- Core Web Vitals: `app/services/seo/core-web-vitals.ts`
- Meta Optimizer: `app/services/seo/meta-optimizer.ts`
- SEO Audit: `app/services/seo/automated-audit.ts`
- Task: ENG-062 in TaskAssignment table

