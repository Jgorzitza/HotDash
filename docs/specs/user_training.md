# User Training Materials - Hot Rod AN Control Center

**Document Type:** Training Materials  
**Owner:** Product Agent  
**Version:** 1.0  
**Date:** 2025-10-15  
**Audience:** CEO (Justin), Future Operators

---

## 1. Dashboard Overview Guide

### Getting Started

**What is the Hot Rod AN Control Center?**
A Shopify-embedded admin app that centralizes live metrics, inventory control, customer experience (CX), and growth levers in one place. Agents propose actions; you approve or correct; the system learns.

**How to Access:**
1. Log into Shopify Admin
2. Navigate to Apps → Hot Rod AN Control Center
3. Dashboard loads automatically

**Dashboard Layout:**
- 7 live tiles showing key metrics
- Navigation sidebar (Dashboard, Approvals, Settings)
- Approvals badge showing pending items

---

### Understanding Dashboard Tiles

**1. Revenue Tile (Sales Pulse)**
- **What it shows:** Current revenue with trend vs previous period
- **How to read:** Green arrow = up, red arrow = down, percentage shows change
- **Action:** Click "View Details" for full sales breakdown
- **Refresh:** Auto-updates every 30 seconds

**2. AOV Tile (Average Order Value)**
- **What it shows:** Average order value = Total Revenue / Number of Orders
- **How to read:** Red highlight if below $50 target
- **Action:** Click to see order distribution
- **Why it matters:** Higher AOV = more revenue per customer

**3. Returns Tile**
- **What it shows:** Return rate and pending returns count
- **How to read:** Red if >5% return rate (high)
- **Action:** Click to see which products have high returns
- **Why it matters:** High returns indicate product or shipping issues

**4. Stock Risk Tile (Inventory Alerts)**
- **What it shows:** Products in urgent_reorder, low_stock, out_of_stock
- **How to read:** Red = urgent (stockout imminent), yellow = low, gray = out
- **Action:** Click to see full inventory dashboard
- **Why it matters:** Avoid stockouts and lost sales

**5. SEO Anomalies Tile**
- **What it shows:** Traffic drops >20%, ranking changes, critical errors
- **How to read:** Number shows count of issues
- **Action:** Click to see which pages are affected
- **Why it matters:** SEO issues = lost organic traffic

**6. CX Queue Tile (Customer Experience)**
- **What it shows:** Pending customer conversations (Email, Chat, SMS)
- **How to read:** Red if any conversation >15 min old (SLA breach)
- **Action:** Click to open Chatwoot or CX dashboard
- **Why it matters:** Fast response = happy customers

**7. Approvals Queue Tile**
- **What it shows:** Pending AI agent actions awaiting your approval
- **How to read:** Badge shows count, red = high-risk items
- **Action:** Click to review and approve/reject
- **Why it matters:** You control all AI actions

---

## 2. Approvals Workflow Guide

### What are Approvals?

When AI agents (customer service, inventory, growth) want to take an action, they create an approval request. You review the evidence, projected impact, and risks, then approve or reject.

**Types of Approvals:**
- **CX (Customer Experience):** AI-drafted email/chat/SMS replies
- **Inventory:** Reorder point suggestions, purchase orders
- **Growth:** Social media posts, SEO changes, ad campaigns

---

### How to Review an Approval

**Step 1: Open Approvals Queue**
- Click "Approvals" in navigation OR
- Click Approvals Queue tile on dashboard

**Step 2: Review Approval Card**
Each approval shows:
- **Agent:** Which AI agent created it (ai-customer, inventory, growth)
- **Tool:** What action it wants to take (send_email, create_po, post_social)
- **Arguments:** Details of the action (message text, order quantities, post content)
- **Created:** When the request was made
- **Risk Level:** HIGH (red), MEDIUM (yellow), LOW (green)

**Step 3: Evaluate Evidence**
- **What changes?** Summary of the proposed action
- **Why now?** Reason for the suggestion
- **Impact forecast:** Expected outcome (e.g., "Customer will receive refund confirmation")
- **Risks:** What could go wrong
- **Rollback:** How to undo if needed

**Step 4: Make Decision**
- **Approve:** Action will be executed immediately
- **Reject:** Action will be cancelled, agent notified
- **Request Changes:** (Future) Send back with notes

---

### Approval Best Practices

**DO:**
- ✅ Read the full message/action before approving
- ✅ Check that facts are accurate (order numbers, product names, prices)
- ✅ Verify tone is appropriate for brand
- ✅ Approve quickly (<15 min for CX to meet SLA)
- ✅ Grade AI quality (tone, accuracy, policy) to help it learn

**DON'T:**
- ❌ Approve without reading (even if you trust the AI)
- ❌ Approve high-risk items without checking evidence
- ❌ Let CX approvals sit >15 min (SLA breach)
- ❌ Approve if you're unsure (reject and investigate)

---

### Grading AI Responses (CX Only)

After approving a customer reply, you'll grade it on 3 dimensions (1-5 scale):

**Tone (1-5):**
- 5 = Perfect tone, empathetic, professional
- 4 = Good tone, minor adjustments
- 3 = Acceptable, needs improvement
- 2 = Poor tone, significant issues
- 1 = Unacceptable, complete rewrite

**Accuracy (1-5):**
- 5 = Completely accurate, all facts correct
- 4 = Mostly accurate, minor corrections
- 3 = Acceptable, some errors
- 2 = Significant inaccuracies
- 1 = Mostly incorrect

**Policy (1-5):**
- 5 = Fully compliant with all policies
- 4 = Compliant, minor policy notes
- 3 = Acceptable, some policy concerns
- 2 = Policy violations present
- 1 = Major policy violations

**Why grade?** Your grades help the AI learn and improve over time.

---

