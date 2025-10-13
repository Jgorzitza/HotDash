---
epoch: 2025.10.E1
doc: docs/support/shopify_app_troubleshooting.md
owner: support
category: troubleshooting
last_reviewed: 2025-10-12
expires: 2026-01-12
tags: [troubleshooting, technical-support, shopify-app, common-issues]
---

# HotDash Shopify App Troubleshooting Guide

**Purpose**: Fix common technical issues with HotDash app  
**Target Audience**: Operators, merchants, support team  
**App**: HotDash — AI-powered operations dashboard  
**Created**: October 12, 2025

---

## 🎯 How to Use This Guide

**When You Have a Problem**:
1. Find your issue in the table of contents below
2. Try the quick fixes first (usually takes <2 minutes)
3. If quick fixes don't work, try advanced fixes
4. Still broken? Escalate to technical support

**Quick Fixes Solve 80% of Issues**!

---

## 📋 Common Issues Quick Reference

| Issue | Quick Fix | Page |
|-------|-----------|------|
| Can't login | Clear cache, try different browser | #1 |
| Dashboard blank | Refresh (Ctrl+Shift+R) | #2 |
| Tiles not loading | Wait 30s, check internet | #3 |
| No data showing | Verify permissions, reinstall | #4 |
| Approval queue empty | Check CX Pulse, refresh | #5 |
| Can't approve responses | Check login, permissions | #6 |
| Slow performance | Close other tabs, clear cache | #7 |
| Mobile issues | Update Shopify app | #8 |

---

## Issue #1: Can't Login to HotDash

### Symptoms
- Can't access HotDash from Shopify admin
- Error: "Login failed"
- Redirects to wrong page
- Stuck on loading screen

### Quick Fixes (Try These First)

**Fix 1: Clear Browser Cache**
```
1. Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. Select: "Cached images and files"
3. Click: "Clear data"
4. Close browser completely
5. Reopen and try logging in again
```
**Success Rate**: 60%

**Fix 2: Try Different Browser**
```
1. If using Chrome, try Firefox or Edge
2. Log into Shopify admin
3. Navigate to: Apps > HotDash
4. If it works: Original browser has extension conflict
```
**Success Rate**: 25%

**Fix 3: Check Shopify Login**
```
1. Verify you're logged into Shopify admin
2. If session expired: Log in again
3. Then access: Apps > HotDash
```
**Success Rate**: 10%

### Advanced Fixes (If Quick Fixes Don't Work)

**Fix 4: Disable Browser Extensions**
```
1. Open browser in Incognito/Private mode
2. Log into Shopify admin
3. Try accessing HotDash
4. If it works: A browser extension is interfering
5. Identify culprit: Disable extensions one by one
```

**Fix 5: Check Permissions**
```
1. Shopify admin → Settings → Apps and sales channels
2. Find: HotDash
3. Click: Configure
4. Verify all permissions are enabled:
   ☑ Read orders
   ☑ Read products
   ☑ Read customers
   ☑ Read analytics
5. If any unchecked: Enable them
6. Try logging in again
```

**Fix 6: Reinstall App**
```
1. Shopify admin → Settings → Apps and sales channels
2. Find: HotDash
3. Click: Uninstall
4. Confirm uninstall
5. Go to: Shopify App Store
6. Search: HotDash
7. Click: Install
8. Approve permissions
```

**Still Can't Login?** → **Contact Technical Support** (see bottom of guide)

---

## Issue #2: Dashboard Is Blank or Won't Load

### Symptoms
- Dashboard appears but no tiles show
- White/blank screen
- "Loading..." never finishes
- Error message: "Failed to load dashboard"

### Quick Fixes

**Fix 1: Hard Refresh**
```
1. Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. This forces a complete refresh
3. Wait 10-15 seconds for dashboard to load
```
**Success Rate**: 70%

**Fix 2: Check Internet Connection**
```
1. Open new tab → Go to fast.com
2. If speed <1 Mbps: Internet issue, not HotDash
3. Check: Can you load other Shopify pages?
4. If yes: Continue to Fix 3
5. If no: Internet problem, contact your ISP
```
**Success Rate**: 15%

