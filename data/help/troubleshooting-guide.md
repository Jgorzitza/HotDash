# HotDash Troubleshooting Guide

**Quick solutions to common issues**

---

## 🔍 Quick Diagnostics

### System Status Check
1. Navigate to **Settings → System Health**
2. Check all indicators:
   - ✅ Green = All systems operational
   - ⚠️ Yellow = Degraded performance
   - ❌ Red = System down or error

### Connection Test
```bash
# Test Shopify connection
curl -H "X-Shopify-Access-Token: YOUR_TOKEN" \
  https://YOUR_STORE.myshopify.com/admin/api/2024-01/shop.json

# Test Supabase connection
curl https://YOUR_PROJECT.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"
```

---

## 🚫 Common Issues & Solutions

### Dashboard Not Loading

**Symptoms:**
- Blank screen
- Infinite loading spinner
- "Failed to fetch" error

**Solutions:**

**1. Clear Browser Cache**
```
Chrome: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
Firefox: Ctrl+Shift+Delete
Safari: Cmd+Option+E
```

**2. Check Network Connection**
- Open browser DevTools (F12)
- Go to Network tab
- Refresh page
- Look for failed requests (red)
- Check error messages

**3. Verify Session**
- Log out completely
- Clear cookies
- Log back in
- Try incognito/private mode

**4. Check Server Status**
- Visit status.hotdash.com
- Check for ongoing incidents
- Subscribe to status updates

**Still not working?**
- Contact support with:
  - Browser and version
  - Screenshot of error
  - Network tab screenshot
  - Steps to reproduce

---

### Shopify Sync Issues

**Symptoms:**
- Data not updating
- "Last sync: X hours ago"
- Missing products/orders

**Solutions:**

**1. Manual Sync**
1. Navigate to **Settings → Integrations → Shopify**
2. Click **Sync Now**
3. Wait for completion (may take 1-5 minutes)
4. Check sync log for errors

**2. Verify Credentials**
1. Settings → Integrations → Shopify
2. Click **Test Connection**
3. If fails, re-authorize:
   - Click **Reconnect**
   - Authorize in Shopify
   - Verify permissions granted

**3. Check Webhooks**
1. In Shopify Admin: Settings → Notifications → Webhooks
2. Verify HotDash webhooks are present:
   - orders/create
   - orders/updated
   - products/create
   - products/update
   - inventory_levels/update
3. If missing, click **Re-register Webhooks** in HotDash

**4. Review Sync Logs**
1. Settings → Integrations → Shopify → Sync Logs
2. Look for errors:
   - **401 Unauthorized:** Re-authorize
   - **429 Rate Limited:** Wait 1 hour, reduce sync frequency
   - **500 Server Error:** Contact Shopify support

**5. Check API Limits**
- Shopify has rate limits (40 requests/second)
- If hitting limits, reduce sync frequency
- Settings → Integrations → Shopify → Sync Frequency → Every 30 minutes

---

### AI Agents Not Working

**Symptoms:**
- No AI suggestions
- "AI unavailable" message
- Suggestions seem random/incorrect

**Solutions:**

**1. Verify AI Agents Enabled**
1. Settings → AI Agents
2. Check master switch is ON
3. Check individual agents are enabled
4. Verify confidence threshold not too high (should be 0.7-0.8)

**2. Check OpenAI API Key**
1. Settings → Integrations → OpenAI
2. Click **Test Connection**
3. If fails:
   - Verify API key is correct
   - Check OpenAI account has credits
   - Verify API key has correct permissions

**3. Review AI Logs**
1. Settings → AI Agents → Logs
2. Look for errors:
   - **Invalid API key:** Update key
   - **Rate limit exceeded:** Upgrade OpenAI plan
   - **Model not available:** Check OpenAI status

**4. Check Data Availability**
- AI needs data to make suggestions
- Verify Shopify sync is working
- Ensure at least 30 days of historical data
- Check that relevant data exists (orders for inventory AI, messages for support AI)

