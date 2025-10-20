# 🚨 CRITICAL: Shopify App Misconfiguration - P0 BLOCKER

**Date**: 2025-10-19T21:00:00Z  
**Severity**: **P0 - LAUNCH BLOCKER**  
**Reported By**: Pilot Agent  
**Escalated To**: Manager  

---

## Issue Summary

The HotDash Shopify app is configured to point to a **local development tunnel** instead of the **production Fly.io deployment**, causing the app to be completely non-functional in Shopify Admin.

---

## Evidence

### Current Configuration (INCORRECT) ❌

**App URL in Shopify**: 
```
https://physiology-spoken-magnificent-much.trycloudflare.com/
```

**Status**: DNS lookup failure (tunnel not running)

**Error Message**: 
```
"physiology-spoken-magnificent-much.trycloudflare.com's server IP address could not be found."
```

**Dev Console Shows**:
- ⚠️ App preview: **ON**
- ⚠️ Status: "Previewing your local changes"
- ⚠️ Extensions appear when you run `shopify app dev`

### Expected Configuration (CORRECT) ✅

**Production URL Should Be**: 
```
https://hotdash-staging.fly.dev
```

**Status**: Production server healthy and accessible (verified earlier)

---

## Root Cause

1. **App was switched to dev mode** at some point
2. **Cloudflare tunnel URL** was saved as app URL
3. **Tunnel is not running** (local dev stopped)
4. **Production URL** (Fly.io) is not configured in Shopify

---

## Impact

### Current State
- ✅ Production server running: `https://hotdash-staging.fly.dev`
- ❌ Shopify app URL: Points to dead Cloudflare tunnel
- ❌ App unusable in Shopify Admin
- ❌ Dashboard testing blocked
- ❌ Launch blocked

### User Experience
- Store owner sees error iframe in Shopify Admin
- App appears broken/non-functional
- Cannot access dashboard or any features

---

## Required Fix

### Shopify App Configuration Update

**Location**: Shopify Partners Dashboard → HotDash App → Configuration

**Changes Needed**:

1. **App URL**: 
   - Current: `https://physiology-spoken-magnificent-much.trycloudflare.com/`
   - Change to: `https://hotdash-staging.fly.dev`

2. **Allowed redirection URLs**:
   - Ensure `https://hotdash-staging.fly.dev/auth/callback` is allowed
   - Ensure `https://hotdash-staging.fly.dev/auth/shopify/callback` is allowed

3. **Disable Dev Preview Mode**:
   - Turn off "App preview" in Dev Console
   - Ensure production mode is active

4. **Verify App Proxy** (if configured):
   - Should point to `https://hotdash-staging.fly.dev/proxy`

---

## Verification Steps

After configuration change:

1. Navigate to: `https://admin.shopify.com/store/hotroddash/apps/hotdash`
2. Verify iframe loads without DNS error
3. Verify dashboard displays correctly
4. Test tile interactions
5. Test approval workflows

---

## Screenshots

**Evidence**: `artifacts/pilot/08-app-config-issue.png`
- Shows Cloudflare tunnel URL
- Shows DNS error in iframe
- Shows Dev Console with "App preview ON"

---

## Store Details

**Correct Store**: `hotroddash` (NOT `hotrodan`)
**App ID**: `gid://shopify/App/285941530625`
**Current App URL**: https://admin.shopify.com/store/hotroddash/apps/hotdash

---

## Priority & Urgency

**Priority**: **P0 - Critical Launch Blocker**

**Why P0**:
- App completely non-functional
- User cannot access any features
- Launch cannot proceed
- Pre-launch UX validation incomplete (blocked by this issue)

**Urgency**: **Immediate**

**ETA for Fix**: ~10 minutes (configuration change only)

---

## Next Steps

### For Manager:

1. **Access Shopify Partners Dashboard**:
   - Navigate to: https://partners.shopify.com/
   - Select HotDash app
   - Go to App Setup → Configuration

2. **Update App URL**:
   - Change URL to: `https://hotdash-staging.fly.dev`
   - Save configuration
   - Wait 1-2 minutes for propagation

3. **Disable Dev Mode**:
   - Turn off "App preview" in Shopify Admin Dev Console
   - Reload app page

4. **Verify Fix**:
   - Reload: https://admin.shopify.com/store/hotroddash/apps/hotdash
   - Confirm dashboard loads
   - Screenshot showing working state

5. **Notify Pilot**:
   - Once fixed, Pilot will complete remaining 3 molecules:
     - PIL-002: Dashboard Tile Interaction Testing
     - PIL-003: Approvals HITL Flow Validation
     - PIL-006: Error Scenario Testing

### For Pilot (After Fix):

1. Wait for Manager confirmation
2. Navigate to app URL
3. Complete dashboard testing
4. Update UX validation report
5. Provide final launch recommendation

---

## Impact on Launch Timeline

**Current Status**: ⏸️ **LAUNCH PAUSED**

**Reason**: App non-functional due to configuration

**Time to Resolution**: ~15 minutes
- 10 minutes: Configuration change
- 5 minutes: Verification and propagation

**After Fix**: Can proceed with launch immediately (pre-auth validation already passed with 8.9/10 score)

---

## Related Files

- UX Validation Report: `reports/pilot/ux-validation-2025-10-19.md`
- Feedback Log: `feedback/pilot/2025-10-19.md`
- Evidence Screenshot: `artifacts/pilot/08-app-config-issue.png`

---

## Communication

**Status**: 🔴 **ESCALATED TO MANAGER**

**Escalation Time**: 2025-10-19T21:00:00Z

**Awaiting**: Manager action on Shopify app configuration

---

## Context: What Still Works

Despite this configuration issue, the following remain validated and ready:

✅ Production server healthy (`https://hotdash-staging.fly.dev`)  
✅ Landing page functional  
✅ OAuth flow working  
✅ Performance excellent (LCP 142ms)  
✅ Mobile responsive  
✅ Accessibility acceptable  
✅ Copy effective  

**Only blocked**: Dashboard features (require correct app URL configuration)

---

**This is a configuration issue, not a code issue. Fix time: ~10 minutes.**

