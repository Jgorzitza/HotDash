# CEO Training Environment Checklist

**Purpose:** Ensure demo environment is ready before training session  
**Owner:** Enablement Team + Engineer  
**Timeline:** Complete 24 hours before training  
**Created:** 2025-10-13

---

## Pre-Training Verification (24 Hours Before)

### 1. Shopify App Installation ✅

**Verify:**
- [ ] App installed in CEO's Shopify store
- [ ] All 11 required scopes granted:
  - read_orders
  - read_products
  - read_inventory
  - read_locations
  - read_customers
  - read_assigned_fulfillment_orders
  - read_merchant_managed_fulfillment_orders
  - write_products
  - [Additional scopes if needed]
- [ ] OAuth permissions confirmed
- [ ] No installation errors

**How to Verify:**
```bash
# Check app status
cd ~/HotDash/hot-dash
tail -50 feedback/engineer.md | grep -i "scope\|install"

# Or ask CEO to verify in Shopify Admin:
# Apps → HotDash → Click to open
```

**If Issues:**
- Contact Engineer immediately
- CEO may need to uninstall/reinstall
- Verify scope configuration in `shopify.app.toml`

---

### 2. Dashboard Loading ✅

**Verify:**
- [ ] Dashboard loads without errors
- [ ] No 404/500 errors
- [ ] Page renders in <3 seconds
- [ ] No JavaScript console errors

**How to Verify:**
```
1. Log into CEO's Shopify Admin
2. Navigate to Apps → HotDash
3. Dashboard should load cleanly
4. Open browser console (F12) - check for errors
```

**If Issues:**
- Check deployment status (contact Deployment agent)
- Verify Fly.io app is running
- Check browser compatibility (Chrome/Firefox recommended)

---

### 3. All 5 Tiles Showing Data ✅

**Verify Each Tile:**

**Tile 1: Sales Pulse**
- [ ] Revenue number displaying
- [ ] Top SKUs list populated
- [ ] Fulfillment issues section shows data (or "All clear")
- [ ] No "No data available" errors

**Tile 2: CX Escalations**
- [ ] Escalation count displaying (0 or actual count)
- [ ] If >0: Escalation cards showing
- [ ] If 0: "All clear" message showing
- [ ] No Chatwoot connection errors

**Tile 3: Fulfillment Health**
- [ ] Delayed orders count displaying (0 or actual count)
- [ ] If >0: Order details showing
- [ ] If 0: "All clear" message
- [ ] No Shopify API errors

**Tile 4: Inventory Heatmap**
- [ ] Product list displaying
- [ ] Stock levels showing
- [ ] Days of cover calculated
- [ ] No inventory API errors

**Tile 5: SEO Content**
- [ ] Traffic trends displaying
- [ ] Landing pages list populated
- [ ] Week-over-week change showing
- [ ] No Google Analytics errors

**If Any Tile Shows "No Data":**
1. Check API connection (contact Integrations agent)
2. Verify data sync has run (wait 15 minutes, refresh)
3. Check for API rate limiting
4. Verify required scopes are granted

---

### 4. Demo Data Scenarios ✅

**Ensure We Have Examples for Training:**

**Scenario A: Customer Escalation**
- [ ] At least 1 real or demo CX escalation available
- [ ] Can demonstrate "Review" workflow
- [ ] Chatwoot conversation accessible

**Scenario B: Fulfillment Delay**
- [ ] At least 1 delayed order (real or demo)
- [ ] Can demonstrate investigating order details
- [ ] Shopify order accessible

**Scenario C: Low Inventory**
- [ ] At least 1 product with <7 days cover (real or demo)
- [ ] Can demonstrate cross-referencing with Sales Pulse
- [ ] Product details accessible

**If No Real Data Available:**
- Contact Engineer to create demo data
- Or use screenshots from staging environment
- Or walk through "what you would see" scenarios

---

### 5. Navigation & Interaction ✅

**Test Key Actions:**

**Dashboard Navigation:**
- [ ] Can click into each tile for details
- [ ] Detail view loads correctly
- [ ] Can navigate back to dashboard
- [ ] Breadcrumb navigation works

**Refresh Functionality:**
- [ ] Manual refresh button works
- [ ] Data updates after refresh
- [ ] No errors during refresh

**Filtering (if available):**
- [ ] Can filter data within tiles
- [ ] Filters apply correctly
- [ ] Can clear filters

**Links to Shopify:**
- [ ] "View in Shopify" links work
- [ ] Opens correct Shopify page
- [ ] Data matches between systems

---

### 6. Print Materials Ready ✅

**Quick Start Guide:**
- [ ] PDF generated from `docs/enablement/approval_queue_quick_start.md` (or equivalent)
- [ ] Printed on quality paper (2-sided recommended)
- [ ] 1 copy for CEO
- [ ] Hole-punched or in binder (optional)

