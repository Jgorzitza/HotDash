# 🚨 P0 FIX: Shopify App Configuration Update

**Priority**: P0 - Launch Blocker  
**Fix Time**: ~10 minutes  
**Status**: Configuration file ready

---

## Problem

Shopify app currently points to **dead Cloudflare tunnel**:

```
https://physiology-spoken-magnificent-much.trycloudflare.com/
```

**Should point to**:

```
https://hotdash-staging.fly.dev
```

---

## Fix Instructions for CEO/Manager

### Option 1: Via Shopify Partners Dashboard (Recommended - 5 min)

1. **Navigate to**: https://partners.shopify.com/
2. **Select**: HotDash app (Client ID: 4f72376ea61be956c860dd020552124d)
3. **Go to**: App Setup → Configuration
4. **Update** these fields:

   **App URL**:

   ```
   https://hotdash-staging.fly.dev
   ```

   **Allowed redirection URLs** (add all):

   ```
   https://hotdash-staging.fly.dev/auth/callback
   https://hotdash-staging.fly.dev/auth/shopify/callback
   https://hotdash-staging.fly.dev/api/auth/callback
   ```

5. **Save** configuration
6. **Disable** "App preview" mode in Dev Console
7. **Wait** 1-2 minutes for propagation

### Option 2: Via Shopify CLI (If Config File Exists - 3 min)

```bash
cd ~/HotDash/hot-dash

# Update via CLI (if shopify.app.hotdash.toml exists)
shopify app config push --config hotdash
```

---

## Verification Steps

After configuration update:

1. **Test App URL**:

   ```bash
   curl -I https://hotdash-staging.fly.dev
   ```

   Should return: HTTP 200 ✅

2. **Open in Shopify Admin**:

   ```
   https://admin.shopify.com/store/hotroddash/apps/hotdash
   ```

   Should load dashboard without DNS error ✅

3. **Verify OAuth**:
   - Click any dashboard interaction
   - Should not see authentication errors
   - Session should persist

4. **Test Tiles**:
   - Revenue tile loads data
   - Inventory tile loads data
   - All tiles render correctly

---

## Files Created

**Configuration File**: `shopify.app.hotdash.toml`

- Application URL: https://hotdash-staging.fly.dev ✅
- Redirect URLs: All 3 callback patterns ✅
- Client ID: 4f72376ea61be956c860dd020552124d ✅
- Webhooks: app/uninstalled, app/scopes_update ✅

**This File**: `SHOPIFY_CONFIG_FIX.md` (instructions)

---

## After Fix Complete

1. **Notify Pilot Agent**: Configuration fixed, proceed with dashboard testing
2. **Notify QA Agent**: App functional, proceed with UX validation
3. **Notify Designer Agent**: App accessible, proceed with visual review
4. **Update Launch Status**: Remove P0 blocker from launch checklist

---

## Expected Timeline

- Configuration change: 5-10 minutes
- Propagation: 1-2 minutes
- Verification: 2-3 minutes
- **Total**: ~15 minutes

**Impact**: Unblocks 3 agents (Pilot, QA, Designer) to complete dashboard validation

---

## Evidence

**Pilot Report**: `feedback/pilot/2025-10-19-CRITICAL-APP-CONFIG.md`  
**Screenshot**: `artifacts/pilot/08-app-config-issue.png`  
**Production Server**: ✅ Verified healthy  
**Current App URL**: ❌ Dead tunnel

---

**Status**: ✅ Configuration file ready for CEO to push to Shopify Partners Dashboard