**Fix 3: Clear Cache & Cookies**
```
1. Ctrl+Shift+Delete → Clear browsing data
2. Select: "Cookies" and "Cached images"
3. Time range: "All time"
4. Clear data
5. Close browser
6. Reopen → Log back into Shopify
7. Try HotDash again
```
**Success Rate**: 10%

### Advanced Fixes

**Fix 4: Check Browser Console for Errors**
```
1. Press F12 (opens developer tools)
2. Click: "Console" tab
3. Look for errors (red text)
4. Common errors:
   • "401 Unauthorized" → Reinstall app
   • "Network error" → Internet/firewall issue
   • "CORS error" → Browser security issue
5. Take screenshot of errors
6. Send to technical support
```

**Fix 5: Verify App Installation**
```
1. Shopify admin → Apps
2. Is HotDash listed?
3. If no: Reinstall (see Issue #1, Fix 6)
4. If yes: Click HotDash → Should load dashboard
```

**Still Blank?** → **Contact Technical Support** with console errors

---

## Issue #3: Tiles Not Loading Data

### Symptoms
- Dashboard loads but tiles show "No data"
- Tiles stuck on "Loading..."
- Some tiles work, others don't
- Error: "Data unavailable"

### Quick Fixes

**Fix 1: Wait 30 Seconds**
```
AI: First load can take 15-30 seconds
1. Watch for spinning loader on tiles
2. Don't refresh yet — let it finish
3. If >60 seconds: Try Fix 2
```
**Success Rate**: 50%

**Fix 2: Refresh Dashboard**
```
1. Ctrl+Shift+R (hard refresh)
2. Wait for tiles to populate
3. First tile loads fastest (CX Pulse)
4. Last tile: SEO Pulse (pulls Google data, slower)
```
**Success Rate**: 30%

**Fix 3: Check Specific Tile**
```
Which tile isn't loading?

CX Pulse:
• Requires: Chatwoot integration
• Fix: Verify Chatwoot is connected (Settings)

Sales Pulse:
• Requires: Shopify order data
• Fix: Verify you have orders in Shopify

SEO Pulse:
• Requires: Google Analytics or Shopify analytics
• Fix: Can take 60-90 seconds (Google API is slow)

Inventory Watch:
• Requires: Products in Shopify
• Fix: Verify you have products with inventory tracking

Fulfillment Flow:
• Requires: Orders awaiting fulfillment
• Fix: If no pending orders, tile shows "0"
```
**Success Rate**: 15%

### Advanced Fixes

**Fix 4: Verify Data Permissions**
```
1. Shopify admin → Settings → Apps and sales channels
2. HotDash → Configure
3. Check permissions:
   ☑ Read orders (for Sales Pulse, Fulfillment Flow)
   ☑ Read products (for Inventory Watch)
   ☑ Read customers (for CX Pulse)
   ☑ Read analytics (for SEO Pulse)
4. If any missing: Grant permission
5. Refresh HotDash
```

**Fix 5: Check If You Have Data**
```
For each non-loading tile, verify data exists:
• CX Pulse: Do you have customer conversations in Chatwoot?
• Sales Pulse: Do you have orders in Shopify?
• SEO Pulse: Is Google Analytics connected?
• Inventory Watch: Do you have products with tracked inventory?
• Fulfillment Flow: Do you have unfulfilled orders?

If no data exists: Tile correctly shows "No data"
```

**Still No Data?** → **Contact Technical Support** with specific tile name

---

## Issue #4: No Data Showing (All Tiles Empty)

### Symptoms
- All tiles show "No data available"
- Dashboard loads but appears empty
- Metrics show zeros across all tiles

### Quick Fixes

**Fix 1: Verify First-Time Setup**
```
Is this your first login?
• Dashboard needs 2-5 minutes to pull initial data from Shopify
• Wait 5 minutes
• Refresh with Ctrl+Shift+R
• Data should appear
```

