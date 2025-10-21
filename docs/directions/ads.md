# Ads Direction v5.2

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T04:04Z  
**Version**: 5.2  
**Status**: ACTIVE — Phase 8 Google Ads Integration + HITL

---

## Objective

**Build Google Ads integration with HITL approval workflow for ad copy changes**

---

## MANDATORY MCP USAGE

```bash
# Google Ads API
web_search("Google Ads API official documentation authentication Node.js")

# TypeScript async patterns
mcp_context7_get-library-docs("/microsoft/TypeScript", "async error handling retry logic")

# React Router 7 API routes
mcp_context7_get-library-docs("/websites/reactrouter", "API routes actions")
```

---

## ACTIVE TASKS (10h total)

### ADS-001: Google Ads API Integration (3h) - START NOW

**Requirements**:
- Authenticate with Google Ads API
- Fetch campaign data (impressions, clicks, cost, conversions)
- Daily refresh
- Store in ad_campaigns, ad_performance tables

**MCP Required**: web_search for Google Ads API docs

**Implementation**:

**File**: `app/services/ads/google-ads-client.ts` (new)
```typescript
// OAuth authentication
// Campaign data fetch
// Performance metrics
// Error handling
```

**Credentials**: `vault/occ/google/ads_credentials.json` (check first)

**Time**: 3 hours

---

### ADS-002: Ad Performance Dashboard (2h)

**Requirements**:
- Dashboard showing ROAS, CTR, conversions by campaign
- Week-over-week comparisons
- Best/worst performing campaigns

**File**: `app/routes/api.ads.performance.ts` (new)
**File**: `app/services/ads/performance-metrics.ts` (new)

**Time**: 2 hours

---

### ADS-003: Budget Alert System (2h)

**Requirements**:
- Alert when campaign spend > 80% of budget
- Daily budget tracking
- Automatic pause if overspend

**File**: `app/services/ads/budget-alerts.ts` (new)

**Time**: 2 hours

---

### ADS-004: HITL Ad Copy Approval (3h)

**Requirements**:
- Draft ad copy changes → Approval queue
- CEO approves → Publish to Google Ads
- Track approval history

**File**: `app/services/ads/copy-approval.ts` (new)
**File**: `app/routes/api.ads.approve-copy.ts` (new)

**Time**: 3 hours

---

## Work Protocol

**MCP Tools**: web_search for API docs, Context7 for TypeScript

**Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Ads: Google Ads Integration

**Working On**: ADS-001 (Google Ads API client)
**Progress**: 70% - Auth working, fetching campaigns

**Evidence**:
- File: app/services/ads/google-ads-client.ts (178 lines)
- MCP: web_search for Google Ads API (official docs)
- Auth: OAuth successful with test account
- Test: Fetched 3 campaigns, 42 ad groups

**Blockers**: None
**Next**: Store performance metrics, complete error handling
```

---

**START WITH**: ADS-001 (Google Ads integration) - web_search NOW

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
