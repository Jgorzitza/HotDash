# Tile Errors - Production Issues
**Date:** 2025-10-24  
**Status:** 🔴 Critical - All tiles showing errors  
**Context:** After fixing blank page issue, tiles now load but all show errors

## Issue Categories

### 🔴 Critical - Database/Prisma Issues (5 tiles)
**Root Cause:** Prisma client not properly initialized or database connection issues

#### 1. Ops Pulse
- **Error:** `Cannot read properties of undefined (reading 'findFirst')`
- **Owner:** Ops team
- **File:** `app/routes/app._index.tsx` or tile component
- **Action Required:**
  - Check Prisma client initialization in tile loader
  - Verify database connection is established before query
  - Add null checks for Prisma client
  - Test query: `prisma.order.findFirst()` or similar

#### 2. Sales Pulse
- **Error:** `Cannot read properties of undefined (reading 'create')`
- **Owner:** Sales team
- **File:** Sales Pulse tile component
- **Action Required:**
  - Check if trying to call `prisma.something.create()` on undefined
  - Verify Prisma client is passed to component
  - Add error boundary around tile
  - Check if this should be a read operation, not create

#### 3. Fulfillment Health
- **Error:** `Cannot read properties of undefined (reading 'create')`
- **Owner:** Fulfillment team
- **File:** Fulfillment Health tile component
- **Action Required:**
  - Same as Sales Pulse - check Prisma client initialization
  - Verify why it's calling `create` - should this be a read operation?
  - Add proper error handling

#### 4. Inventory Heatmap
- **Error:** `Cannot read properties of undefined (reading 'create')`
- **Owner:** Inventory team
- **File:** Inventory Heatmap tile component
- **Action Required:**
  - Same pattern as above - Prisma client undefined
  - Check if mock data should be used when Prisma unavailable
  - Add fallback to mock data

#### 5. CX Escalations
- **Error:** `Unable to fetch Chatwoot conversations`
- **Owner:** CX team
- **File:** CX Escalations tile component
- **Action Required:**
  - Check Chatwoot API credentials in environment variables
  - Verify `CHATWOOT_API_KEY` and `CHATWOOT_BASE_URL` are set
  - Check if Chatwoot service is accessible from production
  - Add retry logic and better error messages

---

### 🟡 Medium - External API Issues (5 tiles)
**Root Cause:** API credentials missing or incorrect, or APIs returning errors

#### 6. SEO & Content Watch
- **Error:** `Failed to retrieve GA sessions`
- **Owner:** SEO/Content team
- **File:** SEO & Content Watch tile component
- **Action Required:**
  - Check Google Analytics API credentials
  - Verify `GA_PROPERTY_ID` environment variable
  - Check if Google Analytics MCP is configured
  - Test GA API connection manually
  - Add fallback to mock data if API unavailable

#### 7. Social Performance
- **Error:** `API returned 410`
- **Owner:** Social team
- **File:** Social Performance tile component
- **Action Required:**
  - HTTP 410 = Gone/Deprecated endpoint
  - Check which social media API is being called
  - Verify API endpoint URL is current
  - Check if API credentials are valid
  - Update to new API version if endpoint deprecated

#### 8. SEO Impact
- **Error:** `API returned 410`
- **Owner:** SEO team
- **File:** SEO Impact tile component
- **Action Required:**
  - Same as Social Performance - check API endpoint
  - Likely Google Analytics or Search Console API
  - Verify API version and endpoint URL
  - Check authentication method

#### 9. Ads ROAS
- **Error:** `API returned 410`
- **Owner:** Ads team
- **File:** Ads ROAS tile component
- **Action Required:**
  - Check Google Ads API endpoint
  - Verify API credentials and OAuth tokens
  - Update to current API version
  - Check if using deprecated endpoint

#### 10. Growth Metrics
- **Error:** `API returned 410`
- **Owner:** Growth team
- **File:** Growth Metrics tile component
- **Action Required:**
  - Check which analytics API is being called
  - Update API endpoint to current version
  - Verify credentials

#### 11. Unread Messages
- **Error:** `API request failed`
- **Owner:** Messaging team
- **File:** Unread Messages tile component
- **Action Required:**
  - Check which messaging API (Chatwoot? Email?)
  - Verify API credentials in environment
  - Add better error logging to see actual error
  - Test API connection manually

---

### 🟢 Low - Navigation/UI Issues (4 items)

#### 12. Approval Queue Backlog - 404 Error
- **Error:** "View Queue →" link returns 404
- **Owner:** Approvals team
- **File:** Approval Queue tile component
- **Action Required:**
  - Check link destination: likely `/approvals` or `/app/approvals`
  - Verify route exists in `app/routes/`
  - Create route if missing: `app/routes/app.approvals.tsx`
  - Test navigation

