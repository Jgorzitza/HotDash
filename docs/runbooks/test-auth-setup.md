# Test Authentication Setup — HotDash

**Purpose**: Enable smoke testing and local development without Shopify Partners OAuth  
**Owner**: Engineer  
**Last Updated**: 2025-10-21  
**Status**: ✅ Active

---

## 🎯 Overview

HotDash supports **mock mode** authentication bypass for:
- **Smoke testing** (Pilot Agent UI validation)
- **Local development** (without Shopify OAuth)
- **E2E testing** (Playwright automated tests)
- **CI/CD pipelines** (GitHub Actions)

**Key Feature**: `?mock=1` URL parameter bypasses Shopify authentication

---

## 🚀 Quick Start (TL;DR)

### Smoke Test Any Page
```bash
# Settings page
http://localhost:3000/settings?mock=1

# Dashboard
http://localhost:3000/app?mock=1

# Any route
http://localhost:3000/YOUR_ROUTE?mock=1
```

**No credentials required** - authentication is bypassed entirely in mock mode.

---

## 📋 Mock Mode Authentication

### How It Works

**File**: `app/utils/env.server.ts` (lines 64-70)

```typescript
export function isMockMode(request: Request): boolean {
  const url = new URL(request.url);
  const mockParam = url.searchParams.get("mock");
  const isTestEnv = process.env.NODE_ENV === "test";

  return mockParam === "1" || isTestEnv;
}
```

**File**: `app/routes/app.tsx` (lines 15-21)

```typescript
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Bypass auth in test/mock mode for E2E testing
  const isTestMode = isMockMode(request);

  if (!isTestMode) {
    await authenticate.admin(request);
  }
  // ... rest of loader
};
```

**Authentication Flow**:
1. Request arrives: `http://localhost:3000/settings?mock=1`
2. `isMockMode()` checks URL for `mock=1` parameter
3. Returns `true` → authentication is **bypassed**
4. Page loads without requiring Shopify OAuth
5. Mock data is used for all API calls

---

## 🧪 Smoke Test Setup (Pilot Agent)

### For Settings Page (PILOT-006)

**Test URL**:
```
http://localhost:3000/settings?mock=1
```

**Expected Behavior**:
- ✅ Page loads without authentication
- ✅ All 4 tabs visible (Dashboard, Appearance, Notifications, Account)
- ✅ Forms render correctly
- ✅ No OAuth redirect
- ✅ No credentials required

**Verification Steps**:
1. Start local dev server: `npm run dev:vite`
2. Open browser to `http://localhost:3000/settings?mock=1`
3. Verify page loads (no auth redirect)
4. Test tab navigation
5. Verify form elements render
6. Check console for errors

### For Dashboard (Any Tile)

**Test URL**:
```
http://localhost:3000/app?mock=1
```

**Features Available**:
- ✅ All 13 dashboard tiles render
- ✅ Mock data displayed
- ✅ Modal interactions work
- ✅ Navigation functional

### For Any Route

**Pattern**:
```
http://localhost:3000/YOUR_ROUTE?mock=1
```

**Examples**:
- Approvals: `http://localhost:3000/approvals?mock=1`
- Profile: `http://localhost:3000/profile?mock=1`
- Analytics: `http://localhost:3000/analytics/growth?mock=1`

---

## 🔧 Development Setup

### Option A: URL Parameter (Recommended for Smoke Tests)

**Usage**: Append `?mock=1` to any URL

**Advantages**:
- No environment variable needed
- Works immediately
- Easy to toggle on/off
- Perfect for manual testing

**Disadvantages**:
- Must add to every URL
- Query param visible in URL

### Option B: Environment Variable (For CI/CD)

**Setup**:
```bash
# In .env.local
NODE_ENV=test
```

**Usage**: All routes automatically bypass auth

**Advantages**:
- No URL modification needed
- Consistent across all routes
- Good for automated testing

**Disadvantages**:
- Affects entire application
- Must restart server to toggle

---

## 🎭 Mock Data Behavior

When `mock=1` is active:

### Dashboard Tiles
- All tiles show **mock data**
- Refresh intervals still work
- No real API calls to Shopify/Supabase/etc.

