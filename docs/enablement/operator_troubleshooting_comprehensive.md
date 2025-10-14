# Operator Troubleshooting Guide - Comprehensive

**Purpose:** Complete troubleshooting resource for all HotDash operators  
**Scope:** Common issues, resolution steps, escalation procedures  
**Created:** 2025-10-13

---

## How to Use This Guide

**When You Have a Problem:**
1. Find your issue category below
2. Try the "Quick Fix" first (1-2 minutes)
3. If that doesn't work, try "Advanced Fix" (5-10 minutes)
4. If still broken, follow "Escalation Path"
5. Document what you tried in your feedback

**Response Time Targets:**
- Resolve yourself: <10 minutes
- Escalate to mentor: <30 minutes
- Escalate to engineer: <1 hour

---

## Category 1: Dashboard Access Issues

### Issue 1.1: Can't Load HotDash Dashboard

**Symptoms:**
- Dashboard won't load at all
- Stuck on loading screen
- White/blank page
- Error message: "Unable to connect"

**Quick Fix (2 minutes):**
```
1. Refresh browser (Cmd/Ctrl + R)
2. Try incognito/private window
3. Clear browser cache:
   - Chrome: Cmd/Ctrl + Shift + Delete
   - Select "Cached images and files"
   - Click "Clear data"
4. Restart browser completely
```

**Advanced Fix (5 minutes):**
```
1. Check internet connection
   - Open google.com - does it load?
   - If no: Fix internet first

2. Try different browser
   - Chrome → Firefox or vice versa
   - If works: Browser-specific issue

3. Check Shopify Admin access
   - Can you log into Shopify Admin?
   - If no: Shopify account issue
   - If yes: HotDash app issue
```

**Escalation Path:**
- Still broken after 10 min → Slack #incidents
- Include: Browser version, error messages, screenshots
- Tag: @engineer

---

### Issue 1.2: Dashboard Loads But Shows Blank Tiles

**Symptoms:**
- Dashboard interface visible
- All tiles show "No data" or blank
- No error messages

**Quick Fix (2 minutes):**
```
1. Wait 30 seconds (initial data sync)
2. Click manual refresh button
3. Check "Last Updated" timestamp
   - If >1 hour old: Data sync issue
```

**Advanced Fix (5 minutes):**
```
1. Check Shopify app permissions
   - Shopify Admin → Apps → HotDash
   - Click "Review permissions"
   - Ensure all 11 scopes granted

2. Verify in other browser/device
   - If works elsewhere: Local issue
   - If broken everywhere: System issue

3. Check deployment status
   - Visit: https://hotdash-app.fly.dev/health
   - Should return: {"status":"healthy"}
```

**Escalation Path:**
- If only YOUR account affected → Slack @support-manager
- If everyone affected → Slack #incidents @deployment
- Include: Which tiles are blank, browser info

---

### Issue 1.3: Slow Dashboard Performance

**Symptoms:**
- Dashboard takes >10 seconds to load
- Tiles load slowly one by one
- Clicking tiles is laggy/delayed

**Quick Fix (2 minutes):**
```
1. Close unnecessary browser tabs (free up memory)
2. Disable browser extensions temporarily
3. Hard refresh: Cmd/Ctrl + Shift + R
```

**Advanced Fix (5 minutes):**
```
1. Check system resources
   - Mac: Activity Monitor
   - Windows: Task Manager
   - Is CPU/memory maxed out?

2. Clear browser data completely
   - History, cache, cookies
   - Restart browser

3. Test on different device
   - If fast elsewhere: Your device issue
   - If slow everywhere: System issue
```

**Escalation Path:**
- Persistent slow (>5 min) → Slack #incidents
- Include: Speed test results (fast.com), device specs
- Tag: @reliability

---

## Category 2: Specific Tile Issues

### Issue 2.1: Sales Pulse Tile Shows "No Data"

**Symptoms:**
- Other tiles work fine
- Sales Pulse shows "No data available"
- Or shows $0 revenue (clearly wrong)

**Quick Fix (1 minute):**
```
1. Check Shopify Admin
   - Are there actual orders?
   - If no orders: "No data" is correct

2. Verify you're looking at correct date range
   - "Today" before noon shows low numbers
   - Compare to "Yesterday"
```

**Advanced Fix (3 minutes):**
```
1. Manual refresh Sales Pulse tile specifically
2. Check Shopify API scope
   - Need: read_orders
   - Shopify Admin → Apps → HotDash → Permissions

3. Compare to Shopify Admin numbers
   - Should match within 5-10 minutes
```