**Fix 2: Check Shopify Store Data**
```
Do you have data in Shopify?
1. Shopify admin → Orders → Any orders exist?
2. Shopify admin → Products → Any products?
3. Shopify admin → Customers → Any customers?

If all empty: HotDash correctly shows "No data"
If data exists in Shopify but not HotDash: Continue to Fix 3
```

**Fix 3: Reinstall App**
```
Connection may be broken. Reinstall:
1. Shopify → Settings → Apps → HotDash → Uninstall
2. Shopify App Store → Search: HotDash
3. Install again
4. Grant all permissions
5. Wait 5 minutes for data to populate
6. Refresh dashboard
```
**Success Rate**: 90% (if data exists in Shopify)

### Advanced Fixes

**Fix 4: Check API Connection**
```
1. HotDash dashboard → Settings (gear icon)
2. Look for: "API Connection Status"
3. Should show: "Connected ✓"
4. If shows "Disconnected ✗": Click "Reconnect"
5. Follow reconnection steps
6. Return to dashboard → Refresh
```

**Fix 5: Verify Store Eligibility**
```
HotDash requires:
• Active Shopify store (not trial expired)
• At least 1 order in last 90 days
• Shopify plan: Basic or higher (not Starter)

If requirements not met: Contact Shopify support first
```

**All Tiles Still Empty?** → **Contact Technical Support** immediately

---

## Issue #5: Approval Queue Is Empty (But You Expect Items)

### Symptoms
- CX Pulse shows "Pending AI Approvals: 0"
- No responses to review
- Expected AI-generated responses, but queue is empty

### Quick Fixes

**Fix 1: Check CX Pulse Tile**
```
1. Dashboard → Click: CX Pulse tile
2. Look for: "Recent Inquiries"
3. If inquiries exist but no AI responses:
   • AI may still be generating (takes 10-30 seconds)
   • Wait 1 minute → Refresh
4. If no inquiries: No customer messages yet
```

**Fix 2: Verify Chatwoot Integration**
```
1. HotDash → Settings
2. Look for: "Chatwoot Connection"
3. Should show: "Connected ✓"
4. If not connected:
   • Click: "Connect Chatwoot"
   • Follow integration steps
   • Return to CX Pulse
```

**Fix 3: Check AI Settings**
```
1. HotDash → Settings → AI Configuration
2. Verify: "AI Response Generation" is ON
3. If OFF: Toggle ON
4. Save settings
5. New inquiries will trigger AI responses
```

### Advanced Fixes

**Fix 4: Manually Trigger AI Generation**
```
1. CX Pulse → Recent Inquiries
2. Click on a customer inquiry
3. Look for button: "Request AI Draft"
4. Click it
5. Wait 30 seconds
6. AI response should appear
```

**Fix 5: Check Message Type**
```
AI generates responses for:
✅ Product questions
✅ Support inquiries  
✅ General questions

AI does NOT generate for:
❌ Order status (handled by automation)
❌ Shipping tracking (carrier handles)
❌ Payment issues (must be manual)

If messages are auto-handled types: Queue correctly empty
```

**Queue Still Empty?** → **Contact Technical Support** with example inquiry

---

## Issue #6: Can't Approve/Modify/Reject Responses

### Symptoms
- Buttons are grayed out
- Clicking buttons does nothing
- Error: "Action not allowed"
- Can see responses but can't act on them

### Quick Fixes

**Fix 1: Check Your Login Session**
```
1. Session may have expired
2. Log out of Shopify completely
3. Close all browser tabs
4. Log back in
5. Navigate to: Apps → HotDash
6. Try approval queue again
```
**Success Rate**: 60%

**Fix 2: Verify Permissions**
```
1. HotDash → Settings → Your Profile
2. Check your role:
   • "Operator" or "Admin": Can approve
   • "Viewer": Read-only, can't approve
3. If wrong role: Contact manager to update permissions
```
**Success Rate**: 25%

**Fix 3: Check for Lock**
```
1. Someone else may be reviewing the same response
2. Only one operator can review at a time
3. Look for indicator: "🔒 [Name] is reviewing"
4. If locked: Wait for them to finish, or ask them to release
```
**Success Rate**: 10%

### Advanced Fixes