### Settings Page
- Forms render with default values
- Changes are not persisted
- API calls return success (but don't save)

### Approvals
- Mock approvals displayed
- Actions don't execute
- Safe for testing UI/UX

**Note**: Mock data is defined in route loaders, example in `app/routes/app._index.tsx`:

```typescript
const useMockData =
  url.searchParams.get("mock") === "1" ||
  process.env.DASHBOARD_USE_MOCK === "1";

if (useMockData) {
  // Return mock data instead of real API calls
  return mockDashboardData;
}
```

---

## 🧪 E2E Test Authentication

### Playwright Tests

**File**: `tests/playwright/*.spec.ts`

**Setup**: Tests automatically use mock mode

```typescript
// Example from tests/e2e/dashboard.spec.ts
test('dashboard loads with mock data', async ({ page }) => {
  await page.goto('http://localhost:3000/app?mock=1');
  await expect(page).toHaveTitle(/HotDash/);
});
```

**No credentials needed** - mock mode bypasses all auth

---

## 🔐 Production Authentication (Reference)

For production use (not smoke tests), Shopify OAuth is required:

### Shopify App OAuth Flow

1. User installs HotDash app from Shopify Partners
2. Shopify redirects to `/auth` with `shop` parameter
3. App validates shop domain
4. Redirects to Shopify for OAuth consent
5. User approves scopes
6. Shopify redirects to `/auth/callback` with auth code
7. App exchanges code for access token
8. Session stored in Prisma database
9. User redirected to `/app` (authenticated)

**Required Environment Variables**:
```bash
SHOPIFY_API_KEY=<from Shopify Partners dashboard>
SHOPIFY_API_SECRET=<from Shopify Partners dashboard>
SHOPIFY_APP_URL=https://your-app.fly.dev
SCOPES=read_orders,read_products,read_inventory,read_locations
DATABASE_URL=<Supabase Postgres connection string>
```

**Note**: Production auth is **NOT required** for smoke testing with `?mock=1`

---

## 📊 Test Scenarios

### Scenario 1: Pilot Agent Settings Page Smoke Test

**Goal**: Verify settings page UI renders correctly

**Steps**:
1. Start dev server: `npm run dev:vite`
2. Open: `http://localhost:3000/settings?mock=1`
3. Verify: All tabs render
4. Test: Tab navigation works
5. Check: No console errors
6. Done: Mark PILOT-006 complete

**Duration**: 5-10 minutes  
**Auth Required**: ❌ None (mock mode)

### Scenario 2: Dashboard Tile Validation

**Goal**: Verify all 13 tiles render

**Steps**:
1. Start dev server: `npm run dev:vite`
2. Open: `http://localhost:3000/app?mock=1`
3. Verify: All tiles visible
4. Test: Click each tile modal
5. Check: Mock data displays
6. Done: Confirm no regressions

**Duration**: 10-15 minutes  
**Auth Required**: ❌ None (mock mode)

### Scenario 3: Approval Queue Workflow

**Goal**: Test approval actions

**Steps**:
1. Start dev server: `npm run dev:vite`
2. Open: `http://localhost:3000/approvals?mock=1`
3. Verify: Mock approvals display
4. Test: Click approve/reject buttons
5. Check: Actions don't mutate (safe)
6. Done: UI/UX validated

**Duration**: 5-10 minutes  
**Auth Required**: ❌ None (mock mode)

---

## 🚨 Troubleshooting

### Problem: "SHOPIFY_API_KEY environment variable is required"

**Cause**: Missing required environment variables (even in mock mode)

**Solution**: Create minimal `.env.local`:

```bash
# Minimal .env.local for mock mode testing
SHOPIFY_API_KEY=test-key-mock-mode
SHOPIFY_API_SECRET=test-secret-mock-mode
SHOPIFY_APP_URL=http://localhost:3000
SCOPES=read_orders,read_products
DATABASE_URL=file:./dev.db
```

**Note**: These are dummy values - authentication is bypassed with `?mock=1`

### Problem: Authentication still required with `?mock=1`

**Cause**: Route not using `isMockMode()` helper

**Solution**: Check route loader for auth bypass:

```typescript
// Correct pattern (from app/routes/app.tsx)
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const isTestMode = isMockMode(request);
  
  if (!isTestMode) {
    await authenticate.admin(request);
  }
  // ... loader logic
};
```

**Fix**: Add `isMockMode()` check before `authenticate.admin(request)`

### Problem: Settings page returns 404

**Cause**: Route file doesn't exist or build failed

**Solution**: 
1. Verify file exists: `ls -la app/routes/settings.tsx`
2. Check build: `npm run build`
3. Restart dev server: `npm run dev:vite`

---

## 📝 Test Credentials Summary

### For Smoke Testing
- **Username**: Not required
- **Password**: Not required
- **API Keys**: Dummy values OK (see `.env.local` example above)
- **Method**: Use `?mock=1` URL parameter

### For E2E Testing (Playwright)
- **Config**: `tests/playwright.config.ts`
- **Base URL**: `http://localhost:3000`
- **Auth**: Automatically bypassed with `NODE_ENV=test`
- **Mock Data**: Automatically injected

### For Production
- **Method**: Shopify OAuth (via Partners dashboard)
- **Setup**: See `docs/runbooks/production_deployment.md`
- **Not needed for smoke tests**

---

## ✅ Verification Checklist

Use this checklist to verify test auth setup is working:

- [ ] `.env.local` exists with minimal variables (see example above)
- [ ] Dev server starts: `npm run dev:vite` → No errors
- [ ] Dashboard loads: `http://localhost:3000/app?mock=1` → Page renders
- [ ] Settings loads: `http://localhost:3000/settings?mock=1` → Page renders
- [ ] Console clean: No authentication errors in browser console
- [ ] Mock data: Tiles show mock data (not real Shopify data)
- [ ] No redirects: Browser stays on localhost (no Shopify OAuth redirect)

---

## 🎯 Pilot Agent Instructions

### PILOT-006: Settings Page Smoke Test

**Unblocked**: This runbook resolves BLOCKER-003

**Steps to Execute**:
1. Ensure dev server running: `npm run dev:vite`
2. Navigate to: `http://localhost:3000/settings?mock=1`
3. Take screenshot of each tab (4 total)
4. Verify:
   - All tabs render without errors
   - Forms display correctly
   - Buttons are clickable
   - Layout is responsive
5. Log results in: `feedback/pilot/2025-10-21.md`

**No authentication setup required** - just use `?mock=1`

---

## 📚 Additional Resources

- **Mock Mode Implementation**: `app/utils/env.server.ts` (isMockMode function)
- **Auth Bypass Pattern**: `app/routes/app.tsx` (loader with isMockMode check)
- **Environment Config**: `.env.example` (all required variables)
- **Production Auth**: `docs/runbooks/production_deployment.md`
- **Secrets Management**: `docs/runbooks/secrets.md`

---

## 🔄 Updates & Maintenance

### When to Update This Doc
- New test scenarios added
- Auth bypass pattern changes
- Mock mode behavior changes
- Troubleshooting steps discovered

### Change Log
- **2025-10-21**: Initial creation (resolves BLOCKER-003)

---

**Document Status**: ✅ Complete  
**Blocks**: None  
**Unblocks**: BLOCKER-003 (Pilot Agent Settings Page Auth Required)