**Quick Reference Card:**
- [ ] PDF generated from `docs/enablement/quick_reference_cards.md`
- [ ] Printed on cardstock (4×6" recommended)
- [ ] Laminated (optional but recommended)
- [ ] 1 copy for CEO

**How to Generate PDFs:**
```bash
# Option 1: Markdown to PDF (using pandoc)
cd ~/HotDash/hot-dash/docs/enablement
pandoc approval_queue_quick_start.md -o quick_start_guide.pdf

# Option 2: Print to PDF from browser
# Open .md file in browser with markdown renderer
# Print → Save as PDF

# Option 3: Use online converter
# Upload .md file to markdown-to-pdf.com
```

---

### 7. Technical Setup ✅

**Facilitator Setup:**

**Screen Sharing (if remote):**
- [ ] Zoom/Teams meeting link ready
- [ ] Screen sharing tested
- [ ] Audio/video tested
- [ ] Recording enabled (optional)

**In-Person Setup:**
- [ ] Projector or large monitor ready
- [ ] HDMI/connection cable tested
- [ ] CEO can see screen clearly
- [ ] Backup laptop available (if needed)

**CEO Setup:**
- [ ] CEO's laptop ready
- [ ] CEO logged into Shopify Admin
- [ ] CEO can access HotDash app
- [ ] CEO's browser up-to-date

---

### 8. Contact Information ✅

**Have Ready:**

**Technical Support:**
- [ ] Engineer contact (Slack/phone)
- [ ] Deployment contact (Slack/phone)
- [ ] Integrations contact (if API issues)

**Emergency Contacts:**
- [ ] Manager (for escalations)
- [ ] Compliance (if security questions)

**Escalation Paths:**
- [ ] Warehouse manager (for fulfillment scenarios)
- [ ] Supplier contacts (for inventory scenarios)
- [ ] Support lead (for CX scenarios)

---

## Day-Of Checklist (1 Hour Before Training)

### Final Verification

**30 Minutes Before:**
- [ ] Dashboard still loading correctly
- [ ] All tiles still showing data
- [ ] No new errors or issues
- [ ] Print materials in hand
- [ ] Laptop/projector tested

**15 Minutes Before:**
- [ ] CEO confirmed attendance
- [ ] Meeting room/space ready
- [ ] Water/coffee available (optional)
- [ ] Notepad/pens for CEO
- [ ] Backup plan if tech fails

**5 Minutes Before:**
- [ ] Final dashboard check
- [ ] CEO arrived/logged in
- [ ] Facilitator ready
- [ ] Start on time!

---

## Backup Plans

### If Dashboard is Down

**Plan A:**
- Use staging environment (if available)
- Walk through with screenshots
- Schedule makeup session when fixed

**Plan B:**
- Conduct conceptual training without demo
- Show video walkthrough (if available)
- Schedule hands-on session later

### If CEO Can't Access

**Plan A:**
- Troubleshoot login/permissions immediately
- Reinstall app if necessary
- Reschedule if can't fix in 10 minutes

**Plan B:**
- Show on facilitator's screen
- CEO watches, doesn't practice
- Schedule follow-up for hands-on

### If Specific Tile Fails

**Plan A:**
- Skip that tile for now
- Focus on working tiles
- Cover failed tile in follow-up

**Plan B:**
- Explain conceptually
- Use screenshots or diagrams
- Schedule demo when fixed

---

## Post-Training Verification

**Immediately After Training:**
- [ ] CEO can log in independently
- [ ] CEO completed at least 1 practice scan
- [ ] CEO knows who to contact for issues
- [ ] CEO has print materials
- [ ] Follow-up session scheduled (Day 5)

**Within 24 Hours:**
- [ ] Send session recording (if recorded)
- [ ] Email Quick Start Guide PDF
- [ ] Email Quick Reference Card PDF
- [ ] Slack check-in: "How did morning check go?"

**Day 5:**
- [ ] 15-minute check-in call
- [ ] Address any questions/issues
- [ ] Collect feedback
- [ ] Plan any additional training needs

---

## Troubleshooting Common Issues

### Issue: "Tiles show 'Loading' forever"

**Causes:**
- API connection timeout
- Data sync not complete
- Browser/network issue

**Fixes:**
1. Wait 30 seconds, try manual refresh
2. Check browser console for API errors
3. Verify network connection
4. Contact Integrations agent if persists

---

### Issue: "One tile shows 'No data available'"

**Causes:**
- Specific API scope missing
- That service hasn't synced yet
- API rate limiting

**Fixes:**
1. Check if other tiles work (isolate issue)
2. Verify required scopes for that tile
3. Wait 15 minutes for sync
4. Contact Engineer if still broken

---

### Issue: "Can't click into tile details"

**Causes:**
- JavaScript error
- Route not configured
- Permission issue

**Fixes:**
1. Refresh page
2. Try different browser
3. Check browser console for errors
4. Contact Engineer for fix

---

### Issue: "Data doesn't match Shopify"

**Causes:**
- Cache lag (15-minute refresh)
- Timezone difference
- Sync delay

**Fixes:**
1. Check "Last Updated" timestamp
2. Try manual refresh
3. Compare specific data points
4. If >30 min lag, contact Engineer

---

## Verification Commands

**Check App Status:**
```bash
cd ~/HotDash/hot-dash
curl -s https://hotdash-app.fly.dev/health
# Should return: {"status":"healthy"}
```

**Check Recent Deployments:**
```bash
tail -50 feedback/deployment.md | grep -i "deploy\|health"
```

**Check Recent Engineer Work:**
```bash
tail -100 feedback/engineer.md | grep -i "tile\|dashboard\|scope"
```

**Check Integration Status:**
```bash
tail -50 feedback/integrations.md | grep -i "api\|shopify\|error"
```

---

## Sign-Off

**Before Training Can Proceed:**

- [ ] **Enablement Lead**: All materials ready _______________
- [ ] **Engineer**: App deployed and working _______________
- [ ] **Integrations**: All APIs connected _______________
- [ ] **Deployment**: No active incidents _______________
- [ ] **Manager**: Training approved to proceed _______________

**If Any Checkbox is Unchecked:**
→ Resolve issue before training OR reschedule

---

**Document Created:** 2025-10-13  
**Purpose:** Pre-training environment verification  
**Timeline:** Complete 24 hours before CEO training  
**Evidence Path:** docs/enablement/ceo_training_checklist.md