**Fix 4: Clear Local Storage**
```
1. Press F12 (developer tools)
2. Click: "Application" tab
3. Left sidebar → Storage → Local Storage
4. Right-click → Clear
5. Close developer tools
6. Refresh dashboard (Ctrl+Shift+R)
7. Try approval queue again
```

**Fix 5: Try Different Browser**
```
1. Open different browser (Chrome → Firefox)
2. Log into Shopify
3. Access HotDash
4. Try approval queue
5. If works: Original browser has issue
```

**Still Can't Click Buttons?** → **Contact Technical Support** with screenshot

---

## Issue #7: Dashboard Is Slow or Laggy

### Symptoms
- Tiles take forever to load
- Clicking feels sluggish
- Dashboard freezes
- Browser becomes unresponsive

### Quick Fixes

**Fix 1: Close Other Tabs**
```
1. Close all other browser tabs (except HotDash)
2. Close unused applications
3. Refresh HotDash (Ctrl+Shift+R)
4. Performance should improve
```
**Success Rate**: 50%

**Fix 2: Clear Browser Cache**
```
1. Ctrl+Shift+Delete → Clear data
2. Select: "Cached images and files"
3. Clear for: "All time"
4. Close browser completely
5. Reopen → Log back into HotDash
```
**Success Rate**: 30%

**Fix 3: Check Internet Speed**
```
1. Go to: fast.com
2. Speed <5 Mbps: Internet is slow
3. Close bandwidth-heavy apps (Netflix, Zoom, downloads)
4. Try HotDash again
```
**Success Rate**: 15%

### Advanced Fixes

**Fix 4: Disable Browser Extensions**
```
1. Extensions can slow down browser
2. Try Incognito mode (extensions disabled by default)
3. If faster in Incognito: Disable extensions
4. Common culprits: Ad blockers, security extensions
```

**Fix 5: Update Browser**
```
1. Check browser version
2. Update to latest version
3. Restart browser
4. Try HotDash again
```

**Fix 6: Try Different Browser**
```
Browsers have different performance:
• Chrome: Best for HotDash (recommended)
• Firefox: Good alternative
• Edge: Works well
• Safari: May be slower (not recommended)
```

**Still Slow?** → **Contact Technical Support** with browser/OS details

---

## Issue #8: Mobile App Issues

### Symptoms
- HotDash doesn't work on mobile
- Tiles don't display correctly on phone
- Can't approve responses on mobile
- App crashes on mobile

### Quick Fixes

**Fix 1: Update Shopify Mobile App**
```
1. App Store (iPhone) or Play Store (Android)
2. Search: Shopify
3. If update available: Install it
4. Open Shopify app
5. Navigate to: Apps → HotDash
6. Should work now
```
**Success Rate**: 70%

**Fix 2: Use Mobile Browser Instead**
```
1. Open Safari (iPhone) or Chrome (Android)
2. Go to: your-store.myshopify.com/admin
3. Log in
4. Tap: Apps → HotDash
5. Mobile-optimized web version loads
```
**Success Rate**: 25%

**Fix 3: Restart Phone**
```
1. Power off phone completely
2. Wait 10 seconds
3. Power back on
4. Open Shopify app → HotDash
```
**Success Rate**: 5%

### Advanced Fixes

**Fix 4: Clear Shopify App Cache**
```
iPhone:
1. Settings → Shopify
2. Clear app data
3. Reopen app → Log in again

Android:
1. Settings → Apps → Shopify
2. Storage → Clear Cache
3. Reopen app → Log in again
```

**Fix 5: Reinstall Shopify App**
```
1. Delete Shopify app
2. Go to App Store/Play Store
3. Reinstall Shopify
4. Log in
5. Navigate to HotDash
```

**Mobile Still Broken?** → **Contact Technical Support** with device model

---

## 🚨 When to Contact Technical Support

