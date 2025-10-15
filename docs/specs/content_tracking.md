# Content Performance Tracking Specification

**Version:** 1.0  
**Date:** 2025-10-15  
**Owner:** content agent  
**Status:** Foundation - Ready for HITL Integration

---

## Purpose

Build content performance tracking infrastructure to support future HITL social posting workflow. This enables the content agent to:
1. Track performance metrics across multiple social platforms
2. Provide data-driven content recommendations
3. Measure impact of approved social posts
4. Learn from high-performing content patterns

---

## Supported Platforms

- **Instagram** - Engagement, reach, saves, profile clicks
- **Facebook** - Engagement, reach, shares, link clicks
- **TikTok** - Engagement, views, shares, profile visits

---

## Data Structures

### ContentPost

Represents a social media post across platforms.

```typescript
interface ContentPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok';
  content: string;
  mediaUrls?: string[];
  publishedAt: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  metadata?: {
    hashtags?: string[];
    mentions?: string[];
    location?: string;
  };
}
```

### EngagementMetrics

Tracks user engagement with content.

```typescript
interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  saves?: number; // Instagram/TikTok specific
  engagementRate: number; // (likes + comments + shares + saves) / impressions * 100
}
```

**Engagement Rate Formula:**
```
engagementRate = (likes + comments + shares + saves) / impressions × 100
```

### ReachMetrics

Tracks content visibility and reach.

```typescript
interface ReachMetrics {
  impressions: number;
  reach: number;
  uniqueViews?: number;
}
```

### ClickMetrics

Tracks click-through behavior.

```typescript
interface ClickMetrics {
  clicks: number;
  clickThroughRate: number; // clicks / impressions * 100
  linkClicks?: number;
  profileClicks?: number;
}
```

**Click-Through Rate Formula:**
```
clickThroughRate = clicks / impressions × 100
```

### ConversionMetrics

Tracks business outcomes from content.

```typescript
interface ConversionMetrics {
  conversions: number;
  conversionRate: number; // conversions / clicks * 100
  revenue?: number;
  averageOrderValue?: number;
}
```

**Conversion Rate Formula:**
```
conversionRate = conversions / clicks × 100
```

### ContentPerformance

Complete performance metrics for a single post.

```typescript
interface ContentPerformance {
  postId: string;
  platform: SocialPlatform;
  publishedAt: string;
  engagement: EngagementMetrics;
  reach: ReachMetrics;
  clicks: ClickMetrics;
  conversions?: ConversionMetrics;
  period: {
    start: string;
    end: string;
  };
}
```

### AggregatedPerformance

Aggregated metrics across multiple posts.

```typescript
interface AggregatedPerformance {
  totalPosts: number;
  platforms: Record<SocialPlatform, number>; // Post count per platform
  totalEngagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  averageEngagementRate: number;
  totalReach: number;
  totalImpressions: number;
  totalClicks: number;
  averageClickThroughRate: number;
  totalConversions: number;
  totalRevenue: number;
  period: {
    start: string;
    end: string;
  };
}
```

---

## API Endpoints

### GET /api/content/performance

Fetch content performance metrics with flexible query parameters.

#### Query Parameters

**type** (required): `'post' | 'aggregated' | 'top'`

**For type=post:**
- `postId` (required): Post identifier
- `platform` (required): `'instagram' | 'facebook' | 'tiktok'`

**For type=aggregated:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format
- `platform` (optional): Filter by specific platform

**For type=top:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format
- `limit` (optional): Number of posts to return (1-100, default: 10)
- `sortBy` (optional): `'engagement' | 'reach' | 'clicks' | 'conversions'` (default: 'engagement')

#### Example Requests

```bash
# Get performance for a specific post
GET /api/content/performance?type=post&postId=abc123&platform=instagram

# Get aggregated performance for date range
GET /api/content/performance?type=aggregated&startDate=2025-10-01&endDate=2025-10-15

# Get top 5 posts by engagement
GET /api/content/performance?type=top&startDate=2025-10-01&endDate=2025-10-15&limit=5&sortBy=engagement
```

#### Response Format

```json
{
  "performance": { /* ContentPerformance or AggregatedPerformance */ }
}
```

or

```json
{
  "posts": [ /* Array of ContentPerformance */ ]
}
```

---

## Implementation Status

### ✅ Completed

1. **Data Structures** - All TypeScript interfaces defined
2. **Tracking Library** - `app/lib/content/tracking.ts` with:
   - Engagement rate calculation
   - Click-through rate calculation
   - Conversion rate calculation
   - Performance fetching functions (placeholder)
3. **API Route** - `app/routes/api/content.performance.ts` with:
   - Parameter validation
   - Authentication
   - Error handling
4. **Documentation** - This specification

### 🔄 Placeholder (Future Implementation)

The following functions are implemented as placeholders and return mock data:

- `getContentPerformance()` - Fetch individual post metrics
- `getAggregatedPerformance()` - Fetch aggregated metrics
- `getTopPerformingPosts()` - Fetch top performing posts

**Future Integration Points:**
1. **Ayrshare API** - Fetch social media metrics from Ayrshare adapter
2. **Supabase** - Store and query historical performance data
3. **GA4 Integration** - Correlate social traffic with conversions
4. **Platform APIs** - Direct integration with Instagram, Facebook, TikTok APIs (if needed)

---

## Metrics Accuracy Requirements

Per direction file: **Engagement metrics must be accurate**

### Accuracy Checklist

- ✅ Engagement rate formula verified: `(likes + comments + shares + saves) / impressions × 100`
- ✅ Click-through rate formula verified: `clicks / impressions × 100`
- ✅ Conversion rate formula verified: `conversions / clicks × 100`
- ✅ Zero-division handling implemented in all calculations
- ✅ Platform-specific metrics supported (saves for Instagram/TikTok)
- ✅ Type safety enforced with TypeScript interfaces

---

## Future HITL Integration

This tracking infrastructure supports the future HITL social posting workflow:

1. **Draft** - Content agent drafts social post with evidence
2. **Review** - CEO reviews with projected performance metrics
3. **Approve** - CEO approves (with optional edits and grades)
4. **Post** - System posts via Ayrshare adapter
5. **Track** - Performance metrics collected via this tracking system
6. **Learn** - High-performing patterns fed back to content agent

---

## Rollback Plan

If issues arise:
1. API route can be disabled by removing the file
2. No database migrations required (placeholder implementation)
3. No external dependencies added
4. Tracking library is isolated and can be removed without affecting other systems

---

## Next Steps (Milestone M6)

1. Integrate Ayrshare API for real metrics
2. Create Supabase tables for content posts and performance history
3. Implement actual data fetching in placeholder functions
4. Add GA4 correlation for conversion tracking
5. Build dashboard tile for content performance
6. Implement HITL posting workflow