**5. Adjust Confidence Threshold**
- If no suggestions: Lower threshold (0.6-0.7)
- If too many bad suggestions: Raise threshold (0.8-0.9)
- Settings → AI Agents → Global Settings → Confidence Threshold

---

### Customer Support Integration Issues

**Symptoms:**
- Messages not appearing
- Can't send replies
- Chatwoot disconnected

**Solutions:**

**1. Verify Chatwoot Connection**
1. Settings → Integrations → Chatwoot
2. Click **Test Connection**
3. If fails, re-enter:
   - API URL
   - API Key
   - Account ID

**2. Check Inbox Selection**
1. Settings → Integrations → Chatwoot
2. Verify correct inbox is selected
3. Try switching inbox and back

**3. Verify Chatwoot Permissions**
- API key must have "Administrator" role
- Check in Chatwoot: Settings → Integrations → API Access

**4. Check Message Filters**
- In HotDash, check filters aren't hiding messages
- Clear all filters
- Select "All" status

**5. Webhook Issues**
- In Chatwoot: Settings → Integrations → Webhooks
- Verify HotDash webhook is present
- URL should be: https://your-hotdash.com/api/webhooks/chatwoot
- If missing, re-register in HotDash

---

### Inventory Alerts Not Triggering

**Symptoms:**
- No low stock alerts
- Alerts for items that aren't low
- Missing reorder recommendations

**Solutions:**

**1. Verify Alert Settings**
1. Settings → Inventory → Alerts
2. Check thresholds:
   - Low stock threshold (default: ROP)
   - Out of stock threshold (default: 0)
   - Overstock threshold (default: 90 days WOS)
3. Ensure alerts are enabled

**2. Check ROP Calculations**
1. Navigate to Inventory → Product
2. Click product → Details
3. Verify ROP calculation:
   - Lead time is correct
   - Sales velocity is accurate
   - Safety stock is reasonable
4. Manually adjust if needed

**3. Review Inventory Sync**
- Ensure Shopify inventory sync is working
- Check last sync time
- Manually sync if needed

**4. Verify Notification Settings**
1. Settings → Notifications
2. Check "Inventory Alerts" is enabled
3. Verify delivery channels (email, in-app)
4. Check quiet hours aren't blocking

---

### Performance Issues

**Symptoms:**
- Slow page loads
- Timeouts
- Laggy interface

**Solutions:**

**1. Check Browser**
- Close unnecessary tabs
- Disable browser extensions
- Update browser to latest version
- Try different browser

**2. Clear Application Cache**
1. Settings → Performance
2. Click **Clear Cache**
3. Refresh page

**3. Check Network**
- Run speed test (speedtest.net)
- Verify stable connection
- Try wired connection instead of WiFi
- Disable VPN temporarily

**4. Optimize Dashboard**
- Remove unused widgets
- Reduce date ranges (use last 7 days instead of 90)
- Disable auto-refresh on heavy widgets
- Create separate dashboards for different purposes

**5. Database Performance**
- Admin only: Settings → Database → Optimize
- Runs vacuum and reindex
- Schedule during off-hours

---

### Login Issues

**Symptoms:**
- Can't log in
- "Invalid credentials" error
- Account locked

**Solutions:**

**1. Reset Password**
1. Click "Forgot Password" on login page
2. Enter email address
3. Check email for reset link
4. Create new password
5. Try logging in

**2. Check Email Address**
- Verify correct email (no typos)
- Try alternate email if you have multiple
- Contact admin to verify your account email

**3. Account Locked**
- After 5 failed attempts, account locks for 30 minutes
- Wait 30 minutes and try again
- Or contact admin to unlock immediately

**4. Browser Issues**
- Clear cookies
- Try incognito/private mode
- Try different browser
- Disable browser extensions

**5. 2FA Issues**
- If 2FA code not working, try:
  - Wait for new code (codes expire after 30 seconds)
  - Check device time is correct
  - Use backup codes (if you saved them)
  - Contact admin to disable 2FA temporarily