**Escalation Path:**
- Data doesn't match Shopify → Slack @integrations
- Include: Expected revenue, actual shown, screenshot

---

### Issue 2.2: CX Escalations Not Showing Tickets

**Symptoms:**
- Know there are escalated tickets (see them in Chatwoot)
- CX Escalations tile shows "0" or empty

**Quick Fix (2 minutes):**
```
1. Check Chatwoot connection
   - Open Chatwoot in separate tab
   - Can you see conversations?
   - If Chatwoot down: Wait for it to recover

2. Verify SLA breach threshold
   - Tile shows only BREACHED SLAs
   - Tickets within SLA won't show
```

**Advanced Fix (5 minutes):**
```
1. Check integration status
   - Dashboard → Settings → Integrations
   - Chatwoot: Connected? Last sync?

2. Test with known escalation
   - Find ticket you KNOW breached SLA
   - Should appear in tile
   - If not: Integration issue

3. Check filters (if applicable)
   - Any filters hiding tickets?
```

**Escalation Path:**
- Chatwoot connected but no data → Slack @integrations
- Include: Ticket IDs that should show, screenshot

---

### Issue 2.3: Inventory Heatmap Shows Wrong Stock Levels

**Symptoms:**
- Inventory numbers don't match Shopify
- Shows stock for items you know are out
- Days of cover calculation seems wrong

**Quick Fix (2 minutes):**
```
1. Check "Last Updated" timestamp
   - Inventory syncs every 15 minutes
   - Up to 15-min lag is normal

2. Manual refresh tile
3. Compare specific SKU in Shopify
   - Exact numbers should match after sync
```

**Advanced Fix (5 minutes):**
```
1. Verify Shopify inventory API scope
   - Need: read_inventory, read_locations
   - Check permissions

2. Check if multi-location
   - HotDash shows total across all locations
   - Shopify might show per-location

3. Days of cover calculation:
   - Current stock ÷ avg daily sales
   - Check if sales data is accurate
```

**Escalation Path:**
- Persistent mismatch >30 min → Slack @integrations
- Include: SKU, expected stock, shown stock, screenshot

---

## Category 3: Action/Workflow Issues

### Issue 3.1: Can't Click Into Tile Details

**Symptoms:**
- Click tile, nothing happens
- Or error message appears
- Details view won't load

**Quick Fix (1 minute):**
```
1. Refresh page
2. Try right-click → "Open in new tab"
3. Check browser console for errors (F12)
```

**Advanced Fix (3 minutes):**
```
1. Disable browser extensions
   - Ad blockers sometimes block interactions

2. Try different browser

3. Check JavaScript enabled
   - Should be on by default
```

**Escalation Path:**
- Still can't access after 5 min → Slack @engineer
- Include: Which tile, browser, console errors

---

### Issue 3.2: Sent Response But Customer Didn't Receive

**Symptoms:**
- Clicked "Send" in Chatwoot
- No confirmation or error
- Customer says they didn't get response

**Quick Fix (2 minutes):**
```
1. Check Chatwoot conversation
   - Does your response show in thread?
   - If yes: Sent successfully
   - If no: Didn't send

2. Check customer email address
   - Correct? Typos?
   - Check spam folder (ask customer)
```

**Advanced Fix (5 minutes):**
```
1. Resend response
   - Don't assume it sent
   - Send again (mention "resending in case missed")

2. Check Chatwoot integration
   - Email delivery settings
   - SMTP configuration status

3. Try alternative contact method
   - If email failed, try Shopify messaging
   - Or phone call if urgent
```

**Escalation Path:**
- Pattern (multiple send failures) → Slack @integrations
- One-off (likely customer issue) → Try alternative contact

---

### Issue 3.3: Escalation Doesn't Appear After Submission

**Symptoms:**
- Clicked "Escalate" button
- No confirmation
- Manager says they didn't receive it

**Quick Fix (1 minute):**
```
1. Check your sent notifications
   - Slack DM to manager?
   - Email sent?

2. Verify manager contact info
   - Is it current?
```

**Advanced Fix (3 minutes):**
```
1. Manually escalate
   - Slack DM to manager directly
   - Include: Ticket ID, customer, issue, why escalating

2. Check escalation workflow
   - Dashboard → Escalations log
   - Does your escalation appear?

3. Document what happened
   - For engineering fix
```

**Escalation Path:**
- Escalation system not working → Slack @engineer
- Urgent customer issue → DM manager immediately (bypass system)