#### 13. Idea Pool - 404 Error
- **Error:** "View All ideas" link returns 404
- **Owner:** Ideas team
- **File:** Idea Pool tile component
- **Action Required:**
  - Check link destination: likely `/ideas` or `/app/ideas`
  - Verify route exists
  - Create route if missing: `app/routes/app.ideas.tsx`
  - Test navigation

#### 14. Approvals Queue - 404 Error
- **Error:** "Review approvals" link returns 404
- **Owner:** Approvals team
- **File:** Approvals Queue tile component
- **Action Required:**
  - Same as #12 - check route exists
  - Ensure consistent routing for approvals

#### 15. Growth Engine Analytics - Transparent Flyover
- **Error:** "View full analytics" loads transparent flyover - can't read content
- **Owner:** Growth team
- **File:** Growth Engine Analytics component
- **Action Required:**
  - Check CSS for flyover/modal component
  - Likely missing background color or z-index issue
  - Check if content is rendering but invisible
  - Test in browser DevTools to inspect element

---

### 🔵 Enhancement - Menu Cleanup

#### 16. App Menu Issues
**Owner:** UI/UX team  
**File:** `app/routes/app.tsx` (navigation component)

**Issues:**
1. **"Approvals24 Pending"** → Change to **"Pending Approvals"**
2. **"additional page"** → Remove (meaningless label)
3. **"session token tool"** → Remove (old debug feature)

**Action Required:**
- Update navigation menu labels
- Remove debug/unused menu items
- Align menu structure with rest of app
- Ensure consistent naming conventions

---

## Priority Order

### P0 - Fix Immediately
1. Database/Prisma initialization issues (tiles 1-4)
2. Navigation 404 errors (tiles 12-14)
3. Menu cleanup (item 16)

### P1 - Fix This Week
1. External API issues (tiles 6-11)
2. Chatwoot integration (tile 5)
3. Transparent flyover (tile 15)

### P2 - Monitor
1. CEO Agent functionality (needs product review)

---

## Common Patterns to Fix

### Pattern 1: Prisma Client Undefined
**Affected:** Ops Pulse, Sales Pulse, Fulfillment Health, Inventory Heatmap

**Root Cause:** Prisma client not initialized or not passed to components

**Fix:**
```typescript
// In loader or component
import { prisma } from '~/db.server';

// Add null check
if (!prisma) {
  return { error: 'Database not available', data: null };
}

// Use prisma safely
const data = await prisma.model.findFirst();
```

### Pattern 2: API 410 Errors
**Affected:** Social Performance, SEO Impact, Ads ROAS, Growth Metrics

**Root Cause:** Using deprecated API endpoints or wrong credentials

**Fix:**
1. Check API documentation for current endpoint
2. Update API version in code
3. Verify credentials in Fly secrets
4. Add proper error handling and fallbacks

### Pattern 3: 404 Navigation Errors
**Affected:** Approval Queue, Idea Pool, Approvals Queue

**Root Cause:** Routes don't exist

**Fix:**
1. Create missing route files
2. Add proper loaders and components
3. Test navigation links

---

## Environment Variables to Check

Run in production:
```bash
fly secrets list -a hotdash-production
```

**Required Variables:**
- `DATABASE_URL` - Postgres connection
- `CHATWOOT_API_KEY` - CX Escalations
- `CHATWOOT_BASE_URL` - CX Escalations
- `GA_PROPERTY_ID` - Google Analytics tiles
- `GOOGLE_ADS_*` - Ads ROAS tile
- Social media API keys - Social Performance tile

---

## Next Steps

1. **Team Leads:** Review issues in your bucket
2. **Assign:** Each issue to specific developer
3. **Timeline:** P0 issues by end of day, P1 by end of week
4. **Testing:** Test each fix in dev store before deploying
5. **Documentation:** Update this doc as issues are resolved

---

## Resolution Tracking

| Issue | Owner | Status | PR | Notes |
|-------|-------|--------|----|----|
| Ops Pulse | Ops | 🔴 Open | - | - |
| Sales Pulse | Sales | 🔴 Open | - | - |
| Fulfillment Health | Fulfillment | 🔴 Open | - | - |
| Inventory Heatmap | Inventory | 🔴 Open | - | - |
| CX Escalations | CX | 🔴 Open | - | - |
| SEO & Content Watch | SEO | 🔴 Open | - | - |
| Social Performance | Social | 🔴 Open | - | - |
| SEO Impact | SEO | 🔴 Open | - | - |
| Ads ROAS | Ads | 🔴 Open | - | - |
| Growth Metrics | Growth | 🔴 Open | - | - |
| Unread Messages | Messaging | 🔴 Open | - | - |
| Approval Queue 404 | Approvals | 🔴 Open | - | - |
| Idea Pool 404 | Ideas | 🔴 Open | - | - |
| Approvals Queue 404 | Approvals | 🔴 Open | - | - |
| Transparent Flyover | Growth | 🔴 Open | - | - |
| Menu Cleanup | UI/UX | 🔴 Open | - | - |