## 3. Mobile Usage Guide

### Using on Phone/Tablet

**Dashboard:**
- Tiles stack vertically on mobile
- Swipe to scroll through all tiles
- Tap any tile to see details

**Approvals:**
- Approval cards are touch-friendly (44px min buttons)
- Swipe to scroll through approvals
- Tap to expand and review
- Tap "Approve" or "Reject" buttons

**Navigation:**
- Hamburger menu (☰) on mobile
- Tap to open navigation
- Tap outside to close

**Tips:**
- Use landscape mode for easier reading
- Pinch to zoom if text is small
- Refresh by pulling down on dashboard

---

## 4. Troubleshooting Guide

### Dashboard Not Loading

**Symptoms:** Blank screen, spinning loader, or error message

**Solutions:**
1. Refresh the page (Cmd+R or Ctrl+R)
2. Clear browser cache and reload
3. Check internet connection
4. Try different browser (Chrome recommended)
5. Contact support if issue persists

---

### Tile Shows "Error Loading Data"

**Symptoms:** Red error banner on a tile

**Solutions:**
1. Click "Retry" button on the tile
2. Refresh the entire dashboard
3. Check if Shopify Admin is accessible
4. Wait 1 minute and try again (may be temporary API issue)
5. Contact support if error persists >5 minutes

---

### Approvals Not Showing

**Symptoms:** Approvals Queue shows 0 but you expect pending items

**Solutions:**
1. Refresh the page
2. Check that auto-refresh is working (should update every 5 seconds)
3. Verify agent service is running (contact support)
4. Check if approvals were already processed

---

### Can't Approve/Reject

**Symptoms:** Approve/Reject buttons are disabled or grayed out

**Possible Causes:**
- **Dev mode:** Buttons disabled in development/staging (by design)
- **Already processed:** Approval was already approved/rejected
- **Validation failed:** Evidence or rollback missing (contact support)

**Solutions:**
1. Check if you're in production environment
2. Refresh the page
3. Contact support if buttons remain disabled in production

---

### Slow Performance

**Symptoms:** Dashboard takes >5 seconds to load

**Solutions:**
1. Check internet speed (run speed test)
2. Close other browser tabs
3. Clear browser cache
4. Disable browser extensions temporarily
5. Try incognito/private mode
6. Contact support if consistently slow (target: <3s load time)

---

## 5. Video Script (Optional)

### Dashboard Walkthrough (5 minutes)

**[0:00-0:30] Introduction**
"Welcome to the Hot Rod AN Control Center. This is your command center for running your Shopify store. Let me show you around."

**[0:30-2:00] Dashboard Tiles**
"You'll see 7 tiles showing live metrics:
- Revenue shows your sales with trends
- AOV shows average order value
- Returns shows return rate
- Stock Risk shows inventory alerts
- SEO shows traffic issues
- CX Queue shows pending customer messages
- Approvals shows AI actions waiting for your review

Each tile updates automatically and you can click for details."

**[2:00-3:30] Approvals Workflow**
"The Approvals Queue is where AI agents ask for permission. Let's review one:
- See the agent name, action, and risk level
- Read the evidence and projected impact
- Check the rollback plan
- Approve or reject
- Grade the quality to help AI learn

Aim to review CX approvals within 15 minutes."

**[3:30-4:30] Mobile Usage**
"On mobile, tiles stack vertically. Tap any tile to see details. Approvals work the same way - tap to review, tap to approve or reject."

**[4:30-5:00] Getting Help**
"If you have issues, check the troubleshooting guide or contact support. The dashboard is designed to be fast (<3s load) and accurate (100% data match). Enjoy!"

---

## 6. Quick Reference Card

### Dashboard Tiles
- **Revenue:** Sales with trend
- **AOV:** Average order value
- **Returns:** Return rate
- **Stock Risk:** Inventory alerts
- **SEO:** Traffic issues
- **CX Queue:** Pending messages
- **Approvals:** AI actions pending

### Approvals Workflow
1. Open Approvals Queue
2. Review evidence & impact
3. Approve or Reject
4. Grade quality (CX only)

### Performance Targets
- Dashboard load: <3 seconds
- Data accuracy: 100%
- CX approval SLA: <15 minutes

### Keyboard Shortcuts
- **Tab:** Navigate between elements
- **Enter:** Activate button/link
- **Escape:** Close drawer/modal
- **Cmd/Ctrl+R:** Refresh page

### Support
- Troubleshooting: See guide above
- Contact: support@hotrodan.com
- Target response: <1 hour

---

## 7. Training Checklist

### Pre-Training
- [ ] CEO has Shopify Admin access
- [ ] Dashboard deployed to production
- [ ] Test data populated
- [ ] Training materials printed/shared

### During Training (30 minutes)
- [ ] Dashboard overview (10 min)
- [ ] Approvals workflow demo (15 min)
- [ ] Mobile usage demo (5 min)
- [ ] Q&A (flexible)

### Post-Training
- [ ] CEO completes first approval
- [ ] CEO grades first AI response
- [ ] CEO uses dashboard on mobile
- [ ] Feedback collected (what's unclear?)

### 1-Week Follow-Up
- [ ] CEO using dashboard daily?
- [ ] Average approval time <15 min?
- [ ] Any usability issues?
- [ ] Additional training needed?

---

## Document Control

**Version History:**
- 1.0 (2025-10-15): Initial training materials by Product Agent

**Review Schedule:**
- CEO: Review for clarity and completeness
- QA: Validate against actual dashboard behavior
- Manager: Approve for use in training

**Related Documents:**
- `docs/specs/dashboard_launch_readiness.md` - Launch checklist
- `docs/specs/approvals_drawer_spec.md` - Approvals technical spec
- `docs/NORTH_STAR.md` - Product vision