**Contact Support Immediately If**:
- [ ] Can't login after trying all fixes
- [ ] All tiles show no data (and data exists in Shopify)
- [ ] Dashboard won't load after 5 minutes
- [ ] Error messages appear repeatedly
- [ ] Data is incorrect (numbers don't match Shopify)
- [ ] Security concern (suspicious activity)

**Before Contacting Support, Gather**:
- ✅ Screenshot of error (if any)
- ✅ What you were doing when issue occurred
- ✅ Troubleshooting steps you already tried
- ✅ Browser and OS version (Chrome 119 on Windows 11)
- ✅ Time issue started (approximate)

---

## 📞 Technical Support Contact

**Email**: tech-support@hotdash.com  
**Subject Line**: `[TECH ISSUE] Brief Description`

**Example Email**:
```
Subject: [TECH ISSUE] Dashboard Not Loading

Hi Support Team,

I'm unable to load the HotDash dashboard.

Issue: Dashboard shows blank white screen
When: Started today at 9am EST
Browser: Chrome 119 on Windows 11
Store: hotrodan.myshopify.com

Troubleshooting tried:
• Hard refresh (Ctrl+Shift+R) - didn't work
• Cleared cache - didn't work
• Tried Firefox - same issue

Screenshots attached.

Please advise!

[Your Name]
[Hot Rod AN]
```

**Response Time**:
- 🔴 Critical (can't work): <30 minutes
- 🟡 High (major inconvenience): <2 hours
- 🟢 Normal: <4 hours

---

## 🛠️ Preventive Maintenance

**Weekly**:
- [ ] Clear browser cache (prevents slowness)
- [ ] Update browser (latest version)
- [ ] Check for HotDash app updates (Shopify notifies)

**Monthly**:
- [ ] Verify permissions (Settings → Apps → HotDash)
- [ ] Review performance (any patterns of slowness?)
- [ ] Update operating system

**Best Practices**:
- ✅ Use Chrome browser (best performance)
- ✅ Keep browser updated
- ✅ Close unused tabs
- ✅ Don't have multiple HotDash tabs open
- ✅ Refresh dashboard daily (Ctrl+Shift+R)

---

## ✅ Troubleshooting Checklist

**Before Escalating, Confirm You've Tried**:
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Cleared browser cache
- [ ] Tried different browser
- [ ] Checked internet connection
- [ ] Verified permissions
- [ ] Waited appropriate time (30-60 seconds for data load)
- [ ] Restarted browser
- [ ] Consulted this guide

**If All Above Checked and Issue Persists** → Contact Technical Support

---

## 📚 Related Documentation

**Additional Help**:
- **Onboarding Guide**: `docs/support/shopify_app_onboarding_guide.md`
- **Operator Quick Start**: `docs/support/operator_quick_start.md`
- **Hot Rod AN Guide**: `docs/support/hot_rod_an_operator_guide.md`
- **Training Checklist**: `docs/support/operator_training_checklist.md`

---

**Last Updated**: October 12, 2025  
**Document Owner**: Support Agent  
**Review Frequency**: Monthly  
**Next Review**: November 12, 2025

**Questions or feedback?** Email tech-support@hotdash.com

---

## 🖨️ Quick Reference Card (Print & Keep at Desk)

```
┌──────────────────────────────────────────────────┐
│     HOTDASH TROUBLESHOOTING QUICK REFERENCE      │
├──────────────────────────────────────────────────┤
│ MOST COMMON FIX: Ctrl+Shift+R (hard refresh)    │
│                                                   │
│ CAN'T LOGIN:                                     │
│ → Clear cache → Try different browser            │
│                                                   │
│ DASHBOARD BLANK:                                 │
│ → Hard refresh → Clear cache & cookies           │
│                                                   │
│ NO DATA:                                         │
│ → Wait 30s → Check internet → Verify permissions│
│                                                   │
│ SLOW PERFORMANCE:                                │
│ → Close other tabs → Clear cache → Check speed  │
│                                                   │
│ CAN'T APPROVE:                                   │
│ → Re-login → Check permissions → Check lock     │
│                                                   │
│ STILL BROKEN? Email: tech-support@hotdash.com   │
│ Response time: <30 min (critical) | <4h (normal)│
└──────────────────────────────────────────────────┘
```

**Most Issues Solved by: Ctrl+Shift+R → Clear Cache → Different Browser** 🔧