---

### Data Discrepancies

**Symptoms:**
- Numbers don't match Shopify
- Missing orders/products
- Incorrect inventory counts

**Solutions:**

**1. Check Sync Status**
1. Settings → Integrations → Shopify
2. Check last sync time
3. If > 1 hour ago, click **Sync Now**

**2. Verify Date Ranges**
- Ensure comparing same date ranges
- Check timezone settings (Settings → Profile → Timezone)
- HotDash uses UTC, Shopify uses store timezone

**3. Check Filters**
- Verify no filters are applied
- Clear all filters
- Select "All" for status/type

**4. Compare Specific Records**
- Find discrepancy in Shopify
- Search for same record in HotDash
- Check all fields match
- If missing, trigger manual sync

**5. Full Resync**
- Last resort: Full data resync
- Settings → Integrations → Shopify → Advanced
- Click **Full Resync** (may take 10-30 minutes)
- Verify data after completion

---

### Email Notifications Not Received

**Symptoms:**
- Not receiving alert emails
- Missing daily digests
- No notification emails

**Solutions:**

**1. Check Spam Folder**
- Look in spam/junk folder
- Mark as "Not Spam"
- Add noreply@hotdash.com to contacts

**2. Verify Email Address**
1. Settings → Profile
2. Check email address is correct
3. Update if needed
4. Verify email (check for verification email)

**3. Check Notification Settings**
1. Settings → Notifications
2. Verify email notifications are enabled
3. Check specific notification types are enabled
4. Verify email is selected as delivery channel

**4. Email Provider Issues**
- Some providers block automated emails
- Check provider's spam settings
- Whitelist hotdash.com domain
- Try alternate email address

**5. Test Email**
1. Settings → Notifications
2. Click **Send Test Email**
3. Check if received
4. If not, contact support

---

## 🔧 Advanced Troubleshooting

### Browser Console Errors

**How to check:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Screenshot errors
5. Send to support

**Common errors:**

**"Failed to fetch"**
- Network issue or server down
- Check internet connection
- Check server status

**"Unauthorized"**
- Session expired
- Log out and back in
- Clear cookies

**"CORS error"**
- Configuration issue
- Contact support

### Network Tab Analysis

**How to check:**
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for:
   - Red requests (failed)
   - Slow requests (> 5 seconds)
   - 4xx/5xx status codes

**Common issues:**

**404 Not Found**
- Resource doesn't exist
- Check URL is correct
- May need to clear cache

**500 Internal Server Error**
- Server-side issue
- Check server logs
- Contact support

**429 Too Many Requests**
- Rate limited
- Wait a few minutes
- Reduce request frequency

### Database Connection Issues

**Symptoms:**
- "Database connection failed"
- Timeouts
- Slow queries

**Solutions:**

**1. Check Connection Pool**
- Settings → Database → Connection Pool
- If at max, increase pool size
- Or reduce concurrent users

**2. Restart Application**
- Admin only: Settings → System → Restart
- Clears connection pool
- Reconnects to database

**3. Check Supabase Status**
- Visit status.supabase.com
- Check for incidents
- Verify project is active

---

## 📞 When to Contact Support

Contact support if:
- ✅ Issue persists after trying solutions above
- ✅ Data loss or corruption
- ✅ Security concerns
- ✅ Critical system down
- ✅ Need urgent assistance

**What to include:**
1. **Description:** What's happening vs. what should happen
2. **Steps to reproduce:** Exact steps that cause the issue
3. **Screenshots:** Error messages, console errors
4. **Environment:** Browser, OS, device
5. **Urgency:** Critical / High / Medium / Low

**Support Channels:**
- **Email:** support@hotdash.com (4-hour response)
- **Live Chat:** Click chat icon (immediate)
- **Phone:** For critical issues only

---

**Most issues can be resolved quickly with these steps. If you're stuck, we're here to help!** 🛠️

