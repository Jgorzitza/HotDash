# Route-Level SEO Optimization Guide

**Date:** 2025-10-24  
**Purpose:** Guide for adding SEO meta tags to all Hot Dash routes  
**Status:** Implementation guide  

## Meta Function Pattern

### Standard Route Meta Tags

```typescript
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Page Title - Hot Dash | Shopify Control Center" },
    { name: "description", content: "Page description (150-160 characters)" },
    { name: "keywords", content: "keyword1, keyword2, keyword3" },
    { property: "og:title", content: "Page Title - Hot Dash" },
    { property: "og:description", content: "Page description for social sharing" },
    { property: "og:type", content: "website" },
    { property: "og:image", content: "/og-image.png" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Page Title - Hot Dash" },
    { name: "twitter:description", content: "Page description for Twitter" },
  ];
};
```

### Private/Admin Routes

```typescript
export const meta: MetaFunction = () => {
  return [
    { title: "Admin Page - Hot Dash" },
    { name: "robots", content: "noindex, nofollow" },
  ];
};
```

## Route-Specific Optimizations

### 1. Growth Engine (`/growth-engine`)

```typescript
export const meta: MetaFunction = () => {
  return [
    { title: "Growth Engine - Hot Dash | AI-Powered Shopify Growth" },
    { name: "description", content: "AI-powered growth automation for Shopify stores. Automated content generation, SEO optimization, and marketing campaigns." },
    { name: "keywords", content: "shopify growth, ai marketing, automated seo, content generation, shopify automation" },
    { property: "og:title", content: "Growth Engine - Hot Dash" },
    { property: "og:description", content: "AI-powered growth automation for Shopify stores" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};
```

### 2. Analytics Monitoring (`/analytics/monitoring`)

```typescript
export const meta: MetaFunction = () => {
  return [
    { title: "Analytics Monitoring - Hot Dash | Real-time Shopify Analytics" },
    { name: "description", content: "Real-time analytics monitoring for Shopify stores. Track sales, traffic, conversions, and customer behavior." },
    { name: "keywords", content: "shopify analytics, real-time monitoring, sales tracking, conversion analytics" },
    { property: "og:title", content: "Analytics Monitoring - Hot Dash" },
    { property: "og:description", content: "Real-time analytics monitoring for Shopify stores" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};
```

### 3. SEO Monitoring (`/seo/monitoring`)

```typescript
export const meta: MetaFunction = () => {
  return [
    { title: "SEO Monitoring - Hot Dash | Shopify SEO Analytics" },
    { name: "description", content: "Monitor SEO performance for your Shopify store. Track rankings, detect anomalies, and optimize for search engines." },
    { name: "keywords", content: "shopify seo, seo monitoring, search rankings, seo analytics, keyword tracking" },
    { property: "og:title", content: "SEO Monitoring - Hot Dash" },
    { property: "og:description", content: "Monitor and optimize SEO for your Shopify store" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};
```

### 4. Inventory Alerts (`/inventory/alerts`)

```typescript
export const meta: MetaFunction = () => {
  return [
    { title: "Inventory Alerts - Hot Dash | Smart Stock Management" },
    { name: "description", content: "Automated inventory alerts and reorder suggestions for Shopify stores. Never run out of stock again." },
    { name: "keywords", content: "inventory management, stock alerts, reorder automation, shopify inventory" },
    { property: "og:title", content: "Inventory Alerts - Hot Dash" },
    { property: "og:description", content: "Automated inventory management for Shopify stores" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};
```

### 5. Content Calendar (`/content/calendar`)

```typescript
export const meta: MetaFunction = () => {
  return [
    { title: "Content Calendar - Hot Dash | AI Content Planning" },
    { name: "description", content: "AI-powered content calendar for Shopify stores. Plan, generate, and schedule content automatically." },
    { name: "keywords", content: "content calendar, ai content, content planning, shopify marketing" },
    { property: "og:title", content: "Content Calendar - Hot Dash" },
    { property: "og:description", content: "AI-powered content planning for Shopify stores" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};
```

### 6. Knowledge Base (`/knowledge-base`)

```typescript
export const meta: MetaFunction = () => {
  return [
    { title: "Knowledge Base - Hot Dash | Help & Documentation" },
    { name: "description", content: "Hot Dash knowledge base with guides, tutorials, and documentation for Shopify store management." },
    { name: "keywords", content: "hot dash help, shopify guides, documentation, tutorials, knowledge base" },
    { property: "og:title", content: "Knowledge Base - Hot Dash" },
    { property: "og:description", content: "Help and documentation for Hot Dash" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};
```

## SEO Best Practices

