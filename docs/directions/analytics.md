# Analytics Direction v6.3

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T04:02Z  
**Version**: 6.3  
**Status**: ACTIVE — Phase 7-8 Growth Analytics

---

## Objective

**Build analytics services for SEO, Ads, Social performance tracking**

---

## MANDATORY MCP USAGE

```bash
# TypeScript patterns
mcp_context7_get-library-docs("/microsoft/TypeScript", "async calculations aggregations")

# React Router 7 API routes
mcp_context7_get-library-docs("/websites/reactrouter", "loaders API routes")

# Google Analytics (if needed)
web_search("Google Analytics 4 API official documentation")
```

---

## 🚨 VIOLATION ACKNOWLEDGMENT

**Analytics agent violated React Router 7 rules** (commit 8d72171, e1e9f14, b95a802, 9bc8511):
- ❌ Used `import { json } from "react-router"` (FORBIDDEN - Remix pattern)
- ❌ Did NOT pull Context7 React Router 7 docs before coding
- ❌ No MCP evidence logged in feedback for those API routes

**Manager fixed** (commit 19c09b3):
- 5 files corrected (97 `json()` → `Response.json()`)
- Build now works

**Your requirement going forward**:
- ✅ MUST pull Context7 `/websites/reactrouter` docs BEFORE any route work
- ✅ MUST log MCP evidence in feedback
- ✅ Future violations = immediate PR rejection

---

## ACTIVE TASKS (8h total)

### ANALYTICS-006: Social Post Performance Tracking (2h) - START NOW

**Requirements**:
- Track Publer post metrics (impressions, clicks, engagement)
- Calculate CTR, engagement rate
- Store in social_analytics table

**MCP Required**: TypeScript async patterns

**Implementation**:

**File**: `app/services/analytics/social-performance.ts` (new)
```typescript
export async function trackSocialPostPerformance(postId: string) {
  // Fetch from Publer API
  // Calculate metrics
  // Store in social_analytics
}
```

**File**: `app/routes/api.analytics.social-performance.ts` (new)
- GET endpoint for social metrics

**Time**: 2 hours

---

### ANALYTICS-007: SEO Impact Analysis Service (2h)

**Requirements**:
- Track keyword rankings over time
- Identify ranking improvements/declines
- Correlate with content changes

**File**: `app/services/analytics/seo-impact.ts` (new)

**Time**: 2 hours

---

### ANALYTICS-008: Ads ROAS Calculator (2h)

**Requirements**:
- Calculate ROAS (Return on Ad Spend)
- Track campaign performance
- Identify best/worst performers

**File**: `app/services/analytics/ads-roas.ts` (new)

**Time**: 2 hours

---

### ANALYTICS-009: Growth Dashboard Metrics (2h)

**Requirements**:
- Aggregate metrics: CTR, impressions, conversions
- Weekly growth report
- Trend analysis

**File**: `app/services/analytics/growth-metrics.ts` (new)

**Time**: 2 hours

---

## Work Protocol

**MCP Tools**: Context7 for TypeScript, web_search for API docs

**Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Analytics: Social Performance

**Working On**: ANALYTICS-006 (Social post tracking)
**Progress**: 75% - Service implemented, testing metrics

**Evidence**:
- File: app/services/analytics/social-performance.ts (124 lines)
- MCP: TypeScript async patterns verified
- Test: CTR calculation working (324 impressions, 18 clicks = 5.56%)
- API route: GET /api/analytics/social-performance tested

**Blockers**: None
**Next**: Store metrics in social_analytics table, complete API route
```

---

**START WITH**: ANALYTICS-006 (Social performance) - Pull TypeScript docs NOW

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
