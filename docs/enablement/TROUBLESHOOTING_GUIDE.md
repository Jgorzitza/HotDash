# HotDash Dashboard - Troubleshooting Guide

**Version**: 1.0  
**Date**: October 12, 2025  
**Owner**: Enablement Agent  
**Purpose**: Quick solutions for common HotDash issues  
**Audience**: All HotDash users

---

## 🆘 Quick Reference

| Issue | Quick Fix | Section |
|-------|-----------|---------|
| Can't log in | Clear cache, reset password | [Login Issues](#login-issues) |
| Tile shows "No data" | Check integration, expand time window | [Data Issues](#data-issues) |
| Numbers don't match Shopify | Time zone, sync delay, filters | [Data Accuracy](#data-accuracy-issues) |
| Page loads slowly | Clear cache, check internet | [Performance Issues](#performance-issues) |
| Dashboard looks broken | Browser compatibility, clear cache | [Display Issues](#display-issues) |
| Can't export data | Check browser permissions, file size | [Export Issues](#export-issues) |

**Can't find your issue?** Scroll down for detailed troubleshooting or contact support@hotdash.com.

---

## 🔐 Login Issues

### Problem: "Invalid credentials" error
**Symptoms**: Can't log in, even with correct email/password.

**Solutions**:
1. **Check Caps Lock** - Passwords are case-sensitive
2. **Reset password**:
   - Click "Forgot password?"
   - Check email (including spam) for reset link
   - Use temporary password to log in
   - Set new permanent password
3. **Verify email address**: Make sure you're using the email associated with your HotDash account
4. **Clear browser cache** (see [Display Issues](#display-issues))

**Still stuck?** Contact support@hotdash.com with your email address.

---

### Problem: Password reset email not arriving
**Symptoms**: Clicked "Forgot password" but no email received.

**Solutions**:
1. **Check spam/junk folder** - Sometimes email filters are aggressive
2. **Wait 5-10 minutes** - Email delivery can be delayed
3. **Verify email address** - Make sure you entered the correct email
4. **Check email rules** - Your company may block external emails
5. **Request again** - Click "Forgot password" one more time

**Still stuck?** Email support@hotdash.com from the email address associated with your account.

---

### Problem: Account locked after multiple failed logins
**Symptoms**: "Account locked" message after several login attempts.

**Solutions**:
1. **Wait 15 minutes** - Account auto-unlocks after cooldown period
2. **Don't keep trying** - More attempts extend the lockout
3. **Use password reset** while waiting (email still works)

**Security note**: This protects your account from brute-force attacks. It's a feature, not a bug!

---

## 📊 Data Issues

### Problem: Tile shows "No data available"
**Symptoms**: Tile is empty or shows "No data" message.

**Solutions by Tile**:

**Sales Pulse**:
1. Check time window - Try "Last 7 Days" instead of "Today"
2. Verify Shopify integration (Settings → Integrations → Shopify)
3. Ensure orders exist in Shopify for this time period
4. Wait 5 minutes for initial sync (new accounts)

**CX Escalations**:
1. Verify Chatwoot integration (Settings → Integrations → Chatwoot)
2. Check if conversations exist in Chatwoot
3. Ensure SLA thresholds are configured (Settings → CX Escalations)

**Fulfillment Health**:
1. If "All orders on track," this is correct (not an error)
2. Check Shopify for unfulfilled orders - are there any?
3. If orders exist but tile is empty, wait 5 min for sync

**Inventory Heatmap**:
1. If "No low stock alerts," this is correct (not an error)
2. Check inventory levels in Shopify - are any low?
3. Verify alert thresholds (Settings → Inventory → Alert threshold)

**SEO Content**:
1. Verify Google Analytics integration (Settings → Integrations → GA4)
2. Ensure GA4 property ID is correct
3. GA4 data has 24-48h delay - check "Last 7 Days" view
4. Verify GA4 is collecting data (check GA4 dashboard)

**Ops Metrics**:
1. New accounts need 7 days of data before metrics appear
2. If "No data yet," wait until more history accumulates
3. Check Settings → Ops Metrics → Tracking enabled

---

### Problem: "Unable to load data" or "Connection error"
**Symptoms**: Tile shows error message instead of data.

**Solutions**:
1. **Check internet connection** - Open other websites to verify
2. **Refresh the page** (F5 or Ctrl+R)
3. **Check HotDash status page**: https://status.hotdash.com
4. **Try different browser** - Could be browser-specific issue
5. **Disable VPN** temporarily (if using one)
6. **Check firewall** - Corporate firewalls may block API calls

**Still stuck?** Screenshot the error and email support@hotdash.com.

---

### Problem: Data is outdated (not refreshing)
**Symptoms**: Tile shows old data, manual refresh doesn't help.

**Solutions**:
1. **Check update frequency**:
   - Sales Pulse: 5 min
   - CX Escalations: 2 min
   - Fulfillment Health: 5 min
   - Inventory Heatmap: 15 min
   - SEO Content: Hourly (GA4 has 24-48h delay)
   - Ops Metrics: 15 min
2. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Clear cache** (see [Display Issues](#display-issues))
4. **Check integration status** (Settings → Integrations)

**Still stuck?** Note the tile name and timestamp, contact support.

---

## 🎯 Data Accuracy Issues

### Problem: Numbers don't match Shopify
**Symptoms**: Revenue, order count, or inventory in HotDash differs from Shopify.

**Common Causes & Solutions**:

1. **Time Zone Difference**:
   - HotDash uses your account time zone (Settings → General)
   - Shopify uses store time zone
   - If different, "Today" will show different data
   - **Fix**: Match time zones or use date ranges instead of "Today"

2. **Sync Delay**:
   - HotDash syncs every 5 minutes
   - Just placed an order in Shopify? Wait 5 min
   - **Fix**: Refresh after 5-10 minutes

3. **Refunds Not Reflected**:
   - HotDash shows *net* revenue (after refunds)
   - Shopify admin may show *gross* revenue
   - **Fix**: Check Shopify Reports → Sales, not Orders page

4. **Filters Applied**:
   - Shopify may be filtering by location, tag, etc.
   - HotDash shows all orders by default
   - **Fix**: Remove filters in Shopify or adjust HotDash filters (Settings → Sales Pulse)

5. **Multi-Currency Conversion**:
   - HotDash converts to base currency
   - Shopify may show original currency
   - **Fix**: Check currency settings (Settings → General → Currency)

**Still mismatched?** Email support with:
- Tile name (e.g., "Sales Pulse")
- HotDash value vs. Shopify value
- Screenshot of both
- Time window used

---

### Problem: Numbers don't match Google Analytics
**Symptoms**: SEO Content tile shows different session counts than GA4.

**Common Causes & Solutions**:

1. **Landing Pages vs. All Pages**:
   - HotDash shows *landing page* sessions (where user first landed)
   - GA4 default view shows *all* pageviews
   - **Fix**: In GA4, go to Reports → Engagement → Landing pages (should match)

2. **Time Zone Difference**:
   - Same as Shopify issue above
   - **Fix**: Match time zones

3. **Internal Traffic Filtering**:
   - HotDash may exclude internal traffic (your team's visits)
   - GA4 default includes everyone
   - **Fix**: Check Settings → SEO → Exclude internal traffic

4. **Data Sampling**:
   - GA4 uses sampling for large datasets
   - HotDash uses full data
   - **Fix**: Small differences (1-5%) are normal

5. **24-48h Data Delay**:
   - GA4 data isn't final until 48h later
   - Early numbers may change slightly
   - **Fix**: Compare data that's >48h old

**Still mismatched?** Compare apples to apples:
- Use same time zone
- Compare landing pages, not all pages
- Use data >48h old

---

### Problem: Numbers don't match Chatwoot
**Symptoms**: CX Escalations tile shows different SLA breach count than Chatwoot.

**Common Causes & Solutions**:

1. **Different SLA Thresholds**:
   - HotDash SLA settings may differ from Chatwoot's
   - **Fix**: Check Settings → CX Escalations → SLA thresholds
   - Make them match Chatwoot's settings

2. **Sync Delay**:
   - HotDash syncs every 2 minutes
   - Just replied in Chatwoot? Wait 2 min
   - **Fix**: Refresh tile after 2-5 minutes

3. **Time Zone Difference**:
   - Same issue as above
   - **Fix**: Match time zones

4. **Filter Differences**:
   - HotDash may filter by team or conversation status
   - Chatwoot default view shows all
   - **Fix**: Check Settings → CX Escalations → Filters

**Still mismatched?** Contact support with screenshots of both systems.

---

## 🐌 Performance Issues

### Problem: Dashboard loads slowly
**Symptoms**: Takes >10 seconds to load, or tiles load one by one.

**Solutions**:

1. **Check Internet Speed**:
   - Run speed test: https://fast.com
   - Need: >5 Mbps download for smooth experience
   - **Fix**: Move closer to WiFi, use wired connection, or upgrade internet

2. **Close Other Tabs**:
   - Browser memory gets full with many tabs
   - **Fix**: Close unused tabs, especially heavy sites (YouTube, Netflix)

3. **Clear Browser Cache**:
   - Cache can become corrupted over time
   - **Fix**: See [Display Issues](#display-issues) for cache clearing steps

4. **Update Browser**:
   - Old browsers are slower and may have bugs
   - **Fix**: Update to latest Chrome, Firefox, Safari, or Edge

5. **Disable Browser Extensions**:
   - Ad blockers, VPNs, etc. can slow things down
   - **Fix**: Try in Incognito/Private mode (extensions usually disabled)

6. **Check CPU Usage**:
   - Other apps using CPU can slow browser
   - **Fix**: Close Zoom, Slack, large spreadsheets while using HotDash

7. **Use Recommended Browser**:
   - Best: Chrome, Edge (Chromium)
   - Good: Firefox, Safari
   - Avoid: Internet Explorer (no longer supported)

**Still slow?** Contact support with:
- Browser name and version
- Operating system
- Internet speed test result
- Which tile(s) are slowest

---

### Problem: Tile is stuck "Loading..."
**Symptoms**: Tile shows loading spinner indefinitely.

**Solutions**:
1. **Wait 30 seconds** - Large datasets take time
2. **Refresh page** (F5)
3. **Hard refresh** (Ctrl+Shift+R)
4. **Check integration** (Settings → Integrations) - Is it connected?
5. **Try shorter time window** - "Last 7 Days" loads faster than "Last 30 Days"

**Still stuck after 60 seconds?** Screenshot and contact support.

---

## 🖥️ Display Issues

### Problem: Dashboard looks broken or misaligned
**Symptoms**: Tiles overlapping, buttons missing, strange layout.

**Solutions**:

1. **Clear Browser Cache**:

   **Chrome**:
   - Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Select "All time"
   - Check "Cached images and files"
   - Click "Clear data"

   **Firefox**:
   - Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Select "Everything"
   - Check "Cache"
   - Click "Clear Now"

   **Safari**:
   - Safari → Preferences → Privacy → Manage Website Data
   - Search "hotdash.com"
   - Remove
   - Click "Done"

2. **Hard Refresh**:
   - Windows: Ctrl+Shift+R or Ctrl+F5
   - Mac: Cmd+Shift+R

3. **Try Incognito/Private Mode**:
   - Chrome: Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)
   - Firefox: Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)
   - Safari: File → New Private Window
   - If it works in Incognito, clear cache (see above)

4. **Update Browser** to latest version

5. **Disable Browser Extensions**:
   - Some extensions (esp. ad blockers) break layout
   - Try in Incognito (extensions usually off) to test

6. **Check Browser Zoom**:
   - Press Ctrl+0 (Windows) or Cmd+0 (Mac) to reset zoom to 100%
   - HotDash is optimized for 90-110% zoom

**Still broken?** Screenshot and email support with:
- Browser name and version
- Operating system
- Extensions installed
- Does it work in Incognito?

---

### Problem: Text is too small or too large
**Symptoms**: Dashboard is hard to read due to text size.

**Solutions**:
1. **Browser Zoom**:
   - Zoom in: Ctrl+ (Windows) or Cmd+ (Mac)
   - Zoom out: Ctrl- (Windows) or Cmd- (Mac)
   - Reset: Ctrl+0 (Windows) or Cmd+0 (Mac)

2. **Operating System Display Settings**:
   - Windows: Settings → System → Display → Scale
   - Mac: System Preferences → Displays → Scaled
   - Recommended: 100-125% scale

3. **Check Browser Accessibility Settings**:
   - Chrome: Settings → Appearance → Font size
   - Firefox: Options → General → Zoom

**Note**: HotDash respects your browser/OS settings. Adjust those first before requesting changes.

---

### Problem: Can't see dropdown menus or modals
**Symptoms**: Click "View details" or "Time window" but nothing happens.

**Solutions**:
1. **Disable Pop-up Blocker**:
   - Chrome: Settings → Privacy and security → Site settings → Pop-ups → Allow for hotdash.com
   - Firefox: Options → Privacy & Security → Permissions → Block pop-up windows → Exceptions → Allow hotdash.com

2. **Check for Overlapping Windows**:
   - Modal may be behind another window
   - Press Esc to close any hidden modals
   - Refresh page and try again

3. **Disable Browser Extensions**:
   - Try in Incognito mode

**Still stuck?** Contact support.

---

## 📥 Export Issues

### Problem: Can't export data (CSV/Excel)
**Symptoms**: Click "Export" but nothing downloads.

**Solutions**:
1. **Check Browser Download Settings**:
   - Chrome: Settings → Downloads → Location (should be set)
   - Ensure "Ask where to save each file before downloading" is off (or you'll need to confirm)

2. **Disable Pop-up Blocker** (export may use pop-up):
   - See [Display Issues](#display-issues) section above

3. **Check File Size**:
   - Very large datasets (>50MB) may take 1-2 minutes to prepare
   - Wait 2 min before trying again

4. **Try Different Format**:
   - If CSV fails, try Excel
   - If Excel fails, try CSV

5. **Check Disk Space**:
   - Ensure you have enough free space for the download

6. **Try Different Browser**:
   - Some browsers handle downloads better than others

**Still stuck?** Screenshot the export options and contact support.

---

### Problem: Exported data is incomplete
**Symptoms**: CSV has fewer rows than expected.

**Solutions**:
1. **Check Export Limit**:
   - Free accounts: 1,000 rows max
   - Pro accounts: 10,000 rows max
   - Enterprise: Unlimited
   - **Fix**: Narrow time window or upgrade account

2. **Check Filters**:
   - Did you accidentally filter the data before exporting?
   - **Fix**: Clear filters, export again

3. **Check Time Window**:
   - Make sure you selected the right date range

**Still stuck?** Note expected row count vs. actual, contact support.

---

## 🔗 Integration Issues

### Problem: Shopify integration not working
**Symptoms**: "Not connected" or "Connection error" in Settings → Integrations.

**Solutions**:
1. **Reinstall App in Shopify**:
   - Go to Shopify admin → Apps
   - Uninstall HotDash
   - Reinstall from Shopify App Store
   - Grant all requested permissions

2. **Check API Credentials**:
   - Settings → Integrations → Shopify → Edit
   - Verify Store URL is correct (e.g., "my-store.myshopify.com")
   - Re-enter API token if needed

3. **Verify Permissions**:
   - HotDash needs: Orders (read), Products (read), Inventory (read), Fulfillments (read)
   - Shopify admin → Settings → Apps and sales channels → HotDash → Check permissions

4. **Check Shopify Plan**:
   - Basic Shopify or higher required
   - Shopify Lite doesn't support all APIs we need

**Still stuck?** Contact support with your Shopify store URL.

---

### Problem: Chatwoot integration not working
**Symptoms**: CX Escalations tile shows "Unable to load" or "Not connected".

**Solutions**:
1. **Re-authenticate**:
   - Settings → Integrations → Chatwoot → Reconnect
   - Enter API token from Chatwoot (Profile → Access Token)

2. **Check API Token**:
   - In Chatwoot: Profile Settings → Access Token
   - Copy new token
   - Paste in HotDash Settings → Integrations → Chatwoot

3. **Verify Chatwoot Plan**:
   - Need Chatwoot Business plan or higher for API access
   - Free plan doesn't support integrations

4. **Check Permissions**:
   - API token needs: Conversations (read), Contacts (read)

**Still stuck?** Contact support with screenshot of Chatwoot integration page.

---

### Problem: Google Analytics integration not working
**Symptoms**: SEO Content tile shows "No data" or "Unable to connect".

**Solutions**:
1. **Verify GA4 Property ID**:
   - In Google Analytics: Admin → Property Settings → Property ID
   - Should be format: "12345678" (8 digits)
   - NOT "UA-12345678-1" (that's Universal Analytics, not GA4)

2. **Re-authenticate**:
   - Settings → Integrations → Google Analytics → Reconnect
   - Sign in with Google account that has GA4 access

3. **Check GA4 Permissions**:
   - Google Analytics: Admin → Property Access Management
   - Your account needs "Viewer" or higher permissions

4. **Verify GA4 Data Exists**:
   - Open GA4 dashboard
   - Check if data is flowing (Reports → Realtime)
   - If no data in GA4, HotDash can't show it either

5. **Wait 24-48 Hours**:
   - New GA4 properties take time to collect data
   - HotDash can't show data that doesn't exist yet

**Still stuck?** Contact support with GA4 Property ID (not the tracking ID).

---

## 📱 Mobile Issues

### Problem: Dashboard doesn't work on mobile
**Symptoms**: Layout broken, buttons don't work, or tiles don't load.

**Solutions**:
1. **Update Mobile Browser**:
   - iOS: Update Safari in Settings → General → Software Update
   - Android: Update Chrome from Play Store

2. **Try Different Browser**:
   - iOS: Try Chrome or Firefox (not just Safari)
   - Android: Try Firefox or Samsung Internet (not just Chrome)

3. **Clear Mobile Cache**:
   - iOS Safari: Settings → Safari → Clear History and Website Data
   - Android Chrome: Chrome → Settings → Privacy → Clear browsing data

4. **Check Mobile Data/WiFi**:
   - Weak connection causes issues
   - Try switching WiFi on/off

5. **Rotate to Landscape**:
   - Some tiles work better in landscape mode
   - Especially on smaller phones

6. **Use Desktop Mode** (last resort):
   - iOS Safari: Tap "AA" → "Request Desktop Website"
   - Android Chrome: Menu → "Desktop site"

**Note**: HotDash is mobile-responsive but optimized for desktop. Some features may be limited on mobile.

**Still stuck?** Note your device (iPhone 12, Samsung S21, etc.), OS version, and browser.

---

## 🆘 Emergency Procedures

### Critical Issue: Can't Access Dashboard at All
**Symptoms**: HotDash won't load, shows error page, or times out.

**Emergency Checklist**:
1. ✅ Check https://status.hotdash.com - Is there an outage?
2. ✅ Try different browser (Chrome, Firefox, Safari)
3. ✅ Try Incognito/Private mode
4. ✅ Try from different device (phone, tablet)
5. ✅ Try from different network (mobile data vs. WiFi)

**If still down**:
- Email support@hotdash.com with subject: "URGENT: Cannot access dashboard"
- Call support hotline: 1-800-HOT-DASH
- Check Slack #hotdash-status for updates (if available)

**Workaround while down**:
- Access Shopify directly for order data
- Access Chatwoot directly for support conversations
- Access Google Analytics directly for traffic data

---

### Critical Issue: Data is Wildly Incorrect
**Symptoms**: Revenue shows $0 when you know it's not, or numbers are 100x too high.

**Emergency Checklist**:
1. ✅ Check time window - Is it set correctly?
2. ✅ Check time zone - Does it match your store?
3. ✅ Hard refresh (Ctrl+Shift+R)
4. ✅ Compare to Shopify admin directly

**If still wrong**:
- Screenshot the tile + corresponding Shopify page
- Email support@hotdash.com with subject: "URGENT: Data accuracy issue"
- Note: Tile name, expected value, actual value
- Don't make business decisions based on suspicious data until confirmed

---

## 📞 Getting Help

### Before Contacting Support
1. ✅ Try the relevant troubleshooting steps above
2. ✅ Check https://status.hotdash.com for known issues
3. ✅ Try in Incognito mode
4. ✅ Try different browser

### When Contacting Support
**Include this information for faster resolution**:
- **What you were trying to do**: "Export sales data for last month"
- **What happened instead**: "Export button doesn't respond"
- **What you've tried**: "Cleared cache, tried different browser"
- **Screenshots**: Always helpful (especially for display issues)
- **Browser**: Name and version (Chrome 118, Firefox 119, etc.)
- **Operating System**: Windows 11, macOS Sonoma, etc.
- **Account email**: So we can look up your account

### Contact Methods
- **Email**: support@hotdash.com (response within 4 hours during business hours)
- **Slack**: #hotdash-help (for customers with Slack integration)
- **Phone**: 1-800-HOT-DASH (Mon-Fri 9 AM - 5 PM EST)
- **Live Chat**: Bottom-right corner of dashboard (during business hours)

### Response Times
- **Critical issues** (can't access dashboard): <1 hour
- **High priority** (data accuracy, integrations down): <4 hours
- **Medium priority** (feature not working, export issues): <24 hours
- **Low priority** (questions, minor bugs): <48 hours

---

## 🔍 Self-Service Resources

### Before asking for help, check:
- **Knowledge Base**: https://docs.hotdash.com
- **Video Tutorials**: https://hotdash.com/training
- **FAQ**: [See FAQ Guide](./FAQ.md)
- **Status Page**: https://status.hotdash.com
- **Community Forum**: https://community.hotdash.com (coming soon)

---

## ✅ Quick Wins

**90% of issues are solved by**:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Try Incognito mode
4. Update browser
5. Check integrations (Settings → Integrations)

**Try these first before complex troubleshooting!**

---

**Document Path**: `docs/enablement/TROUBLESHOOTING_GUIDE.md`  
**Version**: 1.0  
**Last Updated**: October 12, 2025  
**Status**: Ready for user support ✅

**Questions not answered here?** Email support@hotdash.com