---

## Category 4: Data Accuracy Issues

### Issue 4.1: Revenue Numbers Don't Match Shopify

**Symptoms:**
- Dashboard shows different revenue than Shopify Admin
- Sometimes higher, sometimes lower
- Difference >5%

**Quick Fix (2 minutes):**
```
1. Check date range
   - Dashboard "Today" vs Shopify "Today"
   - Timezone differences?

2. Check "Last Updated" timestamp
   - May be 5-10 min lag

3. Define "revenue"
   - Dashboard: Processed orders
   - Shopify: Might include authorized but not captured
```

**Advanced Fix (5 minutes):**
```
1. Compare specific metrics
   - Order count: Should match exactly
   - Revenue: Within 1-2% (rounding, timing)

2. Check order status filter
   - Dashboard might exclude cancelled
   - Shopify includes all

3. Manual calculation
   - Count today's orders in Shopify
   - Calculate total
   - Compare
```

**Escalation Path:**
- Difference >5% for >30 min → Slack @integrations
- Include: Dashboard amount, Shopify amount, time range

---

### Issue 4.2: "Days of Cover" Seems Wrong

**Symptoms:**
- Inventory shows 100 units
- Days of cover says "2 days"
- You know it should be weeks

**Quick Fix (1 minute):**
```
1. Understand calculation:
   - Days of cover = Current stock ÷ Average daily sales
   - 100 units ÷ 50 sold/day = 2 days

2. Check sales velocity
   - Was there a recent spike in sales?
   - Dashboard uses recent average (7-14 days)
```

**Advanced Fix (3 minutes):**
```
1. Verify sales data
   - Check Sales Pulse for SKU
   - Is daily sales number accurate?

2. Check for promotions/spikes
   - Recent sale or promotion?
   - Temporarily high sales rate

3. Seasonal adjustment
   - Dashboard might not account for seasonality
   - Use judgment
```

**Escalation Path:**
- Clearly wrong calculation → Slack @data
- Include: SKU, stock, sales rate, expected days

---

## Category 5: Integration Issues

### Issue 5.1: Shopify Connection Lost

**Symptoms:**
- Error: "Shopify connection failed"
- Multiple tiles showing "No data"
- Recent Shopify changes (app reinstall, etc.)

**Quick Fix (2 minutes):**
```
1. Check Shopify app status
   - Shopify Admin → Apps → HotDash
   - Is it installed?
   - Is it enabled?

2. Check permissions
   - Review permissions
   - Ensure all granted
```

**Advanced Fix (5 minutes):**
```
1. Reinstall app (if needed)
   - Uninstall HotDash
   - Reinstall from App Store
   - Grant all permissions

2. Check OAuth token
   - May have expired
   - Reconnect integration

3. Verify API rate limits
   - Shopify has rate limits
   - May be temporarily throttled
```

**Escalation Path:**
- Can't reconnect → Slack @integrations immediately
- Include: Error messages, when it started

---

### Issue 5.2: Chatwoot Not Syncing

**Symptoms:**
- Recent tickets not appearing
- Tickets stuck in old status
- Responses sent but not showing in dashboard

**Quick Fix (1 minute):**
```
1. Manual refresh
2. Check Chatwoot directly
   - Is Chatwoot itself working?

3. Check "Last Synced" time
   - Should be <5 minutes
```

**Advanced Fix (3 minutes):**
```
1. Verify Chatwoot API connection
   - Dashboard → Settings → Integrations
   - Chatwoot: Status?

2. Check API credentials
   - Token valid?
   - Permissions correct?

3. Test with specific ticket
   - Create test escalation
   - Should appear in dashboard
```

**Escalation Path:**
- Sync broken >10 min → Slack @integrations
- Include: Last successful sync time, error messages

---

## Category 6: User Error Issues

### Issue 6.1: "I Don't See What I'm Looking For"

**Common Causes:**
```
1. Looking at wrong tile
   - Sales data in Sales Pulse
   - Customer issues in CX Escalations
   - Not inventory!

2. Filters applied
   - Check for active filters
   - Clear all, try again

3. Wrong date range
   - Check "Today" vs "Yesterday" vs custom

4. Data doesn't exist yet
   - New store: May have no data
   - Just launched: Give it 15-30 min
```

**Fix: Training Refresher**
- Review Quick Start Guide
- Ask mentor for clarification
- Practice scenarios again

---

### Issue 6.2: "I Made a Mistake, How Do I Undo?"