### Title Tags
- **Length:** 50-60 characters (including brand)
- **Format:** `Page Title - Hot Dash | Category`
- **Brand:** Always include "Hot Dash"
- **Keywords:** Include primary keyword naturally
- **Unique:** Every page should have unique title

### Meta Descriptions
- **Length:** 150-160 characters
- **Action:** Include call-to-action when appropriate
- **Keywords:** Include primary and secondary keywords
- **Unique:** Every page should have unique description
- **Compelling:** Make users want to click

### Keywords
- **Count:** 3-5 keywords per page
- **Relevance:** Match page content
- **Long-tail:** Include specific phrases
- **Natural:** Don't stuff keywords
- **Research:** Use Search Console data

### Open Graph
- **Title:** Can be shorter than page title
- **Description:** Can differ from meta description
- **Image:** Always include og:image
- **Type:** Usually "website" for most pages
- **URL:** Include canonical URL

### Twitter Cards
- **Card Type:** "summary_large_image" for most pages
- **Title:** Match or shorten page title
- **Description:** Match or shorten meta description
- **Image:** Same as og:image

## Implementation Checklist

### For Each Route
- [ ] Add MetaFunction export
- [ ] Define unique title (50-60 chars)
- [ ] Write compelling description (150-160 chars)
- [ ] Select 3-5 relevant keywords
- [ ] Add Open Graph tags
- [ ] Add Twitter Card tags
- [ ] Test social sharing preview
- [ ] Verify in browser tab

### Quality Checks
- [ ] Title includes brand name
- [ ] Description is compelling
- [ ] Keywords match content
- [ ] No duplicate titles across routes
- [ ] No duplicate descriptions
- [ ] All tags properly formatted
- [ ] Social previews look good

## Testing Tools

### Meta Tag Validators
- **Facebook:** https://developers.facebook.com/tools/debug/
- **Twitter:** https://cards-dev.twitter.com/validator
- **LinkedIn:** https://www.linkedin.com/post-inspector/

### SEO Analyzers
- **Google Search Console:** Verify meta tags
- **Lighthouse:** SEO audit score
- **Screaming Frog:** Crawl and analyze
- **Ahrefs/SEMrush:** Competitive analysis

### Browser Testing
- Chrome DevTools: View meta tags
- Firefox Developer Tools: Inspect meta
- Safari Web Inspector: Check meta
- Mobile browsers: Test responsive

## Monitoring & Optimization

### Track Performance
- **Search Console:** Monitor impressions, clicks, CTR
- **Analytics:** Track organic traffic by page
- **Rankings:** Monitor keyword positions
- **Conversions:** Track goal completions

### Optimize Based on Data
- **Low CTR:** Improve title/description
- **High Bounce:** Review content relevance
- **Low Rankings:** Optimize keywords
- **No Traffic:** Check indexing status

### A/B Testing
- Test different titles
- Test different descriptions
- Test different keywords
- Measure impact on CTR

## Common Mistakes to Avoid

### ❌ Don't Do This
- Duplicate titles across pages
- Keyword stuffing in meta tags
- Missing meta descriptions
- Generic descriptions ("Welcome to our site")
- Too long titles (> 60 chars)
- Too short descriptions (< 120 chars)
- Missing Open Graph tags
- Broken image URLs

### ✅ Do This Instead
- Unique titles for every page
- Natural keyword usage
- Compelling, unique descriptions
- Specific, actionable descriptions
- Optimal title length (50-60 chars)
- Optimal description length (150-160 chars)
- Complete Open Graph implementation
- Valid, accessible image URLs

## Priority Routes for SEO

### High Priority (Public-facing)
1. `/` - Homepage
2. `/growth-engine` - Main feature page
3. `/analytics/monitoring` - Analytics feature
4. `/seo/monitoring` - SEO feature
5. `/knowledge-base` - Help content

### Medium Priority (Feature pages)
6. `/inventory/alerts` - Inventory feature
7. `/content/calendar` - Content feature
8. `/ads/dashboard` - Ads feature
9. `/analytics/performance` - Performance analytics
10. `/analytics/realtime` - Real-time analytics

### Low Priority (Private/Admin)
- `/app` - Dashboard (noindex)
- `/settings` - Settings (noindex)
- `/admin/*` - Admin pages (noindex)
- `/api/*` - API endpoints (disallow in robots.txt)

## Next Steps

1. **Audit Current Routes**
   - List all public routes
   - Identify missing meta tags
   - Prioritize by traffic potential

2. **Implement Meta Tags**
   - Start with high-priority routes
   - Follow pattern above
   - Test each implementation

3. **Validate & Test**
   - Run Lighthouse audits
   - Test social sharing
   - Verify in Search Console

4. **Monitor & Optimize**
   - Track performance metrics
   - A/B test variations
   - Optimize based on data