**Common Mistakes:**
```
1. Sent wrong response
   → Send correction immediately
   → "Sorry, correction: [right info]"
   → Document for learning

2. Escalated wrong ticket
   → Slack manager: "Please ignore escalation for [ticket]"
   → Handle it yourself

3. Marked wrong status
   → Fix in Chatwoot
   → Update dashboard if needed

4. Gave wrong info to customer
   → Immediate correction message
   → Apologize professionally
   → Document to prevent recurrence
```

**Prevention:**
- Double-check before sending
- Use templates for accuracy
- Ask mentor if unsure

---

## Category 7: Escalation Procedures

### When to Escalate to Mentor

✅ **Escalate for:**
- Process questions (unsure how to handle)
- Policy clarification (is this allowed?)
- Complex customer situations (need guidance)
- Learning opportunities (want to understand)

**How:**
- Slack DM or tap on shoulder
- Include: What you've tried, specific question
- Response time: <10 minutes usually

---

### When to Escalate to Manager

✅ **Escalate for:**
- High-value issues (>$100)
- Angry/abusive customers
- Out-of-policy requests
- Legal/regulatory threats
- Any uncertainty on big decisions

**How:**
- Use escalation button in dashboard
- OR Slack @manager with urgency level
- Include: Full context, customer info, your recommendation
- Response time: <15 min for urgent, <1 hour for normal

---

### When to Escalate to Engineer

✅ **Escalate for:**
- Dashboard bugs/errors
- Data accuracy issues (persistent)
- Integration failures
- Performance problems (persistent)

**How:**
- Slack #incidents
- Include: Exact steps to reproduce, screenshots, browser info, error messages
- Response time: <30 min for critical, <1 day for non-critical

---

## Emergency Procedures

### Critical System Down

**If HotDash completely unavailable:**
1. Don't panic - you can still work
2. Fallback: Use Shopify, Chatwoot, GA directly
3. Alert #incidents immediately
4. Continue serving customers (manual process)
5. Document what you're doing
6. Resume dashboard when back online

### Data Breach Suspicion

**If you suspect customer data exposed:**
1. STOP - don't touch anything
2. Screenshot what you see
3. Alert @compliance @security immediately
4. Do NOT discuss with team (avoid panic)
5. Follow instructions from compliance
6. Document everything

### Angry Customer Escalation

**If customer threatens legal action or violence:**
1. Stay calm, professional
2. Don't argue or make promises
3. Escalate to manager IMMEDIATELY
4. Document exact words used
5. Follow manager's instructions
6. Take break if needed (emotional toll)

---

## Self-Service Resources

**Before Escalating, Check:**

1. **Quick Start Guide**
   - `docs/enablement/approval_queue_quick_start.md`
   - Basic navigation and common tasks

2. **FAQ**
   - `docs/enablement/approval_queue_faq.md`
   - 50+ common questions answered

3. **Knowledge Base**
   - Search for your issue
   - May already have solution

4. **Slack Search**
   - Has this been asked before?
   - Search #support-questions

5. **Mentor/Buddy**
   - Quick questions
   - Learning opportunities

---

## Preventing Issues

### Daily Checklist to Avoid Problems

**Morning:**
- [ ] Dashboard loads correctly
- [ ] All tiles showing data
- [ ] Check "Last Updated" timestamps
- [ ] Verify your access (permissions)
- [ ] Review any overnight alerts

**Throughout Day:**
- [ ] Refresh periodically (don't rely on stale data)
- [ ] Cross-check important data with Shopify
- [ ] Document any weird behavior
- [ ] Ask questions early (don't struggle alone)

**End of Day:**
- [ ] Close all tickets properly
- [ ] Clear browser cache (fresh start tomorrow)
- [ ] Report any recurring issues
- [ ] Log lessons learned

---

## Troubleshooting Mindset

**Effective Troubleshooting:**
1. **Stay Calm** - Frustration clouds judgment
2. **Be Systematic** - Follow steps, don't skip
3. **Document** - What you tried, what happened
4. **Ask for Help** - After 2 attempts, escalate
5. **Learn** - Same issue twice? Time to understand root cause

**Questions to Ask:**
- What changed recently?
- Does it work on different device/browser?
- Is it just me or everyone?
- What does the error message actually say?
- Have I tried turning it off and on again? (Seriously works)

---

**Document Created:** 2025-10-13  
**Purpose:** Comprehensive troubleshooting guide for all operators  
**Coverage:** 20+ common issues with resolution paths  
**Evidence Path:** docs/enablement/operator_troubleshooting_comprehensive.md

